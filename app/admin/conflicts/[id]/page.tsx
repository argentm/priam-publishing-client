'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ApiClient } from '@/lib/api/client';
import { createClient } from '@/lib/supabase/client';
import { ArrowLeft, CheckCircle2, ShieldAlert, User } from 'lucide-react';
import Link from 'next/link';

export default function AdminConflictDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  
  const [conflict, setConflict] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [resolving, setResolving] = useState(false);
  const [notes, setNotes] = useState('');
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
    if (!apiClient || !id) return;
    
    const fetchConflict = async () => {
      try {
        const data = await apiClient.get<{ conflict: any }>(`/api/admin/conflicts/${id}`);
        setConflict(data.conflict);
      } catch (err) {
        console.error('Failed to fetch conflict:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchConflict();
  }, [apiClient, id]);

  const handleResolve = async () => {
    if (!apiClient) return;
    setResolving(true);
    try {
      await apiClient.put(`/api/admin/conflicts/${id}/resolve`, {
        resolution_notes: notes
      });
      router.push('/admin/conflicts');
    } catch (err) {
      console.error('Failed to resolve conflict:', err);
      setResolving(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!conflict) return <div className="p-8 text-center">Conflict not found</div>;

  const group = conflict.match_group;
  const members = group?.members || [];

  return (
    <div className="max-w-5xl mx-auto space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/conflicts">
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Conflict Resolution</h1>
          <p className="text-muted-foreground">
            {group.canonical_title} • {group.canonical_iswc || 'No ISWC'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Conflict Status */}
          <Card className="border-l-4 border-l-destructive">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2 text-destructive">
                    <ShieldAlert className="w-5 h-5" />
                    {conflict.conflict_type === 'overclaim' ? 'Overclaim Detected' : 'Data Mismatch'}
                  </CardTitle>
                  <CardDescription className="mt-2">
                    {conflict.description}
                  </CardDescription>
                </div>
                <Badge variant="destructive" className="text-lg">
                  Total: {group.total_claimed_percentage}%
                </Badge>
              </div>
            </CardHeader>
          </Card>

          {/* Matched Works */}
          <Card>
            <CardHeader>
              <CardTitle>Matched Works ({members.length})</CardTitle>
              <CardDescription>
                These works have been linked based on ISWC/Metadata matching.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {members.map((member: any) => (
                <div key={member.id} className="border rounded-lg p-4 flex justify-between items-center">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{member.work.title}</h3>
                      <Badge variant="outline">{member.work.iswc || 'No ISWC'}</Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="w-4 h-4" />
                      {member.work.account?.name || 'Unknown Account'}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Claimed Ownership</p>
                    <p className="text-2xl font-bold">{member.claimed_ownership}%</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Resolution */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Resolution Notes</label>
                <Textarea 
                  placeholder="Describe how this was resolved..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                />
              </div>
              <Button 
                className="w-full" 
                onClick={handleResolve} 
                disabled={resolving || !notes.trim()}
              >
                {resolving ? 'Resolving...' : 'Mark as Resolved'}
                <CheckCircle2 className="w-4 h-4 ml-2" />
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Resolving will mark the conflict as handled but won't change the data. 
                Ensure percentages are corrected in the respective works first.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

