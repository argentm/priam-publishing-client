import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
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

export default async function Home() {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser) {
    redirect(ROUTES.LOGIN);
  }

  // Fetch user with admin status from API
  const user = await getUserWithAdminStatus();

  // Redirect admin to admin panel
  if (user && isAdmin(user)) {
    redirect(ROUTES.ADMIN_DASHBOARD);
  }

  redirect(ROUTES.DASHBOARD);
}

