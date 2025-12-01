'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ApiClient } from '@/lib/api/client';
import { createClient } from '@/lib/supabase/client';
import { API_ENDPOINTS, ROUTES } from '@/lib/constants';
import {
  ArrowLeft,
  CheckCircle2,
  ShieldAlert,
  User,
  Building2,
  Music,
  AlertTriangle,
  XCircle,
  ArrowUpCircle,
  RefreshCw,
  Clock,
  MessageSquare,
  History,
  ExternalLink,
  RotateCcw,
  Eye,
  Edit,
  FileText,
} from 'lucide-react';

// Severity badge styling
const severityVariants = {
  low: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  critical: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

// Dismissal reasons
const DISMISSAL_REASONS = {
  different_works: 'These are different works with similar titles',
  false_positive: 'False positive - data is actually correct',
  publisher_confirmed: 'Publisher confirmed ownership is correct',
  resolved_externally: 'Resolved externally (out of system)',
  other: 'Other reason',
};

// Escalation types
const ESCALATION_TYPES = {
  legal: 'Legal Review',
  publisher: 'Publisher Verification',
  external_audit: 'External Audit',
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

// Format full date
function formatDate(dateString: string | null): string {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleString();
}

// Activity action icons
const activityIcons: Record<string, React.ReactNode> = {
  viewed: <Eye className="w-4 h-4 text-muted-foreground" />,
  resolved: <CheckCircle2 className="w-4 h-4 text-green-500" />,
  dismissed: <XCircle className="w-4 h-4 text-yellow-500" />,
  escalated: <ArrowUpCircle className="w-4 h-4 text-orange-500" />,
  correction_requested: <MessageSquare className="w-4 h-4 text-blue-500" />,
  reopened: <RotateCcw className="w-4 h-4 text-purple-500" />,
};

export default function AdminConflictDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [conflict, setConflict] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [apiClient, setApiClient] = useState<ApiClient | null>(null);

  // Resolution form state
  const [activeAction, setActiveAction] = useState<'resolve' | 'dismiss' | 'escalate' | 'correction' | null>(null);
  const [notes, setNotes] = useState('');
  const [dismissReason, setDismissReason] = useState('');
  const [escalateTo, setEscalateTo] = useState('');

  // Initialize API client
  useEffect(() => {
    const initClient = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      setApiClient(new ApiClient(async () => session?.access_token || null));
    };
    initClient();
  }, []);

  // Fetch conflict details
  const fetchConflict = useCallback(async () => {
    if (!apiClient || !id) return;

    try {
      const data = await apiClient.get<{ conflict: any }>(API_ENDPOINTS.ADMIN_CONFLICT(id));
      setConflict(data.conflict);
    } catch (err) {
      console.error('Failed to fetch conflict:', err);
    } finally {
      setLoading(false);
    }
  }, [apiClient, id]);

  // Fetch activity history
  const fetchHistory = useCallback(async () => {
    if (!apiClient || !id) return;

    try {
      const data = await apiClient.get<{ activities: any[] }>(API_ENDPOINTS.ADMIN_CONFLICT_HISTORY(id));
      setActivities(data.activities || []);
    } catch (err) {
      console.error('Failed to fetch history:', err);
    }
  }, [apiClient, id]);

  useEffect(() => {
    if (apiClient) {
      fetchConflict();
      fetchHistory();
    }
  }, [apiClient, fetchConflict, fetchHistory]);

  // Resolution actions
  const handleResolve = async () => {
    if (!apiClient || !notes.trim()) return;
    setActionLoading(true);

    try {
      await apiClient.put(API_ENDPOINTS.ADMIN_CONFLICT_RESOLVE(id), {
        resolution_notes: notes,
      });
      router.push(ROUTES.ADMIN_CONFLICTS);
    } catch (err) {
      console.error('Failed to resolve conflict:', err);
      alert('Failed to resolve conflict');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDismiss = async () => {
    if (!apiClient || !dismissReason || !notes.trim()) return;
    setActionLoading(true);

    try {
      await apiClient.put(API_ENDPOINTS.ADMIN_CONFLICT_DISMISS(id), {
        reason: dismissReason,
        notes,
      });
      router.push(ROUTES.ADMIN_CONFLICTS);
    } catch (err) {
      console.error('Failed to dismiss conflict:', err);
      alert('Failed to dismiss conflict');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEscalate = async () => {
    if (!apiClient || !escalateTo || !notes.trim()) return;
    setActionLoading(true);

    try {
      await apiClient.put(API_ENDPOINTS.ADMIN_CONFLICT_ESCALATE(id), {
        escalate_to: escalateTo,
        notes,
      });
      await fetchConflict();
      await fetchHistory();
      setActiveAction(null);
      setNotes('');
      setEscalateTo('');
    } catch (err) {
      console.error('Failed to escalate conflict:', err);
      alert('Failed to escalate conflict');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReopen = async () => {
    if (!apiClient) return;
    setActionLoading(true);

    try {
      await apiClient.put(API_ENDPOINTS.ADMIN_CONFLICT_REOPEN(id), {
        reason: 'Conflict requires additional review',
      });
      await fetchConflict();
      await fetchHistory();
    } catch (err) {
      console.error('Failed to reopen conflict:', err);
      alert('Failed to reopen conflict');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <RefreshCw className="w-6 h-6 mx-auto animate-spin mb-2" />
        Loading conflict details...
      </div>
    );
  }

  if (!conflict) {
    return (
      <div className="p-8 text-center">
        <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-destructive" />
        <p className="text-lg font-medium">Conflict not found</p>
        <Button variant="outline" className="mt-4" asChild>
          <Link href={ROUTES.ADMIN_CONFLICTS}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Conflicts
          </Link>
        </Button>
      </div>
    );
  }

  const group = conflict.match_group;
  const members = group?.members || [];
  const isResolved = conflict.resolved;

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={ROUTES.ADMIN_CONFLICTS}>
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">Conflict Resolution</h1>
              {isResolved ? (
                <Badge variant="outline" className="text-green-600 border-green-600">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Resolved
                </Badge>
              ) : (
                <Badge variant="destructive">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Unresolved
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground">
              {group?.canonical_title} {group?.canonical_iswc && `• ${group.canonical_iswc}`}
            </p>
          </div>
        </div>
        {isResolved && (
          <Button variant="outline" onClick={handleReopen} disabled={actionLoading}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Reopen
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Conflict Status Card */}
          <Card className={`border-l-4 ${isResolved ? 'border-l-green-500' : 'border-l-destructive'}`}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <CardTitle className="flex items-center gap-2">
                    <ShieldAlert className={`w-5 h-5 ${isResolved ? 'text-green-500' : 'text-destructive'}`} />
                    {conflict.conflict_type === 'overclaim'
                      ? 'Ownership Overclaim'
                      : conflict.conflict_type === 'data_mismatch'
                        ? 'Data Mismatch'
                        : 'Ownership Dispute'}
                  </CardTitle>
                  <CardDescription>{conflict.description}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${severityVariants[conflict.severity as keyof typeof severityVariants]}`}>
                    {conflict.severity}
                  </span>
                  <Badge variant="destructive" className="text-lg">
                    {group?.total_claimed_ownership}%
                  </Badge>
                </div>
              </div>
            </CardHeader>
            {isResolved && conflict.resolution_notes && (
              <CardContent>
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-1">Resolution Notes</p>
                  <p className="text-sm">{conflict.resolution_notes}</p>
                  {conflict.resolved_by_user && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Resolved by {conflict.resolved_by_user.full_name || conflict.resolved_by_user.email} on{' '}
                      {formatDate(conflict.resolved_at)}
                    </p>
                  )}
                </div>
              </CardContent>
            )}
          </Card>

          {/* Matched Works */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Music className="w-5 h-5" />
                Matched Works ({members.length})
              </CardTitle>
              <CardDescription>
                These works have been linked based on ISWC/metadata matching
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {members.map((member: any) => {
                  const work = member.work;
                  const composers = work?.composers || [];

                  return (
                    <div
                      key={member.id}
                      className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{work?.title || 'Unknown'}</h3>
                            <Badge variant="outline" className="font-mono text-xs">
                              {work?.iswc || 'No ISWC'}
                            </Badge>
                            <Button variant="ghost" size="sm" className="h-6 px-2" asChild>
                              <Link href={`/admin/works/${work?.id}`}>
                                <ExternalLink className="w-3 h-3 mr-1" />
                                View
                              </Link>
                            </Button>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Building2 className="w-4 h-4" />
                              {work?.account?.name || 'Unknown Account'}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {formatRelativeTime(work?.created_at)}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Claimed</p>
                          <p className="text-2xl font-bold">{member.claimed_ownership}%</p>
                        </div>
                      </div>

                      {/* Composers */}
                      {composers.length > 0 && (
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-xs text-muted-foreground mb-2">Writers</p>
                          <div className="flex flex-wrap gap-2">
                            {composers.map((wc: any, i: number) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                <User className="w-3 h-3 mr-1" />
                                {wc.composer?.name || 'Unknown'}
                                {wc.composer?.cae && (
                                  <span className="ml-1 opacity-60 font-mono">
                                    ({wc.composer.cae})
                                  </span>
                                )}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Match method */}
                      <div className="mt-3 pt-3 border-t flex items-center justify-between text-xs text-muted-foreground">
                        <span>
                          Match method: <span className="font-medium">{member.match_method || 'unknown'}</span>
                        </span>
                        <span>
                          Confidence: <span className="font-medium">{member.match_confidence || 0}%</span>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Actions & History */}
        <div className="space-y-6">
          {/* Actions Card */}
          {!isResolved && (
            <Card>
              <CardHeader>
                <CardTitle>Resolution Actions</CardTitle>
                <CardDescription>Choose how to resolve this conflict</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={activeAction || 'select'} onValueChange={(v) => setActiveAction(v === 'select' ? null : v as any)}>
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="resolve" className="text-xs">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Resolve
                    </TabsTrigger>
                    <TabsTrigger value="dismiss" className="text-xs">
                      <XCircle className="w-3 h-3 mr-1" />
                      Dismiss
                    </TabsTrigger>
                  </TabsList>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="escalate" className="text-xs">
                      <ArrowUpCircle className="w-3 h-3 mr-1" />
                      Escalate
                    </TabsTrigger>
                    <TabsTrigger value="correction" className="text-xs">
                      <Edit className="w-3 h-3 mr-1" />
                      Request Fix
                    </TabsTrigger>
                  </TabsList>

                  {/* Resolve Tab */}
                  <TabsContent value="resolve" className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label>Resolution Notes *</Label>
                      <Textarea
                        placeholder="Describe how the conflict was resolved..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={4}
                      />
                    </div>
                    <Button
                      className="w-full"
                      onClick={handleResolve}
                      disabled={actionLoading || !notes.trim()}
                    >
                      {actionLoading ? (
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                      )}
                      Mark as Resolved
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      Use this when the ownership percentages have been corrected and sum to 100%.
                    </p>
                  </TabsContent>

                  {/* Dismiss Tab */}
                  <TabsContent value="dismiss" className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label>Dismissal Reason *</Label>
                      <Select value={dismissReason} onValueChange={setDismissReason}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select reason..." />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(DISMISSAL_REASONS).map(([key, label]) => (
                            <SelectItem key={key} value={key}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Additional Notes *</Label>
                      <Textarea
                        placeholder="Explain why this is being dismissed..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={3}
                      />
                    </div>
                    <Button
                      className="w-full"
                      variant="secondary"
                      onClick={handleDismiss}
                      disabled={actionLoading || !dismissReason || !notes.trim()}
                    >
                      {actionLoading ? (
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <XCircle className="w-4 h-4 mr-2" />
                      )}
                      Dismiss Conflict
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      Use this for false positives or when the match is incorrect.
                    </p>
                  </TabsContent>

                  {/* Escalate Tab */}
                  <TabsContent value="escalate" className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label>Escalate To *</Label>
                      <Select value={escalateTo} onValueChange={setEscalateTo}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select department..." />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(ESCALATION_TYPES).map(([key, label]) => (
                            <SelectItem key={key} value={key}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Escalation Notes *</Label>
                      <Textarea
                        placeholder="Describe why escalation is needed..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={3}
                      />
                    </div>
                    <Button
                      className="w-full"
                      variant="outline"
                      onClick={handleEscalate}
                      disabled={actionLoading || !escalateTo || !notes.trim()}
                    >
                      {actionLoading ? (
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <ArrowUpCircle className="w-4 h-4 mr-2" />
                      )}
                      Escalate for Review
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      Use when the conflict requires external verification or legal review.
                    </p>
                  </TabsContent>

                  {/* Request Correction Tab */}
                  <TabsContent value="correction" className="space-y-4 mt-4">
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-sm">
                        This will notify account owners to review and correct their ownership claims.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label>Message to Accounts</Label>
                      <Textarea
                        placeholder="Message to send to account owners..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={4}
                      />
                    </div>
                    <Button
                      className="w-full"
                      variant="outline"
                      disabled={actionLoading || !notes.trim()}
                    >
                      {actionLoading ? (
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <MessageSquare className="w-4 h-4 mr-2" />
                      )}
                      Send Correction Request
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      Account owners will receive a notification to update their work data.
                    </p>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}

          {/* Activity History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5" />
                Activity History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px] pr-4">
                {activities.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No activity recorded yet
                  </p>
                ) : (
                  <div className="space-y-4">
                    {activities.map((activity: any) => (
                      <div key={activity.id} className="flex gap-3">
                        <div className="mt-1">
                          {activityIcons[activity.action] || (
                            <FileText className="w-4 h-4 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm">
                            <span className="font-medium capitalize">
                              {activity.action.replace('_', ' ')}
                            </span>
                            {activity.actor && (
                              <span className="text-muted-foreground">
                                {' '}by {activity.actor?.full_name || activity.actor?.email || 'Unknown'}
                              </span>
                            )}
                          </p>
                          {activity.details && Object.keys(activity.details).length > 0 && (
                            <p className="text-xs text-muted-foreground mt-0.5 truncate">
                              {activity.details.notes || activity.details.reason || JSON.stringify(activity.details)}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatRelativeTime(activity.created_at)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Conflict Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Conflict Details</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">ID</span>
                <span className="font-mono text-xs">{conflict.id.slice(0, 8)}...</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created</span>
                <span>{formatDate(conflict.created_at)}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Match Group</span>
                <span className="font-mono text-xs">{group?.id?.slice(0, 8)}...</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Group Confidence</span>
                <span>{group?.group_confidence || 0}%</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
