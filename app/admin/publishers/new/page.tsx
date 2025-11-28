import { redirect } from 'next/navigation';
import { createServerApiClient } from '@/lib/api/server-client';
import { API_ENDPOINTS } from '@/lib/constants';
import { PublisherEditor } from '@/components/admin/editors/publisher-editor';

interface Account {
  id: string;
  name: string;
}

async function getAccounts(): Promise<Account[]> {
  const client = await createServerApiClient();
  try {
    return await client.get<Account[]>(API_ENDPOINTS.ADMIN_ACCOUNTS);
  } catch {
    return [];
  }
}

export default async function NewPublisherPage() {
  const accounts = await getAccounts();

  if (accounts.length === 0) {
    redirect('/admin/accounts');
  }

  const newPublisher = {
    id: 'new',
    account_id: accounts[0].id,
    name: '',
    cae: '',
    controlled: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    account: accounts[0],
  };

  return (
    <div className="container mx-auto py-6">
      <PublisherEditor publisher={newPublisher as any} isNew={true} accounts={accounts} />
    </div>
  );
}
