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
import { API_ENDPOINTS, ROUTES } from '@/lib/constants';
import Link from 'next/link';
import { AccountActions } from '@/components/admin/actions/account-actions';
import { SearchInput } from '@/components/ui/search-input';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface AdminAccount {
  id: string;
  name: string;
  client_id?: string | null;
  created_at: string;
  updated_at: string;
}

async function getAccounts(): Promise<AdminAccount[]> {
  const client = await createServerApiClient();
  try {
    return await client.get<AdminAccount[]>(API_ENDPOINTS.ADMIN_ACCOUNTS);
  } catch {
    return [];
  }
}

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function AdminAccountsPage({ searchParams }: PageProps) {
  const { q: searchQuery } = await searchParams;
  const allAccounts = await getAccounts();
  
  // Filter accounts based on search query
  const accounts = searchQuery
    ? allAccounts.filter((account) =>
        account.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        account.client_id?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allAccounts;

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Accounts</CardTitle>
              <CardDescription>
                {searchQuery
                  ? `${accounts.length} of ${allAccounts.length} accounts matching "${searchQuery}"`
                  : `${accounts.length} account${accounts.length !== 1 ? 's' : ''} found`}
              </CardDescription>
            </div>
            <Button asChild>
              <Link href={ROUTES.ADMIN_ACCOUNT_NEW} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Account
              </Link>
            </Button>
          </div>
          <div className="pt-4">
            <SearchInput placeholder="Search accounts..." useUrlParams />
          </div>
        </CardHeader>
        <CardContent>
          {accounts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery ? (
                <p>No accounts found matching &quot;{searchQuery}&quot;</p>
              ) : (
                <>
                  <p className="mb-4">No accounts found</p>
                  <Button asChild>
                    <Link href={ROUTES.ACCOUNT_NEW} className="flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      Create Your First Account
                    </Link>
                  </Button>
                </>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Client ID</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accounts.map((account) => (
                  <TableRow key={account.id}>
                    <TableCell className="font-medium">
                      {account.name}
                    </TableCell>
                    <TableCell>
                      {account.client_id || (
                        <span className="text-muted-foreground">N/A</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {account.created_at
                        ? new Date(account.created_at).toLocaleDateString()
                        : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {account.updated_at
                        ? new Date(account.updated_at).toLocaleDateString()
                        : 'N/A'}
                    </TableCell>
                    <TableCell className="text-right">
                      <AccountActions account={{ ...account, role: 'owner' } as any} />
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

