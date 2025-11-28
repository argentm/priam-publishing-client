'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useOnboarding } from '@/lib/hooks/use-onboarding';
import { ROUTES } from '@/lib/constants';
import { AccountCreationWizard, type AccountCreationData } from '@/components/user/account-creation-wizard';
import { Loader2 } from 'lucide-react';

export default function CreateAccountPage() {
  const router = useRouter();
  const { status, isLoading: statusLoading, createAccount } = useOnboarding();

  // If account already created, navigate to next step
  useEffect(() => {
    if (!statusLoading && status) {
      if (status.steps.account_created) {
        if (!status.steps.identity_verified) {
          router.push(ROUTES.ONBOARDING_VERIFY_IDENTITY);
        } else {
          router.push(ROUTES.DASHBOARD);
        }
      }
    }
  }, [status, statusLoading, router]);

  // Handle account creation via onboarding API
  const handleCreateAccount = async (data: AccountCreationData): Promise<{ accountId: string; nextStep?: string }> => {
    const response = await createAccount({
      name: data.name,
      spotify_artist_id: data.spotify_artist_id,
      social_instagram: data.social_instagram,
      social_facebook: data.social_facebook,
      social_twitter: data.social_twitter,
    });

    return {
      accountId: response.account?.id || '',
      nextStep: response.next_step,
    };
  };

  // Show loading while checking status
  if (statusLoading) {
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
    <AccountCreationWizard
      mode="onboarding"
      onCreateAccount={handleCreateAccount}
      onboardingStep={3}
      onboardingTotalSteps={4}
    />
  );
}
