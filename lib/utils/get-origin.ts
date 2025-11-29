/**
 * Get the correct origin URL for redirects in server-side routes.
 *
 * Security: Uses environment variable as primary source to prevent
 * header spoofing attacks. Headers are only used as fallback for
 * local development where env var isn't set.
 *
 * Priority:
 * 1. NEXT_PUBLIC_SITE_URL env var (most secure - configured value)
 * 2. x-forwarded-host header (fallback for local dev behind proxy)
 * 3. host header (fallback for local dev)
 * 4. Default to localhost
 */

import { headers } from 'next/headers';

export async function getOrigin(): Promise<string> {
  // Primary: Use configured site URL (most secure - prevents header spoofing)
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (configuredUrl && configuredUrl !== 'http://localhost:3000') {
    return configuredUrl;
  }

  // Fallback: Headers (for local development only)
  const headersList = await headers();
  const forwardedHost = headersList.get('x-forwarded-host');
  const host = forwardedHost || headersList.get('host');
  const protocol = headersList.get('x-forwarded-proto') || 'https';

  if (host) {
    return `${protocol}://${host}`;
  }

  return 'http://localhost:3000';
}

/**
 * Get the API URL for server-side API calls.
 *
 * Priority:
 * 1. API_URL - Server-only env var for internal/direct connections
 * 2. NEXT_PUBLIC_API_URL - Public API URL (used by browser via rewrites)
 * 3. Default to localhost for development
 */
export function getApiUrl(): string {
  return process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
}
