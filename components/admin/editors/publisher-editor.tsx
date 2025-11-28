'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { API_ENDPOINTS, ROUTES } from '@/lib/constants';
import { createClient } from '@/lib/supabase/client';
import { ApiClient } from '@/lib/api/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProSelector } from '@/components/ui/pro-selector';
import { Save, Trash2, ArrowLeft, CheckCircle2, XCircle, Plus, X } from 'lucide-react';
import Link from 'next/link';

interface SocietyIdentifier {
  id?: string;
  society: string;
  identifier?: string | null;
  publisher_name?: string | null;
  mechanical_society?: string | null;
  performance_society?: string | null;
  sync_society?: string | null;
}

interface LinkedContract {
  id: string;
  contract_id: string;
  contract?: {
    id: string;
    name: string;
  };
}

interface Publisher {
  id: string;
  account_id: string;
  name: string;
  cae: string;
  cae_without_leading_zeros?: string | null;
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
  foreign_id?: string | null;
  society_identifiers?: SocietyIdentifier[];
  linked_contracts?: LinkedContract[];
  account?: {
    id: string;
    name: string;
  };
  created_at: string;
  updated_at: string;
}

interface Account {
  id: string;
  name: string;
}

interface PublisherEditorProps {
  publisher: Publisher;
  isNew?: boolean;
  accounts?: Account[];
}

