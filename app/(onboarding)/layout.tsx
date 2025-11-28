/**
 * Onboarding Route Group Layout
 *
 * Note: Authentication is handled by middleware (lib/supabase/middleware.ts).
 * The verify-email page is accessible without auth (user hasn't confirmed email yet).
 * All other onboarding pages require authentication via middleware.
 */
export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Full-screen layout without sidebar/header
  return <>{children}</>;
}
