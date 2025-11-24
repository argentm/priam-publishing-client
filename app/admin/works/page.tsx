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
import { WorkActions } from '@/components/admin/work-actions';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface Work {
  id: string;
  title: string;
  iswc?: string | null;
  tunecode?: string | null;
  identifier?: string | null;
  valid?: boolean;
  approval_status?: string;
  account?: {
    id: string;
    name: string;
  };
  created_at: string;
}

interface WorksResponse {
  works: Work[];
  total: number;
  limit: number;
  offset: number;
}

async function getWorks(search?: string, limit = 50, offset = 0): Promise<WorksResponse> {
  const client = await createServerApiClient();
  try {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });
    if (search) {
      params.append('search', search);
    }
    return await client.get<WorksResponse>(`${API_ENDPOINTS.ADMIN_WORKS}?${params.toString()}`);
  } catch {
    return { works: [], total: 0, limit, offset };
  }
}

export default async function AdminWorksPage({
  searchParams,
}: {
  searchParams: { search?: string; page?: string };
}) {
  const search = searchParams.search || '';
  const page = parseInt(searchParams.page || '1', 10);
  const limit = 50;
  const offset = (page - 1) * limit;

  const { works, total } = await getWorks(search, limit, offset);
  const totalPages = Math.ceil(total / limit);

  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Works</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Manage all works across all accounts
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Works</CardTitle>
              <CardDescription>
                {total} work{total !== 1 ? 's' : ''} found
              </CardDescription>
            </div>
            <form action="/admin/works" method="get" className="flex gap-2">
              <Input
                name="search"
                placeholder="Search by title, ISWC, tunecode..."
                defaultValue={search}
                className="w-64"
              />
              <Button type="submit" variant="outline" size="icon">
                <Search className="w-4 h-4" />
              </Button>
              {search && (
                <Button type="button" variant="ghost" asChild>
                  <Link href="/admin/works">Clear</Link>
                </Button>
              )}
            </form>
          </div>
        </CardHeader>
        <CardContent>
          {works.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {search ? 'No works found matching your search' : 'No works found'}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>ISWC</TableHead>
                    <TableHead>Account</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {works.map((work) => (
                    <TableRow key={work.id}>
                      <TableCell className="font-medium">
                        {work.title || 'Untitled'}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {work.iswc || '-'}
                      </TableCell>
                      <TableCell>
                        {work.account ? (
                          <Link
                            href={`/dashboard/account/${work.account.id}`}
                            className="text-primary hover:underline"
                          >
                            {work.account.name}
                          </Link>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>
                        {work.valid ? (
                          <span className="text-green-600">Valid</span>
                        ) : (
                          <span className="text-muted-foreground">Invalid</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {work.created_at
                          ? new Date(work.created_at).toLocaleDateString()
                          : 'N/A'}
                      </TableCell>
                      <TableCell className="text-right">
                        <WorkActions work={work} />
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
                          href={`/admin/works?${new URLSearchParams({
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
                          href={`/admin/works?${new URLSearchParams({
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

