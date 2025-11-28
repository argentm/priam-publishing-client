'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ApiClient } from '@/lib/api/client';
import { API_ENDPOINTS, ROUTES } from '@/lib/constants';
import type {
  OnboardingStatus,
  OnboardingStatusResponse,
  AcceptTosResponse,
  OnboardingCreateAccountResponse,
  SkipIdentityResponse,
  SpotifyArtist,
} from '@/lib/types';

interface UseOnboardingReturn {
  status: OnboardingStatusResponse | null;
  isLoading: boolean;
  error: string | null;
  apiClient: ApiClient | null;
  refetch: () => Promise<void>;
  acceptTos: (version: string) => Promise<AcceptTosResponse>;
  createAccount: (data: CreateAccountData) => Promise<OnboardingCreateAccountResponse>;
  skipIdentity: () => Promise<SkipIdentityResponse>;
  navigateToStep: () => void;
}

interface CreateAccountData {
  name: string;
  spotify_artist_id?: string;
  social_instagram?: string;
  social_facebook?: string;
  social_twitter?: string;
}

/**
 * Hook for managing onboarding state and actions.
 * Provides current onboarding status and methods to progress through steps.
 */
export function useOnboarding(): UseOnboardingReturn {
  const router = useRouter();
  const [status, setStatus] = useState<OnboardingStatusResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiClient, setApiClient] = useState<ApiClient | null>(null);

  // Initialize API client
  useEffect(() => {
    const initClient = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      setApiClient(new ApiClient(async () => session?.access_token || null));
    };
    initClient();
  }, []);

  // Fetch onboarding status
  const fetchStatus = useCallback(async () => {
    if (!apiClient) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.get<OnboardingStatusResponse>(
        API_ENDPOINTS.ONBOARDING_STATUS
      );
      setStatus(response);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch onboarding status';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [apiClient]);

  // Fetch status when API client is ready
  useEffect(() => {
    if (apiClient) {
      fetchStatus();
    }
  }, [apiClient, fetchStatus]);

  // Accept Terms of Service
  const acceptTos = useCallback(async (version: string): Promise<AcceptTosResponse> => {
    if (!apiClient) throw new Error('API client not initialized');

    const response = await apiClient.post<AcceptTosResponse>(
      API_ENDPOINTS.ONBOARDING_ACCEPT_TOS,
      { tos_version: version }
    );

    // Refresh status after accepting ToS
    await fetchStatus();

    return response;
  }, [apiClient, fetchStatus]);

  // Create account during onboarding
  const createAccount = useCallback(async (data: CreateAccountData): Promise<OnboardingCreateAccountResponse> => {
    if (!apiClient) throw new Error('API client not initialized');

    const response = await apiClient.post<OnboardingCreateAccountResponse>(
      API_ENDPOINTS.ONBOARDING_CREATE_ACCOUNT,
      data
    );

    // Refresh status after creating account
    await fetchStatus();

    return response;
  }, [apiClient, fetchStatus]);

  // Skip identity verification
  const skipIdentity = useCallback(async (): Promise<SkipIdentityResponse> => {
    if (!apiClient) throw new Error('API client not initialized');

    const response = await apiClient.post<SkipIdentityResponse>(
      API_ENDPOINTS.ONBOARDING_SKIP_IDENTITY,
      {}
    );

    // Refresh status
    await fetchStatus();

    return response;
  }, [apiClient, fetchStatus]);

  // Navigate to the appropriate step based on current status
  const navigateToStep = useCallback(() => {
    if (!status) return;

    switch (status.onboarding_status) {
      case 'pending_email':
        router.push(ROUTES.ONBOARDING_VERIFY_EMAIL);
        break;
      case 'pending_account':
        // Check if ToS is accepted
        if (!status.user.tos_accepted_at) {
          router.push(ROUTES.ONBOARDING_TERMS);
        } else {
          router.push(ROUTES.ONBOARDING_CREATE_ACCOUNT);
        }
        break;
      case 'pending_identity':
        router.push(ROUTES.ONBOARDING_VERIFY_IDENTITY);
        break;
      case 'active':
        router.push(ROUTES.DASHBOARD);
        break;
      default:
        router.push(ROUTES.ONBOARDING);
    }
  }, [status, router]);

  return {
    status,
    isLoading,
    error,
    apiClient,
    refetch: fetchStatus,
    acceptTos,
    createAccount,
    skipIdentity,
    navigateToStep,
  };
}

/**
 * Get the step number for a given onboarding status
 */
export function getStepNumber(status: OnboardingStatus, tosAccepted: boolean): number {
  switch (status) {
    case 'pending_email':
      return 1;
    case 'pending_account':
      return tosAccepted ? 3 : 2;
    case 'pending_identity':
      return 4;
    case 'active':
      return 5; // Complete
    default:
      return 1;
  }
}

/**
 * Get the route for a given step number
 */
export function getStepRoute(step: number): string {
  switch (step) {
    case 1:
      return ROUTES.ONBOARDING_VERIFY_EMAIL;
    case 2:
      return ROUTES.ONBOARDING_TERMS;
    case 3:
      return ROUTES.ONBOARDING_CREATE_ACCOUNT;
    case 4:
      return ROUTES.ONBOARDING_VERIFY_IDENTITY;
    case 5:
      return ROUTES.DASHBOARD;
    default:
      return ROUTES.ONBOARDING;
  }
}
