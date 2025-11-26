import { redirect } from 'next/navigation';
import { createServerApiClient } from '@/lib/api/server-client';
import { API_ENDPOINTS, ROUTES } from '@/lib/constants';
import { UserTrackEditor } from '@/components/user/track-editor';

interface PageProps {
  params: Promise<{ id: string; trackId: string }>;
}

interface Track {
  id: string;
  account_id: string;
  title: string;
  version?: string | null;
  artist?: string | null;
  isrc: string;
  fuga_id?: string | null;
  label?: string | null;
  p_line?: string | null;
  duration?: number | null;
  aliases?: string[];
  works?: {
    work_id: string;
    work: {
      id: string;
      title: string;
      iswc?: string | null;
    } | null;
  }[];
  created_at: string;
  updated_at: string;
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

interface TrackResponse {
  track: Track;
}

interface AccountResponse {
  account: Account;
}

interface WorksResponse {
  works: Work[];
  total: number;
}

export default async function TrackDetailPage({ params }: PageProps) {
  const { id: accountId, trackId } = await params;

  try {
    const apiClient = await createServerApiClient();

    // Fetch track, account, and available works in parallel
    const [trackResponse, accountResponse, worksResponse] = await Promise.all([
      apiClient.get<TrackResponse>(`${API_ENDPOINTS.TRACKS}/${trackId}`).catch(err => {
        console.error('Error fetching track:', err);
        return null;
      }),
      apiClient.get<AccountResponse>(API_ENDPOINTS.DASHBOARD_ACCOUNT(accountId)).catch(err => {
        console.error('Error fetching account:', err);
        return null;
      }),
      apiClient.get<WorksResponse>(`${API_ENDPOINTS.WORKS}?account_id=${accountId}&limit=100`).catch(err => {
        console.error('Error fetching works:', err);
        return { works: [], total: 0 };
      }),
    ]);

    if (!trackResponse?.track) {
      console.error('Track not found');
      redirect(ROUTES.WORKSPACE_TRACKS(accountId));
    }

    if (!accountResponse?.account) {
      console.error('Account not found');
      redirect(ROUTES.DASHBOARD);
    }

    const { track } = trackResponse;
    const { account } = accountResponse;
    const { works = [] } = worksResponse || {};

    // Verify track belongs to this account
    if (track.account_id !== accountId) {
      console.error('Track does not belong to this account');
      redirect(ROUTES.WORKSPACE_TRACKS(accountId));
    }

    return (
      <UserTrackEditor
        track={track}
        accountId={accountId}
        accountName={account.name}
        availableWorks={works}
        isNew={false}
      />
    );
  } catch (error) {
    console.error('Failed to fetch track details:', error);
    redirect(ROUTES.WORKSPACE_TRACKS(accountId));
  }
}

