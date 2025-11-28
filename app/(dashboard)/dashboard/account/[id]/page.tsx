import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { createServerApiClient } from '@/lib/api/server-client';
import { API_ENDPOINTS, ROUTES } from '@/lib/constants';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SpotifyLink } from '@/components/user/spotify-link';
import { SpotifySuggestions } from '@/components/user/spotify-suggestions';
import { AccountTracker } from '@/components/user/account-tracker';
import {
  Music,
  FileText,
  Users,
  ArrowRight,
  Plus,
  Disc,
  Building2,
} from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }>;
}

interface Account {
  id: string;
  name: string;
  client_id?: string | null;
  spotify_artist_id?: string | null;
  spotify_artist_name?: string | null;
  spotify_artist_image_url?: string | null;
  spotify_linked_at?: string | null;
  social_instagram?: string | null;
  social_facebook?: string | null;
  social_twitter?: string | null;
  created_at: string;
  updated_at: string;
}

interface Work {
  id: string;
  title: string;
  created_at: string;
}

interface DashboardAccountResponse {
  account: Account;
  user_role: string;
  members: Array<{
    id: string;
    email: string;
    full_name?: string | null;
    role: string;
  }>;
}

interface WorksResponse {
  works: Work[];
  total: number;
}

export default async function AccountPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createServerClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    redirect('/login');
  }

  try {
    const apiClient = await createServerApiClient();
    
    // Fetch account details and recent works in parallel
    const [accountResponse, worksResponse] = await Promise.all([
      apiClient.get<DashboardAccountResponse>(API_ENDPOINTS.DASHBOARD_ACCOUNT(id)),
      apiClient.get<WorksResponse>(`${API_ENDPOINTS.WORKS}?account_id=${id}&limit=5`),
    ]);

    if (!accountResponse?.account) {
      redirect('/dashboard');
    }

    const { account, user_role, members } = accountResponse;
    const { works = [], total: worksTotal = 0 } = worksResponse || {};

    return (
      <div className="space-y-8">
        {/* Track this account as last visited */}
        <AccountTracker accountId={id} />

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">{account.name}</h1>
                <div className="text-muted-foreground mt-0.5 flex items-center gap-1 flex-wrap">
                  {account.client_id && <span>Client ID: {account.client_id} • </span>}
                  <span>Your role:</span>
                  <Badge variant="outline">{user_role}</Badge>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href={ROUTES.ACCOUNT_WORKS_NEW(id)} className="block">
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Plus className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Register Work</h3>
                    <p className="text-sm text-muted-foreground">Add a new musical work</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href={ROUTES.WORKSPACE_WORKS(id)} className="block">
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
                    <Music className="w-6 h-6 text-orange-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold">View Works</h3>
                    <p className="text-sm text-muted-foreground">{worksTotal} work{worksTotal !== 1 ? 's' : ''}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Card className="hover:shadow-md transition-shadow opacity-60 cursor-not-allowed">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <h3 className="font-semibold">Contracts</h3>
                  <p className="text-sm text-muted-foreground">Coming soon</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow opacity-60 cursor-not-allowed">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <Disc className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <h3 className="font-semibold">Tracks</h3>
                  <p className="text-sm text-muted-foreground">Coming soon</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Works */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Works</CardTitle>
                  <CardDescription>Your latest registered works</CardDescription>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href={ROUTES.WORKSPACE_WORKS(id)}>
                    View all <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {works.length === 0 ? (
                <div className="text-center py-12">
                  <Music className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">No works yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Register your first work to start tracking your music publishing
                  </p>
                  <Button asChild>
                    <Link href={ROUTES.ACCOUNT_WORKS_NEW(id)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Register Work
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {works.map((work) => (
                    <Link
                      key={work.id}
                      href={`/dashboard/account/${id}/works/${work.id}`}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Music className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{work.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(work.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Team Members */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Team
              </CardTitle>
              <CardDescription>
                {members.length} member{members.length !== 1 ? 's' : ''}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {members.map((member) => (
                  <div key={member.id} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      <span className="text-sm font-medium">
                        {(member.full_name || member.email).charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {member.full_name || member.email.split('@')[0]}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">
                        {member.email}
                      </p>
                    </div>
                    <Badge variant="outline" className="shrink-0">
                      {member.role}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Spotify Integration */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SpotifyLink account={account} />
          {account.spotify_artist_id && (
            <SpotifySuggestions account={account} />
          )}
        </div>
      </div>
    );
  } catch (error) {
    console.error('Failed to fetch account:', error);
    redirect('/dashboard');
  }
}

