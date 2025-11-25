import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { UserLayout } from '@/components/layout/user-layout';
import { ROUTES, API_ENDPOINTS } from '@/lib/constants';
import { isAdmin } from '@/lib/utils/admin';
import { createServerApiClient } from '@/lib/api/server-client';
import type { User, Account, DashboardData } from '@/lib/types';

async function getUserWithAdminStatus(): Promise<User | null> {
  try {
    const client = await createServerApiClient();
    const response = await client.get<{ user: User; authenticated: boolean }>(API_ENDPOINTS.AUTH_SESSION || '/api/auth/session');
    return response.user;
  } catch {
    return null;
  }
}

async function getDashboardData(): Promise<DashboardData | null> {
  try {
    const client = await createServerApiClient();
    const response = await client.get<DashboardData>(API_ENDPOINTS.DASHBOARD);
    return response;
  } catch {
    return null;
  }
}

export default async function DashboardLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser) {
    redirect(ROUTES.LOGIN);
  }

  // Check if user is admin - redirect to admin panel
  const user = await getUserWithAdminStatus();
  if (user && isAdmin(user)) {
    redirect(ROUTES.ADMIN_DASHBOARD);
  }

  // Fetch dashboard data including user and accounts
  const dashboardData = await getDashboardData();

  if (!dashboardData) {
    // If we can't fetch data, still show layout with minimal info
    const fallbackUser: User = {
      id: authUser.id,
      email: authUser.email,
    };
    
    return (
      <UserLayout user={fallbackUser} accounts={[]} currentAccount={null}>
        {children}
      </UserLayout>
    );
  }

  const userInfo: User = dashboardData.user || {
    id: authUser.id,
    email: authUser.email,
  };

  // Get first account as default current account
  const currentAccount = dashboardData.accounts.length > 0 ? dashboardData.accounts[0] : null;

  return (
    <UserLayout 
      user={userInfo} 
      accounts={dashboardData.accounts} 
      currentAccount={currentAccount}
    >
      {children}
    </UserLayout>
  );
}
