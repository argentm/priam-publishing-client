'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { ApiClient } from '@/lib/api/client';
import { API_ENDPOINTS, ROUTES } from '@/lib/constants';
import type { SpotifyArtist } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  Music2,
  Users,
  Instagram,
  Facebook,
  Twitter,
  Check,
  Link2,
  Search,
  Sparkles,
  Pencil,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { StepIndicator, StepIndicatorCompact } from '@/components/onboarding/step-indicator';

export interface AccountCreationData {
  name: string;
  spotify_artist_id?: string;
  social_instagram?: string;
  social_facebook?: string;
  social_twitter?: string;
}

interface AccountCreationWizardProps {
  /**
   * Mode determines the API and navigation behavior:
   * - 'standard': Uses /api/accounts, navigates to workspace
   * - 'onboarding': Uses provided onCreateAccount handler, shows onboarding progress
   */
  mode?: 'standard' | 'onboarding';
  /**
   * Custom account creation handler (required for onboarding mode).
   * Should return the created account ID.
   */
  onCreateAccount?: (data: AccountCreationData) => Promise<{ accountId: string; nextStep?: string }>;
  /**
   * Callback when account creation is complete
   */
  onComplete?: (accountId: string) => void;
  /**
   * Current step in the overall onboarding flow (for step indicators)
   */
  onboardingStep?: number;
  /**
   * Total steps in the overall onboarding flow
   */
  onboardingTotalSteps?: number;
}

interface SearchArtistsResponse {
  artists: SpotifyArtist[];
  total: number;
}

type Step = 1 | 2;

