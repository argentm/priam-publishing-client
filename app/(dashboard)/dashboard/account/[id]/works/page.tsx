import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { createServerApiClient } from '@/lib/api/server-client';
import { API_ENDPOINTS, ROUTES } from '@/lib/constants';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Music, FileText, Calendar, ArrowRight } from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }>;
}

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

export default async function WorksPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createServerClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    redirect('/login');
  }

  try {
    const apiClient = await createServerApiClient();
    
    // Fetch account and works in parallel
    const [accountResponse, worksResponse] = await Promise.all([
      apiClient.get<DashboardAccountResponse>(API_ENDPOINTS.DASHBOARD_ACCOUNT(id)),
      apiClient.get<WorksResponse>(`${API_ENDPOINTS.WORKS}?account_id=${id}&limit=50`),
    ]);

    if (!accountResponse?.account) {
      redirect('/dashboard');
    }

    const { account } = accountResponse;
    const { works = [], total = 0 } = worksResponse || {};

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Works</h1>
            <p className="text-muted-foreground mt-1">
              {total} work{total !== 1 ? 's' : ''} in {account.name}
            </p>
          </div>
          <Button asChild>
            <Link href={ROUTES.ACCOUNT_WORKS_NEW(id)}>
              <Plus className="w-4 h-4 mr-2" />
              Register Work
            </Link>
          </Button>
        </div>

        {/* Works Grid */}
        {works.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Music className="w-16 h-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No works yet</h3>
              <p className="text-muted-foreground text-center mb-6 max-w-md">
                Register your first musical work to start managing your publishing rights and royalties.
              </p>
              <Button asChild>
                <Link href={ROUTES.ACCOUNT_WORKS_NEW(id)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Register Your First Work
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {works.map((work) => (
              <Card key={work.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Music className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg truncate">{work.title}</CardTitle>
                        <CardDescription className="truncate">
                          {work.iswc || work.tunecode || 'No identifier'}
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {work.priority && (
                      <Badge variant="default">Priority</Badge>
                    )}
                    {work.production_library && (
                      <Badge variant="secondary">Library</Badge>
                    )}
                    {work.grand_rights && (
                      <Badge variant="outline">Grand Rights</Badge>
                    )}
                    {work.approval_status && (
                      <Badge variant={work.approval_status === 'Approved' ? 'default' : 'secondary'}>
                        {work.approval_status}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(work.created_at).toLocaleDateString()}</span>
                    </div>
                    <Link 
                      href={`/dashboard/account/${id}/works/${work.id}`}
                      className="text-primary hover:underline flex items-center gap-1"
                    >
                      View <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error('Failed to fetch works:', error);
    redirect('/dashboard');
  }
}

