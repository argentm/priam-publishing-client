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
import { API_ENDPOINTS, ROUTES } from '@/lib/constants';
import { createClient } from '@/lib/supabase/client';
import { ApiClient } from '@/lib/api/client';
import { Save, Trash2, ArrowLeft, CheckCircle2, XCircle } from 'lucide-react';
import Link from 'next/link';

interface Contract {
  id: string;
  payee_id: string;
  account_id: string;
  name: string;
  contract_type?: string | null;
  active?: boolean;
  complete?: boolean;
  primary_contract?: boolean;
  start_date?: string | null;
  end_date?: string | null;
  currency?: string | null;
  advance?: number;
  notes?: string | null;
  payee?: { id: string; name: string };
  account?: { id: string; name: string };
  created_at: string;
  updated_at: string;
}

interface ContractEditorProps {
  contract: Contract;
  isNew?: boolean;
}

export function ContractEditor({ contract: initialContract, isNew = false }: ContractEditorProps) {
  const router = useRouter();
  const [contract, setContract] = useState<Contract>(initialContract);
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
        const response = await apiClient.post<{ contract: Contract }>(API_ENDPOINTS.ADMIN_CONTRACTS, {
          payee_id: contract.payee_id,
          account_id: contract.account_id,
          name: contract.name,
          contract_type: contract.contract_type,
          active: contract.active,
          complete: contract.complete,
          start_date: contract.start_date,
          end_date: contract.end_date,
          currency: contract.currency,
          advance: contract.advance,
          notes: contract.notes,
        });
        router.push(`${ROUTES.ADMIN_CONTRACTS}/${response.contract.id}`);
      } else {
        await apiClient.put(`${API_ENDPOINTS.ADMIN_CONTRACTS}/${contract.id}`, contract);
        setSuccess(true);
        setTimeout(() => router.refresh(), 1000);
      }
    } catch (err: any) {
      setError(err.message || `Failed to ${isNew ? 'create' : 'save'} contract`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!apiClient || isNew) return;
    if (!confirm(`Delete "${contract.name}"?`)) return;
    try {
      await apiClient.delete(`${API_ENDPOINTS.ADMIN_CONTRACTS}/${contract.id}`);
      router.push(ROUTES.ADMIN_CONTRACTS);
    } catch (err: any) {
      setError(err.message || 'Failed to delete contract');
    }
  };

  const updateField = (field: keyof Contract, value: any) => {
    setContract({ ...contract, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={ROUTES.ADMIN_CONTRACTS}><ArrowLeft className="w-4 h-4" /></Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{contract.name || 'Unnamed Contract'}</h1>
            <p className="text-sm text-muted-foreground">
              {contract.account?.name && (
                <>Account: <Link href={ROUTES.ADMIN_ACCOUNT(contract.account.id)} className="text-primary hover:underline">{contract.account.name}</Link></>
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
              <CheckCircle2 className="w-5 h-5" /><span>Contract saved!</span>
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
          <CardHeader><CardTitle>CONTRACT INFORMATION</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">NAME <span className="text-destructive">*</span></Label>
              <Input id="name" value={contract.name} onChange={(e) => updateField('name', e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contract_type">TYPE</Label>
              <Select value={contract.contract_type || ''} onValueChange={(value) => updateField('contract_type', value || null)}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="publishing">Publishing</SelectItem>
                  <SelectItem value="administration">Administration</SelectItem>
                  <SelectItem value="sync">Sync</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="payee_id">PAYEE ID</Label>
              <Input id="payee_id" value={contract.payee_id} onChange={(e) => updateField('payee_id', e.target.value)} required={isNew} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="start_date">START DATE</Label>
              <Input id="start_date" type="date" value={contract.start_date || ''} onChange={(e) => updateField('start_date', e.target.value || null)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_date">END DATE</Label>
              <Input id="end_date" type="date" value={contract.end_date || ''} onChange={(e) => updateField('end_date', e.target.value || null)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">CURRENCY</Label>
              <Select value={contract.currency || ''} onValueChange={(value) => updateField('currency', value || null)}>
                <SelectTrigger><SelectValue placeholder="Select currency" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="advance">ADVANCE</Label>
              <Input id="advance" type="number" step="0.01" value={contract.advance || ''} onChange={(e) => updateField('advance', e.target.value ? parseFloat(e.target.value) : 0)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">NOTES</Label>
              <Textarea id="notes" value={contract.notes || ''} onChange={(e) => updateField('notes', e.target.value || null)} rows={4} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>STATUS</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox id="active" checked={contract.active || false} onCheckedChange={(checked) => updateField('active', checked)} />
              <Label htmlFor="active">ACTIVE</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="complete" checked={contract.complete || false} onCheckedChange={(checked) => updateField('complete', checked)} />
              <Label htmlFor="complete">COMPLETE</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="primary_contract" checked={contract.primary_contract || false} onCheckedChange={(checked) => updateField('primary_contract', checked)} />
              <Label htmlFor="primary_contract">PRIMARY CONTRACT</Label>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

