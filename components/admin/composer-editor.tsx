'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

interface Composer {
  id: string;
  account_id: string;
  name: string;
  first_name?: string | null;
  middle_names?: string | null;
  surname?: string | null;
  cae?: string | null;
  main_pro?: string | null;
  main_pro_identifier?: string | null;
  mechanical_pro?: string | null;
  mechanical_pro_identifier?: string | null;
  performance_pro?: string | null;
  performance_pro_identifier?: string | null;
  sync_pro?: string | null;
  sync_pro_identifier?: string | null;
  controlled?: boolean;
  notes?: string | null;
  account?: {
    id: string;
    name: string;
  };
  created_at: string;
  updated_at: string;
}

interface ComposerEditorProps {
  composer: Composer;
  isNew?: boolean;
}

export function ComposerEditor({ composer: initialComposer, isNew = false }: ComposerEditorProps) {
  const router = useRouter();
  const [composer, setComposer] = useState<Composer>(initialComposer);
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
        const response = await apiClient.post<{ composer: Composer }>(API_ENDPOINTS.ADMIN_COMPOSERS, {
          account_id: composer.account_id,
          name: composer.name,
          first_name: composer.first_name,
          middle_names: composer.middle_names,
          surname: composer.surname,
          cae: composer.cae,
          main_pro: composer.main_pro,
          main_pro_identifier: composer.main_pro_identifier,
          mechanical_pro: composer.mechanical_pro,
          mechanical_pro_identifier: composer.mechanical_pro_identifier,
          performance_pro: composer.performance_pro,
          performance_pro_identifier: composer.performance_pro_identifier,
          sync_pro: composer.sync_pro,
          sync_pro_identifier: composer.sync_pro_identifier,
          controlled: composer.controlled,
          notes: composer.notes,
        });
        router.push(`${ROUTES.ADMIN_COMPOSERS}/${response.composer.id}`);
      } else {
        await apiClient.put(`${API_ENDPOINTS.ADMIN_COMPOSERS}/${composer.id}`, composer);
        setSuccess(true);
        setTimeout(() => router.refresh(), 1000);
      }
    } catch (err: any) {
      setError(err.message || `Failed to ${isNew ? 'create' : 'save'} composer`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!apiClient || isNew) return;
    if (!confirm(`Delete "${composer.name}"?`)) return;
    try {
      await apiClient.delete(`${API_ENDPOINTS.ADMIN_COMPOSERS}/${composer.id}`);
      router.push(ROUTES.ADMIN_COMPOSERS);
    } catch (err: any) {
      setError(err.message || 'Failed to delete composer');
    }
  };

  const updateField = (field: keyof Composer, value: any) => {
    setComposer({ ...composer, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={ROUTES.ADMIN_COMPOSERS}><ArrowLeft className="w-4 h-4" /></Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{composer.name || 'Unnamed Composer'}</h1>
            <p className="text-sm text-muted-foreground">
              {composer.account?.name && (
                <>Account: <Link href={`/dashboard/account/${composer.account.id}`} className="text-primary hover:underline">{composer.account.name}</Link></>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isNew && <Button variant="destructive" onClick={handleDelete}><Trash2 className="w-4 h-4 mr-2" />Delete</Button>}
          <Button onClick={handleSave} disabled={saving}><Save className="w-4 h-4 mr-2" />{saving ? 'Saving...' : 'Save'}</Button>
        </div>
      </div>

      {success && (
        <Card className="border-green-500 bg-green-50 dark:bg-green-950">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
              <CheckCircle2 className="w-5 h-5" /><span>Composer saved!</span>
            </div>
          </CardContent>
        </Card>
      )}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive"><XCircle className="w-5 h-5" /><span>{error}</span></div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>COMPOSER INFORMATION</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">NAME <span className="text-destructive">*</span></Label>
              <Input id="name" value={composer.name} onChange={(e) => updateField('name', e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="first_name">FIRST NAME</Label>
              <Input id="first_name" value={composer.first_name || ''} onChange={(e) => updateField('first_name', e.target.value || null)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="middle_names">MIDDLE NAMES</Label>
              <Input id="middle_names" value={composer.middle_names || ''} onChange={(e) => updateField('middle_names', e.target.value || null)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="surname">SURNAME</Label>
              <Input id="surname" value={composer.surname || ''} onChange={(e) => updateField('surname', e.target.value || null)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cae">CAE/IPI NUMBER</Label>
              <Input id="cae" value={composer.cae || ''} onChange={(e) => updateField('cae', e.target.value || null)} placeholder="I-000000000-0" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">NOTES</Label>
              <Textarea id="notes" value={composer.notes || ''} onChange={(e) => updateField('notes', e.target.value || null)} rows={4} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>PRO INFORMATION</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="main_pro">MAIN PRO</Label>
              <Input id="main_pro" value={composer.main_pro || ''} onChange={(e) => updateField('main_pro', e.target.value || null)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="main_pro_identifier">MAIN PRO IDENTIFIER</Label>
              <Input id="main_pro_identifier" value={composer.main_pro_identifier || ''} onChange={(e) => updateField('main_pro_identifier', e.target.value || null)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mechanical_pro">MECHANICAL PRO</Label>
              <Input id="mechanical_pro" value={composer.mechanical_pro || ''} onChange={(e) => updateField('mechanical_pro', e.target.value || null)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mechanical_pro_identifier">MECHANICAL PRO IDENTIFIER</Label>
              <Input id="mechanical_pro_identifier" value={composer.mechanical_pro_identifier || ''} onChange={(e) => updateField('mechanical_pro_identifier', e.target.value || null)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="performance_pro">PERFORMANCE PRO</Label>
              <Input id="performance_pro" value={composer.performance_pro || ''} onChange={(e) => updateField('performance_pro', e.target.value || null)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="performance_pro_identifier">PERFORMANCE PRO IDENTIFIER</Label>
              <Input id="performance_pro_identifier" value={composer.performance_pro_identifier || ''} onChange={(e) => updateField('performance_pro_identifier', e.target.value || null)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sync_pro">SYNC PRO</Label>
              <Input id="sync_pro" value={composer.sync_pro || ''} onChange={(e) => updateField('sync_pro', e.target.value || null)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sync_pro_identifier">SYNC PRO IDENTIFIER</Label>
              <Input id="sync_pro_identifier" value={composer.sync_pro_identifier || ''} onChange={(e) => updateField('sync_pro_identifier', e.target.value || null)} />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="controlled" checked={composer.controlled || false} onCheckedChange={(checked) => updateField('controlled', checked)} />
              <Label htmlFor="controlled">CONTROLLED</Label>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

