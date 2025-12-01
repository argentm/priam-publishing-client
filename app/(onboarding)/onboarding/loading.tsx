import { Loader2 } from 'lucide-react';

/**
 * Onboarding Entry Loading State
 *
 * Simple centered spinner since the main page immediately redirects
 * based on onboarding status.
 */
export default function OnboardingLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
        <p className="text-muted-foreground">Loading your progress...</p>
      </div>
    </div>
  );
}
