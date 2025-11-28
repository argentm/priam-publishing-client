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
import { PublisherActions } from '@/components/admin/actions/publisher-actions';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface Publisher {
  id: string;
  name: string;
  cae: string;
  main_pro?: string | null;
  controlled?: boolean;
  account?: {
    id: string;
    name: string;
  };
  created_at: string;
}

interface PublishersResponse {
  publishers: Publisher[];
  total: number;
}

async function getPublishers(search?: string, limit = 50, offset = 0): Promise<PublishersResponse> {
  const client = await createServerApiClient();
  try {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });
    if (search) {
      params.append('search', search);
    }
    return await client.get<PublishersResponse>(`${API_ENDPOINTS.ADMIN_PUBLISHERS}?${params.toString()}`);
  } catch {
    return { publishers: [], total: 0 };
  }
}

export default async function AdminPublishersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string }>;
}) {
  const { search: searchParam, page: pageParam } = await searchParams;
  const search = searchParam || '';
  const page = parseInt(pageParam || '1', 10);
  const limit = 50;
  const offset = (page - 1) * limit;

  const { publishers, total } = await getPublishers(search, limit, offset);
  const totalPages = Math.ceil(total / limit);

  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Publishers</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Manage publisher entities for CWR deliveries and IP chain management
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Publishers</CardTitle>
              <CardDescription>
                {total} publisher{total !== 1 ? 's' : ''} found
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <form action="/admin/publishers" method="get" className="flex gap-2">
                <Input
                  name="search"
                  placeholder="Search by name, CAE..."
                  defaultValue={search}
                  className="w-64"
                />
                <Button type="submit" variant="outline" size="icon">
                  <Search className="w-4 h-4" />
                </Button>
                {search && (
                  <Button type="button" variant="ghost" asChild>
                    <Link href="/admin/publishers">Clear</Link>
                  </Button>
                )}
              </form>
              <Button asChild>
                <Link href="/admin/publishers/new">+ New Publisher</Link>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {publishers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {search ? 'No publishers found matching your search' : 'No publishers found'}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>CAE/IPI</TableHead>
                    <TableHead>Main PRO</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Account</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {publishers.map((publisher) => (
                    <TableRow key={publisher.id}>
                      <TableCell className="font-medium">
                        <Link
                          href={ROUTES.ADMIN_PUBLISHER(publisher.id)}
                          className="hover:underline"
                        >
                          {publisher.name}
                        </Link>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {publisher.cae || '-'}
                      </TableCell>
                      <TableCell>{publisher.main_pro || '-'}</TableCell>
                      <TableCell>
                        {publisher.controlled ? (
                          <Badge variant="default">Controlled</Badge>
                        ) : (
                          <Badge variant="secondary">External</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {publisher.account ? (
                          <Link
                            href={ROUTES.ADMIN_ACCOUNT(publisher.account.id)}
                            className="text-primary hover:underline"
                          >
                            {publisher.account.name}
                          </Link>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>
                        {publisher.created_at
                          ? new Date(publisher.created_at).toLocaleDateString()
                          : 'N/A'}
                      </TableCell>
                      <TableCell className="text-right">
                        <PublisherActions publisher={publisher} />
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
                          href={`/admin/publishers?${new URLSearchParams({
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
                          href={`/admin/publishers?${new URLSearchParams({
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
