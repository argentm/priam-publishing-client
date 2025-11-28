/**
 * Supabase Middleware Helper
 *
 * Handles session refresh and route protection with onboarding status checks.
 * This provides server-side route protection that cannot be bypassed.
 */

import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Route categories for protection logic
const PUBLIC_ROUTES = [
  '/login',
  '/signup',
  '/auth/callback',
  '/auth/confirm',
  '/onboarding/verify-email',
  '/onboarding/email-verified',
  '/forgot-password',
  '/reset-password',
];

// Routes that require auth but NOT complete onboarding
const ONBOARDING_ROUTES = [
  '/onboarding',
  '/onboarding/terms',
  '/onboarding/create-account',
  '/onboarding/verify-identity',
  '/onboarding/complete',
];

// Routes that require complete onboarding (status = 'active')
const PROTECTED_ROUTES = [
  '/dashboard',
  '/admin',
];

// Invite routes - special case, requires auth but flexible onboarding
const INVITE_ROUTES = ['/invite'];

/**
 * Check if a path matches any of the given prefixes
 */
function matchesRoute(pathname: string, routes: string[]): boolean {
  return routes.some(route =>
    pathname === route || pathname.startsWith(`${route}/`)
  );
}

/**
 * Get the appropriate onboarding redirect based on status
 */
function getOnboardingRedirect(
  onboardingStatus: string,
  tosAcceptedAt: string | null | undefined
): string {
  switch (onboardingStatus) {
    case 'pending_email':
      return '/onboarding/verify-email';
    case 'pending_account':
      return tosAcceptedAt ? '/onboarding/create-account' : '/onboarding/terms';
    case 'pending_identity':
      return '/onboarding/verify-identity';
    case 'active':
    default:
      return '/dashboard';
  }
}

/**
 * Check if user is on the correct onboarding step
 */
function isCorrectOnboardingStep(
  pathname: string,
  onboardingStatus: string,
  tosAcceptedAt: string | null | undefined
): boolean {
  const expectedPath = getOnboardingRedirect(onboardingStatus, tosAcceptedAt);
  // Allow access to the expected path or the main /onboarding page (which redirects)
  return pathname === expectedPath || pathname === '/onboarding';
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: Use getUser() not getSession() for security
  // getUser() validates the token with Supabase Auth server
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // ========================================
  // Public routes - no auth required
  // ========================================
  if (matchesRoute(pathname, PUBLIC_ROUTES)) {
    // If user is authenticated and accessing login/signup, redirect to dashboard
    if (user && (pathname === '/login' || pathname === '/signup')) {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }
    return supabaseResponse;
  }

  // ========================================
  // All routes below require authentication
  // ========================================
  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    // Preserve the original URL as a redirect target (if it's a protected route)
    if (matchesRoute(pathname, PROTECTED_ROUTES)) {
      url.searchParams.set('next', pathname);
    }
    return NextResponse.redirect(url);
  }

  // ========================================
  // Fetch onboarding status from API
  // ========================================
  let onboardingStatus = 'active'; // Default to active for safety
  let tosAcceptedAt: string | null = null;

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const session = await supabase.auth.getSession();
    const accessToken = session.data.session?.access_token;

    if (accessToken) {
      const response = await fetch(`${apiUrl}/api/onboarding/status`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        // Short timeout to not block the middleware too long
        signal: AbortSignal.timeout(3000),
      });

      if (response.ok) {
        const data = await response.json();
        onboardingStatus = data.onboarding_status || 'active';
        tosAcceptedAt = data.user?.tos_accepted_at || null;
      }
    }
  } catch (error) {
    // If we can't fetch onboarding status, allow access to prevent lockout
    // The page-level checks will handle any issues
    console.error('Middleware: Failed to fetch onboarding status:', error);
  }

  // ========================================
  // Invite routes - special handling
  // ========================================
  if (matchesRoute(pathname, INVITE_ROUTES)) {
    // Allow authenticated users to access invite pages regardless of onboarding
    // The invite acceptance will handle onboarding completion
    return supabaseResponse;
  }

  // ========================================
  // Protected routes - require complete onboarding
  // ========================================
  if (matchesRoute(pathname, PROTECTED_ROUTES)) {
    if (onboardingStatus !== 'active') {
      // User hasn't completed onboarding - redirect to correct step
      const url = request.nextUrl.clone();
      url.pathname = getOnboardingRedirect(onboardingStatus, tosAcceptedAt);
      return NextResponse.redirect(url);
    }
    // User is fully onboarded - allow access
    return supabaseResponse;
  }

  // ========================================
  // Onboarding routes - require auth but not complete onboarding
  // ========================================
  if (matchesRoute(pathname, ONBOARDING_ROUTES)) {
    // If user is already active, redirect to dashboard
    if (onboardingStatus === 'active') {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }

    // Ensure user is on the correct onboarding step
    // This prevents step-skipping
    if (!isCorrectOnboardingStep(pathname, onboardingStatus, tosAcceptedAt)) {
      const url = request.nextUrl.clone();
      url.pathname = getOnboardingRedirect(onboardingStatus, tosAcceptedAt);
      return NextResponse.redirect(url);
    }

    return supabaseResponse;
  }

  // ========================================
  // Default - allow access for any other authenticated route
  // ========================================
  return supabaseResponse;
}
