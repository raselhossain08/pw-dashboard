/**
 * Loading Skeletons for Live Chat
 * Provides skeleton loading states for better UX
 */

import React from "react";

/**
 * Skeleton for conversation list item
 */
export const ConversationSkeleton: React.FC = () => {
  return (
    <div className="flex items-start space-x-3 p-3 border-b animate-pulse">
      {/* Avatar skeleton */}
      <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0" />

      <div className="flex-1 min-w-0">
        {/* Title skeleton */}
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />

        {/* Last message skeleton */}
        <div className="h-3 bg-gray-200 rounded w-full" />
      </div>

      {/* Time skeleton */}
      <div className="h-3 bg-gray-200 rounded w-12 flex-shrink-0" />
    </div>
  );
};

/**
 * Skeleton for conversations sidebar
 */
export const ConversationsListSkeleton: React.FC<{ count?: number }> = ({
  count = 5,
}) => {
  return (
    <div className="space-y-0">
      {Array.from({ length: count }).map((_, index) => (
        <ConversationSkeleton key={index} />
      ))}
    </div>
  );
};

/**
 * Skeleton for message bubble
 */
export const MessageSkeleton: React.FC<{ isOwn?: boolean }> = ({
  isOwn = false,
}) => {
  return (
    <div
      className={`flex items-end space-x-2 mb-4 animate-pulse ${
        isOwn ? "justify-end" : ""
      }`}
    >
      {!isOwn && (
        <div className="w-8 h-8 bg-gray-200 rounded-full flex-shrink-0" />
      )}

      <div className={`max-w-[70%] ${isOwn ? "items-end" : "items-start"}`}>
        {/* Message content skeleton */}
        <div
          className={`p-3 rounded-lg ${isOwn ? "bg-blue-100" : "bg-gray-100"}`}
        >
          <div className="space-y-2">
            <div className="h-3 bg-gray-300 rounded w-48" />
            <div className="h-3 bg-gray-300 rounded w-32" />
          </div>
        </div>

        {/* Time skeleton */}
        <div className="h-2 bg-gray-200 rounded w-16 mt-1" />
      </div>

      {isOwn && (
        <div className="w-8 h-8 bg-gray-200 rounded-full flex-shrink-0" />
      )}
    </div>
  );
};

/**
 * Skeleton for messages list
 */
export const MessagesListSkeleton: React.FC<{ count?: number }> = ({
  count = 6,
}) => {
  return (
    <div className="flex-1 overflow-y-auto p-4">
      {Array.from({ length: count }).map((_, index) => (
        <MessageSkeleton
          key={index}
          isOwn={index % 3 === 0} // Mix of own and other messages
        />
      ))}
    </div>
  );
};

/**
 * Skeleton for typing indicator
 */
export const TypingIndicatorSkeleton: React.FC = () => {
  return (
    <div className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-500">
      <div className="flex space-x-1">
        <div
          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
          style={{ animationDelay: "0ms" }}
        />
        <div
          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
          style={{ animationDelay: "150ms" }}
        />
        <div
          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
          style={{ animationDelay: "300ms" }}
        />
      </div>
      <span className="animate-pulse">Someone is typing...</span>
    </div>
  );
};

/**
 * Skeleton for chat header
 */
export const ChatHeaderSkeleton: React.FC = () => {
  return (
    <div className="flex items-center justify-between p-4 border-b bg-white animate-pulse">
      <div className="flex items-center space-x-3">
        {/* Avatar skeleton */}
        <div className="w-10 h-10 bg-gray-200 rounded-full" />

        <div>
          {/* Title skeleton */}
          <div className="h-4 bg-gray-200 rounded w-32 mb-2" />

          {/* Status skeleton */}
          <div className="h-3 bg-gray-200 rounded w-24" />
        </div>
      </div>

      {/* Actions skeleton */}
      <div className="flex space-x-2">
        <div className="w-8 h-8 bg-gray-200 rounded" />
        <div className="w-8 h-8 bg-gray-200 rounded" />
      </div>
    </div>
  );
};

/**
 * Skeleton for new conversation form
 */
export const NewConversationFormSkeleton: React.FC = () => {
  return (
    <div className="p-6 space-y-4 animate-pulse">
      {/* Title field skeleton */}
      <div>
        <div className="h-4 bg-gray-200 rounded w-24 mb-2" />
        <div className="h-10 bg-gray-100 rounded" />
      </div>

      {/* Participants field skeleton */}
      <div>
        <div className="h-4 bg-gray-200 rounded w-32 mb-2" />
        <div className="h-32 bg-gray-100 rounded" />
      </div>

      {/* Message field skeleton */}
      <div>
        <div className="h-4 bg-gray-200 rounded w-28 mb-2" />
        <div className="h-24 bg-gray-100 rounded" />
      </div>

      {/* Buttons skeleton */}
      <div className="flex justify-end space-x-2">
        <div className="h-10 bg-gray-200 rounded w-20" />
        <div className="h-10 bg-blue-200 rounded w-24" />
      </div>
    </div>
  );
};

/**
 * Skeleton for file upload preview
 */
export const FileUploadSkeleton: React.FC = () => {
  return (
    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg animate-pulse">
      {/* File icon skeleton */}
      <div className="w-10 h-10 bg-gray-200 rounded" />

      <div className="flex-1 min-w-0">
        {/* File name skeleton */}
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-1" />

        {/* File size skeleton */}
        <div className="h-3 bg-gray-200 rounded w-20" />
      </div>

      {/* Progress bar skeleton */}
      <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-300 animate-pulse"
          style={{ width: "60%" }}
        />
      </div>
    </div>
  );
};

/**
 * Skeleton for empty state
 */
export const EmptyStateSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 animate-pulse">
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
 * Full page loading skeleton
 */
export const LiveChatSkeleton: React.FC = () => {
  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar skeleton */}
      <div className="w-80 border-r flex flex-col">
        {/* Search skeleton */}
        <div className="p-4 border-b animate-pulse">
          <div className="h-10 bg-gray-100 rounded" />
        </div>

        {/* Conversations list skeleton */}
        <ConversationsListSkeleton count={8} />
      </div>

      {/* Main chat area skeleton */}
      <div className="flex-1 flex flex-col">
        {/* Header skeleton */}
        <ChatHeaderSkeleton />

        {/* Messages skeleton */}
        <MessagesListSkeleton count={5} />

        {/* Input area skeleton */}
        <div className="p-4 border-t bg-white animate-pulse">
          <div className="h-12 bg-gray-100 rounded" />
        </div>
      </div>
    </div>
  );
};

export default {
  ConversationSkeleton,
  ConversationsListSkeleton,
  MessageSkeleton,
  MessagesListSkeleton,
  TypingIndicatorSkeleton,
  ChatHeaderSkeleton,
  NewConversationFormSkeleton,
  FileUploadSkeleton,
  EmptyStateSkeleton,
  LiveChatSkeleton,
};
