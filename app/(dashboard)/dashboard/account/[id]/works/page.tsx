import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { createServerApiClient } from '@/lib/api/server-client';
import { API_ENDPOINTS } from '@/lib/constants';
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
import { Plus, Music, Search, ChevronLeft, ChevronRight, Users, Mic2, Trash2, Clock, Send, CheckCircle2, XCircle, Truck, Edit3 } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  approval_status?: string; // Workflow status: draft, in_review, approved, rejected
  rejection_reason?: string | null;
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

// Approval status configuration (lowercase values match database)
const APPROVAL_STATUS_CONFIG: Record<string, {
  label: string;
  color: string;
  bgColor: string;
  icon: typeof Clock;
  description: string;
}> = {
  draft: {
    label: 'Draft',
    color: 'text-slate-600',
    bgColor: 'bg-slate-500',
    icon: Clock,
    description: 'Awaiting submission'
  },
  in_review: {
    label: 'In Review',
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

function getApprovalStatus(work: Work) {
  const status = work.approval_status || 'draft';
  return APPROVAL_STATUS_CONFIG[status] || APPROVAL_STATUS_CONFIG.draft;
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
        .catch(() => null),
      apiClient.get<WorksResponse>(`${API_ENDPOINTS.WORKS}?${queryParams.toString()}`)
        .catch(() => ({ works: [], total: 0 })),
    ]);

    if (!accountResponse?.account) {
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
      <div className="space-y-4 sm:space-y-6">
        {/* Page Header - Responsive Typography */}
        <div className="mb-4 sm:mb-8">
          <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground tracking-tight">
            Song Library
          </h1>
          <p className="mt-1 sm:mt-2 text-sm sm:text-base text-muted-foreground">
            Manage musical works for <span className="font-semibold text-foreground">{account.name}</span>
          </p>
        </div>

        <Card className="card-clean">
          <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6">
            <div className="space-y-3 sm:space-y-0 sm:flex sm:flex-col lg:flex-row sm:items-start lg:items-center sm:justify-between sm:gap-4">
              <div className="flex items-center justify-between sm:block">
                <div>
                  <CardTitle className="text-lg sm:text-xl">Your Works</CardTitle>
                  <CardDescription className="mt-0.5 sm:mt-1 text-xs sm:text-sm">
                    {total} work{total !== 1 ? 's' : ''} {statusFilter !== 'all' ? `(${statusFilter})` : 'registered'}
                  </CardDescription>
                </div>
                {/* Mobile New Work Button */}
                <Button asChild size="sm" className="sm:hidden">
                  <Link href={`${basePath}/new`}>
                    <Plus className="w-4 h-4 mr-1" />
                    New
                  </Link>
                </Button>
              </div>

              {/* Controls Row */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full lg:w-auto">
                {/* Status Filter Dropdown */}
                <Suspense fallback={<div className="w-full sm:w-[140px] h-9 sm:h-10 bg-muted animate-pulse rounded-md" />}>
                  <StatusFilterSelect currentStatus={statusFilter} basePath={basePath} />
                </Suspense>

                {/* Search */}
                <form action={basePath} method="get" className="flex gap-2 flex-1 sm:flex-initial">
                  <input type="hidden" name="status" value={statusFilter} />
                  <Input
                    name="search"
                    placeholder="Search..."
                    defaultValue={search}
                    className="flex-1 sm:w-44 lg:w-52 h-9 sm:h-10 text-sm"
                  />
                  <Button type="submit" variant="outline" size="icon" className="shrink-0 h-9 w-9 sm:h-10 sm:w-10">
                    <Search className="w-4 h-4" />
                  </Button>
                </form>

                {/* Desktop New Work Button */}
                <Button asChild className="hidden sm:inline-flex shrink-0">
                  <Link href={`${basePath}/new`}>
                    <Plus className="w-4 h-4 mr-2" />
                    New Work
                  </Link>
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            {filteredWorks.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <Music className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-muted-foreground mb-3 sm:mb-4" />
                <h3 className="font-semibold mb-1 sm:mb-2 text-sm sm:text-base">
                  {search
                    ? 'No works found'
                    : statusFilter !== 'all'
                      ? `No ${statusFilter} works`
                      : 'No works registered yet'}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                  {search
                    ? 'Try adjusting your search terms'
                    : statusFilter !== 'all'
                      ? `No works with "${statusFilter}" status.`
                      : 'Add your first musical work to get started.'}
                </p>
                {!search && statusFilter === 'all' && (
                  <Button asChild size="sm">
                    <Link href={`${basePath}/new`}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Work
                    </Link>
                  </Button>
                )}
              </div>
            ) : (
              <>
                {/* Mobile Card Layout */}
                <div className="md:hidden space-y-3">
                  {filteredWorks.map((work) => {
                    const deliveryStatus = getApprovalStatus(work);
                    const writersCount = work.work_composers?.length || 0;
                    const isComplete = isWorkComplete(work);

                    return (
                      <Link
                        key={work.id}
                        href={`${basePath}/${work.id}`}
                        className="block p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0">
                            <Music className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0 flex-1">
                                <h3 className="font-semibold text-sm truncate">{work.title}</h3>
                                {work.iswc && (
                                  <p className="text-xs text-muted-foreground font-mono mt-0.5">{work.iswc}</p>
                                )}
                              </div>
                              {/* Status indicator */}
                              <div className="flex items-center gap-1.5 shrink-0">
                                <div className={cn("w-2 h-2 rounded-full", deliveryStatus.bgColor)} />
                                <span className="text-xs text-muted-foreground">{deliveryStatus.label}</span>
                              </div>
                            </div>

                            {/* Writers & Badges Row */}
                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                              {writersCount > 0 ? (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Users className="w-3 h-3" />
                                  <span className="truncate max-w-[150px]">
                                    {work.work_composers.slice(0, 2).map(c => c.composer?.name).filter(Boolean).join(', ')}
                                    {writersCount > 2 && ` +${writersCount - 2}`}
                                  </span>
                                </div>
                              ) : (
                                <Badge variant="outline" className="text-red-600 border-red-300 bg-red-50 text-[10px] px-1.5 py-0 h-5">
                                  Writers Required
                                </Badge>
                              )}
                              {!isComplete && (
                                <Badge variant="outline" className="text-amber-600 border-amber-400 bg-amber-50 text-[10px] px-1.5 py-0 h-5">
                                  Incomplete
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>

                {/* Desktop Table Layout */}
                <div className="hidden md:block">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent border-b-2">
                        <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Title</TableHead>
                        <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Writers</TableHead>
                        <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Performers</TableHead>
                        <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</TableHead>
                        <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Added</TableHead>
                        <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredWorks.map((work) => {
                        const deliveryStatus = getApprovalStatus(work);
                        const writersCount = work.work_composers?.length || 0;
                        const performersCount = work.work_performers?.length || 0;
                        const isComplete = isWorkComplete(work);

                        return (
                          <TableRow key={work.id} className="group hover:bg-muted/30 transition-colors">
                            <TableCell className="py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0 group-hover:from-primary/30 group-hover:to-primary/10 transition-all">
                                  <Music className="w-5 h-5 text-primary" />
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <Link
                                      href={`${basePath}/${work.id}`}
                                      className="font-semibold text-foreground hover:text-primary transition-colors line-clamp-1"
                                    >
                                      {work.title}
                                    </Link>
                                    {!isComplete && (
                                      <Badge variant="outline" className="text-amber-600 border-amber-400 bg-amber-50 text-xs font-medium">
                                        Incomplete
                                      </Badge>
                                    )}
                                  </div>
                                  {work.iswc && (
                                    <div className="text-xs text-muted-foreground font-mono mt-0.5">
                                      {work.iswc}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {writersCount > 0 ? (
                                <div className="flex items-center gap-1.5 text-sm">
                                  <Users className="w-3.5 h-3.5 text-muted-foreground/70" />
                                  <span className="text-foreground/80">
                                    {work.work_composers.slice(0, 2).map(c => c.composer?.name).filter(Boolean).join(', ')}
                                    {writersCount > 2 && <span className="text-muted-foreground"> +{writersCount - 2}</span>}
                                  </span>
                                </div>
                              ) : (
                                <Badge variant="outline" className="text-red-600 border-red-300 bg-red-50 text-xs font-medium">
                                  Required
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              {performersCount > 0 ? (
                                <div className="flex items-center gap-1.5 text-sm">
                                  <Mic2 className="w-3.5 h-3.5 text-muted-foreground/70" />
                                  <span className="text-foreground/80">
                                    {work.work_performers.slice(0, 2).map(p => p.performer_name).join(', ')}
                                    {performersCount > 2 && <span className="text-muted-foreground"> +{performersCount - 2}</span>}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-muted-foreground text-sm">—</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className={cn(
                                  "w-2 h-2 rounded-full",
                                  deliveryStatus.bgColor
                                )} />
                                <span className="text-sm text-foreground/80">
                                  {deliveryStatus.label}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-foreground/60 text-sm">
                              {new Date(work.created_at).toLocaleDateString('en-GB', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  asChild
                                  className="text-muted-foreground hover:text-primary hover:bg-primary/10"
                                >
                                  <Link href={`${basePath}/${work.id}`}>
                                    <Edit3 className="w-3.5 h-3.5 mr-1.5" />
                                    Edit
                                  </Link>
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
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
                </div>
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4 pt-4 border-t gap-2">
                    <div className="text-xs sm:text-sm text-muted-foreground">
                      Page {page} of {totalPages}
                    </div>
                    <div className="flex gap-1 sm:gap-2">
                      {page > 1 && (
                        <Button variant="outline" size="sm" asChild className="h-8 px-2 sm:px-3 text-xs sm:text-sm">
                          <Link
                            href={`${basePath}?${new URLSearchParams({
                              ...(search && { search }),
                              ...(statusFilter !== 'all' && { status: statusFilter }),
                              page: (page - 1).toString(),
                            }).toString()}`}
                          >
                            <ChevronLeft className="w-4 h-4 sm:mr-1" />
                            <span className="hidden sm:inline">Previous</span>
                          </Link>
                        </Button>
                      )}
                      {page < totalPages && (
                        <Button variant="outline" size="sm" asChild className="h-8 px-2 sm:px-3 text-xs sm:text-sm">
                          <Link
                            href={`${basePath}?${new URLSearchParams({
                              ...(search && { search }),
                              ...(statusFilter !== 'all' && { status: statusFilter }),
                              page: (page + 1).toString(),
                            }).toString()}`}
                          >
                            <span className="hidden sm:inline">Next</span>
                            <ChevronRight className="w-4 h-4 sm:ml-1" />
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
  } catch {
    redirect('/dashboard');
  }
}

