import { createServerApiClient } from '@/lib/api/server-client';
import { API_ENDPOINTS } from '@/lib/constants';
import { WorkCreationWizard } from '@/components/admin/work-creation-wizard';
import { notFound } from 'next/navigation';

interface Account {
  id: string;
  name: string;
  client_id?: string | null;
  created_at: string;
  updated_at: string;
}

async function getAccounts(): Promise<Account[]> {
  const client = await createServerApiClient();
  try {
    return await client.get<Account[]>(API_ENDPOINTS.ADMIN_ACCOUNTS);
  } catch {
    return [];
  }
}

export default async function NewWorkPage() {
  const accounts = await getAccounts();

  if (accounts.length === 0) {
    notFound();
  }

  return (
    <div className="container mx-auto py-6">
      <WorkCreationWizard accounts={accounts} />
    </div>
  );
}

