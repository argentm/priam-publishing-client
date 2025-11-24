import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { getDashboardData } from '@/lib/features/dashboard/queries';
import { ROUTES, API_ENDPOINTS } from '@/lib/constants';
import { isAdmin } from '@/lib/utils/admin';
import { createServerApiClient } from '@/lib/api/server-client';
import type { User } from '@/lib/types';

async function getUserWithAdminStatus(): Promise<User | null> {
  try {
    const client = await createServerApiClient();
    const response = await client.get<{ user: User; authenticated: boolean }>(API_ENDPOINTS.AUTH_SESSION || '/api/auth/session');
    return response.user;
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

  const dashboardData = await getDashboardData();

  return (
    <DashboardLayout user={dashboardData.user}>
      {children}
    </DashboardLayout>
  );
}

