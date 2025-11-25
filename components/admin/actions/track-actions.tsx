'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { API_ENDPOINTS, ROUTES } from '@/lib/constants';
import { createClient } from '@/lib/supabase/client';
import { ApiClient } from '@/lib/api/client';
import { Trash2, Edit } from 'lucide-react';
import Link from 'next/link';

interface TrackActionsProps {
  track: {
    id: string;
    title: string;
  };
}

export function TrackActions({ track }: TrackActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (loading) return;
    if (!confirm(`Are you sure you want to delete track "${track.title}"? This action cannot be undone.`)) {
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const client = new ApiClient(async () => session?.access_token || null);

      await client.delete(API_ENDPOINTS.ADMIN_TRACKS + `/${track.id}`);

      router.refresh();
    } catch (error) {
      console.error('Error deleting track:', error);
      alert('Failed to delete track');
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
        title="Edit track"
      >
        <Link href={`${ROUTES.ADMIN_TRACKS}/${track.id}`}>
          <Edit className="w-4 h-4" />
        </Link>
      </Button>
      <Button
        variant="destructive"
        size="sm"
        onClick={handleDelete}
        disabled={loading}
        title="Delete track"
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
}

