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
import { Plus, Music, Search, ChevronLeft, ChevronRight, Users, Mic2, Trash2, FileMusic } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ search?: string; page?: string; filter?: FilterType }>;
}

type FilterType = 'all' | 'complete' | 'incomplete';

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

function getWorkStatus(work: Work): { label: string; color: string; bgColor: string } {
  const hasWriters = work.work_composers && work.work_composers.length > 0;
  const hasPerformers = work.work_performers && work.work_performers.length > 0;
  
  if (hasWriters && hasPerformers) {
    return { label: 'Complete', color: 'text-emerald-600', bgColor: 'bg-emerald-500' };
  }
  if (hasWriters || hasPerformers) {
    return { label: 'In Progress', color: 'text-amber-600', bgColor: 'bg-amber-500' };
  }
  return { label: 'Draft', color: 'text-slate-500', bgColor: 'bg-slate-400' };
}

export default async function WorksPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { search: searchParam, page: pageParam, filter: filterParam } = await searchParams;
  const supabase = await createServerClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    redirect('/login');
  }

  const search = searchParam || '';
  const validFilters: FilterType[] = ['all', 'complete', 'incomplete'];
  const filter: FilterType = validFilters.includes(filterParam as FilterType) ? (filterParam as FilterType) : 'all';
  const page = Math.max(1, parseInt(pageParam || '1', 10));
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
    
    // Client-side filter for complete/incomplete (until backend supports it)
    const filteredWorks = filter === 'all' 
      ? works 
      : works.filter(work => {
          const status = getWorkStatus(work);
          return filter === 'complete' 
            ? status.label === 'Complete' 
            : status.label !== 'Complete';
        });
    
    const totalPages = Math.ceil(total / limit);
    const basePath = `/dashboard/account/${id}/works`;

    // Helper to build filter URLs preserving search
    const getFilterUrl = (newFilter: FilterType) => {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (newFilter !== 'all') params.set('filter', newFilter);
      const queryString = params.toString();
      return queryString ? `${basePath}?${queryString}` : basePath;
    };

    return (
      <div className="space-y-6">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Song Library</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Manage musical works for <span className="font-medium">{account.name}</span>
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <CardTitle>Your Works</CardTitle>
                <CardDescription>
                  {total} work{total !== 1 ? 's' : ''} {filter !== 'all' ? `(${filter})` : 'registered'}
                </CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                <form action={basePath} method="get" className="flex gap-2">
                  <input type="hidden" name="filter" value={filter} />
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
                      <Link href={getFilterUrl(filter)}>Clear</Link>
                    </Button>
                  )}
                </form>
                <Button asChild>
                  <Link href={`${basePath}/new`}>
                    <Plus className="w-4 h-4 mr-2" />
                    New Work
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
                <Music className="w-4 h-4 inline-block mr-2" />
                All Works
              </Link>
              <Link
                href={getFilterUrl('complete')}
                className={cn(
                  "px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors",
                  filter === 'complete'
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30"
                )}
              >
                <FileMusic className="w-4 h-4 inline-block mr-2" />
                Complete
              </Link>
              <Link
                href={getFilterUrl('incomplete')}
                className={cn(
                  "px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors",
                  filter === 'incomplete'
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30"
                )}
              >
                <FileMusic className="w-4 h-4 inline-block mr-2" />
                Incomplete
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {filteredWorks.length === 0 ? (
              <div className="text-center py-12">
                <Music className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">
                  {search 
                    ? 'No works found' 
                    : filter !== 'all' 
                      ? `No ${filter} works` 
                      : 'No works registered yet'}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {search
                    ? 'Try adjusting your search terms'
                    : filter !== 'all'
                      ? `No works match the "${filter}" filter.`
                      : 'Add your first musical work to get started.'}
                </p>
                {!search && filter === 'all' && (
                  <Button asChild>
                    <Link href={`${basePath}/new`}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Work
                    </Link>
                  </Button>
                )}
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow className="uppercase text-xs hover:bg-transparent">
                      <TableHead className="font-semibold text-muted-foreground">Title</TableHead>
                      <TableHead className="font-semibold text-muted-foreground">Writers</TableHead>
                      <TableHead className="font-semibold text-muted-foreground">Performers</TableHead>
                      <TableHead className="font-semibold text-muted-foreground">Status</TableHead>
                      <TableHead className="font-semibold text-muted-foreground">Date Added</TableHead>
                      <TableHead className="font-semibold text-muted-foreground text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredWorks.map((work) => {
                      const status = getWorkStatus(work);
                      const writersCount = work.work_composers?.length || 0;
                      const performersCount = work.work_performers?.length || 0;
                      
                      return (
                        <TableRow key={work.id} className="group hover:bg-muted/50">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                <Music className="w-5 h-5 text-primary" />
                              </div>
                              <div className="min-w-0">
                                <Link 
                                  href={`${basePath}/${work.id}`} 
                                  className="font-medium hover:text-primary transition-colors line-clamp-1"
                                >
                                  {work.title}
                                </Link>
                                {work.iswc && (
                                  <div className="text-xs text-muted-foreground font-mono">
                                    ISWC: {work.iswc}
                                  </div>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {writersCount > 0 ? (
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1.5 text-sm">
                                  <Users className="w-3.5 h-3.5 text-muted-foreground" />
                                  <span className="text-muted-foreground">
                                    {work.work_composers.slice(0, 2).map(c => c.composer?.name).filter(Boolean).join(', ')}
                                    {writersCount > 2 && <span className="text-muted-foreground/60"> +{writersCount - 2}</span>}
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <span className="text-muted-foreground/40 text-sm">No writers</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {performersCount > 0 ? (
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1.5 text-sm">
                                  <Mic2 className="w-3.5 h-3.5 text-muted-foreground" />
                                  <span className="text-muted-foreground">
                                    {work.work_performers.slice(0, 2).map(p => p.performer_name).join(', ')}
                                    {performersCount > 2 && <span className="text-muted-foreground/60"> +{performersCount - 2}</span>}
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <span className="text-muted-foreground/40 text-sm">No performers</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className={cn("w-2 h-2 rounded-full", status.bgColor)} />
                              <span className={cn("text-sm font-medium", status.color)}>
                                {status.label}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {new Date(work.created_at).toLocaleDateString('en-GB', { 
                              day: '2-digit', 
                              month: 'short', 
                              year: 'numeric' 
                            })}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button variant="ghost" size="sm" asChild>
                                <Link href={`${basePath}/${work.id}`}>Edit</Link>
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                              >
                                <Trash2 className="w-4 h-4" />
                                <span className="sr-only">Delete</span>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
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
                              ...(filter !== 'all' && { filter }),
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
                              ...(filter !== 'all' && { filter }),
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

