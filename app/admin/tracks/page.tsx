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
import { TrackActions } from '@/components/admin/actions/track-actions';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface Track {
  id: string;
  title: string;
  artist?: string | null;
  isrc: string;
  account?: {
    id: string;
    name: string;
  };
  created_at: string;
}

interface TracksResponse {
  tracks: Track[];
  total: number;
  limit: number;
  offset: number;
}

async function getTracks(search?: string, limit = 50, offset = 0): Promise<TracksResponse> {
  const client = await createServerApiClient();
  try {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });
    if (search) {
      params.append('search', search);
    }
    return await client.get<TracksResponse>(`${API_ENDPOINTS.ADMIN_TRACKS}?${params.toString()}`);
  } catch {
    return { tracks: [], total: 0, limit, offset };
  }
}

export default async function AdminTracksPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string }>;
}) {
  const { search: searchQuery, page: pageQuery } = await searchParams;
  const search = searchQuery || '';
  const page = parseInt(pageQuery || '1', 10);
  const limit = 50;
  const offset = (page - 1) * limit;

  const { tracks, total } = await getTracks(search, limit, offset);
  const totalPages = Math.ceil(total / limit);

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center justify-between w-full">
              <div>
                <CardTitle>All Tracks</CardTitle>
                <CardDescription>
                  {total} track{total !== 1 ? 's' : ''} found
                </CardDescription>
              </div>
              <Button asChild>
                <Link href="/admin/tracks/new">+ New Track</Link>
              </Button>
            </div>
            <form action="/admin/tracks" method="get" className="flex gap-2">
              <Input
                name="search"
                placeholder="Search by title, ISRC, artist..."
                defaultValue={search}
                className="w-64"
              />
              <Button type="submit" variant="outline" size="icon">
                <Search className="w-4 h-4" />
              </Button>
              {search && (
                <Button type="button" variant="ghost" asChild>
                  <Link href="/admin/tracks">Clear</Link>
                </Button>
              )}
            </form>
          </div>
        </CardHeader>
        <CardContent>
          {tracks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {search ? 'No tracks found matching your search' : 'No tracks found'}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Artist</TableHead>
                    <TableHead>ISRC</TableHead>
                    <TableHead>Account</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tracks.map((track) => (
                    <TableRow key={track.id}>
                      <TableCell className="font-medium">
                        {track.title || 'Untitled'}
                      </TableCell>
                      <TableCell>{track.artist || '-'}</TableCell>
                      <TableCell className="font-mono text-sm">
                        {track.isrc || '-'}
                      </TableCell>
                      <TableCell>
                        {track.account ? (
                          <Link
                            href={ROUTES.ADMIN_ACCOUNT(track.account.id)}
                            className="text-primary hover:underline"
                          >
                            {track.account.name}
                          </Link>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>
                        {track.created_at
                          ? new Date(track.created_at).toLocaleDateString()
                          : 'N/A'}
                      </TableCell>
                      <TableCell className="text-right">
                        <TrackActions track={track} />
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
                          href={`/admin/tracks?${new URLSearchParams({
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
                          href={`/admin/tracks?${new URLSearchParams({
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

