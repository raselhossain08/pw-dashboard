"use client";

import * as React from "react";
import RequireAuth from "@/components/RequireAuth";
import {
  ListOrdered,
  Bug,
  Brain,
  MessageSquare,
  Download,
  Filter,
  ArrowUp,
  AlertTriangle,
  Bot,
  Loader2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Search,
  Eye,
  CheckCircle2,
  XCircle,
  Trash2,
  Copy,
  Calendar,
  ArrowUpDown,
  FileText,
  FileDown,
  Clock,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AppLayout from "@/components/layout/AppLayout";
import { useActivityLogs } from "@/hooks/useActivityLogs";
import { LogsFilterModal } from "@/components/shared/LogsFilterModal";
import { formatDistanceToNow } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { activityLogsService } from "@/services/activity-logs.service";
import { useToast } from "@/context/ToastContext";

export default function ActivityLogsPage() {
  const {
    activityLogs,
    errorLogs,
    aiLogs,
    chatLogs,
    systemLogs,
    activityStats,
    errorStats,
    aiStats,
    chatStats,
    systemStats,
    activityPagination,
    errorPagination,
    aiPagination,
    chatPagination,
    systemPagination,
    isLoadingActivity,
    isLoadingErrors,
    isLoadingAi,
    isLoadingChat,
    isLoadingSystem,
    isLoadingStats,
    fetchActivityLogs,
    fetchErrorLogs,
    fetchAiLogs,
    fetchChatLogs,
    fetchSystemLogs,
    refreshAllStats,
    activityFilters,
    errorFilters,
    aiFilters,
    chatFilters,
    systemFilters,
    clearFilters,
  } = useActivityLogs();

  const [activeTab, setActiveTab] = React.useState("Activity Timeline");
  const [filterOpen, setFilterOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedLogs, setSelectedLogs] = React.useState<string[]>([]);
  const [logDetailsOpen, setLogDetailsOpen] = React.useState(false);
  const [selectedLog, setSelectedLog] = React.useState<any>(null);
  const [resolveDialogOpen, setResolveDialogOpen] = React.useState(false);
  const [resolveSolution, setResolveSolution] = React.useState("");
  const [sortField, setSortField] = React.useState<string>("createdAt");
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("desc");
  const [autoRefresh, setAutoRefresh] = React.useState(false);
  const [exportFormat, setExportFormat] = React.useState<
    "json" | "csv" | "pdf"
  >("json");
  const { push } = useToast();

  React.useEffect(() => {
    refreshAllStats();
    fetchActivityLogs();
  }, []);

  // Auto-refresh
  React.useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      refreshAllStats();
      switch (activeTab) {
        case "Activity Timeline":
          fetchActivityLogs();
          break;
        case "Error Logs":
          fetchErrorLogs();
          break;
        case "AI Logs":
          fetchAiLogs();
          break;
        case "Chat Logs":
          fetchChatLogs();
          break;
        case "System Logs":
          fetchSystemLogs();
          break;
      }
    }, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [autoRefresh, activeTab]);

  // Search handler
  const handleSearch = React.useCallback(
    (query: string) => {
      setSearchQuery(query);
      const filters = { ...getCurrentFilters(), search: query, page: 1 };
      handleApplyFilters(filters);
    },
    [activeTab]
  );

  // Date range quick select
  const handleDateRangeSelect = (
    range: "today" | "week" | "month" | "year"
  ) => {
    const now = new Date();
    let startDate: Date;
    switch (range) {
      case "today":
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case "week":
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case "month":
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case "year":
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
    }
    const filters = {
      ...getCurrentFilters(),
      startDate: startDate.toISOString(),
      endDate: new Date().toISOString(),
      page: 1,
    };
    handleApplyFilters(filters);
  };

  // View log details
  const handleViewLog = async (logId: string) => {
    try {
      const typeMap: Record<string, string> = {
        "Activity Timeline": "activity",
        "Error Logs": "error",
        "AI Logs": "ai",
        "Chat Logs": "chat",
        "System Logs": "system",
      };
      const type = typeMap[activeTab];
      const response = await activityLogsService.getLogById(type as any, logId);
      setSelectedLog((response as any).data);
      setLogDetailsOpen(true);
    } catch (error: any) {
      push({ message: "Failed to load log details", type: "error" });
    }
  };

  // Copy log details
  const handleCopyLog = () => {
    if (!selectedLog) return;
    const logText = JSON.stringify(selectedLog, null, 2);
    navigator.clipboard.writeText(logText);
    push({ message: "Log details copied to clipboard", type: "success" });
  };

  // Mark error as resolved
  const handleMarkResolved = async (logId: string, solution?: string) => {
    try {
      await activityLogsService.markErrorAsResolved(logId, solution);
      push({ message: "Error marked as resolved", type: "success" });
      fetchErrorLogs();
      setResolveDialogOpen(false);
      setResolveSolution("");
    } catch (error: any) {
      push({ message: "Failed to mark error as resolved", type: "error" });
    }
  };

  // Delete log
  const handleDeleteLog = async (logId: string) => {
    if (!confirm("Are you sure you want to delete this log?")) return;
    try {
      const typeMap: Record<string, string> = {
        "Activity Timeline": "activity",
        "Error Logs": "error",
        "AI Logs": "ai",
        "Chat Logs": "chat",
        "System Logs": "system",
      };
      const type = typeMap[activeTab];
      await activityLogsService.deleteLog(type as any, logId);
      push({ message: "Log deleted successfully", type: "success" });
      switch (activeTab) {
        case "Activity Timeline":
          fetchActivityLogs();
          break;
        case "Error Logs":
          fetchErrorLogs();
          break;
        case "AI Logs":
          fetchAiLogs();
          break;
        case "Chat Logs":
          fetchChatLogs();
          break;
        case "System Logs":
          fetchSystemLogs();
          break;
      }
    } catch (error: any) {
      push({ message: "Failed to delete log", type: "error" });
    }
  };

  // Bulk actions
  const handleBulkResolve = async () => {
    if (selectedLogs.length === 0) return;
    try {
      await activityLogsService.bulkMarkErrorsAsResolved(selectedLogs);
      push({
        message: `${selectedLogs.length} errors marked as resolved`,
        type: "success",
      });
      setSelectedLogs([]);
      fetchErrorLogs();
    } catch (error: any) {
      push({ message: "Failed to resolve errors", type: "error" });
    }
  };

  const handleBulkDelete = async () => {
    if (selectedLogs.length === 0) return;
    if (
      !confirm(`Are you sure you want to delete ${selectedLogs.length} logs?`)
    )
      return;
    try {
      const typeMap: Record<string, string> = {
        "Activity Timeline": "activity",
        "Error Logs": "error",
        "AI Logs": "ai",
        "Chat Logs": "chat",
        "System Logs": "system",
      };
      const type = typeMap[activeTab];
      await activityLogsService.bulkDeleteLogs(type as any, selectedLogs);
      push({ message: `${selectedLogs.length} logs deleted`, type: "success" });
      setSelectedLogs([]);
      switch (activeTab) {
        case "Activity Timeline":
          fetchActivityLogs();
          break;
        case "Error Logs":
          fetchErrorLogs();
          break;
        case "AI Logs":
          fetchAiLogs();
          break;
        case "Chat Logs":
          fetchChatLogs();
          break;
        case "System Logs":
          fetchSystemLogs();
          break;
      }
    } catch (error: any) {
      push({ message: "Failed to delete logs", type: "error" });
    }
  };

  // Sort handler
  const handleSort = (field: string) => {
    let newField = field;
    let newOrder: "asc" | "desc" = "desc";

    if (sortField === field) {
      newOrder = sortOrder === "asc" ? "desc" : "asc";
    }

    setSortField(newField);
    setSortOrder(newOrder);

    const filters = {
      ...getCurrentFilters(),
      sortField: newField,
      sortOrder: newOrder,
    };
    handleApplyFilters(filters);
  };

  // Export in different formats
  const handleExport = async () => {
    const typeMap: Record<string, string> = {
      "Activity Timeline": "activity",
      "Error Logs": "error",
      "AI Logs": "ai",
      "Chat Logs": "chat",
      "System Logs": "system",
    };
    const type = typeMap[activeTab];
    const filters = getCurrentFilters();

    try {
      const data = await activityLogsService.exportLogs(type as any, filters);
      const logs = (data as any).data || [];

      if (exportFormat === "json") {
        const blob = new Blob([JSON.stringify(logs, null, 2)], {
          type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${type}-logs-${new Date().toISOString()}.json`;
        a.click();
        URL.revokeObjectURL(url);
      } else if (exportFormat === "csv") {
        const headers = Object.keys(logs[0] || {});
        const csvRows = [
          headers.join(","),
          ...logs.map((log: any) =>
            headers
              .map((header) => {
                const value = log[header];
                return typeof value === "object"
                  ? JSON.stringify(value).replace(/"/g, '""')
                  : String(value || "").replace(/"/g, '""');
              })
              .map((v: string) => `"${v}"`)
              .join(",")
          ),
        ];
        const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${type}-logs-${new Date().toISOString()}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      }

      push({
        message: `Logs exported as ${exportFormat.toUpperCase()}`,
        type: "success",
      });
    } catch (error: any) {
      push({ message: "Failed to export logs", type: "error" });
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    switch (tab) {
      case "Activity Timeline":
        if (!Array.isArray(activityLogs) || activityLogs.length === 0)
          fetchActivityLogs();
        break;
      case "Error Logs":
        if (!Array.isArray(errorLogs) || errorLogs.length === 0)
          fetchErrorLogs();
        break;
      case "AI Logs":
        if (!Array.isArray(aiLogs) || aiLogs.length === 0) fetchAiLogs();
        break;
      case "Chat Logs":
        if (!Array.isArray(chatLogs) || chatLogs.length === 0) fetchChatLogs();
        break;
      case "System Logs":
        if (!Array.isArray(systemLogs) || systemLogs.length === 0)
          fetchSystemLogs();
        break;
    }
  };

  const handleApplyFilters = (filters: any) => {
    switch (activeTab) {
      case "Activity Timeline":
        fetchActivityLogs(filters);
        break;
      case "Error Logs":
        fetchErrorLogs(filters);
        break;
      case "AI Logs":
        fetchAiLogs(filters);
        break;
      case "Chat Logs":
        fetchChatLogs(filters);
        break;
      case "System Logs":
        fetchSystemLogs(filters);
        break;
    }
  };

  const handlePageChange = (page: number) => {
    switch (activeTab) {
      case "Activity Timeline":
        fetchActivityLogs({ ...activityFilters, page });
        break;
      case "Error Logs":
        fetchErrorLogs({ ...errorFilters, page });
        break;
      case "AI Logs":
        fetchAiLogs({ ...aiFilters, page });
        break;
      case "Chat Logs":
        fetchChatLogs({ ...chatFilters, page });
        break;
      case "System Logs":
        fetchSystemLogs({ ...systemFilters, page });
        break;
    }
  };

  const getCurrentFilters = () => {
    switch (activeTab) {
      case "Activity Timeline":
        return activityFilters;
      case "Error Logs":
        return errorFilters;
      case "AI Logs":
        return aiFilters;
      case "Chat Logs":
        return chatFilters;
      case "System Logs":
        return systemFilters;
      default:
        return {};
    }
  };

  const getCurrentPagination = () => {
    switch (activeTab) {
      case "Activity Timeline":
        return activityPagination;
      case "Error Logs":
        return errorPagination;
      case "AI Logs":
        return aiPagination;
      case "Chat Logs":
        return chatPagination;
      case "System Logs":
        return systemPagination;
      default:
        return null;
    }
  };

  const isLoading = () => {
    switch (activeTab) {
      case "Activity Timeline":
        return isLoadingActivity;
      case "Error Logs":
        return isLoadingErrors;
      case "AI Logs":
        return isLoadingAi;
      case "Chat Logs":
        return isLoadingChat;
      case "System Logs":
        return isLoadingSystem;
      default:
        return false;
    }
  };

  const formatTime = (date: string | undefined | null) => {
    if (!date) return "N/A";
    try {
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) {
        console.warn("Invalid date format received:", date);
        return "N/A";
      }
      return formatDistanceToNow(dateObj, { addSuffix: true });
    } catch (error) {
      console.error("Error formatting date:", error, date);
      return "N/A";
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "INFO":
        return "bg-[#6366F1]";
      case "SUCCESS":
        return "bg-[#10B981]";
      case "WARNING":
        return "bg-[#F59E0B]";
      case "ERROR":
        return "bg-[#EF4444]";
      default:
        return "bg-gray-500";
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "low":
        return "bg-blue-100 text-blue-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "critical":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <RequireAuth roles={["admin", "super_admin"]}>
      <AppLayout>
        <main className="pt-6">
          <div className="p-6">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-3xl font-bold text-secondary mb-2">
                  Logs & Activity
                </h2>
                <p className="text-gray-600">
                  Monitor system activity, errors, AI interactions, and chat
                  conversations.
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <Button
                  variant={autoRefresh ? "default" : "outline"}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                  onClick={() => setAutoRefresh(!autoRefresh)}
                >
                  <Clock
                    className={`w-4 h-4 mr-2 ${
                      autoRefresh ? "animate-pulse" : ""
                    }`}
                  />
                  {autoRefresh ? "Auto-Refresh ON" : "Auto-Refresh"}
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="border-gray-300 text-gray-700 hover:bg-gray-50"
                      disabled={isLoading()}
                    >
                      <FileDown className="w-4 h-4 mr-2" /> Export (
                      {exportFormat.toUpperCase()})
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem
                      onClick={() => {
                        setExportFormat("json");
                        handleExport();
                      }}
                    >
                      <FileText className="w-4 h-4 mr-2" /> Export as JSON
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        setExportFormat("csv");
                        handleExport();
                      }}
                    >
                      <FileText className="w-4 h-4 mr-2" /> Export as CSV
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button
                  variant="outline"
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                  onClick={refreshAllStats}
                  disabled={isLoadingStats}
                >
                  <RefreshCw
                    className={`w-4 h-4 mr-2 ${
                      isLoadingStats ? "animate-spin" : ""
                    }`}
                  />
                  Refresh
                </Button>
                <Button
                  className="bg-primary hover:bg-primary/90 text-white"
                  onClick={() => setFilterOpen(true)}
                >
                  <Filter className="w-4 h-4 mr-2" /> Filter Logs
                </Button>
              </div>
            </div>

            {/* Search Bar and Quick Filters */}
            <div className="mb-6 space-y-4">
              <div className="flex items-center space-x-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search logs..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      if (
                        e.target.value.length === 0 ||
                        e.target.value.length >= 3
                      ) {
                        handleSearch(e.target.value);
                      }
                    }}
                    className="pl-10"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Quick Filters:</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDateRangeSelect("today")}
                  >
                    <Calendar className="w-3 h-3 mr-1" /> Today
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDateRangeSelect("week")}
                  >
                    <Calendar className="w-3 h-3 mr-1" /> Week
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDateRangeSelect("month")}
                  >
                    <Calendar className="w-3 h-3 mr-1" /> Month
                  </Button>
                </div>
              </div>

              {/* Bulk Actions Toolbar */}
              {selectedLogs.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-between">
                  <span className="text-sm text-blue-800">
                    {selectedLogs.length} log
                    {selectedLogs.length > 1 ? "s" : ""} selected
                  </span>
                  <div className="flex items-center space-x-2">
                    {activeTab === "Error Logs" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleBulkResolve}
                      >
                        <CheckCircle2 className="w-4 h-4 mr-1" /> Mark Resolved
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleBulkDelete}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4 mr-1" /> Delete
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedLogs([])}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">
                      Total Logs Today
                    </p>
                    {isLoadingStats ? (
                      <Loader2 className="w-6 h-6 animate-spin text-gray-400 mt-1" />
                    ) : (
                      <>
                        <p className="text-2xl font-bold text-secondary mt-1">
                          {activityStats?.totalToday || 0}
                        </p>
                        <p className="text-accent text-sm mt-1">
                          <ArrowUp className="w-3 h-3 inline" /> Active
                        </p>
                      </>
                    )}
                  </div>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <ListOrdered className="text-primary text-lg" />
                  </div>
                </div>
              </div>
              <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Errors</p>
                    {isLoadingStats ? (
                      <Loader2 className="w-6 h-6 animate-spin text-gray-400 mt-1" />
                    ) : (
                      <>
                        <p className="text-2xl font-bold text-secondary mt-1">
                          {errorStats?.totalErrors || 0}
                        </p>
                        <p className="text-red-600 text-sm mt-1">
                          <AlertTriangle className="w-3 h-3 inline" />{" "}
                          {(errorStats?.bySeverity || []).find(
                            (s) => s._id === "critical"
                          )?.count || 0}{" "}
                          critical
                        </p>
                      </>
                    )}
                  </div>
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <Bug className="text-red-600 text-lg" />
                  </div>
                </div>
              </div>
              <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">
                      AI Interactions
                    </p>
                    {isLoadingStats ? (
                      <Loader2 className="w-6 h-6 animate-spin text-gray-400 mt-1" />
                    ) : (
                      <>
                        <p className="text-2xl font-bold text-secondary mt-1">
                          {aiStats?.totalInteractions || 0}
                        </p>
                        <p className="text-accent text-sm mt-1">
                          <Bot className="w-3 h-3 inline" />{" "}
                          {aiStats?.avgResponseTime || 0}ms avg
                        </p>
                      </>
                    )}
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Brain className="text-purple-600 text-lg" />
                  </div>
                </div>
              </div>
              <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">
                      Active Chats
                    </p>
                    {isLoadingStats ? (
                      <Loader2 className="w-6 h-6 animate-spin text-gray-400 mt-1" />
                    ) : (
                      <>
                        <p className="text-2xl font-bold text-secondary mt-1">
                          {chatStats?.totalChats || 0}
                        </p>
                        <p className="text-accent text-sm mt-1">
                          <MessageSquare className="w-3 h-3 inline" />{" "}
                          {chatStats?.unreadMessages || 0} unread
                        </p>
                      </>
                    )}
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <MessageSquare className="text-blue-600 text-lg" />
                  </div>
                </div>
              </div>
            </div>

            <div className="border-b border-gray-200 mb-8">
              <nav className="flex space-x-8">
                {[
                  "Activity Timeline",
                  "Error Logs",
                  "AI Logs",
                  "Chat Logs",
                  "System Logs",
                ].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => handleTabChange(tab)}
                    className={`py-4 px-1 font-medium text-sm transition-colors ${
                      activeTab === tab
                        ? "border-b-2 border-primary text-primary"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </nav>
            </div>

            {isLoading() ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
                {activeTab === "Activity Timeline" && (
                  <div className="mb-8">
                    <h3 className="text-xl font-semibold text-secondary mb-6">
                      Activity Timeline
                    </h3>
                    <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
                      {!activityLogs || activityLogs.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                          No activity logs found
                        </div>
                      ) : (
                        <div className="relative">
                          <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                          {Array.isArray(activityLogs) &&
                            activityLogs.map((log: any, i) => (
                              <div
                                key={log._id}
                                className={`relative ${
                                  i !== activityLogs.length - 1 ? "mb-6" : ""
                                }`}
                              >
                                <div className="flex space-x-4">
                                  <div className="w-10 relative z-10">
                                    <div className="absolute left-1/2 top-2 -translate-x-1/2 w-3 h-3 rounded-full border-2 border-primary bg-white"></div>
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex justify-between items-start mb-1">
                                      <div className="flex items-center space-x-2">
                                        <span
                                          className={`text-white text-xs px-2 py-1 rounded-full ${getLevelColor(
                                            log.level
                                          )}`}
                                        >
                                          {log.level}
                                        </span>
                                        <p className="font-medium text-secondary">
                                          {log.title}
                                        </p>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <span className="text-sm text-gray-500">
                                          {formatTime(log.createdAt)}
                                        </span>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleViewLog(log._id)}
                                          title="View Details"
                                        >
                                          <Eye className="w-4 h-4" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() =>
                                            handleDeleteLog(log._id)
                                          }
                                          title="Delete"
                                        >
                                          <Trash2 className="w-4 h-4 text-red-600" />
                                        </Button>
                                      </div>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-2">
                                      {log.message}
                                    </p>
                                    {log.metadata &&
                                      log.metadata.length > 0 && (
                                        <div className="text-xs text-gray-500 space-x-2">
                                          {log.metadata.map(
                                            (m: string, idx: number) => (
                                              <span
                                                key={idx}
                                                className="px-2 py-1 rounded inline-block bg-gray-100"
                                              >
                                                {m}
                                              </span>
                                            )
                                          )}
                                        </div>
                                      )}
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                    {activityPagination &&
                      activityPagination.totalPages > 1 && (
                        <div className="flex items-center justify-between mt-6">
                          <div className="text-sm text-gray-600">
                            Showing {activityPagination.page} of{" "}
                            {activityPagination.totalPages} pages
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handlePageChange(activityPagination.page - 1)
                              }
                              disabled={activityPagination.page === 1}
                            >
                              <ChevronLeft className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handlePageChange(activityPagination.page + 1)
                              }
                              disabled={
                                activityPagination.page ===
                                activityPagination.totalPages
                              }
                            >
                              <ChevronRight className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                  </div>
                )}

                {activeTab === "Error Logs" && (
                  <div className="mb-8">
                    <h3 className="text-xl font-semibold text-secondary mb-6">
                      Error Logs
                    </h3>
                    <div className="bg-card rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                      {!errorLogs || errorLogs.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                          No error logs found
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                                  <Checkbox
                                    checked={
                                      selectedLogs.length ===
                                        errorLogs.length && errorLogs.length > 0
                                    }
                                    onCheckedChange={(checked) => {
                                      if (checked) {
                                        setSelectedLogs(
                                          errorLogs.map((e: any) => e._id)
                                        );
                                      } else {
                                        setSelectedLogs([]);
                                      }
                                    }}
                                  />
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  <button
                                    onClick={() => handleSort("severity")}
                                    className="flex items-center space-x-1 hover:text-gray-700"
                                  >
                                    <span>Severity</span>
                                    <ArrowUpDown className="w-3 h-3" />
                                  </button>
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  <button
                                    onClick={() => handleSort("errorType")}
                                    className="flex items-center space-x-1 hover:text-gray-700"
                                  >
                                    <span>Error Type</span>
                                    <ArrowUpDown className="w-3 h-3" />
                                  </button>
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Message
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Endpoint
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  <button
                                    onClick={() => handleSort("createdAt")}
                                    className="flex items-center space-x-1 hover:text-gray-700"
                                  >
                                    <span>Time</span>
                                    <ArrowUpDown className="w-3 h-3" />
                                  </button>
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Actions
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {Array.isArray(errorLogs) &&
                                errorLogs.map((error: any) => (
                                  <tr
                                    key={error._id}
                                    className="hover:bg-gray-50"
                                  >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <Checkbox
                                        checked={selectedLogs.includes(
                                          error._id
                                        )}
                                        onCheckedChange={(checked) => {
                                          if (checked) {
                                            setSelectedLogs([
                                              ...selectedLogs,
                                              error._id,
                                            ]);
                                          } else {
                                            setSelectedLogs(
                                              selectedLogs.filter(
                                                (id) => id !== error._id
                                              )
                                            );
                                          }
                                        }}
                                      />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <span
                                        className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(
                                          error.severity
                                        )}`}
                                      >
                                        {error.severity.toUpperCase()}
                                      </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                      {error.errorType}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600 max-w-md truncate">
                                      {error.message}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                      {error.endpoint || "N/A"}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                      {formatTime(error.createdAt)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      {error.isResolved ? (
                                        <Badge
                                          variant="default"
                                          className="bg-green-500"
                                        >
                                          Resolved
                                        </Badge>
                                      ) : (
                                        <Badge variant="destructive">
                                          Open
                                        </Badge>
                                      )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <div className="flex items-center space-x-2">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() =>
                                            handleViewLog(error._id)
                                          }
                                          title="View Details"
                                        >
                                          <Eye className="w-4 h-4" />
                                        </Button>
                                        {!error.isResolved && (
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                              setSelectedLog(error);
                                              setResolveDialogOpen(true);
                                            }}
                                            title="Mark as Resolved"
                                          >
                                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                                          </Button>
                                        )}
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() =>
                                            handleDeleteLog(error._id)
                                          }
                                          title="Delete"
                                        >
                                          <Trash2 className="w-4 h-4 text-red-600" />
                                        </Button>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                    {errorPagination && errorPagination.totalPages > 1 && (
                      <div className="flex items-center justify-between mt-6">
                        <div className="text-sm text-gray-600">
                          Showing {errorPagination.page} of{" "}
                          {errorPagination.totalPages} pages
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handlePageChange(errorPagination.page - 1)
                            }
                            disabled={errorPagination.page === 1}
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handlePageChange(errorPagination.page + 1)
                            }
                            disabled={
                              errorPagination.page ===
                              errorPagination.totalPages
                            }
                          >
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "AI Logs" && (
                  <div className="mb-8">
                    <h3 className="text-xl font-semibold text-secondary mb-6">
                      AI Interaction Logs
                    </h3>
                    <div className="space-y-4">
                      {!aiLogs || aiLogs.length === 0 ? (
                        <div className="bg-card rounded-xl p-12 text-center text-gray-500 shadow-sm border border-gray-100">
                          No AI logs found
                        </div>
                      ) : (
                        Array.isArray(aiLogs) &&
                        aiLogs.map((log: any) => (
                          <div
                            key={log._id}
                            className="bg-card rounded-xl p-6 shadow-sm border border-gray-100"
                          >
                            <div className="flex justify-between items-start mb-4">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                  <Brain className="text-purple-600 w-5 h-5" />
                                </div>
                                <div>
                                  <p className="font-medium text-secondary">
                                    {(log.aiModel || "").toUpperCase()}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    {log.userName || "Anonymous"}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <div className="text-right">
                                  <p className="text-sm text-gray-600">
                                    {formatTime(log.createdAt)}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {log.responseTime}ms • {log.tokensUsed}{" "}
                                    tokens
                                  </p>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleViewLog(log._id)}
                                  title="View Details"
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteLog(log._id)}
                                  title="Delete"
                                >
                                  <Trash2 className="w-4 h-4 text-red-600" />
                                </Button>
                              </div>
                            </div>
                            <div className="space-y-3">
                              <div>
                                <p className="text-xs font-medium text-gray-500 mb-1">
                                  PROMPT
                                </p>
                                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                                  {log.prompt}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs font-medium text-gray-500 mb-1">
                                  RESPONSE
                                </p>
                                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                                  {log.response}
                                </p>
                              </div>
                            </div>
                            {log.status !== "success" && (
                              <div className="mt-3">
                                <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">
                                  Error: {log.errorMessage}
                                </span>
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                    {aiPagination && aiPagination.totalPages > 1 && (
                      <div className="flex items-center justify-between mt-6">
                        <div className="text-sm text-gray-600">
                          Showing {aiPagination.page} of{" "}
                          {aiPagination.totalPages} pages
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handlePageChange(aiPagination.page - 1)
                            }
                            disabled={aiPagination.page === 1}
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handlePageChange(aiPagination.page + 1)
                            }
                            disabled={
                              aiPagination.page === aiPagination.totalPages
                            }
                          >
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "Chat Logs" && (
                  <div className="mb-8">
                    <h3 className="text-xl font-semibold text-secondary mb-6">
                      Chat Logs
                    </h3>
                    <div className="bg-card rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                      {!chatLogs || chatLogs.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                          No chat logs found
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Type
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Sender
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Message
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Time
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Actions
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {Array.isArray(chatLogs) &&
                                chatLogs.map((chat: any) => (
                                  <tr
                                    key={chat._id}
                                    className="hover:bg-gray-50"
                                  >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                                        {chat.chatType}
                                      </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                      {chat.senderName}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600 max-w-md truncate">
                                      {chat.message}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                      {formatTime(chat.createdAt)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      {chat.isRead ? (
                                        <Badge
                                          variant="default"
                                          className="bg-green-500"
                                        >
                                          Read
                                        </Badge>
                                      ) : (
                                        <Badge variant="outline">Unread</Badge>
                                      )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <div className="flex items-center space-x-2">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() =>
                                            handleViewLog(chat._id)
                                          }
                                          title="View Details"
                                        >
                                          <Eye className="w-4 h-4" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() =>
                                            handleDeleteLog(chat._id)
                                          }
                                          title="Delete"
                                        >
                                          <Trash2 className="w-4 h-4 text-red-600" />
                                        </Button>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                    {chatPagination && chatPagination.totalPages > 1 && (
                      <div className="flex items-center justify-between mt-6">
                        <div className="text-sm text-gray-600">
                          Showing {chatPagination.page} of{" "}
                          {chatPagination.totalPages} pages
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handlePageChange(chatPagination.page - 1)
                            }
                            disabled={chatPagination.page === 1}
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handlePageChange(chatPagination.page + 1)
                            }
                            disabled={
                              chatPagination.page === chatPagination.totalPages
                            }
                          >
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "System Logs" && (
                  <div className="mb-8">
                    <h3 className="text-xl font-semibold text-secondary mb-6">
                      System Logs
                    </h3>
                    <div className="space-y-4">
                      {!systemLogs || systemLogs.length === 0 ? (
                        <div className="bg-card rounded-xl p-12 text-center text-gray-500 shadow-sm border border-gray-100">
                          No system logs found
                        </div>
                      ) : (
                        Array.isArray(systemLogs) &&
                        systemLogs.map((log: any) => (
                          <div
                            key={log._id}
                            className="bg-card rounded-xl p-6 shadow-sm border border-gray-100"
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex items-center space-x-3">
                                <div
                                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                    log.status === "healthy"
                                      ? "bg-green-100"
                                      : log.status === "warning"
                                      ? "bg-yellow-100"
                                      : "bg-red-100"
                                  }`}
                                >
                                  <AlertTriangle
                                    className={`w-5 h-5 ${
                                      log.status === "healthy"
                                        ? "text-green-600"
                                        : log.status === "warning"
                                        ? "text-yellow-600"
                                        : "text-red-600"
                                    }`}
                                  />
                                </div>
                                <div>
                                  <p className="font-medium text-secondary">
                                    {log.eventType
                                      .replace(/_/g, " ")
                                      .toUpperCase()}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    {log.message}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <div className="text-right">
                                  <p className="text-sm text-gray-600">
                                    {formatTime(log.createdAt)}
                                  </p>
                                  <Badge
                                    className={
                                      log.status === "healthy"
                                        ? "bg-green-100 text-green-800"
                                        : log.status === "warning"
                                        ? "bg-yellow-100 text-yellow-800"
                                        : "bg-red-100 text-red-800"
                                    }
                                  >
                                    {log.status.toUpperCase()}
                                  </Badge>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleViewLog(log._id)}
                                  title="View Details"
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteLog(log._id)}
                                  title="Delete"
                                >
                                  <Trash2 className="w-4 h-4 text-red-600" />
                                </Button>
                              </div>
                            </div>
                            {log.systemMetrics && (
                              <div className="mt-4 grid grid-cols-4 gap-4 pt-4 border-t border-gray-100">
                                {log.systemMetrics.cpuUsage && (
                                  <div>
                                    <p className="text-xs text-gray-500">CPU</p>
                                    <p className="text-sm font-medium text-gray-900">
                                      {log.systemMetrics.cpuUsage}%
                                    </p>
                                  </div>
                                )}
                                {log.systemMetrics.memoryUsage && (
                                  <div>
                                    <p className="text-xs text-gray-500">
                                      Memory
                                    </p>
                                    <p className="text-sm font-medium text-gray-900">
                                      {log.systemMetrics.memoryUsage}%
                                    </p>
                                  </div>
                                )}
                                {log.systemMetrics.diskUsage && (
                                  <div>
                                    <p className="text-xs text-gray-500">
                                      Disk
                                    </p>
                                    <p className="text-sm font-medium text-gray-900">
                                      {log.systemMetrics.diskUsage}%
                                    </p>
                                  </div>
                                )}
                                {log.systemMetrics.activeConnections && (
                                  <div>
                                    <p className="text-xs text-gray-500">
                                      Connections
                                    </p>
                                    <p className="text-sm font-medium text-gray-900">
                                      {log.systemMetrics.activeConnections}
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                    {systemPagination && systemPagination.totalPages > 1 && (
                      <div className="flex items-center justify-between mt-6">
                        <div className="text-sm text-gray-600">
                          Showing {systemPagination.page} of{" "}
                          {systemPagination.totalPages} pages
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handlePageChange(systemPagination.page - 1)
                            }
                            disabled={systemPagination.page === 1}
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handlePageChange(systemPagination.page + 1)
                            }
                            disabled={
                              systemPagination.page ===
                              systemPagination.totalPages
                            }
                          >
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            <LogsFilterModal
              open={filterOpen}
              onOpenChange={setFilterOpen}
              activeTab={activeTab}
              filters={getCurrentFilters()}
              onApplyFilters={handleApplyFilters}
              onClearFilters={clearFilters}
            />

            {/* Log Details Modal */}
            <Dialog open={logDetailsOpen} onOpenChange={setLogDetailsOpen}>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <div className="flex items-center justify-between">
                    <DialogTitle>Log Details</DialogTitle>
                    <Button variant="ghost" size="sm" onClick={handleCopyLog}>
                      <Copy className="w-4 h-4 mr-2" /> Copy
                    </Button>
                  </div>
                </DialogHeader>
                {selectedLog && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          ID
                        </label>
                        <p className="text-sm text-gray-900 font-mono">
                          {selectedLog._id}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Created At
                        </label>
                        <p className="text-sm text-gray-900">
                          {new Date(selectedLog.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    {selectedLog.severity && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Severity
                        </label>
                        <Badge
                          className={getSeverityColor(selectedLog.severity)}
                        >
                          {selectedLog.severity.toUpperCase()}
                        </Badge>
                      </div>
                    )}
                    {selectedLog.errorType && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Error Type
                        </label>
                        <p className="text-sm text-gray-900">
                          {selectedLog.errorType}
                        </p>
                      </div>
                    )}
                    {selectedLog.message && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Message
                        </label>
                        <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded">
                          {selectedLog.message}
                        </p>
                      </div>
                    )}
                    {selectedLog.stack && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Stack Trace
                        </label>
                        <pre className="text-xs text-gray-900 bg-gray-50 p-3 rounded overflow-x-auto">
                          {typeof selectedLog.stack === "string"
                            ? selectedLog.stack
                            : JSON.stringify(selectedLog.stack, null, 2)}
                        </pre>
                      </div>
                    )}
                    {selectedLog.endpoint && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Endpoint
                        </label>
                        <p className="text-sm text-gray-900 font-mono">
                          {selectedLog.endpoint}
                        </p>
                      </div>
                    )}
                    {selectedLog.ipAddress && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          IP Address
                        </label>
                        <p className="text-sm text-gray-900">
                          {selectedLog.ipAddress}
                        </p>
                      </div>
                    )}
                    {selectedLog.userAgent && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          User Agent
                        </label>
                        <p className="text-sm text-gray-900">
                          {selectedLog.userAgent}
                        </p>
                      </div>
                    )}
                    {selectedLog.solution && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Solution
                        </label>
                        <p className="text-sm text-gray-900 bg-green-50 p-3 rounded">
                          {selectedLog.solution}
                        </p>
                      </div>
                    )}
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Full Log Data
                      </label>
                      <pre className="text-xs text-gray-900 bg-gray-50 p-3 rounded overflow-x-auto max-h-96">
                        {JSON.stringify(selectedLog, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setLogDetailsOpen(false)}
                  >
                    Close
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Resolve Error Dialog */}
            <Dialog
              open={resolveDialogOpen}
              onOpenChange={setResolveDialogOpen}
            >
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Mark Error as Resolved</DialogTitle>
                  <DialogDescription>
                    Add a solution or notes about how this error was resolved.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Solution / Notes (Optional)
                    </label>
                    <Textarea
                      value={resolveSolution}
                      onChange={(e) => setResolveSolution(e.target.value)}
                      placeholder="Describe how this error was resolved..."
                      rows={4}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setResolveDialogOpen(false);
                      setResolveSolution("");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      if (selectedLog) {
                        handleMarkResolved(selectedLog._id, resolveSolution);
                      }
                    }}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" /> Mark as Resolved
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </main>
      </AppLayout>
    </RequireAuth>
  );
}
