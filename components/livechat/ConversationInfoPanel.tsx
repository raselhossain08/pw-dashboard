"use client";

import * as React from "react";
import {
  X,
  Users,
  Settings,
  LogOut,
  FileText,
  Image as ImageIcon,
  Link as LinkIcon,
  Bell,
  BellOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Conversation } from "@/store/chatStore";

interface ConversationInfoPanelProps {
  conversation: Conversation;
  onClose: () => void;
}

export default function ConversationInfoPanel({
  conversation,
  onClose,
}: ConversationInfoPanelProps) {
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);

  // Get all participants
  const participants = React.useMemo(() => {
    if (!conversation.participants) return [];
    return conversation.participants.map((p) => {
      if (typeof p === "string") {
        return { _id: p, firstName: "Unknown", lastName: "User", avatar: "" };
      }
      return p;
    });
  }, [conversation.participants]);

  // Mock data for shared files and links
  const sharedFiles = [
    {
      id: "1",
      name: "Project Presentation.pdf",
      size: "2.4 MB",
      uploadedBy: "John Doe",
      uploadedAt: "2 days ago",
    },
    {
      id: "2",
      name: "Meeting Notes.docx",
      size: "156 KB",
      uploadedBy: "Jane Smith",
      uploadedAt: "1 week ago",
    },
  ];

  const sharedImages = [
    "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg",
    "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg",
    "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg",
  ];

  const sharedLinks = [
    {
      id: "1",
      url: "https://example.com/article",
      title: "Interesting Article",
    },
    {
      id: "2",
      url: "https://github.com/example/repo",
      title: "GitHub Repository",
    },
  ];

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h3 className="font-semibold text-secondary">Conversation Info</h3>
        <button
          onClick={onClose}
          className="p-1 text-gray-400 hover:text-primary hover:bg-gray-100 rounded transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Conversation Details */}
          <div className="text-center">
            <img
              src={conversation.avatarUrl}
              alt={conversation.name}
              className="w-20 h-20 rounded-full mx-auto mb-3 ring-4 ring-gray-100"
            />
            <h4 className="font-semibold text-lg text-secondary">
              {conversation.name}
            </h4>
            <p className="text-sm text-gray-500">{conversation.topic}</p>
          </div>

          <Separator />

          {/* Notifications */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                {notificationsEnabled ? (
                  <Bell className="w-4 h-4 text-gray-600" />
                ) : (
                  <BellOff className="w-4 h-4 text-gray-600" />
                )}
                <Label htmlFor="notifications" className="text-sm font-medium">
                  Notifications
                </Label>
              </div>
              <Switch
                id="notifications"
                checked={notificationsEnabled}
                onCheckedChange={setNotificationsEnabled}
              />
            </div>
            <p className="text-xs text-gray-500">
              Get notified about new messages in this conversation
            </p>
          </div>

          <Separator />

          {/* Participants */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <Users className="w-4 h-4 text-gray-600" />
              <h5 className="font-semibold text-sm">
                Participants ({participants.length})
              </h5>
            </div>
            <div className="space-y-2">
              {participants.map((participant) => (
                <div
                  key={participant._id}
                  className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <img
                    src={
                      participant.avatar ||
                      "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg"
                    }
                    alt={participant.firstName}
                    className="w-10 h-10 rounded-full"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-secondary truncate">
                      {participant.firstName} {participant.lastName}
                    </p>
                    <p className="text-xs text-gray-500">Online</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Shared Files */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <FileText className="w-4 h-4 text-gray-600" />
              <h5 className="font-semibold text-sm">Shared Files</h5>
            </div>
            <div className="space-y-2">
              {sharedFiles.length === 0 ? (
                <p className="text-xs text-gray-500 text-center py-4">
                  No files shared yet
                </p>
              ) : (
                sharedFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <FileText className="w-8 h-8 text-primary shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-secondary truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {file.size} • {file.uploadedAt}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <Separator />

          {/* Shared Images */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <ImageIcon className="w-4 h-4 text-gray-600" />
              <h5 className="font-semibold text-sm">Shared Images</h5>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {sharedImages.length === 0 ? (
                <p className="text-xs text-gray-500 text-center py-4 col-span-3">
                  No images shared yet
                </p>
              ) : (
                sharedImages.map((img, idx) => (
                  <div
                    key={idx}
                    className="aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                  >
                    <img
                      src={img}
                      alt={`Shared ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))
              )}
            </div>
          </div>

          <Separator />

          {/* Shared Links */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <LinkIcon className="w-4 h-4 text-gray-600" />
              <h5 className="font-semibold text-sm">Shared Links</h5>
            </div>
            <div className="space-y-2">
              {sharedLinks.length === 0 ? (
                <p className="text-xs text-gray-500 text-center py-4">
                  No links shared yet
                </p>
              ) : (
                sharedLinks.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-2 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <p className="text-sm font-medium text-primary truncate">
                      {link.title}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{link.url}</p>
                  </a>
                ))
              )}
            </div>
          </div>

          <Separator />

          {/* Actions */}
          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => alert("Settings coming soon!")}
            >
              <Settings className="w-4 h-4 mr-2" />
              Conversation Settings
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={() => alert("Leave conversation coming soon!")}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Leave Conversation
            </Button>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
