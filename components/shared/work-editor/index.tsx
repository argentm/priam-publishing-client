'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { ApiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/constants';
import type { Work } from '@/lib/types';
import type { Writer } from '@/components/shared/work-wizard/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowLeft,
  Save,
  Loader2,
  Music,
  Settings2,
  Users,
  Plus,
  CheckCircle2,
  AlertCircle,
  Clock,
  Calendar,
  Sparkles,
  Flag,
  FileText,
  Send,
  MoreHorizontal,
  Trash2,
  Lock,
  X,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { WritersSheet } from './writers-sheet';

// Language options
const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'it', label: 'Italian' },
  { value: 'pt', label: 'Portuguese' },
  { value: 'ja', label: 'Japanese' },
  { value: 'ko', label: 'Korean' },
  { value: 'zh', label: 'Chinese' },
];

// Category options
const CATEGORIES = [
  { value: 'pop', label: 'Pop' },
  { value: 'rock', label: 'Rock' },
  { value: 'jazz', label: 'Jazz' },
  { value: 'classical', label: 'Classical' },
  { value: 'electronic', label: 'Electronic' },
  { value: 'hip-hop', label: 'Hip-Hop' },
  { value: 'r-and-b', label: 'R&B' },
  { value: 'country', label: 'Country' },
  { value: 'folk', label: 'Folk' },
  { value: 'latin', label: 'Latin' },
  { value: 'reggae', label: 'Reggae' },
  { value: 'other', label: 'Other' },
];

// Version types
const VERSION_TYPES = [
  { value: 'original', label: 'Original Work' },
  { value: 'arrangement', label: 'Arrangement' },
  { value: 'adaptation', label: 'Adaptation' },
  { value: 'translation', label: 'Translation' },
];

// Arrangement types
const ARRANGEMENT_TYPES = [
  { value: 'instrumental', label: 'Instrumental' },
  { value: 'vocal', label: 'Vocal' },
  { value: 'orchestral', label: 'Orchestral' },
];

// Composite types
const COMPOSITE_TYPES = [
  { value: 'none', label: 'None' },
  { value: 'medley', label: 'Medley' },
  { value: 'potpourri', label: 'Potpourri' },
  { value: 'suite', label: 'Suite' },
];

interface WorkEditorProps {
  work: Work;
  accountId: string;
  backUrl: string;
  isAdmin?: boolean;
  onSave?: (work: Work) => void;
}