export function PublisherEditor({ publisher: initialPublisher, isNew = false, accounts = [] }: PublisherEditorProps) {
  const router = useRouter();
  const [publisher, setPublisher] = useState<Publisher>(initialPublisher);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const supabase = createClient();
  const [apiClient, setApiClient] = useState<ApiClient | null>(null);

  // Local state for society identifiers (editable)
  const [societies, setSocieties] = useState<SocietyIdentifier[]>(
    initialPublisher.society_identifiers || []
  );
  const [newSociety, setNewSociety] = useState<SocietyIdentifier>({
    society: '',
    identifier: '',
    publisher_name: '',
  });

  useEffect(() => {
    const initClient = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setApiClient(new ApiClient(async () => session?.access_token || null));
    };
    initClient();
  }, [supabase]);

  const handleSave = async () => {
    if (!apiClient) return;
    if (!publisher.name.trim()) {
      setError('Publisher name is required');
      return;
    }
    if (!publisher.cae.trim()) {
      setError('CAE/IPI number is required');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      if (isNew) {
        const response = await apiClient.post<{ publisher: Publisher }>(API_ENDPOINTS.ADMIN_PUBLISHERS, {
          account_id: publisher.account_id,
          name: publisher.name,
          cae: publisher.cae,
          main_pro: publisher.main_pro,
          main_pro_identifier: publisher.main_pro_identifier,
          mechanical_pro: publisher.mechanical_pro,
          mechanical_pro_identifier: publisher.mechanical_pro_identifier,
          performance_pro: publisher.performance_pro,
          performance_pro_identifier: publisher.performance_pro_identifier,
          sync_pro: publisher.sync_pro,
          sync_pro_identifier: publisher.sync_pro_identifier,
          controlled: publisher.controlled,
          notes: publisher.notes,
        });
        router.push(ROUTES.ADMIN_PUBLISHER(response.publisher.id));
      } else {
        await apiClient.put(`${API_ENDPOINTS.ADMIN_PUBLISHERS}/${publisher.id}`, {
          name: publisher.name,
          cae: publisher.cae,
          main_pro: publisher.main_pro,
          main_pro_identifier: publisher.main_pro_identifier,
          mechanical_pro: publisher.mechanical_pro,
          mechanical_pro_identifier: publisher.mechanical_pro_identifier,
          performance_pro: publisher.performance_pro,
          performance_pro_identifier: publisher.performance_pro_identifier,
          sync_pro: publisher.sync_pro,
          sync_pro_identifier: publisher.sync_pro_identifier,
          controlled: publisher.controlled,
          notes: publisher.notes,
          foreign_id: publisher.foreign_id,
        });
        setSuccess(true);
        setTimeout(() => router.refresh(), 1000);
      }
    } catch (err: any) {
      setError(err.message || `Failed to ${isNew ? 'create' : 'save'} publisher`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!apiClient || isNew) return;
    if (!confirm(`Delete "${publisher.name}"? This cannot be undone.`)) return;
    try {
      await apiClient.delete(`${API_ENDPOINTS.ADMIN_PUBLISHERS}/${publisher.id}`);
      router.push(ROUTES.ADMIN_PUBLISHERS);
    } catch (err: any) {
      setError(err.message || 'Failed to delete publisher');
    }
  };

  const updateField = (field: keyof Publisher, value: any) => {
    setPublisher({ ...publisher, [field]: value });
  };

  // Society identifier management
  const handleAddSociety = async () => {
    if (!apiClient || isNew || !newSociety.society.trim()) return;

    try {
      await apiClient.post(API_ENDPOINTS.ADMIN_PUBLISHER_SOCIETIES(publisher.id), {
        society: newSociety.society,
        identifier: newSociety.identifier || null,
        publisher_name: newSociety.publisher_name || null,
        mechanical_society: newSociety.mechanical_society || null,
        performance_society: newSociety.performance_society || null,
        sync_society: newSociety.sync_society || null,
      });

      // Reset form and refresh
      setNewSociety({ society: '', identifier: '', publisher_name: '' });
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Failed to add society identifier');
    }
  };

  const handleRemoveSociety = async (societyId: string) => {
    if (!apiClient || isNew) return;
    if (!confirm('Remove this society identifier?')) return;

    try {
      await apiClient.delete(`${API_ENDPOINTS.ADMIN_PUBLISHER_SOCIETIES(publisher.id)}/${societyId}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Failed to remove society identifier');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={ROUTES.ADMIN_PUBLISHERS}><ArrowLeft className="w-4 h-4" /></Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{publisher.name || 'New Publisher'}</h1>
            <p className="text-sm text-muted-foreground">
              {publisher.account?.name && (
                <>Account: <Link href={ROUTES.ADMIN_ACCOUNT(publisher.account.id)} className="text-primary hover:underline">{publisher.account.name}</Link></>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isNew && <Button variant="destructive" onClick={handleDelete}><Trash2 className="w-4 h-4 mr-2" />Delete</Button>}
          <Button onClick={handleSave} disabled={saving}><Save className="w-4 h-4 mr-2" />{saving ? 'Saving...' : 'Save'}</Button>
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <Card className="border-green-500 bg-green-50 dark:bg-green-950">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
              <CheckCircle2 className="w-5 h-5" /><span>Publisher saved!</span>
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

      {/* Account Selector - Only for new publishers */}
      {isNew && accounts.length > 0 && (
        <Card>
          <CardHeader><CardTitle>SELECT ACCOUNT</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="account">ACCOUNT <span className="text-destructive">*</span></Label>
              <Select
                value={publisher.account_id}
                onValueChange={(value) => {
                  const selectedAccount = accounts.find(a => a.id === value);
                  setPublisher({
                    ...publisher,
                    account_id: value,
                    account: selectedAccount,
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">The account this publisher belongs to</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column - Basic Info */}
        <Card>
          <CardHeader><CardTitle>PUBLISHER INFORMATION</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">NAME <span className="text-destructive">*</span></Label>
              <Input
                id="name"
                value={publisher.name}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="e.g., Priam Music"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cae">CAE/IPI NUMBER <span className="text-destructive">*</span></Label>
              <Input
                id="cae"
                value={publisher.cae}
                onChange={(e) => updateField('cae', e.target.value)}
                placeholder="e.g., 01081836453"
                required
              />
              <p className="text-xs text-muted-foreground">The CAE or IPI number for this publisher</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="foreign_id">FOREIGN ID</Label>
              <Input
                id="foreign_id"
                value={publisher.foreign_id || ''}
                onChange={(e) => updateField('foreign_id', e.target.value || null)}
                placeholder="External system ID"
              />
            </div>
            <div className="flex items-center space-x-2 pt-2">
              <Checkbox
                id="controlled"
                checked={publisher.controlled || false}
                onCheckedChange={(checked) => updateField('controlled', checked)}
              />
              <Label htmlFor="controlled">CONTROLLED</Label>
            </div>
            <p className="text-xs text-muted-foreground">Check if this publisher is controlled/administered by the account</p>
          </CardContent>
        </Card>

        {/* Right Column - PRO Info */}
        <Card>
          <CardHeader><CardTitle>AFFILIATED SOCIETIES</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {/* Main PRO */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>MAIN PRO</Label>
                <ProSelector
                  value={publisher.main_pro}
                  onChange={(value) => updateField('main_pro', value)}
                  placeholder="Select PRO..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="main_pro_identifier">IDENTIFIER</Label>
                <Input
                  id="main_pro_identifier"
                  value={publisher.main_pro_identifier || ''}
                  onChange={(e) => updateField('main_pro_identifier', e.target.value || null)}
                  placeholder="Member ID"
                />
              </div>
            </div>

            {/* Mechanical PRO */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>MECHANICAL PRO</Label>
                <ProSelector
                  value={publisher.mechanical_pro}
                  onChange={(value) => updateField('mechanical_pro', value)}
                  placeholder="Select PRO..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mechanical_pro_identifier">IDENTIFIER</Label>
                <Input
                  id="mechanical_pro_identifier"
                  value={publisher.mechanical_pro_identifier || ''}
                  onChange={(e) => updateField('mechanical_pro_identifier', e.target.value || null)}
                  placeholder="Member ID"
                />
              </div>
            </div>

            {/* Performance PRO */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>PERFORMANCE PRO</Label>
                <ProSelector
                  value={publisher.performance_pro}
                  onChange={(value) => updateField('performance_pro', value)}
                  placeholder="Select PRO..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="performance_pro_identifier">IDENTIFIER</Label>
                <Input
                  id="performance_pro_identifier"
                  value={publisher.performance_pro_identifier || ''}
                  onChange={(e) => updateField('performance_pro_identifier', e.target.value || null)}
                  placeholder="Member ID"
                />
              </div>
            </div>

            {/* Sync PRO */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>SYNC PRO</Label>
                <ProSelector
                  value={publisher.sync_pro}
                  onChange={(value) => updateField('sync_pro', value)}
                  placeholder="Select PRO..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sync_pro_identifier">IDENTIFIER</Label>
                <Input
                  id="sync_pro_identifier"
                  value={publisher.sync_pro_identifier || ''}
                  onChange={(e) => updateField('sync_pro_identifier', e.target.value || null)}
                  placeholder="Member ID"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notes Section */}
      <Card>
        <CardHeader><CardTitle>NOTES</CardTitle></CardHeader>
        <CardContent>
          <Textarea
            id="notes"
            value={publisher.notes || ''}
            onChange={(e) => updateField('notes', e.target.value || null)}
            rows={4}
            placeholder="Additional notes about this publisher..."
          />
        </CardContent>
      </Card>

      {/* Society Identifiers Section - Only show for existing publishers */}
      {!isNew && (
        <Card>
          <CardHeader>
            <CardTitle>SOCIETY IDENTIFIERS</CardTitle>
            <CardDescription>
              Set up specific publisher names and identifiers for each PRO. Used when delivering CWR to that society.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Existing Society Identifiers */}
            {societies.length > 0 && (
              <div className="space-y-2">
                {societies.map((society) => (
                  <div key={society.id} className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                    <div className="flex-1 grid grid-cols-3 gap-2">
                      <div>
                        <span className="text-xs text-muted-foreground">Society</span>
                        <p className="font-medium">{society.society}</p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">Identifier</span>
                        <p className="font-mono text-sm">{society.identifier || '-'}</p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">Publisher Name</span>
                        <p>{society.publisher_name || '-'}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => society.id && handleRemoveSociety(society.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Add New Society Form */}
            <div className="border-t pt-4 mt-4">
              <h4 className="font-medium mb-3">Add Society Identifier</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="new_society">Society</Label>
                  <Input
                    id="new_society"
                    value={newSociety.society}
                    onChange={(e) => setNewSociety({ ...newSociety, society: e.target.value })}
                    placeholder="e.g., ASCAP, BMI"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new_identifier">Identifier</Label>
                  <Input
                    id="new_identifier"
                    value={newSociety.identifier || ''}
                    onChange={(e) => setNewSociety({ ...newSociety, identifier: e.target.value })}
                    placeholder="Society identifier"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new_publisher_name">Publisher Name</Label>
                  <Input
                    id="new_publisher_name"
                    value={newSociety.publisher_name || ''}
                    onChange={(e) => setNewSociety({ ...newSociety, publisher_name: e.target.value })}
                    placeholder="Name as registered"
                  />
                </div>
              </div>
              <Button
                className="mt-3"
                variant="outline"
                onClick={handleAddSociety}
                disabled={!newSociety.society.trim()}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Society
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Linked Contracts Section - Only show for existing publishers */}
      {!isNew && publisher.linked_contracts && publisher.linked_contracts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>LINKED CONTRACTS</CardTitle>
            <CardDescription>
              Selecting this publisher on IP Chain will automatically add these contracts.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {publisher.linked_contracts.map((lc) => (
                <div key={lc.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span>{lc.contract?.name || lc.contract_id}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
