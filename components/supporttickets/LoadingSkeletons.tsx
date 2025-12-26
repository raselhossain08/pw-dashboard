/**
 * Loading Skeletons for Support Tickets
 * Provides skeleton loading states for better UX
 */

import React from "react";

/**
 * Skeleton for stat card
 */
export const StatCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border animate-pulse">
      {/* Icon skeleton */}
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 bg-gray-200 rounded-lg" />
        <div className="w-16 h-6 bg-gray-200 rounded" />
      </div>

      {/* Value skeleton */}
      <div className="h-8 bg-gray-200 rounded w-20 mb-2" />

      {/* Label skeleton */}
      <div className="h-4 bg-gray-200 rounded w-32" />
    </div>
  );
};

/**
 * Skeleton for stats grid
 */
export const StatsGridSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCardSkeleton />
      <StatCardSkeleton />
      <StatCardSkeleton />
      <StatCardSkeleton />
    </div>
  );
};

/**
 * Skeleton for ticket card
 */
export const TicketCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white p-4 rounded-lg border animate-pulse">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          {/* Ticket number skeleton */}
          <div className="h-4 bg-gray-200 rounded w-24 mb-2" />

          {/* Subject skeleton */}
          <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />

          {/* Badges skeleton */}
          <div className="flex gap-2 mt-2">
            <div className="h-6 bg-gray-200 rounded-full w-16" />
            <div className="h-6 bg-gray-200 rounded-full w-20" />
          </div>
        </div>

        {/* Menu skeleton */}
        <div className="w-8 h-8 bg-gray-200 rounded" />
      </div>

      {/* Description skeleton */}
      <div className="space-y-2 mb-3">
        <div className="h-3 bg-gray-200 rounded w-full" />
        <div className="h-3 bg-gray-200 rounded w-5/6" />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t">
        <div className="flex items-center gap-3">
          {/* User avatar skeleton */}
          <div className="w-6 h-6 bg-gray-200 rounded-full" />
          <div className="h-3 bg-gray-200 rounded w-24" />
        </div>

        {/* Date skeleton */}
        <div className="h-3 bg-gray-200 rounded w-20" />
      </div>
    </div>
  );
};

/**
 * Skeleton for tickets list
 */
export const TicketsListSkeleton: React.FC<{ count?: number }> = ({
  count = 6,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <TicketCardSkeleton key={index} />
      ))}
    </div>
  );
};

/**
 * Skeleton for ticket details header
 */
export const TicketDetailsHeaderSkeleton: React.FC = () => {
  return (
    <div className="animate-pulse">
      {/* Ticket number */}
      <div className="h-5 bg-gray-200 rounded w-32 mb-3" />

      {/* Subject */}
      <div className="h-7 bg-gray-200 rounded w-3/4 mb-4" />

      {/* Badges and info */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="h-6 bg-gray-200 rounded-full w-24" />
        <div className="h-6 bg-gray-200 rounded-full w-20" />
        <div className="h-6 bg-gray-200 rounded-full w-28" />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-4/5" />
      </div>
    </div>
  );
};

/**
 * Skeleton for reply item
 */
export const ReplySkeleton: React.FC = () => {
  return (
    <div className="flex gap-3 p-4 bg-gray-50 rounded-lg animate-pulse">
      {/* Avatar skeleton */}
      <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0" />

      <div className="flex-1">
        {/* Name and date skeleton */}
        <div className="flex items-center justify-between mb-2">
          <div className="h-4 bg-gray-200 rounded w-32" />
          <div className="h-3 bg-gray-200 rounded w-20" />
        </div>

        {/* Message skeleton */}
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 rounded w-full" />
          <div className="h-3 bg-gray-200 rounded w-5/6" />
          <div className="h-3 bg-gray-200 rounded w-4/6" />
        </div>
      </div>
    </div>
  );
};

/**
 * Skeleton for replies list
 */
export const RepliesListSkeleton: React.FC<{ count?: number }> = ({
  count = 3,
}) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, index) => (
        <ReplySkeleton key={index} />
      ))}
    </div>
  );
};

/**
 * Skeleton for ticket form
 */
export const TicketFormSkeleton: React.FC = () => {
  return (
    <div className="space-y-4 animate-pulse">
      {/* Subject field */}
      <div>
        <div className="h-4 bg-gray-200 rounded w-20 mb-2" />
        <div className="h-10 bg-gray-100 rounded" />
      </div>

      {/* Category field */}
      <div>
        <div className="h-4 bg-gray-200 rounded w-24 mb-2" />
        <div className="h-10 bg-gray-100 rounded" />
      </div>

      {/* Priority field */}
      <div>
        <div className="h-4 bg-gray-200 rounded w-20 mb-2" />
        <div className="h-10 bg-gray-100 rounded" />
      </div>

      {/* Description field */}
      <div>
        <div className="h-4 bg-gray-200 rounded w-28 mb-2" />
        <div className="h-32 bg-gray-100 rounded" />
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-2">
        <div className="h-10 bg-gray-200 rounded w-20" />
        <div className="h-10 bg-blue-200 rounded w-28" />
      </div>
    </div>
  );
};

/**
 * Skeleton for filter bar
 */
export const FilterBarSkeleton: React.FC = () => {
  return (
    <div className="flex flex-wrap gap-3 mb-4 animate-pulse">
      {/* Search skeleton */}
      <div className="flex-1 min-w-[200px]">
        <div className="h-10 bg-gray-100 rounded" />
      </div>

      {/* Filter dropdowns */}
      <div className="h-10 bg-gray-100 rounded w-32" />
      <div className="h-10 bg-gray-100 rounded w-32" />
      <div className="h-10 bg-gray-100 rounded w-32" />

      {/* Action button */}
      <div className="h-10 bg-blue-200 rounded w-40" />
    </div>
  );
};

