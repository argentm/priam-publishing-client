'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { API_ENDPOINTS, ROUTES } from '@/lib/constants';
import { createClient } from '@/lib/supabase/client';
import { ApiClient } from '@/lib/api/client';
import { Save, Trash2, ArrowLeft, CheckCircle2, XCircle } from 'lucide-react';
import Link from 'next/link';

interface Track {
  id: string;
  account_id: string;
  foreign_id?: string | null;
  title: string;
  version?: string | null;
  artist?: string | null;
  isrc: string;
  fuga_id?: string | null;
  label?: string | null;
  p_line?: string | null;
  payees_count?: number;
  aliases?: string[];
  duration?: number | null;
  default_release_id?: string | null;
  statutory_rate?: number | null;
  report_mechanicals?: boolean;
  release_specific_foreign_ids?: Record<string, unknown> | null;
  created_by?: string | null;
  last_modified_by?: string | null;
  created_at: string;
  updated_at: string;
  account?: {
    id: string;
    name: string;
  };
}

interface TrackEditorProps {
  track: Track;
  isNew?: boolean;
}

export function TrackEditor({ track: initialTrack, isNew = false }: TrackEditorProps) {
  const router = useRouter();
  const [track, setTrack] = useState<Track>(initialTrack);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
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
    
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      if (isNew) {
        const response = await apiClient.post<{ track: Track }>(API_ENDPOINTS.ADMIN_TRACKS, {
          account_id: track.account_id,
          title: track.title,
          isrc: track.isrc,
          artist: track.artist,
          version: track.version,
          foreign_id: track.foreign_id,
          fuga_id: track.fuga_id,
          label: track.label,
          p_line: track.p_line,
          duration: track.duration,
          statutory_rate: track.statutory_rate,
          report_mechanicals: track.report_mechanicals,
        });
        router.push(`${ROUTES.ADMIN_TRACKS}/${response.track.id}`);
      } else {
        await apiClient.put(`${API_ENDPOINTS.ADMIN_TRACKS}/${track.id}`, track);
        setSuccess(true);
        setTimeout(() => {
          router.refresh();
        }, 1000);
      }
    } catch (err: any) {
      setError(err.message || `Failed to ${isNew ? 'create' : 'save'} track`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!apiClient || isNew) return;
    if (!confirm(`Are you sure you want to delete "${track.title}"? This action cannot be undone.`)) {
      return;
    }

    setLoading(true);
    try {
      await apiClient.delete(`${API_ENDPOINTS.ADMIN_TRACKS}/${track.id}`);
      router.push(ROUTES.ADMIN_TRACKS);
    } catch (err: any) {
      setError(err.message || 'Failed to delete track');
      setLoading(false);
    }
  };

  const updateField = (field: keyof Track, value: any) => {
    setTrack({ ...track, [field]: value });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={ROUTES.ADMIN_TRACKS}>
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{track.title || 'Untitled Track'}</h1>
            <p className="text-sm text-muted-foreground">
              {track.account?.name && (
                <>
                  Account: <Link href={ROUTES.ADMIN_ACCOUNT(track.account.id)} className="text-primary hover:underline">{track.account.name}</Link>
                </>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isNew && (
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={loading}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          )}
          <Button onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <Card className="border-green-500 bg-green-50 dark:bg-green-950">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
              <CheckCircle2 className="w-5 h-5" />
              <span>Track saved successfully!</span>
            </div>
          </CardContent>
        </Card>
      )}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive">
              <XCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Editor */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column */}
        <Card>
          <CardHeader>
            <CardTitle>TRACK INFORMATION</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">TITLE <span className="text-destructive">*</span></Label>
              <Input
                id="title"
                value={track.title}
                onChange={(e) => updateField('title', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="artist">ARTIST</Label>
              <Input
                id="artist"
                value={track.artist || ''}
                onChange={(e) => updateField('artist', e.target.value || null)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="version">VERSION</Label>
              <Input
                id="version"
                value={track.version || ''}
                onChange={(e) => updateField('version', e.target.value || null)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="isrc">ISRC <span className="text-destructive">*</span></Label>
              <Input
                id="isrc"
                value={track.isrc}
                onChange={(e) => updateField('isrc', e.target.value)}
                required
                placeholder="USRC17607839"
              />
              <p className="text-xs text-muted-foreground">
                International Standard Recording Code
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fuga_id">FUGA ID</Label>
              <Input
                id="fuga_id"
                value={track.fuga_id || ''}
                onChange={(e) => updateField('fuga_id', e.target.value || null)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="label">LABEL</Label>
              <Input
                id="label"
                value={track.label || ''}
                onChange={(e) => updateField('label', e.target.value || null)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="p_line">P-LINE</Label>
              <Input
                id="p_line"
                value={track.p_line || ''}
                onChange={(e) => updateField('p_line', e.target.value || null)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">DURATION (seconds)</Label>
              <Input
                id="duration"
                type="number"
                value={track.duration || ''}
                onChange={(e) => updateField('duration', e.target.value ? parseInt(e.target.value) : null)}
                min={0}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="statutory_rate">STATUTORY RATE</Label>
              <Input
                id="statutory_rate"
                type="number"
                step="0.01"
                value={track.statutory_rate || ''}
                onChange={(e) => updateField('statutory_rate', e.target.value ? parseFloat(e.target.value) : null)}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="report_mechanicals"
                checked={track.report_mechanicals || false}
                onCheckedChange={(checked) => updateField('report_mechanicals', checked)}
              />
              <Label htmlFor="report_mechanicals">REPORT MECHANICALS</Label>
            </div>
          </CardContent>
        </Card>

        {/* Right Column */}
        <Card>
          <CardHeader>
            <CardTitle>ADDITIONAL INFORMATION</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="foreign_id">FOREIGN ID</Label>
              <Input
                id="foreign_id"
                value={track.foreign_id || ''}
                onChange={(e) => updateField('foreign_id', e.target.value || null)}
              />
            </div>

            <div className="space-y-2">
              <Label>PAYEES COUNT</Label>
              <Input
                type="number"
                value={track.payees_count || 0}
                readOnly
                className="bg-muted"
              />
            </div>

            <div className="space-y-2">
              <Label>ALIASES</Label>
              <div className="flex flex-wrap gap-2">
                {track.aliases && track.aliases.length > 0 ? (
                  track.aliases.map((alias, idx) => (
                    <span key={idx} className="px-2 py-1 bg-muted rounded text-sm">
                      {alias}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">No aliases</span>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>CREATED</Label>
              <Input
                value={track.created_at ? new Date(track.created_at).toLocaleString() : 'N/A'}
                readOnly
                className="bg-muted"
              />
            </div>

            <div className="space-y-2">
              <Label>LAST UPDATED</Label>
              <Input
                value={track.updated_at ? new Date(track.updated_at).toLocaleString() : 'N/A'}
                readOnly
                className="bg-muted"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

