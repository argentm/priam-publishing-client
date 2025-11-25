import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { createServerApiClient } from '@/lib/api/server-client';
import { API_ENDPOINTS, ROUTES } from '@/lib/constants';
import { PayeeActions } from '@/components/admin/actions/payee-actions';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface Payee {
  id: string;
  name: string;
  client_id?: string | null;
  foreign_id?: string | null;
  country?: string | null;
  vat_no?: string | null;
  account?: {
    id: string;
    name: string;
  };
  created_at: string;
}

interface PayeesResponse {
  payees: Payee[];
  total: number;
}

async function getPayees(search?: string, limit = 50, offset = 0): Promise<PayeesResponse> {
  const client = await createServerApiClient();
  try {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });
    if (search) {
      params.append('search', search);
    }
    return await client.get<PayeesResponse>(`${API_ENDPOINTS.ADMIN_PAYEES}?${params.toString()}`);
  } catch {
    return { payees: [], total: 0 };
  }
}

export default async function AdminPayeesPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string }>;
}) {
  const { search: searchParam, page: pageParam } = await searchParams;
  const search = searchParam || '';
  const page = parseInt(pageParam || '1', 10);
  const limit = 50;
  const offset = (page - 1) * limit;

  const { payees, total } = await getPayees(search, limit, offset);
  const totalPages = Math.ceil(total / limit);

  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Payees</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Manage all payees across all accounts
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Payees</CardTitle>
              <CardDescription>
                {total} payee{total !== 1 ? 's' : ''} found
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <form action="/admin/payees" method="get" className="flex gap-2">
              <Input
                name="search"
                placeholder="Search by name, ID..."
                defaultValue={search}
                className="w-64"
              />
              <Button type="submit" variant="outline" size="icon">
                <Search className="w-4 h-4" />
              </Button>
              {search && (
                <Button type="button" variant="ghost" asChild>
                  <Link href="/admin/payees">Clear</Link>
                </Button>
              )}
              </form>
              <Button asChild>
                <Link href="/admin/payees/new">+ New Payee</Link>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {payees.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {search ? 'No payees found matching your search' : 'No payees found'}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Client ID</TableHead>
                    <TableHead>Country</TableHead>
                    <TableHead>VAT No</TableHead>
                    <TableHead>Account</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payees.map((payee) => (
                    <TableRow key={payee.id}>
                      <TableCell className="font-medium">
                        {payee.name}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {payee.client_id || '-'}
                      </TableCell>
                      <TableCell>{payee.country || '-'}</TableCell>
                      <TableCell className="font-mono text-sm">
                        {payee.vat_no || '-'}
                      </TableCell>
                      <TableCell>
                        {payee.account ? (
                          <Link
                            href={ROUTES.ADMIN_ACCOUNT(payee.account.id)}
                            className="text-primary hover:underline"
                          >
                            {payee.account.name}
                          </Link>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>
                        {payee.created_at
                          ? new Date(payee.created_at).toLocaleDateString()
                          : 'N/A'}
                      </TableCell>
                      <TableCell className="text-right">
                        <PayeeActions payee={payee} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Page {page} of {totalPages}
                  </div>
                  <div className="flex gap-2">
                    {page > 1 && (
                      <Button variant="outline" size="sm" asChild>
                        <Link
                          href={`/admin/payees?${new URLSearchParams({
                            ...(search && { search }),
                            page: (page - 1).toString(),
                          }).toString()}`}
                        >
                          <ChevronLeft className="w-4 h-4" />
                          Previous
                        </Link>
                      </Button>
                    )}
                    {page < totalPages && (
                      <Button variant="outline" size="sm" asChild>
                        <Link
                          href={`/admin/payees?${new URLSearchParams({
                            ...(search && { search }),
                            page: (page + 1).toString(),
                          }).toString()}`}
                        >
                          Next
                          <ChevronRight className="w-4 h-4" />
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </>
  );
}
