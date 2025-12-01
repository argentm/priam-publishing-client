'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { API_ENDPOINTS, ROUTES } from '@/lib/constants';
import { createClient } from '@/lib/supabase/client';
import { ApiClient } from '@/lib/api/client';
import { sanitizeApiError } from '@/lib/utils/api-errors';
import {
  Save,
  Trash2,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  FileSignature,
  ChevronsUpDown,
  Check,
  User,
  Building2,
  Loader2,
  Calendar,
  DollarSign,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface PayeeWithRelations {
  id: string;
  name: string;
  user_id?: string | null;
  account_id?: string | null;
  client_id?: string | null;
  country?: string;
  user?: {
    id: string;
    email?: string;
    full_name?: string;
  } | null;
  account?: {
    id: string;
    name: string;
  } | null;
}

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

interface Account {
  id: string;
  name: string;
}

interface ContractEditorProps {
  contract: Contract;
  isNew?: boolean;
}

export function ContractEditor({ contract: initialContract, isNew = false }: ContractEditorProps) {
  const router = useRouter();
  const supabase = createClient();

  const [contract, setContract] = useState<Contract>(initialContract);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [apiClient, setApiClient] = useState<ApiClient | null>(null);

  // Payee selector state
  const [payees, setPayees] = useState<PayeeWithRelations[]>([]);
  const [loadingPayees, setLoadingPayees] = useState(false);
  const [payeePopoverOpen, setPayeePopoverOpen] = useState(false);
  const [payeeSearch, setPayeeSearch] = useState('');

  // Account selector state
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const [accountPopoverOpen, setAccountPopoverOpen] = useState(false);
  const [accountSearch, setAccountSearch] = useState('');

  // Initialize API client
  useEffect(() => {
    const initClient = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setApiClient(new ApiClient(async () => session?.access_token || null));
    };
    initClient();
  }, [supabase]);

  // Load payees for selector
  const loadPayees = useCallback(async () => {
    if (!apiClient) return;
    setLoadingPayees(true);
    try {
      const response = await apiClient.get<{ payees: PayeeWithRelations[]; total: number }>(
        `${API_ENDPOINTS.ADMIN_PAYEES}?limit=100`
      );
      setPayees(response.payees || []);
    } catch {
      // Silent fail - payees will be empty
    } finally {
      setLoadingPayees(false);
    }
  }, [apiClient]);

  // Load accounts for selector
  const loadAccounts = useCallback(async () => {
    if (!apiClient) return;
    setLoadingAccounts(true);
    try {
      const response = await apiClient.get<Account[]>(API_ENDPOINTS.ADMIN_ACCOUNTS);
      setAccounts(response || []);
    } catch {
      // Silent fail - accounts will be empty
    } finally {
      setLoadingAccounts(false);
    }
  }, [apiClient]);

  // Load data on mount
  useEffect(() => {
    if (apiClient) {
      loadPayees();
      loadAccounts();
    }
  }, [apiClient, loadPayees, loadAccounts]);

  // Get selected payee object
  const selectedPayee = useMemo(() => {
    return payees.find(p => p.id === contract.payee_id) || null;
  }, [payees, contract.payee_id]);

  // Get selected account object
  const selectedAccount = useMemo(() => {
    return accounts.find(a => a.id === contract.account_id) || null;
  }, [accounts, contract.account_id]);

  // Filter payees based on search
  const filteredPayees = useMemo(() => {
    if (!payeeSearch.trim()) return payees;
    const search = payeeSearch.toLowerCase();
    return payees.filter(p =>
      p.name.toLowerCase().includes(search) ||
      p.user?.email?.toLowerCase().includes(search) ||
      p.user?.full_name?.toLowerCase().includes(search) ||
      p.account?.name?.toLowerCase().includes(search) ||
      p.client_id?.toLowerCase().includes(search)
    );
  }, [payees, payeeSearch]);

  // Filter accounts based on search
  const filteredAccounts = useMemo(() => {
    if (!accountSearch.trim()) return accounts;
    const search = accountSearch.toLowerCase();
    return accounts.filter(a =>
      a.name.toLowerCase().includes(search)
    );
  }, [accounts, accountSearch]);

  const handleSave = async () => {
    if (!apiClient) return;

    // Validation
    if (!contract.name.trim()) {
      setError('Contract name is required');
      return;
    }
    if (!contract.payee_id) {
      setError('Please select a payee');
      return;
    }
    if (!contract.account_id) {
      setError('Please select an account');
      return;
    }

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
          primary_contract: contract.primary_contract,
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
    } catch (err) {
      setError(sanitizeApiError(err, `Failed to ${isNew ? 'create' : 'save'} contract`));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!apiClient || isNew) return;
    if (!confirm(`Delete contract "${contract.name}"? This cannot be undone.`)) return;

    try {
      await apiClient.delete(`${API_ENDPOINTS.ADMIN_CONTRACTS}/${contract.id}`);
      router.push(ROUTES.ADMIN_CONTRACTS);
    } catch (err) {
      setError(sanitizeApiError(err, 'Failed to delete contract'));
    }
  };

  const updateField = (field: keyof Contract, value: unknown) => {
    setContract({ ...contract, [field]: value });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={ROUTES.ADMIN_CONTRACTS} aria-label="Back to contracts">
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold gradient-text">
              {isNew ? 'New Contract' : contract.name || 'Unnamed Contract'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isNew ? 'Create a new contract agreement' : 'Manage contract details'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isNew && (
            <Button variant="destructive" onClick={handleDelete} disabled={saving}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          )}
          <Button onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : isNew ? 'Create Contract' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-destructive/10 border-l-4 border-destructive p-4 text-sm text-destructive">
          <XCircle className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 rounded-xl bg-green-500/10 border-l-4 border-green-500 p-4 text-sm text-green-600">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          Contract saved successfully!
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contract Information Card */}
        <Card>
          <CardHeader className="bg-gradient-to-r from-primary/5 via-accent/5 to-secondary/5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <FileSignature className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle>Contract Information</CardTitle>
                <CardDescription>Basic contract details</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-xs font-semibold text-foreground/70">
                Contract Name <span className="text-primary">*</span>
              </Label>
              <Input
                id="name"
                value={contract.name}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="Enter contract name"
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold text-foreground/70">
                Contract Type
              </Label>
              <Select
                value={contract.contract_type || ''}
                onValueChange={(value) => updateField('contract_type', value || null)}
              >
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="publishing">Publishing</SelectItem>
                  <SelectItem value="administration">Administration</SelectItem>
                  <SelectItem value="sync">Sync</SelectItem>
                  <SelectItem value="mechanical">Mechanical</SelectItem>
                  <SelectItem value="performance">Performance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date" className="text-xs font-semibold text-foreground/70 flex items-center gap-2">
                  <Calendar className="w-3 h-3" /> Start Date
                </Label>
                <Input
                  id="start_date"
                  type="date"
                  value={contract.start_date || ''}
                  onChange={(e) => updateField('start_date', e.target.value || null)}
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_date" className="text-xs font-semibold text-foreground/70 flex items-center gap-2">
                  <Calendar className="w-3 h-3" /> End Date
                </Label>
                <Input
                  id="end_date"
                  type="date"
                  value={contract.end_date || ''}
                  onChange={(e) => updateField('end_date', e.target.value || null)}
                  className="h-12"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-foreground/70">Currency</Label>
                <Select
                  value={contract.currency || ''}
                  onValueChange={(value) => updateField('currency', value || null)}
                >
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="advance" className="text-xs font-semibold text-foreground/70 flex items-center gap-2">
                  <DollarSign className="w-3 h-3" /> Advance
                </Label>
                <Input
                  id="advance"
                  type="number"
                  step="0.01"
                  value={contract.advance || ''}
                  onChange={(e) => updateField('advance', e.target.value ? parseFloat(e.target.value) : 0)}
                  placeholder="0.00"
                  className="h-12"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="text-xs font-semibold text-foreground/70">Notes</Label>
              <Textarea
                id="notes"
                value={contract.notes || ''}
                onChange={(e) => updateField('notes', e.target.value || null)}
                rows={4}
                placeholder="Additional notes about this contract..."
              />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {/* Payee & Account Card */}
          <Card>
            <CardHeader className="bg-gradient-to-r from-primary/5 via-accent/5 to-secondary/5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Payee & Account</CardTitle>
                  <CardDescription>Link contract to payee and account</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {/* Payee Selector */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-foreground/70">
                  Payee <span className="text-primary">*</span>
                </Label>
                <Popover open={payeePopoverOpen} onOpenChange={setPayeePopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={payeePopoverOpen}
                      className="w-full h-auto min-h-12 justify-between"
                    >
                      {selectedPayee ? (
                        <div className="flex flex-col items-start gap-0.5">
                          <span className="font-medium">{selectedPayee.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {selectedPayee.user?.full_name || selectedPayee.user?.email || 'No user linked'}
                            {selectedPayee.account && ` • ${selectedPayee.account.name}`}
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Select a payee...</span>
                      )}
                      {loadingPayees ? (
                        <Loader2 className="w-4 h-4 ml-2 shrink-0 animate-spin" />
                      ) : (
                        <ChevronsUpDown className="w-4 h-4 ml-2 shrink-0 opacity-50" />
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[400px] p-0" align="start">
                    <Command shouldFilter={false}>
                      <CommandInput
                        placeholder="Search payees..."
                        value={payeeSearch}
                        onValueChange={setPayeeSearch}
                      />
                      <CommandList>
                        <CommandEmpty>
                          {loadingPayees ? 'Loading...' : 'No payees found.'}
                        </CommandEmpty>
                        <CommandGroup>
                          {filteredPayees.map((payee) => (
                            <CommandItem
                              key={payee.id}
                              value={payee.id}
                              onSelect={() => {
                                updateField('payee_id', payee.id);
                                // Also set account if payee has one and contract doesn't
                                if (payee.account_id && !contract.account_id) {
                                  updateField('account_id', payee.account_id);
                                }
                                setPayeePopoverOpen(false);
                                setPayeeSearch('');
                              }}
                              className="flex items-center gap-3 p-3"
                            >
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                <User className="w-4 h-4 text-primary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{payee.name}</p>
                                <p className="text-xs text-muted-foreground truncate">
                                  {payee.user?.full_name || payee.user?.email || 'No user'}
                                  {payee.account && ` • ${payee.account.name}`}
                                </p>
                              </div>
                              <Check
                                className={cn(
                                  "w-4 h-4 shrink-0",
                                  contract.payee_id === payee.id ? "opacity-100" : "opacity-0"
                                )}
                              />
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                {selectedPayee && (
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary" className="text-xs">
                      ID: {selectedPayee.id.slice(0, 8)}...
                    </Badge>
                    {selectedPayee.country && (
                      <Badge variant="outline" className="text-xs">
                        {selectedPayee.country}
                      </Badge>
                    )}
                  </div>
                )}
              </div>

              {/* Account Selector */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-foreground/70">
                  Account <span className="text-primary">*</span>
                </Label>
                <Popover open={accountPopoverOpen} onOpenChange={setAccountPopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={accountPopoverOpen}
                      className="w-full h-12 justify-between"
                    >
                      {selectedAccount ? (
                        <span className="font-medium">{selectedAccount.name}</span>
                      ) : (
                        <span className="text-muted-foreground">Select an account...</span>
                      )}
                      {loadingAccounts ? (
                        <Loader2 className="w-4 h-4 ml-2 shrink-0 animate-spin" />
                      ) : (
                        <ChevronsUpDown className="w-4 h-4 ml-2 shrink-0 opacity-50" />
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[400px] p-0" align="start">
                    <Command shouldFilter={false}>
                      <CommandInput
                        placeholder="Search accounts..."
                        value={accountSearch}
                        onValueChange={setAccountSearch}
                      />
                      <CommandList>
                        <CommandEmpty>
                          {loadingAccounts ? 'Loading...' : 'No accounts found.'}
                        </CommandEmpty>
                        <CommandGroup>
                          {filteredAccounts.map((account) => (
                            <CommandItem
                              key={account.id}
                              value={account.id}
                              onSelect={() => {
                                updateField('account_id', account.id);
                                setAccountPopoverOpen(false);
                                setAccountSearch('');
                              }}
                              className="flex items-center gap-3 p-3"
                            >
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                <Building2 className="w-4 h-4 text-primary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{account.name}</p>
                              </div>
                              <Check
                                className={cn(
                                  "w-4 h-4 shrink-0",
                                  contract.account_id === account.id ? "opacity-100" : "opacity-0"
                                )}
                              />
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </CardContent>
          </Card>

          {/* Status Card */}
          <Card>
            <CardHeader className="bg-gradient-to-r from-primary/5 via-accent/5 to-secondary/5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Status</CardTitle>
                  <CardDescription>Contract status flags</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center space-x-3 p-4 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors">
                <Checkbox
                  id="active"
                  checked={contract.active || false}
                  onCheckedChange={(checked) => updateField('active', checked)}
                />
                <div className="flex-1">
                  <Label htmlFor="active" className="text-sm font-semibold cursor-pointer">
                    Active
                  </Label>
                  <p className="text-xs text-muted-foreground">Contract is currently in effect</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-4 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors">
                <Checkbox
                  id="complete"
                  checked={contract.complete || false}
                  onCheckedChange={(checked) => updateField('complete', checked)}
                />
                <div className="flex-1">
                  <Label htmlFor="complete" className="text-sm font-semibold cursor-pointer">
                    Complete
                  </Label>
                  <p className="text-xs text-muted-foreground">All terms have been fulfilled</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-4 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors">
                <Checkbox
                  id="primary_contract"
                  checked={contract.primary_contract || false}
                  onCheckedChange={(checked) => updateField('primary_contract', checked)}
                />
                <div className="flex-1">
                  <Label htmlFor="primary_contract" className="text-sm font-semibold cursor-pointer">
                    Primary Contract
                  </Label>
                  <p className="text-xs text-muted-foreground">Main contract for this payee</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
