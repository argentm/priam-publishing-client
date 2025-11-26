'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { API_ENDPOINTS, ROUTES } from '@/lib/constants';
import { createClient } from '@/lib/supabase/client';
import { ApiClient } from '@/lib/api/client';
import { PRO_LIST } from '@/lib/constants/pros';
import { 
  ArrowLeft, 
  ArrowRight, 
  Save, 
  CheckCircle2, 
  XCircle, 
  Plus, 
  Trash2, 
  UserCircle, 
  Music, 
  AlertCircle, 
  Check,
  ChevronsUpDown
} from 'lucide-react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

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
  created_at: string;
  updated_at: string;
}

interface UserComposerEditorProps {
  composer: Composer;
  accountId: string;
  accountName: string;
  isNew?: boolean;
}

export function UserComposerEditor({
  composer: initialComposer,
  accountId,
  accountName,
  isNew = false,
}: UserComposerEditorProps) {
  const router = useRouter();
  const [composer, setComposer] = useState<Composer>(initialComposer);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const supabase = createClient();
  const [apiClient, setApiClient] = useState<ApiClient | null>(null);

  const [open, setOpen] = useState(false);

  useEffect(() => {
    const initClient = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setApiClient(new ApiClient(async () => session?.access_token || null));
    };
    initClient();
  }, [supabase]);

  const handleSave = async () => {
    if (!apiClient) return;

    if (!composer.name.trim()) {
      setError('Composer name is required');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const payload = {
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
      };

      if (isNew) {
        const response = await apiClient.post<{ composer: Composer }>(
          API_ENDPOINTS.DASHBOARD_COMPOSERS(accountId),
          payload
        );
        router.push(`${ROUTES.WORKSPACE_COMPOSERS(accountId)}/${response.composer.id}`);
      } else {
        await apiClient.put(
          `${API_ENDPOINTS.DASHBOARD_COMPOSERS(accountId)}/${composer.id}`,
          payload
        );
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          router.refresh();
        }, 1500);
      }
    } catch (err: any) {
      setError(err.message || `Failed to ${isNew ? 'create' : 'save'} composer`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!apiClient || isNew) return;
    if (!confirm(`Are you sure you want to delete "${composer.name}"? This action cannot be undone.`)) return;

    setDeleting(true);
    setError(null);

    try {
      await apiClient.delete(`${API_ENDPOINTS.DASHBOARD_COMPOSERS(accountId)}/${composer.id}`);
      router.push(ROUTES.WORKSPACE_COMPOSERS(accountId));
    } catch (err: any) {
      setError(err.message || 'Failed to delete composer');
      setDeleting(false);
    }
  };

  const updateField = (field: keyof Composer, value: any) => {
    setComposer({ ...composer, [field]: value });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={ROUTES.WORKSPACE_COMPOSERS(accountId)}>
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <UserCircle className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">
                {isNew ? 'New Composer' : composer.name || 'Unnamed Composer'}
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
            {saving ? 'Saving...' : isNew ? 'Create Composer' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Status Messages */}
      {success && (
        <Card className="border-green-500 bg-green-50 dark:bg-green-950">
          <CardContent className="py-4">
            <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
              <CheckCircle2 className="w-5 h-5" />
              <span>Composer saved successfully!</span>
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
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Core composer identity details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Full Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={composer.name}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="e.g., John Smith"
                required
              />
              <p className="text-xs text-muted-foreground">
                The full professional name as it appears on registrations
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name</Label>
                <Input
                  id="first_name"
                  value={composer.first_name || ''}
                  onChange={(e) => updateField('first_name', e.target.value || null)}
                  placeholder="John"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="surname">Surname</Label>
                <Input
                  id="surname"
                  value={composer.surname || ''}
                  onChange={(e) => updateField('surname', e.target.value || null)}
                  placeholder="Smith"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="middle_names">Middle Names</Label>
              <Input
                id="middle_names"
                value={composer.middle_names || ''}
                onChange={(e) => updateField('middle_names', e.target.value || null)}
                placeholder="Optional"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cae">CAE/IPI Number</Label>
              <Input
                id="cae"
                value={composer.cae || ''}
                onChange={(e) => updateField('cae', e.target.value || null)}
                placeholder="I-000000000-0"
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">
                Unique identifier assigned by your PRO
              </p>
            </div>
            <div className="flex items-center space-x-3 pt-2">
              <Checkbox
                id="controlled"
                checked={composer.controlled || false}
                onCheckedChange={(checked) => updateField('controlled', checked)}
              />
              <div>
                <Label htmlFor="controlled" className="font-medium cursor-pointer">
                  Controlled Writer
                </Label>
                <p className="text-xs text-muted-foreground">
                  Check if this writer's publishing is administered by your account
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* PRO Information */}
        <Card>
          <CardHeader>
            <CardTitle>PRO Information</CardTitle>
            <CardDescription>Performing Rights Organization details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="main_pro">Main PRO</Label>
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={open}
                      className="w-full justify-between"
                    >
                      {composer.main_pro
                        ? PRO_LIST.find((pro) => pro.value === composer.main_pro)?.label || composer.main_pro
                        : "Select PRO..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Search PRO..." />
                      <CommandList>
                        <CommandEmpty>No PRO found.</CommandEmpty>
                        <CommandGroup>
                          {PRO_LIST.map((pro) => (
                            <CommandItem
                              key={pro.value || 'no-pro'}
                              value={pro.label}
                              onSelect={(currentValue) => {
                                const selected = PRO_LIST.find(item => item.label.toLowerCase() === currentValue.toLowerCase());
                                // Store the value (uppercase enum) or null for "No PRO"
                                updateField('main_pro', selected?.value || null);
                                setOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  composer.main_pro === pro.value ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {pro.label}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label htmlFor="main_pro_identifier">PRO Member ID</Label>
                <Input
                  id="main_pro_identifier"
                  value={composer.main_pro_identifier || ''}
                  onChange={(e) => updateField('main_pro_identifier', e.target.value || null)}
                  placeholder="Member number"
                  className="font-mono"
                />
              </div>
            </div>

            <div className="border-t pt-4">
              <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">
                Additional PROs (if different)
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="mechanical_pro">Mechanical PRO</Label>
                  <Input
                    id="mechanical_pro"
                    value={composer.mechanical_pro || ''}
                    onChange={(e) => updateField('mechanical_pro', e.target.value || null)}
                    placeholder="e.g., MCPS"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mechanical_pro_identifier">ID</Label>
                  <Input
                    id="mechanical_pro_identifier"
                    value={composer.mechanical_pro_identifier || ''}
                    onChange={(e) => updateField('mechanical_pro_identifier', e.target.value || null)}
                    className="font-mono"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-3">
                <div className="space-y-2">
                  <Label htmlFor="performance_pro">Performance PRO</Label>
                  <Input
                    id="performance_pro"
                    value={composer.performance_pro || ''}
                    onChange={(e) => updateField('performance_pro', e.target.value || null)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="performance_pro_identifier">ID</Label>
                  <Input
                    id="performance_pro_identifier"
                    value={composer.performance_pro_identifier || ''}
                    onChange={(e) => updateField('performance_pro_identifier', e.target.value || null)}
                    className="font-mono"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-3">
                <div className="space-y-2">
                  <Label htmlFor="sync_pro">Sync PRO</Label>
                  <Input
                    id="sync_pro"
                    value={composer.sync_pro || ''}
                    onChange={(e) => updateField('sync_pro', e.target.value || null)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sync_pro_identifier">ID</Label>
                  <Input
                    id="sync_pro_identifier"
                    value={composer.sync_pro_identifier || ''}
                    onChange={(e) => updateField('sync_pro_identifier', e.target.value || null)}
                    className="font-mono"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Notes</CardTitle>
            <CardDescription>Additional information about this composer</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              id="notes"
              value={composer.notes || ''}
              onChange={(e) => updateField('notes', e.target.value || null)}
              placeholder="Add any notes or additional information..."
              rows={4}
            />
          </CardContent>
        </Card>
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t">
        <Button variant="outline" asChild>
          <Link href={ROUTES.WORKSPACE_COMPOSERS(accountId)}>Cancel</Link>
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : isNew ? 'Create Composer' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
}

