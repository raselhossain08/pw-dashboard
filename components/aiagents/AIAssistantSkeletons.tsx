/**
 * AI Assistant Loading Skeletons
 *
 * Professional loading states for AI Assistant chat interface.
 * Provides smooth user experience during data fetching and processing.
 */

import React from "react";

// ========================================
// CHAT MESSAGE SKELETONS
// ========================================

export const AIChatMessageSkeleton: React.FC<{ isAI?: boolean }> = ({
  isAI = true,
}) => {
  return (
    <div className={`mb-6 ${isAI ? "flex space-x-3" : "flex justify-end"}`}>
      {isAI && (
        <div className="shrink-0">
          <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
        </div>
      )}
      <div className={`${isAI ? "max-w-[90%] sm:max-w-xl" : "max-w-[80%]"}`}>
        <div
          className={`${
            isAI ? "bg-white border border-gray-200" : "bg-primary/10"
          } rounded-2xl p-4 space-y-2`}
        >
          <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
          <div className="h-4 bg-gray-200 rounded animate-pulse w-full" />
          <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6" />
        </div>
      </div>
    </div>
  );
};

export const AIChatMessagesSkeleton: React.FC<{ count?: number }> = ({
  count = 4,
}) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, idx) => (
        <AIChatMessageSkeleton key={idx} isAI={idx % 2 === 0} />
      ))}
    </div>
  );
};

// ========================================
// TYPING INDICATOR
// ========================================

export const AITypingIndicatorSkeleton: React.FC = () => {
  return (
    <div className="flex space-x-3 mb-6">
      <div className="shrink-0">
        <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
      </div>
      <div className="bg-white rounded-2xl p-4 border border-gray-200">
        <div className="flex items-center space-x-2">
          <div
            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
            style={{ animationDelay: "0s" }}
          />
          <div
            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
            style={{ animationDelay: "0.2s" }}
          />
          <div
            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
            style={{ animationDelay: "0.4s" }}
          />
        </div>
      </div>
    </div>
  );
};

// ========================================
// CONVERSATION HISTORY SKELETONS
// ========================================

export const AIConversationCardSkeleton: React.FC = () => {
  return (
    <div className="p-3 bg-gray-50 rounded-lg animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
      <div className="h-3 bg-gray-200 rounded w-1/2" />
    </div>
  );
};

export const AIConversationListSkeleton: React.FC<{ count?: number }> = ({
  count = 5,
}) => {
  return (
    <div className="space-y-3">
      <div className="mb-3">
        <div className="h-10 bg-gray-100 rounded-lg animate-pulse" />
      </div>
      {Array.from({ length: count }).map((_, idx) => (
        <AIConversationCardSkeleton key={idx} />
      ))}
    </div>
  );
};

// ========================================
// QUICK ACTION SKELETONS
// ========================================

export const AIQuickActionSkeleton: React.FC = () => {
  return (
    <div className="w-full p-3 bg-gray-50 rounded-lg animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-3/4" />
    </div>
  );
};

export const AIQuickActionsListSkeleton: React.FC<{ count?: number }> = ({
  count = 4,
}) => {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, idx) => (
        <AIQuickActionSkeleton key={idx} />
      ))}
    </div>
  );
};

// ========================================
// AI CAPABILITY SKELETONS
// ========================================

export const AICapabilityCardSkeleton: React.FC = () => {
  return (
    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg animate-pulse">
      <div className="w-8 h-8 bg-gray-200 rounded-lg" />
      <div className="h-4 bg-gray-200 rounded w-2/3" />
    </div>
  );
};

export const AICapabilitiesListSkeleton: React.FC<{ count?: number }> = ({
  count = 4,
}) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, idx) => (
        <AICapabilityCardSkeleton key={idx} />
      ))}
    </div>
  );
};

// ========================================
// QUICK REPLY SKELETONS
// ========================================

export const AIQuickReplySkeleton: React.FC = () => {
  return (
    <div className="inline-block px-4 py-2 bg-gray-100 rounded-full animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-24" />
    </div>
  );
};

export const AIQuickRepliesListSkeleton: React.FC<{ count?: number }> = ({
  count = 3,
}) => {
  return (
    <div className="flex flex-wrap gap-2 p-4 border-t border-gray-200">
      {Array.from({ length: count }).map((_, idx) => (
        <AIQuickReplySkeleton key={idx} />
      ))}
    </div>
  );
};

// ========================================
// ATTACHMENT SKELETONS
// ========================================

export const AIAttachmentCardSkeleton: React.FC = () => {
  return (
    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200 animate-pulse">
      <div className="w-10 h-10 bg-gray-200 rounded" />
      <div className="flex-1 space-y-2">
        <div className="h-3 bg-gray-200 rounded w-3/4" />
        <div className="h-2 bg-gray-200 rounded w-1/2" />
      </div>
      <div className="w-6 h-6 bg-gray-200 rounded" />
    </div>
  );
};

export const AIAttachmentsListSkeleton: React.FC<{ count?: number }> = ({
  count = 2,
}) => {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, idx) => (
        <AIAttachmentCardSkeleton key={idx} />
      ))}
    </div>
  );
};

// ========================================
// CHAT HEADER SKELETON
// ========================================

export const AIChatHeaderSkeleton: React.FC = () => {
  return (
    <div className="border-b border-gray-200 p-4">
      <div className="flex items-center space-x-3">
        <div className="relative">
          <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse" />
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gray-300 rounded-full" />
        </div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse" />
          <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse" />
        </div>
      </div>
    </div>
  );
};

