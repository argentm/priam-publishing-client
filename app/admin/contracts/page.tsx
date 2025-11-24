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
import { API_ENDPOINTS } from '@/lib/constants';
import { ContractActions } from '@/components/admin/contract-actions';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

interface Contract {
  id: string;
  name: string;
  contract_type?: string | null;
  active?: boolean;
  complete?: boolean;
  payee?: {
    id: string;
    name: string;
  };
  account?: {
    id: string;
    name: string;
  };
  created_at: string;
}

interface ContractsResponse {
  contracts: Contract[];
  total: number;
  limit: number;
  offset: number;
}

async function getContracts(search?: string, limit = 50, offset = 0): Promise<ContractsResponse> {
  const client = await createServerApiClient();
  try {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });
    if (search) {
      params.append('search', search);
    }
    return await client.get<ContractsResponse>(`${API_ENDPOINTS.ADMIN_CONTRACTS}?${params.toString()}`);
  } catch {
    return { contracts: [], total: 0, limit, offset };
  }
}

export default async function AdminContractsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string }>;
}) {
  const { search: searchQuery, page: pageQuery } = await searchParams;
  const search = searchQuery || '';
  const page = parseInt(pageQuery || '1', 10);
  const limit = 50;
  const offset = (page - 1) * limit;

  const { contracts, total } = await getContracts(search, limit, offset);
  const totalPages = Math.ceil(total / limit);

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center justify-between w-full">
              <div>
                <CardTitle>All Contracts</CardTitle>
                <CardDescription>
                  {total} contract{total !== 1 ? 's' : ''} found
                </CardDescription>
              </div>
              <Button asChild>
                <Link href="/admin/contracts/new">+ New Contract</Link>
              </Button>
            </div>
            <form action="/admin/contracts" method="get" className="flex gap-2">
              <Input
                name="search"
                placeholder="Search by name..."
                defaultValue={search}
                className="w-64"
              />
              <Button type="submit" variant="outline" size="icon">
                <Search className="w-4 h-4" />
              </Button>
              {search && (
                <Button type="button" variant="ghost" asChild>
                  <Link href="/admin/contracts">Clear</Link>
                </Button>
              )}
            </form>
          </div>
        </CardHeader>
        <CardContent>
          {contracts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {search ? 'No contracts found matching your search' : 'No contracts found'}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Payee</TableHead>
                    <TableHead>Account</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contracts.map((contract) => (
                    <TableRow key={contract.id}>
                      <TableCell className="font-medium">
                        {contract.name || 'Unnamed'}
                      </TableCell>
                      <TableCell>{contract.contract_type || '-'}</TableCell>
                      <TableCell>
                        {contract.payee?.name || '-'}
                      </TableCell>
                      <TableCell>
                        {contract.account ? (
                          <Link
                            href={`/dashboard/account/${contract.account.id}`}
                            className="text-primary hover:underline"
                          >
                            {contract.account.name}
                          </Link>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {contract.active && (
                            <Badge variant="default">Active</Badge>
                          )}
                          {contract.complete && (
                            <Badge variant="secondary">Complete</Badge>
                          )}
                          {!contract.active && !contract.complete && (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {contract.created_at
                          ? new Date(contract.created_at).toLocaleDateString()
                          : 'N/A'}
                      </TableCell>
                      <TableCell className="text-right">
                        <ContractActions contract={contract} />
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
                          href={`/admin/contracts?${new URLSearchParams({
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
                          href={`/admin/contracts?${new URLSearchParams({
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

