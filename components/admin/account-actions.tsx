'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { API_ENDPOINTS } from '@/lib/constants';
import { createClient } from '@/lib/supabase/client';
import { Trash2 } from 'lucide-react';
import type { Account } from '@/lib/types';

interface AccountActionsProps {
  account: Account;
}

export function AccountActions({ account }: AccountActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (loading) return;
    if (!confirm(`Are you sure you want to delete account "${account.name}"? This action cannot be undone.`)) {
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const { ApiClient } = await import('@/lib/api/client');
      const client = new ApiClient(async () => session?.access_token || null);

      await client.delete(API_ENDPOINTS.ADMIN_ACCOUNTS + `/${account.id}`);

      router.refresh();
    } catch (error) {
      console.error('Error deleting workspace:', error);
      alert('Failed to delete account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="destructive"
      size="sm"
      onClick={handleDelete}
      disabled={loading}
      title="Delete account"
    >
      <Trash2 className="w-4 h-4" />
    </Button>
  );
}

