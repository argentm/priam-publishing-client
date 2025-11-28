/**
 * Account Storage Utility
 * Stores and retrieves the last selected account ID from localStorage
 */

const LAST_ACCOUNT_KEY = 'priam_last_account_id';

/**
 * Get the last selected account ID from localStorage
 */
export function getLastAccountId(): string | null {
  if (typeof window === 'undefined') return null;

  try {
    return localStorage.getItem(LAST_ACCOUNT_KEY);
  } catch {
    return null;
  }
}

/**
 * Store the last selected account ID in localStorage
 */
export function setLastAccountId(accountId: string): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(LAST_ACCOUNT_KEY, accountId);
  } catch {
    // Silently fail if localStorage is not available
  }
}

/**
 * Clear the last selected account ID from localStorage
 */
export function clearLastAccountId(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(LAST_ACCOUNT_KEY);
  } catch {
    // Silently fail if localStorage is not available
  }
}
