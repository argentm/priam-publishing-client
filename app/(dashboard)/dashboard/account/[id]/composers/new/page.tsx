import { redirect } from 'next/navigation';
import { createServerApiClient } from '@/lib/api/server-client';
import { API_ENDPOINTS, ROUTES } from '@/lib/constants';
import { UserComposerEditor } from '@/components/user/composer-editor';

interface PageProps {
  params: Promise<{ id: string }>;
}

interface Account {
  id: string;
  name: string;
}

interface AccountResponse {
  account: Account;
}

export default async function NewComposerPage({ params }: PageProps) {
  const { id: accountId } = await params;

  let account: Account | null = null;

  try {
    const apiClient = await createServerApiClient();
    const response = await apiClient.get<AccountResponse>(API_ENDPOINTS.ACCOUNT(accountId));
    account = response.account;
  } catch {
    redirect(ROUTES.DASHBOARD);
  }

  if (!account) {
    redirect(ROUTES.DASHBOARD);
  }

  // Create empty composer template
  const newComposer = {
    id: '',
    account_id: accountId,
    name: '',
    first_name: null,
    middle_names: null,
    surname: null,
    cae: null,
    main_pro: null,
    main_pro_identifier: null,
    mechanical_pro: null,
    mechanical_pro_identifier: null,
    performance_pro: null,
    performance_pro_identifier: null,
    sync_pro: null,
    sync_pro_identifier: null,
    controlled: false,
    notes: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  return (
    <UserComposerEditor
      composer={newComposer}
      accountId={accountId}
      accountName={account.name}
      isNew
    />
  );
}

