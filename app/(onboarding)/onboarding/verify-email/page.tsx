'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { ROUTES } from '@/lib/constants';
import { sanitizeAuthError } from '@/lib/utils/auth-errors';
import { Button } from '@/components/ui/button';
import { StepIndicator, StepIndicatorCompact } from '@/components/onboarding/step-indicator';
import {
  Mail,
  Loader2,
  RefreshCw,
  CheckCircle2,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

// Cooldown duration in seconds
const RESEND_COOLDOWN_SECONDS = 60;

// localStorage key for pending verification email
const PENDING_EMAIL_KEY = 'pendingVerificationEmail';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>('');
  const [isCheckingAuth, setIsCheckingAuth] = useState(false);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Check for verification error from URL params
  useEffect(() => {
    const errorParam = searchParams.get('error');
    const messageParam = searchParams.get('message');

    if (errorParam === 'verification_failed') {
      setError(
        messageParam ||
          'Email verification failed. The link may have expired. Please request a new verification email.'
      );
    }
  }, [searchParams]);

  // Get email from localStorage (secure) or from Supabase auth
  useEffect(() => {
    const initializeEmail = async () => {
      // First, try to get email from localStorage (set during signup)
      if (typeof window !== 'undefined') {
        const storedEmail = localStorage.getItem(PENDING_EMAIL_KEY);
        if (storedEmail) {
          setUserEmail(storedEmail);
          setIsLoading(false);
          return;
        }
      }

      // Fallback: try to get from Supabase (if user is somehow authenticated)
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.email) {
          setUserEmail(user.email);
          // If user is authenticated and email is verified, redirect to next step
          if (user.email_confirmed_at) {
            // Clear localStorage since verification is complete
            if (typeof window !== 'undefined') {
              localStorage.removeItem(PENDING_EMAIL_KEY);
            }
            router.push(ROUTES.ONBOARDING_TERMS);
            return;
          }
        }
      } catch {
        // User is not authenticated, which is expected
      }

      setIsLoading(false);
    };

    initializeEmail();
  }, [router]);

  // Cooldown timer effect
  useEffect(() => {
    if (cooldownRemaining <= 0) return;

    const timer = setInterval(() => {
      setCooldownRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldownRemaining]);

  const handleResendEmail = async () => {
    if (!userEmail) {
      setError('No email address found. Please try signing up again.');
      return;
    }

    // Prevent resend if cooldown is active
    if (cooldownRemaining > 0) {
      return;
    }

    setIsResending(true);
    setError(null);
    setResendSuccess(false);

    try {
      const supabase = createClient();
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email: userEmail,
      });

      if (resendError) throw resendError;

      setResendSuccess(true);
      // Start cooldown timer after successful resend
      setCooldownRemaining(RESEND_COOLDOWN_SECONDS);
      setTimeout(() => setResendSuccess(false), 5000);
    } catch (err) {
      setError(sanitizeAuthError(err instanceof Error ? err.message : '', 'emailResend'));
    } finally {
      setIsResending(false);
    }
  };

  // Check if user has verified their email by attempting to get auth status
  const handleCheckVerification = async () => {
    setIsCheckingAuth(true);
    setError(null);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user?.email_confirmed_at) {
        // Email is verified! Clear localStorage and redirect to next step
        if (typeof window !== 'undefined') {
          localStorage.removeItem(PENDING_EMAIL_KEY);
        }
        router.push(ROUTES.ONBOARDING_TERMS);
      } else {
        setError('Email not verified yet. Please check your inbox and click the verification link.');
      }
    } catch {
      setError('Unable to check verification status. Please click the link in your email.');
    } finally {
      setIsCheckingAuth(false);
    }
  };

  // Show loading state while initializing
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-2/5 bg-gradient-to-br from-primary via-primary/90 to-accent/70 p-12 flex-col justify-between relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-secondary rounded-full blur-3xl" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg">
              <Image
                src="/logos/priam-icon.svg"
                alt="Priam"
                width={32}
                height={32}
              />
            </div>
            <span className="text-2xl font-bold text-white">Priam</span>
          </div>
        </div>

        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-2 text-white/80">
            <Sparkles className="w-5 h-5" />
            <span className="text-sm font-medium">Step 1 of 4</span>
          </div>
          <h1 className="text-4xl font-bold text-white leading-tight">
            Check your inbox
          </h1>
          <p className="text-white/80 text-lg max-w-md">
            We&apos;ve sent a verification link to your email. Click it to continue setting up your account.
          </p>

          {/* Progress */}
          <StepIndicatorCompact currentStep={1} className="pt-4" />
        </div>

        <div className="relative z-10 text-white/60 text-sm">
          &copy; {new Date().getFullYear()} Priam Publishing. All rights reserved.
        </div>
      </div>

      {/* Right side - Content */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-lg">
          {/* Mobile header */}
          <div className="lg:hidden mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">Priam</span>
              </div>
              <span className="text-sm text-muted-foreground">Step 1/4</span>
            </div>
            <StepIndicatorCompact currentStep={1} />
          </div>

          {/* Desktop step indicator */}
          <div className="hidden lg:block mb-8">
            <StepIndicator currentStep={1} />
          </div>

          <div className="space-y-8 text-center">
            {/* Email icon */}
            <div className="relative inline-flex">
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                <Mail className="w-12 h-12 text-primary" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                <span className="text-lg">✉️</span>
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tight">Verify your email</h2>
              <p className="text-muted-foreground">
                We sent a verification link to
              </p>
              {userEmail && (
                <p className="font-medium text-foreground">{userEmail}</p>
              )}
            </div>

            <div className="bg-muted/50 rounded-xl p-6 space-y-4">
              <p className="text-sm text-muted-foreground">
                Click the link in your email to verify your account.
                If you don&apos;t see it, check your spam folder.
              </p>

              {error && (
                <div className="bg-destructive/10 text-destructive text-sm p-4 rounded-lg border border-destructive/20">
                  {error}
                </div>
              )}

              {resendSuccess && (
                <div className="bg-green-50 text-green-700 text-sm p-4 rounded-lg border border-green-200 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Verification email sent!
                </div>
              )}
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleCheckVerification}
                className="w-full h-12"
                disabled={isCheckingAuth}
              >
                {isCheckingAuth ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <ArrowRight className="w-4 h-4 mr-2" />
                )}
                I&apos;ve verified my email
              </Button>

              <Button
                onClick={handleResendEmail}
                variant="outline"
                className="w-full h-12"
                disabled={isResending || !userEmail || cooldownRemaining > 0}
              >
                {isResending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                {cooldownRemaining > 0
                  ? `Resend in ${cooldownRemaining}s`
                  : 'Resend verification email'}
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              This page will automatically update when your email is verified
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Loading fallback for Suspense
function VerifyEmailFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

// Wrap with Suspense for useSearchParams
export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<VerifyEmailFallback />}>
      <VerifyEmailContent />
    </Suspense>
  );
}
