/**
 * Dashboard data fetching functions
 */

import { createServerApiClient } from '@/lib/api/server-client';
import type { DashboardData, AccountDetails } from '@/lib/types';
import { API_ENDPOINTS } from '@/lib/constants';

export async function getDashboardData(): Promise<DashboardData> {
  const client = await createServerApiClient();
  try {
    return await client.get<DashboardData>(API_ENDPOINTS.DASHBOARD);
  } catch (error) {
    // Better error logging
    if (error && typeof error === 'object') {
      if ('error' in error && 'message' in error) {
        const apiError = error as { error: string; message: string };
        console.error('Failed to fetch dashboard data:', {
          error: apiError.error,
          message: apiError.message,
        });
      } else {
        // Log the full error object for debugging
        console.error('Failed to fetch dashboard data - unexpected error format:', {
          errorType: error.constructor?.name || typeof error,
          errorKeys: Object.keys(error),
          errorValue: error,
          stringified: JSON.stringify(error, Object.getOwnPropertyNames(error)),
        });
      }
    } else {
      console.error('Failed to fetch dashboard data - non-object error:', {
        errorType: typeof error,
        errorValue: error,
      });
    }
    return {
      accounts: [],
      user: null,
      account_count: 0,
    };
  }
}

export async function getAccountDetails(accountId: string): Promise<AccountDetails | null> {
  const client = await createServerApiClient();
  try {
    return await client.get<AccountDetails>(API_ENDPOINTS.ACCOUNT(accountId));
  } catch (error) {
    if (error && typeof error === 'object') {
      if ('error' in error && 'message' in error) {
        const apiError = error as { error: string; message: string };
        console.error('Failed to fetch account details:', {
          error: apiError.error,
          message: apiError.message,
        });
      } else {
        console.error('Failed to fetch account details - unexpected error format:', {
          errorType: error.constructor?.name || typeof error,
          errorKeys: Object.keys(error),
          errorValue: error,
          stringified: JSON.stringify(error, Object.getOwnPropertyNames(error)),
        });
      }
    } else {
      console.error('Failed to fetch account details - non-object error:', {
        errorType: typeof error,
        errorValue: error,
      });
    }
    return null;
  }
}

