import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { createServerApiClient } from '@/lib/api/server-client';
import { API_ENDPOINTS, ROUTES } from '@/lib/constants';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Music, 
  Calendar, 
  User, 
  FileText,
  Hash,
  Clock,
  CheckCircle2,
} from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string; workId: string }>;
}

interface Composer {
  id: string;
  name: string;
  cae?: string | null;
  main_pro?: string | null;
  controlled?: boolean;
}

interface Work {
  id: string;
  title: string;
  iswc?: string | null;
  tunecode?: string | null;
  notes?: string | null;
  priority?: boolean;
  production_library?: boolean;
  grand_rights?: boolean;
  approval_status?: string;
  work_language?: string | null;
  work_description_category?: string | null;
  duration?: number | null;
  version_type?: string | null;
  arrangement_type?: string | null;
  copyright_date?: string | null;
  label_copy?: string | null;
  created_at: string;
  updated_at: string;
  composers?: Array<{ composer: Composer }>;
}

interface WorkResponse {
  work: Work;
}

export default async function WorkDetailPage({ params }: PageProps) {
  const { id, workId } = await params;
  const supabase = await createServerClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    redirect('/login');
  }

  try {
    const apiClient = await createServerApiClient();
    const response = await apiClient.get<WorkResponse>(`${API_ENDPOINTS.WORKS}/${workId}`);

    if (!response?.work) {
      redirect(ROUTES.WORKSPACE_WORKS(id));
    }

    const { work } = response;

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={ROUTES.WORKSPACE_WORKS(id)}>
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight">{work.title}</h1>
            <p className="text-muted-foreground mt-1">
              {work.iswc || work.tunecode || 'No identifier assigned'}
            </p>
          </div>
          <div className="flex gap-2">
            {work.priority && <Badge variant="default">Priority</Badge>}
            {work.production_library && <Badge variant="secondary">Library</Badge>}
            {work.grand_rights && <Badge variant="outline">Grand Rights</Badge>}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Work Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Music className="w-5 h-5" />
                  Work Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Title</p>
                    <p className="font-medium">{work.title}</p>
                  </div>
                  {work.iswc && (
                    <div>
                      <p className="text-sm text-muted-foreground">ISWC</p>
                      <p className="font-mono">{work.iswc}</p>
                    </div>
                  )}
                  {work.tunecode && (
                    <div>
                      <p className="text-sm text-muted-foreground">Tunecode</p>
                      <p className="font-mono">{work.tunecode}</p>
                    </div>
                  )}
                  {work.work_language && (
                    <div>
                      <p className="text-sm text-muted-foreground">Language</p>
                      <p>{work.work_language}</p>
                    </div>
                  )}
                  {work.version_type && (
                    <div>
                      <p className="text-sm text-muted-foreground">Version</p>
                      <p>{work.version_type}</p>
                    </div>
                  )}
                  {work.duration && (
                    <div>
                      <p className="text-sm text-muted-foreground">Duration</p>
                      <p>{Math.floor(work.duration / 60)}:{(work.duration % 60).toString().padStart(2, '0')}</p>
                    </div>
                  )}
                </div>
                {work.notes && (
                  <div>
                    <p className="text-sm text-muted-foreground">Notes</p>
                    <p className="whitespace-pre-wrap">{work.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Writers */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Writers
                </CardTitle>
                <CardDescription>
                  Composers and writers associated with this work
                </CardDescription>
              </CardHeader>
              <CardContent>
                {work.composers && work.composers.length > 0 ? (
                  <div className="space-y-3">
                    {work.composers.map(({ composer }) => (
                      <div 
                        key={composer.id}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            composer.controlled ? 'bg-primary/10 text-primary' : 'bg-muted'
                          }`}>
                            <User className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-medium">{composer.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {composer.cae && <span>CAE: {composer.cae}</span>}
                              {composer.main_pro && <span> • {composer.main_pro}</span>}
                            </p>
                          </div>
                        </div>
                        {composer.controlled && (
                          <Badge variant="default">Controlled</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-6">
                    No writers associated with this work yet
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Approval</span>
                  <Badge variant={work.approval_status === 'Approved' ? 'default' : 'secondary'}>
                    {work.approval_status || 'Pending'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Timeline Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Created</p>
                  <p className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    {new Date(work.created_at).toLocaleDateString()} at{' '}
                    {new Date(work.created_at).toLocaleTimeString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Last Updated</p>
                  <p className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    {new Date(work.updated_at).toLocaleDateString()} at{' '}
                    {new Date(work.updated_at).toLocaleTimeString()}
                  </p>
                </div>
                {work.copyright_date && (
                  <div>
                    <p className="text-sm text-muted-foreground">Copyright Date</p>
                    <p className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      {new Date(work.copyright_date).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Failed to fetch work:', error);
    redirect(ROUTES.WORKSPACE_WORKS(id));
  }
}

