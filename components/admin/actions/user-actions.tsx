'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { API_ENDPOINTS } from '@/lib/constants';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@/lib/types';
import { Trash2, Ban, CheckCircle } from 'lucide-react';

interface UserActionsProps {
  user: User;
  currentUserId?: string;
}

export function UserActions({ user, currentUserId }: UserActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleToggleSuspend = async () => {
    if (loading) return;
    
    const action = user.suspended ? 'unsuspend' : 'suspend';
    if (!confirm(`Are you sure you want to ${action} user ${user.email}?`)) {
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const { ApiClient } = await import('@/lib/api/client');
      const client = new ApiClient(async () => session?.access_token || null);

      await client.put(API_ENDPOINTS.ADMIN_USERS + `/${user.id}`, {
        suspended: !user.suspended,
      });

      router.refresh();
    } catch (error) {
      console.error('Error toggling suspend status:', error);
      alert(`Failed to ${action} user`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (loading) return;
    if (!confirm(`Are you sure you want to delete user ${user.email}? This action cannot be undone.`)) {
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const { ApiClient } = await import('@/lib/api/client');
      const client = new ApiClient(async () => session?.access_token || null);

      await client.delete(API_ENDPOINTS.ADMIN_USERS + `/${user.id}`);

      router.refresh();
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user');
    } finally {
      setLoading(false);
    }
  };

  const isCurrentUser = user.id === currentUserId;
  const isAdmin = user.is_admin === true;
  const isSuspended = user.suspended === true;

  // Don't show suspend option for admins or current user
  if (isAdmin || isCurrentUser) {
    return null;
  }

  return (
    <div className="flex items-center justify-end space-x-2">
      <Button
        variant={isSuspended ? 'outline' : 'secondary'}
        size="sm"
        onClick={handleToggleSuspend}
        disabled={loading}
        title={isSuspended ? 'Unsuspend user' : 'Suspend user'}
      >
        {isSuspended ? (
          <>
            <CheckCircle className="w-4 h-4 mr-1" />
            Unsuspend
          </>
        ) : (
          <>
            <Ban className="w-4 h-4 mr-1" />
            Suspend
          </>
        )}
      </Button>
      <Button
        variant="destructive"
        size="sm"
        onClick={handleDelete}
        disabled={loading}
        title="Delete user"
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
}
