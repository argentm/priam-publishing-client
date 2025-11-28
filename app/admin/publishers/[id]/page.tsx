import { redirect } from 'next/navigation';
import { createServerApiClient } from '@/lib/api/server-client';
import { API_ENDPOINTS } from '@/lib/constants';
import { PublisherEditor } from '@/components/admin/editors/publisher-editor';

interface SocietyIdentifier {
  id: string;
  society: string;
  identifier?: string | null;
  publisher_name?: string | null;
  mechanical_society?: string | null;
  performance_society?: string | null;
  sync_society?: string | null;
}

interface LinkedContract {
  id: string;
  contract_id: string;
  contract?: {
    id: string;
    name: string;
  };
}

interface Publisher {
  id: string;
  account_id: string;
  name: string;
  cae: string;
  cae_without_leading_zeros?: string | null;
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
  foreign_id?: string | null;
  society_identifiers?: SocietyIdentifier[];
  linked_contracts?: LinkedContract[];
  account?: {
    id: string;
    name: string;
  };
  created_at: string;
  updated_at: string;
}

async function getPublisher(id: string): Promise<Publisher | null> {
  const client = await createServerApiClient();
  try {
    const response = await client.get<{ publisher: Publisher }>(`${API_ENDPOINTS.ADMIN_PUBLISHERS}/${id}`);
    return response.publisher;
  } catch {
    return null;
  }
}

export default async function PublisherDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const publisher = await getPublisher(id);

  if (!publisher) {
    redirect('/admin/publishers');
  }

  return (
    <div className="container mx-auto py-6">
      <PublisherEditor publisher={publisher} />
    </div>
  );
}
