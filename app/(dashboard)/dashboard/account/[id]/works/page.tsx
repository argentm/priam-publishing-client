import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { createServerApiClient } from '@/lib/api/server-client';
import { API_ENDPOINTS, ROUTES } from '@/lib/constants';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, Music, Search, ChevronLeft, ChevronRight } from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ search?: string; page?: string }>;
}

interface Work {
  id: string;
  title: string;
  iswc?: string | null;
  tunecode?: string | null;
  priority?: boolean;
  production_library?: boolean;
  grand_rights?: boolean;
  approval_status?: string;
  created_at: string;
  updated_at: string;
}

interface Account {
  id: string;
  name: string;
}

interface DashboardAccountResponse {
  account: Account;
}

interface WorksResponse {
  works: Work[];
  total: number;
}

export default async function WorksPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { search: searchParam, page: pageParam } = await searchParams;
  const supabase = await createServerClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    redirect('/login');
  }

  const search = searchParam || '';
  const page = parseInt(pageParam || '1', 10);
  const limit = 50;
  const offset = (page - 1) * limit;

  try {
    const apiClient = await createServerApiClient();
    
    // Build query params
    const queryParams = new URLSearchParams({
      account_id: id,
      limit: limit.toString(),
      offset: offset.toString(),
    });
    if (search) {
      queryParams.append('search', search);
    }

    // Fetch account and works in parallel
    const [accountResponse, worksResponse] = await Promise.all([
      apiClient.get<DashboardAccountResponse>(API_ENDPOINTS.DASHBOARD_ACCOUNT(id)),
      apiClient.get<WorksResponse>(`${API_ENDPOINTS.WORKS}?${queryParams.toString()}`),
    ]);

    if (!accountResponse?.account) {
      redirect('/dashboard');
    }

    const { account } = accountResponse;
    const { works = [], total = 0 } = worksResponse || {};
    const totalPages = Math.ceil(total / limit);
    const basePath = `/dashboard/account/${id}/works`;

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Works</h1>
            <p className="text-muted-foreground mt-1">
              Manage musical works for <span className="font-medium">{account.name}</span>
            </p>
          </div>
        </div>

        {/* Works Table */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <CardTitle>Your Works</CardTitle>
                <CardDescription>
                  {total} work{total !== 1 ? 's' : ''} registered
                </CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                <form action={basePath} method="get" className="flex gap-2">
                  <Input
                    name="search"
                    placeholder="Search by title, ISWC..."
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
                  <Link href={ROUTES.ACCOUNT_WORKS_NEW(id)}>
                    <Plus className="w-4 h-4 mr-2" />
                    New Work
                  </Link>
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {works.length === 0 ? (
              <div className="text-center py-12">
                <Music className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">
                  {search ? 'No works found' : 'No works registered yet'}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {search
                    ? 'Try adjusting your search terms'
                    : 'Register your first work to start managing your publishing rights.'}
                </p>
                {!search && (
                  <Button asChild>
                    <Link href={ROUTES.ACCOUNT_WORKS_NEW(id)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Register Work
                    </Link>
                  </Button>
                )}
              </div>
            ) : (
              <>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>ISWC</TableHead>
                        <TableHead>Tunecode</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {works.map((work) => (
                        <TableRow key={work.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Music className="w-4 h-4 text-primary" />
                              </div>
                              <div>
                                <div className="font-medium">{work.title}</div>
                                <div className="flex gap-1 mt-0.5">
                                  {work.priority && (
                                    <Badge variant="default" className="text-[10px] px-1 py-0">Priority</Badge>
                                  )}
                                  {work.production_library && (
                                    <Badge variant="secondary" className="text-[10px] px-1 py-0">Library</Badge>
                                  )}
                                  {work.grand_rights && (
                                    <Badge variant="outline" className="text-[10px] px-1 py-0">Grand Rights</Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {work.iswc || <span className="text-muted-foreground">—</span>}
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {work.tunecode || <span className="text-muted-foreground">—</span>}
                          </TableCell>
                          <TableCell>
                            {work.approval_status ? (
                              <Badge 
                                variant={work.approval_status === 'Approved' ? 'default' : 
                                        work.approval_status === 'Pending' ? 'secondary' : 'outline'}
                              >
                                {work.approval_status}
                              </Badge>
                            ) : (
                              <Badge variant="outline">Draft</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {new Date(work.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`${basePath}/${work.id}`}>Edit</Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
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
      </div>
    );
  } catch (error) {
    console.error('Failed to fetch works:', error);
    redirect('/dashboard');
  }
}

