'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { API_ENDPOINTS, ROUTES } from '@/lib/constants';
import { createClient } from '@/lib/supabase/client';
import { ApiClient } from '@/lib/api/client';
import { sanitizeApiError } from '@/lib/utils/api-errors';
import {
  Save,
  Trash2,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Building2,
  Music2,
  Users,
  Link2,
  BarChart3,
  Search,
  Loader2,
  UserPlus,
  MoreHorizontal,
  Shield,
  Mail,
  Clock,
  X,
  Copy,
  Check,
  Instagram,
  Facebook,
  Twitter,
} from 'lucide-react';
import type { PermissionLevel, AccountMember, AccountInvite, SpotifyArtist } from '@/lib/types';

interface AdminAccount {
  id: string;
  name: string;
  client_id?: string | null;
  spotify_artist_id?: string | null;
  spotify_artist_name?: string | null;
  spotify_artist_image_url?: string | null;
  spotify_linked_at?: string | null;
  social_instagram?: string | null;
  social_facebook?: string | null;
  social_twitter?: string | null;
  created_at: string;
  updated_at: string;
  // Stats (for edit mode)
  works_count?: number;
  tracks_count?: number;
  composers_count?: number;
  members_count?: number;
}

interface AccountEditorProps {
  account: AdminAccount;
  isNew: boolean;
  members?: AccountMember[];
}

