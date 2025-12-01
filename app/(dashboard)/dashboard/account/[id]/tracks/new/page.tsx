import { redirect } from 'next/navigation';
import { createServerApiClient } from '@/lib/api/server-client';
import { API_ENDPOINTS, ROUTES } from '@/lib/constants';
import { UserTrackEditor } from '@/components/user/track-editor';

interface PageProps {
  params: Promise<{ id: string }>;
}

interface Work {
  id: string;
  title: string;
  iswc?: string | null;
}

interface Account {
  id: string;
  name: string;
}

interface AccountResponse {
  account: Account;
}

interface WorksResponse {
  works: Work[];
  total: number;
}

export default async function NewTrackPage({ params }: PageProps) {
  const { id: accountId } = await params;

  try {
    const apiClient = await createServerApiClient();

    // Fetch account and available works in parallel
    const [accountResponse, worksResponse] = await Promise.all([
      apiClient.get<AccountResponse>(API_ENDPOINTS.DASHBOARD_ACCOUNT(accountId)).catch(() => null),
      apiClient.get<WorksResponse>(`${API_ENDPOINTS.WORKS}?account_id=${accountId}&limit=100`)
        .catch(() => ({ works: [], total: 0 })),
    ]);

    if (!accountResponse?.account) {
      redirect(ROUTES.DASHBOARD);
    }

    const { account } = accountResponse;
    const { works = [] } = worksResponse || {};

    // Create empty track template
    const emptyTrack = {
      id: '',
      account_id: accountId,
      title: '',
      version: null,
      artist: null,
      isrc: '',
      label: null,
      p_line: null,
      duration: null,
      aliases: [],
      works: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return (
      <UserTrackEditor
        track={emptyTrack}
        accountId={accountId}
        accountName={account.name}
        availableWorks={works}
        isNew={true}
      />
    );
  } catch {
    redirect(ROUTES.DASHBOARD);
  }
}

