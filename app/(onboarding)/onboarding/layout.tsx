/**
 * Onboarding Flow Layout
 *
 * Note: Authentication is handled by middleware (lib/supabase/middleware.ts).
 * The verify-email page is accessible without auth (user hasn't confirmed email yet).
 * All other onboarding pages require authentication via middleware.
 */
export default function OnboardingFlowLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {children}
    </div>
  );
}
