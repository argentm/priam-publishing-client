'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ROUTES } from '@/lib/constants';
import { sanitizeAuthError, getErrorMessage } from '@/lib/utils/auth-errors';
import { inviteStorage } from '@/lib/utils/invite-storage';
import { Loader2 } from 'lucide-react';

// Name validation regex: Unicode letters, marks, apostrophe, hyphen, space
const NAME_REGEX = /^[\p{L}\p{M}' -]+$/u;

interface InlineSignupFormProps {
  inviteToken: string;
  inviteEmail: string;
  accountId: string;
  accountName: string;
}

export function InlineSignupForm({
  inviteToken,
  inviteEmail,
  accountId,
  accountName,
}: InlineSignupFormProps) {
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ firstName?: string; lastName?: string }>({});
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  // Validate name fields
  const validateNames = (): boolean => {
    const errors: { firstName?: string; lastName?: string } = {};

    if (!firstName.trim()) {
      errors.firstName = 'First name is required';
    } else if (firstName.length > 50) {
      errors.firstName = 'First name is too long';
    } else if (!NAME_REGEX.test(firstName)) {
      errors.firstName = 'First name contains invalid characters';
    }

    if (!lastName.trim()) {
      errors.lastName = 'Last name is required';
    } else if (lastName.length > 50) {
      errors.lastName = 'Last name is too long';
    } else if (!NAME_REGEX.test(lastName)) {
      errors.lastName = 'Last name contains invalid characters';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    // Validate name fields before submission
    if (!validateNames()) {
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: inviteEmail,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/confirm`,
          data: {
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            full_name: `${firstName.trim()} ${lastName.trim()}`,
          },
        },
      });

      if (error) {
        setError(sanitizeAuthError(error.message, 'signup'));
        setLoading(false);
        return;
      }

      // Store invite context AFTER successful signup (not before)
      // This ensures we don't have stale context if signup fails
      inviteStorage.save({
        token: inviteToken,
        accountId,
        accountName,
        email: inviteEmail,
      });

      // Check if email was auto-confirmed (some Supabase projects disable email verification)
      if (data.user?.email_confirmed_at) {
        // Email already verified - go directly to ToS
        router.push(ROUTES.ONBOARDING_TERMS);
        return;
      }

      // Store email in localStorage for the verify-email page
      if (typeof window !== 'undefined') {
        localStorage.setItem('pendingVerificationEmail', inviteEmail);
      }

      // Redirect to email verification page
      router.push(ROUTES.ONBOARDING_VERIFY_EMAIL);
    } catch (err) {
      setError(sanitizeAuthError(getErrorMessage(err), 'signup'));
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg border border-destructive/20">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="firstName" className="text-sm font-medium">
            First name
          </Label>
          <Input
            id="firstName"
            type="text"
            autoComplete="given-name"
            required
            value={firstName}
            onChange={(e) => {
              setFirstName(e.target.value);
              if (fieldErrors.firstName) {
                setFieldErrors((prev) => ({ ...prev, firstName: undefined }));
              }
            }}
            placeholder="John"
            className={`h-10 ${fieldErrors.firstName ? 'border-destructive' : ''}`}
          />
          {fieldErrors.firstName && (
            <p className="text-xs text-destructive">{fieldErrors.firstName}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="lastName" className="text-sm font-medium">
            Last name
          </Label>
          <Input
            id="lastName"
            type="text"
            autoComplete="family-name"
            required
            value={lastName}
            onChange={(e) => {
              setLastName(e.target.value);
              if (fieldErrors.lastName) {
                setFieldErrors((prev) => ({ ...prev, lastName: undefined }));
              }
            }}
            placeholder="Doe"
            className={`h-10 ${fieldErrors.lastName ? 'border-destructive' : ''}`}
          />
          {fieldErrors.lastName && (
            <p className="text-xs text-destructive">{fieldErrors.lastName}</p>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email" className="text-sm font-medium">
          Email address
        </Label>
        <Input
          id="email"
          type="email"
          value={inviteEmail}
          disabled
          className="h-10 bg-muted cursor-not-allowed"
        />
        <p className="text-xs text-muted-foreground">
          This email was used for the invitation
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password" className="text-sm font-medium">
          Password
        </Label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Create a strong password"
          minLength={6}
          className="h-10"
        />
        <p className="text-xs text-muted-foreground">Must be at least 6 characters</p>
      </div>

      <Button type="submit" className="w-full h-10" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Creating account...
          </>
        ) : (
          `Join ${accountName}`
        )}
      </Button>
    </form>
  );
}