/**
 * Skeleton for tabs
 */
export const TabsSkeleton: React.FC = () => {
  return (
    <div className="flex gap-2 mb-6 animate-pulse">
      <div className="h-10 bg-gray-200 rounded w-24" />
      <div className="h-10 bg-gray-200 rounded w-32" />
      <div className="h-10 bg-gray-200 rounded w-28" />
    </div>
  );
};

/**
 * Skeleton for pagination
 */
export const PaginationSkeleton: React.FC = () => {
  return (
    <div className="flex items-center justify-between mt-6 animate-pulse">
      {/* Page info skeleton */}
      <div className="h-4 bg-gray-200 rounded w-40" />

      {/* Buttons skeleton */}
      <div className="flex gap-2">
        <div className="h-10 bg-gray-200 rounded w-24" />
        <div className="h-10 bg-gray-200 rounded w-20" />
      </div>
    </div>
  );
};

/**
 * Skeleton for assignment dialog
 */
export const AssignmentDialogSkeleton: React.FC = () => {
  return (
    <div className="space-y-4 animate-pulse">
      {/* Label */}
      <div className="h-4 bg-gray-200 rounded w-32 mb-3" />

      {/* User list skeleton */}
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 p-3 bg-gray-50 rounded"
          >
            <div className="w-8 h-8 bg-gray-200 rounded-full" />
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-32 mb-1" />
              <div className="h-3 bg-gray-200 rounded w-48" />
            </div>
            <div className="w-5 h-5 bg-gray-200 rounded" />
          </div>
        ))}
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-2 pt-4">
        <div className="h-10 bg-gray-200 rounded w-20" />
        <div className="h-10 bg-blue-200 rounded w-24" />
      </div>
    </div>
  );
};

/**
 * Skeleton for rating dialog
 */
export const RatingDialogSkeleton: React.FC = () => {
  return (
    <div className="space-y-4 animate-pulse">
      {/* Rating stars skeleton */}
      <div className="flex justify-center gap-2 py-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="w-10 h-10 bg-gray-200 rounded-full" />
        ))}
      </div>

      {/* Feedback field */}
      <div>
        <div className="h-4 bg-gray-200 rounded w-24 mb-2" />
        <div className="h-24 bg-gray-100 rounded" />
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-2">
        <div className="h-10 bg-gray-200 rounded w-20" />
        <div className="h-10 bg-blue-200 rounded w-28" />
      </div>
    </div>
  );
};

/**
 * Skeleton for empty state
 */
export const EmptyStateSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12 animate-pulse">
      {/* Icon skeleton */}
      <div className="w-24 h-24 bg-gray-200 rounded-full mb-4" />

      {/* Title skeleton */}
      <div className="h-6 bg-gray-200 rounded w-48 mb-2" />

      {/* Description skeleton */}
      <div className="h-4 bg-gray-200 rounded w-64 mb-6" />

      {/* Button skeleton */}
      <div className="h-10 bg-blue-200 rounded w-40" />
    </div>
  );
};

/**
 * Skeleton for ticket timeline
 */
export const TimelineSkeleton: React.FC = () => {
  return (
    <div className="space-y-4 animate-pulse">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex gap-3">
          {/* Dot */}
          <div className="w-3 h-3 bg-gray-200 rounded-full mt-1" />

          {/* Content */}
          <div className="flex-1 pb-4">
            <div className="h-4 bg-gray-200 rounded w-48 mb-2" />
            <div className="h-3 bg-gray-200 rounded w-32" />
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Full page loading skeleton
 */
export const SupportTicketsPageSkeleton: React.FC = () => {
  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-48 mb-2" />
        <div className="h-4 bg-gray-200 rounded w-64" />
      </div>

      {/* Stats grid */}
      <StatsGridSkeleton />

      {/* Tabs */}
      <TabsSkeleton />

      {/* Filters */}
      <FilterBarSkeleton />

      {/* Tickets list */}
      <TicketsListSkeleton count={6} />

      {/* Pagination */}
      <PaginationSkeleton />
    </div>
  );
};

/**
 * Skeleton for ticket details view
 */
export const TicketDetailsViewSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header */}
      <TicketDetailsHeaderSkeleton />

      {/* Divider */}
      <div className="h-px bg-gray-200" />

      {/* Timeline */}
      <div>
        <div className="h-5 bg-gray-200 rounded w-32 mb-4" />
        <TimelineSkeleton />
      </div>

      {/* Divider */}
      <div className="h-px bg-gray-200" />

      {/* Replies */}
      <div>
        <div className="h-5 bg-gray-200 rounded w-24 mb-4" />
        <RepliesListSkeleton count={3} />
      </div>

      {/* Reply input */}
      <div className="pt-4 border-t">
        <div className="h-24 bg-gray-100 rounded mb-3" />
        <div className="flex justify-end">
          <div className="h-10 bg-blue-200 rounded w-32" />
        </div>
      </div>
    </div>
  );
};

export default {
  StatCardSkeleton,
  StatsGridSkeleton,
  TicketCardSkeleton,
  TicketsListSkeleton,
  TicketDetailsHeaderSkeleton,
  ReplySkeleton,
  RepliesListSkeleton,
  TicketFormSkeleton,
  FilterBarSkeleton,
  TabsSkeleton,
  PaginationSkeleton,
  AssignmentDialogSkeleton,
  RatingDialogSkeleton,
  EmptyStateSkeleton,
  TimelineSkeleton,
  SupportTicketsPageSkeleton,
  TicketDetailsViewSkeleton,
};
