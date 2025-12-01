/**
 * Invite Storage Utility
 *
 * Persists invite context in localStorage across the signup/verification flow.
 * This allows us to auto-accept the invite after ToS acceptance.
 *
 * Security: Stored data expires after 24 hours to limit exposure window.
 * Note: localStorage is accessible to any JS on the page, so we keep the
 * expiration short to minimize risk if an XSS vulnerability is exploited.
 */

const STORAGE_KEYS = {
  TOKEN: 'pending_invite_token',
  ACCOUNT_ID: 'pending_invite_account_id',
  ACCOUNT_NAME: 'pending_invite_account_name',
  EMAIL: 'pending_invite_email',
  TIMESTAMP: 'pending_invite_timestamp',
} as const;

// Invite context expires after 24 hours (reduced from 7 days for security)
const EXPIRATION_MS = 24 * 60 * 60 * 1000;

export interface InviteContext {
  token: string;
  accountId: string;
  accountName: string;
  email: string;
}

export const inviteStorage = {
  /**
   * Save invite context to localStorage with timestamp
   */
  save(invite: InviteContext): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.TOKEN, invite.token);
    localStorage.setItem(STORAGE_KEYS.ACCOUNT_ID, invite.accountId);
    localStorage.setItem(STORAGE_KEYS.ACCOUNT_NAME, invite.accountName);
    localStorage.setItem(STORAGE_KEYS.EMAIL, invite.email);
    localStorage.setItem(STORAGE_KEYS.TIMESTAMP, Date.now().toString());
  },

  /**
   * Get invite context from localStorage
   * Returns null if no invite is stored or if it has expired (>24 hours old)
   */
  get(): InviteContext | null {
    if (typeof window === 'undefined') return null;

    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    if (!token) return null;

    // Check expiration
    const timestamp = localStorage.getItem(STORAGE_KEYS.TIMESTAMP);
    if (timestamp) {
      const age = Date.now() - parseInt(timestamp, 10);
      if (age > EXPIRATION_MS) {
        // Expired - clear and return null
        this.clear();
        return null;
      }
    }

    return {
      token,
      accountId: localStorage.getItem(STORAGE_KEYS.ACCOUNT_ID) || '',
      accountName: localStorage.getItem(STORAGE_KEYS.ACCOUNT_NAME) || '',
      email: localStorage.getItem(STORAGE_KEYS.EMAIL) || '',
    };
  },

  /**
   * Clear invite context from localStorage
   */
  clear(): void {
    if (typeof window === 'undefined') return;
    Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
  },

  /**
   * Check if there's a valid (non-expired) pending invite stored
   */
  hasInvite(): boolean {
    return this.get() !== null;
  },
};
