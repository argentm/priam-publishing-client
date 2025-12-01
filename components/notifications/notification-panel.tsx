'use client';

import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileText,
  Users,
  FileWarning,
  Megaphone,
  Clock,
  CheckCheck,
  Trash2,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { Notification, NotificationType } from '@/lib/types';

interface NotificationPanelProps {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  onLoadMore: () => Promise<void>;
  onMarkAsRead: (id: string) => Promise<void>;
  onMarkAllAsRead: () => Promise<void>;
  onArchive: (id: string) => Promise<void>;
  onClose: () => void;
}

// Icon mapping for notification types
const typeIcons: Record<NotificationType, React.ElementType> = {
  work_submitted: FileText,
  work_approved: CheckCircle2,
  work_rejected: XCircle,
  work_conflict_detected: AlertCircle,
  work_conflict_resolved: CheckCircle2,
  team_invite_accepted: Users,
  team_member_joined: Users,
  contract_expiring: FileWarning,
  admin_announcement: Megaphone,
};

// Color classes for notification types
const typeColors: Record<NotificationType, string> = {
  work_submitted: 'text-blue-500 bg-blue-50',
  work_approved: 'text-green-500 bg-green-50',
  work_rejected: 'text-orange-500 bg-orange-50',
  work_conflict_detected: 'text-red-500 bg-red-50',
  work_conflict_resolved: 'text-green-500 bg-green-50',
  team_invite_accepted: 'text-purple-500 bg-purple-50',
  team_member_joined: 'text-purple-500 bg-purple-50',
  contract_expiring: 'text-amber-500 bg-amber-50',
  admin_announcement: 'text-indigo-500 bg-indigo-50',
};

/**
 * Notification panel showing list of notifications.
 * Displays in the popover opened by NotificationBell.
 */
export function NotificationPanel({
  notifications,
  unreadCount,
  isLoading,
  error,
  hasMore,
  onLoadMore,
  onMarkAsRead,
  onMarkAllAsRead,
  onArchive,
  onClose,
}: NotificationPanelProps) {
  const router = useRouter();

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read
    if (!notification.read_at) {
      await onMarkAsRead(notification.id);
    }

    // Navigate to action URL if present
    if (notification.action_url) {
      onClose();
      router.push(notification.action_url);
    }
  };

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <h3 className="font-semibold text-sm">
          Notifications
          {unreadCount > 0 && (
            <span className="ml-2 text-muted-foreground font-normal">
              ({unreadCount} unread)
            </span>
          )}
        </h3>
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="text-xs h-7 px-2"
            onClick={onMarkAllAsRead}
          >
            <CheckCheck className="h-3.5 w-3.5 mr-1" />
            Mark all read
          </Button>
        )}
      </div>

      {/* Content */}
      <ScrollArea className="h-[400px]">
        {isLoading && notifications.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <AlertCircle className="h-8 w-8 text-destructive mb-2" />
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <Bell className="h-10 w-10 text-muted-foreground/50 mb-3" />
            <p className="text-sm font-medium text-muted-foreground">
              No notifications yet
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              We'll notify you when something happens
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onClick={() => handleNotificationClick(notification)}
                onArchive={() => onArchive(notification.id)}
              />
            ))}

            {/* Load More */}
            {hasMore && (
              <div className="p-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs"
                  onClick={onLoadMore}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                  ) : null}
                  Load more
                </Button>
              </div>
            )}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

// Import Bell here to avoid circular dependency
import { Bell } from 'lucide-react';

interface NotificationItemProps {
  notification: Notification;
  onClick: () => void;
  onArchive: () => void;
}

function NotificationItem({ notification, onClick, onArchive }: NotificationItemProps) {
  const Icon = typeIcons[notification.type] || Bell;
  const colorClass = typeColors[notification.type] || 'text-gray-500 bg-gray-50';
  const isUnread = !notification.read_at;

  const timeAgo = formatDistanceToNow(new Date(notification.created_at), {
    addSuffix: true,
  });

  return (
    <div
      className={cn(
        'relative group flex items-start gap-3 p-4 cursor-pointer hover:bg-muted/50 transition-colors',
        isUnread && 'bg-primary/5'
      )}
      onClick={onClick}
    >
      {/* Icon */}
      <div className={cn('p-2 rounded-full shrink-0', colorClass)}>
        <Icon className="h-4 w-4" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={cn('text-sm', isUnread && 'font-medium')}>
            {notification.title}
          </p>
          {/* Unread indicator */}
          {isUnread && (
            <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
          {notification.message}
        </p>
        <div className="flex items-center gap-2 mt-1.5">
          <Clock className="h-3 w-3 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">{timeAgo}</span>
        </div>
      </div>

      {/* Archive button (visible on hover) */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={(e) => {
          e.stopPropagation();
          onArchive();
        }}
      >
        <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
      </Button>
    </div>
  );
}
