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
import { UserActions } from '@/components/admin/user-actions';
import { createClient } from '@/lib/supabase/server';
import { Badge } from '@/components/ui/badge';
import { Shield } from 'lucide-react';

async function getUsers(): Promise<User[]> {
  const client = await createServerApiClient();
  try {
    return await client.get<User[]>(API_ENDPOINTS.ADMIN_USERS);
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

  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Users</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Manage all users in the system
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>
            {users.length} user{users.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No users found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.full_name || 'No name'}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      {user.is_admin ? (
                        <Badge variant="default" className="gap-1">
                          <Shield className="w-3 h-3" />
                          Admin
                        </Badge>
                      ) : (
                        <Badge variant="secondary">User</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {user.created_at
                        ? new Date(user.created_at).toLocaleDateString()
                        : 'N/A'}
                    </TableCell>
                    <TableCell className="text-right">
                      <UserActions user={user} currentUserId={currentUserId} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </>
  );
}
