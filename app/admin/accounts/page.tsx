import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { createServerApiClient } from '@/lib/api/server-client';
import { API_ENDPOINTS, ROUTES } from '@/lib/constants';
import type { Account } from '@/lib/types';
import Link from 'next/link';
import { AccountActions } from '@/components/admin/account-actions';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

async function getAccounts(): Promise<Account[]> {
  const client = await createServerApiClient();
  try {
    return await client.get<Account[]>(API_ENDPOINTS.ADMIN_ACCOUNTS);
  } catch {
    return [];
  }
}

export default async function AdminAccountsPage() {
  const accounts = await getAccounts();

  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Accounts</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Manage all accounts in the system
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Accounts</CardTitle>
          <CardDescription>
            {accounts.length} account{accounts.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {accounts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No accounts found
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {accounts.map((account) => (
                <Card key={account.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle>{account.name}</CardTitle>
                    <CardDescription>
                      Client ID: {account.client_id || 'N/A'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Created: {account.created_at ? new Date(account.created_at).toLocaleDateString() : 'N/A'}
                      </p>
                      <div className="flex items-center space-x-2 pt-2">
                        <Button asChild variant="outline" size="sm" className="flex-1">
                          <Link href={ROUTES.ACCOUNT(account.id)} className="flex items-center gap-1">
                            <ExternalLink className="w-3 h-3" />
                            View
                          </Link>
                        </Button>
                        <AccountActions account={account} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}