export function AccountEditor({ account, isNew, members: initialMembers = [] }: AccountEditorProps) {
  const router = useRouter();
  const supabase = createClient();

  // Form state
  const [formData, setFormData] = useState({
    name: account.name || '',
    client_id: account.client_id || '',
    social_instagram: account.social_instagram || '',
    social_facebook: account.social_facebook || '',
    social_twitter: account.social_twitter || '',
  });

  // Spotify state
  const [spotifySearchQuery, setSpotifySearchQuery] = useState('');
  const [spotifyResults, setSpotifyResults] = useState<SpotifyArtist[]>([]);
  const [selectedArtist, setSelectedArtist] = useState<SpotifyArtist | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Team state
  const [members, setMembers] = useState<AccountMember[]>(initialMembers);
  const [invites, setInvites] = useState<AccountInvite[]>([]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitePermCatalog, setInvitePermCatalog] = useState<PermissionLevel>('edit');
  const [invitePermBusiness, setInvitePermBusiness] = useState<PermissionLevel>('none');
  const [sendingInvite, setSendingInvite] = useState(false);
  const [createdInviteLink, setCreatedInviteLink] = useState<string | null>(null);
  const [copiedInviteId, setCopiedInviteId] = useState<string | null>(null);

  // UI state
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [apiClient, setApiClient] = useState<ApiClient | null>(null);

  // Initialize API client
  useEffect(() => {
    const initClient = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setApiClient(new ApiClient(async () => session?.access_token || null));
    };
    initClient();
  }, [supabase]);

  // Fetch invites for existing accounts
  useEffect(() => {
    if (!isNew && apiClient && account.id) {
      const fetchInvites = async () => {
        try {
          const response = await apiClient.get<{ invites: AccountInvite[] }>(
            API_ENDPOINTS.ACCOUNT_INVITES(account.id)
          );
          setInvites(response.invites || []);
        } catch {
          // Silent fail - invites will be empty
        }
      };
      fetchInvites();
    }
  }, [isNew, apiClient, account.id]);

  // Spotify search with debounce
  const searchSpotify = useCallback(async (query: string) => {
    if (!apiClient || !query.trim()) {
      setSpotifyResults([]);
      return;
    }

    setIsSearching(true);
    setHasSearched(true);

    try {
      const response = await apiClient.get<{ artists: SpotifyArtist[] }>(
        `${API_ENDPOINTS.SPOTIFY_SEARCH_ARTISTS}?q=${encodeURIComponent(query)}&limit=6`
      );
      setSpotifyResults(response.artists || []);
    } catch {
      setSpotifyResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [apiClient]);

  // Debounced search handler
  const handleSpotifySearch = useCallback((query: string) => {
    setSpotifySearchQuery(query);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (query.trim().length >= 2) {
      debounceTimerRef.current = setTimeout(() => {
        searchSpotify(query);
      }, 300);
    } else {
      setSpotifyResults([]);
      setHasSearched(false);
    }
  }, [searchSpotify]);

  // Handle form submission
  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError(null);
    setSuccess(false);

    if (!formData.name.trim()) {
      setError('Account name is required');
      return;
    }

    setSaving(true);

    try {
      if (!apiClient) {
        setError('Not authenticated');
        setSaving(false);
        return;
      }

      const payload = {
        name: formData.name.trim(),
        client_id: formData.client_id.trim() || null,
        social_instagram: formData.social_instagram.trim() || null,
        social_facebook: formData.social_facebook.trim() || null,
        social_twitter: formData.social_twitter.trim() || null,
        ...(isNew && selectedArtist ? {
          spotify_artist_id: selectedArtist.id,
          spotify_artist_name: selectedArtist.name,
          spotify_artist_image_url: selectedArtist.images?.[0]?.url || null,
        } : {}),
      };

      if (isNew) {
        const response = await apiClient.post<{ account: { id: string } }>(
          API_ENDPOINTS.ADMIN_ACCOUNTS,
          payload
        );
        router.push(ROUTES.ADMIN_ACCOUNT(response.account.id));
      } else {
        await apiClient.put(API_ENDPOINTS.ADMIN_ACCOUNT(account.id), payload);
        setSuccess(true);
        setTimeout(() => router.refresh(), 1000);
      }
    } catch (err) {
      setError(sanitizeApiError(err, 'Failed to save account'));
    } finally {
      setSaving(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!apiClient || isNew) return;

    // Check for child entities
    const hasChildren = (account.works_count || 0) > 0 ||
                       (account.tracks_count || 0) > 0 ||
                       (account.composers_count || 0) > 0;

    if (hasChildren) {
      setError(
        `Cannot delete account. It has ${account.works_count || 0} works, ` +
        `${account.tracks_count || 0} tracks, and ${account.composers_count || 0} composers. ` +
        `Delete these first.`
      );
      return;
    }

    if (!confirm('Are you sure you want to delete this account? This cannot be undone.')) {
      return;
    }

    setDeleting(true);
    try {
      await apiClient.delete(API_ENDPOINTS.ADMIN_ACCOUNT(account.id));
      router.push(ROUTES.ADMIN_ACCOUNTS);
    } catch (err) {
      setError(sanitizeApiError(err, 'Failed to delete account'));
      setDeleting(false);
    }
  };

  // Handle send invite
  const handleSendInvite = async () => {
    if (!apiClient || !inviteEmail.trim()) return;
    setSendingInvite(true);
    setError(null);

    try {
      const response = await apiClient.post<{ invite: AccountInvite }>(
        API_ENDPOINTS.ACCOUNT_INVITES(account.id),
        {
          email: inviteEmail.trim().toLowerCase(),
          permissions_catalog: invitePermCatalog,
          permissions_business: invitePermBusiness,
        }
      );
      setInvites(prev => [response.invite, ...prev]);
      setShowInviteModal(false);
      setInviteEmail('');
      setInvitePermCatalog('edit');
      setInvitePermBusiness('none');
      const inviteLink = `${window.location.origin}/invite/${response.invite.token}`;
      setCreatedInviteLink(inviteLink);
    } catch (err) {
      setError(sanitizeApiError(err, 'Failed to send invite'));
    } finally {
      setSendingInvite(false);
    }
  };

  // Handle revoke invite
  const handleRevokeInvite = async (inviteId: string) => {
    if (!apiClient) return;
    try {
      await apiClient.delete(API_ENDPOINTS.ACCOUNT_INVITE(account.id, inviteId));
      setInvites(prev => prev.filter(i => i.id !== inviteId));
    } catch (err) {
      setError(sanitizeApiError(err, 'Failed to revoke invite'));
    }
  };

  // Handle remove member
  const handleRemoveMember = async (userId: string) => {
    if (!apiClient) return;
    if (!confirm('Are you sure you want to remove this member?')) return;

    try {
      await apiClient.delete(API_ENDPOINTS.ACCOUNT_MEMBER(account.id, userId));
      setMembers(prev => prev.filter(m => m.user_id !== userId));
    } catch (err) {
      setError(sanitizeApiError(err, 'Failed to remove member'));
    }
  };

  // Copy to clipboard
  const copyToClipboard = async (text: string, id?: string) => {
    try {
      await navigator.clipboard.writeText(text);
      if (id) {
        setCopiedInviteId(id);
        setTimeout(() => setCopiedInviteId(null), 2000);
      }
    } catch {
      // Silent fail
    }
  };

  // Format followers count
  const formatFollowers = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const displayName = account.name || 'New Account';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={ROUTES.ADMIN_ACCOUNTS} aria-label="Back to accounts">
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold gradient-text">
              {isNew ? 'Add New Account' : displayName}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isNew ? 'Create a new artist or label account' : 'Manage account details and team'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isNew && (
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting || saving}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          )}
          <Button
            onClick={() => handleSubmit()}
            disabled={saving || deleting || !formData.name.trim()}
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : isNew ? 'Create Account' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-destructive/10 border-l-4 border-destructive p-4 text-sm text-destructive">
          <XCircle className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 rounded-xl bg-green-500/10 border-l-4 border-green-500 p-4 text-sm text-green-600">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          Account saved successfully!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information Card */}
        <Card>
          <CardHeader className="bg-gradient-to-r from-primary/5 via-accent/5 to-secondary/5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Building2 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Account name and identifiers</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-xs font-semibold text-foreground/70">
                  Account Name <span className="text-primary">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="Artist or label name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={saving}
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="client_id" className="text-xs font-semibold text-foreground/70">
                  Client ID
                </Label>
                <Input
                  id="client_id"
                  placeholder="External identifier (optional)"
                  value={formData.client_id}
                  onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                  disabled={saving}
                  className="h-12"
                />
                <p className="text-xs text-muted-foreground">
                  Used for external system integration
                </p>
              </div>
            </div>

            {!isNew && account.created_at && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
                <div>
                  <p className="text-xs font-semibold text-foreground/70">Created</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(account.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground/70">Last Updated</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(account.updated_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Spotify Card */}
        <Card>
          <CardHeader className="bg-gradient-to-r from-primary/5 via-accent/5 to-secondary/5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Music2 className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <CardTitle>Spotify Integration</CardTitle>
                <CardDescription>
                  {isNew ? 'Link an artist profile for metadata' : 'Connected artist profile'}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {isNew ? (
              // New account: Show search
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search for an artist on Spotify..."
                    value={spotifySearchQuery}
                    onChange={(e) => handleSpotifySearch(e.target.value)}
                    className="pl-10 h-12"
                    aria-label="Search Spotify artists"
                  />
                  {isSearching && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
                  )}
                </div>

                {selectedArtist && (
                  <div className="flex items-center gap-4 p-4 rounded-lg border bg-green-500/5 border-green-500/20">
                    {selectedArtist.images?.[0] && (
                      <Image
                        src={selectedArtist.images[0].url}
                        alt={selectedArtist.name}
                        width={48}
                        height={48}
                        className="rounded-full"
                      />
                    )}
                    <div className="flex-1">
                      <p className="font-medium">{selectedArtist.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatFollowers(selectedArtist.followers?.total || 0)} followers
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedArtist(null)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}

                {spotifyResults.length > 0 && !selectedArtist && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {spotifyResults.map((artist) => (
                      <button
                        key={artist.id}
                        type="button"
                        onClick={() => {
                          setSelectedArtist(artist);
                          setFormData(prev => ({
                            ...prev,
                            name: prev.name || artist.name,
                          }));
                          setSpotifyResults([]);
                          setSpotifySearchQuery('');
                        }}
                        className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors text-left"
                      >
                        {artist.images?.[0] ? (
                          <Image
                            src={artist.images[0].url}
                            alt={artist.name}
                            width={40}
                            height={40}
                            className="rounded-full"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                            <Music2 className="w-5 h-5 text-muted-foreground" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{artist.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatFollowers(artist.followers?.total || 0)} followers
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {hasSearched && spotifyResults.length === 0 && !isSearching && !selectedArtist && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No artists found. Try a different search.
                  </p>
                )}

                <p className="text-xs text-muted-foreground">
                  Optional: Link a Spotify artist to import metadata and images
                </p>
              </div>
            ) : (
              // Existing account: Show linked artist or empty state
              account.spotify_artist_id ? (
                <div className="flex items-center gap-4">
                  {account.spotify_artist_image_url && (
                    <Image
                      src={account.spotify_artist_image_url}
                      alt={account.spotify_artist_name || 'Artist'}
                      width={64}
                      height={64}
                      className="rounded-full"
                    />
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-lg">{account.spotify_artist_name}</p>
                    <p className="text-sm text-muted-foreground">
                      Linked {account.spotify_linked_at &&
                        new Date(account.spotify_linked_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                    <Music2 className="w-3 h-3 mr-1" />
                    Connected
                  </Badge>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No Spotify artist linked to this account.
                </p>
              )
            )}
          </CardContent>
        </Card>

        {/* Social Links Card */}
        <Card>
          <CardHeader className="bg-gradient-to-r from-primary/5 via-accent/5 to-secondary/5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Link2 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle>Social Links</CardTitle>
                <CardDescription>Artist social media profiles</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="instagram" className="text-xs font-semibold text-foreground/70 flex items-center gap-2">
                  <Instagram className="w-4 h-4" /> Instagram
                </Label>
                <Input
                  id="instagram"
                  placeholder="@username"
                  value={formData.social_instagram}
                  onChange={(e) => setFormData({ ...formData, social_instagram: e.target.value })}
                  disabled={saving}
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="facebook" className="text-xs font-semibold text-foreground/70 flex items-center gap-2">
                  <Facebook className="w-4 h-4" /> Facebook
                </Label>
                <Input
                  id="facebook"
                  placeholder="Page URL or username"
                  value={formData.social_facebook}
                  onChange={(e) => setFormData({ ...formData, social_facebook: e.target.value })}
                  disabled={saving}
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="twitter" className="text-xs font-semibold text-foreground/70 flex items-center gap-2">
                  <Twitter className="w-4 h-4" /> X (Twitter)
                </Label>
                <Input
                  id="twitter"
                  placeholder="@handle"
                  value={formData.social_twitter}
                  onChange={(e) => setFormData({ ...formData, social_twitter: e.target.value })}
                  disabled={saving}
                  className="h-12"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Card (Edit mode only) */}
        {!isNew && (
          <Card>
            <CardHeader className="bg-gradient-to-r from-primary/5 via-accent/5 to-secondary/5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <BarChart3 className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Account Statistics</CardTitle>
                  <CardDescription>Overview of account data</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg bg-muted/50 text-center">
                  <p className="text-2xl font-bold">{account.works_count || 0}</p>
                  <p className="text-sm text-muted-foreground">Works</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50 text-center">
                  <p className="text-2xl font-bold">{account.tracks_count || 0}</p>
                  <p className="text-sm text-muted-foreground">Tracks</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50 text-center">
                  <p className="text-2xl font-bold">{account.composers_count || 0}</p>
                  <p className="text-sm text-muted-foreground">Composers</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50 text-center">
                  <p className="text-2xl font-bold">{members.length}</p>
                  <p className="text-sm text-muted-foreground">Members</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Team Management Card (Edit mode only) */}
        {!isNew && (
          <Card>
            <CardHeader className="bg-gradient-to-r from-primary/5 via-accent/5 to-secondary/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Team Members</CardTitle>
                    <CardDescription>Manage account access</CardDescription>
                  </div>
                </div>
                <Button type="button" onClick={() => setShowInviteModal(true)} disabled={saving}>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Invite
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {/* Members list */}
              {members.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No team members yet. Invite someone to join.
                </p>
              ) : (
                <div className="space-y-2">
                  {members.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">
                            {(member.first_name?.[0] || member.email?.[0] || '?').toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">
                            {member.full_name || member.email}
                          </p>
                          {member.full_name && (
                            <p className="text-xs text-muted-foreground">{member.email}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={member.role === 'owner' ? 'default' : 'secondary'}>
                          {member.role}
                        </Badge>
                        {member.role !== 'owner' && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" aria-label="Member options">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleRemoveMember(member.user_id!)}
                                className="text-destructive"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Remove
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pending invites */}
              {invites.length > 0 && (
                <div className="pt-4 border-t space-y-2">
                  <p className="text-xs font-semibold text-foreground/70">Pending Invites</p>
                  {invites.map((invite) => (
                    <div key={invite.id} className="flex items-center justify-between p-3 rounded-lg border border-dashed bg-muted/20">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
                          <Mail className="w-4 h-4 text-yellow-600" />
                        </div>
                        <div>
                          <p className="font-medium">{invite.email}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            Expires {new Date(invite.expires_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(`${window.location.origin}/invite/${invite.token}`, invite.id)}
                        >
                          {copiedInviteId === invite.id ? (
                            <Check className="w-4 h-4 text-green-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRevokeInvite(invite.id)}
                        >
                          <X className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </form>

      {/* Invite Modal */}
      <Dialog open={showInviteModal} onOpenChange={setShowInviteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
            <DialogDescription>
              Send an invitation to join this account.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="invite-email">Email Address</Label>
              <Input
                id="invite-email"
                type="email"
                placeholder="colleague@example.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Catalog Access</Label>
                <Select value={invitePermCatalog} onValueChange={(v) => setInvitePermCatalog(v as PermissionLevel)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="view">View</SelectItem>
                    <SelectItem value="edit">Edit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Business Access</Label>
                <Select value={invitePermBusiness} onValueChange={(v) => setInvitePermBusiness(v as PermissionLevel)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="view">View</SelectItem>
                    <SelectItem value="edit">Edit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInviteModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendInvite} disabled={sendingInvite || !inviteEmail.trim()}>
              {sendingInvite ? 'Sending...' : 'Send Invite'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Invite Link Modal */}
      <Dialog open={!!createdInviteLink} onOpenChange={(open) => !open && setCreatedInviteLink(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Sent!</DialogTitle>
            <DialogDescription>
              Share this link with the invitee to join the account.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="flex gap-2">
              <Input value={createdInviteLink || ''} readOnly className="font-mono text-sm" />
              <Button
                type="button"
                variant="outline"
                onClick={() => createdInviteLink && copyToClipboard(createdInviteLink)}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setCreatedInviteLink(null)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
