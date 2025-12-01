import { redirect } from 'next/navigation';
import { createServerApiClient } from '@/lib/api/server-client';
import { API_ENDPOINTS, ROUTES } from '@/lib/constants';
import { UserComposerEditor } from '@/components/user/composer-editor';

interface PageProps {
  params: Promise<{ id: string; composerId: string }>;
}

interface Account {
  id: string;
  name: string;
}

interface AccountResponse {
  account: Account;
}

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
  created_at: string;
  updated_at: string;
}

interface ComposersResponse {
  composers: Composer[];
  total: number;
}

export default async function EditComposerPage({ params }: PageProps) {
  const { id: accountId, composerId } = await params;

  let account: Account | null = null;
  let composer: Composer | null = null;

  try {
    const apiClient = await createServerApiClient();
    
    // Fetch account and composer in parallel
    const [accountResponse, composersResponse] = await Promise.all([
      apiClient.get<AccountResponse>(API_ENDPOINTS.ACCOUNT(accountId)),
      apiClient.get<ComposersResponse>(API_ENDPOINTS.DASHBOARD_COMPOSERS(accountId)),
    ]);

    account = accountResponse.account;
    composer = composersResponse.composers.find((c) => c.id === composerId) || null;
  } catch {
    redirect(ROUTES.DASHBOARD);
  }

  if (!account) {
    redirect(ROUTES.DASHBOARD);
  }

  if (!composer) {
    redirect(ROUTES.WORKSPACE_COMPOSERS(accountId));
  }

  return (
    <UserComposerEditor
      composer={composer}
      accountId={accountId}
      accountName={account.name}
    />
  );
}

