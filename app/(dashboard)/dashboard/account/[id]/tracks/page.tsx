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
import { Plus, Disc3, Search, ChevronLeft, ChevronRight, Music, Link2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ search?: string; page?: string; filter?: FilterType }>;
}

type FilterType = 'all' | 'linked' | 'unlinked';

interface Track {
  id: string;
  title: string;
  version?: string | null;
  artist?: string | null;
  isrc: string;
  label?: string | null;
  duration?: number | null;
  created_at: string;
  updated_at: string;
  works?: {
    work_id: string;
    work: {
      id: string;
      title: string;
    } | null;
  }[];
}

interface Account {
  id: string;
  name: string;
}

interface DashboardAccountResponse {
  account: Account;
}

interface TracksResponse {
  tracks: Track[];
  total: number;
}

function formatDuration(seconds: number | null | undefined): string {
  if (!seconds) return '—';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default async function TracksPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { search: searchParam, page: pageParam, filter: filterParam } = await searchParams;
  const supabase = await createServerClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    redirect('/login');
  }

  const search = searchParam || '';
  const validFilters: FilterType[] = ['all', 'linked', 'unlinked'];
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
    if (filter !== 'all') {
      queryParams.append('linked', filter === 'linked' ? 'true' : 'false');
    }

    // Fetch account and tracks in parallel
    const [accountResponse, tracksResponse] = await Promise.all([
      apiClient.get<DashboardAccountResponse>(API_ENDPOINTS.DASHBOARD_ACCOUNT(id))
        .catch(err => {
          console.error('Error fetching account:', err);
          return null;
        }),
      apiClient.get<TracksResponse>(`${API_ENDPOINTS.TRACKS}?${queryParams.toString()}`)
        .catch(err => {
          console.error('Error fetching tracks:', err);
          return { tracks: [], total: 0 };
        }),
    ]);

    if (!accountResponse?.account) {
      console.error('Account not found or access denied');
      redirect('/dashboard');
    }

    const { account } = accountResponse;
    const { tracks = [], total = 0 } = tracksResponse || {};
    const totalPages = Math.ceil(total / limit);
    const basePath = `/dashboard/account/${id}/tracks`;

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
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Recordings</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Manage recordings/tracks for <span className="font-medium">{account.name}</span>
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <CardTitle>Your Recordings</CardTitle>
                <CardDescription>
                  {total} recording{total !== 1 ? 's' : ''} {filter !== 'all' ? `(${filter})` : 'registered'}
                </CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                <form action={basePath} method="get" className="flex gap-2">
                  <input type="hidden" name="filter" value={filter} />
                  <Input
                    name="search"
                    placeholder="Search by title, ISRC, artist..."
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
                  <Link href={ROUTES.WORKSPACE_TRACKS_NEW(id)}>
                    <Plus className="w-4 h-4 mr-2" />
                    New Recording
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
                <Disc3 className="w-4 h-4 inline-block mr-2" />
                All Recordings
              </Link>
              <Link
                href={getFilterUrl('linked')}
                className={cn(
                  "px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors",
                  filter === 'linked'
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30"
                )}
              >
                <Link2 className="w-4 h-4 inline-block mr-2" />
                Linked to Works
              </Link>
              <Link
                href={getFilterUrl('unlinked')}
                className={cn(
                  "px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors",
                  filter === 'unlinked'
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30"
                )}
              >
                <Music className="w-4 h-4 inline-block mr-2" />
                Unlinked
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {tracks.length === 0 ? (
              <div className="text-center py-12">
                <Disc3 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">
                  {search 
                    ? 'No recordings found' 
                    : filter !== 'all' 
                      ? `No ${filter} recordings` 
                      : 'No recordings registered yet'}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {search
                    ? 'Try adjusting your search terms'
                    : filter !== 'all'
                      ? `No recordings match the "${filter}" filter.`
                      : 'Add your first recording to link with works.'}
                </p>
                {!search && filter === 'all' && (
                  <Button asChild>
                    <Link href={ROUTES.WORKSPACE_TRACKS_NEW(id)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Recording
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
                      <TableHead className="font-semibold text-muted-foreground">Artist</TableHead>
                      <TableHead className="font-semibold text-muted-foreground">ISRC</TableHead>
                      <TableHead className="font-semibold text-muted-foreground">Duration</TableHead>
                      <TableHead className="font-semibold text-muted-foreground">Linked Works</TableHead>
                      <TableHead className="font-semibold text-muted-foreground">Date Added</TableHead>
                      <TableHead className="font-semibold text-muted-foreground text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tracks.map((track) => {
                      const linkedWorksCount = track.works?.length || 0;
                      return (
                        <TableRow key={track.id} className="border-b hover:bg-muted/50">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
                                <Disc3 className="w-4 h-4 text-primary" />
                              </div>
                              <div>
                                <Link 
                                  href={`${basePath}/${track.id}`} 
                                  className="font-medium hover:underline decoration-primary decoration-2 underline-offset-4"
                                >
                                  {track.title}
                                </Link>
                                {track.version && (
                                  <div className="text-xs text-muted-foreground">
                                    {track.version}
                                  </div>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {track.artist || <span className="text-muted-foreground/50">—</span>}
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {track.isrc}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatDuration(track.duration)}
                          </TableCell>
                          <TableCell>
                            {linkedWorksCount > 0 ? (
                              <Badge variant="default" className="gap-1">
                                <Link2 className="w-3 h-3" />
                                {linkedWorksCount} work{linkedWorksCount !== 1 ? 's' : ''}
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-amber-600 border-amber-300">
                                Unlinked
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {new Date(track.created_at).toLocaleDateString('en-GB', { 
                              day: '2-digit', 
                              month: 'short', 
                              year: 'numeric' 
                            })}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`${basePath}/${track.id}`}>Edit</Link>
                            </Button>
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
    console.error('Failed to fetch tracks:', error);
    redirect('/dashboard');
  }
}

