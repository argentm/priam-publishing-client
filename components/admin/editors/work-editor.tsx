'use client';

import { useState, useEffect } from 'react';
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
import { Save, Trash2, Copy, CheckCircle2, XCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

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
    setSaving(true);
    try {
      await apiClient.put(`${API_ENDPOINTS.ADMIN_WORKS}/${work.id}`, {
        ...work,
        approval_status: 'approved',
        approved_date: new Date().toISOString(),
      });
      setWork({ ...work, approval_status: 'approved', approved_date: new Date().toISOString() });
      setSuccess(true);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Failed to approve work');
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
          <Button
            variant={work.approval_status === 'approved' ? 'outline' : 'default'}
            onClick={handleApprove}
            disabled={saving || work.approval_status === 'approved'}
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Approve
          </Button>
          <Button
            variant={work.on_hold ? 'default' : 'outline'}
            onClick={handleHold}
            disabled={saving}
          >
            <AlertCircle className="w-4 h-4 mr-2" />
            {work.on_hold ? 'Hold' : 'Hold'}
          </Button>
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
                  <Label>ALTERNATE TITLE</Label>
                  <Button variant="outline" size="sm" type="button">
                    + Title
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="composer">COMPOSER</Label>
                  <Input
                    id="composer"
                    value=""
                    placeholder="Search composer..."
                  />
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
                  <Input placeholder="Enter catalogue groups" />
                </div>

                <div className="space-y-2">
                  <Label>PERFORMERS</Label>
                  <Button variant="outline" size="sm" type="button">
                    + Performer
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label>TRACK ASSOCIATIONS</Label>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">TRACKS</p>
                    <div className="flex gap-2">
                      <Button variant="default" size="sm" type="button">
                        + Track
                      </Button>
                      <Button variant="secondary" size="sm" type="button">
                        + Create Track
                      </Button>
                    </div>
                  </div>
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
          <Card>
            <CardHeader>
              <CardTitle>IP CHAIN</CardTitle>
              <CardDescription>Manage intellectual property chain</CardDescription>
            </CardHeader>
            <CardContent>
              {work.validation_errors?.some(e => e.includes('IP Chain')) && (
                <div className="mb-4 p-4 bg-destructive/10 border border-destructive rounded-md">
                  <p className="text-sm text-destructive">
                    Default Chain: At least one IP Chain has to be controlled
                  </p>
                </div>
              )}
              <p className="text-muted-foreground">IP Chain management coming soon...</p>
            </CardContent>
          </Card>
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
    </div>
  );
}

