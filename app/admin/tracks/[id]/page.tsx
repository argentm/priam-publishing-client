import { redirect } from 'next/navigation';
import { createServerApiClient } from '@/lib/api/server-client';
import { API_ENDPOINTS } from '@/lib/constants';
import { TrackEditor } from '@/components/admin/editors/track-editor';

interface Track {
  id: string;
  account_id: string;
  foreign_id?: string | null;
  title: string;
  version?: string | null;
  artist?: string | null;
  isrc: string;
  fuga_id?: string | null;
  label?: string | null;
  p_line?: string | null;
  payees_count?: number;
  aliases?: string[];
  duration?: number | null;
  default_release_id?: string | null;
  statutory_rate?: number | null;
  report_mechanicals?: boolean;
  release_specific_foreign_ids?: Record<string, unknown> | null;
  created_by?: string | null;
  last_modified_by?: string | null;
  created_at: string;
  updated_at: string;
  account?: {
    id: string;
    name: string;
  };
}

async function getTrack(id: string): Promise<Track | null> {
  const client = await createServerApiClient();
  try {
    const response = await client.get<{ track: Track }>(`${API_ENDPOINTS.ADMIN_TRACKS}/${id}`);
    return response.track;
  } catch {
    return null;
  }
}

export default async function TrackDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const track = await getTrack(params.id);

  if (!track) {
    redirect('/admin/tracks');
  }

  return (
    <div className="container mx-auto py-6">
      <TrackEditor track={track} />
    </div>
  );
}

