import { EntityListSkeleton } from '@/components/ui/skeletons';

/**
 * Composers List Loading State
 *
 * Shows skeleton UI while composers list is loading.
 * Includes filter tabs and table skeleton.
 */
export default function ComposersLoading() {
  return <EntityListSkeleton />;
}
