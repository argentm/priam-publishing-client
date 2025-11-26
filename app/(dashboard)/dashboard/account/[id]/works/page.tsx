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
  work_composers: {
    composer: {
      name: string;
    } | null;
  }[];
  work_performers: {
    performer_name: string;
  }[];
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
      apiClient.get<DashboardAccountResponse>(API_ENDPOINTS.DASHBOARD_ACCOUNT(id))
        .catch(err => {
          console.error('Error fetching account:', err);
          return null;
        }),
      apiClient.get<WorksResponse>(`${API_ENDPOINTS.WORKS}?${queryParams.toString()}`)
        .catch(err => {
          console.error('Error fetching works:', err);
          return { works: [], total: 0 };
        }),
    ]);

    if (!accountResponse?.account) {
      console.error('Account not found or access denied');
      redirect('/dashboard');
    }

    const { account } = accountResponse;
    const { works = [], total = 0 } = worksResponse || {};
    const totalPages = Math.ceil(total / limit);
    const basePath = `/dashboard/account/${id}/works`;

    return (
      <div className="space-y-6">
        <Card className="border-none shadow-none">
          <CardHeader className="px-0 pt-0">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-semibold">Works</CardTitle>
                <CardDescription>
                  Filter {total} works
                </CardDescription>
              </div>
              <Button asChild>
                <Link href={`${basePath}/new`}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Work
                </Link>
              </Button>
            </div>
            <div className="mt-4">
              <form action={basePath} method="get" className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  name="search"
                  placeholder="Search works..."
                  defaultValue={search}
                  className="w-full pl-9 bg-muted/50 border-none h-10"
                />
              </form>
            </div>
          </CardHeader>
          <CardContent className="px-0">
            {works.length === 0 ? (
              <div className="py-8 border-t">
                <p className="text-sm font-medium">There are no works.</p>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow className="uppercase text-xs hover:bg-transparent">
                      <TableHead className="font-semibold text-muted-foreground">Work Title</TableHead>
                      <TableHead className="font-semibold text-muted-foreground">Performers</TableHead>
                      <TableHead className="font-semibold text-muted-foreground">Date Added</TableHead>
                      <TableHead className="font-semibold text-muted-foreground">Writers</TableHead>
                      <TableHead className="font-semibold text-muted-foreground">Status</TableHead>
                      <TableHead className="font-semibold text-muted-foreground text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {works.map((work) => (
                      <TableRow key={work.id} className="border-b hover:bg-muted/50">
                        <TableCell className="font-medium">
                          <Link href={`${basePath}/${work.id}`} className="hover:underline decoration-primary decoration-2 underline-offset-4">
                            {work.title}
                          </Link>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {work.work_performers?.length > 0 
                            ? work.work_performers.map(p => p.performer_name).join(', ')
                            : <span className="text-muted-foreground/50">—</span>
                          }
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm uppercase">
                          {new Date(work.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {work.work_composers?.length > 0
                            ? work.work_composers.map(c => c.composer?.name).filter(Boolean).join(', ')
                            : <span className="text-muted-foreground/50">—</span>
                          }
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {/* Status Logic placeholder */}
                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                            <span className="text-sm text-muted-foreground">Active</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive">
                            <span className="sr-only">Delete</span>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
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
                            <ChevronLeft className="w-4 h-4 mr-1" />
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
                            <ChevronRight className="w-4 h-4 ml-1" />
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

