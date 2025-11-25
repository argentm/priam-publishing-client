'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { API_ENDPOINTS, ROUTES } from '@/lib/constants';
import { createClient } from '@/lib/supabase/client';
import { ApiClient } from '@/lib/api/client';
import { Trash2, Edit } from 'lucide-react';
import Link from 'next/link';

interface WorkActionsProps {
  work: {
    id: string;
    title: string;
  };
}

export function WorkActions({ work }: WorkActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (loading) return;
    if (!confirm(`Are you sure you want to delete work "${work.title}"? This action cannot be undone.`)) {
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const client = new ApiClient(async () => session?.access_token || null);

      await client.delete(API_ENDPOINTS.ADMIN_WORKS + `/${work.id}`);

      router.refresh();
    } catch (error) {
      console.error('Error deleting work:', error);
      alert('Failed to delete work');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-end space-x-2">
      <Button
        variant="outline"
        size="sm"
        asChild
        title="Edit work"
      >
        <Link href={`${ROUTES.ADMIN_WORKS}/${work.id}`}>
          <Edit className="w-4 h-4" />
        </Link>
      </Button>
      <Button
        variant="destructive"
        size="sm"
        onClick={handleDelete}
        disabled={loading}
        title="Delete work"
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
}

