import { Skeleton } from '@/components/ui/skeleton';

/**
 * Email Verified Loading State
 *
 * Shows skeleton matching the two-column success layout.
 */
export default function EmailVerifiedLoading() {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding skeleton (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-2/5 bg-gradient-to-br from-primary via-primary/90 to-accent/70 p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <Skeleton className="w-12 h-12 rounded-xl bg-white/20" />
            <Skeleton className="h-6 w-20 bg-white/20" />
          </div>
        </div>

        <div className="relative z-10 space-y-6">
          <Skeleton className="h-4 w-28 bg-white/20" />
          <Skeleton className="h-10 w-40 bg-white/20" />
          <Skeleton className="h-16 w-80 bg-white/20" />
        </div>

        <Skeleton className="h-4 w-48 bg-white/20" />
      </div>

      {/* Right side - Content skeleton */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-lg space-y-8 text-center">
          {/* Mobile header skeleton */}
          <div className="lg:hidden mb-8">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Skeleton className="w-10 h-10 rounded-xl" />
              <Skeleton className="h-6 w-16" />
            </div>
          </div>

          {/* Success icon skeleton */}
          <div className="flex justify-center">
            <Skeleton className="w-24 h-24 rounded-full" />
          </div>

          {/* Title skeleton */}
          <div className="space-y-2">
            <Skeleton className="h-8 w-40 mx-auto" />
            <Skeleton className="h-4 w-72 mx-auto" />
          </div>

          {/* Info box skeleton */}
          <Skeleton className="h-24 w-full rounded-xl" />

          {/* Button skeleton */}
          <Skeleton className="h-12 w-full rounded-lg" />

          <Skeleton className="h-3 w-64 mx-auto" />
        </div>
      </div>
    </div>
  );
}
