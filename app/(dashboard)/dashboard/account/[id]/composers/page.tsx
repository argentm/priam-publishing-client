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
import { Search, ChevronLeft, ChevronRight, Plus, UserCircle, CheckCircle2, Users } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { cn } from '@/lib/utils';

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
  controlled?: string,
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
    if (controlled) {
      params.append('controlled', controlled);
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

type FilterType = 'all' | 'controlled' | 'external';

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ search?: string; page?: string; filter?: FilterType }>;
}

export default async function ComposersPage({ params, searchParams }: PageProps) {
  const { id: accountId } = await params;
  const { search: searchParam, page: pageParam, filter: filterParam } = await searchParams;
  
  const account = await getAccount(accountId);
  
  if (!account) {
    redirect(ROUTES.DASHBOARD);
  }
  
  const search = searchParam || '';
  // Validate filter to prevent unexpected values
  const validFilters: FilterType[] = ['all', 'controlled', 'external'];
  const filter: FilterType = validFilters.includes(filterParam as FilterType) ? (filterParam as FilterType) : 'all';
  const page = Math.max(1, parseInt(pageParam || '1', 10)); // Ensure page is at least 1
  const limit = 50;
  const offset = (page - 1) * limit;

  // Map filter to controlled query param
  const controlledParam = filter === 'controlled' ? 'true' : filter === 'external' ? 'false' : undefined;

  const { composers, total } = await getComposers(accountId, search, controlledParam, limit, offset);
  const totalPages = Math.ceil(total / limit);

  const basePath = `/dashboard/account/${accountId}/composers`;
  
  // Helper to build filter URLs preserving search
  const getFilterUrl = (newFilter: FilterType) => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (newFilter !== 'all') params.set('filter', newFilter);
    const queryString = params.toString();
    return queryString ? `${basePath}?${queryString}` : basePath;
  };

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
                {total} composer{total !== 1 ? 's' : ''} {filter !== 'all' ? `(${filter})` : 'registered'}
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
              <form action={basePath} method="get" className="flex gap-2">
                <input type="hidden" name="filter" value={filter} />
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
                    <Link href={getFilterUrl(filter)}>Clear</Link>
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
          
          {/* Filter Tabs */}
          <div className="flex items-center gap-1 mt-4 border-b">
            <Link
              href={getFilterUrl('all')}
              className={cn(
                "px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors",
                filter === 'all'
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30"
              )}
            >
              <Users className="w-4 h-4 inline-block mr-2" />
              All Writers
            </Link>
            <Link
              href={getFilterUrl('controlled')}
              className={cn(
                "px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors",
                filter === 'controlled'
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30"
              )}
            >
              <CheckCircle2 className="w-4 h-4 inline-block mr-2" />
              Controlled
            </Link>
            <Link
              href={getFilterUrl('external')}
              className={cn(
                "px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors",
                filter === 'external'
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30"
              )}
            >
              <UserCircle className="w-4 h-4 inline-block mr-2" />
              External
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {composers.length === 0 ? (
            <div className="text-center py-12">
              <UserCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">
                {search 
                  ? 'No composers found' 
                  : filter !== 'all' 
                    ? `No ${filter} composers` 
                    : 'No composers registered yet'}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {search
                  ? 'Try adjusting your search terms'
                  : filter !== 'all'
                    ? `No ${filter} writers match your criteria. Try a different filter.`
                    : 'Add your first composer to start registering works.'}
              </p>
              {!search && filter === 'all' && (
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
                            ...(filter !== 'all' && { filter }),
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
                            ...(filter !== 'all' && { filter }),
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

