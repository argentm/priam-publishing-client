'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ApiClient } from '@/lib/api/client';
import { createClient } from '@/lib/supabase/client';
import { API_ENDPOINTS, ROUTES } from '@/lib/constants';
import {
  CheckCircle2,
  Eye,
  AlertTriangle,
  RefreshCw,
  Play,
  Clock,
  Users,
  Zap,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

// Types for our data
interface MatchGroup {
  id: string;
  canonical_title: string;
  canonical_iswc: string | null;
  total_claimed_ownership: number;
  member_count: number;
}

interface Conflict {
  id: string;
  match_group_id: string;
  conflict_type: 'overclaim' | 'data_mismatch' | 'ownership_dispute';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  resolved: boolean;
  resolved_at: string | null;
  created_at: string;
  match_group: MatchGroup | null;
  affected_accounts?: string[];
}

interface MatchingJob {
  id: string;
  job_type: 'full_scan' | 'incremental';
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  started_at: string | null;
  completed_at: string | null;
  processed_works: number;
  total_works: number;
  matches_found: number;
  conflicts_created: number;
  error_message: string | null;
}

interface MatchingStats {
  total_groups: number;
  total_conflicts: number;
  unresolved_conflicts: number;
  last_job: MatchingJob | null;
}

// Severity badge styling
const severityVariants = {
  low: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  critical: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

// Format relative time
function formatRelativeTime(dateString: string | null): string {
  if (!dateString) return '—';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export default function AdminConflictsPage() {
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [stats, setStats] = useState<MatchingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [startingJob, setStartingJob] = useState(false);
  const [apiClient, setApiClient] = useState<ApiClient | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<'unresolved' | 'resolved' | 'all'>('unresolved');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');

  // Pagination
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const limit = 20;

  // Initialize API client
  useEffect(() => {
    const initClient = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      setApiClient(new ApiClient(async () => session?.access_token || null));
    };
    initClient();
  }, []);

  // Fetch conflicts
  const fetchConflicts = useCallback(async () => {
    if (!apiClient) return;
    setLoading(true);

    try {
      const params = new URLSearchParams({
        status: statusFilter,
        limit: String(limit),
        offset: String(page * limit),
      });

      if (typeFilter !== 'all') {
        params.append('type', typeFilter);
      }
      if (severityFilter !== 'all') {
        params.append('severity', severityFilter);
      }

      const data = await apiClient.get<{ conflicts: Conflict[]; total: number }>(
        `${API_ENDPOINTS.ADMIN_CONFLICTS}?${params.toString()}`
      );
      setConflicts(data.conflicts || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error('Failed to fetch conflicts:', err);
    } finally {
      setLoading(false);
    }
  }, [apiClient, statusFilter, typeFilter, severityFilter, page]);

  // Fetch matching stats
  const fetchStats = useCallback(async () => {
    if (!apiClient) return;

    try {
      const data = await apiClient.get<{ stats: MatchingStats }>(API_ENDPOINTS.ADMIN_MATCHING_STATS);
      setStats(data.stats);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  }, [apiClient]);

  useEffect(() => {
    if (apiClient) {
      fetchConflicts();
      fetchStats();
    }
  }, [apiClient, fetchConflicts, fetchStats]);

  // Start a matching job
  const startMatchingJob = async (jobType: 'full_scan' | 'incremental') => {
    if (!apiClient) return;
    setStartingJob(true);

    try {
      await apiClient.post(API_ENDPOINTS.ADMIN_MATCHING_JOBS, { job_type: jobType });
      // Refresh stats to show new job
      await fetchStats();
    } catch (err: any) {
      console.error('Failed to start matching job:', err);
      alert(err?.message || 'Failed to start matching job');
    } finally {
      setStartingJob(false);
    }
  };

  // Calculate pagination
  const totalPages = Math.ceil(total / limit);
  const canGoBack = page > 0;
  const canGoForward = page < totalPages - 1;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-destructive" />
            Work Conflicts
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage ownership overclaims and data mismatches
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => startMatchingJob('incremental')}
            disabled={startingJob || stats?.last_job?.status === 'running'}
          >
            <Zap className="w-4 h-4 mr-2" />
            Quick Scan
          </Button>
          <Button
            onClick={() => startMatchingJob('full_scan')}
            disabled={startingJob || stats?.last_job?.status === 'running'}
          >
            {startingJob ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Play className="w-4 h-4 mr-2" />
            )}
            Full Scan
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Unresolved</p>
                <p className="text-3xl font-bold text-destructive">
                  {stats?.unresolved_conflicts ?? '—'}
                </p>
              </div>
              <AlertTriangle className="w-10 h-10 text-destructive/20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Conflicts</p>
                <p className="text-3xl font-bold">{stats?.total_conflicts ?? '—'}</p>
              </div>
              <Users className="w-10 h-10 text-muted-foreground/20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Match Groups</p>
                <p className="text-3xl font-bold">{stats?.total_groups ?? '—'}</p>
              </div>
              <Users className="w-10 h-10 text-muted-foreground/20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Last Scan</p>
                <p className="text-lg font-medium">
                  {stats?.last_job?.status === 'running' ? (
                    <span className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Running...
                    </span>
                  ) : (
                    formatRelativeTime(stats?.last_job?.completed_at ?? null)
                  )}
                </p>
                {stats?.last_job?.status === 'running' && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {stats.last_job.processed_works}/{stats.last_job.total_works} works
                  </p>
                )}
              </div>
              <Clock className="w-10 h-10 text-muted-foreground/20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Conflicts List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Conflict Queue</CardTitle>
              <CardDescription>
                Review and resolve ownership conflicts between works
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="overclaim">Overclaim</SelectItem>
                  <SelectItem value="data_mismatch">Data Mismatch</SelectItem>
                  <SelectItem value="ownership_dispute">Dispute</SelectItem>
                </SelectContent>
              </Select>
              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severity</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="ghost"
                size="icon"
                onClick={fetchConflicts}
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={statusFilter} onValueChange={(v) => { setStatusFilter(v as any); setPage(0); }}>
            <TabsList className="mb-4">
              <TabsTrigger value="unresolved">
                Unresolved
                {stats?.unresolved_conflicts ? (
                  <Badge variant="destructive" className="ml-2">
                    {stats.unresolved_conflicts}
                  </Badge>
                ) : null}
              </TabsTrigger>
              <TabsTrigger value="resolved">Resolved</TabsTrigger>
              <TabsTrigger value="all">All</TabsTrigger>
            </TabsList>

            <TabsContent value={statusFilter} className="mt-0">
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">
                  <RefreshCw className="w-6 h-6 mx-auto animate-spin mb-2" />
                  Loading conflicts...
                </div>
              ) : conflicts.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-green-500" />
                  <p className="text-lg font-medium">No conflicts found</p>
                  <p className="text-sm mt-1">
                    {statusFilter === 'unresolved'
                      ? 'All conflicts have been resolved!'
                      : 'Try adjusting your filters'}
                  </p>
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Work</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Severity</TableHead>
                        <TableHead>Total Claimed</TableHead>
                        <TableHead>Affected Accounts</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {conflicts.map((conflict) => (
                        <TableRow key={conflict.id}>
                          <TableCell className="font-medium">
                            <div>
                              {conflict.match_group?.canonical_title || 'Unknown Work'}
                              {conflict.match_group?.canonical_iswc && (
                                <span className="block text-xs text-muted-foreground font-mono">
                                  {conflict.match_group.canonical_iswc}
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={conflict.conflict_type === 'overclaim' ? 'destructive' : 'secondary'}
                            >
                              {conflict.conflict_type.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${severityVariants[conflict.severity]}`}>
                              {conflict.severity}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span
                              className={
                                (conflict.match_group?.total_claimed_ownership ?? 0) > 100
                                  ? 'text-destructive font-bold'
                                  : ''
                              }
                            >
                              {conflict.match_group?.total_claimed_ownership ?? '—'}%
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {conflict.affected_accounts?.slice(0, 2).map((name, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {name}
                                </Badge>
                              ))}
                              {(conflict.affected_accounts?.length ?? 0) > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{(conflict.affected_accounts?.length ?? 0) - 2}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatRelativeTime(conflict.created_at)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="outline" size="sm" asChild>
                              <Link href={ROUTES.ADMIN_CONFLICT(conflict.id)}>
                                <Eye className="w-4 h-4 mr-2" />
                                Review
                              </Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-4 pt-4 border-t">
                      <p className="text-sm text-muted-foreground">
                        Showing {page * limit + 1} to {Math.min((page + 1) * limit, total)} of {total} conflicts
                      </p>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPage(p => p - 1)}
                          disabled={!canGoBack}
                        >
                          <ChevronLeft className="w-4 h-4 mr-1" />
                          Previous
                        </Button>
                        <span className="text-sm text-muted-foreground">
                          Page {page + 1} of {totalPages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPage(p => p + 1)}
                          disabled={!canGoForward}
                        >
                          Next
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
