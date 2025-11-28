'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { ApiClient } from '@/lib/api/client';
import { useOnboarding } from '@/lib/hooks/use-onboarding';
import { ROUTES, API_ENDPOINTS } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { StepIndicator, StepIndicatorCompact } from '@/components/onboarding/step-indicator';
import {
  Shield,
  Loader2,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Clock,
  AlertCircle,
  ExternalLink,
  SkipForward,
} from 'lucide-react';

type VerificationStatus = 'pending' | 'processing' | 'verified' | 'failed' | 'requires_input';

interface VerificationSessionResponse {
  session_url: string;
  session_id: string;
}

interface VerificationStatusResponse {
  status: VerificationStatus;
  verified_at?: string;
  error_message?: string;
}

export default function VerifyIdentityPage() {
  const router = useRouter();
  const { status, isLoading: statusLoading, skipIdentity, refetch } = useOnboarding();
  const [apiClient, setApiClient] = useState<ApiClient | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>('pending');
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [isSkipping, setIsSkipping] = useState(false);
  const [sessionUrl, setSessionUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Initialize API client
  useEffect(() => {
    const initClient = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      setApiClient(new ApiClient(async () => session?.access_token || null));
    };
    initClient();
  }, []);

  // If already verified, navigate to dashboard
  useEffect(() => {
    if (!statusLoading && status) {
      if (status.steps.identity_verified || status.onboarding_status === 'active') {
        router.push(ROUTES.DASHBOARD);
      }
    }
  }, [status, statusLoading, router]);

  // Check verification status periodically
  useEffect(() => {
    if (verificationStatus === 'processing') {
      const checkStatus = async () => {
        if (!apiClient) return;

        try {
          const response = await apiClient.get<VerificationStatusResponse>(
            API_ENDPOINTS.VERIFICATION_STATUS
          );
          setVerificationStatus(response.status);

          if (response.status === 'verified') {
            // Refresh onboarding status and redirect
            await refetch();
            router.push(ROUTES.ONBOARDING_COMPLETE);
          }
        } catch (err) {
          // Silent fail on status check
          console.error('Failed to check verification status:', err);
        }
      };

      const pollInterval = setInterval(checkStatus, 5000);
      return () => clearInterval(pollInterval);
    }
  }, [verificationStatus, apiClient, refetch, router]);

  const handleStartVerification = async () => {
    if (!apiClient) return;

    setIsCreatingSession(true);
    setError(null);

    try {
      const response = await apiClient.post<VerificationSessionResponse>(
        API_ENDPOINTS.VERIFICATION_CREATE_SESSION,
        {}
      );

      setSessionUrl(response.session_url);
      setVerificationStatus('processing');

      // Open Stripe Identity in new tab
      window.open(response.session_url, '_blank');
    } catch (err) {
      const errorMessage = err && typeof err === 'object' && 'message' in err
        ? String((err as { message: string }).message)
        : 'Failed to create verification session';
      setError(errorMessage);
    } finally {
      setIsCreatingSession(false);
    }
  };

  const handleSkipVerification = async () => {
    setIsSkipping(true);
    setError(null);

    try {
      await skipIdentity();
      router.push(ROUTES.DASHBOARD);
    } catch (err) {
      const errorMessage = err && typeof err === 'object' && 'message' in err
        ? String((err as { message: string }).message)
        : 'Failed to skip verification';
      setError(errorMessage);
      setIsSkipping(false);
    }
  };

  const getStatusDisplay = () => {
    switch (verificationStatus) {
      case 'pending':
        return {
          icon: <Shield className="w-12 h-12 text-primary" />,
          title: 'Verify your identity',
          description: 'Complete identity verification to unlock all features and start earning royalties.',
        };
      case 'processing':
        return {
          icon: <Clock className="w-12 h-12 text-amber-500" />,
          title: 'Verification in progress',
          description: 'We\'re reviewing your documents. This usually takes just a few minutes.',
        };
      case 'verified':
        return {
          icon: <CheckCircle2 className="w-12 h-12 text-green-500" />,
          title: 'Verification complete',
          description: 'Your identity has been verified. You now have full access to all features.',
        };
      case 'failed':
      case 'requires_input':
        return {
          icon: <AlertCircle className="w-12 h-12 text-destructive" />,
          title: 'Verification issue',
          description: 'There was a problem with your verification. Please try again.',
        };
      default:
        return {
          icon: <Shield className="w-12 h-12 text-primary" />,
          title: 'Verify your identity',
          description: 'Complete identity verification to unlock all features.',
        };
    }
  };

  const statusDisplay = getStatusDisplay();

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
            <span className="text-sm font-medium">Step 4 of 4</span>
          </div>
          <h1 className="text-4xl font-bold text-white leading-tight">
            Almost there!
          </h1>
          <p className="text-white/80 text-lg max-w-md">
            Verify your identity to unlock royalty payments and full platform access.
          </p>

          {/* Benefits */}
          <div className="space-y-4 pt-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-white mt-0.5" />
              <p className="text-white/90">Receive royalty payments directly</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-white mt-0.5" />
              <p className="text-white/90">Full access to all platform features</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-white mt-0.5" />
              <p className="text-white/90">Verified creator badge on your profile</p>
            </div>
          </div>

          {/* Progress */}
          <StepIndicatorCompact currentStep={4} className="pt-4" />
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
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">Priam</span>
              </div>
              <span className="text-sm text-muted-foreground">Step 4/4</span>
            </div>
            <StepIndicatorCompact currentStep={4} />
          </div>

          {/* Desktop step indicator */}
          <div className="hidden lg:block mb-8">
            <StepIndicator currentStep={4} completedSteps={[1, 2, 3]} />
          </div>

          <div className="space-y-8 text-center">
            {/* Status icon */}
            <div className="relative inline-flex">
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                {statusDisplay.icon}
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tight">{statusDisplay.title}</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                {statusDisplay.description}
              </p>
            </div>

            {/* Verification info */}
            {verificationStatus === 'pending' && (
              <Card className="bg-muted/50">
                <CardContent className="p-6 space-y-4">
                  <h3 className="font-semibold">What you&apos;ll need:</h3>
                  <ul className="text-left text-sm text-muted-foreground space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      A valid government-issued ID (passport, driver&apos;s license, or national ID)
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      Access to your device&apos;s camera for a quick selfie
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      About 2-3 minutes of your time
                    </li>
                  </ul>
                  <p className="text-xs text-muted-foreground">
                    Your data is encrypted and securely processed by Stripe Identity.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Processing state */}
            {verificationStatus === 'processing' && (
              <Card className="bg-amber-50 border-amber-200">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin text-amber-600" />
                    <span className="text-amber-800 font-medium">Checking verification status...</span>
                  </div>
                  {sessionUrl && (
                    <Button
                      variant="outline"
                      onClick={() => window.open(sessionUrl, '_blank')}
                      className="gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Open verification again
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            {error && (
              <div className="bg-destructive/10 text-destructive text-sm p-4 rounded-lg border border-destructive/20">
                {error}
              </div>
            )}

            <div className="space-y-3">
              {verificationStatus === 'pending' && (
                <>
                  <Button
                    onClick={handleStartVerification}
                    disabled={isCreatingSession}
                    className="w-full h-12"
                  >
                    {isCreatingSession ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Shield className="w-4 h-4 mr-2" />
                    )}
                    Start Verification
                  </Button>

                  <Button
                    onClick={handleSkipVerification}
                    variant="ghost"
                    disabled={isSkipping}
                    className="w-full h-12 text-muted-foreground"
                  >
                    {isSkipping ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <SkipForward className="w-4 h-4 mr-2" />
                    )}
                    Skip for now (limited access)
                  </Button>
                </>
              )}

              {(verificationStatus === 'failed' || verificationStatus === 'requires_input') && (
                <Button
                  onClick={handleStartVerification}
                  disabled={isCreatingSession}
                  className="w-full h-12"
                >
                  {isCreatingSession ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Shield className="w-4 h-4 mr-2" />
                  )}
                  Try Again
                </Button>
              )}

              {verificationStatus === 'verified' && (
                <Button
                  onClick={() => router.push(ROUTES.DASHBOARD)}
                  className="w-full h-12"
                >
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Go to Dashboard
                </Button>
              )}
            </div>

            {verificationStatus === 'pending' && (
              <p className="text-xs text-muted-foreground">
                You can skip verification and continue with read-only access.
                <br />
                Verify later to unlock payments and full features.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
