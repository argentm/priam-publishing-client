/**
 * Admin utilities
 */

import type { User } from '@/lib/types';

export function isAdmin(user?: User | null): boolean {
  return user?.is_admin === true;
}

export function requireAdmin(user?: User | null): void {
  if (!isAdmin(user)) {
    throw new Error('Unauthorized: Admin access required');
  }
}

