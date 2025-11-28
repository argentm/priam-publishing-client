'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { API_ENDPOINTS } from '@/lib/constants';
import { createClient } from '@/lib/supabase/client';
import { ApiClient } from '@/lib/api/client';
import { Save, X } from 'lucide-react';
import type { User } from '@/lib/types';

// Name validation regex: Unicode letters, marks, apostrophe, hyphen, space
const NAME_REGEX = /^[\p{L}\p{M}' -]+$/u;

interface UserEditorProps {
  user?: User;
  isNew?: boolean;
  onClose: () => void;
}

export function UserEditor({ user, isNew = false, onClose }: UserEditorProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: user?.email || '',
    password: '',
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    is_admin: user?.is_admin || false,
  });
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ first_name?: string; last_name?: string }>({});
  const [loading, setLoading] = useState(false);

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

    // Validate names before submitting
    if (!validateNames()) {
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        setError('You must be logged in to perform this action');
        setLoading(false);
        return;
      }

      const apiClient = new ApiClient(async () => session.access_token);

      if (isNew) {
        // Create new user
        if (!formData.password) {
          setError('Password is required for new users');
          setLoading(false);
          return;
        }

        await apiClient.post<{ message: string; user: User }>(API_ENDPOINTS.ADMIN_USERS, {
          email: formData.email,
          password: formData.password,
          first_name: formData.first_name.trim() || undefined,
          last_name: formData.last_name.trim() || undefined,
          is_admin: formData.is_admin,
        });

        router.refresh();
        onClose();
      } else if (user) {
        // Update existing user
        await apiClient.put<User>(`${API_ENDPOINTS.ADMIN_USERS}/${user.id}`, {
          email: formData.email,
          first_name: formData.first_name.trim() || undefined,
          last_name: formData.last_name.trim() || undefined,
          is_admin: formData.is_admin,
        });

        router.refresh();
        onClose();
      }
    } catch (err: any) {
      if (err && typeof err === 'object' && 'message' in err) {
        setError(err.message as string);
      } else {
        setError('Failed to save user. Please try again.');
      }
      setLoading(false);
    }
  };

  return (
    <>
      {/* Backdrop with click to close */}
      <div 
        className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-50 animate-in fade-in duration-200"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <Card 
          className="w-full max-w-lg pointer-events-auto shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-200 bg-white dark:bg-card"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10 px-6 py-4 rounded-t-xl">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold gradient-text">
                  {isNew ? 'Add New User' : 'Edit User'}
                </CardTitle>
                <CardDescription className="mt-1">
                  {isNew ? 'Create a new user account' : 'Update user information'}
                </CardDescription>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={onClose}
                className="hover:bg-destructive/20 hover:text-destructive rounded-full h-9 w-9"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="rounded-xl bg-destructive/10 border-l-4 border-destructive p-4 text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-semibold text-foreground/70 normal-case tracking-normal">
                  Email <span className="text-primary">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="user@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  disabled={loading || !isNew}
                  className="h-12"
                />
                {!isNew && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-muted-foreground/50"></span>
                    Email cannot be changed after account creation
                  </p>
                )}
              </div>

              {isNew && (
                <div className="space-y-2">
                <Label htmlFor="password" className="text-xs font-semibold text-foreground/70 normal-case tracking-normal">
                  Password <span className="text-primary">*</span>
                </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter secure password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    disabled={loading}
                    className="h-12"
                  />
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-muted-foreground/50"></span>
                    User will need this password to log in
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name" className="text-xs font-semibold text-foreground/70 normal-case tracking-normal">First Name</Label>
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
                    disabled={loading}
                    className={`h-12 ${fieldErrors.first_name ? 'border-destructive' : ''}`}
                  />
                  {fieldErrors.first_name && (
                    <p className="text-xs text-destructive">{fieldErrors.first_name}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name" className="text-xs font-semibold text-foreground/70 normal-case tracking-normal">Last Name</Label>
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
                    disabled={loading}
                    className={`h-12 ${fieldErrors.last_name ? 'border-destructive' : ''}`}
                  />
                  {fieldErrors.last_name && (
                    <p className="text-xs text-destructive">{fieldErrors.last_name}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-3 p-4 rounded-lg bg-muted/20 hover:bg-muted/30 transition-all duration-200 cursor-pointer border border-transparent hover:border-primary/20">
                <Checkbox
                  id="is_admin"
                  checked={formData.is_admin}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_admin: checked === true })
                  }
                  disabled={loading}
                />
                <div className="flex-1">
                  <Label
                    htmlFor="is_admin"
                    className="text-sm font-semibold cursor-pointer normal-case tracking-normal text-foreground"
                  >
                    Admin privileges
                  </Label>
                  <p className="text-xs text-muted-foreground/80 mt-1">
                    Grant full system access to this user
                  </p>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button 
                  type="submit" 
                  disabled={loading || !formData.email.trim() || (isNew && !formData.password.trim())}
                  className="flex-1 h-11"
                  variant="default"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? (isNew ? 'Creating...' : 'Saving...') : (isNew ? 'Create User' : 'Save Changes')}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={onClose} 
                  disabled={loading}
                  className="h-11"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

