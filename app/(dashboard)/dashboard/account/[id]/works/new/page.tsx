import { redirect } from 'next/navigation';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { createServerApiClient } from '@/lib/api/server-client';
import { API_ENDPOINTS } from '@/lib/constants';
import { WorkCreationWizard } from '@/components/user/work-creation-wizard';

interface PageProps {
  params: Promise<{ id: string }>;
}

interface Account {
  id: string;
  name: string;
}

interface DashboardAccountResponse {
  account: Account;
}

export default async function NewWorkPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createServerClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    redirect('/login');
  }

  // Fetch the account to verify access and get name
  try {
    const apiClient = await createServerApiClient();
    const response = await apiClient.get<DashboardAccountResponse>(
      `${API_ENDPOINTS.DASHBOARD_ACCOUNT(id)}`
    ).catch(err => {
      console.error(`Error fetching account details for ${id}:`, err);
      return null;
    });

    if (!response?.account) {
      console.error(`Account ${id} not found or access denied.`);
      redirect('/dashboard');
    }

    return (
      <div className="container max-w-5xl mx-auto">
        <WorkCreationWizard
          accountId={id}
          accountName={response.account.name}
        />
      </div>
    );
  } catch (error) {
    // This catch block handles redirect() which throws an error in Next.js
    // We need to re-throw it if it's a redirect, otherwise log and redirect
    if ((error as any)?.message === 'NEXT_REDIRECT') {
      throw error;
    }
    console.error('Unexpected error in NewWorkPage:', error);
    redirect('/dashboard');
  }
}

