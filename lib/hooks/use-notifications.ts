'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { ApiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/constants';
import { sanitizeApiError } from '@/lib/utils/api-errors';
import type {
  Notification,
  NotificationsResponse,
  UnreadCountResponse,
} from '@/lib/types';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  archiveNotification: (id: string) => Promise<void>;
  refetch: () => Promise<void>;
}

interface UseNotificationsOptions {
  accountId?: string;
  limit?: number;
}

/**
 * Hook for managing notifications with real-time updates via Supabase Realtime.
 *
 * Features:
 * - Fetches notifications from the API
 * - Subscribes to real-time INSERT events for new notifications
 * - Provides methods to mark as read, mark all as read, and archive
 * - Supports pagination via loadMore
 * - Automatically updates unread count
 */
export function useNotifications(options: UseNotificationsOptions = {}): UseNotificationsReturn {
  const { accountId, limit = 20 } = options;

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiClient, setApiClient] = useState<ApiClient | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const channelRef = useRef<RealtimeChannel | null>(null);
  const offsetRef = useRef(0);

  // Initialize API client and get user ID
  useEffect(() => {
    const initClient = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user?.id) {
        setUserId(session.user.id);
        setApiClient(new ApiClient(async () => session?.access_token || null));
      }
    };
    initClient();
  }, []);

  // Fetch notifications from API
  const fetchNotifications = useCallback(async (reset = true) => {
    if (!apiClient) return;

    if (reset) {
      setIsLoading(true);
      offsetRef.current = 0;
    }
    setError(null);

    try {
      const params = new URLSearchParams({
        limit: String(limit),
        offset: String(offsetRef.current),
      });
      if (accountId) {
        params.append('account_id', accountId);
      }

      const response = await apiClient.get<NotificationsResponse>(
        `${API_ENDPOINTS.NOTIFICATIONS}?${params.toString()}`
      );

      if (reset) {
        setNotifications(response.notifications);
      } else {
        setNotifications(prev => [...prev, ...response.notifications]);
      }
      setUnreadCount(response.unread_count);
      setTotal(response.total);
      offsetRef.current += response.notifications.length;
    } catch (err) {
      setError(sanitizeApiError(err, 'Failed to load notifications'));
    } finally {
      setIsLoading(false);
    }
  }, [apiClient, accountId, limit]);

  // Fetch unread count only (lightweight)
  const fetchUnreadCount = useCallback(async () => {
    if (!apiClient) return;

    try {
      const params = accountId ? `?account_id=${accountId}` : '';
      const response = await apiClient.get<UnreadCountResponse>(
        `${API_ENDPOINTS.NOTIFICATIONS_UNREAD_COUNT}${params}`
      );
      setUnreadCount(response.count);
    } catch (err) {
      // Silently fail for count updates
      console.error('[Notifications] Failed to fetch unread count:', err);
    }
  }, [apiClient, accountId]);

  // Initial fetch when API client is ready
  useEffect(() => {
    if (apiClient) {
      fetchNotifications(true);
    }
  }, [apiClient, fetchNotifications]);

  // Set up Supabase Realtime subscription
  useEffect(() => {
    if (!userId) return;

    const supabase = createClient();

    // Subscribe to new notifications for this user
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const newNotification = payload.new as Notification;

          // Only add if it matches the current account filter (or no filter)
          if (!accountId || newNotification.account_id === accountId) {
            setNotifications(prev => [newNotification, ...prev]);
            setUnreadCount(prev => prev + 1);
            setTotal(prev => prev + 1);
          }
        }
      )
      .subscribe();

    channelRef.current = channel;

    // Cleanup subscription on unmount
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [userId, accountId]);

  // Load more notifications (pagination)
  const loadMore = useCallback(async () => {
    if (isLoading || notifications.length >= total) return;
    await fetchNotifications(false);
  }, [isLoading, notifications.length, total, fetchNotifications]);

  // Mark a single notification as read
  const markAsRead = useCallback(async (id: string) => {
    if (!apiClient) return;

    try {
      await apiClient.put(API_ENDPOINTS.NOTIFICATION_MARK_READ(id));

      // Update local state
      setNotifications(prev =>
        prev.map(n =>
          n.id === id ? { ...n, read_at: new Date().toISOString() } : n
        )
      );

      // Update unread count
      const notification = notifications.find(n => n.id === id);
      if (notification && !notification.read_at) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('[Notifications] Failed to mark as read:', err);
      throw err;
    }
  }, [apiClient, notifications]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    if (!apiClient) return;

    try {
      const params = accountId ? `?account_id=${accountId}` : '';
      await apiClient.put(`${API_ENDPOINTS.NOTIFICATIONS_MARK_ALL_READ}${params}`);

      // Update local state
      setNotifications(prev =>
        prev.map(n => ({ ...n, read_at: n.read_at || new Date().toISOString() }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error('[Notifications] Failed to mark all as read:', err);
      throw err;
    }
  }, [apiClient, accountId]);

  // Archive a notification (soft delete)
  const archiveNotification = useCallback(async (id: string) => {
    if (!apiClient) return;

    try {
      await apiClient.delete(API_ENDPOINTS.NOTIFICATION_ARCHIVE(id));

      // Remove from local state
      const notification = notifications.find(n => n.id === id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      setTotal(prev => prev - 1);

      // Update unread count if it was unread
      if (notification && !notification.read_at) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('[Notifications] Failed to archive notification:', err);
      throw err;
    }
  }, [apiClient, notifications]);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    hasMore: notifications.length < total,
    loadMore,
    markAsRead,
    markAllAsRead,
    archiveNotification,
    refetch: () => fetchNotifications(true),
  };
}
