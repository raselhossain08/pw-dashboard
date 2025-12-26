/**
 * Loading Skeleton Components for AI Agents
 *
 * Provides smooth loading states while data is being fetched
 * Improves perceived performance and user experience
 */

import React from "react";

/**
 * Skeleton for analytics cards
 */
export const AnalyticsCardSkeleton: React.FC = () => (
  <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100 animate-pulse">
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <div className="h-4 bg-gray-200 rounded w-24 mb-3"></div>
        <div className="h-8 bg-gray-300 rounded w-16 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-20"></div>
      </div>
      <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
    </div>
  </div>
);

/**
 * Skeleton for agent cards
 */
export const AgentCardSkeleton: React.FC = () => (
  <div className="rounded-xl p-6 shadow-sm border border-gray-100 bg-card animate-pulse">
    <div className="flex justify-between items-start mb-4">
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
        <div className="flex-1">
          <div className="h-5 bg-gray-300 rounded w-32 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-20"></div>
        </div>
      </div>
      <div className="w-8 h-8 bg-gray-200 rounded"></div>
    </div>
    <div className="h-12 bg-gray-200 rounded mb-4"></div>
    <div className="flex justify-between mb-4">
      <div className="h-4 bg-gray-200 rounded w-24"></div>
      <div className="h-4 bg-gray-200 rounded w-20"></div>
    </div>
    <div className="flex space-x-2">
      <div className="flex-1 h-10 bg-gray-200 rounded"></div>
      <div className="w-10 h-10 bg-gray-200 rounded"></div>
    </div>
  </div>
);

/**
 * Skeleton for conversation table rows
 */
export const ConversationRowSkeleton: React.FC = () => (
  <tr className="animate-pulse">
    <td className="px-6 py-4">
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
        <div className="h-4 bg-gray-200 rounded w-32"></div>
      </div>
    </td>
    <td className="px-6 py-4">
      <div className="h-4 bg-gray-200 rounded w-28"></div>
    </td>
    <td className="px-6 py-4">
      <div className="h-4 bg-gray-200 rounded w-20"></div>
    </td>
    <td className="px-6 py-4">
      <div className="h-4 bg-gray-200 rounded w-16"></div>
    </td>
    <td className="px-6 py-4">
      <div className="h-6 bg-gray-200 rounded-full w-20"></div>
    </td>
    <td className="px-6 py-4">
      <div className="h-8 bg-gray-200 rounded w-16"></div>
    </td>
  </tr>
);

/**
 * Full page loading skeleton
 */
export const AIAgentsLoadingSkeleton: React.FC = () => (
  <main className="p-6">
    {/* Header Skeleton */}
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-4">
      <div>
        <div className="h-9 bg-gray-300 rounded w-48 mb-2 animate-pulse"></div>
        <div className="h-5 bg-gray-200 rounded w-96 animate-pulse"></div>
      </div>
      <div className="h-10 bg-gray-200 rounded w-40 animate-pulse"></div>
    </div>

    {/* Analytics Cards Skeleton */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <AnalyticsCardSkeleton />
      <AnalyticsCardSkeleton />
      <AnalyticsCardSkeleton />
      <AnalyticsCardSkeleton />
    </div>

    {/* Agents Section Skeleton */}
    <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="h-6 bg-gray-300 rounded w-40 animate-pulse"></div>
        <div className="flex items-center space-x-2">
          <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded w-44 animate-pulse"></div>
        </div>
      </div>
      <div className="h-10 bg-gray-100 rounded mb-4 animate-pulse"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AgentCardSkeleton />
        <AgentCardSkeleton />
        <AgentCardSkeleton />
        <AgentCardSkeleton />
        <AgentCardSkeleton />
        <AgentCardSkeleton />
      </div>
    </div>

    {/* Conversations Section Skeleton */}
    <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div className="h-6 bg-gray-300 rounded w-48 animate-pulse"></div>
        <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">
                <div className="h-3 bg-gray-300 rounded w-16 animate-pulse"></div>
              </th>
              <th className="px-6 py-3 text-left">
                <div className="h-3 bg-gray-300 rounded w-12 animate-pulse"></div>
              </th>
              <th className="px-6 py-3 text-left">
                <div className="h-3 bg-gray-300 rounded w-16 animate-pulse"></div>
              </th>
              <th className="px-6 py-3 text-left">
                <div className="h-3 bg-gray-300 rounded w-16 animate-pulse"></div>
              </th>
              <th className="px-6 py-3 text-left">
                <div className="h-3 bg-gray-300 rounded w-12 animate-pulse"></div>
              </th>
              <th className="px-6 py-3 text-left">
                <div className="h-3 bg-gray-300 rounded w-16 animate-pulse"></div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <ConversationRowSkeleton />
            <ConversationRowSkeleton />
            <ConversationRowSkeleton />
            <ConversationRowSkeleton />
            <ConversationRowSkeleton />
          </tbody>
        </table>
      </div>
    </div>
  </main>
);

/**
 * Dialog content loading skeleton
 */
export const DialogLoadingSkeleton: React.FC = () => (
  <div className="space-y-4 py-4">
    <div className="animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
      <div className="h-10 bg-gray-100 rounded"></div>
    </div>
    <div className="animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
      <div className="h-24 bg-gray-100 rounded"></div>
    </div>
    <div className="animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-28 mb-2"></div>
      <div className="h-10 bg-gray-100 rounded"></div>
    </div>
  </div>
);
