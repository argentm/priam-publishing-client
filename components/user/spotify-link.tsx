'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { ApiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/constants';
import { sanitizeApiError } from '@/lib/utils/api-errors';
import type { SpotifyArtist, AccountWithSpotify } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Music2, Search, Link2, Unlink, Loader2, ExternalLink, Users } from 'lucide-react';

interface SpotifyLinkProps {
  account: AccountWithSpotify;
}

interface SearchArtistsResponse {
  artists: SpotifyArtist[];
  total: number;
}

interface LinkSpotifyResponse {
  account: {
    id: string;
    spotify_artist_id: string;
    spotify_artist_name: string;
    spotify_artist_image_url: string | null;
    spotify_linked_at: string;
  };
}

export function SpotifyLink({ account }: SpotifyLinkProps) {
  const router = useRouter();
  const [apiClient, setApiClient] = useState<ApiClient | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SpotifyArtist[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLinking, setIsLinking] = useState(false);
  const [isUnlinking, setIsUnlinking] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  // Extract Spotify artist ID from URL or URI
  const extractArtistId = (input: string): string | null => {
    const cleaned = input.trim();

    // Raw ID (22 characters, alphanumeric)
    if (/^[a-zA-Z0-9]{22}$/.test(cleaned)) {
      return cleaned;
    }

    // Spotify URI format: spotify:artist:ID
    const uriMatch = cleaned.match(/spotify:artist:([a-zA-Z0-9]{22})/);
    if (uriMatch) {
      return uriMatch[1];
    }

    // Spotify URL format: https://open.spotify.com/artist/ID
    const urlMatch = cleaned.match(
      /(?:https?:\/\/)?open\.spotify\.com\/artist\/([a-zA-Z0-9]{22})/
    );
    if (urlMatch) {
      return urlMatch[1];
    }

    return null;
  };

  const handleSearch = async () => {
    if (!searchQuery.trim() || !apiClient) return;

    setIsSearching(true);
    setError(null);

    try {
      // Check if input is a Spotify URL/URI/ID
      const artistId = extractArtistId(searchQuery);

      if (artistId) {
        // Fetch artist directly by ID
        const response = await apiClient.get<{ artist: SpotifyArtist }>(
          API_ENDPOINTS.SPOTIFY_ARTIST(artistId)
        );
        if (response.artist) {
          setSearchResults([response.artist]);
        } else {
          setSearchResults([]);
          setError('Artist not found');
        }
      } else {
        // Search by name
        const response = await apiClient.get<SearchArtistsResponse>(
          `${API_ENDPOINTS.SPOTIFY_SEARCH_ARTISTS}?q=${encodeURIComponent(searchQuery)}&limit=10`
        );
        setSearchResults(response.artists || []);
      }
    } catch (err) {
      setError(sanitizeApiError(err, 'Failed to search artists. Please try again.'));
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleLink = async (artist: SpotifyArtist) => {
    if (!apiClient) return;

    setIsLinking(true);
    setError(null);

    try {
      await apiClient.post<LinkSpotifyResponse>(API_ENDPOINTS.SPOTIFY_LINK, {
        account_id: account.id,
        spotify_artist_id: artist.id,
      });
      setIsSearchOpen(false);
      setSearchQuery('');
      setSearchResults([]);
      router.refresh();
    } catch (err) {
      setError(sanitizeApiError(err, 'Failed to link artist. Please try again.'));
    } finally {
      setIsLinking(false);
    }
  };

  const handleUnlink = async () => {
    if (!apiClient) return;
    if (!confirm('Are you sure you want to unlink this Spotify artist?')) return;

    setIsUnlinking(true);
    setError(null);

    try {
      await apiClient.delete(API_ENDPOINTS.SPOTIFY_LINK, {
        account_id: account.id,
      });
      router.refresh();
    } catch (err) {
      setError(sanitizeApiError(err, 'Failed to unlink artist. Please try again.'));
    } finally {
      setIsUnlinking(false);
    }
  };

  const formatFollowers = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Music2 className="w-5 h-5 text-green-500" />
              <CardTitle>Spotify Integration</CardTitle>
            </div>
            {isLinked && (
              <Badge variant="outline" className="text-green-600 border-green-600">
                Connected
              </Badge>
            )}
          </div>
          <CardDescription>
            Link your Spotify artist profile to import songs and metadata
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLinked ? (
            <div className="space-y-4">
              {/* Linked Artist Display */}
              <div className="p-4 bg-muted/50 rounded-lg space-y-4">
                {/* Artist info row */}
                <div className="flex items-center gap-3 sm:gap-4">
                  {account.spotify_artist_image_url ? (
                    <Image
                      src={account.spotify_artist_image_url}
                      alt={account.spotify_artist_name || 'Artist'}
                      width={56}
                      height={56}
                      className="rounded-full object-cover shrink-0 w-12 h-12 sm:w-14 sm:h-14"
                    />
                  ) : (
                    <div className="w-12 h-12 sm:w-14 sm:h-14 shrink-0 rounded-full bg-green-500/10 flex items-center justify-center">
                      <Music2 className="w-6 h-6 sm:w-8 sm:h-8 text-green-500" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base sm:text-lg truncate">{account.spotify_artist_name}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Linked {account.spotify_linked_at && new Date(account.spotify_linked_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {/* Actions row - stacked on mobile */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-auto"
                    asChild
                  >
                    <a
                      href={`https://open.spotify.com/artist/${account.spotify_artist_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View on Spotify
                    </a>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-auto"
                    onClick={handleUnlink}
                    disabled={isUnlinking}
                  >
                    {isUnlinking ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Unlink className="w-4 h-4 mr-2" />
                        Unlink Artist
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                <Music2 className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="font-semibold mb-2">No artist linked</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Connect your Spotify artist profile to easily import your songs
              </p>
              <Button onClick={() => setIsSearchOpen(true)}>
                <Link2 className="w-4 h-4 mr-2" />
                Link Spotify Artist
              </Button>
            </div>
          )}

          {error && (
            <p className="text-sm text-destructive mt-4">{error}</p>
          )}
        </CardContent>
      </Card>

      {/* Search Dialog */}
      <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Link Spotify Artist</DialogTitle>
            <DialogDescription>
              Search for your Spotify artist profile to link it to this account
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Search Input */}
            <div className="flex gap-2">
              <Input
                placeholder="Search artist name or paste Spotify URL..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                aria-label="Search Spotify artists"
              />
              <Button onClick={handleSearch} disabled={isSearching || !apiClient}>
                {isSearching ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
              </Button>
            </div>

            {/* Search Results */}
            <div className="max-h-80 overflow-y-auto space-y-2">
              {searchResults.length === 0 && !isSearching && searchQuery && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No artists found. Try a different search.
                </p>
              )}

              {searchResults.map((artist) => (
                <div
                  key={artist.id}
                  className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => !isLinking && handleLink(artist)}
                >
                  {artist.images?.[0]?.url ? (
                    <Image
                      src={artist.images[0].url}
                      alt={artist.name}
                      width={48}
                      height={48}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                      <Music2 className="w-6 h-6 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{artist.name}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {artist.followers?.total && (
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {formatFollowers(artist.followers.total)}
                        </span>
                      )}
                      {artist.genres?.[0] && (
                        <Badge variant="secondary" className="text-xs">
                          {artist.genres[0]}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    disabled={isLinking}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLink(artist);
                    }}
                  >
                    {isLinking ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      'Link'
                    )}
                  </Button>
                </div>
              ))}
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
