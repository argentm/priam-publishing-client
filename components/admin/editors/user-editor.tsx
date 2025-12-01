'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { CountrySelect } from '@/components/ui/country-select';
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
import { Save, Trash2, ArrowLeft, CheckCircle2, XCircle, Wallet, User, Shield, CreditCard } from 'lucide-react';
import type { User as UserType, Payee } from '@/lib/types';

// Name validation regex: Unicode letters, marks, apostrophe, hyphen, space
const NAME_REGEX = /^[\p{L}\p{M}' -]+$/u;

interface Account {
  id: string;
  name: string;
}

interface UserEditorProps {
  user?: UserType;
  payee?: Payee | null;
  isNew?: boolean;
}

export function UserEditor({ user, payee: initialPayee, isNew = false }: UserEditorProps) {
  const router = useRouter();
  const supabase = createClient();

  const [formData, setFormData] = useState({
    email: user?.email || '',
    password: '',
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    is_admin: user?.is_admin || false,
  });

  // Payee state
  const [payeeEnabled, setPayeeEnabled] = useState(!!initialPayee);
  const [payeeData, setPayeeData] = useState({
    account_id: initialPayee?.account_id || '',
    name: initialPayee?.name || '',
    client_id: initialPayee?.client_id || '',
    foreign_id: initialPayee?.foreign_id || '',
    country: initialPayee?.country || '',
    vat_no: initialPayee?.vat_no || '',
  });

  // Accounts for payee assignment
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ first_name?: string; last_name?: string }>({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [apiClient, setApiClient] = useState<ApiClient | null>(null);

  // Initialize API client
  useEffect(() => {
    const initClient = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setApiClient(new ApiClient(async () => session?.access_token || null));
    };
    initClient();
  }, [supabase]);

  // Load accounts for payee selection
  const loadAccounts = useCallback(async () => {
    if (!apiClient) return;
    setLoadingAccounts(true);
    try {
      const response = await apiClient.get<Account[]>(API_ENDPOINTS.ADMIN_ACCOUNTS);
      setAccounts(response);
    } catch (err) {
      console.error('Failed to load accounts:', err);
    } finally {
      setLoadingAccounts(false);
    }
  }, [apiClient]);

  useEffect(() => {
    if (payeeEnabled && apiClient) {
      loadAccounts();
    }
  }, [payeeEnabled, loadAccounts, apiClient]);

  // Validate name fields
  const validateNames = (): boolean => {
    const errors: { first_name?: string; last_name?: string } = {};

    if (formData.first_name.trim() && formData.first_name.length > 50) {
      errors.first_name = 'First name is too long (max 50 characters)';
    } else if (formData.first_name.trim() && !NAME_REGEX.test(formData.first_name)) {
      errors.first_name = 'First name contains invalid characters';
    }

    if (formData.last_name.trim() && formData.last_name.length > 50) {
      errors.last_name = 'Last name is too long (max 50 characters)';
    } else if (formData.last_name.trim() && !NAME_REGEX.test(formData.last_name)) {
      errors.last_name = 'Last name contains invalid characters';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!validateNames()) {
      return;
    }

    // Validate payee if enabled
    if (payeeEnabled && !payeeData.account_id) {
      setError('Please select an account for the payee');
      return;
    }
    if (payeeEnabled && !payeeData.name.trim()) {
      setError('Payee name is required');
      return;
    }

    setSaving(true);

    try {
      if (!apiClient) {
        setError('You must be logged in to perform this action');
        setSaving(false);
        return;
      }

      // Build payee data for API
      const payeePayload = payeeEnabled ? {
        account_id: payeeData.account_id,
        name: payeeData.name.trim(),
        client_id: payeeData.client_id.trim() || null,
        foreign_id: payeeData.foreign_id.trim() || null,
        country: payeeData.country || undefined,
        vat_no: payeeData.vat_no.trim() || null,
      } : (initialPayee ? null : undefined);

      if (isNew) {
        if (!formData.password) {
          setError('Password is required for new users');
          setSaving(false);
          return;
        }

        const response = await apiClient.post<{ message: string; user: UserType; payee: Payee | null }>(API_ENDPOINTS.ADMIN_USERS, {
          email: formData.email,
          password: formData.password,
          first_name: formData.first_name.trim() || undefined,
          last_name: formData.last_name.trim() || undefined,
          is_admin: formData.is_admin,
          payee: payeeEnabled ? payeePayload : undefined,
        });

        router.push(`${ROUTES.ADMIN_USERS}/${response.user.id}`);
      } else if (user) {
        await apiClient.put<{ user: UserType; payee: Payee | null }>(`${API_ENDPOINTS.ADMIN_USERS}/${user.id}`, {
          email: formData.email,
          first_name: formData.first_name.trim() || undefined,
          last_name: formData.last_name.trim() || undefined,
          is_admin: formData.is_admin,
          payee: payeePayload,
        });

        setSuccess(true);
        setTimeout(() => {
          router.refresh();
        }, 1000);
      }
    } catch (err: any) {
      if (err && typeof err === 'object' && 'message' in err) {
        setError(err.message as string);
      } else {
        setError('Failed to save user. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!apiClient || isNew || !user) return;
    if (!confirm(`Are you sure you want to delete this user? This action cannot be undone.`)) {
      return;
    }

    setDeleting(true);
    try {
      await apiClient.delete(`${API_ENDPOINTS.ADMIN_USERS}/${user.id}`);
      router.push(ROUTES.ADMIN_USERS);
    } catch (err: any) {
      setError(err.message || 'Failed to delete user');
      setDeleting(false);
    }
  };

  const displayName = user?.full_name || user?.email || 'New User';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={ROUTES.ADMIN_USERS}>
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold gradient-text">
              {isNew ? 'Add New User' : displayName}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isNew ? 'Create a new user account' : 'Manage user profile and payee information'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isNew && (
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting || saving}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          )}
          <Button
            onClick={handleSubmit}
            disabled={saving || deleting || !formData.email.trim() || (isNew && !formData.password.trim())}
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
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
          User saved successfully!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Account Information Card */}
        <Card>
          <CardHeader className="bg-gradient-to-r from-primary/5 via-accent/5 to-secondary/5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>Basic user account details</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-semibold text-foreground/70">
                  Email <span className="text-primary">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="user@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  disabled={saving || !isNew}
                  className="h-12"
                />
                {!isNew && (
                  <p className="text-xs text-muted-foreground">
                    Email cannot be changed after account creation
                  </p>
                )}
              </div>

              {isNew && (
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-xs font-semibold text-foreground/70">
                    Password <span className="text-primary">*</span>
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter secure password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    disabled={saving}
                    className="h-12"
                  />
                  <p className="text-xs text-muted-foreground">
                    User will need this password to log in
                  </p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="first_name" className="text-xs font-semibold text-foreground/70">First Name</Label>
                <Input
                  id="first_name"
                  type="text"
                  placeholder="John"
                  value={formData.first_name}
                  onChange={(e) => {
                    setFormData({ ...formData, first_name: e.target.value });
                    if (fieldErrors.first_name) {
                      setFieldErrors({ ...fieldErrors, first_name: undefined });
                    }
                  }}
                  disabled={saving}
                  className={`h-12 ${fieldErrors.first_name ? 'border-destructive' : ''}`}
                />
                {fieldErrors.first_name && (
                  <p className="text-xs text-destructive">{fieldErrors.first_name}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name" className="text-xs font-semibold text-foreground/70">Last Name</Label>
                <Input
                  id="last_name"
                  type="text"
                  placeholder="Doe"
                  value={formData.last_name}
                  onChange={(e) => {
                    setFormData({ ...formData, last_name: e.target.value });
                    if (fieldErrors.last_name) {
                      setFieldErrors({ ...fieldErrors, last_name: undefined });
                    }
                  }}
                  disabled={saving}
                  className={`h-12 ${fieldErrors.last_name ? 'border-destructive' : ''}`}
                />
                {fieldErrors.last_name && (
                  <p className="text-xs text-destructive">{fieldErrors.last_name}</p>
                )}
              </div>
            </div>

            {!isNew && user?.created_at && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
                <div>
                  <p className="text-xs font-semibold text-foreground/70">Created</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(user.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                {user?.updated_at && (
                  <div>
                    <p className="text-xs font-semibold text-foreground/70">Last Updated</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(user.updated_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Permissions Card */}
        <Card>
          <CardHeader className="bg-gradient-to-r from-primary/5 via-accent/5 to-secondary/5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle>Permissions</CardTitle>
                <CardDescription>User role and access level</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3 p-4 rounded-lg bg-muted/20 hover:bg-muted/30 transition-all duration-200 cursor-pointer border border-transparent hover:border-primary/20">
              <Checkbox
                id="is_admin"
                checked={formData.is_admin}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, is_admin: checked === true })
                }
                disabled={saving}
              />
              <div className="flex-1">
                <Label
                  htmlFor="is_admin"
                  className="text-sm font-semibold cursor-pointer text-foreground"
                >
                  Administrator
                </Label>
                <p className="text-xs text-muted-foreground/80 mt-1">
                  Grant full system access including user management and admin panel
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payee Information Card */}
        <Card>
          <CardHeader className="bg-gradient-to-r from-primary/5 via-accent/5 to-secondary/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Wallet className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Payee Information</CardTitle>
                  <CardDescription>
                    {payeeEnabled ? 'Payment recipient details for royalty distributions' : 'Enable to add payment recipient information'}
                  </CardDescription>
                </div>
              </div>
              <Switch
                checked={payeeEnabled}
                onCheckedChange={(checked) => {
                  setPayeeEnabled(checked);
                  if (checked && !isNew) {
                    loadAccounts();
                  }
                }}
                disabled={saving}
              />
            </div>
          </CardHeader>
          {payeeEnabled && (
            <CardContent className="pt-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="payee_account" className="text-xs font-semibold text-foreground/70">
                    Account <span className="text-primary">*</span>
                  </Label>
                  <Select
                    value={payeeData.account_id}
                    onValueChange={(value) => setPayeeData({ ...payeeData, account_id: value })}
                    disabled={saving || loadingAccounts}
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder={loadingAccounts ? 'Loading accounts...' : 'Select account'} />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    The account this payee receives royalties from
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payee_name" className="text-xs font-semibold text-foreground/70">
                    Payee Name <span className="text-primary">*</span>
                  </Label>
                  <Input
                    id="payee_name"
                    value={payeeData.name}
                    onChange={(e) => setPayeeData({ ...payeeData, name: e.target.value })}
                    placeholder="Legal name for payments"
                    disabled={saving}
                    className="h-12"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="payee_client_id" className="text-xs font-semibold text-foreground/70">Client ID</Label>
                  <Input
                    id="payee_client_id"
                    value={payeeData.client_id}
                    onChange={(e) => setPayeeData({ ...payeeData, client_id: e.target.value })}
                    placeholder="Internal client identifier"
                    disabled={saving}
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payee_foreign_id" className="text-xs font-semibold text-foreground/70">Foreign ID</Label>
                  <Input
                    id="payee_foreign_id"
                    value={payeeData.foreign_id}
                    onChange={(e) => setPayeeData({ ...payeeData, foreign_id: e.target.value })}
                    placeholder="External system identifier"
                    disabled={saving}
                    className="h-12"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="payee_country" className="text-xs font-semibold text-foreground/70">Country</Label>
                  <CountrySelect
                    id="payee_country"
                    value={payeeData.country}
                    onValueChange={(value) => setPayeeData({ ...payeeData, country: value || 'WW' })}
                    placeholder="Select country"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payee_vat_no" className="text-xs font-semibold text-foreground/70">VAT Number</Label>
                  <Input
                    id="payee_vat_no"
                    value={payeeData.vat_no}
                    onChange={(e) => setPayeeData({ ...payeeData, vat_no: e.target.value })}
                    placeholder="VAT registration number"
                    disabled={saving}
                    className="h-12"
                  />
                </div>
              </div>

              {initialPayee && !payeeEnabled && (
                <div className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
                  Warning: Disabling payee will remove all payment recipient information for this user.
                </div>
              )}
            </CardContent>
          )}
        </Card>
      </form>
    </div>
  );
}
