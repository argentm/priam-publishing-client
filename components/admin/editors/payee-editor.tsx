'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CountrySelect } from '@/components/ui/country-select';
import { API_ENDPOINTS, ROUTES } from '@/lib/constants';
import { createClient } from '@/lib/supabase/client';
import { ApiClient } from '@/lib/api/client';
import { Save, Trash2, ArrowLeft, CheckCircle2, XCircle, User as UserIcon, ChevronsUpDown, X, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface User {
  id: string;
  email: string | null;
  full_name: string | null;
}

interface Payee {
  id: string;
  account_id: string;
  user_id?: string | null;
  name: string;
  client_id?: string | null;
  foreign_id?: string | null;
  country?: string | null;
  address?: string | null;
  vat_no?: string | null;
  contact_email?: string | null;
  notes?: string | null;
  opening_balance?: number | null;
  min_payout?: number | null;
  payment_currency?: string | null;
  self_billing?: boolean;
  auto_payment?: boolean;
  account?: {
    id: string;
    name: string;
  };
  user?: User | null;
  created_at: string;
  updated_at: string;
}

interface PayeeEditorProps {
  payee: Payee;
  isNew?: boolean;
}

export function PayeeEditor({ payee: initialPayee, isNew = false }: PayeeEditorProps) {
  const router = useRouter();
  const [payee, setPayee] = useState<Payee>(initialPayee);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [userSelectOpen, setUserSelectOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(initialPayee.user || null);
  const supabase = createClient();
  const [apiClient, setApiClient] = useState<ApiClient | null>(null);

  useEffect(() => {
    const initClient = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setApiClient(new ApiClient(async () => session?.access_token || null));
    };
    initClient();
  }, [supabase]);

  // Debounced user search
  const searchUsers = useCallback(async (search: string) => {
    if (!apiClient) return;
    setLoadingUsers(true);
    try {
      const params = new URLSearchParams({ limit: '20' });
      if (search.trim()) {
        params.append('search', search.trim());
      }
      const response = await apiClient.get<{ users: User[]; total: number }>(
        `${API_ENDPOINTS.ADMIN_USERS}?${params.toString()}`
      );
      setUsers(response.users || []);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoadingUsers(false);
    }
  }, [apiClient]);

  // Initial load and search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      searchUsers(userSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [userSearch, searchUsers]);

  const handleSave = async () => {
    if (!apiClient) return;
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      if (isNew) {
        const response = await apiClient.post<{ payee: Payee }>(API_ENDPOINTS.ADMIN_PAYEES, {
          account_id: payee.account_id,
          user_id: payee.user_id,
          name: payee.name,
          client_id: payee.client_id,
          foreign_id: payee.foreign_id,
          country: payee.country,
          address: payee.address,
          vat_no: payee.vat_no,
          contact_email: payee.contact_email,
          notes: payee.notes,
          opening_balance: payee.opening_balance,
          min_payout: payee.min_payout,
          payment_currency: payee.payment_currency,
          self_billing: payee.self_billing,
          auto_payment: payee.auto_payment,
        });
        router.push(`${ROUTES.ADMIN_PAYEES}/${response.payee.id}`);
      } else {
        await apiClient.put(`${API_ENDPOINTS.ADMIN_PAYEES}/${payee.id}`, payee);
        setSuccess(true);
        setTimeout(() => router.refresh(), 1000);
      }
    } catch (err: any) {
      setError(err.message || `Failed to ${isNew ? 'create' : 'save'} payee`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!apiClient || isNew) return;
    if (!confirm(`Delete "${payee.name}"?`)) return;
    try {
      await apiClient.delete(`${API_ENDPOINTS.ADMIN_PAYEES}/${payee.id}`);
      router.push(ROUTES.ADMIN_PAYEES);
    } catch (err: any) {
      setError(err.message || 'Failed to delete payee');
    }
  };

  const updateField = (field: keyof Payee, value: any) => {
    setPayee({ ...payee, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={ROUTES.ADMIN_PAYEES}><ArrowLeft className="w-4 h-4" /></Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{payee.name || 'Unnamed Payee'}</h1>
            <p className="text-sm text-muted-foreground">
              {payee.account?.name && (
                <>Account: <Link href={ROUTES.ADMIN_ACCOUNT(payee.account.id)} className="text-primary hover:underline">{payee.account.name}</Link></>
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
              <CheckCircle2 className="w-5 h-5" /><span>Payee saved!</span>
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
          <CardHeader><CardTitle>PAYEE INFORMATION</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">NAME <span className="text-destructive">*</span></Label>
              <Input id="name" value={payee.name} onChange={(e) => updateField('name', e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="user_id">LINKED USER</Label>
              <Popover open={userSelectOpen} onOpenChange={setUserSelectOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={userSelectOpen}
                    className="w-full justify-between font-normal"
                  >
                    {selectedUser ? (
                      <span className="flex items-center gap-2">
                        <UserIcon className="w-4 h-4" />
                        {selectedUser.full_name || selectedUser.email || selectedUser.id}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">Select a user (optional)</span>
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0" align="start">
                  <Command shouldFilter={false}>
                    <CommandInput
                      placeholder="Search users by name or email..."
                      value={userSearch}
                      onValueChange={setUserSearch}
                    />
                    <CommandList>
                      {loadingUsers ? (
                        <div className="flex items-center justify-center py-6">
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          <span className="text-sm text-muted-foreground">Searching...</span>
                        </div>
                      ) : (
                        <>
                          <CommandEmpty>No users found.</CommandEmpty>
                          <CommandGroup>
                            {selectedUser && (
                              <CommandItem
                                value="clear"
                                onSelect={() => {
                                  setSelectedUser(null);
                                  updateField('user_id', null);
                                  setUserSelectOpen(false);
                                }}
                                className="text-muted-foreground"
                              >
                                <X className="w-4 h-4 mr-2" />
                                Clear selection
                              </CommandItem>
                            )}
                            {users.map((user) => (
                              <CommandItem
                                key={user.id}
                                value={user.id}
                                onSelect={() => {
                                  setSelectedUser(user);
                                  updateField('user_id', user.id);
                                  setUserSelectOpen(false);
                                }}
                              >
                                <UserIcon className={cn("w-4 h-4 mr-2", selectedUser?.id === user.id ? "text-primary" : "")} />
                                <div className="flex flex-col">
                                  <span className={cn(selectedUser?.id === user.id && "font-medium")}>
                                    {user.full_name || user.email || user.id}
                                  </span>
                                  {user.full_name && user.email && (
                                    <span className="text-xs text-muted-foreground">{user.email}</span>
                                  )}
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </>
                      )}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <p className="text-xs text-muted-foreground">Link this payee to a user account for portal access</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="client_id">CLIENT ID</Label>
              <Input id="client_id" value={payee.client_id || ''} onChange={(e) => updateField('client_id', e.target.value || null)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="foreign_id">FOREIGN ID</Label>
              <Input id="foreign_id" value={payee.foreign_id || ''} onChange={(e) => updateField('foreign_id', e.target.value || null)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact_email">CONTACT EMAIL</Label>
              <Input id="contact_email" type="email" value={payee.contact_email || ''} onChange={(e) => updateField('contact_email', e.target.value || null)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">COUNTRY</Label>
              <CountrySelect
                id="country"
                value={payee.country}
                onValueChange={(value) => updateField('country', value)}
                placeholder="Select country"
              />
              <p className="text-xs text-muted-foreground">ISO 3166-1 alpha-2 country code</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">ADDRESS</Label>
              <Textarea id="address" value={payee.address || ''} onChange={(e) => updateField('address', e.target.value || null)} rows={3} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vat_no">VAT NUMBER</Label>
              <Input id="vat_no" value={payee.vat_no || ''} onChange={(e) => updateField('vat_no', e.target.value || null)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">NOTES</Label>
              <Textarea id="notes" value={payee.notes || ''} onChange={(e) => updateField('notes', e.target.value || null)} rows={4} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>PAYMENT SETTINGS</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="payment_currency">PAYMENT CURRENCY</Label>
              <Input id="payment_currency" value={payee.payment_currency || ''} onChange={(e) => updateField('payment_currency', e.target.value || null)} placeholder="USD" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="opening_balance">OPENING BALANCE</Label>
              <Input id="opening_balance" type="number" step="0.01" value={payee.opening_balance || ''} onChange={(e) => updateField('opening_balance', e.target.value ? parseFloat(e.target.value) : null)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="min_payout">MINIMUM PAYOUT</Label>
              <Input id="min_payout" type="number" step="0.01" value={payee.min_payout || ''} onChange={(e) => updateField('min_payout', e.target.value ? parseFloat(e.target.value) : null)} />
            </div>
            <div className="flex items-center space-x-2 pt-4">
              <Checkbox id="self_billing" checked={payee.self_billing || false} onCheckedChange={(checked) => updateField('self_billing', checked)} />
              <Label htmlFor="self_billing">SELF BILLING</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="auto_payment" checked={payee.auto_payment || false} onCheckedChange={(checked) => updateField('auto_payment', checked)} />
              <Label htmlFor="auto_payment">AUTO PAYMENT</Label>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
