'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/constants';
import {
  CheckCircle2,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

// Clear the pending email from localStorage since verification is complete
const PENDING_EMAIL_KEY = 'pendingVerificationEmail';

export default function EmailVerifiedPage() {
  const router = useRouter();

  // Clear localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(PENDING_EMAIL_KEY);
    }
  }, []);

  const handleContinue = () => {
    // After email verification via verifyOtp, user is authenticated
    // Redirect to dashboard - middleware will redirect to correct onboarding step
    router.push(ROUTES.DASHBOARD);
  };

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
            <span className="text-sm font-medium">Email Verified</span>
          </div>
          <h1 className="text-4xl font-bold text-white leading-tight">
            You&apos;re all set!
          </h1>
          <p className="text-white/80 text-lg max-w-md">
            Your email has been verified. Continue to set up your account and start managing your music catalog.
          </p>
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
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">Priam</span>
            </div>
          </div>

          <div className="space-y-8 text-center">
            {/* Success icon */}
            <div className="relative inline-flex">
              <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="w-12 h-12 text-green-600" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                <span className="text-white text-lg">✓</span>
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tight text-green-700">
                Email Verified!
              </h2>
              <p className="text-muted-foreground">
                Your email address has been successfully verified.
              </p>
            </div>

            <div className="bg-green-50 rounded-xl p-6 space-y-4 border border-green-200">
              <p className="text-sm text-green-800">
                Click below to continue setting up your account.
              </p>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleContinue}
                className="w-full h-12 bg-green-600 hover:bg-green-700"
              >
                <ArrowRight className="w-4 h-4 mr-2" />
                Continue Setup
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              You&apos;ll continue to the next step of the onboarding process.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
