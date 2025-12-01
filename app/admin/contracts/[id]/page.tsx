import { redirect } from 'next/navigation';
import { createServerApiClient } from '@/lib/api/server-client';
import { API_ENDPOINTS } from '@/lib/constants';
import { ContractEditor } from '@/components/admin/editors/contract-editor';

interface Contract {
  id: string;
  payee_id: string;
  account_id: string;
  name: string;
  contract_type?: string | null;
  active?: boolean;
  complete?: boolean;
  start_date?: string | null;
  end_date?: string | null;
  currency?: string | null;
  notes?: string | null;
  payee?: {
    id: string;
    name: string;
  };
  account?: {
    id: string;
    name: string;
  };
  created_at: string;
  updated_at: string;
}

async function getContract(id: string): Promise<Contract | null> {
  const client = await createServerApiClient();
  try {
    const response = await client.get<{ contract: Contract }>(`${API_ENDPOINTS.ADMIN_CONTRACTS}/${id}`);
    return response.contract;
  } catch {
    return null;
  }
}

export default async function ContractDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const contract = await getContract(id);

  if (!contract) {
    redirect('/admin/contracts');
  }

  return (
    <div className="container mx-auto py-6">
      <ContractEditor contract={contract} />
    </div>
  );
}

