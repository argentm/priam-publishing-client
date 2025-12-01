import { WorksListSkeleton } from '@/components/ui/skeletons';

/**
 * Works List Loading State
 *
 * Shows skeleton UI while works list is loading.
 * Includes table skeleton with status filter and search inputs.
 */
export default function WorksLoading() {
  return <WorksListSkeleton />;
}
