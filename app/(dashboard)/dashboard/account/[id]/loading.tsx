import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeaderSkeleton, CardSkeleton } from '@/components/ui/skeletons';

/**
 * Account Overview Loading State
 *
 * Shows skeleton UI while account overview page loads.
 * Displays stats cards and recent activity skeleton.
 */
export default function AccountOverviewLoading() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton />

      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-20" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-3 w-24 mt-1" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent items */}
      <div className="grid gap-6 lg:grid-cols-2">
        <CardSkeleton rows={5} />
        <CardSkeleton rows={5} />
      </div>
    </div>
  );
}
