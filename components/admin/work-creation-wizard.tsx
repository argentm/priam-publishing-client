'use client';

import { useState, useMemo } from 'react';
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
import { Badge } from '@/components/ui/badge';
import { API_ENDPOINTS, ROUTES } from '@/lib/constants';
import { createClient } from '@/lib/supabase/client';
import { ApiClient } from '@/lib/api/client';
import { ArrowLeft, ArrowRight, Save, Building2, CheckCircle2, XCircle, Search, X } from 'lucide-react';
import Link from 'next/link';

interface Account {
  id: string;
  name: string;
  client_id?: string | null;
  created_at: string;
  updated_at: string;
}

interface WorkCreationWizardProps {
  accounts: Account[];
}

interface WorkFormData {
  account_id: string;
  title: string;
  iswc?: string;
  tunecode?: string;
  foreign_id?: string;
  project_id?: string;
  notes?: string;
  grand_rights: boolean;
  priority: boolean;
  production_library: boolean;
  work_language?: string;
  work_description_category?: string;
  duration?: number;
  composite_type?: string;
  composite_count: number;
  version_type?: string;
  arrangement_type?: string;
  copyright_date?: string;
  label_copy?: string;
}

export function WorkCreationWizard({ accounts }: WorkCreationWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState<'account' | 'basic' | 'details'>(accounts.length === 1 ? 'basic' : 'account');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accountSearch, setAccountSearch] = useState('');

  const [formData, setFormData] = useState<WorkFormData>({
    account_id: accounts.length === 1 ? accounts[0].id : '',
    title: '',
    grand_rights: false,
    priority: false,
    production_library: false,
    composite_count: 0,
  });

  const selectedAccount = accounts.find(a => a.id === formData.account_id);

  // Filter accounts based on search query
  const filteredAccounts = useMemo(() => {
    if (!accountSearch.trim()) return accounts;
    const query = accountSearch.toLowerCase();
    return accounts.filter(
      (account) =>
        account.name.toLowerCase().includes(query) ||
        account.client_id?.toLowerCase().includes(query)
    );
  }, [accounts, accountSearch]);

  const updateField = <K extends keyof WorkFormData>(field: K, value: WorkFormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!formData.account_id || !formData.title) {
      setError('Please select an account and provide a title');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const apiClient = new ApiClient(async () => session?.access_token || null);

      const response = await apiClient.post<{ work: any }>(API_ENDPOINTS.ADMIN_WORKS, formData);
      
      router.push(`/admin/works/${response.work.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create work');
      setSaving(false);
    }
  };

  const canProceedToBasic = formData.account_id !== '';
  const canProceedToDetails = formData.title.trim() !== '';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={ROUTES.ADMIN_WORKS}>
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Create New Work</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {step === 'account' && 'Select the account for this work'}
              {step === 'basic' && 'Enter basic work information'}
              {step === 'details' && 'Add additional details (optional)'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">Step {step === 'account' ? '1' : step === 'basic' ? '2' : '3'} of 3</Badge>
        </div>
      </div>

      {/* Progress Indicator */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step === 'account' ? 'bg-primary text-primary-foreground' : 'bg-green-500 text-white'
              }`}>
                {step === 'account' ? '1' : <CheckCircle2 className="w-5 h-5" />}
              </div>
              <span className="font-medium">Account</span>
            </div>
            <div className="flex-1 h-px bg-border mx-4" />
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step === 'basic' ? 'bg-primary text-primary-foreground' : 
                step === 'details' ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground'
              }`}>
                {step === 'details' ? <CheckCircle2 className="w-5 h-5" /> : '2'}
              </div>
              <span className="font-medium">Basic Info</span>
            </div>
            <div className="flex-1 h-px bg-border mx-4" />
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step === 'details' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                3
              </div>
              <span className="font-medium">Details</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Message */}
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

      {/* Step: Account Selection */}
      {step === 'account' && (
        <Card>
          <CardHeader>
            <CardTitle>Select Account</CardTitle>
            <CardDescription>
              Choose which account this work belongs to. The account determines ownership and access rights.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Account Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search accounts..."
                value={accountSearch}
                onChange={(e) => setAccountSearch(e.target.value)}
                className="pl-9 pr-9"
              />
              {accountSearch && (
                <button
                  onClick={() => setAccountSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            
            {/* Search results info */}
            {accountSearch && (
              <p className="text-sm text-muted-foreground">
                {filteredAccounts.length} of {accounts.length} accounts matching &quot;{accountSearch}&quot;
              </p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredAccounts.length === 0 ? (
                <div className="col-span-2 text-center py-8 text-muted-foreground">
                  No accounts found matching &quot;{accountSearch}&quot;
                </div>
              ) : filteredAccounts.map((account) => (
                <Card
                  key={account.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    formData.account_id === account.id
                      ? 'border-primary ring-2 ring-primary'
                      : 'border-border'
                  }`}
                  onClick={() => updateField('account_id', account.id)}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{account.name}</h3>
                        {account.client_id && (
                          <p className="text-sm text-muted-foreground">Client ID: {account.client_id}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          Created {new Date(account.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      {formData.account_id === account.id && (
                        <CheckCircle2 className="w-5 h-5 text-primary" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
              }
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                onClick={() => setStep('basic')}
                disabled={!canProceedToBasic}
              >
                Next: Basic Information
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step: Basic Information */}
      {step === 'basic' && (
        <Card>
          <CardHeader>
            <CardTitle>Basic Work Information</CardTitle>
            <CardDescription>
              {selectedAccount && (
                <>
                  Creating work for: <span className="font-semibold text-foreground">{selectedAccount.name}</span>
                </>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">
                  Work Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => updateField('title', e.target.value)}
                  placeholder="Enter the work title"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="iswc">ISWC (International Standard Musical Work Code)</Label>
                <Input
                  id="iswc"
                  value={formData.iswc || ''}
                  onChange={(e) => updateField('iswc', e.target.value || undefined)}
                  placeholder="T-XXX.XXX.XXX-X"
                />
                <p className="text-xs text-muted-foreground">
                  Optional: Leave empty if not yet registered
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tunecode">Tunecode</Label>
                <Input
                  id="tunecode"
                  value={formData.tunecode || ''}
                  onChange={(e) => updateField('tunecode', e.target.value || undefined)}
                  placeholder="Enter tunecode"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes || ''}
                  onChange={(e) => updateField('notes', e.target.value || undefined)}
                  placeholder="Add any additional notes about this work"
                  rows={4}
                />
              </div>

              <div className="space-y-3">
                <Label>Quick Options</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="priority"
                      checked={formData.priority}
                      onCheckedChange={(checked) => updateField('priority', checked as boolean)}
                    />
                    <Label htmlFor="priority" className="font-normal">
                      Priority Work
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="production_library"
                      checked={formData.production_library}
                      onCheckedChange={(checked) => updateField('production_library', checked as boolean)}
                    />
                    <Label htmlFor="production_library" className="font-normal">
                      Production Library
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="grand_rights"
                      checked={formData.grand_rights}
                      onCheckedChange={(checked) => updateField('grand_rights', checked as boolean)}
                    />
                    <Label htmlFor="grand_rights" className="font-normal">
                      Grand Rights
                    </Label>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                onClick={() => setStep('account')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setStep('details')}
                  disabled={!canProceedToDetails}
                >
                  Next: Additional Details
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={saving || !canProceedToDetails}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Creating...' : 'Create Work'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step: Additional Details */}
      {step === 'details' && (
        <Card>
          <CardHeader>
            <CardTitle>Additional Details</CardTitle>
            <CardDescription>
              Optional: Add more information about the work
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="foreign_id">Foreign ID</Label>
                  <Input
                    id="foreign_id"
                    value={formData.foreign_id || ''}
                    onChange={(e) => updateField('foreign_id', e.target.value || undefined)}
                    placeholder="External system identifier"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="project_id">Project ID</Label>
                  <Input
                    id="project_id"
                    value={formData.project_id || ''}
                    onChange={(e) => updateField('project_id', e.target.value || undefined)}
                    placeholder="Project identifier"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="copyright_date">Copyright Date</Label>
                  <Input
                    id="copyright_date"
                    type="date"
                    value={formData.copyright_date || ''}
                    onChange={(e) => updateField('copyright_date', e.target.value || undefined)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="label_copy">Label Copy</Label>
                  <Input
                    id="label_copy"
                    value={formData.label_copy || ''}
                    onChange={(e) => updateField('label_copy', e.target.value || undefined)}
                    placeholder="Label copy information"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="work_language">Language</Label>
                  <Select
                    value={formData.work_language || ''}
                    onValueChange={(value) => updateField('work_language', value || undefined)}
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
                  <Label htmlFor="work_description_category">Category</Label>
                  <Select
                    value={formData.work_description_category || ''}
                    onValueChange={(value) => updateField('work_description_category', value || undefined)}
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
                  <Label htmlFor="version_type">Work Version</Label>
                  <Select
                    value={formData.version_type || ''}
                    onValueChange={(value) => updateField('version_type', value || undefined)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select version type" />
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
                  <Label htmlFor="duration">Duration (seconds)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.duration || ''}
                    onChange={(e) => updateField('duration', e.target.value ? parseInt(e.target.value) : undefined)}
                    placeholder="Duration in seconds"
                    min={0}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                onClick={() => setStep('basic')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Creating Work...' : 'Create Work'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

