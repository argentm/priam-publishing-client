'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { ApiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/constants';
import type { SpotifySuggestion } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Loader2,
  Clock,
  Disc,
  Calendar,
  Music2,
  ExternalLink,
} from 'lucide-react';

interface SpotifyImportModalProps {
  track: SpotifySuggestion;
  accountId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface ImportResponse {
  work: {
    id: string;
    title: string;
  };
  track?: {
    id: string;
    title: string;
    isrc?: string;
  };
}

export function SpotifyImportModal({
  track,
  accountId,
  open,
  onOpenChange,
  onSuccess,
}: SpotifyImportModalProps) {
  const router = useRouter();
  const [apiClient, setApiClient] = useState<ApiClient | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState(track.title);
  const [performers, setPerformers] = useState(track.performers.join(', '));
  const [createTrack, setCreateTrack] = useState(true);
  const [isOriginalWriter, setIsOriginalWriter] = useState(true);

  // Initialize authenticated API client
  useEffect(() => {
    const initClient = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      setApiClient(new ApiClient(async () => session?.access_token || null));
    };
    initClient();
  }, []);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleImport = async () => {
    if (!apiClient) return;

    setIsImporting(true);
    setError(null);

    try {
      const response = await apiClient.post<ImportResponse>(API_ENDPOINTS.SPOTIFY_IMPORT, {
        account_id: accountId,
        spotify_track_id: track.spotify_track_id,
        is_original_writer: isOriginalWriter,
        work_data: {
          title: title.trim(),
          duration: track.duration_seconds,
          performers: performers
            .split(',')
            .map((p) => p.trim())
            .filter(Boolean),
        },
        create_track: createTrack,
      });

      onSuccess();
      router.refresh();

      // Show success or navigate to work
      if (response.work?.id) {
        // Could navigate to the work page
        // router.push(`/dashboard/account/${accountId}/works/${response.work.id}`);
      }
    } catch (err) {
      if (err instanceof Error && err.message.includes('DUPLICATE_IMPORT')) {
        setError('This track has already been imported as a Work.');
      } else {
        setError(err instanceof Error ? err.message : 'Failed to import track');
      }
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Import from Spotify</DialogTitle>
          <DialogDescription>
            Create a new Work from this Spotify track
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {/* Track Preview */}
          <div className="flex gap-4 p-4 bg-muted/30 rounded-xl border border-border/50">
            {track.album_image_url ? (
              <Image
                src={track.album_image_url}
                alt={track.album_name}
                width={80}
                height={80}
                className="rounded-lg object-cover shadow-sm"
              />
            ) : (
              <div className="w-20 h-20 rounded-lg bg-muted flex items-center justify-center">
                <Disc className="w-10 h-10 text-muted-foreground" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate text-foreground">{track.title}</h3>
              <p className="text-sm text-muted-foreground truncate">
                {track.performers.join(', ')}
              </p>
              <p className="text-sm text-muted-foreground/70 truncate">
                {track.album_name}
              </p>
              <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDuration(track.duration_seconds)}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {track.release_date}
                </span>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="shrink-0" asChild>
              <a
                href={track.spotify_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </Button>
          </div>

          {/* Work Details Form */}
          <div className="space-y-4 min-w-0">
            <div className="space-y-2">
              <Label htmlFor="title">Work Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter work title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="performers">Performers</Label>
              <Input
                id="performers"
                value={performers}
                onChange={(e) => setPerformers(e.target.value)}
                placeholder="Comma-separated performer names"
              />
              <p className="text-xs text-muted-foreground">
                Separate multiple performers with commas
              </p>
            </div>
          </div>

          {/* Options Section */}
          <div className="space-y-3 pt-2 border-t border-border/50">
            <div className="flex items-start gap-3">
              <Checkbox
                id="createTrack"
                checked={createTrack}
                onCheckedChange={(checked) => setCreateTrack(checked === true)}
                className="mt-0.5"
              />
              <div className="space-y-0.5">
                <Label htmlFor="createTrack" className="cursor-pointer font-medium normal-case tracking-normal text-sm">
                  Also create Track record
                </Label>
                <p className="text-xs text-muted-foreground">
                  Creates a Track with ISRC linked to this Work
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Checkbox
                id="isOriginalWriter"
                checked={isOriginalWriter}
                onCheckedChange={(checked) => setIsOriginalWriter(checked === true)}
                className="mt-0.5"
              />
              <div className="space-y-0.5">
                <Label htmlFor="isOriginalWriter" className="cursor-pointer font-medium normal-case tracking-normal text-sm">
                  I am an original writer
                </Label>
                <p className="text-xs text-muted-foreground">
                  Indicates you wrote this composition
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm font-medium">
              {error}
            </div>
          )}
        </div>

        <DialogFooter className="pt-4 border-t border-border/50 gap-2 sm:gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isImporting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={isImporting || !title.trim()}
          >
            {isImporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Music2 className="w-4 h-4" />
                Import as Work
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
