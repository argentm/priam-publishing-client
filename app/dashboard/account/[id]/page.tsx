import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { createServerApiClient } from '@/lib/api/server-client';
import { API_ENDPOINTS, ROUTES } from '@/lib/constants';
import Link from 'next/link';
import { ArrowLeft, Edit, Users, FileText, Music, UserCircle, FileSignature } from 'lucide-react';
import { notFound } from 'next/navigation';
import { AccountEditor } from '@/components/admin/account-editor';
import { AccountActions } from '@/components/admin/account-actions';

interface AccountDetails {
  id: string;
  name: string;
  client_id?: string | null;
  created_at: string;
  updated_at: string;
  works_count?: number;
  tracks_count?: number;
  composers_count?: number;
  contracts_count?: number;
}

interface AccountResponse {
  account: AccountDetails;
}

async function getAccount(id: string): Promise<AccountDetails | null> {
  const client = await createServerApiClient();
  try {
    const response = await client.get<AccountResponse>(API_ENDPOINTS.ADMIN_ACCOUNT(id));
    return response.account;
  } catch (error) {
    console.error('Error fetching account:', error);
    return null;
  }
}

export default async function AccountDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const account = await getAccount(id);

  if (!account) {
    notFound();
  }

  const hasContent = (account.works_count || 0) > 0 || 
                     (account.tracks_count || 0) > 0 || 
                     (account.composers_count || 0) > 0 || 
                     (account.contracts_count || 0) > 0;

  return (
    <>
      <div className="mb-6">
        <Button asChild variant="ghost" size="sm" className="mb-4">
          <Link href={ROUTES.ADMIN_ACCOUNTS} className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Accounts
          </Link>
        </Button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{account.name}</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Account ID: {account.id}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <AccountEditor account={account} />
            <AccountActions 
              account={{ ...account, role: 'owner' } as any}
              showViewButton={false}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Works</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{account.works_count || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Musical works registered
            </p>
            {(account.works_count || 0) > 0 && (
              <Button asChild variant="link" className="px-0 mt-2" size="sm">
                <Link href={ROUTES.ACCOUNT_WORKS(account.id)}>
                  View Works →
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tracks</CardTitle>
            <Music className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{account.tracks_count || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Recordings tracked
            </p>
            {(account.tracks_count || 0) > 0 && (
              <Button asChild variant="link" className="px-0 mt-2" size="sm">
                <Link href={ROUTES.ACCOUNT_TRACKS(account.id)}>
                  View Tracks →
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Composers</CardTitle>
            <UserCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{account.composers_count || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Composers registered
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contracts</CardTitle>
            <FileSignature className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{account.contracts_count || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Active agreements
            </p>
            {(account.contracts_count || 0) > 0 && (
              <Button asChild variant="link" className="px-0 mt-2" size="sm">
                <Link href={ROUTES.ACCOUNT_CONTRACTS(account.id)}>
                  View Contracts →
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Basic account details and metadata</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="font-medium text-sm text-muted-foreground">Name</div>
              <div className="col-span-2 text-sm">{account.name}</div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="font-medium text-sm text-muted-foreground">Client ID</div>
              <div className="col-span-2 text-sm">
                {account.client_id || <span className="text-muted-foreground">Not set</span>}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="font-medium text-sm text-muted-foreground">Created</div>
              <div className="col-span-2 text-sm">
                {new Date(account.created_at).toLocaleString()}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="font-medium text-sm text-muted-foreground">Last Updated</div>
              <div className="col-span-2 text-sm">
                {new Date(account.updated_at).toLocaleString()}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="font-medium text-sm text-muted-foreground">Status</div>
              <div className="col-span-2 text-sm">
                {hasContent ? (
                  <Badge variant="default">Active</Badge>
                ) : (
                  <Badge variant="secondary">Empty</Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Deletion Status</CardTitle>
            <CardDescription>
              Account deletion requirements
            </CardDescription>
          </CardHeader>
          <CardContent>
            {hasContent ? (
              <div className="space-y-4">
                <div className="rounded-lg bg-yellow-500/10 border border-yellow-500/20 p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-yellow-500 mt-0.5">⚠️</div>
                    <div>
                      <p className="font-medium text-sm mb-2">Cannot Delete Account</p>
                      <p className="text-sm text-muted-foreground mb-3">
                        This account contains content and cannot be deleted. Remove all content first:
                      </p>
                      <ul className="space-y-2 text-sm">
                        {(account.works_count || 0) > 0 && (
                          <li className="flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            <span>{account.works_count} work(s)</span>
                          </li>
                        )}
                        {(account.tracks_count || 0) > 0 && (
                          <li className="flex items-center gap-2">
                            <Music className="w-4 h-4" />
                            <span>{account.tracks_count} track(s)</span>
                          </li>
                        )}
                        {(account.composers_count || 0) > 0 && (
                          <li className="flex items-center gap-2">
                            <UserCircle className="w-4 h-4" />
                            <span>{account.composers_count} composer(s)</span>
                          </li>
                        )}
                        {(account.contracts_count || 0) > 0 && (
                          <li className="flex items-center gap-2">
                            <FileSignature className="w-4 h-4" />
                            <span>{account.contracts_count} contract(s)</span>
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-4">
                <div className="flex items-start gap-3">
                  <div className="text-green-500 mt-0.5">✓</div>
                  <div>
                    <p className="font-medium text-sm mb-1">Ready for Deletion</p>
                    <p className="text-sm text-muted-foreground">
                      This account has no content and can be safely deleted.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common account management tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <Button asChild variant="outline">
                <Link href={ROUTES.ACCOUNT_WORKS(account.id)} className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Manage Works
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href={ROUTES.ACCOUNT_TRACKS(account.id)} className="flex items-center gap-2">
                  <Music className="w-4 h-4" />
                  Manage Tracks
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href={ROUTES.ACCOUNT_CONTRACTS(account.id)} className="flex items-center gap-2">
                  <FileSignature className="w-4 h-4" />
                  Manage Contracts
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

