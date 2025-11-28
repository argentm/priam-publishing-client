import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { createServerApiClient } from '@/lib/api/server-client';
import { API_ENDPOINTS } from '@/lib/constants';
import type { User } from '@/lib/types';
import { UserActions } from '@/components/admin/actions/user-actions';
import { createClient } from '@/lib/supabase/server';
import { Badge } from '@/components/ui/badge';
import { Shield, Plus } from 'lucide-react';
import { UsersPageClient } from '@/components/admin/users-page-client';

async function getUsers(): Promise<User[]> {
  const client = await createServerApiClient();
  try {
    const response = await client.get<{ users: User[]; total: number }>(API_ENDPOINTS.ADMIN_USERS);
    return response.users || [];
  } catch {
    return [];
  }
}

async function getCurrentUserId(): Promise<string | undefined> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id;
  } catch {
    return undefined;
  }
}

export default async function AdminUsersPage() {
  const [users, currentUserId] = await Promise.all([
    getUsers(),
    getCurrentUserId(),
  ]);

  // Separate users into admins and normal users
  const admins = users.filter((user) => user.is_admin === true);
  const normalUsers = users.filter((user) => user.is_admin !== true);

  return (
    <UsersPageClient
      users={users}
      admins={admins}
      normalUsers={normalUsers}
      currentUserId={currentUserId}
    />
  );
}
