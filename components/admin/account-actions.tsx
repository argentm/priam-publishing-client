'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { API_ENDPOINTS, ROUTES } from '@/lib/constants';
import { createClient } from '@/lib/supabase/client';
import { Trash2, ExternalLink, Pencil } from 'lucide-react';
import type { Account } from '@/lib/types';

interface AccountActionsProps {
  account: Account;
  showViewButton?: boolean;
}

export function AccountActions({ account, showViewButton = true }: AccountActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (loading) return;
    
    setError(null);
    
    if (!confirm(`Are you sure you want to delete account "${account.name}"?\n\nThis action cannot be undone and will only succeed if the account has no content (works, tracks, composers, or contracts).`)) {
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const { ApiClient } = await import('@/lib/api/client');
      const client = new ApiClient(async () => session?.access_token || null);

      await client.delete(API_ENDPOINTS.ADMIN_ACCOUNTS + `/${account.id}`);

      // Redirect to accounts list on success
      router.push(ROUTES.ADMIN_ACCOUNTS);
      router.refresh();
    } catch (error: any) {
      console.error('Error deleting account:', error);
      const errorMessage = error?.message || 'Failed to delete account';
      setError(errorMessage);
      
      // Show error in alert for better visibility
      alert(`Failed to delete account:\n\n${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-end gap-2">
      {showViewButton && (
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(ROUTES.ADMIN_ACCOUNT(account.id))}
            title="View account details"
            className="text-muted-foreground hover:text-foreground"
          >
            <ExternalLink className="w-4 h-4 mr-1" />
            View
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(ROUTES.ADMIN_ACCOUNT(account.id))}
            title="Edit account"
          >
            <Pencil className="w-4 h-4 mr-1" />
            Edit
          </Button>
        </>
      )}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleDelete}
        disabled={loading}
        title="Delete account"
        className="btn-destructive-ghost"
      >
        <Trash2 className="w-4 h-4 mr-1" />
        {loading ? 'Deleting...' : 'Delete'}
      </Button>
    </div>
  );
}

