'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { API_ENDPOINTS, ROUTES } from '@/lib/constants';
import { createClient } from '@/lib/supabase/client';
import { ApiClient } from '@/lib/api/client';
import { 
  ArrowLeft, 
  Save, 
  CheckCircle2, 
  XCircle, 
  Trash2, 
  Disc3,
  Link2,
  Plus,
  X,
  Music
} from 'lucide-react';

interface Work {
  id: string;
  title: string;
  iswc?: string | null;
}

interface Track {
  id: string;
  account_id: string;
  title: string;
  version?: string | null;
  artist?: string | null;
  isrc: string;
  label?: string | null;
  p_line?: string | null;
  duration?: number | null;
  aliases?: string[];
  works?: {
    work_id: string;
    work: Work | null;
  }[];
  created_at: string;
  updated_at: string;
}

interface UserTrackEditorProps {
  track: Track;
  accountId: string;
  accountName: string;
  availableWorks: Work[];
  isNew?: boolean;
}

export function UserTrackEditor({
  track: initialTrack,
  accountId,
  accountName,
  availableWorks,
  isNew = false,
}: UserTrackEditorProps) {
  const router = useRouter();
  const [track, setTrack] = useState<Track>(initialTrack);
  const [linkedWorkIds, setLinkedWorkIds] = useState<string[]>(
    initialTrack.works?.map(w => w.work_id) || []
  );
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const supabase = createClient();
  const [apiClient, setApiClient] = useState<ApiClient | null>(null);

  useEffect(() => {
    const initClient = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setApiClient(new ApiClient(async () => session?.access_token || null));
    };
    initClient();
  }, [supabase]);

  const handleSave = async () => {
    if (!apiClient) return;

    if (!track.title.trim()) {
      setError('Track title is required');
      return;
    }

    if (!track.isrc.trim()) {
      setError('ISRC is required');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const payload = {
        account_id: accountId,
        title: track.title,
        version: track.version,
        artist: track.artist,
        isrc: track.isrc,
        label: track.label,
        p_line: track.p_line,
        duration: track.duration,
        aliases: track.aliases,
        works: linkedWorkIds,
      };

      if (isNew) {
        const response = await apiClient.post<{ track: Track }>(
          API_ENDPOINTS.TRACKS,
          payload
        );
        router.push(`${ROUTES.WORKSPACE_TRACKS(accountId)}/${response.track.id}`);
      } else {
        await apiClient.put(
          `${API_ENDPOINTS.TRACKS}/${track.id}`,
          payload
        );
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          router.refresh();
        }, 1500);
      }
    } catch (err: any) {
      setError(err.message || `Failed to ${isNew ? 'create' : 'save'} recording`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!apiClient || isNew) return;
    if (!confirm(`Are you sure you want to delete "${track.title}"? This action cannot be undone.`)) return;

    setDeleting(true);
    setError(null);

    try {
      await apiClient.delete(`${API_ENDPOINTS.TRACKS}/${track.id}`);
      router.push(ROUTES.WORKSPACE_TRACKS(accountId));
    } catch (err: any) {
      setError(err.message || 'Failed to delete recording');
      setDeleting(false);
    }
  };

  const updateField = (field: keyof Track, value: any) => {
    setTrack({ ...track, [field]: value });
  };

  const toggleWorkLink = (workId: string) => {
    setLinkedWorkIds(prev => 
      prev.includes(workId) 
        ? prev.filter(id => id !== workId)
        : [...prev, workId]
    );
  };

  const unlinkedWorks = availableWorks.filter(w => !linkedWorkIds.includes(w.id));
  const linkedWorks = availableWorks.filter(w => linkedWorkIds.includes(w.id));

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={ROUTES.WORKSPACE_TRACKS(accountId)}>
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Disc3 className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">
                {isNew ? 'New Recording' : track.title || 'Unnamed Recording'}
              </h1>
              <p className="text-sm text-muted-foreground">{accountName}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isNew && (
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              <Trash2 className="w-4 h-4 mr-2" />
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          )}
          <Button onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : isNew ? 'Create Recording' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Status Messages */}
      {success && (
        <Card className="border-green-500 bg-green-50 dark:bg-green-950">
          <CardContent className="py-4">
            <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
              <CheckCircle2 className="w-5 h-5" />
              <span>Recording saved successfully!</span>
            </div>
          </CardContent>
        </Card>
      )}
      {error && (
        <Card className="border-destructive bg-destructive/5">
          <CardContent className="py-4">
            <div className="flex items-center gap-2 text-destructive">
              <XCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Recording Details</CardTitle>
            <CardDescription>Core recording information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                value={track.title}
                onChange={(e) => updateField('title', e.target.value)}
                placeholder="e.g., My Song"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="version">Version</Label>
              <Input
                id="version"
                value={track.version || ''}
                onChange={(e) => updateField('version', e.target.value || null)}
                placeholder="e.g., Radio Edit, Acoustic Version"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="artist">Artist</Label>
              <Input
                id="artist"
                value={track.artist || ''}
                onChange={(e) => updateField('artist', e.target.value || null)}
                placeholder="e.g., Artist Name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="isrc">
                ISRC <span className="text-destructive">*</span>
              </Label>
              <Input
                id="isrc"
                value={track.isrc}
                onChange={(e) => updateField('isrc', e.target.value)}
                placeholder="e.g., USRC17607839"
                className="font-mono"
                required
              />
              <p className="text-xs text-muted-foreground">
                International Standard Recording Code - unique identifier for this recording
              </p>
            </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (seconds)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={track.duration || ''}
                  onChange={(e) => updateField('duration', e.target.value ? parseInt(e.target.value) : null)}
                  placeholder="e.g., 210"
                />
            </div>
          </CardContent>
        </Card>

        {/* Label & Rights */}
        <Card>
          <CardHeader>
            <CardTitle>Label Information</CardTitle>
            <CardDescription>Release and ownership details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="label">Label</Label>
              <Input
                id="label"
                value={track.label || ''}
                onChange={(e) => updateField('label', e.target.value || null)}
                placeholder="e.g., Record Label Name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="p_line">P-Line</Label>
              <Input
                id="p_line"
                value={track.p_line || ''}
                onChange={(e) => updateField('p_line', e.target.value || null)}
                placeholder="e.g., ℗ 2024 Label Name"
              />
              <p className="text-xs text-muted-foreground">
                Phonographic copyright notice
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Linked Works */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link2 className="w-5 h-5" />
              Linked Works
            </CardTitle>
            <CardDescription>
              Connect this recording to musical works. A recording needs at least one linked work to be complete.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Currently Linked Works */}
            {linkedWorks.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Currently Linked ({linkedWorks.length})</Label>
                <div className="flex flex-wrap gap-2">
                  {linkedWorks.map((work) => (
                    <Badge 
                      key={work.id} 
                      variant="default"
                      className="gap-1 pr-1 cursor-pointer hover:bg-primary/80"
                      onClick={() => toggleWorkLink(work.id)}
                    >
                      <Music className="w-3 h-3" />
                      {work.title}
                      {work.iswc && <span className="text-xs opacity-70">({work.iswc})</span>}
                      <X className="w-3 h-3 ml-1" />
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Available Works to Link */}
            {unlinkedWorks.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Available Works ({unlinkedWorks.length})</Label>
                <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-2 border rounded-md bg-muted/30">
                  {unlinkedWorks.map((work) => (
                    <Badge 
                      key={work.id} 
                      variant="outline"
                      className="gap-1 cursor-pointer hover:bg-primary/10"
                      onClick={() => toggleWorkLink(work.id)}
                    >
                      <Plus className="w-3 h-3" />
                      {work.title}
                      {work.iswc && <span className="text-xs opacity-70">({work.iswc})</span>}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {availableWorks.length === 0 && (
              <div className="text-center py-6 text-muted-foreground">
                <Music className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No works available to link.</p>
                <Button variant="link" asChild className="mt-2">
                  <Link href={ROUTES.ACCOUNT_WORKS_NEW(accountId)}>
                    Create a work first
                  </Link>
                </Button>
              </div>
            )}

            {linkedWorks.length === 0 && availableWorks.length > 0 && (
              <p className="text-sm text-amber-600 flex items-center gap-2">
                <XCircle className="w-4 h-4" />
                No works linked. Click on a work above to link it to this recording.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t">
        <Button variant="outline" asChild>
          <Link href={ROUTES.WORKSPACE_TRACKS(accountId)}>Cancel</Link>
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : isNew ? 'Create Recording' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
}

