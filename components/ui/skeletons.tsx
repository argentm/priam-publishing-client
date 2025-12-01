'use client';

import { cn } from '@/lib/utils';
import { Skeleton } from './skeleton';
import { Card, CardContent, CardHeader } from './card';

/**
 * Skeleton Components Library
 *
 * Provides consistent loading states across the application.
 * Uses Skeleton primitive with predefined layouts for common patterns.
 */

// ============================================================================
// Page-level Skeletons
// ============================================================================

interface PageHeaderSkeletonProps {
  /** Show subtitle line */
  showSubtitle?: boolean;
  className?: string;
}

export function PageHeaderSkeleton({ showSubtitle = true, className }: PageHeaderSkeletonProps) {
  return (
    <div className={cn('mb-6 sm:mb-8', className)}>
      <Skeleton className="h-8 sm:h-10 w-48 sm:w-64" />
      {showSubtitle && <Skeleton className="h-4 sm:h-5 w-72 sm:w-96 mt-2" />}
    </div>
  );
}

// ============================================================================
// Card Skeletons
// ============================================================================

interface CardSkeletonProps {
  /** Number of content rows to show */
  rows?: number;
  /** Show card header */
  showHeader?: boolean;
  className?: string;
}

export function CardSkeleton({ rows = 3, showHeader = true, className }: CardSkeletonProps) {
  return (
    <Card className={cn('', className)}>
      {showHeader && (
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48 mt-1" />
        </CardHeader>
      )}
      <CardContent className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Table Skeletons
// ============================================================================

interface TableSkeletonProps {
  /** Number of rows to render */
  rows?: number;
  /** Number of columns */
  columns?: number;
  /** Show table header */
  showHeader?: boolean;
  className?: string;
}

export function TableSkeleton({
  rows = 5,
  columns = 5,
  showHeader = true,
  className
}: TableSkeletonProps) {
  return (
    <div className={cn('w-full', className)}>
      {/* Table header */}
      {showHeader && (
        <div className="flex gap-4 pb-3 mb-3 border-b">
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton
              key={i}
              className={cn(
                'h-4',
                i === 0 ? 'w-32' : i === columns - 1 ? 'w-16 ml-auto' : 'w-20'
              )}
            />
          ))}
        </div>
      )}

      {/* Table rows */}
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="flex items-center gap-4 py-3">
            {/* First column with icon */}
            <div className="flex items-center gap-3 flex-1">
              <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-4 w-32 sm:w-48" />
                <Skeleton className="h-3 w-20 sm:w-32" />
              </div>
            </div>

            {/* Middle columns */}
            {Array.from({ length: Math.max(0, columns - 2) }).map((_, colIndex) => (
              <Skeleton
                key={colIndex}
                className="h-4 w-16 sm:w-24 hidden sm:block"
              />
            ))}

            {/* Action column */}
            <Skeleton className="h-8 w-16 shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// List Skeletons
// ============================================================================

interface ListSkeletonProps {
  /** Number of items */
  items?: number;
  /** Show avatar/icon */
  showAvatar?: boolean;
  className?: string;
}

export function ListSkeleton({ items = 5, showAvatar = true, className }: ListSkeletonProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: items }).map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between p-4 rounded-xl border"
        >
          <div className="flex items-center gap-4">
            {showAvatar && <Skeleton className="w-12 h-12 rounded-lg" />}
            <div className="space-y-1.5">
              <Skeleton className="h-5 w-32 sm:w-48" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
          <Skeleton className="w-5 h-5 rounded" />
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// Form Skeletons
// ============================================================================

interface FormSkeletonProps {
  /** Number of fields */
  fields?: number;
  /** Show submit button */
  showButton?: boolean;
  className?: string;
}

export function FormSkeleton({ fields = 4, showButton = true, className }: FormSkeletonProps) {
  return (
    <div className={cn('space-y-6', className)}>
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
      {showButton && (
        <div className="flex justify-end gap-2 pt-4">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-32" />
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Dashboard Skeletons
// ============================================================================

export function DashboardSkeleton() {
  return (
    <div className="max-w-7xl mx-auto">
      {/* Welcome section */}
      <div className="mb-8">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-5 w-48 mt-2" />
      </div>

      {/* Cards grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Accounts card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Skeleton className="w-5 h-5" />
              <Skeleton className="h-6 w-32" />
            </div>
            <Skeleton className="h-4 w-48 mt-1" />
          </CardHeader>
          <CardContent>
            <ListSkeleton items={3} />
            <div className="mt-4 pt-4 border-t">
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>

        {/* Activity card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Skeleton className="w-5 h-5" />
              <Skeleton className="h-6 w-32" />
            </div>
            <Skeleton className="h-4 w-48 mt-1" />
          </CardHeader>
          <CardContent className="py-12">
            <div className="text-center">
              <Skeleton className="w-12 h-12 mx-auto rounded-full" />
              <Skeleton className="h-4 w-40 mx-auto mt-3" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ============================================================================
// Works List Skeleton
// ============================================================================

export function WorksListSkeleton() {
  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeaderSkeleton />

      <Card>
        <CardHeader className="pb-3 sm:pb-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <Skeleton className="h-6 w-28" />
              <Skeleton className="h-4 w-40 mt-1" />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Skeleton className="h-10 w-36" />
              <Skeleton className="h-10 flex-1 sm:w-44" />
              <Skeleton className="h-10 w-10" />
              <Skeleton className="h-10 w-28 hidden sm:block" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <TableSkeleton rows={8} columns={6} />
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================================
// Composers/Tracks List Skeleton
// ============================================================================

export function EntityListSkeleton() {
  return (
    <>
      <PageHeaderSkeleton />

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48 mt-1" />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Skeleton className="h-10 flex-1 sm:w-64" />
              <Skeleton className="h-10 w-10" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-1 mt-4 border-b">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-28" />
            <Skeleton className="h-10 w-24" />
          </div>
        </CardHeader>
        <CardContent>
          <TableSkeleton rows={8} columns={6} />
        </CardContent>
      </Card>
    </>
  );
}

// ============================================================================
// Editor Skeleton (for detail/edit pages)
// ============================================================================

export function EditorSkeleton() {
  return (
    <div className="max-w-4xl">
      <PageHeaderSkeleton />

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-64 mt-1" />
        </CardHeader>
        <CardContent>
          <FormSkeleton fields={6} />
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================================
// Account Settings Skeleton
// ============================================================================

export function SettingsSkeleton() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeaderSkeleton />

      {/* Settings sections */}
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48 mt-1" />
          </CardHeader>
          <CardContent>
            <FormSkeleton fields={3} showButton={i === 1} />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
