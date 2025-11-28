import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/**
 * Validates and sanitizes the redirect path to prevent open redirect attacks.
 * Only allows relative paths within the application.
 */
function sanitizeRedirectPath(path: string): string {
  const defaultPath = '/dashboard';

  // Must be a string
  if (typeof path !== 'string') {
    return defaultPath;
  }

  // Trim whitespace
  const trimmed = path.trim();

  // Must start with a single forward slash (relative path)
  // Reject: "//evil.com", "https://evil.com", "javascript:", etc.
  if (!trimmed.startsWith('/') || trimmed.startsWith('//')) {
    return defaultPath;
  }

  // Reject paths with protocol-like patterns
  if (/^\/[a-z]+:/i.test(trimmed)) {
    return defaultPath;
  }

  // Reject paths with encoded characters that could bypass checks
  // Decode and re-validate
  try {
    const decoded = decodeURIComponent(trimmed);
    if (decoded !== trimmed) {
      // Contains encoded characters - re-validate the decoded version
      if (!decoded.startsWith('/') || decoded.startsWith('//') || /^\/[a-z]+:/i.test(decoded)) {
        return defaultPath;
      }
    }
  } catch {
    // Invalid encoding
    return defaultPath;
  }

  // Only allow paths to known route prefixes (whitelist approach)
  const allowedPrefixes = [
    '/dashboard',
    '/onboarding',
    '/admin',
    '/account',
    '/settings',
    '/reset-password',
  ];

  const isAllowedPath = allowedPrefixes.some(prefix =>
    trimmed === prefix || trimmed.startsWith(`${prefix}/`) || trimmed.startsWith(`${prefix}?`)
  );

  if (!isAllowedPath) {
    return defaultPath;
  }

  return trimmed;
}

/**
 * Helper to determine redirect path based on onboarding status.
 * Called after successful authentication to route users appropriately.
 */
async function getOnboardingRedirect(
  accessToken: string,
  defaultNext: string
): Promise<string> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const response = await fetch(`${apiUrl}/api/onboarding/status`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      // If we can't get status, default to the specified next path
      return defaultNext;
    }

    const data = await response.json();
    const status = data.onboarding_status;
    const tosAccepted = data.user?.tos_accepted_at;

    switch (status) {
      case 'pending_email':
        return '/onboarding/verify-email';
      case 'pending_account':
        // Check if ToS is accepted
        return tosAccepted ? '/onboarding/create-account' : '/onboarding/terms';
      case 'pending_identity':
        return '/onboarding/verify-identity';
      case 'active':
      default:
        return defaultNext;
    }
  } catch (error) {
    console.error('Failed to fetch onboarding status:', error);
    return defaultNext;
  }
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const rawNext = searchParams.get('next') ?? '/dashboard';

  // Sanitize the redirect path to prevent open redirect attacks
  const next = sanitizeRedirectPath(rawNext);

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.session) {
      // Check onboarding status and redirect appropriately
      const redirectPath = await getOnboardingRedirect(
        data.session.access_token,
        next
      );
      return NextResponse.redirect(`${origin}${redirectPath}`);
    }
  }

  // Return to login with error
  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`);
}
