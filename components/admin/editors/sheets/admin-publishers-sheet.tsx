'use client';

import { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { ApiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/constants';
import { ProSelector } from '@/components/ui/pro-selector';

interface Publisher {
  id: string;
  name: string;
  cae?: string | null;
  main_pro?: string | null;
  controlled?: boolean;
}

interface AdminPublishersSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accountId: string;
  onPublisherCreated: (publisher: Publisher) => void;
}

export function AdminPublishersSheet({
  open,
  onOpenChange,
  accountId,
  onPublisherCreated,
}: AdminPublishersSheetProps) {
  const [name, setName] = useState('');
  const [cae, setCae] = useState('');
  const [mainPro, setMainPro] = useState<string>('');
  const [controlled, setControlled] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();
  const [apiClient, setApiClient] = useState<ApiClient | null>(null);

  useEffect(() => {
    const initClient = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setApiClient(new ApiClient(async () => session?.access_token || null));
    };
    initClient();
  }, [supabase]);

  const resetForm = () => {
    setName('');
    setCae('');
    setMainPro('');
    setControlled(true);
    setError(null);
  };

  const handleCreate = async () => {
    if (!apiClient) return;
    if (!name.trim()) {
      setError('Publisher name is required');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const response = await apiClient.post<{ publisher: Publisher }>(
        API_ENDPOINTS.ADMIN_ACCOUNT_PUBLISHERS(accountId),
        {
          name: name.trim(),
          cae: cae.trim() || null,
          main_pro: mainPro || null,
          controlled,
        }
      );

      onPublisherCreated(response.publisher);
      resetForm();
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message || 'Failed to create publisher');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent className="sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Create Publisher</SheetTitle>
          <SheetDescription>
            Add a new publisher to this account.
          </SheetDescription>
        </SheetHeader>

        <div className="py-6 space-y-4">
          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive rounded-md">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="pub-name">Name <span className="text-destructive">*</span></Label>
            <Input
              id="pub-name"
              placeholder="Publisher name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pub-cae">CAE/IPI Number</Label>
            <Input
              id="pub-cae"
              placeholder="e.g., 123456789"
              value={cae}
              onChange={(e) => setCae(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Main PRO</Label>
            <ProSelector
              value={mainPro || null}
              onChange={(value) => setMainPro(value || '')}
              placeholder="Select PRO..."
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="pub-controlled"
              checked={controlled}
              onCheckedChange={(checked) => setControlled(checked === true)}
            />
            <Label htmlFor="pub-controlled" className="text-sm">
              Controlled Publisher
            </Label>
          </div>
        </div>

        <SheetFooter>
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="button" onClick={handleCreate} disabled={saving || !name.trim()}>
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Create Publisher
              </>
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
