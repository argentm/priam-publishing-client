import { redirect } from 'next/navigation';
import { createServerApiClient } from '@/lib/api/server-client';
import { API_ENDPOINTS } from '@/lib/constants';
import { UserEditor } from '@/components/admin/editors/user-editor';
import type { User, Payee } from '@/lib/types';

interface UserWithPayee {
  user: User;
  payee: Payee | null;
}

async function getUser(id: string): Promise<UserWithPayee | null> {
  const client = await createServerApiClient();
  try {
    const response = await client.get<UserWithPayee>(`${API_ENDPOINTS.ADMIN_USERS}/${id}`);
    return response;
  } catch {
    return null;
  }
}

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getUser(id);

  if (!data) {
    redirect('/admin/users');
  }

  return (
    <div className="container mx-auto py-6">
      <UserEditor user={data.user} payee={data.payee} />
    </div>
  );
}
