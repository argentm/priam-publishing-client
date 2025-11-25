import { redirect } from 'next/navigation';
import { createServerApiClient } from '@/lib/api/server-client';
import { API_ENDPOINTS } from '@/lib/constants';
import { TrackEditor } from '@/components/admin/editors/track-editor';

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

export default async function NewTrackPage() {
  const accounts = await getAccounts();

  if (accounts.length === 0) {
    redirect('/admin/accounts');
  }

  const newTrack = {
    id: 'new',
    account_id: accounts[0].id,
    title: '',
    isrc: '',
    report_mechanicals: false,
    payees_count: 0,
    aliases: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    account: accounts[0],
  };

  return (
    <div className="container mx-auto py-6">
      <TrackEditor track={newTrack as any} isNew={true} />
    </div>
  );
}

