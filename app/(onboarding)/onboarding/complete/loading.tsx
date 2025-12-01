import { Skeleton } from '@/components/ui/skeleton';

/**
 * Onboarding Complete Loading State
 *
 * Shows skeleton for the celebration page.
 */
export default function CompleteLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-b from-background to-muted/20">
      <div className="w-full max-w-2xl text-center space-y-8">
        {/* Logo skeleton */}
        <div className="flex justify-center">
          <Skeleton className="w-16 h-16 rounded-2xl" />
        </div>

        {/* Success icon skeleton */}
        <div className="flex justify-center">
          <Skeleton className="w-24 h-24 rounded-full" />
        </div>

        {/* Message skeleton */}
        <div className="space-y-3">
          <Skeleton className="h-10 w-64 mx-auto" />
          <Skeleton className="h-5 w-96 mx-auto" />
          <Skeleton className="h-5 w-80 mx-auto" />
        </div>

        {/* Quick actions skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-lg" />
          ))}
        </div>

        {/* CTA skeleton */}
        <Skeleton className="h-14 w-56 mx-auto rounded-lg" />

        <Skeleton className="h-4 w-40 mx-auto" />
      </div>
    </div>
  );
}
