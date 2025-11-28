import { redirect } from 'next/navigation';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { createServerApiClient } from '@/lib/api/server-client';
import { API_ENDPOINTS } from '@/lib/constants';
import { AccountSettings } from './account-settings';
import type { AccountMember } from '@/lib/types';

interface PageProps {
  params: Promise<{ id: string }>;
}

interface Account {
  id: string;
  name: string;
  client_id?: string | null;
  spotify_artist_id?: string | null;
  spotify_artist_name?: string | null;
  created_at: string;
  updated_at: string;
}

interface AccountResponse {
  account: Account;
  user_role: string;
  members: AccountMember[];
}

export default async function SettingsPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createServerClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/login');
  }

  try {
    const apiClient = await createServerApiClient();
    const response = await apiClient.get<AccountResponse>(API_ENDPOINTS.DASHBOARD_ACCOUNT(id));

    if (!response?.account) {
      redirect('/dashboard');
    }

    const { account, user_role, members } = response;
    const canEdit = user_role === 'owner' || user_role === 'admin';

    return (
      <AccountSettings
        account={account}
        members={members}
        userRole={user_role}
        canEdit={canEdit}
        currentUserId={user.id}
      />
    );
  } catch (error) {
    console.error('Failed to fetch account settings:', error);
    redirect('/dashboard');
  }
}
