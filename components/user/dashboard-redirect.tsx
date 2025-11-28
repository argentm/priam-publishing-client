'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/lib/constants';
import { getLastAccountId, setLastAccountId } from '@/lib/utils/account-storage';
import type { Account, OnboardingStatus } from '@/lib/types';
import { Loader2 } from 'lucide-react';

interface DashboardRedirectProps {
  accounts: Account[];
  onboardingStatus?: OnboardingStatus;
  children: React.ReactNode;
}

/**
 * Handles automatic redirect to last selected account's workspace.
 * Also checks if user needs to complete onboarding first.
 * - Incomplete onboarding: redirects to /onboarding
 * - No accounts: redirects to account creation
 * - Single account: always redirects to that account
 * - Multiple accounts with stored preference: redirects to stored account
 * - Multiple accounts without preference: shows dashboard (children)
 */
export function DashboardRedirect({ accounts, onboardingStatus, children }: DashboardRedirectProps) {
  const router = useRouter();
  const [shouldShowDashboard, setShouldShowDashboard] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // SECURITY: Fail-closed pattern - if onboarding status is unknown (undefined),
    // redirect to onboarding to verify. This prevents bypassing onboarding
    // if the status fetch fails.
    if (onboardingStatus === undefined) {
      router.replace(ROUTES.ONBOARDING);
      return;
    }

    // Check onboarding status first - redirect to onboarding if not complete
    if (onboardingStatus !== 'active') {
      router.replace(ROUTES.ONBOARDING);
      return;
    }

    // No accounts - redirect to onboarding wizard
    if (accounts.length === 0) {
      router.replace(ROUTES.ONBOARDING_NEW_ACCOUNT);
      return;
    }

    // Single account - always redirect and store
    if (accounts.length === 1) {
      const account = accounts[0];
      setLastAccountId(account.id);
      router.replace(ROUTES.WORKSPACE(account.id));
      return;
    }

    // Multiple accounts - check for stored preference
    const lastAccountId = getLastAccountId();

    if (lastAccountId) {
      // Verify the stored account still exists in user's accounts
      const accountExists = accounts.some((acc) => acc.id === lastAccountId);

      if (accountExists) {
        router.replace(ROUTES.WORKSPACE(lastAccountId));
        return;
      }
    }

    // No stored preference or invalid stored account - show dashboard
    setShouldShowDashboard(true);
    setIsChecking(false);
  }, [accounts, onboardingStatus, router]);

  // Show loading while checking redirect logic
  if (isChecking && !shouldShowDashboard) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Show dashboard content
  return <>{children}</>;
}
