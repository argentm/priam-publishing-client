'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { API_ENDPOINTS, ROUTES } from '@/lib/constants';
import { createClient } from '@/lib/supabase/client';
import { ApiClient } from '@/lib/api/client';
import { Save, Trash2, Copy, CheckCircle2, XCircle, AlertCircle, ArrowLeft, Loader2, Plus, Globe, ChevronDown, ChevronRight, MessageSquareX } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import Link from 'next/link';
import { AdminAlternateTitlesSheet, AdminPerformersSheet, AdminTracksSheet, AdminWritersSheet, AdminPublishersSheet } from './sheets';
import type { AdminAlternateTitle, AdminPerformer, AdminTrack, AdminWriter, EditorMode } from './types';
import { WRITER_ROLES, SYSTEM_PRIAM_PUBLISHER_ID } from '@/components/shared/work-wizard/constants';

interface Work {
  id: string;
  account_id: string;
  client_id?: string | null;
  foreign_id?: string | null;
  project_id?: string | null;
  identifier?: string | null;
  party_no?: number | null;
  title: string;
  tunecode?: string | null;
  iswc?: string | null;
  notes?: string | null;
  contract_validation?: string | null;
  duplicated_from?: string | null;
  grand_rights?: boolean;
  priority?: boolean;
  production_library?: boolean;
  work_language?: string | null;
  work_description_category?: string | null;
  duration?: number | null;
  composite_type?: string | null;
  composite_count?: number;
  version_type?: string | null;
  arrangement_type?: string | null;
  lyric_adaption_type?: string | null;
  original_work_title?: string | null;
  original_iswc?: string | null;
  original_work_writer_last_name?: string | null;
  original_work_writer_first_name?: string | null;
  original_work_source?: string | null;
  submitter_work_nos?: Record<string, unknown> | null;
  valid?: boolean;
  validation_errors?: string[];
  approval_status?: string;
  approved_date?: string | null;
  rejection_reason?: string | null;
  reviewed_at?: string | null;
  reviewed_by?: string | null;
  on_hold?: boolean;
  total_collection?: Record<string, unknown> | null;
  total_participation?: number;
  identifier_no?: number | null;
  copyright_date?: string | null;
  label_copy?: string | null;
  significant_update_date?: string | null;
  rights_chain?: Record<string, unknown> | null;
  force_redelivery?: string[];
  hold_redelivery?: string[];
  in_future_delivery?: string[];
  campaign_ids?: string[];
  created_by?: string | null;
  last_modified_by?: string | null;
  created_at: string;
  updated_at: string;
  account?: {
    id: string;
    name: string;
  };
  // Related data from API
  alternate_titles?: Array<{
    id: string;
    title: string;
    title_type?: string | null;
    language?: string | null;
  }>;
  composers?: Array<{
    id: string;
    composer_id: string;
    role?: string | null;
    share?: number | null;
    composer: {
      id: string;
      name: string;
      cae?: string | null;
      main_pro?: string | null;
      controlled?: boolean;
    };
  }>;
  performers?: Array<{
    id: string;
    performer_name: string;
  }>;
  tracks?: Array<{
    id: string;
    track_id: string;
    track: {
      id: string;
      title: string;
      isrc?: string | null;
      artist?: string | null;
    };
  }>;
}

interface WorkEditorProps {
  work: Work;
  isNew?: boolean;
}