// ========================================
// CHAT INPUT SKELETON
// ========================================

export const AIChatInputSkeleton: React.FC = () => {
  return (
    <div className="p-4 border-t border-gray-200">
      <div className="flex items-end space-x-2">
        <div className="flex-1 h-20 bg-gray-100 rounded-lg animate-pulse" />
        <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse" />
        <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse" />
      </div>
    </div>
  );
};

// ========================================
// SIDEBAR PANEL SKELETONS
// ========================================

export const AISidebarPanelSkeleton: React.FC<{ title?: string }> = ({
  title,
}) => {
  return (
    <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
      {title && (
        <div className="mb-4">
          <div className="h-5 bg-gray-200 rounded w-1/2 animate-pulse" />
        </div>
      )}
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div
            key={idx}
            className="h-12 bg-gray-100 rounded-lg animate-pulse"
          />
        ))}
      </div>
    </div>
  );
};

// ========================================
// STATISTICS CARD SKELETON
// ========================================

export const AIStatCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200 animate-pulse">
      <div className="flex items-center justify-between mb-2">
        <div className="h-4 bg-gray-200 rounded w-1/3" />
        <div className="w-6 h-6 bg-gray-200 rounded" />
      </div>
      <div className="h-8 bg-gray-200 rounded w-1/2 mb-2" />
      <div className="h-3 bg-gray-200 rounded w-2/3" />
    </div>
  );
};

export const AIStatsGridSkeleton: React.FC<{ count?: number }> = ({
  count = 4,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {Array.from({ length: count }).map((_, idx) => (
        <AIStatCardSkeleton key={idx} />
      ))}
    </div>
  );
};

// ========================================
// RATING DIALOG SKELETON
// ========================================

export const AIRatingDialogSkeleton: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="h-5 bg-gray-200 rounded w-1/3 animate-pulse" />
      <div className="flex justify-center space-x-2">
        {Array.from({ length: 5 }).map((_, idx) => (
          <div
            key={idx}
            className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"
          />
        ))}
      </div>
      <div className="h-24 bg-gray-100 rounded-lg animate-pulse" />
      <div className="flex justify-end space-x-2">
        <div className="w-20 h-9 bg-gray-200 rounded-lg animate-pulse" />
        <div className="w-20 h-9 bg-gray-200 rounded-lg animate-pulse" />
      </div>
    </div>
  );
};

// ========================================
// SETTINGS DIALOG SKELETON
// ========================================

export const AISettingsDialogSkeleton: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="h-5 bg-gray-200 rounded w-1/4 animate-pulse mb-6" />

      {Array.from({ length: 3 }).map((_, idx) => (
        <div key={idx} className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse" />
          <div className="h-10 bg-gray-100 rounded-lg animate-pulse" />
        </div>
      ))}

      <div className="flex justify-end space-x-2 pt-4">
        <div className="w-20 h-9 bg-gray-200 rounded-lg animate-pulse" />
        <div className="w-20 h-9 bg-gray-200 rounded-lg animate-pulse" />
      </div>
    </div>
  );
};

// ========================================
// HISTORY DIALOG SKELETON
// ========================================

export const AIHistoryDialogSkeleton: React.FC = () => {
  return (
    <div className="space-y-2">
      <div className="h-5 bg-gray-200 rounded w-1/3 animate-pulse mb-4" />
      <div className="max-h-[50vh] overflow-y-auto space-y-2">
        {Array.from({ length: 6 }).map((_, idx) => (
          <AIConversationCardSkeleton key={idx} />
        ))}
      </div>
    </div>
  );
};

// ========================================
// FULL PAGE SKELETON
// ========================================

export const AIAssistantPageSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen p-4 sm:p-6">
      <div className="mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div className="space-y-2">
            <div className="h-8 bg-gray-200 rounded w-64 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-96 animate-pulse" />
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="w-32 h-10 bg-gray-200 rounded-lg animate-pulse" />
            <div className="w-28 h-10 bg-gray-200 rounded-lg animate-pulse" />
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
          {/* Left Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <AISidebarPanelSkeleton title="AI Capabilities" />
            <AISidebarPanelSkeleton title="Quick Actions" />
            <AISidebarPanelSkeleton title="Recent Conversations" />
          </div>

          {/* Main Chat Area */}
          <div className="lg:col-span-2">
            <div className="bg-card rounded-xl shadow-sm border border-gray-100 min-h-[60vh] md:h-[600px] flex flex-col">
              <AIChatHeaderSkeleton />
              <div className="flex-1 p-4 sm:p-6 overflow-y-auto bg-gray-50">
                <AIChatMessagesSkeleton count={3} />
                <AITypingIndicatorSkeleton />
              </div>
              <AIQuickRepliesListSkeleton />
              <AIChatInputSkeleton />
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="h-5 bg-gray-200 rounded w-1/2 mb-4 animate-pulse" />
              <AIStatsGridSkeleton count={2} />
            </div>
            <AISidebarPanelSkeleton title="Attachments" />
          </div>
        </div>
      </div>
    </div>
  );
};

// ========================================
// EMPTY STATE SKELETON
// ========================================

export const AIEmptyStateSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="w-24 h-24 bg-gray-200 rounded-full mb-4 animate-pulse" />
      <div className="h-6 bg-gray-200 rounded w-48 mb-2 animate-pulse" />
      <div className="h-4 bg-gray-200 rounded w-64 animate-pulse" />
    </div>
  );
};
