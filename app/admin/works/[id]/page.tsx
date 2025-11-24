import { redirect } from 'next/navigation';
import { createServerApiClient } from '@/lib/api/server-client';
import { API_ENDPOINTS } from '@/lib/constants';
import { WorkEditor } from '@/components/admin/work-editor';

interface Work {
  id: string;
  account_id: string;
  client_id?: string | null;
  foreign_id?: string | null;
  project_id?: string | null;
  identifier?: string | null;
  party_no?: number | null;
  title: string;
  tunecode?: string | null;
  iswc?: string | null;
  notes?: string | null;
  contract_validation?: string | null;
  duplicated_from?: string | null;
  grand_rights?: boolean;
  priority?: boolean;
  production_library?: boolean;
  work_language?: string | null;
  work_description_category?: string | null;
  duration?: number | null;
  composite_type?: string | null;
  composite_count?: number;
  version_type?: string | null;
  arrangement_type?: string | null;
  lyric_adaption_type?: string | null;
  original_work_title?: string | null;
  original_iswc?: string | null;
  original_work_writer_last_name?: string | null;
  original_work_writer_first_name?: string | null;
  original_work_source?: string | null;
  submitter_work_nos?: Record<string, unknown> | null;
  valid?: boolean;
  validation_errors?: string[];
  approval_status?: string;
  approved_date?: string | null;
  on_hold?: boolean;
  total_collection?: Record<string, unknown> | null;
  total_participation?: number;
  identifier_no?: number | null;
  copyright_date?: string | null;
  label_copy?: string | null;
  significant_update_date?: string | null;
  rights_chain?: Record<string, unknown> | null;
  force_redelivery?: string[];
  hold_redelivery?: string[];
  in_future_delivery?: string[];
  campaign_ids?: string[];
  created_by?: string | null;
  last_modified_by?: string | null;
  created_at: string;
  updated_at: string;
  account?: {
    id: string;
    name: string;
  };
}

interface WorkResponse {
  work: Work;
}

async function getWork(id: string): Promise<Work | null> {
  const client = await createServerApiClient();
  try {
    const response = await client.get<WorkResponse>(`${API_ENDPOINTS.ADMIN_WORKS}/${id}`);
    return response.work;
  } catch {
    return null;
  }
}

export default async function WorkDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const work = await getWork(id);

  if (!work) {
    redirect('/admin/works');
  }

  return (
    <div className="container mx-auto py-6">
      <WorkEditor work={work} />
    </div>
  );
}

