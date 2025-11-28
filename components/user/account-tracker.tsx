'use client';

import { useEffect } from 'react';
import { setLastAccountId } from '@/lib/utils/account-storage';

interface AccountTrackerProps {
  accountId: string;
}

/**
 * Invisible component that stores the current account ID in localStorage.
 * Include this in workspace pages to track the last viewed account.
 */
export function AccountTracker({ accountId }: AccountTrackerProps) {
  useEffect(() => {
    setLastAccountId(accountId);
  }, [accountId]);

  return null;
}