export function WorkEditor({ work: initialWork, isNew = false }: WorkEditorProps) {
  const router = useRouter();
  const [work, setWork] = useState<Work>(initialWork);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Sheet visibility states
  const [showAlternateTitlesSheet, setShowAlternateTitlesSheet] = useState(false);
  const [showPerformersSheet, setShowPerformersSheet] = useState(false);
  const [showTracksSheet, setShowTracksSheet] = useState(false);
  const [showWritersSheet, setShowWritersSheet] = useState(false);

  // Rejection modal state
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  // Related data states - initialized from work prop
  const [alternateTitles, setAlternateTitles] = useState<AdminAlternateTitle[]>(
    initialWork.alternate_titles?.map((at, i) => ({
      id: at.id,
      tempId: `alt-${at.id || i}`,
      title: at.title,
      title_type: at.title_type,
      language: at.language,
    })) || []
  );

  const [performers, setPerformers] = useState<AdminPerformer[]>(
    initialWork.performers?.map((p, i) => ({
      id: p.id,
      tempId: `performer-${p.id || i}`,
      performer_name: p.performer_name,
    })) || []
  );

  const [tracks, setTracks] = useState<AdminTrack[]>(
    initialWork.tracks?.map((t) => ({
      id: t.track.id,
      title: t.track.title,
      isrc: t.track.isrc,
      artist: t.track.artist,
    })) || []
  );

  const [writers, setWriters] = useState<AdminWriter[]>(
    initialWork.composers?.map((c, i) => ({
      tempId: `writer-${c.composer_id || i}`,
      composerId: c.composer_id,
      name: c.composer?.name || 'Unknown',
      cae: c.composer?.cae || undefined,
      mainPro: c.composer?.main_pro || undefined,
      role: c.role || 'CA',
      share: c.share || 0,
      isControlled: c.composer?.controlled || false,
      isNew: false,
      mechanicalOwnership: 0,
      performanceOwnership: 0,
      mechanicalCollection: 0,
      performanceCollection: 0,
    })) || []
  );

  // Editor mode for simple/advanced ownership
  const [editorMode, setEditorMode] = useState<EditorMode>('simple');

  // Publishers state for dropdown
  const [publishers, setPublishers] = useState<Array<{id: string; name: string}>>([]);
  const [loadingPublishers, setLoadingPublishers] = useState(false);
  const [showPublishersSheet, setShowPublishersSheet] = useState(false);


  const supabase = createClient();
  const [apiClient, setApiClient] = useState<ApiClient | null>(null);

  useEffect(() => {
    const initClient = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setApiClient(new ApiClient(async () => session?.access_token || null));
    };
    initClient();
  }, [supabase]);

  // Fetch publishers for dropdown
  useEffect(() => {
    const fetchPublishers = async () => {
      if (!apiClient || !work.account_id) return;
      setLoadingPublishers(true);
      try {
        const response = await apiClient.get<{ publishers: Array<{id: string; name: string}>; total: number }>(
          `${API_ENDPOINTS.ADMIN_ACCOUNT_PUBLISHERS(work.account_id)}?limit=100`
        );
        setPublishers(response.publishers || []);
      } catch (err) {
        console.error('Failed to fetch publishers:', err);
      } finally {
        setLoadingPublishers(false);
      }
    };
    fetchPublishers();
  }, [apiClient, work.account_id]);

  const handleSave = async () => {
    if (!apiClient) return;
    
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      if (isNew) {
        // Create new work
        const response = await apiClient.post<{ work: Work }>(API_ENDPOINTS.ADMIN_WORKS, {
          account_id: work.account_id,
          title: work.title,
          iswc: work.iswc,
          tunecode: work.tunecode,
          foreign_id: work.foreign_id,
          project_id: work.project_id,
          notes: work.notes,
          grand_rights: work.grand_rights,
          priority: work.priority,
          production_library: work.production_library,
          work_language: work.work_language,
          work_description_category: work.work_description_category,
          duration: work.duration,
          composite_type: work.composite_type,
          composite_count: work.composite_count,
          version_type: work.version_type,
          arrangement_type: work.arrangement_type,
          copyright_date: work.copyright_date,
          label_copy: work.label_copy,
        });
        router.push(`${ROUTES.ADMIN_WORKS}/${response.work.id}`);
      } else {
        // Update existing work
        await apiClient.put(`${API_ENDPOINTS.ADMIN_WORKS}/${work.id}`, work);
        setSuccess(true);
        setTimeout(() => {
          router.refresh();
        }, 1000);
      }
    } catch (err: any) {
      setError(err.message || `Failed to ${isNew ? 'create' : 'save'} work`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!apiClient || isNew) return;
    if (!confirm(`Are you sure you want to delete "${work.title}"? This action cannot be undone.`)) {
      return;
    }

    setLoading(true);
    try {
      await apiClient.delete(`${API_ENDPOINTS.ADMIN_WORKS}/${work.id}`);
      router.push(ROUTES.ADMIN_WORKS);
    } catch (err: any) {
      setError(err.message || 'Failed to delete work');
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!apiClient) return;
    // Can only approve works that are in review
    if (work.approval_status !== 'in_review') {
      setError('Only works in review can be approved');
      return;
    }
    setSaving(true);
    try {
      const response = await apiClient.post(API_ENDPOINTS.ADMIN_WORK_APPROVE(work.id), {});
      setWork({
        ...work,
        approval_status: 'approved',
        approved_date: new Date().toISOString(),
        reviewed_at: new Date().toISOString(),
        rejection_reason: null,
      });
      setSuccess(true);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Failed to approve work');
    } finally {
      setSaving(false);
    }
  };

  const handleReject = async () => {
    if (!apiClient) return;
    if (!rejectionReason.trim()) {
      setError('Please provide a reason for rejection');
      return;
    }
    // Can only reject works that are in review
    if (work.approval_status !== 'in_review') {
      setError('Only works in review can be rejected');
      return;
    }
    setSaving(true);
    try {
      await apiClient.post(API_ENDPOINTS.ADMIN_WORK_REJECT(work.id), {
        rejection_reason: rejectionReason.trim(),
      });
      setWork({
        ...work,
        approval_status: 'rejected',
        rejection_reason: rejectionReason.trim(),
        reviewed_at: new Date().toISOString(),
      });
      setShowRejectDialog(false);
      setRejectionReason('');
      setSuccess(true);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Failed to reject work');
    } finally {
      setSaving(false);
    }
  };

  const handleHold = async () => {
    if (!apiClient) return;
    setSaving(true);
    try {
      await apiClient.put(`${API_ENDPOINTS.ADMIN_WORKS}/${work.id}`, {
        ...work,
        on_hold: !work.on_hold,
      });
      setWork({ ...work, on_hold: !work.on_hold });
      setSuccess(true);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Failed to update hold status');
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: keyof Work, value: any) => {
    setWork({ ...work, [field]: value });
  };

  // Save handler for alternate titles
  const handleSaveAlternateTitles = async () => {
    if (!apiClient) return;
    setSaving(true);
    setError(null);
    try {
      await apiClient.put(`${API_ENDPOINTS.ADMIN_WORKS}/${work.id}`, {
        alternate_titles: alternateTitles.map((at) => ({
          title: at.title,
          language: at.language,
          title_type: at.title_type,
        })),
      });
      setSuccess(true);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Failed to save alternate titles');
    } finally {
      setSaving(false);
    }
  };

  // Save handler for performers
  const handleSavePerformers = async () => {
    if (!apiClient) return;
    setSaving(true);
    setError(null);
    try {
      await apiClient.put(`${API_ENDPOINTS.ADMIN_WORKS}/${work.id}`, {
        performers: performers.map((p) => ({
          performer_name: p.performer_name,
        })),
      });
      setSuccess(true);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Failed to save performers');
    } finally {
      setSaving(false);
    }
  };

  // Save handler for tracks
  const handleSaveTracks = async () => {
    if (!apiClient) return;
    setSaving(true);
    setError(null);
    try {
      await apiClient.put(`${API_ENDPOINTS.ADMIN_WORKS}/${work.id}`, {
        tracks: tracks.map((t) => ({ id: t.id })),
      });
      setSuccess(true);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Failed to save tracks');
    } finally {
      setSaving(false);
    }
  };

  // Save handler for writers/composers
  const handleSaveWriters = async () => {
    if (!apiClient) return;
    setSaving(true);
    setError(null);
    try {
      await apiClient.put(`${API_ENDPOINTS.ADMIN_WORKS}/${work.id}`, {
        composers: writers.map((w) => ({
          composerId: w.composerId,
          role: w.role,
          share: w.share,
          mechanicalOwnership: w.mechanicalOwnership,
          performanceOwnership: w.performanceOwnership,
          mechanicalCollection: w.mechanicalCollection,
          performanceCollection: w.performanceCollection,
        })),
      });
      setSuccess(true);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Failed to save writers');
    } finally {
      setSaving(false);
    }
  };

  // Generate IP Chain from writers for each selected territory
  const generateIpChain = useCallback(() => {
    const ipChainChildren = writers
      .map((writer) => {
        if (!writer.composerId) return null;
        const roleObj = WRITER_ROLES.find((r) => r.value === writer.role);
        const roleLabel = roleObj?.label || 'Composer/Author';
        const ownership = editorMode === 'simple' ? writer.share : writer.mechanicalOwnership;

        if (writer.isControlled) {
          // Use selected publisher or fallback to system default
          const pubId = writer.publisherId || SYSTEM_PRIAM_PUBLISHER_ID;
          return {
            publisherId: pubId,
            category: 'Original Publisher',
            controlled: true,
            mechanicalOwnership: 0,
            performanceOwnership: 0,
            mechanicalCollection: ownership,
            performanceCollection: ownership * 0.5,
            children: [{
              composerId: writer.composerId,
              category: roleLabel,
              controlled: true,
              mechanicalOwnership: ownership,
              performanceOwnership: ownership,
              mechanicalCollection: 0,
              performanceCollection: ownership * 0.5,
            }],
          };
        } else {
          return {
            composerId: writer.composerId,
            category: roleLabel,
            controlled: false,
            mechanicalOwnership: ownership,
            performanceOwnership: ownership,
            mechanicalCollection: ownership,
            performanceCollection: ownership,
          };
        }
      })
      .filter(Boolean);

    // Return single 'World' territory (default for all works)
    return [{ territory: 'World', children: ipChainChildren }];
  }, [writers, editorMode]);

  // Save handler for IP chain (saves composers + generated rights_chain)
  const handleSaveIpChain = async () => {
    if (!apiClient) return;

    // Validation
    const totalShare = writers.reduce((sum, w) => sum + (w.share || 0), 0);
    if (writers.length > 0 && Math.abs(totalShare - 100) > 0.01) {
      setError(`Total ownership must be 100% (Currently: ${totalShare.toFixed(1)}%)`);
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const rightsChain = generateIpChain();
      await apiClient.put(`${API_ENDPOINTS.ADMIN_WORKS}/${work.id}`, {
        composers: writers.map((w) => ({
          composerId: w.composerId,
          role: w.role,
          share: w.share,
          mechanicalOwnership: w.mechanicalOwnership,
          performanceOwnership: w.performanceOwnership,
          mechanicalCollection: w.mechanicalCollection,
          performanceCollection: w.performanceCollection,
        })),
        rights_chain: rightsChain,
      });
      setSuccess(true);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Failed to save IP chain');
    } finally {
      setSaving(false);
    }
  };

  // Handler for publisher creation
  const handlePublisherCreated = (publisher: { id: string; name: string }) => {
    setPublishers((prev) => [...prev, publisher]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={ROUTES.ADMIN_WORKS}>
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{work.title || 'Untitled Work'}</h1>
            <p className="text-sm text-muted-foreground">
              {work.account?.name && (
                <>
                  Account: <Link href={ROUTES.ADMIN_ACCOUNT(work.account.id)} className="text-primary hover:underline">{work.account.name}</Link>
                </>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Approve button - only enabled for works in review */}
          <Button
            variant={work.approval_status === 'approved' ? 'outline' : 'default'}
            onClick={handleApprove}
            disabled={saving || work.approval_status !== 'in_review'}
            title={work.approval_status !== 'in_review' ? 'Only works in review can be approved' : 'Approve this work'}
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            {work.approval_status === 'approved' ? 'Approved' : 'Approve'}
          </Button>
          {/* Reject button - only enabled for works in review */}
          <Button
            variant={work.approval_status === 'rejected' ? 'outline' : 'destructive'}
            onClick={() => setShowRejectDialog(true)}
            disabled={saving || work.approval_status !== 'in_review'}
            title={work.approval_status !== 'in_review' ? 'Only works in review can be rejected' : 'Reject this work'}
          >
            <MessageSquareX className="w-4 h-4 mr-2" />
            {work.approval_status === 'rejected' ? 'Rejected' : 'Reject'}
          </Button>
          <Button
            variant={work.on_hold ? 'default' : 'outline'}
            onClick={handleHold}
            disabled={saving}
          >
            <AlertCircle className="w-4 h-4 mr-2" />
            {work.on_hold ? 'Release Hold' : 'Hold'}
          </Button>
          {!isNew && (
            <Button
              variant="outline"
              onClick={handleDelete}
              disabled={loading}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          )}
          <Button variant="outline">
            <Copy className="w-4 h-4 mr-2" />
            Copy
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      {/* Validation Errors */}
      {work.validation_errors && work.validation_errors.length > 0 && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-start gap-2">
              <XCircle className="w-5 h-5 text-destructive mt-0.5" />
              <div>
                <p className="font-semibold text-destructive mb-2">Invalid for Delivery</p>
                <p className="text-sm text-muted-foreground mb-2">
                  The following validation errors occurred:
                </p>
                <ul className="list-disc list-inside space-y-1">
                  {work.validation_errors.map((error, idx) => (
                    <li key={idx} className="text-sm text-destructive">{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Success/Error Messages */}
      {success && (
        <Card className="border-green-500 bg-green-50 dark:bg-green-950">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
              <CheckCircle2 className="w-5 h-5" />
              <span>Work saved successfully!</span>
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
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">OVERVIEW</TabsTrigger>
          <TabsTrigger value="territories">TERRITORIES</TabsTrigger>
          <TabsTrigger value="ip-chain">IP CHAIN</TabsTrigger>
          <TabsTrigger value="rights">RIGHTS</TabsTrigger>
          <TabsTrigger value="aliases">ALIASES</TabsTrigger>
          <TabsTrigger value="deliveries">DELIVERIES</TabsTrigger>
          <TabsTrigger value="analytics">ANALYTICS</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <Card>
              <CardHeader>
                <CardTitle>OVERVIEW</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="party_no">PARTY ID</Label>
                  <Input
                    id="party_no"
                    type="number"
                    value={work.party_no || ''}
                    onChange={(e) => updateField('party_no', e.target.value ? parseInt(e.target.value) : null)}
                    readOnly
                    className="bg-muted"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">TITLE <span className="text-destructive">*</span></Label>
                  <Input
                    id="title"
                    value={work.title}
                    onChange={(e) => updateField('title', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>ALTERNATE TITLES</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    onClick={() => setShowAlternateTitlesSheet(true)}
                  >
                    + Title ({alternateTitles.length})
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="foreign_id">FOREIGN ID</Label>
                  <Input
                    id="foreign_id"
                    value={work.foreign_id || ''}
                    onChange={(e) => updateField('foreign_id', e.target.value || null)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="project_id">PROJECT ID</Label>
                  <Input
                    id="project_id"
                    value={work.project_id || ''}
                    onChange={(e) => updateField('project_id', e.target.value || null)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="identifier">MAIN IDENTIFIER</Label>
                  <Input
                    id="identifier"
                    value={work.identifier || ''}
                    readOnly
                    className="bg-muted"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="iswc">ISWC</Label>
                  <Input
                    id="iswc"
                    value={work.iswc || ''}
                    onChange={(e) => updateField('iswc', e.target.value || null)}
                    placeholder="T-XXX.XXX.XXX-X"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tunecode">TUNECODE</Label>
                  <Input
                    id="tunecode"
                    value={work.tunecode || ''}
                    onChange={(e) => updateField('tunecode', e.target.value || null)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="copyright_date">COPYRIGHT DATE</Label>
                  <Input
                    id="copyright_date"
                    type="date"
                    value={work.copyright_date || ''}
                    onChange={(e) => updateField('copyright_date', e.target.value || null)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="label_copy">LABEL COPY</Label>
                  <Input
                    id="label_copy"
                    value={work.label_copy || ''}
                    onChange={(e) => updateField('label_copy', e.target.value || null)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="original_work_source">SOURCE</Label>
                  <Input
                    id="original_work_source"
                    value={work.original_work_source || ''}
                    onChange={(e) => updateField('original_work_source', e.target.value || null)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">NOTES</Label>
                  <Textarea
                    id="notes"
                    value={work.notes || ''}
                    onChange={(e) => updateField('notes', e.target.value || null)}
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Right Column */}
            <Card>
              <CardHeader>
                <CardTitle>CONFIGURATION</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="priority"
                      checked={work.priority || false}
                      onCheckedChange={(checked) => updateField('priority', checked)}
                    />
                    <Label htmlFor="priority">PRIORITY</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="production_library"
                      checked={work.production_library || false}
                      onCheckedChange={(checked) => updateField('production_library', checked)}
                    />
                    <Label htmlFor="production_library">PRODUCTION LIBRARY</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="grand_rights"
                      checked={work.grand_rights || false}
                      onCheckedChange={(checked) => updateField('grand_rights', checked)}
                    />
                    <Label htmlFor="grand_rights">GRAND RIGHTS</Label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="work_description_category">CATEGORY</Label>
                  <Select
                    value={work.work_description_category || ''}
                    onValueChange={(value) => updateField('work_description_category', value || null)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pop">Pop</SelectItem>
                      <SelectItem value="rock">Rock</SelectItem>
                      <SelectItem value="jazz">Jazz</SelectItem>
                      <SelectItem value="classical">Classical</SelectItem>
                      <SelectItem value="electronic">Electronic</SelectItem>
                      <SelectItem value="hip-hop">Hip-Hop</SelectItem>
                      <SelectItem value="country">Country</SelectItem>
                      <SelectItem value="folk">Folk</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="work_language">LANGUAGE</Label>
                  <Select
                    value={work.work_language || ''}
                    onValueChange={(value) => updateField('work_language', value || null)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                      <SelectItem value="it">Italian</SelectItem>
                      <SelectItem value="pt">Portuguese</SelectItem>
                      <SelectItem value="ja">Japanese</SelectItem>
                      <SelectItem value="zh">Chinese</SelectItem>
                      <SelectItem value="ko">Korean</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="composite_type">COMPOSITE TYPE</Label>
                  <Select
                    value={work.composite_type || 'none'}
                    onValueChange={(value) => updateField('composite_type', value || null)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="medley">Medley</SelectItem>
                      <SelectItem value="potpourri">Potpourri</SelectItem>
                      <SelectItem value="suite">Suite</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="composite_count">COMPOSITE COUNT</Label>
                  <Input
                    id="composite_count"
                    type="number"
                    value={work.composite_count || 0}
                    onChange={(e) => updateField('composite_count', parseInt(e.target.value) || 0)}
                    min={0}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="version_type">WORK VERSION</Label>
                  <Select
                    value={work.version_type || 'original'}
                    onValueChange={(value) => updateField('version_type', value || null)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="original">Original Work</SelectItem>
                      <SelectItem value="arrangement">Arrangement</SelectItem>
                      <SelectItem value="adaptation">Adaptation</SelectItem>
                      <SelectItem value="translation">Translation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="arrangement_type">ARRANGEMENT TYPE</Label>
                  <Select
                    value={work.arrangement_type || ''}
                    onValueChange={(value) => updateField('arrangement_type', value || null)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select arrangement type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="instrumental">Instrumental</SelectItem>
                      <SelectItem value="vocal">Vocal</SelectItem>
                      <SelectItem value="orchestral">Orchestral</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>CATALOGUE GROUPS</Label>
                  <Input placeholder="Enter catalogue groups" readOnly />
                </div>

                <div className="space-y-2">
                  <Label>PERFORMERS</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    onClick={() => setShowPerformersSheet(true)}
                  >
                    + Performer ({performers.length})
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label>TRACK ASSOCIATIONS</Label>
                  <Button
                    variant="default"
                    size="sm"
                    type="button"
                    onClick={() => setShowTracksSheet(true)}
                  >
                    + Track ({tracks.length})
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Territories Tab */}
        <TabsContent value="territories">
          <Card>
            <CardHeader>
              <CardTitle>TERRITORIES</CardTitle>
              <CardDescription>Manage territory-specific settings</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Territory management coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* IP Chain Tab */}
        <TabsContent value="ip-chain">
          <div className="space-y-6">
            {/* Composers Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div>
                  <CardTitle>COMPOSERS & WRITERS</CardTitle>
                  <CardDescription>Manage composers and their ownership shares</CardDescription>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="editor-mode" className="text-sm">Simple</Label>
                    <Switch
                      id="editor-mode"
                      checked={editorMode === 'advanced'}
                      onCheckedChange={(checked) => setEditorMode(checked ? 'advanced' : 'simple')}
                    />
                    <Label htmlFor="editor-mode" className="text-sm">Advanced</Label>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowWritersSheet(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Composer
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {work.validation_errors?.some(e => e.includes('IP Chain')) && (
                  <div className="mb-4 p-4 bg-destructive/10 border border-destructive rounded-md">
                    <p className="text-sm text-destructive">
                      Default Chain: At least one IP Chain has to be controlled
                    </p>
                  </div>
                )}

                {writers.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No composers added yet.</p>
                    <p className="text-sm mt-1">Click "Add Composer" to add writers to this work.</p>
                  </div>
                ) : (
                  <>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>NAME</TableHead>
                          <TableHead>ROLE</TableHead>
                          <TableHead className="w-24">SHARE %</TableHead>
                          {editorMode === 'advanced' && (
                            <>
                              <TableHead className="w-24">MECH OWN</TableHead>
                              <TableHead className="w-24">PERF OWN</TableHead>
                              <TableHead className="w-24">MECH COLL</TableHead>
                              <TableHead className="w-24">PERF COLL</TableHead>
                            </>
                          )}
                          <TableHead className="w-24">CONTROLLED</TableHead>
                          <TableHead>PUBLISHER</TableHead>
                          <TableHead className="w-16">ACTIONS</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {writers.map((writer, index) => (
                          <TableRow key={writer.tempId}>
                            <TableCell>
                              <div>
                                <span className="font-medium">{writer.name}</span>
                                {writer.cae && (
                                  <span className="text-xs text-muted-foreground ml-2">
                                    CAE: {writer.cae}
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Select
                                value={writer.role}
                                onValueChange={(value) => {
                                  const updated = [...writers];
                                  updated[index] = { ...writer, role: value };
                                  setWriters(updated);
                                }}
                              >
                                <SelectTrigger className="w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {WRITER_ROLES.map((role) => (
                                    <SelectItem key={role.value} value={role.value}>
                                      {role.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                min={0}
                                max={100}
                                step={0.01}
                                className="w-20"
                                value={writer.share || ''}
                                onChange={(e) => {
                                  const updated = [...writers];
                                  updated[index] = { ...writer, share: Math.min(100, parseFloat(e.target.value) || 0) };
                                  setWriters(updated);
                                }}
                                onBlur={(e) => {
                                  if (e.target.value === '') {
                                    const updated = [...writers];
                                    updated[index] = { ...writer, share: 0 };
                                    setWriters(updated);
                                  }
                                }}
                                placeholder="0"
                              />
                            </TableCell>
                            {editorMode === 'advanced' && (
                              <>
                                <TableCell>
                                  <Input
                                    type="number"
                                    min={0}
                                    max={100}
                                    step={0.01}
                                    className="w-20"
                                    value={writer.mechanicalOwnership || ''}
                                    onChange={(e) => {
                                      const updated = [...writers];
                                      updated[index] = { ...writer, mechanicalOwnership: Math.min(100, parseFloat(e.target.value) || 0) };
                                      setWriters(updated);
                                    }}
                                    onBlur={(e) => {
                                      if (e.target.value === '') {
                                        const updated = [...writers];
                                        updated[index] = { ...writer, mechanicalOwnership: 0 };
                                        setWriters(updated);
                                      }
                                    }}
                                    placeholder="0"
                                  />
                                </TableCell>
                                <TableCell>
                                  <Input
                                    type="number"
                                    min={0}
                                    max={100}
                                    step={0.01}
                                    className="w-20"
                                    value={writer.performanceOwnership || ''}
                                    onChange={(e) => {
                                      const updated = [...writers];
                                      updated[index] = { ...writer, performanceOwnership: Math.min(100, parseFloat(e.target.value) || 0) };
                                      setWriters(updated);
                                    }}
                                    onBlur={(e) => {
                                      if (e.target.value === '') {
                                        const updated = [...writers];
                                        updated[index] = { ...writer, performanceOwnership: 0 };
                                        setWriters(updated);
                                      }
                                    }}
                                    placeholder="0"
                                  />
                                </TableCell>
                                <TableCell>
                                  <Input
                                    type="number"
                                    min={0}
                                    max={100}
                                    step={0.01}
                                    className="w-20"
                                    value={writer.mechanicalCollection || ''}
                                    onChange={(e) => {
                                      const updated = [...writers];
                                      updated[index] = { ...writer, mechanicalCollection: Math.min(100, parseFloat(e.target.value) || 0) };
                                      setWriters(updated);
                                    }}
                                    onBlur={(e) => {
                                      if (e.target.value === '') {
                                        const updated = [...writers];
                                        updated[index] = { ...writer, mechanicalCollection: 0 };
                                        setWriters(updated);
                                      }
                                    }}
                                    placeholder="0"
                                  />
                                </TableCell>
                                <TableCell>
                                  <Input
                                    type="number"
                                    min={0}
                                    max={100}
                                    step={0.01}
                                    className="w-20"
                                    value={writer.performanceCollection || ''}
                                    onChange={(e) => {
                                      const updated = [...writers];
                                      updated[index] = { ...writer, performanceCollection: Math.min(100, parseFloat(e.target.value) || 0) };
                                      setWriters(updated);
                                    }}
                                    onBlur={(e) => {
                                      if (e.target.value === '') {
                                        const updated = [...writers];
                                        updated[index] = { ...writer, performanceCollection: 0 };
                                        setWriters(updated);
                                      }
                                    }}
                                    placeholder="0"
                                  />
                                </TableCell>
                              </>
                            )}
                            <TableCell>
                              <Checkbox
                                checked={writer.isControlled}
                                onCheckedChange={(checked) => {
                                  const updated = [...writers];
                                  updated[index] = {
                                    ...writer,
                                    isControlled: checked === true,
                                    // Reset publisher when unchecked
                                    publisherId: checked === true ? writer.publisherId : undefined,
                                    publisherName: checked === true ? writer.publisherName : undefined,
                                  };
                                  setWriters(updated);
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              {writer.isControlled ? (
                                <div className="flex items-center gap-1">
                                  <Select
                                    value={writer.publisherId || SYSTEM_PRIAM_PUBLISHER_ID}
                                    onValueChange={(value) => {
                                      const updated = [...writers];
                                      const pub = publishers.find(p => p.id === value);
                                      updated[index] = {
                                        ...writer,
                                        publisherId: value,
                                        publisherName: pub?.name || 'Priam Music Publishing & Sync',
                                      };
                                      setWriters(updated);
                                    }}
                                  >
                                    <SelectTrigger className="w-40">
                                      <SelectValue placeholder="Select publisher" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value={SYSTEM_PRIAM_PUBLISHER_ID}>
                                        Priam Music Publishing & Sync
                                      </SelectItem>
                                      {publishers.map((pub) => (
                                        <SelectItem key={pub.id} value={pub.id}>
                                          {pub.name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => setShowPublishersSheet(true)}
                                    title="Create new publisher"
                                  >
                                    <Plus className="w-4 h-4" />
                                  </Button>
                                </div>
                              ) : (
                                <span className="text-muted-foreground text-sm">—</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                onClick={() => {
                                  setWriters(writers.filter((_, i) => i !== index));
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>

                    {/* Total validation */}
                    <div className="mt-4 flex justify-between items-center p-3 bg-muted/50 rounded-md">
                      <span className="font-medium">Total Ownership:</span>
                      <span className={`font-bold ${
                        Math.abs(writers.reduce((sum, w) => sum + (w.share || 0), 0) - 100) < 0.01
                          ? 'text-green-600'
                          : 'text-destructive'
                      }`}>
                        {writers.reduce((sum, w) => sum + (w.share || 0), 0).toFixed(2)}%
                        {Math.abs(writers.reduce((sum, w) => sum + (w.share || 0), 0) - 100) >= 0.01 && (
                          <span className="ml-2 text-sm font-normal">(must equal 100%)</span>
                        )}
                      </span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* IP Chain Preview Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  IP CHAIN PREVIEW
                </CardTitle>
                <CardDescription>Auto-generated rights chain based on composers above</CardDescription>
              </CardHeader>
              <CardContent>
                {writers.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Add composers to see the generated IP chain.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {generateIpChain().map((territory, tIdx) => (
                      <div key={tIdx} className="border rounded-lg p-4">
                        <div className="flex items-center gap-2 font-medium mb-3">
                          <Globe className="w-4 h-4" />
                          {territory.territory}
                        </div>
                        <div className="ml-6 space-y-2">
                          {(territory.children || []).map((node: any, nIdx: number) => (
                            <div key={nIdx} className="border-l-2 border-muted pl-4 py-2">
                              {node.publisherId ? (
                                // Publisher node with nested composer
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="text-xs">Publisher</Badge>
                                    <span className="font-medium">
                                      {publishers.find(p => p.id === node.publisherId)?.name ||
                                       (node.publisherId === SYSTEM_PRIAM_PUBLISHER_ID ? 'Priam Music Publishing & Sync' : 'Unknown Publisher')}
                                    </span>
                                    <Badge variant="secondary" className="text-xs">{node.category}</Badge>
                                    {node.controlled && <Badge className="text-xs bg-green-600">Controlled</Badge>}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    Mech Coll: {node.mechanicalCollection}% | Perf Coll: {node.performanceCollection}%
                                  </div>
                                  {/* Nested composer */}
                                  {node.children?.map((child: any, cIdx: number) => (
                                    <div key={cIdx} className="ml-4 border-l-2 border-primary/30 pl-4 py-2">
                                      <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="text-xs">Composer</Badge>
                                        <span className="font-medium">
                                          {writers.find(w => w.composerId === child.composerId)?.name || 'Unknown'}
                                        </span>
                                        <Badge variant="secondary" className="text-xs">{child.category}</Badge>
                                      </div>
                                      <div className="text-xs text-muted-foreground">
                                        Mech Own: {child.mechanicalOwnership}% | Perf Own: {child.performanceOwnership}%
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                // Non-controlled composer (top-level)
                                <div>
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="text-xs">Composer</Badge>
                                    <span className="font-medium">
                                      {writers.find(w => w.composerId === node.composerId)?.name || 'Unknown'}
                                    </span>
                                    <Badge variant="secondary" className="text-xs">{node.category}</Badge>
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    Mech Own: {node.mechanicalOwnership}% | Perf Own: {node.performanceOwnership}%
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button
                onClick={handleSaveIpChain}
                disabled={saving || writers.length === 0 || Math.abs(writers.reduce((sum, w) => sum + (w.share || 0), 0) - 100) >= 0.01}
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save IP Chain
                  </>
                )}
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Rights Tab */}
        <TabsContent value="rights">
          <Card>
            <CardHeader>
              <CardTitle>RIGHTS</CardTitle>
              <CardDescription>Manage rights and permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Rights management coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aliases Tab */}
        <TabsContent value="aliases">
          <Card>
            <CardHeader>
              <CardTitle>ALIASES</CardTitle>
              <CardDescription>Manage work aliases and alternate titles</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Alias management coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Deliveries Tab */}
        <TabsContent value="deliveries">
          <Card>
            <CardHeader>
              <CardTitle>DELIVERIES</CardTitle>
              <CardDescription>Manage work deliveries and submissions</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Delivery management coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>ANALYTICS</CardTitle>
              <CardDescription>View work analytics and statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Total Participation</p>
                  <p className="text-2xl font-bold">{work.total_participation || 0}%</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant={work.valid ? 'default' : 'destructive'}>
                    {work.valid ? 'Valid' : 'Invalid'}
                  </Badge>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Created</p>
                  <p className="text-sm">{new Date(work.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Sheet Components */}
      <AdminAlternateTitlesSheet
        open={showAlternateTitlesSheet}
        onOpenChange={setShowAlternateTitlesSheet}
        alternateTitles={alternateTitles}
        onAlternateTitlesChange={setAlternateTitles}
        onSave={handleSaveAlternateTitles}
        saving={saving}
      />
      <AdminPerformersSheet
        open={showPerformersSheet}
        onOpenChange={setShowPerformersSheet}
        performers={performers}
        onPerformersChange={setPerformers}
        onSave={handleSavePerformers}
        saving={saving}
      />
      <AdminTracksSheet
        open={showTracksSheet}
        onOpenChange={setShowTracksSheet}
        workId={work.id}
        accountId={work.account_id}
        tracks={tracks}
        onTracksChange={setTracks}
        onSave={handleSaveTracks}
        saving={saving}
      />
      <AdminWritersSheet
        open={showWritersSheet}
        onOpenChange={setShowWritersSheet}
        workId={work.id}
        accountId={work.account_id}
        writers={writers}
        onWritersChange={setWriters}
        onSave={handleSaveWriters}
        saving={saving}
      />
      <AdminPublishersSheet
        open={showPublishersSheet}
        onOpenChange={setShowPublishersSheet}
        accountId={work.account_id}
        onPublisherCreated={handlePublisherCreated}
      />

      {/* Rejection Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Reject Work</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting "{work.title}". The creator will be notified and can revise and resubmit.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="rejection-reason">Reason for Rejection</Label>
              <Textarea
                id="rejection-reason"
                placeholder="Explain what needs to be corrected..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectDialog(false);
                setRejectionReason('');
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={saving || !rejectionReason.trim()}
            >
              {saving ? 'Rejecting...' : 'Reject Work'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

