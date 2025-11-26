import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';
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
import { StatusFilterSelect, type DeliveryStatus } from '@/components/ui/status-filter-select';
import { Plus, Music, Search, ChevronLeft, ChevronRight, Users, Mic2, Trash2, Clock, Send, CheckCircle2, XCircle, Truck } from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ search?: string; page?: string; status?: DeliveryStatus }>;
}

interface Work {
  id: string;
  title: string;
  iswc?: string | null;
  tunecode?: string | null;
  priority?: boolean;
  production_library?: boolean;
  grand_rights?: boolean;
  delivery_status?: DeliveryStatus; // The actual delivery workflow status
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

// Delivery status configuration
const DELIVERY_STATUS_CONFIG: Record<string, { 
  label: string; 
  color: string; 
  bgColor: string; 
  icon: typeof Clock;
  description: string;
}> = {
  pending: { 
    label: 'Pending', 
    color: 'text-slate-600', 
    bgColor: 'bg-slate-500',
    icon: Clock,
    description: 'Awaiting submission'
  },
  submitted: { 
    label: 'Submitted', 
    color: 'text-blue-600', 
    bgColor: 'bg-blue-500',
    icon: Send,
    description: 'Under admin review'
  },
  approved: { 
    label: 'Approved', 
    color: 'text-emerald-600', 
    bgColor: 'bg-emerald-500',
    icon: CheckCircle2,
    description: 'Ready for delivery'
  },
  rejected: { 
    label: 'Rejected', 
    color: 'text-red-600', 
    bgColor: 'bg-red-500',
    icon: XCircle,
    description: 'Needs revision'
  },
  delivered: { 
    label: 'Delivered', 
    color: 'text-purple-600', 
    bgColor: 'bg-purple-500',
    icon: Truck,
    description: 'Sent to PROs'
  },
};

function getDeliveryStatus(work: Work) {
  const status = work.delivery_status || 'pending';
  return DELIVERY_STATUS_CONFIG[status] || DELIVERY_STATUS_CONFIG.pending;
}

// Check if work is complete (has required fields)
function isWorkComplete(work: Work): boolean {
  const hasTitle = !!work.title?.trim();
  const hasWriters = work.work_composers && work.work_composers.length > 0;
  // Performers are optional for now
  return hasTitle && hasWriters;
}

export default async function WorksPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { search: searchParam, page: pageParam, status: statusParam } = await searchParams;
  const supabase = await createServerClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    redirect('/login');
  }

  const search = searchParam || '';
  const validStatuses: DeliveryStatus[] = ['all', 'pending', 'submitted', 'approved', 'rejected', 'delivered'];
  const statusFilter: DeliveryStatus = validStatuses.includes(statusParam as DeliveryStatus) ? (statusParam as DeliveryStatus) : 'all';
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
    // TODO: Add delivery_status filter to backend when ready
    // if (statusFilter !== 'all') {
    //   queryParams.append('delivery_status', statusFilter);
    // }

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
    
    // Client-side filter by delivery status (until backend supports it)
    const filteredWorks = statusFilter === 'all' 
      ? works 
      : works.filter(work => (work.delivery_status || 'pending') === statusFilter);
    
    const totalPages = Math.ceil(total / limit);
    const basePath = `/dashboard/account/${id}/works`;

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
                  {total} work{total !== 1 ? 's' : ''} {statusFilter !== 'all' ? `(${statusFilter})` : 'registered'}
                </CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                {/* Status Filter Dropdown */}
                <Suspense fallback={<div className="w-[180px] h-10 bg-muted animate-pulse rounded-md" />}>
                  <StatusFilterSelect currentStatus={statusFilter} basePath={basePath} />
                </Suspense>
                
                {/* Search */}
                <form action={basePath} method="get" className="flex gap-2">
                  <input type="hidden" name="status" value={statusFilter} />
                  <Input
                    name="search"
                    placeholder="Search by title, ISWC..."
                    defaultValue={search}
                    className="w-full sm:w-56"
                  />
                  <Button type="submit" variant="outline" size="icon">
                    <Search className="w-4 h-4" />
                  </Button>
                </form>
                
                {/* New Work Button */}
                <Button asChild>
                  <Link href={`${basePath}/new`}>
                    <Plus className="w-4 h-4 mr-2" />
                    New Work
                  </Link>
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredWorks.length === 0 ? (
              <div className="text-center py-12">
                <Music className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">
                  {search 
                    ? 'No works found' 
                    : statusFilter !== 'all' 
                      ? `No ${statusFilter} works` 
                      : 'No works registered yet'}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {search
                    ? 'Try adjusting your search terms'
                    : statusFilter !== 'all'
                      ? `No works with "${statusFilter}" status.`
                      : 'Add your first musical work to get started.'}
                </p>
                {!search && statusFilter === 'all' && (
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
                      <TableHead className="font-semibold text-muted-foreground">Delivery Status</TableHead>
                      <TableHead className="font-semibold text-muted-foreground">Date Added</TableHead>
                      <TableHead className="font-semibold text-muted-foreground text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredWorks.map((work) => {
                      const deliveryStatus = getDeliveryStatus(work);
                      const StatusIcon = deliveryStatus.icon;
                      const writersCount = work.work_composers?.length || 0;
                      const performersCount = work.work_performers?.length || 0;
                      const isComplete = isWorkComplete(work);
                      
                      return (
                        <TableRow key={work.id} className="group hover:bg-muted/50">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                <Music className="w-5 h-5 text-primary" />
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <Link 
                                    href={`${basePath}/${work.id}`} 
                                    className="font-medium hover:text-primary transition-colors line-clamp-1"
                                  >
                                    {work.title}
                                  </Link>
                                  {!isComplete && (
                                    <Badge variant="outline" className="text-amber-600 border-amber-300 text-xs">
                                      Incomplete
                                    </Badge>
                                  )}
                                </div>
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
                              <Badge variant="outline" className="text-red-500 border-red-200 text-xs">
                                Required
                              </Badge>
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
                              <span className="text-muted-foreground/40 text-sm">—</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <StatusIcon className={cn("w-4 h-4", deliveryStatus.color)} />
                              <span className={cn("text-sm font-medium", deliveryStatus.color)}>
                                {deliveryStatus.label}
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
                              ...(statusFilter !== 'all' && { status: statusFilter }),
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
                              ...(statusFilter !== 'all' && { status: statusFilter }),
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

