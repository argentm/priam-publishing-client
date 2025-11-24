/**
 * Role utilities for checking user permissions
 */

import type { UserRole } from '@/lib/types';

export function isAdmin(role?: string | null): boolean {
  return role === 'admin' || role === 'owner';
}

export function isOwner(role?: string | null): boolean {
  return role === 'owner';
}

export function canManageUsers(role?: string | null): boolean {
  return isAdmin(role);
}

export function canManageSettings(role?: string | null): boolean {
  return isAdmin(role);
}

export function canDeleteWorkspace(role?: string | null): boolean {
  return isOwner(role);
}

export function canCreateWorkspace(role?: string | null): boolean {
  return true;
}

