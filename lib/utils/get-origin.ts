/**
 * Get the correct origin URL for redirects in server-side routes.
 *
 * In production environments (especially behind proxies like DigitalOcean),
 * `request.url` often returns the internal URL (localhost) instead of
 * the external URL. This utility reads from headers which are set correctly
 * by the proxy/load balancer.
 *
 * Priority:
 * 1. x-forwarded-host header (set by proxies)
 * 2. host header (standard HTTP header)
 * 3. Fallback to NEXT_PUBLIC_SITE_URL env var
 * 4. Default to localhost for development
 */

import { headers } from 'next/headers';

export async function getOrigin(): Promise<string> {
  const headersList = await headers();

  // x-forwarded-host is set by reverse proxies (DigitalOcean, Vercel, etc.)
  const forwardedHost = headersList.get('x-forwarded-host');
  const host = forwardedHost || headersList.get('host');

  // x-forwarded-proto tells us if the original request was HTTPS
  const protocol = headersList.get('x-forwarded-proto') || 'https';

  if (host) {
    return `${protocol}://${host}`;
  }

  // Fallback to env var (useful for local development)
  return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
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
