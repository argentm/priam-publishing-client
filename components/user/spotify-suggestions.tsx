'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { ApiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/constants';
import type { SpotifySuggestion, AccountWithSpotify } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Music2,
  Search,
  Loader2,
  Plus,
  Clock,
  Disc,
  ExternalLink,
  ChevronDown,
  CheckCircle2,
} from 'lucide-react';
import { SpotifyImportModal } from './spotify-import-modal';

interface SpotifySuggestionsProps {
  account: AccountWithSpotify;
}

interface GetSuggestionsResponse {
  suggestions: SpotifySuggestion[];
  total: number;
  artist: {
    id: string;
    name: string;
    image_url: string | null;
  };
}

export function SpotifySuggestions({ account }: SpotifySuggestionsProps) {
  const [apiClient, setApiClient] = useState<ApiClient | null>(null);
  const [suggestions, setSuggestions] = useState<SpotifySuggestion[]>([]);
  const [filteredSuggestions, setFilteredSuggestions] = useState<SpotifySuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [displayLimit, setDisplayLimit] = useState(20);
  const [selectedTrack, setSelectedTrack] = useState<SpotifySuggestion | null>(null);
  const [importedTracks, setImportedTracks] = useState<Set<string>>(new Set());

  const isLinked = !!account.spotify_artist_id;

  // Initialize authenticated API client
  useEffect(() => {
    const initClient = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      setApiClient(new ApiClient(async () => session?.access_token || null));
    };
    initClient();
  }, []);

  const fetchSuggestions = useCallback(async () => {
    if (!isLinked || !apiClient) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.get<GetSuggestionsResponse>(
        `${API_ENDPOINTS.SPOTIFY_SUGGESTIONS}?account_id=${account.id}&limit=100`
      );
      setSuggestions(response.suggestions || []);
      setFilteredSuggestions(response.suggestions || []);
    } catch (err) {
      // Handle ApiError objects from ApiClient
      const errorMessage = err && typeof err === 'object' && 'message' in err
        ? String((err as { message: string }).message)
        : err instanceof Error
          ? err.message
          : 'Failed to load suggestions';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [account.id, isLinked, apiClient]);

  useEffect(() => {
    fetchSuggestions();
  }, [fetchSuggestions]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredSuggestions(suggestions);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredSuggestions(
        suggestions.filter(
          (s) =>
            s.title.toLowerCase().includes(query) ||
            s.album_name.toLowerCase().includes(query) ||
            s.performers.some((p) => p.toLowerCase().includes(query))
        )
      );
    }
    setDisplayLimit(20);
  }, [searchQuery, suggestions]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleImportSuccess = (trackId: string) => {
    setImportedTracks((prev) => new Set(prev).add(trackId));
    setSelectedTrack(null);
  };

  if (!isLinked) {
    return null;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Disc className="w-5 h-5 text-green-500" />
                Song Suggestions
              </CardTitle>
              <CardDescription>
                Import songs from {account.spotify_artist_name}&apos;s Spotify catalog
              </CardDescription>
            </div>
            <Badge variant="secondary">
              {filteredSuggestions.length} available
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-destructive mb-4">{error}</p>
              <Button variant="outline" onClick={fetchSuggestions}>
                Try Again
              </Button>
            </div>
          ) : suggestions.length === 0 ? (
            <div className="text-center py-8">
              <Music2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">No suggestions available</h3>
              <p className="text-sm text-muted-foreground">
                All songs may have already been imported, or no tracks found.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Filter songs by title, album, or artist..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Song List */}
              <div className="h-[400px] overflow-y-auto pr-4">
                <div className="space-y-2">
                  {filteredSuggestions.slice(0, displayLimit).map((track) => {
                    const isImported = importedTracks.has(track.spotify_track_id);

                    return (
                      <div
                        key={track.spotify_track_id}
                        className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                          isImported
                            ? 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-900'
                            : 'hover:bg-muted/50'
                        }`}
                      >
                        {/* Album Art */}
                        {track.album_image_url ? (
                          <Image
                            src={track.album_image_url}
                            alt={track.album_name}
                            width={48}
                            height={48}
                            className="rounded object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded bg-muted flex items-center justify-center">
                            <Disc className="w-6 h-6 text-muted-foreground" />
                          </div>
                        )}

                        {/* Track Info */}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{track.title}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span className="truncate">{track.album_name}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1 shrink-0">
                              <Clock className="w-3 h-3" />
                              {formatDuration(track.duration_seconds)}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 shrink-0">
                          {track.isrc && (
                            <Badge variant="outline" className="text-xs hidden sm:flex">
                              ISRC
                            </Badge>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            asChild
                          >
                            <a
                              href={track.spotify_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Open in Spotify"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </Button>
                          {isImported ? (
                            <Button variant="ghost" size="sm" disabled>
                              <CheckCircle2 className="w-4 h-4 mr-1 text-green-600" />
                              Imported
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => setSelectedTrack(track)}
                            >
                              <Plus className="w-4 h-4 mr-1" />
                              Import
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Load More */}
                {displayLimit < filteredSuggestions.length && (
                  <div className="flex justify-center pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setDisplayLimit((prev) => prev + 20)}
                    >
                      <ChevronDown className="w-4 h-4 mr-2" />
                      Load More ({filteredSuggestions.length - displayLimit} remaining)
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Import Modal */}
      {selectedTrack && (
        <SpotifyImportModal
          track={selectedTrack}
          accountId={account.id}
          open={!!selectedTrack}
          onOpenChange={(open) => !open && setSelectedTrack(null)}
          onSuccess={() => handleImportSuccess(selectedTrack.spotify_track_id)}
        />
      )}
    </>
  );
}
