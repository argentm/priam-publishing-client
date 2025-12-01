import { createServerApiClient } from '@/lib/api/server-client';
import { API_ENDPOINTS } from '@/lib/constants';
import { notFound } from 'next/navigation';
import { AccountEditor } from '@/components/admin/editors/account-editor';
import type { AccountMember } from '@/lib/types';

interface AdminAccount {
  id: string;
  name: string;
  client_id?: string | null;
  spotify_artist_id?: string | null;
  spotify_artist_name?: string | null;
  spotify_artist_image_url?: string | null;
  spotify_linked_at?: string | null;
  social_instagram?: string | null;
  social_facebook?: string | null;
  social_twitter?: string | null;
  created_at: string;
  updated_at: string;
  works_count?: number;
  tracks_count?: number;
  composers_count?: number;
  members_count?: number;
}

interface AccountResponse {
  account: AdminAccount;
}

interface MembersResponse {
  members: AccountMember[];
}

async function getAccount(id: string): Promise<AdminAccount | null> {
  const client = await createServerApiClient();
  try {
    const response = await client.get<AccountResponse>(API_ENDPOINTS.ADMIN_ACCOUNT(id));
    return response.account;
  } catch {
    return null;
  }
}

async function getMembers(accountId: string): Promise<AccountMember[]> {
  const client = await createServerApiClient();
  try {
    const response = await client.get<MembersResponse>(API_ENDPOINTS.ADMIN_ACCOUNT_MEMBERS(accountId));
    return response.members || [];
  } catch {
    return [];
  }
}

export default async function AdminAccountDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Fetch account and members in parallel
  const [account, members] = await Promise.all([
    getAccount(id),
    getMembers(id),
  ]);

  if (!account) {
    notFound();
  }

  return <AccountEditor account={account} isNew={false} members={members} />;
}
