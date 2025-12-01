'use client';

import { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Save, Loader2, Search, Music } from 'lucide-react';
import { ApiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/constants';
import { createClient } from '@/lib/supabase/client';
import type { AdminTrack } from '../types';

interface AdminTracksSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workId: string;
  accountId: string;
  tracks: AdminTrack[];
  onTracksChange: (tracks: AdminTrack[]) => void;
  onSave: () => Promise<void>;
  saving?: boolean;
}

interface TrackSearchResult {
  id: string;
  title: string;
  isrc?: string | null;
  artist?: string | null;
}

export function AdminTracksSheet({
  open,
  onOpenChange,
  workId,
  accountId,
  tracks,
  onTracksChange,
  onSave,
  saving = false,
}: AdminTracksSheetProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<TrackSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [apiClient, setApiClient] = useState<ApiClient | null>(null);

  const supabase = createClient();

  useEffect(() => {
    const initClient = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setApiClient(new ApiClient(async () => session?.access_token || null));
    };
    initClient();
  }, [supabase]);

  // Search for tracks when query changes
  useEffect(() => {
    const searchTracks = async () => {
      if (!apiClient || searchQuery.length < 2) {
        setSearchResults([]);
        return;
      }

      setSearching(true);
      try {
        const response = await apiClient.get<{ tracks: TrackSearchResult[]; total: number }>(
          `${API_ENDPOINTS.ADMIN_ACCOUNT_TRACKS(accountId)}?search=${encodeURIComponent(searchQuery)}&limit=10`
        );
        // Filter out already linked tracks
        const linkedIds = new Set(tracks.map((t) => t.id));
        setSearchResults(response.tracks.filter((t) => !linkedIds.has(t.id)));
      } catch (error) {
        console.error('Error searching tracks:', error);
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    };

    const debounceTimer = setTimeout(searchTracks, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, apiClient, accountId, tracks]);

  const handleAddTrack = (track: TrackSearchResult) => {
    const newTrack: AdminTrack = {
      id: track.id,
      title: track.title,
      isrc: track.isrc,
      artist: track.artist,
    };
    onTracksChange([...tracks, newTrack]);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleRemoveTrack = (trackId: string) => {
    onTracksChange(tracks.filter((t) => t.id !== trackId));
  };

  const handleSaveAndClose = async () => {
    await onSave();
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Track Associations</SheetTitle>
          <SheetDescription>
            Link tracks/recordings to this work.
          </SheetDescription>
        </SheetHeader>

        <div className="py-6 space-y-6">
          {/* Search for tracks */}
          <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
            <Label className="text-sm font-medium">Search Tracks</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by title or ISRC..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                aria-label="Search tracks"
              />
            </div>

            {/* Search results */}
            {searching && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                Searching...
              </div>
            )}

            {searchResults.length > 0 && (
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {searchResults.map((track) => (
                  <div
                    key={track.id}
                    className="flex items-center justify-between p-2 border rounded hover:bg-muted cursor-pointer"
                    onClick={() => handleAddTrack(track)}
                  >
                    <div className="flex items-center gap-2">
                      <Music className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{track.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {track.artist && `${track.artist} • `}
                          {track.isrc || 'No ISRC'}
                        </p>
                      </div>
                    </div>
                    <Button type="button" size="sm" variant="ghost">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {searchQuery.length >= 2 && !searching && searchResults.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No tracks found. Try a different search term.
              </p>
            )}
          </div>

          {/* Linked tracks list */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              Linked Tracks ({tracks.length})
            </Label>

            {tracks.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No tracks linked yet. Search above to add tracks.
              </p>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {tracks.map((track) => (
                  <div
                    key={track.id}
                    className="flex items-center justify-between p-3 border rounded-lg bg-background"
                  >
                    <div className="flex items-center gap-3">
                      <Music className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{track.title}</p>
                        <div className="flex items-center gap-2">
                          {track.isrc && (
                            <Badge variant="secondary" className="text-xs">
                              {track.isrc}
                            </Badge>
                          )}
                          {track.artist && (
                            <span className="text-xs text-muted-foreground">
                              {track.artist}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveTrack(track.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <SheetFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="button" onClick={handleSaveAndClose} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
