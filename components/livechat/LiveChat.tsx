"use client";

import * as React from "react";
import {
  Search as SearchIcon,
  EllipsisVertical,
  Send,
  Paperclip,
  Image as ImageIcon,
  Code,
  Phone,
  Video,
  Info,
  Download,
  Plus,
  Trash2,
  Edit2,
  MoreVertical,
  UserPlus,
  Settings,
  Archive,
  Star,
  Loader2,
  Check,
  X,
  AlertCircle,
  CheckCheck,
  Clock,
  FileText,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useChat } from "@/hooks/useChat";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUsers } from "@/hooks/useUsers";
import { useDebounce } from "@/hooks/useDebounce";
import ConversationInfoPanel from "./ConversationInfoPanel";
import { groupMessagesByDate } from "@/lib/chat-utils";

export default function LiveChat() {
  const [messageInput, setMessageInput] = React.useState("");
  const [editingMessageId, setEditingMessageId] = React.useState<string | null>(
    null
  );
  const [editContent, setEditContent] = React.useState("");
  const [newChatTitle, setNewChatTitle] = React.useState("");
  const [newChatParticipants, setNewChatParticipants] = React.useState<
    string[]
  >([]);
  const [userSearchQuery, setUserSearchQuery] = React.useState("");
  const [showInfoPanel, setShowInfoPanel] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const imageInputRef = React.useRef<HTMLInputElement>(null);
  const messagesContainerRef = React.useRef<HTMLDivElement>(null);

  const {
    conversations,
    selectedConversation,
    selectedMessages,
    isLoading,
    isSending,
    isTyping,
    isLoadingMessages,
    searchQuery,
    filterTab,
    isNewChatOpen,
    isDeleteDialogOpen,
    conversationToDelete,
    hasMoreMessages,
    error,
    sendMessage,
    sendFile,
    createConversation,
    deleteConversation,
    editMessage,
    deleteMessage,
    markAsRead,
    loadMoreMessages,
    refreshConversations,
    archiveConversation,
    starConversation,
    handleTyping,
    setSelectedConversation,
    setSearchQuery,
    setFilterTab,
    setNewChatOpen,
    setDeleteDialogOpen,
    setConversationToDelete,
    clearError,
    messagesEndRef,
  } = useChat();

  const { users } = useUsers();
  const debouncedUserSearch = useDebounce(userSearchQuery, 300);

  // Filter users for autocomplete
  const filteredUsers = React.useMemo(() => {
    if (!debouncedUserSearch) return users.slice(0, 10);
    return users
      .filter(
        (u) =>
          u.name?.toLowerCase().includes(debouncedUserSearch.toLowerCase()) ||
          u.email?.toLowerCase().includes(debouncedUserSearch.toLowerCase())
      )
      .slice(0, 10);
  }, [users, debouncedUserSearch]);

  // Scroll to bottom when new messages arrive
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedMessages, isTyping]);

  // Mark messages as read when conversation is selected
  React.useEffect(() => {
    if (selectedConversation?.id && selectedMessages.length > 0) {
      const unreadIds = selectedMessages
        .filter((m) => m.sender === "other" && !m.isRead)
        .map((m) => m.id);
      if (unreadIds.length > 0) {
        markAsRead(selectedConversation.id, unreadIds);
      }
    }
  }, [selectedConversation?.id, selectedMessages]);

  // Handle message input with typing indicator
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageInput(e.target.value);
    if (selectedConversation?.id) {
      handleTyping(selectedConversation.id);
    }
  };

  // Handle send message
  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedConversation?.id) return;
    await sendMessage(selectedConversation.id, messageInput, "text");
    setMessageInput("");
  };

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedConversation?.id) return;
    await sendFile(selectedConversation.id, file, "file");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedConversation?.id) return;
    await sendFile(selectedConversation.id, file, "image");
    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  // Handle edit message
  const handleEditMessage = (messageId: string, currentContent: string) => {
    setEditingMessageId(messageId);
    setEditContent(currentContent);
  };

  // Handle save edit
  const handleSaveEdit = async () => {
    if (!editingMessageId || !editContent.trim() || !selectedConversation?.id)
      return;
    await editMessage(
      selectedConversation.id,
      editingMessageId,
      editContent.trim()
    );
    setEditingMessageId(null);
    setEditContent("");
  };

  // Handle create conversation
  const handleCreateConversation = async () => {
    if (!newChatTitle.trim()) {
      return;
    }
    await createConversation(newChatTitle, newChatParticipants);
    setNewChatTitle("");
    setNewChatParticipants([]);
    setUserSearchQuery("");
  };

  // Handle delete conversation
  const handleDeleteConversation = async () => {
    if (!conversationToDelete) return;
    await deleteConversation(conversationToDelete);
  };

  // Handle export chat
  const handleExportChat = () => {
    if (!selectedConversation) return;
    const chatData = JSON.stringify(
      {
        conversation: selectedConversation.name,
        topic: selectedConversation.topic,
        messages: selectedMessages,
        exportedAt: new Date().toISOString(),
      },
      null,
      2
    );
    const blob = new Blob([chatData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `chat-${selectedConversation.name}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Handle load more messages
  const handleLoadMore = () => {
    if (selectedConversation?.id && hasMoreMessages) {
      loadMoreMessages(selectedConversation.id);
    }
  };

  return (
    <main className="p-6 h-[calc(100vh-4rem)]">
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-secondary mb-2">
              Live Chat
            </h2>
            <p className="text-gray-600">
              Communicate with students and instructors in real-time
            </p>
          </div>
          <div className="flex space-x-3">
            <Button
              variant="outline"
              className="border-gray-300 hover:border-primary hover:text-primary transition-all"
              onClick={handleExportChat}
              disabled={!selectedConversation}
            >
              <Download className="w-4 h-4 mr-2" />
              Export Chat
            </Button>

            {/* New Chat Dialog */}
            <Dialog open={isNewChatOpen} onOpenChange={setNewChatOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90 shadow-lg transition-all hover:shadow-xl">
                  <Plus className="w-4 h-4 mr-2" />
                  New Chat
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <UserPlus className="w-5 h-5 text-primary" />
                    Create New Conversation
                  </DialogTitle>
                  <DialogDescription>
                    Start a new conversation with team members. Enter the chat
                    title and select participants.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="title" className="text-sm font-medium">
                      Chat Title
                    </Label>
                    <Input
                      id="title"
                      placeholder="e.g., Project Discussion"
                      value={newChatTitle}
                      onChange={(e) => setNewChatTitle(e.target.value)}
                      className="focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label
                      htmlFor="participants"
                      className="text-sm font-medium"
                    >
                      Search Users
                    </Label>
                    <Input
                      id="participants"
                      placeholder="Search by name or email..."
                      value={userSearchQuery}
                      onChange={(e) => setUserSearchQuery(e.target.value)}
                      className="focus:ring-2 focus:ring-primary"
                    />
                    {userSearchQuery && filteredUsers.length > 0 && (
                      <div className="border border-gray-200 rounded-lg max-h-48 overflow-y-auto">
                        {filteredUsers.map((user) => (
                          <div
                            key={user._id}
                            className="p-2 hover:bg-gray-100 cursor-pointer flex items-center justify-between"
                            onClick={() => {
                              if (!newChatParticipants.includes(user._id)) {
                                setNewChatParticipants([
                                  ...newChatParticipants,
                                  user._id,
                                ]);
                              }
                              setUserSearchQuery("");
                            }}
                          >
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="text-xs font-medium text-primary">
                                  {user.firstName?.[0]?.toUpperCase() ||
                                    user.email?.[0]?.toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <p className="text-sm font-medium">
                                  {user.firstName || "Unknown"}{" "}
                                  {user.lastName || "Unknown"}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {user.email}
                                </p>
                              </div>
                            </div>
                            {newChatParticipants.includes(user._id) && (
                              <Check className="w-4 h-4 text-primary" />
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    {newChatParticipants.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {newChatParticipants.map((userId) => {
                          const user = users.find((u) => u._id === userId);
                          return (
                            <div
                              key={userId}
                              className="flex items-center space-x-1 bg-primary/10 text-primary px-2 py-1 rounded-full text-sm"
                            >
                              <span>{user?.name || user?.email || userId}</span>
                              <button
                                onClick={() =>
                                  setNewChatParticipants(
                                    newChatParticipants.filter(
                                      (id) => id !== userId
                                    )
                                  )
                                }
                                className="ml-1 hover:text-primary/80"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setNewChatOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateConversation}
                    className="bg-primary"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Create Chat
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Delete Conversation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              Delete Conversation
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this conversation? This action
              cannot be undone and all messages will be permanently deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setConversationToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteConversation}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span className="text-sm text-red-600">{error}</span>
          </div>
          <button
            onClick={clearError}
            className="text-red-600 hover:text-red-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Chat Interface */}
      <div
        className="bg-card rounded-xl shadow-sm border border-gray-100 flex overflow-hidden"
        style={{ height: "calc(100% - 120px)" }}
      >
        {/* Chat Sidebar */}
        <div className="w-80 bg-white flex flex-col border-r border-gray-200">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-secondary">Conversations</h3>
              <div className="flex items-center space-x-1">
                <button
                  onClick={refreshConversations}
                  disabled={isLoading}
                  className="p-1 text-gray-400 hover:text-primary hover:bg-gray-100 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Refresh conversations"
                >
                  <RefreshCw
                    className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
                  />
                </button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="p-1 text-gray-400 hover:text-primary hover:bg-gray-100 rounded transition-colors">
                      <EllipsisVertical className="w-5 h-5" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() => alert("Settings coming soon!")}
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() => setFilterTab("archived")}
                    >
                      <Archive className="w-4 h-4 mr-2" />
                      Archived Chats
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() => setFilterTab("starred")}
                    >
                      <Star className="w-4 h-4 mr-2" />
                      Starred Messages
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative mb-3">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-50 border-gray-200 focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="flex space-x-1">
              <button
                onClick={() => setFilterTab("all")}
                className={`flex-1 py-2 px-2 rounded-lg text-xs font-medium transition-all ${
                  filterTab === "all"
                    ? "bg-primary text-white shadow-md"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterTab("unread")}
                className={`flex-1 py-2 px-2 rounded-lg text-xs font-medium transition-all ${
                  filterTab === "unread"
                    ? "bg-primary text-white shadow-md"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Unread
              </button>
              <button
                onClick={() => setFilterTab("archived")}
                className={`flex-1 py-2 px-2 rounded-lg text-xs font-medium transition-all ${
                  filterTab === "archived"
                    ? "bg-primary text-white shadow-md"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Archived
              </button>
            </div>
          </div>

          {/* Chat List */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
                  <p className="text-sm text-gray-500">
                    Loading conversations...
                  </p>
                </div>
              </div>
            ) : conversations.length === 0 ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">
                    No conversations found
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() => setNewChatOpen(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Start a Chat
                  </Button>
                </div>
              </div>
            ) : (
              conversations.map((c) => (
                <div
                  key={c.id}
                  className={`group p-4 border-b border-gray-100 cursor-pointer transition-all hover:bg-gray-50 relative ${
                    selectedConversation?.id === c.id
                      ? "bg-indigo-50 border-r-4 border-r-primary"
                      : ""
                  }`}
                >
                  <div
                    onClick={() => setSelectedConversation(c.id)}
                    className="flex items-center space-x-3"
                  >
                    <div className="relative">
                      <img
                        src={c.avatarUrl}
                        alt={c.name}
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-100"
                      />
                      {c.online && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-secondary truncate">
                          {c.name}
                        </h4>
                        <span className="text-xs text-gray-500">
                          {c.lastTime}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600 truncate">
                          {c.lastMessage}
                        </p>
                        {c.unread && c.unread > 0 && (
                          <span className="flex items-center justify-center min-w-5 h-5 px-1.5 bg-primary text-white text-xs font-medium rounded-full shrink-0 ml-2">
                            {c.unread}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {c.topic}
                      </div>
                    </div>
                  </div>

                  {/* Context Menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="absolute top-4 right-2 p-1.5 text-gray-400 hover:text-primary hover:bg-gray-200 rounded opacity-0 group-hover:opacity-100 transition-all">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          archiveConversation(c.id, !c.archived);
                        }}
                      >
                        <Archive className="w-4 h-4 mr-2" />
                        {c.archived ? "Unarchive" : "Archive"}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          starConversation(c.id, !c.starred);
                        }}
                      >
                        <Star
                          className={`w-4 h-4 mr-2 ${
                            c.starred ? "fill-yellow-400 text-yellow-400" : ""
                          }`}
                        />
                        {c.starred ? "Unstar" : "Star"}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="cursor-pointer text-red-600"
                        onClick={() => {
                          setConversationToDelete(c.id);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Main Area */}
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <img
                      src={selectedConversation.avatarUrl}
                      alt={selectedConversation.name}
                      className="w-10 h-10 rounded-full"
                    />
                    {selectedConversation.online && (
                      <div className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border-2 border-white" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-secondary">
                      {selectedConversation.name}
                    </h3>
                    <div className="flex items-center space-x-1">
                      <span className="text-xs text-gray-500">
                        {selectedConversation.topic}
                      </span>
                      <span className="text-xs text-gray-500">•</span>
                      <span className="text-xs text-green-600">
                        {selectedConversation.online ? "Online" : "Offline"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => alert("Voice call coming soon!")}
                    className="p-2 text-gray-400 hover:text-primary hover:bg-gray-100 rounded-lg transition-all"
                    title="Voice call"
                  >
                    <Phone className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => alert("Video call coming soon!")}
                    className="p-2 text-gray-400 hover:text-primary hover:bg-gray-100 rounded-lg transition-all"
                    title="Video call"
                  >
                    <Video className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setShowInfoPanel(!showInfoPanel)}
                    className={`p-2 hover:bg-gray-100 rounded-lg transition-all ${
                      showInfoPanel
                        ? "text-primary bg-gray-100"
                        : "text-gray-400 hover:text-primary"
                    }`}
                    title="Conversation info"
                  >
                    <Info className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Messages Area */}
              <div
                ref={messagesContainerRef}
                className="flex-1 p-4 overflow-y-auto bg-gray-50"
              >
                {/* Load More Button */}
                {hasMoreMessages && (
                  <div className="flex justify-center mb-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleLoadMore}
                      disabled={isLoadingMessages}
                    >
                      {isLoadingMessages ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        "Load More Messages"
                      )}
                    </Button>
                  </div>
                )}

                {/* Messages with Dynamic Date Dividers */}
                {groupMessagesByDate(selectedMessages).map((m) => (
                  <React.Fragment key={m.id}>
                    {/* Date Divider */}
                    {m.showDateDivider && (
                      <div className="flex items-center justify-center my-6">
                        <div className="bg-white px-3 py-1 rounded-full border border-gray-200">
                          <span className="text-xs text-gray-500">
                            {m.dateLabel}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Message */}
                    <div
                      className={`flex space-x-2 mb-4 group ${
                        m.sender === "me" ? "justify-end" : "justify-start"
                      }`}
                    >
                      {m.sender === "other" && (
                        <img
                          src={selectedConversation.avatarUrl}
                          alt={selectedConversation.name}
                          className="w-8 h-8 rounded-full shrink-0"
                        />
                      )}
                      <div className="flex flex-col max-w-[70%]">
                        <div
                          className={`p-3 relative ${
                            m.sender === "me"
                              ? "bg-primary text-white rounded-[18px] rounded-br-lg"
                              : "bg-gray-200 text-gray-800 rounded-[18px] rounded-bl-lg"
                          }`}
                        >
                          {editingMessageId === m.id ? (
                            <div className="flex items-center space-x-2">
                              <Input
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                className="bg-white text-gray-800"
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    handleSaveEdit();
                                  } else if (e.key === "Escape") {
                                    setEditingMessageId(null);
                                    setEditContent("");
                                  }
                                }}
                                autoFocus
                              />
                              <Button
                                size="sm"
                                onClick={handleSaveEdit}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setEditingMessageId(null);
                                  setEditContent("");
                                }}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ) : (
                            <>
                              {m.type === "image" ? (
                                <img
                                  src={m.content}
                                  alt="Shared image"
                                  className="max-w-full h-auto rounded-lg mb-1"
                                />
                              ) : m.type === "file" ? (
                                <div className="flex items-center space-x-2 mb-1">
                                  <FileText className="w-4 h-4" />
                                  <a
                                    href={m.content}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="underline hover:opacity-80"
                                  >
                                    {m.fileName || "Download file"}
                                  </a>
                                </div>
                              ) : m.type === "code" ? (
                                <div
                                  className={`${
                                    m.sender === "me"
                                      ? "bg-blue-900 text-white"
                                      : "bg-gray-800 text-green-400"
                                  } p-2 rounded mt-2 font-mono text-xs whitespace-pre`}
                                >
                                  {m.content}
                                </div>
                              ) : (
                                <p className="text-sm">{m.content}</p>
                              )}
                              {m.isEdited && (
                                <span className="text-xs opacity-70 italic">
                                  (edited)
                                </span>
                              )}
                              <div className="flex items-center justify-end mt-1 space-x-1">
                                <span
                                  className={`text-xs ${
                                    m.sender === "me"
                                      ? "text-white/80"
                                      : "text-gray-500"
                                  }`}
                                >
                                  {m.time}
                                </span>
                                {m.sender === "me" && (
                                  <span className="text-xs text-white/80">
                                    {m.isRead ? (
                                      <CheckCheck className="w-3 h-3 inline" />
                                    ) : (
                                      <Check className="w-3 h-3 inline" />
                                    )}
                                  </span>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                        {m.sender === "me" && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="opacity-0 group-hover:opacity-100 self-end mt-1 p-1 text-gray-400 hover:text-primary transition-all">
                                <MoreVertical className="w-3 h-3" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                className="cursor-pointer"
                                onClick={() =>
                                  handleEditMessage(m.id, m.content)
                                }
                              >
                                <Edit2 className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="cursor-pointer text-red-600"
                                onClick={() =>
                                  deleteMessage(selectedConversation.id, m.id)
                                }
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                      {m.sender === "me" && (
                        <img
                          src="https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg"
                          alt="You"
                          className="w-8 h-8 rounded-full shrink-0"
                        />
                      )}
                    </div>
                  </React.Fragment>
                ))}

                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex space-x-2 mb-4">
                    <img
                      src={selectedConversation.avatarUrl}
                      alt={selectedConversation.name}
                      className="w-8 h-8 rounded-full shrink-0"
                    />
                    <div className="bg-gray-200 text-gray-800 rounded-[18px] rounded-bl-lg p-3">
                      <div className="flex items-center space-x-1">
                        <span className="text-sm text-gray-500 mr-2">
                          {selectedConversation.name.split(" ")[0]} is typing
                        </span>
                        <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" />
                        <span
                          className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        />
                        <span
                          className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200 bg-white">
                <div className="flex items-center space-x-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={handleFileUpload}
                    accept="*/*"
                  />
                  <input
                    ref={imageInputRef}
                    type="file"
                    className="hidden"
                    onChange={handleImageUpload}
                    accept="image/*"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 text-gray-400 hover:text-primary hover:bg-gray-100 rounded-lg transition-all"
                    title="Attach file"
                  >
                    <Paperclip className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => imageInputRef.current?.click()}
                    className="p-2 text-gray-400 hover:text-primary hover:bg-gray-100 rounded-lg transition-all"
                    title="Send image"
                  >
                    <ImageIcon className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-primary hover:bg-gray-100 rounded-lg transition-all">
                    <Code className="w-5 h-5" />
                  </button>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={messageInput}
                      onChange={handleInputChange}
                      placeholder="Type a message..."
                      disabled={isSending}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />
                  </div>
                  <button
                    onClick={handleSendMessage}
                    disabled={!messageInput.trim() || isSending}
                    className="p-3 bg-primary text-white rounded-full hover:bg-primary/90 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-md"
                  >
                    {isSending ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                  No conversation selected
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  Select a conversation from the sidebar to start chatting
                </p>
                <Button
                  onClick={() => setNewChatOpen(true)}
                  className="bg-primary"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Start New Conversation
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Conversation Info Panel */}
        {showInfoPanel && selectedConversation && (
          <ConversationInfoPanel
            conversation={selectedConversation}
            onClose={() => setShowInfoPanel(false)}
          />
        )}
      </div>
    </main>
  );
}
