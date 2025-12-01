'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { ApiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/constants';
import { sanitizeApiError } from '@/lib/utils/api-errors';
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
      setError(sanitizeApiError(err, 'Failed to load suggestions. Please try again.'));
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
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Disc className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 shrink-0" />
                Song Suggestions
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm mt-1">
                Import songs from {account.spotify_artist_name}&apos;s catalog
              </CardDescription>
            </div>
            <Badge variant="secondary" className="w-fit text-xs">
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
              <div className="h-[350px] sm:h-[400px] overflow-y-auto pr-2 sm:pr-4">
                <div className="space-y-2">
                  {filteredSuggestions.slice(0, displayLimit).map((track) => {
                    const isImported = importedTracks.has(track.spotify_track_id);

                    return (
                      <div
                        key={track.spotify_track_id}
                        className={`p-2 sm:p-3 rounded-lg border transition-colors ${
                          isImported
                            ? 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-900'
                            : 'hover:bg-muted/50'
                        }`}
                      >
                        {/* Mobile: Stacked layout, Desktop: Horizontal */}
                        <div className="flex items-start sm:items-center gap-2 sm:gap-3">
                          {/* Album Art */}
                          {track.album_image_url ? (
                            <Image
                              src={track.album_image_url}
                              alt={track.album_name}
                              width={40}
                              height={40}
                              className="rounded object-cover shrink-0 w-10 h-10 sm:w-12 sm:h-12"
                            />
                          ) : (
                            <div className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 rounded bg-muted flex items-center justify-center">
                              <Disc className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground" />
                            </div>
                          )}

                          {/* Track Info - Takes remaining space */}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm sm:text-base truncate">{track.title}</p>
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs sm:text-sm text-muted-foreground">
                              <span className="truncate max-w-[120px] sm:max-w-none">{track.album_name}</span>
                              <span className="hidden sm:inline">•</span>
                              <span className="flex items-center gap-1 shrink-0">
                                <Clock className="w-3 h-3" />
                                {formatDuration(track.duration_seconds)}
                              </span>
                            </div>
                          </div>

                          {/* Desktop Actions */}
                          <div className="hidden sm:flex items-center gap-2 shrink-0">
                            {track.isrc && (
                              <Badge variant="outline" className="text-xs">
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

                          {/* Mobile: Compact action button */}
                          <div className="sm:hidden shrink-0">
                            {isImported ? (
                              <CheckCircle2 className="w-5 h-5 text-green-600" />
                            ) : (
                              <Button
                                size="sm"
                                className="h-8 px-2"
                                onClick={() => setSelectedTrack(track)}
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
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
