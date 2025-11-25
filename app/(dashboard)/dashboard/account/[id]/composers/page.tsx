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
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, ChevronLeft, ChevronRight, Plus, UserCircle, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

interface Composer {
  id: string;
  name: string;
  first_name?: string | null;
  surname?: string | null;
  cae?: string | null;
  main_pro?: string | null;
  controlled?: boolean;
  created_at: string;
}

interface ComposersResponse {
  composers: Composer[];
  total: number;
}

interface Account {
  id: string;
  name: string;
}

interface AccountResponse {
  account: Account;
}

async function getComposers(
  accountId: string,
  search?: string,
  limit = 50,
  offset = 0
): Promise<ComposersResponse> {
  const client = await createServerApiClient();
  try {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });
    if (search) {
      params.append('search', search);
    }
    return await client.get<ComposersResponse>(
      `${API_ENDPOINTS.DASHBOARD_COMPOSERS(accountId)}?${params.toString()}`
    );
  } catch {
    return { composers: [], total: 0 };
  }
}

async function getAccount(accountId: string): Promise<Account | null> {
  const client = await createServerApiClient();
  try {
    const response = await client.get<AccountResponse>(API_ENDPOINTS.ACCOUNT(accountId));
    return response.account;
  } catch {
    return null;
  }
}

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ search?: string; page?: string }>;
}

export default async function ComposersPage({ params, searchParams }: PageProps) {
  const { id: accountId } = await params;
  const { search: searchParam, page: pageParam } = await searchParams;
  
  const account = await getAccount(accountId);
  
  if (!account) {
    redirect(ROUTES.DASHBOARD);
  }
  
  const search = searchParam || '';
  const page = parseInt(pageParam || '1', 10);
  const limit = 50;
  const offset = (page - 1) * limit;

  const { composers, total } = await getComposers(accountId, search, limit, offset);
  const totalPages = Math.ceil(total / limit);

  const basePath = `/dashboard/account/${accountId}/composers`;

  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Composers</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Manage composers for <span className="font-medium">{account.name}</span>
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Your Composers</CardTitle>
              <CardDescription>
                {total} composer{total !== 1 ? 's' : ''} registered
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
              <form action={basePath} method="get" className="flex gap-2">
                <Input
                  name="search"
                  placeholder="Search by name, CAE..."
                  defaultValue={search}
                  className="w-full sm:w-64"
                />
                <Button type="submit" variant="outline" size="icon">
                  <Search className="w-4 h-4" />
                </Button>
                {search && (
                  <Button type="button" variant="ghost" asChild>
                    <Link href={basePath}>Clear</Link>
                  </Button>
                )}
              </form>
              <Button asChild>
                <Link href={ROUTES.WORKSPACE_COMPOSERS_NEW(accountId)}>
                  <Plus className="w-4 h-4 mr-2" />
                  New Composer
                </Link>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {composers.length === 0 ? (
            <div className="text-center py-12">
              <UserCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">
                {search ? 'No composers found' : 'No composers registered yet'}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {search
                  ? 'Try adjusting your search terms'
                  : 'Add your first composer to start registering works.'}
              </p>
              {!search && (
                <Button asChild>
                  <Link href={ROUTES.WORKSPACE_COMPOSERS_NEW(accountId)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Composer
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <>
              <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>CAE/IPI</TableHead>
                      <TableHead>PRO</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {composers.map((composer) => (
                      <TableRow key={composer.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <UserCircle className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                              <div className="font-medium">{composer.name}</div>
                              {(composer.first_name || composer.surname) && (
                                <div className="text-xs text-muted-foreground">
                                  {[composer.first_name, composer.surname]
                                    .filter(Boolean)
                                    .join(' ')}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {composer.cae || <span className="text-muted-foreground">—</span>}
                        </TableCell>
                        <TableCell>
                          {composer.main_pro || <span className="text-muted-foreground">—</span>}
                        </TableCell>
                        <TableCell>
                          {composer.controlled ? (
                            <Badge variant="default" className="gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              Controlled
                            </Badge>
                          ) : (
                            <Badge variant="outline">External</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {composer.created_at
                            ? new Date(composer.created_at).toLocaleDateString()
                            : 'N/A'}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`${basePath}/${composer.id}`}>Edit</Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Page {page} of {totalPages}
                  </div>
                  <div className="flex gap-2">
                    {page > 1 && (
                      <Button variant="outline" size="sm" asChild>
                        <Link
                          href={`${basePath}?${new URLSearchParams({
                            ...(search && { search }),
                            page: (page - 1).toString(),
                          }).toString()}`}
                        >
                          <ChevronLeft className="w-4 h-4" />
                          Previous
                        </Link>
                      </Button>
                    )}
                    {page < totalPages && (
                      <Button variant="outline" size="sm" asChild>
                        <Link
                          href={`${basePath}?${new URLSearchParams({
                            ...(search && { search }),
                            page: (page + 1).toString(),
                          }).toString()}`}
                        >
                          Next
                          <ChevronRight className="w-4 h-4" />
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </>
  );
}

