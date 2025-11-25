'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { API_ENDPOINTS } from '@/lib/constants';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@/lib/types';
import { Edit, Trash2, Shield, ShieldOff } from 'lucide-react';

interface UserActionsProps {
  user: User;
  currentUserId?: string;
}

export function UserActions({ user, currentUserId }: UserActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [action, setAction] = useState<string | null>(null);

  const handleToggleAdmin = async () => {
    if (loading) return;
    setLoading(true);
    setAction('toggle-admin');

    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const { ApiClient } = await import('@/lib/api/client');
      const client = new ApiClient(async () => session?.access_token || null);

      await client.put(API_ENDPOINTS.ADMIN_USERS + `/${user.id}`, {
        is_admin: !user.is_admin,
      });

      router.refresh();
    } catch (error) {
      console.error('Error toggling admin status:', error);
      alert('Failed to update admin status');
    } finally {
      setLoading(false);
      setAction(null);
    }
  };

  const handleDelete = async () => {
    if (loading) return;
    if (!confirm(`Are you sure you want to delete user ${user.email}? This action cannot be undone.`)) {
      return;
    }

    setLoading(true);
    setAction('delete');

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
      setAction(null);
    }
  };

  const isCurrentUser = user.id === currentUserId;
  const isAdmin = user.is_admin === true;

  return (
    <div className="flex items-center justify-end space-x-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleToggleAdmin}
        disabled={loading || isCurrentUser}
        title={isCurrentUser ? 'Cannot change your own admin status' : isAdmin ? 'Remove admin privileges' : 'Grant admin privileges'}
      >
        {isAdmin ? (
          <ShieldOff className="w-4 h-4" />
        ) : (
          <Shield className="w-4 h-4" />
        )}
      </Button>
      <Button
        variant="destructive"
        size="sm"
        onClick={handleDelete}
        disabled={loading || isCurrentUser}
        title={isCurrentUser ? 'Cannot delete your own account' : 'Delete user'}
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
}

