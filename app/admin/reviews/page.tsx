'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ApiClient } from '@/lib/api/client';
import { createClient } from '@/lib/supabase/client';
import { API_ENDPOINTS } from '@/lib/constants';
import type { Work } from '@/lib/types';
import { CheckCircle2, Eye, Clock, Music } from 'lucide-react';

// Format relative time (e.g., "5 minutes ago")
function formatRelativeTime(dateString: string | null | undefined): string {
  if (!dateString) return '—';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  return date.toLocaleDateString();
}

interface PendingWork extends Work {
  account?: {
    id: string;
    name: string;
  };
}

export default function AdminReviewsPage() {
  const [works, setWorks] = useState<PendingWork[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiClient, setApiClient] = useState<ApiClient | null>(null);

  useEffect(() => {
    const initClient = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      setApiClient(new ApiClient(async () => session?.access_token || null));
    };
    initClient();
  }, []);

  useEffect(() => {
    if (!apiClient) return;

    const fetchPendingWorks = async () => {
      try {
        const data = await apiClient.get<{ works: PendingWork[]; total: number }>(
          API_ENDPOINTS.ADMIN_WORKS_PENDING
        );
        setWorks(data.works || []);
      } catch (err) {
        console.error('Failed to fetch pending works:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingWorks();
  }, [apiClient]);

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Review Queue</h1>
          <p className="text-muted-foreground mt-1">Works submitted for admin review</p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          {works.length} Pending
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music className="w-5 h-5" />
            Submitted Works
          </CardTitle>
          <CardDescription>Review and approve or reject works submitted by users</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : works.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-green-500" />
              <p className="text-lg font-medium">All caught up!</p>
              <p className="text-sm mt-1">No works pending review.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Work</TableHead>
                  <TableHead>Account</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {works.map((work) => (
                  <TableRow key={work.id}>
                    <TableCell className="font-medium">
                      <div>
                        {work.title}
                        {work.iswc && (
                          <span className="block text-xs text-muted-foreground font-mono">
                            {work.iswc}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {work.account?.name || 'Unknown Account'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        {formatRelativeTime(work.submitted_at || work.updated_at)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="default" size="sm" asChild>
                        <Link href={`/admin/works/${work.id}`}>
                          <Eye className="w-4 h-4 mr-2" />
                          Review
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
