import { redirect } from 'next/navigation';
import { createServerApiClient } from '@/lib/api/server-client';
import { API_ENDPOINTS } from '@/lib/constants';
import { PayeeEditor } from '@/components/admin/editors/payee-editor';

interface Payee {
  id: string;
  account_id: string;
  name: string;
  client_id?: string | null;
  foreign_id?: string | null;
  country?: string | null;
  address?: string | null;
  vat_no?: string | null;
  contact_email?: string | null;
  notes?: string | null;
  opening_balance?: number | null;
  min_payout?: number | null;
  payment_currency?: string | null;
  self_billing?: boolean;
  auto_payment?: boolean;
  account?: {
    id: string;
    name: string;
  };
  created_at: string;
  updated_at: string;
}

async function getPayee(id: string): Promise<Payee | null> {
  const client = await createServerApiClient();
  try {
    const response = await client.get<{ payee: Payee }>(`${API_ENDPOINTS.ADMIN_PAYEES}/${id}`);
    return response.payee;
  } catch {
    return null;
  }
}

export default async function PayeeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const payee = await getPayee(id);

  if (!payee) {
    redirect('/admin/payees');
  }

  return (
    <div className="container mx-auto py-6">
      <PayeeEditor payee={payee} />
    </div>
  );
}

