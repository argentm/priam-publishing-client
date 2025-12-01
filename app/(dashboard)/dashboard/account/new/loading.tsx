import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeaderSkeleton } from '@/components/ui/skeletons';

/**
 * New Account Loading State
 *
 * Shows skeleton UI while the new account form loads.
 */
export default function NewAccountLoading() {
  return (
    <div className="max-w-2xl mx-auto">
      <PageHeaderSkeleton />

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-4 w-64 mt-1" />
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Account name field */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-10 w-full" />
          </div>

          {/* Spotify link section */}
          <div className="pt-4 border-t">
            <Skeleton className="h-5 w-32 mb-2" />
            <Skeleton className="h-4 w-48 mb-4" />
            <Skeleton className="h-10 w-40" />
          </div>

          {/* Submit button */}
          <div className="flex justify-end pt-4">
            <Skeleton className="h-10 w-36" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
