import { redirect } from 'next/navigation';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { createServerApiClient } from '@/lib/api/server-client';
import { API_ENDPOINTS, ROUTES } from '@/lib/constants';
import { WorkEditor } from '@/components/shared/work-editor';
import type { Work } from '@/lib/types';

interface PageProps {
  params: Promise<{ id: string; workId: string }>;
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

    return (
      <WorkEditor
        work={response.work}
        accountId={id}
        backUrl={ROUTES.WORKSPACE_WORKS(id)}
      />
    );
  } catch {
    redirect(ROUTES.WORKSPACE_WORKS(id));
  }
}
