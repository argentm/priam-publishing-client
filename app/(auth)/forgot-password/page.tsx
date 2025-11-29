'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ROUTES, API_ENDPOINTS } from '@/lib/constants';
import { Music2, Loader2, ArrowLeft, Mail, CheckCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Use relative URL - Next.js rewrites will proxy to backend
      const response = await fetch(API_ENDPOINTS.AUTH_FORGOT_PASSWORD, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // NOTE: redirectTo is now constructed server-side for security
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const data = await response.json();
        // Only show rate limit errors, other errors we still show success
        // to prevent email enumeration
        if (response.status === 429) {
          setError(data.message || 'Too many requests. Please try again later.');
          setLoading(false);
          return;
        }
      }

      // Always show success (even if email doesn't exist) to prevent enumeration
      setSuccess(true);
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary/90 to-primary/80 p-12 flex-col justify-between relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Music2 className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">Priam</span>
          </div>
        </div>

        <div className="relative z-10 space-y-6">
          <h1 className="text-4xl font-bold text-white leading-tight">
            Reset your password
          </h1>
          <p className="text-white/80 text-lg max-w-md">
            Enter your email address and we&apos;ll send you a link to reset your password.
          </p>
        </div>

        <div className="relative z-10 text-white/60 text-sm">
          &copy; {new Date().getFullYear()} Priam Publishing. All rights reserved.
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <Music2 className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold">Priam</span>
          </div>

          {success ? (
            // Success state
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Check your email</h2>
                <p className="text-muted-foreground mt-2">
                  We&apos;ve sent a password reset link to <strong>{email}</strong>
                </p>
              </div>
              <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
                <Mail className="w-5 h-5 mx-auto mb-2 text-primary" />
                <p>
                  Click the link in the email to reset your password.
                  The link will expire in 1 hour.
                </p>
              </div>
              <div className="pt-4 space-y-3">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setSuccess(false);
                    setEmail('');
                  }}
                >
                  Send another email
                </Button>
                <Link href={ROUTES.LOGIN}>
                  <Button variant="ghost" className="w-full gap-2">
                    <ArrowLeft className="w-4 h-4" />
                    Back to login
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            // Form state
            <>
              <div className="text-center lg:text-left">
                <h2 className="text-3xl font-bold tracking-tight">Forgot password?</h2>
                <p className="text-muted-foreground mt-2">
                  No worries, we&apos;ll send you reset instructions.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="bg-destructive/10 text-destructive text-sm p-4 rounded-lg border border-destructive/20">
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="h-12"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 text-base font-medium"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Send reset link'
                  )}
                </Button>
              </form>

              <div className="text-center">
                <Link
                  href={ROUTES.LOGIN}
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
