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

  if (!user || !isAdmin(user)) {
    redirect(ROUTES.DASHBOARD);
  }

  return (
    <AdminLayout user={user}>
      {children}
    </AdminLayout>
  );
}

