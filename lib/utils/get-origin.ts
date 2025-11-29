/**
 * Get the origin URL for redirects in server-side routes.
 *
 * Uses NEXT_PUBLIC_SITE_URL environment variable only.
 * No header fallbacks - explicit configuration required.
 */

export function getOrigin(): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!siteUrl) {
    throw new Error('NEXT_PUBLIC_SITE_URL environment variable is required');
  }
  return siteUrl;
}

/**
 * Get the API URL for server-side API calls.
 *
 * Priority:
 * 1. API_URL - Server-only env var for internal/direct connections
 * 2. NEXT_PUBLIC_API_URL - Public API URL (used by browser via rewrites)
 */
export function getApiUrl(): string {
  const apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    throw new Error('API_URL or NEXT_PUBLIC_API_URL environment variable is required');
  }
  return apiUrl;
}
