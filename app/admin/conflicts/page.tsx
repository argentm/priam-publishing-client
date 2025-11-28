'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ApiClient } from '@/lib/api/client';
import { createClient } from '@/lib/supabase/client';
import { AlertCircle, CheckCircle2, Eye } from 'lucide-react';
import Link from 'next/link';

export default function AdminConflictsPage() {
  const [conflicts, setConflicts] = useState<any[]>([]);
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
    
    const fetchConflicts = async () => {
      try {
        const data = await apiClient.get<{ conflicts: any[] }>('/api/admin/conflicts?status=unresolved');
        setConflicts(data.conflicts || []);
      } catch (err) {
        console.error('Failed to fetch conflicts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchConflicts();
  }, [apiClient]);

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Work Conflicts</h1>
        <Badge variant="outline">{conflicts.length} Unresolved</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Conflict Queue</CardTitle>
          <CardDescription>Manage overlapping claims and data mismatches.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : conflicts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-green-500" />
              <p>No unresolved conflicts found.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Total Claimed</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {conflicts.map((conflict) => (
                  <TableRow key={conflict.id}>
                    <TableCell className="font-medium">
                      {conflict.match_group?.canonical_title || 'Unknown Work'}
                      {conflict.match_group?.canonical_iswc && (
                        <span className="block text-xs text-muted-foreground font-mono">
                          {conflict.match_group.canonical_iswc}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={conflict.conflict_type === 'overclaim' ? 'destructive' : 'secondary'}>
                        {conflict.conflict_type}
                      </Badge>
                    </TableCell>
                    <TableCell>{conflict.description}</TableCell>
                    <TableCell>
                      <span className={conflict.match_group?.total_claimed_percentage > 100 ? 'text-destructive font-bold' : ''}>
                        {conflict.match_group?.total_claimed_percentage}%
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(conflict.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/conflicts/${conflict.id}`}>
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

