'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useOnboarding } from '@/lib/hooks/use-onboarding';
import { ROUTES } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { StepIndicator, StepIndicatorCompact } from '@/components/onboarding/step-indicator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  FileText,
  Loader2,
  ArrowRight,
  Sparkles,
  Shield,
  Scale,
  Lock,
} from 'lucide-react';

const CURRENT_TOS_VERSION = '1.0';

export default function TermsPage() {
  const router = useRouter();
  const { status, isLoading: statusLoading, acceptTos } = useOnboarding();
  const [isAccepting, setIsAccepting] = useState(false);
  const [hasAgreed, setHasAgreed] = useState(false);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If ToS already accepted, navigate to next step
  useEffect(() => {
    if (!statusLoading && status) {
      if (status.user.tos_accepted_at) {
        if (!status.steps.account_created) {
          router.push(ROUTES.ONBOARDING_CREATE_ACCOUNT);
        } else if (!status.steps.identity_verified) {
          router.push(ROUTES.ONBOARDING_VERIFY_IDENTITY);
        } else {
          router.push(ROUTES.DASHBOARD);
        }
      }
    }
  }, [status, statusLoading, router]);

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const target = event.target as HTMLDivElement;
    const isAtBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 50;
    if (isAtBottom) {
      setHasScrolledToBottom(true);
    }
  };

  const handleAccept = async () => {
    if (!hasAgreed) return;

    setIsAccepting(true);
    setError(null);

    try {
      await acceptTos(CURRENT_TOS_VERSION);
      router.push(ROUTES.ONBOARDING_CREATE_ACCOUNT);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to accept terms');
      setIsAccepting(false);
    }
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
            <span className="text-sm font-medium">Step 2 of 4</span>
          </div>
          <h1 className="text-4xl font-bold text-white leading-tight">
            Terms of Service
          </h1>
          <p className="text-white/80 text-lg max-w-md">
            Please review and accept our terms to continue. Your rights and our commitment to you.
          </p>

          {/* Key points */}
          <div className="space-y-4 pt-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-white font-medium">Your Rights Protected</p>
                <p className="text-white/70 text-sm">You own your music and data</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                <Scale className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-white font-medium">Fair Treatment</p>
                <p className="text-white/70 text-sm">Transparent royalty management</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                <Lock className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-white font-medium">Privacy First</p>
                <p className="text-white/70 text-sm">Your information stays secure</p>
              </div>
            </div>
          </div>

          {/* Progress */}
          <StepIndicatorCompact currentStep={2} className="pt-4" />
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
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">Priam</span>
              </div>
              <span className="text-sm text-muted-foreground">Step 2/4</span>
            </div>
            <StepIndicatorCompact currentStep={2} />
          </div>

          {/* Desktop step indicator */}
          <div className="hidden lg:block mb-8">
            <StepIndicator currentStep={2} completedSteps={[1]} />
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Terms of Service</h2>
              <p className="text-muted-foreground mt-2">
                Please read and accept our terms to continue
              </p>
            </div>

            {/* Terms content */}
            <div className="border rounded-xl">
              <ScrollArea
                className="h-[300px] p-6"
                onScrollCapture={handleScroll}
              >
                <div className="space-y-6 text-sm text-muted-foreground">
                  <section>
                    <h3 className="font-semibold text-foreground mb-2">1. Agreement to Terms</h3>
                    <p>
                      By accessing or using Priam Publishing&apos;s services, you agree to be bound by these
                      Terms of Service. If you disagree with any part of the terms, you may not access
                      the service.
                    </p>
                  </section>

                  <section>
                    <h3 className="font-semibold text-foreground mb-2">2. Your Rights</h3>
                    <p>
                      You retain all ownership rights to your musical works and recordings. Priam
                      Publishing acts as your administrator and does not claim ownership of your content.
                      You grant us a limited license to manage, distribute, and collect royalties on
                      your behalf.
                    </p>
                  </section>

                  <section>
                    <h3 className="font-semibold text-foreground mb-2">3. Our Services</h3>
                    <p>
                      We provide music publishing administration services including royalty collection,
                      registration with collection societies, and catalog management. We commit to
                      transparent reporting and timely payments.
                    </p>
                  </section>

                  <section>
                    <h3 className="font-semibold text-foreground mb-2">4. Account Responsibilities</h3>
                    <p>
                      You are responsible for maintaining the confidentiality of your account credentials
                      and for all activities that occur under your account. You must provide accurate
                      and complete information about your works.
                    </p>
                  </section>

                  <section>
                    <h3 className="font-semibold text-foreground mb-2">5. Privacy & Data</h3>
                    <p>
                      We collect and process your personal data in accordance with our Privacy Policy.
                      Your data is encrypted and stored securely. We never sell your personal information
                      to third parties.
                    </p>
                  </section>

                  <section>
                    <h3 className="font-semibold text-foreground mb-2">6. Termination</h3>
                    <p>
                      You may terminate your account at any time. Upon termination, we will continue to
                      collect any outstanding royalties owed to you and transfer them according to your
                      instructions.
                    </p>
                  </section>

                  <section>
                    <h3 className="font-semibold text-foreground mb-2">7. Changes to Terms</h3>
                    <p>
                      We may update these terms from time to time. We will notify you of any material
                      changes via email. Continued use of the service after changes constitutes
                      acceptance of the new terms.
                    </p>
                  </section>

                  <section className="pb-4">
                    <h3 className="font-semibold text-foreground mb-2">8. Contact</h3>
                    <p>
                      If you have any questions about these Terms, please contact us at
                      legal@priampublishing.com.
                    </p>
                  </section>
                </div>
              </ScrollArea>
            </div>

            {!hasScrolledToBottom && (
              <p className="text-xs text-muted-foreground text-center">
                Please scroll to read the full terms
              </p>
            )}

            {/* Agreement checkbox */}
            <div className="flex items-start space-x-3">
              <Checkbox
                id="terms"
                checked={hasAgreed}
                onCheckedChange={(checked) => setHasAgreed(checked === true)}
                disabled={!hasScrolledToBottom}
              />
              <label
                htmlFor="terms"
                className={`text-sm leading-relaxed cursor-pointer ${
                  !hasScrolledToBottom ? 'text-muted-foreground' : ''
                }`}
              >
                I have read and agree to the Terms of Service and Privacy Policy
              </label>
            </div>

            {error && (
              <div className="bg-destructive/10 text-destructive text-sm p-4 rounded-lg border border-destructive/20">
                {error}
              </div>
            )}

            <Button
              onClick={handleAccept}
              disabled={!hasAgreed || isAccepting}
              className="w-full h-12"
            >
              {isAccepting ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <ArrowRight className="w-4 h-4 mr-2" />
              )}
              Accept & Continue
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