export function WorkEditor({
  work: initialWork,
  accountId,
  backUrl,
  isAdmin = false,
  onSave,
}: WorkEditorProps) {
  const router = useRouter();
  const [apiClient, setApiClient] = useState<ApiClient | null>(null);
  const [work, setWork] = useState<Work>(initialWork);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('main');

  // Locked state: users cannot edit works under review or approved (admins can always edit)
  const isLocked = !isAdmin && ['in_review', 'approved'].includes(work.approval_status || '');

  // Can submit if it's a draft, rejected, or no status (new works)
  const canSubmitForReview = work.approval_status === 'draft' || work.approval_status === 'rejected' || !work.approval_status;

  // Can cancel within 5 minutes of submission
  const canCancel = work.approval_status === 'in_review' &&
    work.submitted_at &&
    (Date.now() - new Date(work.submitted_at).getTime()) < 5 * 60 * 1000;

  // Duration state (minutes and seconds)
  const [durationMinutes, setDurationMinutes] = useState(
    work.duration ? Math.floor(work.duration / 60) : 0
  );
  const [durationSeconds, setDurationSeconds] = useState(
    work.duration ? work.duration % 60 : 0
  );

  // Writers state - using Writer type from work-wizard
  const [showWritersSheet, setShowWritersSheet] = useState(false);
  const [writers, setWriters] = useState<Writer[]>(
    initialWork.composers?.map(wc => ({
      tempId: `writer-${wc.composer_id}`,
      isNew: false,
      isControlled: wc.composer.controlled || false,
      composerId: wc.composer_id,
      name: wc.composer.name,
      cae: wc.composer.cae || undefined,
      mainPro: wc.composer.main_pro || undefined,
      role: wc.role || 'CA',
      share: wc.share || 0,
      mechanicalOwnership: 0,
      performanceOwnership: 0,
      mechanicalCollection: 0,
      performanceCollection: 0,
    })) || []
  );

  // Initialize API client
  useEffect(() => {
    const initClient = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      setApiClient(new ApiClient(async () => session?.access_token || null));
    };
    initClient();
  }, []);

  // Update duration when minutes/seconds change
  useEffect(() => {
    const totalSeconds = durationMinutes * 60 + durationSeconds;
    setWork(prev => ({ ...prev, duration: totalSeconds > 0 ? totalSeconds : null }));
  }, [durationMinutes, durationSeconds]);

  const updateField = <K extends keyof Work>(field: K, value: Work[K]) => {
    setWork(prev => ({ ...prev, [field]: value }));
    setSuccessMessage(null);
    setError(null);
  };

  // Remove writer from the list
  const removeWriter = (tempId: string) => {
    setWriters(prev => prev.filter(w => w.tempId !== tempId));
    setSuccessMessage(null);
  };

  // Save writers from the sheet
  const handleSaveWriters = async () => {
    if (!apiClient) return;

    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const endpoint = isAdmin
        ? `${API_ENDPOINTS.ADMIN_WORKS}/${work.id}`
        : `${API_ENDPOINTS.WORKS}/${work.id}`;

      // Just save the composers array
      await apiClient.put(endpoint, {
        composers: writers.filter(w => w.composerId).map(w => w.composerId),
      });

      setSuccessMessage('Writers saved successfully!');
      setShowWritersSheet(false);
      router.refresh();
    } catch (err) {
      const errorMessage = err && typeof err === 'object' && 'message' in err
        ? String((err as { message: string }).message)
        : 'Failed to save writers';
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    if (!apiClient) return;

    if (!work.title.trim()) {
      setError('Title is required');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const endpoint = isAdmin
        ? `${API_ENDPOINTS.ADMIN_WORKS}/${work.id}`
        : `${API_ENDPOINTS.WORKS}/${work.id}`;

      const updateData = {
        title: work.title.trim(),
        iswc: work.iswc || null,
        tunecode: work.tunecode || null,
        duration: work.duration || null,
        work_language: work.work_language || null,
        work_description_category: work.work_description_category || null,
        version_type: work.version_type || null,
        arrangement_type: work.arrangement_type || null,
        composite_type: work.composite_type || null,
        composite_count: work.composite_count || 0,
        copyright_date: work.copyright_date || null,
        label_copy: work.label_copy || null,
        notes: work.notes || null,
        grand_rights: work.grand_rights || false,
        priority: work.priority || false,
        production_library: work.production_library || false,
        original_work_title: work.original_work_title || null,
        original_iswc: work.original_iswc || null,
        original_work_writer_first_name: work.original_work_writer_first_name || null,
        original_work_writer_last_name: work.original_work_writer_last_name || null,
        original_work_source: work.original_work_source || null,
        composers: writers.filter(w => w.composerId).map(w => w.composerId),
      };

      await apiClient.put(endpoint, updateData);
      setSuccessMessage('Work saved successfully!');

      if (onSave) {
        onSave(work);
      }

      router.refresh();
    } catch (err) {
      const errorMessage = err && typeof err === 'object' && 'message' in err
        ? String((err as { message: string }).message)
        : 'Failed to save work';
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitForReview = async () => {
    if (!apiClient) return;

    if (!work.title.trim()) {
      setError('Title is required before submitting for review');
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // First save any pending changes (without status - protected field)
      const saveEndpoint = isAdmin
        ? `${API_ENDPOINTS.ADMIN_WORKS}/${work.id}`
        : `${API_ENDPOINTS.WORKS}/${work.id}`;

      const updateData = {
        title: work.title.trim(),
        iswc: work.iswc || null,
        tunecode: work.tunecode || null,
        duration: work.duration || null,
        work_language: work.work_language || null,
        work_description_category: work.work_description_category || null,
        version_type: work.version_type || null,
        arrangement_type: work.arrangement_type || null,
        composite_type: work.composite_type || null,
        composite_count: work.composite_count || 0,
        copyright_date: work.copyright_date || null,
        label_copy: work.label_copy || null,
        notes: work.notes || null,
        grand_rights: work.grand_rights || false,
        priority: work.priority || false,
        production_library: work.production_library || false,
        original_work_title: work.original_work_title || null,
        original_iswc: work.original_iswc || null,
        original_work_writer_first_name: work.original_work_writer_first_name || null,
        original_work_writer_last_name: work.original_work_writer_last_name || null,
        original_work_source: work.original_work_source || null,
        composers: writers.filter(w => w.composerId).map(w => w.composerId),
      };

      await apiClient.put(saveEndpoint, updateData);

      // Then submit for review using the dedicated endpoint
      const submitEndpoint = API_ENDPOINTS.WORK_SUBMIT(work.id);
      await apiClient.post(submitEndpoint, {});

      setWork(prev => ({ ...prev, approval_status: 'in_review' }));
      setSuccessMessage('Work submitted for review! An admin will review it shortly.');

      if (onSave) {
        onSave({ ...work, approval_status: 'in_review' });
      }

      router.refresh();
    } catch (err) {
      const errorMessage = err && typeof err === 'object' && 'message' in err
        ? String((err as { message: string }).message)
        : 'Failed to submit for review';
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelSubmission = async () => {
    if (!apiClient) return;

    setCancelling(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const cancelEndpoint = API_ENDPOINTS.WORK_CANCEL_SUBMISSION(work.id);
      await apiClient.post(cancelEndpoint, {});

      setWork(prev => ({ ...prev, approval_status: 'draft', submitted_at: null }));
      setSuccessMessage('Submission cancelled. Work is now a draft again.');

      router.refresh();
    } catch (err) {
      const errorMessage = err && typeof err === 'object' && 'message' in err
        ? String((err as { message: string }).message)
        : 'Failed to cancel submission';
      setError(errorMessage);
    } finally {
      setCancelling(false);
    }
  };

  const formatDuration = (seconds: number | null | undefined) => {
    if (!seconds) return '—';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isArrangement = work.version_type === 'arrangement' || work.version_type === 'adaptation';

  return (
    <div className="min-h-full">
      {/* Header - Enhanced with Priam typography */}
      <div className="border-b bg-gradient-to-r from-card via-card to-primary/5">
        <div className="px-4 sm:px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 sm:gap-4 min-w-0 flex-1">
              <Button
                variant="ghost"
                size="icon"
                asChild
                className="mt-1 shrink-0 hover:bg-primary/10 hover:text-primary"
              >
                <Link href={backUrl} aria-label="Go back">
                  <ArrowLeft className="w-5 h-5" />
                </Link>
              </Button>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground truncate">
                    {work.title}
                  </h1>
                  {work.priority && (
                    <Badge className="shrink-0 bg-primary/10 text-primary border-0 font-medium">
                      <Flag className="w-3 h-3 mr-1.5" />
                      Priority
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground flex-wrap">
                  {work.iswc ? (
                    <span className="font-mono bg-muted/70 px-2.5 py-1 rounded-md text-xs sm:text-sm text-foreground/70">
                      {work.iswc}
                    </span>
                  ) : work.tunecode ? (
                    <span className="font-mono bg-muted/70 px-2.5 py-1 rounded-md text-xs sm:text-sm text-foreground/70">
                      {work.tunecode}
                    </span>
                  ) : (
                    <span className="text-muted-foreground/70 text-xs sm:text-sm">No identifier assigned</span>
                  )}
                  {work.duration && (
                    <>
                      <span className="hidden sm:inline text-muted-foreground/50">•</span>
                      <span className="flex items-center gap-1.5 text-foreground/70">
                        <Clock className="w-3.5 h-3.5" />
                        {formatDuration(work.duration)}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Desktop buttons */}
            <div className="hidden sm:flex items-center gap-3 shrink-0">
              {/* Cancel button - shown when within 5-minute window */}
              {canCancel && !isAdmin && (
                <Button
                  variant="outline"
                  onClick={handleCancelSubmission}
                  disabled={cancelling}
                  className="hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50"
                >
                  {cancelling ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <X className="w-4 h-4 mr-2" />
                  )}
                  Cancel Submission
                </Button>
              )}
              {/* Submit button - shown when not locked and not in cancel window */}
              {canSubmitForReview && !isAdmin && !canCancel && (
                <Button
                  variant="outline"
                  onClick={handleSubmitForReview}
                  disabled={submitting || saving}
                  className="hover:bg-secondary/10 hover:text-secondary hover:border-secondary/50"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 mr-2" />
                  )}
                  Submit for Review
                </Button>
              )}
              {/* Save button - hidden when locked */}
              {!isLocked && (
                <Button onClick={handleSave} disabled={saving || submitting || cancelling} size="lg">
                  {saving ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Save Changes
                </Button>
              )}
            </div>

            {/* Mobile dropdown menu */}
            <div className="sm:hidden shrink-0">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" aria-label="More options">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {/* Save - hidden when locked */}
                  {!isLocked && (
                    <DropdownMenuItem
                      onClick={handleSave}
                      disabled={saving || submitting || cancelling}
                      className="cursor-pointer"
                    >
                      {saving ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4 mr-2" />
                      )}
                      Save Changes
                    </DropdownMenuItem>
                  )}
                  {/* Cancel - shown when in cancel window */}
                  {canCancel && !isAdmin && (
                    <>
                      {!isLocked && <DropdownMenuSeparator />}
                      <DropdownMenuItem
                        onClick={handleCancelSubmission}
                        disabled={cancelling}
                        className="cursor-pointer text-destructive"
                      >
                        {cancelling ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <X className="w-4 h-4 mr-2" />
                        )}
                        Cancel Submission
                      </DropdownMenuItem>
                    </>
                  )}
                  {/* Submit - shown when can submit and not in cancel window */}
                  {canSubmitForReview && !isAdmin && !canCancel && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={handleSubmitForReview}
                        disabled={submitting || saving}
                        className="cursor-pointer"
                      >
                        {submitting ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4 mr-2" />
                        )}
                        Submit for Review
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Messages */}
        {successMessage && (
          <div className="mb-6 flex items-center gap-3 p-4 bg-green-50 dark:bg-green-950/50 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-300">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}
        {error && (
          <div className="mb-6 flex items-center gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Locked Banner */}
        {isLocked && (
          <div className="mb-6 flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 rounded-lg text-amber-700 dark:text-amber-300">
            <Lock className="w-5 h-5 shrink-0" />
            <span>
              {work.approval_status === 'in_review'
                ? 'This work is under review and cannot be edited.'
                : 'This work is approved and cannot be edited.'}
            </span>
          </div>
        )}

        {/* Validation Errors */}
        {work.validation_errors && work.validation_errors.length > 0 && (
          <Card className="mb-6 border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/20">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-amber-800 dark:text-amber-200">Validation Issues</p>
                  <ul className="mt-2 space-y-1 text-sm text-amber-700 dark:text-amber-300">
                    {work.validation_errors.map((err, idx) => (
                      <li key={idx}>• {err}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Editor Section - Takes 3 columns */}
          <div className="xl:col-span-3">
            <Card className="card-clean overflow-hidden">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <CardHeader className="pb-0 border-b bg-muted/30">
                  <TabsList className="w-full justify-start h-auto p-1 bg-transparent gap-1">
                    <TabsTrigger
                      value="main"
                      className="flex items-center gap-2 px-4 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary rounded-lg transition-all"
                    >
                      <Music className="w-4 h-4" />
                      <span className="font-medium">Main Details</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="additional"
                      className="flex items-center gap-2 px-4 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary rounded-lg transition-all"
                    >
                      <Settings2 className="w-4 h-4" />
                      <span className="font-medium">Additional</span>
                    </TabsTrigger>
                  </TabsList>
                </CardHeader>

                <CardContent className="pt-8">
                  {/* Main Details Tab */}
                  <TabsContent value="main" className="mt-0 space-y-8">
                    {/* Work Information Section */}
                    <div className="space-y-5">
                      <div className="flex items-center gap-3">
                        <div className="w-1 h-5 bg-primary rounded-full" />
                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          <FileText className="w-4 h-4" />
                          Work Information
                        </div>
                      </div>

                      {/* Title */}
                      <div className="space-y-2">
                        <Label htmlFor="title">
                          Title <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="title"
                          value={work.title}
                          onChange={(e) => updateField('title', e.target.value)}
                          placeholder="Enter work title"
                          className="text-lg"
                          disabled={isLocked}
                        />
                      </div>

                      {/* ISWC & Duration Row */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="iswc">ISWC</Label>
                          <Input
                            id="iswc"
                            value={work.iswc || ''}
                            onChange={(e) => updateField('iswc', e.target.value || null)}
                            placeholder="T-XXX.XXX.XXX-X"
                            className="font-mono"
                            disabled={isLocked}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Duration</Label>
                          <div className="flex items-center gap-2">
                            <div className="relative flex-1">
                              <Input
                                type="number"
                                min={0}
                                value={durationMinutes}
                                onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 0)}
                                className="pr-12"
                                placeholder="0"
                                disabled={isLocked}
                              />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                                min
                              </span>
                            </div>
                            <span className="text-muted-foreground">:</span>
                            <div className="relative flex-1">
                              <Input
                                type="number"
                                min={0}
                                max={59}
                                value={durationSeconds}
                                onChange={(e) => setDurationSeconds(Math.min(59, parseInt(e.target.value) || 0))}
                                className="pr-12"
                                placeholder="0"
                                disabled={isLocked}
                              />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                                sec
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Language & Category Row */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="language">Language</Label>
                          <Select
                            value={work.work_language || ''}
                            onValueChange={(value) => updateField('work_language', value || null)}
                            disabled={isLocked}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select language" />
                            </SelectTrigger>
                            <SelectContent>
                              {LANGUAGES.map((lang) => (
                                <SelectItem key={lang.value} value={lang.value}>
                                  {lang.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="category">Category</Label>
                          <Select
                            value={work.work_description_category || ''}
                            onValueChange={(value) => updateField('work_description_category', value || null)}
                            disabled={isLocked}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              {CATEGORIES.map((cat) => (
                                <SelectItem key={cat.value} value={cat.value}>
                                  {cat.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-dashed" />

                    {/* Writers Section */}
                    <div className="space-y-5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-1 h-5 bg-secondary rounded-full" />
                          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            <Users className="w-4 h-4" />
                            Writers ({writers.length})
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowWritersSheet(true)}
                          className="hover:bg-primary/10 hover:text-primary hover:border-primary/50"
                          disabled={isLocked}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Manage Writers
                        </Button>
                      </div>

                      {writers.length > 0 ? (
                        <div className="grid gap-3">
                          {writers.map((writer) => (
                            <div
                              key={writer.tempId}
                              className={cn(
                                'flex items-center justify-between p-4 rounded-xl border transition-all',
                                writer.isControlled
                                  ? 'bg-gradient-to-r from-primary/5 to-transparent border-primary/20'
                                  : 'bg-muted/30 hover:bg-muted/50'
                              )}
                            >
                              <div className="flex items-center gap-4">
                                <div className={cn(
                                  'w-11 h-11 rounded-xl flex items-center justify-center text-sm font-semibold',
                                  writer.isControlled
                                    ? 'bg-primary/15 text-primary'
                                    : 'bg-muted text-muted-foreground'
                                )}>
                                  {writer.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <p className="font-semibold text-foreground">{writer.name}</p>
                                  <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                                    {writer.cae && (
                                      <span className="font-mono text-xs bg-muted/70 px-2 py-0.5 rounded-md">
                                        {writer.cae}
                                      </span>
                                    )}
                                    {writer.mainPro && (
                                      <span className="text-xs">{writer.mainPro}</span>
                                    )}
                                    {writer.role && (
                                      <Badge variant="outline" className="text-xs font-medium">
                                        {writer.role}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                {writer.share > 0 && (
                                  <span className="text-xl font-bold tabular-nums text-foreground">
                                    {writer.share}%
                                  </span>
                                )}
                                {writer.isControlled && (
                                  <Badge className="bg-primary/10 text-primary border-0 font-medium">
                                    <Sparkles className="w-3 h-3 mr-1" />
                                    Controlled
                                  </Badge>
                                )}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                  onClick={() => removeWriter(writer.tempId)}
                                  aria-label="Remove writer"
                                  disabled={isLocked}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-14 bg-gradient-to-b from-muted/30 to-muted/10 rounded-xl border border-dashed border-muted-foreground/20">
                          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-muted/50 flex items-center justify-center">
                            <Users className="w-8 h-8 text-muted-foreground/50" />
                          </div>
                          <p className="font-semibold text-foreground">No writers yet</p>
                          <p className="text-sm text-muted-foreground mt-1 max-w-xs mx-auto">
                            Add writers to track ownership and royalty splits
                          </p>
                          <Button
                            size="sm"
                            className="mt-5"
                            onClick={() => setShowWritersSheet(true)}
                            disabled={isLocked}
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add First Writer
                          </Button>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  {/* Additional Tab */}
                  <TabsContent value="additional" className="mt-0 space-y-8">
                    {/* Identifiers Section */}
                    <div className="space-y-5">
                      <div className="flex items-center gap-3">
                        <div className="w-1 h-5 bg-primary rounded-full" />
                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          <FileText className="w-4 h-4" />
                          Identifiers & Metadata
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="tunecode">Tunecode</Label>
                          <Input
                            id="tunecode"
                            value={work.tunecode || ''}
                            onChange={(e) => updateField('tunecode', e.target.value || null)}
                            placeholder="Enter tunecode"
                            className="font-mono"
                            disabled={isLocked}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="copyright_date">Copyright Date</Label>
                          <Input
                            id="copyright_date"
                            type="date"
                            value={work.copyright_date || ''}
                            onChange={(e) => updateField('copyright_date', e.target.value || null)}
                            disabled={isLocked}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="version_type">Version Type</Label>
                          <Select
                            value={work.version_type || 'original'}
                            onValueChange={(value) => updateField('version_type', value || null)}
                            disabled={isLocked}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {VERSION_TYPES.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="arrangement_type">Arrangement Type</Label>
                          <Select
                            value={work.arrangement_type || ''}
                            onValueChange={(value) => updateField('arrangement_type', value || null)}
                            disabled={isLocked}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              {ARRANGEMENT_TYPES.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="composite_type">Composite Type</Label>
                          <Select
                            value={work.composite_type || 'none'}
                            onValueChange={(value) => updateField('composite_type', value === 'none' ? null : value)}
                            disabled={isLocked}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {COMPOSITE_TYPES.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        {work.composite_type && work.composite_type !== 'none' && (
                          <div className="space-y-2">
                            <Label htmlFor="composite_count">Composite Count</Label>
                            <Input
                              id="composite_count"
                              type="number"
                              min={0}
                              value={work.composite_count || 0}
                              onChange={(e) => updateField('composite_count', parseInt(e.target.value) || 0)}
                              disabled={isLocked}
                            />
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="label_copy">Label Copy</Label>
                        <Input
                          id="label_copy"
                          value={work.label_copy || ''}
                          onChange={(e) => updateField('label_copy', e.target.value || null)}
                          placeholder="Copyright notice for labels"
                          disabled={isLocked}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea
                          id="notes"
                          value={work.notes || ''}
                          onChange={(e) => updateField('notes', e.target.value || null)}
                          placeholder="Additional notes about this work..."
                          rows={4}
                          className="resize-none"
                          disabled={isLocked}
                        />
                      </div>
                    </div>

                    {/* Original Work Section */}
                    {isArrangement && (
                      <>
                        <div className="border-t border-dashed" />
                        <div className="space-y-5">
                          <div className="flex items-center gap-3">
                            <div className="w-1 h-5 bg-secondary rounded-full" />
                            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                              <Music className="w-4 h-4" />
                              Original Work Information
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="original_work_title">Original Title</Label>
                              <Input
                                id="original_work_title"
                                value={work.original_work_title || ''}
                                onChange={(e) => updateField('original_work_title', e.target.value || null)}
                                placeholder="Original work title"
                                disabled={isLocked}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="original_iswc">Original ISWC</Label>
                              <Input
                                id="original_iswc"
                                value={work.original_iswc || ''}
                                onChange={(e) => updateField('original_iswc', e.target.value || null)}
                                placeholder="T-XXX.XXX.XXX-X"
                                className="font-mono"
                                disabled={isLocked}
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="original_writer_first">Original Writer First Name</Label>
                              <Input
                                id="original_writer_first"
                                value={work.original_work_writer_first_name || ''}
                                onChange={(e) => updateField('original_work_writer_first_name', e.target.value || null)}
                                disabled={isLocked}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="original_writer_last">Original Writer Last Name</Label>
                              <Input
                                id="original_writer_last"
                                value={work.original_work_writer_last_name || ''}
                                onChange={(e) => updateField('original_work_writer_last_name', e.target.value || null)}
                                disabled={isLocked}
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="original_source">Source</Label>
                            <Input
                              id="original_source"
                              value={work.original_work_source || ''}
                              onChange={(e) => updateField('original_work_source', e.target.value || null)}
                              placeholder="Where this work originates from"
                              disabled={isLocked}
                            />
                          </div>
                        </div>
                      </>
                    )}

                    {/* Flags Section */}
                    <div className="border-t border-dashed" />
                    <div className="space-y-5">
                      <div className="flex items-center gap-3">
                        <div className="w-1 h-5 bg-accent rounded-full" />
                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          <Flag className="w-4 h-4" />
                          Flags & Settings
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <label
                          htmlFor="priority"
                          className={cn(
                            'flex items-center gap-3 p-4 rounded-lg border transition-colors',
                            isLocked ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
                            work.priority ? 'bg-primary/5 border-primary/30' : !isLocked && 'hover:bg-muted/50'
                          )}
                        >
                          <Checkbox
                            id="priority"
                            checked={work.priority || false}
                            onCheckedChange={(checked) => updateField('priority', checked === true)}
                            disabled={isLocked}
                          />
                          <div>
                            <p className="font-medium text-sm">Priority</p>
                            <p className="text-xs text-muted-foreground">High priority work</p>
                          </div>
                        </label>

                        <label
                          htmlFor="production_library"
                          className={cn(
                            'flex items-center gap-3 p-4 rounded-lg border transition-colors',
                            isLocked ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
                            work.production_library ? 'bg-primary/5 border-primary/30' : !isLocked && 'hover:bg-muted/50'
                          )}
                        >
                          <Checkbox
                            id="production_library"
                            checked={work.production_library || false}
                            onCheckedChange={(checked) => updateField('production_library', checked === true)}
                            disabled={isLocked}
                          />
                          <div>
                            <p className="font-medium text-sm">Library</p>
                            <p className="text-xs text-muted-foreground">Production music</p>
                          </div>
                        </label>

                        <label
                          htmlFor="grand_rights"
                          className={cn(
                            'flex items-center gap-3 p-4 rounded-lg border transition-colors',
                            isLocked ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
                            work.grand_rights ? 'bg-primary/5 border-primary/30' : !isLocked && 'hover:bg-muted/50'
                          )}
                        >
                          <Checkbox
                            id="grand_rights"
                            checked={work.grand_rights || false}
                            onCheckedChange={(checked) => updateField('grand_rights', checked === true)}
                            disabled={isLocked}
                          />
                          <div>
                            <p className="font-medium text-sm">Grand Rights</p>
                            <p className="text-xs text-muted-foreground">Dramatic rights</p>
                          </div>
                        </label>
                      </div>
                    </div>
                  </TabsContent>
                </CardContent>
              </Tabs>
            </Card>
          </div>

          {/* Sidebar - Takes 1 column */}
          <div className="space-y-4">
            {/* Status Card - Orange accent */}
            <Card className="card-orange">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Approval</span>
                  <Badge
                    variant="outline"
                    className={cn(
                      'font-medium',
                      work.approval_status === 'approved'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : work.approval_status === 'in_review'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : work.approval_status === 'rejected'
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : 'bg-slate-50 text-slate-600 border-slate-200'
                    )}
                  >
                    {work.approval_status === 'in_review'
                      ? 'In Review'
                      : work.approval_status
                        ? work.approval_status.charAt(0).toUpperCase() + work.approval_status.slice(1)
                        : 'Draft'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Valid</span>
                  <Badge
                    variant="outline"
                    className={cn(
                      'font-medium',
                      work.valid !== false
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-red-50 text-red-700 border-red-200'
                    )}
                  >
                    {work.valid !== false ? 'Yes' : 'No'}
                  </Badge>
                </div>
                {work.on_hold && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">On Hold</span>
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 font-medium">
                      Yes
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Info - Blue accent */}
            <Card className="card-blue">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                  <Music className="w-4 h-4 text-secondary" />
                  Quick Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Duration</span>
                  <span className="font-mono font-medium text-foreground">{formatDuration(work.duration)}</span>
                </div>
                {work.work_language && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Language</span>
                    <span className="font-medium text-foreground">
                      {LANGUAGES.find(l => l.value === work.work_language)?.label || work.work_language}
                    </span>
                  </div>
                )}
                {work.work_description_category && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Category</span>
                    <span className="font-medium text-foreground">
                      {CATEGORIES.find(c => c.value === work.work_description_category)?.label || work.work_description_category}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Writers</span>
                  <span className="font-semibold text-foreground">{writers.length}</span>
                </div>
              </CardContent>
            </Card>

            {/* Timeline Card - Purple accent */}
            <Card className="card-purple">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                  <Clock className="w-4 h-4 text-accent" />
                  Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-1.5">Created</p>
                  <p className="flex items-center gap-2 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                    {new Date(work.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-1.5">Updated</p>
                  <p className="flex items-center gap-2 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                    {new Date(work.updated_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                {work.spotify_imported_at && (
                  <div>
                    <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-1.5">Spotify Import</p>
                    <p className="flex items-center gap-2 font-medium">
                      <Sparkles className="w-3.5 h-3.5 text-green-500" />
                      {new Date(work.spotify_imported_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Writers Sheet */}
      <WritersSheet
        open={showWritersSheet}
        onOpenChange={setShowWritersSheet}
        accountId={accountId}
        writers={writers}
        onWritersChange={setWriters}
        onSave={handleSaveWriters}
        saving={saving}
      />
    </div>
  );
}
