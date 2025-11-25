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
    );

    if (!response?.account) {
      redirect('/dashboard');
    }

    return (
      <div className="space-y-6">
        <WorkCreationWizard 
          accountId={id} 
          accountName={response.account.name}
        />
      </div>
    );
  } catch (error) {
    console.error('Failed to fetch account:', error);
    redirect('/dashboard');
  }
}

