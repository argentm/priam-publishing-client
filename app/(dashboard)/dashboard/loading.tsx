import { DashboardSkeleton } from '@/components/ui/skeletons';

/**
 * Dashboard Loading State
 *
 * Shows skeleton UI while dashboard data is loading.
 * Next.js automatically uses this for streaming SSR.
 */
export default function DashboardLoading() {
  return <DashboardSkeleton />;
}
