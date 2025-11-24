import { redirect } from 'next/navigation';
import { createServerApiClient } from '@/lib/api/server-client';
import { API_ENDPOINTS } from '@/lib/constants';
import { ComposerEditor } from '@/components/admin/composer-editor';

interface Composer {
  id: string;
  account_id: string;
  name: string;
  first_name?: string | null;
  middle_names?: string | null;
  surname?: string | null;
  cae?: string | null;
  main_pro?: string | null;
  main_pro_identifier?: string | null;
  mechanical_pro?: string | null;
  mechanical_pro_identifier?: string | null;
  performance_pro?: string | null;
  performance_pro_identifier?: string | null;
  sync_pro?: string | null;
  sync_pro_identifier?: string | null;
  controlled?: boolean;
  notes?: string | null;
  account?: {
    id: string;
    name: string;
  };
  created_at: string;
  updated_at: string;
}

async function getComposer(id: string): Promise<Composer | null> {
  const client = await createServerApiClient();
  try {
    const response = await client.get<{ composer: Composer }>(`${API_ENDPOINTS.ADMIN_COMPOSERS}/${id}`);
    return response.composer;
  } catch {
    return null;
  }
}

export default async function ComposerDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const composer = await getComposer(params.id);

  if (!composer) {
    redirect('/admin/composers');
  }

  return (
    <div className="container mx-auto py-6">
      <ComposerEditor composer={composer} />
    </div>
  );
}