export function AccountCreationWizard({
  mode = 'standard',
  onCreateAccount,
  onComplete,
  onboardingStep = 1,
  onboardingTotalSteps = 2,
}: AccountCreationWizardProps) {
  const router = useRouter();
  const [apiClient, setApiClient] = useState<ApiClient | null>(null);
  const [step, setStep] = useState<Step>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1: Spotify search or manual input
  const [searchMode, setSearchMode] = useState<'spotify' | 'manual'>('spotify');
  const [spotifySearchQuery, setSpotifySearchQuery] = useState('');
  const [spotifyUrl, setSpotifyUrl] = useState('');
  const [searchResults, setSearchResults] = useState<SpotifyArtist[]>([]);
  const [selectedArtist, setSelectedArtist] = useState<SpotifyArtist | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [manualArtistName, setManualArtistName] = useState('');
  const [urlMode, setUrlMode] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Step 2: Social media
  const [instagram, setInstagram] = useState('');
  const [facebook, setFacebook] = useState('');
  const [twitter, setTwitter] = useState('');

  // Initialize API client
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
    if (/^[a-zA-Z0-9]{22}$/.test(cleaned)) return cleaned;
    const uriMatch = cleaned.match(/spotify:artist:([a-zA-Z0-9]{22})/);
    if (uriMatch) return uriMatch[1];
    const urlMatch = cleaned.match(/(?:https?:\/\/)?open\.spotify\.com\/artist\/([a-zA-Z0-9]{22})/);
    if (urlMatch) return urlMatch[1];
    return null;
  };

  // Search Spotify by name
  const searchByName = useCallback(async (query: string) => {
    if (!apiClient || !query.trim()) return;

    setIsSearching(true);
    setError(null);
    setHasSearched(true);

    try {
      const response = await apiClient.get<SearchArtistsResponse>(
        `${API_ENDPOINTS.SPOTIFY_SEARCH_ARTISTS}?q=${encodeURIComponent(query)}&limit=10`
      );
      setSearchResults(response.artists || []);
    } catch (err) {
      const errorMessage = err && typeof err === 'object' && 'message' in err
        ? String((err as { message: string }).message)
        : 'Failed to search Spotify';
      setError(errorMessage);
    } finally {
      setIsSearching(false);
    }
  }, [apiClient]);

  // Search Spotify by URL
  const searchByUrl = async () => {
    if (!apiClient || !spotifyUrl.trim()) return;

    const artistId = extractArtistId(spotifyUrl);
    if (!artistId) {
      setError('Invalid Spotify URL or ID. Please check and try again.');
      return;
    }

    setIsSearching(true);
    setError(null);
    setHasSearched(true);

    try {
      const response = await apiClient.get<{ artist: SpotifyArtist }>(
        API_ENDPOINTS.SPOTIFY_ARTIST(artistId)
      );
      if (response.artist) {
        setSearchResults([response.artist]);
        setSelectedArtist(response.artist);
      }
    } catch (err) {
      const errorMessage = err && typeof err === 'object' && 'message' in err
        ? String((err as { message: string }).message)
        : 'Failed to find artist';
      setError(errorMessage);
    } finally {
      setIsSearching(false);
    }
  };

  // Debounced search on input change
  const handleSearchInputChange = (value: string) => {
    setSpotifySearchQuery(value);
    setSelectedArtist(null);
    setError(null);

    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Don't search if too short
    if (value.trim().length < 2) {
      setSearchResults([]);
      setHasSearched(false);
      return;
    }

    // Debounce search
    debounceTimerRef.current = setTimeout(() => {
      searchByName(value);
    }, 300);
  };

  // Clear search
  const clearSearch = () => {
    setSpotifySearchQuery('');
    setSearchResults([]);
    setSelectedArtist(null);
    setHasSearched(false);
    setError(null);
    searchInputRef.current?.focus();
  };

  // Cleanup debounce timer
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Get artist name for account
  const getArtistName = (): string => {
    if (searchMode === 'manual') return manualArtistName.trim();
    if (selectedArtist) return selectedArtist.name;
    return '';
  };

  // Step 1: Continue to social media
  const handleStep1Next = () => {
    const name = getArtistName();
    if (!name) {
      setError(searchMode === 'manual' ? 'Please enter an artist name' : 'Please select an artist');
      return;
    }
    setError(null);
    setStep(2);
  };

  // Complete: Create account and link everything
  const handleComplete = async () => {
    const artistName = getArtistName();
    if (!artistName) {
      setError('Artist name is required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const accountData: AccountCreationData = {
        name: artistName,
        spotify_artist_id: selectedArtist?.id,
        social_instagram: instagram || undefined,
        social_facebook: facebook || undefined,
        social_twitter: twitter || undefined,
      };

      // Use custom handler for onboarding mode
      if (mode === 'onboarding' && onCreateAccount) {
        const result = await onCreateAccount(accountData);

        if (onComplete) {
          onComplete(result.accountId);
        } else if (result.nextStep === 'verify_identity') {
          router.push(ROUTES.ONBOARDING_VERIFY_IDENTITY);
        } else {
          router.push(ROUTES.DASHBOARD);
        }
        return;
      }

      // Standard mode: use direct API calls
      if (!apiClient) {
        setError('Not authenticated');
        setIsLoading(false);
        return;
      }

      // 1. Create account
      const accountResponse = await apiClient.post<{ account: { id: string } }>('/api/accounts', {
        name: artistName,
      });
      const accountId = accountResponse.account.id;

      // 2. Link Spotify if selected
      if (selectedArtist) {
        await apiClient.post(API_ENDPOINTS.SPOTIFY_LINK, {
          account_id: accountId,
          spotify_artist_id: selectedArtist.id,
        });
      }

      // 3. Save social links if provided
      if (instagram || facebook || twitter) {
        await apiClient.put(API_ENDPOINTS.SPOTIFY_SOCIAL_LINKS, {
          account_id: accountId,
          social_instagram: instagram || null,
          social_facebook: facebook || null,
          social_twitter: twitter || null,
        });
      }

      // 4. Redirect to workspace
      if (onComplete) {
        onComplete(accountId);
      } else {
        router.push(ROUTES.WORKSPACE(accountId));
        router.refresh();
      }
    } catch (err) {
      const errorMessage = err && typeof err === 'object' && 'message' in err
        ? String((err as { message: string }).message)
        : 'Failed to create account';
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  const formatFollowers = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const canProceedStep1 = searchMode === 'manual'
    ? manualArtistName.trim().length > 0
    : selectedArtist !== null;

  // Display step info based on mode
  const displayStep = mode === 'onboarding' ? onboardingStep : step;
  const displayTotalSteps = mode === 'onboarding' ? onboardingTotalSteps : 2;

  // Button label based on mode
  const completeButtonLabel = mode === 'onboarding' ? 'Create Workspace' : 'Complete Setup';

  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-2/5 bg-gradient-to-br from-primary via-primary/90 to-accent/70 p-12 flex-col justify-between relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-secondary rounded-full blur-3xl" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg">
              <Image
                src="/logos/priam-icon.svg"
                alt="Priam"
                width={32}
                height={32}
              />
            </div>
            <span className="text-2xl font-bold text-white">Priam</span>
          </div>
        </div>

        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-2 text-white/80">
            <Sparkles className="w-5 h-5" />
            <span className="text-sm font-medium">Step {displayStep} of {displayTotalSteps}</span>
          </div>
          <h1 className="text-4xl font-bold text-white leading-tight">
            {step === 1 && "Create your workspace"}
            {step === 2 && "Add your social presence"}
          </h1>
          <p className="text-white/80 text-lg max-w-md">
            {step === 1 && "Search Spotify to import your artist profile, or enter your name manually."}
            {step === 2 && "Help fans and collaborators find you across platforms."}
          </p>

          {/* Progress - use onboarding step indicator in onboarding mode */}
          {mode === 'onboarding' ? (
            <StepIndicatorCompact currentStep={displayStep} className="pt-4" />
          ) : (
            <div className="flex gap-2 pt-4">
              {Array.from({ length: displayTotalSteps }, (_, i) => i + 1).map((s) => (
                <div
                  key={s}
                  className={cn(
                    'h-1 rounded-full transition-all duration-300',
                    s <= displayStep ? 'bg-white w-16' : 'bg-white/30 w-10'
                  )}
                />
              ))}
            </div>
          )}
        </div>

        <div className="relative z-10 text-white/60 text-sm">
          &copy; {new Date().getFullYear()} Priam Publishing. All rights reserved.
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-lg">
          {/* Mobile header */}
          <div className="lg:hidden mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                  <Music2 className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">Priam</span>
              </div>
              <span className="text-sm text-muted-foreground">Step {displayStep}/{displayTotalSteps}</span>
            </div>
            {mode === 'onboarding' ? (
              <StepIndicatorCompact currentStep={displayStep} />
            ) : (
              <div className="flex gap-2">
                {Array.from({ length: displayTotalSteps }, (_, i) => i + 1).map((s) => (
                  <div
                    key={s}
                    className={cn(
                      'h-1 rounded-full flex-1 transition-colors',
                      s <= displayStep ? 'bg-primary' : 'bg-muted'
                    )}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Desktop step indicator for onboarding mode */}
          {mode === 'onboarding' && (
            <div className="hidden lg:block mb-8">
              <StepIndicator currentStep={displayStep} completedSteps={[1, 2]} />
            </div>
          )}

          {/* Step 1: Find Artist */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">Create your workspace</h2>
                <p className="text-muted-foreground mt-2">
                  Search Spotify to import your artist profile
                </p>
              </div>

              {searchMode === 'spotify' ? (
                <>
                  {/* Search mode toggle */}
                  <div className="flex gap-2 p-1 bg-muted rounded-lg">
                    <button
                      onClick={() => setUrlMode(false)}
                      className={cn(
                        'flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-colors',
                        !urlMode
                          ? 'bg-background shadow-sm text-foreground'
                          : 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      <Search className="w-4 h-4" />
                      Search name
                    </button>
                    <button
                      onClick={() => setUrlMode(true)}
                      className={cn(
                        'flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-colors',
                        urlMode
                          ? 'bg-background shadow-sm text-foreground'
                          : 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      <Link2 className="w-4 h-4" />
                      Paste URL
                    </button>
                  </div>

                  {/* Search input */}
                  <div className="space-y-3">
                    {!urlMode ? (
                      <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          ref={searchInputRef}
                          placeholder="Start typing to search..."
                          value={spotifySearchQuery}
                          onChange={(e) => handleSearchInputChange(e.target.value)}
                          className="h-12 pl-10 pr-10"
                          autoFocus
                        />
                        {spotifySearchQuery && (
                          <button
                            onClick={clearSearch}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded-full transition-colors"
                          >
                            <X className="w-4 h-4 text-muted-foreground" />
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Input
                          placeholder="https://open.spotify.com/artist/..."
                          value={spotifyUrl}
                          onChange={(e) => setSpotifyUrl(e.target.value)}
                          className="h-12"
                          autoFocus
                        />
                        <Button
                          onClick={searchByUrl}
                          disabled={isSearching || !spotifyUrl.trim()}
                          variant="outline"
                          className="w-full h-10"
                        >
                          {isSearching ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          ) : (
                            <Music2 className="w-4 h-4 mr-2" />
                          )}
                          Fetch Profile
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Search Results */}
                  {!isSearching && searchResults.length > 0 && (
                    <div className="space-y-2 max-h-72 overflow-y-auto">
                      {searchResults.map((artist) => (
                        <Card
                          key={artist.id}
                          className={cn(
                            'cursor-pointer transition-all hover:shadow-md',
                            selectedArtist?.id === artist.id
                              ? 'ring-2 ring-primary bg-primary/5'
                              : 'hover:bg-muted/50'
                          )}
                          onClick={() => setSelectedArtist(artist)}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-center gap-3">
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
                                  {artist.followers?.total !== undefined && (
                                    <span className="flex items-center gap-1">
                                      <Users className="w-3 h-3" />
                                      {formatFollowers(artist.followers.total)}
                                    </span>
                                  )}
                                  {artist.genres && artist.genres.length > 0 && (
                                    <span className="truncate">
                                      · {artist.genres.slice(0, 2).join(', ')}
                                    </span>
                                  )}
                                </div>
                              </div>
                              {selectedArtist?.id === artist.id && (
                                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shrink-0">
                                  <Check className="w-4 h-4 text-white" />
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}

                  {/* Loading skeleton */}
                  {isSearching && (
                    <div className="space-y-2">
                      {[1, 2, 3].map((i) => (
                        <Card key={i}>
                          <CardContent className="p-3">
                            <div className="flex items-center gap-3">
                              <Skeleton className="w-12 h-12 rounded-full" />
                              <div className="flex-1 space-y-2">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-3 w-24" />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}

                  {/* No results */}
                  {!isSearching && hasSearched && searchResults.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className="font-medium">No artists found</p>
                      <p className="text-sm mt-1">Try a different search term or enter the name manually</p>
                    </div>
                  )}

                  {/* Initial state */}
                  {!isSearching && !hasSearched && searchResults.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Music2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>Start typing to search Spotify</p>
                    </div>
                  )}
                </>
              ) : (
                // Manual input mode
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="manualName">Artist name</Label>
                    <Input
                      id="manualName"
                      placeholder="Enter artist name..."
                      value={manualArtistName}
                      onChange={(e) => setManualArtistName(e.target.value)}
                      className="h-12"
                      autoFocus
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    You can connect Spotify later from your account settings.
                  </p>
                </div>
              )}

              {error && (
                <div className="bg-destructive/10 text-destructive text-sm p-4 rounded-lg border border-destructive/20">
                  {error}
                </div>
              )}

              {/* Navigation */}
              <div className="space-y-3 pt-4">
                <Button
                  onClick={handleStep1Next}
                  disabled={!canProceedStep1}
                  className="w-full h-12"
                >
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>

                <button
                  onClick={() => {
                    setSearchMode(searchMode === 'spotify' ? 'manual' : 'spotify');
                    setError(null);
                  }}
                  className="w-full flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
                >
                  {searchMode === 'spotify' ? (
                    <>
                      <Pencil className="w-4 h-4" />
                      Enter name manually
                    </>
                  ) : (
                    <>
                      <Music2 className="w-4 h-4" />
                      Search on Spotify instead
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Social Media */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">Social accounts</h2>
                <p className="text-muted-foreground mt-2">
                  Add your social media profiles (optional)
                </p>
              </div>

              {/* Selected artist preview */}
              {selectedArtist && (
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      {selectedArtist.images?.[0]?.url ? (
                        <Image
                          src={selectedArtist.images[0].url}
                          alt={selectedArtist.name}
                          width={48}
                          height={48}
                          className="rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <Music2 className="w-6 h-6 text-primary" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium">{selectedArtist.name}</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Check className="w-3 h-3 text-green-500" />
                          Spotify connected
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="space-y-4">
                {/* Instagram */}
                <div className="space-y-2">
                  <Label htmlFor="instagram" className="flex items-center gap-2">
                    <Instagram className="w-4 h-4" />
                    Instagram
                  </Label>
                  <Input
                    id="instagram"
                    placeholder="@username"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    className="h-12"
                  />
                </div>

                {/* Facebook */}
                <div className="space-y-2">
                  <Label htmlFor="facebook" className="flex items-center gap-2">
                    <Facebook className="w-4 h-4" />
                    Facebook
                  </Label>
                  <Input
                    id="facebook"
                    placeholder="facebook.com/yourpage"
                    value={facebook}
                    onChange={(e) => setFacebook(e.target.value)}
                    className="h-12"
                  />
                </div>

                {/* Twitter */}
                <div className="space-y-2">
                  <Label htmlFor="twitter" className="flex items-center gap-2">
                    <Twitter className="w-4 h-4" />
                    Twitter / X
                  </Label>
                  <Input
                    id="twitter"
                    placeholder="@username"
                    value={twitter}
                    onChange={(e) => setTwitter(e.target.value)}
                    className="h-12"
                  />
                </div>
              </div>

              {error && (
                <div className="bg-destructive/10 text-destructive text-sm p-4 rounded-lg border border-destructive/20">
                  {error}
                </div>
              )}

              {/* Navigation */}
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => setStep(1)}
                  variant="outline"
                  className="h-12"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button
                  onClick={handleComplete}
                  disabled={isLoading}
                  className="flex-1 h-12"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Sparkles className="w-4 h-4 mr-2" />
                  )}
                  {completeButtonLabel}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
