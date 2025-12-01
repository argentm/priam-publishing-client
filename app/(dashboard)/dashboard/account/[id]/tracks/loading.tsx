import { EntityListSkeleton } from '@/components/ui/skeletons';

/**
 * Tracks List Loading State
 *
 * Shows skeleton UI while tracks list is loading.
 * Reuses EntityListSkeleton for consistent UX.
 */
export default function TracksLoading() {
  return <EntityListSkeleton />;
}
