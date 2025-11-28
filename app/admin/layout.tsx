import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AdminLayout } from '@/components/layout/admin-layout';
import { isAdmin } from '@/lib/utils/admin';
import { ROUTES, API_ENDPOINTS } from '@/lib/constants';
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

export default async function AdminLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser) {
    redirect(ROUTES.LOGIN);
  }

  // Fetch user with admin status from API
  const user = await getUserWithAdminStatus();

  // SECURITY: TRUE FAIL-CLOSED
  // If user is null (API failed), redirect to error page, NOT dashboard
  // This prevents admin bypass when server is unavailable
  if (!user) {
    redirect('/error?code=server_unavailable&from=/admin');
  }

  // User exists but is not admin - redirect to dashboard
  if (!isAdmin(user)) {
    redirect(ROUTES.DASHBOARD);
  }

  return (
    <AdminLayout user={user}>
      {children}
    </AdminLayout>
  );
}

