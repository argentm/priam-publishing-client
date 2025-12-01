import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeaderSkeleton } from '@/components/ui/skeletons';

/**
 * New Work Wizard Loading State
 *
 * Shows skeleton UI while the work creation wizard loads.
 */
export default function NewWorkLoading() {
  return (
    <div className="max-w-4xl mx-auto">
      <PageHeaderSkeleton />

      {/* Wizard step indicator */}
      <div className="flex justify-center mb-8">
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center">
              <Skeleton className="w-8 h-8 rounded-full" />
              {i < 5 && <Skeleton className="w-8 h-0.5 mx-1" />}
            </div>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-64 mt-1" />
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Form fields */}
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}

          {/* Navigation buttons */}
          <div className="flex justify-between pt-4">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-32" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
