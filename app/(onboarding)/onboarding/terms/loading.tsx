import { Skeleton } from '@/components/ui/skeleton';

/**
 * Terms of Service Loading State
 *
 * Shows skeleton matching the two-column onboarding layout with terms content area.
 */
export default function TermsLoading() {
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
          <Skeleton className="h-4 w-24 bg-white/20" />
          <Skeleton className="h-10 w-48 bg-white/20" />
          <Skeleton className="h-16 w-80 bg-white/20" />
          {/* Key points skeleton */}
          <div className="space-y-4 pt-4">
            <div className="flex items-start gap-3">
              <Skeleton className="w-8 h-8 rounded-lg bg-white/20" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-36 bg-white/20" />
                <Skeleton className="h-3 w-28 bg-white/20" />
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Skeleton className="w-8 h-8 rounded-lg bg-white/20" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-28 bg-white/20" />
                <Skeleton className="h-3 w-40 bg-white/20" />
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Skeleton className="w-8 h-8 rounded-lg bg-white/20" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-24 bg-white/20" />
                <Skeleton className="h-3 w-32 bg-white/20" />
              </div>
            </div>
          </div>
        </div>

        <Skeleton className="h-4 w-48 bg-white/20" />
      </div>

      {/* Right side - Content skeleton */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-lg space-y-6">
          {/* Mobile header skeleton */}
          <div className="lg:hidden mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-xl" />
                <Skeleton className="h-6 w-16" />
              </div>
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-2 w-full rounded-full" />
          </div>

          {/* Step indicator skeleton */}
          <div className="hidden lg:block mb-8">
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>

          {/* Title skeleton */}
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </div>

          {/* Terms content area skeleton */}
          <div className="border rounded-xl p-6 h-[300px]">
            <div className="space-y-4">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-5 w-32 mt-4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-5 w-36 mt-4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>

          {/* Checkbox skeleton */}
          <div className="flex items-start space-x-3">
            <Skeleton className="w-4 h-4 rounded" />
            <Skeleton className="h-4 w-80" />
          </div>

          {/* Button skeleton */}
          <Skeleton className="h-12 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}
