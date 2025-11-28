'use client';

import { useEffect } from 'react';
import { useOnboarding } from '@/lib/hooks/use-onboarding';
import { Loader2 } from 'lucide-react';

/**
 * Main onboarding entry point.
 * Redirects users to the appropriate step based on their onboarding status.
 */
export default function OnboardingPage() {
  const { status, isLoading, navigateToStep } = useOnboarding();

  useEffect(() => {
    if (!isLoading && status) {
      navigateToStep();
    }
  }, [isLoading, status, navigateToStep]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
        <p className="text-muted-foreground">Loading your progress...</p>
      </div>
    </div>
  );
}
