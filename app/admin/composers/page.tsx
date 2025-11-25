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
import { ComposerActions } from '@/components/admin/composer-actions';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface Composer {
  id: string;
  name: string;
  first_name?: string | null;
  surname?: string | null;
  cae?: string | null;
  main_pro?: string | null;
  account?: {
    id: string;
    name: string;
  };
  created_at: string;
}

interface ComposersResponse {
  composers: Composer[];
  total: number;
}

async function getComposers(search?: string, limit = 50, offset = 0): Promise<ComposersResponse> {
  const client = await createServerApiClient();
  try {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });
    if (search) {
      params.append('search', search);
    }
    return await client.get<ComposersResponse>(`${API_ENDPOINTS.ADMIN_COMPOSERS}?${params.toString()}`);
  } catch {
    return { composers: [], total: 0 };
  }
}

export default async function AdminComposersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string }>;
}) {
  const { search: searchParam, page: pageParam } = await searchParams;
  const search = searchParam || '';
  const page = parseInt(pageParam || '1', 10);
  const limit = 50;
  const offset = (page - 1) * limit;

  const { composers, total } = await getComposers(search, limit, offset);
  const totalPages = Math.ceil(total / limit);

  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Composers</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Manage all composers across all accounts
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Composers</CardTitle>
              <CardDescription>
                {total} composer{total !== 1 ? 's' : ''} found
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <form action="/admin/composers" method="get" className="flex gap-2">
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
                  <Link href="/admin/composers">Clear</Link>
                </Button>
              )}
              </form>
              <Button asChild>
                <Link href="/admin/composers/new">+ New Composer</Link>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {composers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {search ? 'No composers found matching your search' : 'No composers found'}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>CAE</TableHead>
                    <TableHead>PRO</TableHead>
                    <TableHead>Account</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {composers.map((composer) => (
                    <TableRow key={composer.id}>
                      <TableCell className="font-medium">
                        {composer.name}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {composer.cae || '-'}
                      </TableCell>
                      <TableCell>{composer.main_pro || '-'}</TableCell>
                      <TableCell>
                        {composer.account ? (
                          <Link
                            href={ROUTES.ADMIN_ACCOUNT(composer.account.id)}
                            className="text-primary hover:underline"
                          >
                            {composer.account.name}
                          </Link>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>
                        {composer.created_at
                          ? new Date(composer.created_at).toLocaleDateString()
                          : 'N/A'}
                      </TableCell>
                      <TableCell className="text-right">
                        <ComposerActions composer={composer} />
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
                          href={`/admin/composers?${new URLSearchParams({
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
                          href={`/admin/composers?${new URLSearchParams({
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

