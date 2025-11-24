'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ApiClient } from '@/lib/api/client';
import { createClient as createSupabaseClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ROUTES } from '@/lib/constants';

export default function NewAccountPage() {
  const [name, setName] = useState('');
  const [clientId, setClientId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createSupabaseClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Get auth token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        setError('You must be logged in to create an account');
        setLoading(false);
        return;
      }

      // Create API client with auth token
      const apiClient = new ApiClient(async () => session.access_token);

      // Create account
      const response = await apiClient.post<{ message: string; account: { id: string; name: string; client_id: string | null; created_at: string; updated_at: string } }>(
        '/api/accounts',
        {
          name,
          client_id: clientId || undefined,
        }
      );

      // Redirect to the new account
      router.push(ROUTES.ACCOUNT(response.account.id));
      router.refresh();
    } catch (err: any) {
      if (err && typeof err === 'object' && 'message' in err) {
        setError(err.message as string);
      } else {
        setError('Failed to create account. Please try again.');
      }
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Create New Account</CardTitle>
          <CardDescription>
            Create a new publishing account to manage your works, tracks, and contracts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-md bg-destructive/15 p-4 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">
                Account Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter account name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="clientId">Client ID (Optional)</Label>
              <Input
                id="clientId"
                type="text"
                placeholder="Enter client ID"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                disabled={loading}
              />
              <p className="text-sm text-muted-foreground">
                An optional identifier for external systems
              </p>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={loading || !name.trim()}>
                {loading ? 'Creating...' : 'Create Account'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

