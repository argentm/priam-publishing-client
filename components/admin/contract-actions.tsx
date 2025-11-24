'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { API_ENDPOINTS } from '@/lib/constants';
import { createClient } from '@/lib/supabase/client';
import { ApiClient } from '@/lib/api/client';
import { Trash2 } from 'lucide-react';

interface ContractActionsProps {
  contract: {
    id: string;
    name: string;
  };
}

export function ContractActions({ contract }: ContractActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (loading) return;
    if (!confirm(`Are you sure you want to delete contract "${contract.name}"? This action cannot be undone.`)) {
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const client = new ApiClient(async () => session?.access_token || null);

      await client.delete(API_ENDPOINTS.ADMIN_CONTRACTS + `/${contract.id}`);

      router.refresh();
    } catch (error) {
      console.error('Error deleting contract:', error);
      alert('Failed to delete contract');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-end space-x-2">
      <Button
        variant="destructive"
        size="sm"
        onClick={handleDelete}
        disabled={loading}
        title="Delete contract"
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
}

