"use client";

import * as React from "react";
import {
  Bot,
  Search as SearchIcon,
  Filter,
  ArrowUpDown,
  EllipsisVertical,
  MessageSquare,
  Clock,
  Star,
  Plus,
  Power,
  Settings,
  Edit,
  Trash2,
  Copy,
  FileText,
  TrendingUp,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Database,
  Eye,
  Download,
  ChevronLeft,
  ChevronRight,
  X,
  MoreVertical,
  Logs,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useAIAgents } from "@/hooks/useAIAgents";
import { useAIAgentsStore } from "@/store/aiAgentsStore";
import { aiBotService } from "@/services/ai-bot.service";
import { aiAgentsService } from "@/services/ai-agents.service";
import type {
  Agent,
  AgentStatus,
  CreateAgentDto,
  UpdateAgentDto,
  ConversationRow,
} from "@/services/ai-agents.service";
import { useToast } from "@/context/ToastContext";
import {
  validateAgentForm,
  hasValidationErrors,
  sanitizeAgentFormData,
  type ValidationErrors,
} from "@/lib/validations/ai-agent.validation";
import { AIAgentsLoadingSkeleton } from "./LoadingSkeletons";
import { TestAgentPanel } from "./TestAgentPanel";
import { AgentConfigPanel } from "./AgentConfigPanel";

const getIconStyles = (index: number) => {
  const styles = [
    { bg: "bg-primary/10", color: "text-primary" },
    { bg: "bg-accent/10", color: "text-accent" },
    { bg: "bg-yellow-100", color: "text-yellow-600" },
    { bg: "bg-purple-100", color: "text-purple-600" },
    { bg: "bg-blue-100", color: "text-blue-600" },
    { bg: "bg-green-100", color: "text-green-600" },
  ];
  return styles[index % styles.length];
};

export default function AIAgents() {
  const {
    agents,
    analytics,
    conversations,
    loading,
    creating,
    updating,
    deleting,
    createAgent,
    updateAgent,
    deleteAgent,
    toggleStatus,
    duplicateAgent,
  } = useAIAgents();

  const {
    selectedAgents,
    selectedConversation,
    setSelectedAgents,
    toggleAgentSelection,
    selectAllAgents,
    clearSelection,
    setSelectedConversation,
  } = useAIAgentsStore();

  const { push } = useToast();

  const [statusFilter, setStatusFilter] = React.useState<string>("All Status");
  const [sortBy, setSortBy] = React.useState<string>("Sort by: Newest");
  const [search, setSearch] = React.useState("");
  const [newAgentOpen, setNewAgentOpen] = React.useState(false);
  const [editAgentOpen, setEditAgentOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [selectedAgent, setSelectedAgent] = React.useState<Agent | null>(null);
  const [viewConversationOpen, setViewConversationOpen] = React.useState(false);
  const [viewLogsOpen, setViewLogsOpen] = React.useState(false);
  const [conversationHistory, setConversationHistory] = React.useState<any[]>(
    []
  );
  const [loadingHistory, setLoadingHistory] = React.useState(false);
  const [agentLogs, setAgentLogs] = React.useState<any>(null);
  const [loadingLogs, setLoadingLogs] = React.useState(false);
  const [bulkActionOpen, setBulkActionOpen] = React.useState(false);
  const [conversationsPage, setConversationsPage] = React.useState(1);
  const conversationsPerPage = 10;
  const [testAgentOpen, setTestAgentOpen] = React.useState(false);
  const [configAgentOpen, setConfigAgentOpen] = React.useState(false);
  const [agentForTest, setAgentForTest] = React.useState<Agent | null>(null);
  const [agentForConfig, setAgentForConfig] = React.useState<Agent | null>(
    null
  );

  // Form validation errors
  const [validationErrors, setValidationErrors] =
    React.useState<ValidationErrors>({});

  // Form states
  const [formData, setFormData] = React.useState<CreateAgentDto>({
    name: "",
    description: "",
    agentType: "Course Advisor",
    knowledgeBase: [],
    status: "active",
  });

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        const el = document.getElementById(
          "agent-search"
        ) as HTMLInputElement | null;
        el?.focus();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const handleCreateAgent = async () => {
    // Validate form before submission
    const errors = validateAgentForm(formData);
    setValidationErrors(errors);

    if (hasValidationErrors(errors)) {
      push({
        message: "Please fix all validation errors before submitting",
        type: "error",
      });
      return;
    }

    try {
      const sanitizedData = sanitizeAgentFormData(formData);
      await createAgent(sanitizedData);
      setNewAgentOpen(false);
      resetForm();
      setValidationErrors({});
    } catch (error) {
      console.error("Failed to create agent:", error);
    }
  };

  const handleUpdateAgent = async () => {
    if (!selectedAgent) return;

    // Validate form before submission
    const errors = validateAgentForm(formData);
    setValidationErrors(errors);

    if (hasValidationErrors(errors)) {
      push({
        message: "Please fix all validation errors before submitting",
        type: "error",
      });
      return;
    }

    try {
      const sanitizedData = sanitizeAgentFormData(formData);
      await updateAgent(selectedAgent._id, sanitizedData);
      setEditAgentOpen(false);
      setSelectedAgent(null);
      resetForm();
      setValidationErrors({});
    } catch (error) {
      console.error("Failed to update agent:", error);
    }
  };

  const handleDeleteAgent = async () => {
    if (!selectedAgent) return;
    try {
      await deleteAgent(selectedAgent._id);
      setDeleteDialogOpen(false);
      setSelectedAgent(null);
    } catch (error) {
      console.error("Failed to delete agent:", error);
    }
  };

  const handleToggleStatus = async (agent: Agent) => {
    const newStatus: AgentStatus =
      agent.status === "active" ? "inactive" : "active";
    try {
      await toggleStatus(agent._id, newStatus);
    } catch (error) {
      console.error("Failed to toggle status:", error);
    }
  };

  const handleDuplicate = async (agentId: string) => {
    try {
      await duplicateAgent(agentId);
    } catch (error) {
      console.error("Failed to duplicate agent:", error);
    }
  };

  const handleViewConversation = async (conversation: ConversationRow) => {
    try {
      setLoadingHistory(true);
      setSelectedConversation(conversation);
      // Fetch conversation messages using the dedicated endpoint
      const { data } = await aiAgentsService.getConversationMessages(
        conversation._id
      );

      // Handle response - expect array of messages
      const messages = Array.isArray(data)
        ? data
        : (data as any)?.messages || [];
      setConversationHistory(messages);
      setViewConversationOpen(true);
    } catch (error: any) {
      push({
        message:
          error?.response?.data?.message ||
          "Failed to load conversation history",
        type: "error",
      });
      setConversationHistory([]);
      // Still open the dialog to show basic info
      setViewConversationOpen(true);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleViewLogs = async (agent: Agent) => {
    try {
      setLoadingLogs(true);
      setSelectedAgent(agent);
      const { data } = await aiAgentsService.getAgentLogs(agent._id);
      setAgentLogs(data);
      setViewLogsOpen(true);
    } catch (error: any) {
      push({
        message: error?.response?.data?.message || "Failed to load agent logs",
        type: "error",
      });
    } finally {
      setLoadingLogs(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedAgents.length === 0) return;
    try {
      await Promise.all(selectedAgents.map((id) => deleteAgent(id)));
      clearSelection();
      setBulkActionOpen(false);
      push({
        message: `${selectedAgents.length} agent(s) deleted successfully`,
        type: "success",
      });
    } catch (error: any) {
      push({
        message: error?.response?.data?.message || "Failed to delete agents",
        type: "error",
      });
    }
  };

  const handleBulkStatusToggle = async (status: AgentStatus) => {
    if (selectedAgents.length === 0) return;
    try {
      await Promise.all(selectedAgents.map((id) => toggleStatus(id, status)));
      clearSelection();
      setBulkActionOpen(false);
      push({
        message: `${selectedAgents.length} agent(s) updated successfully`,
        type: "success",
      });
    } catch (error: any) {
      push({
        message: error?.response?.data?.message || "Failed to update agents",
        type: "error",
      });
    }
  };

  const handleExportAgents = () => {
    const dataStr = JSON.stringify(agents, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ai-agents-${new Date().toISOString()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    push({
      message: "Agents exported successfully",
      type: "success",
    });
  };

  const handleExportConversations = () => {
    const dataStr = JSON.stringify(conversations, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `conversations-${new Date().toISOString()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    push({
      message: "Conversations exported successfully",
      type: "success",
    });
  };

  const handleTestAgent = (agent: Agent) => {
    setAgentForTest(agent);
    setTestAgentOpen(true);
  };

  const handleAdvancedConfig = (agent: Agent) => {
    setAgentForConfig(agent);
    setConfigAgentOpen(true);
  };

  const paginatedConversations = React.useMemo(() => {
    const start = (conversationsPage - 1) * conversationsPerPage;
    const end = start + conversationsPerPage;
    return conversations.slice(start, end);
  }, [conversations, conversationsPage]);

  const totalConversationPages = Math.ceil(
    conversations.length / conversationsPerPage
  );

  const openEditDialog = (agent: Agent) => {
    setSelectedAgent(agent);
    setFormData({
      name: agent.name,
      description: agent.description,
      agentType: agent.agentType,
      knowledgeBase: agent.knowledgeBase || [],
      status: agent.status,
    });
    setEditAgentOpen(true);
  };

  const openDeleteDialog = (agent: Agent) => {
    setSelectedAgent(agent);
    setDeleteDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      agentType: "Course Advisor",
      knowledgeBase: [],
      status: "active",
    });
    setValidationErrors({});
  };

  const toggleKnowledgeBase = (item: string) => {
    setFormData((prev) => ({
      ...prev,
      knowledgeBase: prev.knowledgeBase?.includes(item)
        ? prev.knowledgeBase.filter((kb) => kb !== item)
        : [...(prev.knowledgeBase || []), item],
    }));
  };

  const filteredAgents = agents
    .filter((a) => {
      const matchesStatus =
        statusFilter === "All Status" ||
        a.status === statusFilter.toLowerCase();
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        a.name.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy.includes("Newest"))
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      if (sortBy.includes("Oldest"))
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      if (sortBy.includes("Name")) return a.name.localeCompare(b.name);
      if (sortBy.includes("Usage")) return b.conversations - a.conversations;
      return 0;
    });

  if (loading) {
    return <AIAgentsLoadingSkeleton />;
  }

  return (
    <main className="p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-secondary mb-2">AI Agents</h2>
          <p className="text-gray-600">
            Manage and configure your AI assistants for enhanced learning
            experiences
          </p>
        </div>
        <div className="flex space-x-3">
          <Button onClick={() => setNewAgentOpen(true)}>
            <Plus className="w-4 h-4 mr-2" /> Create New Agent
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Active Agents</p>
              <p className="text-2xl font-bold text-secondary mt-1">
                {analytics?.activeAgents || 0}
              </p>
              <p className="text-accent text-sm mt-1">
                {agents.filter((a) => a.status === "active").length} total
                active
              </p>
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Bot className="text-primary w-6 h-6" />
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">
                Daily Conversations
              </p>
              <p className="text-2xl font-bold text-secondary mt-1">
                {analytics?.dailyConversations?.toLocaleString() || 0}
              </p>
              <p className="text-accent text-sm mt-1">
                {analytics?.conversationTrend
                  ? `${analytics.conversationTrend > 0 ? "+" : ""}${
                      analytics.conversationTrend
                    }%`
                  : "No change"}
              </p>
            </div>
            <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
              <MessageSquare className="text-accent w-6 h-6" />
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">
                Avg. Response Time
              </p>
              <p className="text-2xl font-bold text-secondary mt-1">
                {analytics?.avgResponseTime?.toFixed(1) || 0}s
              </p>
              <p className="text-accent text-sm mt-1">
                {analytics?.responseTrend
                  ? `${
                      analytics.responseTrend > 0 ? "+" : ""
                    }${analytics.responseTrend.toFixed(1)}s`
                  : "No change"}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="text-yellow-600 w-6 h-6" />
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">
                Satisfaction Rate
              </p>
              <p className="text-2xl font-bold text-secondary mt-1">
                {analytics?.satisfactionRate || 0}%
              </p>
              <p className="text-accent text-sm mt-1">
                {analytics?.satisfactionTrend
                  ? `${analytics.satisfactionTrend > 0 ? "+" : ""}${
                      analytics.satisfactionTrend
                    }%`
                  : "No change"}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Star className="text-purple-600 w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h3 className="text-xl font-semibold text-secondary">
              Your AI Agents
            </h3>
            {selectedAgents.length > 0 && (
              <Badge variant="secondary" className="gap-2">
                {selectedAgents.length} selected
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0"
                  onClick={clearSelection}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {selectedAgents.length > 0 && (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      Bulk Actions
                      <MoreVertical className="w-4 h-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => handleBulkStatusToggle("active")}
                    >
                      <Power className="w-4 h-4 mr-2" />
                      Activate Selected
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleBulkStatusToggle("inactive")}
                    >
                      <Power className="w-4 h-4 mr-2" />
                      Deactivate Selected
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleBulkDelete}
                      className="text-red-600"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Selected
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportAgents}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </>
            )}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="pl-10 w-40">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Status">All Status</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                  <SelectItem value="Training">Training</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="relative">
              <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="pl-10 w-44">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Sort by: Newest">
                    Sort by: Newest
                  </SelectItem>
                  <SelectItem value="Sort by: Oldest">
                    Sort by: Oldest
                  </SelectItem>
                  <SelectItem value="Sort by: Name">Sort by: Name</SelectItem>
                  <SelectItem value="Sort by: Usage">Sort by: Usage</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="flex items-center mb-4">
          <div className="relative w-full">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              id="agent-search"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search agents... (Cmd+K)"
              className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAgents.map((a, index) => {
            const iconStyle = getIconStyles(index);
            const isSelected = selectedAgents.includes(a._id);
            return (
              <div
                key={a._id}
                className={`rounded-xl p-6 shadow-sm border ${
                  isSelected
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-gray-100"
                } bg-card relative`}
              >
                <div className="absolute top-4 left-4">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => toggleAgentSelection(a._id)}
                  />
                </div>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3 ml-8">
                    <div
                      className={`w-12 h-12 ${iconStyle.bg} rounded-lg flex items-center justify-center`}
                    >
                      <Bot className={`${iconStyle.color} w-6 h-6`} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-secondary">{a.name}</h4>
                      <div className="flex items-center mt-1">
                        <span
                          className={`inline-block w-2 h-2 rounded-full mr-2 ${
                            a.status === "active"
                              ? "bg-accent"
                              : a.status === "inactive"
                              ? "bg-red-500"
                              : "bg-yellow-500"
                          }`}
                        />
                        <span className="text-xs text-gray-500 capitalize">
                          {a.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-gray-600"
                      >
                        <EllipsisVertical className="w-5 h-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleTestAgent(a)}>
                        <Logs className="w-4 h-4 mr-2" />
                        Test Agent
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleAdvancedConfig(a)}>
                        <Settings className="w-4 h-4 mr-2" />
                        Advanced Config
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleViewLogs(a)}>
                        <Logs className="w-4 h-4 mr-2" />
                        View Logs
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openEditDialog(a)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Agent
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDuplicate(a._id)}>
                        <Copy className="w-4 h-4 mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => openDeleteDialog(a)}
                        className="text-red-600"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <p className="text-gray-600 text-sm mb-4">{a.description}</p>
                <div className="flex justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="w-4 h-4" />
                    <span>{a.conversations.toLocaleString()} convos</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4" />
                    <span>{a.avgResponseSec.toFixed(1)}s avg</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button className="flex-1" onClick={() => openEditDialog(a)}>
                    <Settings className="w-4 h-4 mr-2" /> Configure
                  </Button>
                  <Button
                    variant="outline"
                    className="border-gray-300"
                    onClick={() => handleToggleStatus(a)}
                    disabled={updating}
                  >
                    {updating ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Power className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            );
          })}
          <button
            className="rounded-xl p-6 shadow-sm border border-dashed border-primary/30 bg-linear-to-br from-primary/5 to-accent/5 flex flex-col items-center justify-center text-center hover:from-primary/10 hover:to-accent/10 transition-all"
            onClick={() => setNewAgentOpen(true)}
          >
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-4">
              <Plus className="text-primary w-8 h-8" />
            </div>
            <h4 className="font-semibold text-secondary mb-2">
              Create New Agent
            </h4>
            <p className="text-gray-600 text-sm">
              Design a custom AI assistant for your needs
            </p>
          </button>
        </div>
      </div>

      <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-secondary">
            Recent Conversations
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportConversations}
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
        {conversations.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No conversations yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Agent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Started
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
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
                {paginatedConversations.map((row) => (
                  <tr
                    key={row._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <img
                          src={row.studentAvatar}
                          alt="Student"
                          className="w-8 h-8 rounded-full"
                        />
                        <span>{row.studentName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {row.agentName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {row.started}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {row.duration}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {row.status === "Completed" ? (
                        <span className="px-2 py-1 bg-accent/10 text-accent rounded-full text-xs">
                          Completed
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-600 rounded-full text-xs">
                          In Progress
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Button
                        variant="ghost"
                        className="text-primary"
                        onClick={() => handleViewConversation(row)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {totalConversationPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <div className="text-sm text-gray-600">
                  Showing {(conversationsPage - 1) * conversationsPerPage + 1}{" "}
                  to{" "}
                  {Math.min(
                    conversationsPage * conversationsPerPage,
                    conversations.length
                  )}{" "}
                  of {conversations.length} conversations
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setConversationsPage((p) => Math.max(1, p - 1))
                    }
                    disabled={conversationsPage === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </Button>
                  <div className="text-sm text-gray-600">
                    Page {conversationsPage} of {totalConversationPages}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setConversationsPage((p) =>
                        Math.min(totalConversationPages, p + 1)
                      )
                    }
                    disabled={conversationsPage === totalConversationPages}
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Agent Dialog */}
      <Dialog open={newAgentOpen} onOpenChange={setNewAgentOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New AI Agent</DialogTitle>
            <DialogDescription>
              Design an assistant tailored to your courses and learners
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="agent-name">
                Agent Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="agent-name"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  if (validationErrors.name) {
                    setValidationErrors({
                      ...validationErrors,
                      name: undefined,
                    });
                  }
                }}
                placeholder="e.g., Math Tutor"
                aria-invalid={!!validationErrors.name}
                aria-describedby={
                  validationErrors.name ? "name-error" : undefined
                }
                className={validationErrors.name ? "border-red-500" : ""}
              />
              {validationErrors.name && (
                <p id="name-error" className="text-sm text-red-500 mt-1">
                  {validationErrors.name}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="agent-desc">
                Description <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="agent-desc"
                value={formData.description}
                onChange={(e) => {
                  setFormData({ ...formData, description: e.target.value });
                  if (validationErrors.description) {
                    setValidationErrors({
                      ...validationErrors,
                      description: undefined,
                    });
                  }
                }}
                rows={3}
                placeholder="Describe what this agent will do..."
                aria-invalid={!!validationErrors.description}
                aria-describedby={
                  validationErrors.description ? "description-error" : undefined
                }
                className={validationErrors.description ? "border-red-500" : ""}
              />
              {validationErrors.description && (
                <p id="description-error" className="text-sm text-red-500 mt-1">
                  {validationErrors.description}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="agent-type">
                Agent Type <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.agentType}
                onValueChange={(value) => {
                  setFormData({ ...formData, agentType: value });
                  if (validationErrors.agentType) {
                    setValidationErrors({
                      ...validationErrors,
                      agentType: undefined,
                    });
                  }
                }}
              >
                <SelectTrigger
                  aria-invalid={!!validationErrors.agentType}
                  className={validationErrors.agentType ? "border-red-500" : ""}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Course Advisor">Course Advisor</SelectItem>
                  <SelectItem value="Study Assistant">
                    Study Assistant
                  </SelectItem>
                  <SelectItem value="Assignment Helper">
                    Assignment Helper
                  </SelectItem>
                  <SelectItem value="Progress Tracker">
                    Progress Tracker
                  </SelectItem>
                  <SelectItem value="Language Tutor">Language Tutor</SelectItem>
                  <SelectItem value="Custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Knowledge Base</Label>
              <div className="space-y-2 mt-2">
                {["Course Materials", "FAQ Database", "Student Handbook"].map(
                  (kb) => (
                    <div key={kb} className="flex items-center">
                      <Checkbox
                        id={kb}
                        checked={formData.knowledgeBase?.includes(kb)}
                        onCheckedChange={() => toggleKnowledgeBase(kb)}
                      />
                      <label htmlFor={kb} className="ml-2 text-sm">
                        {kb}
                      </label>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setNewAgentOpen(false);
                resetForm();
              }}
              disabled={creating}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateAgent} disabled={creating}>
              {creating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Agent"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Agent Dialog */}
      <Dialog open={editAgentOpen} onOpenChange={setEditAgentOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit AI Agent</DialogTitle>
            <DialogDescription>
              Update agent settings and configuration
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-agent-name">Agent Name</Label>
              <Input
                id="edit-agent-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., Math Tutor"
              />
            </div>
            <div>
              <Label htmlFor="edit-agent-desc">Description</Label>
              <Textarea
                id="edit-agent-desc"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
                placeholder="Describe what this agent will do..."
              />
            </div>
            <div>
              <Label htmlFor="edit-agent-type">Agent Type</Label>
              <Select
                value={formData.agentType}
                onValueChange={(value) =>
                  setFormData({ ...formData, agentType: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Course Advisor">Course Advisor</SelectItem>
                  <SelectItem value="Study Assistant">
                    Study Assistant
                  </SelectItem>
                  <SelectItem value="Assignment Helper">
                    Assignment Helper
                  </SelectItem>
                  <SelectItem value="Progress Tracker">
                    Progress Tracker
                  </SelectItem>
                  <SelectItem value="Language Tutor">Language Tutor</SelectItem>
                  <SelectItem value="Custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({ ...formData, status: value as AgentStatus })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="training">Training</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Knowledge Base</Label>
              <div className="space-y-2 mt-2">
                {["Course Materials", "FAQ Database", "Student Handbook"].map(
                  (kb) => (
                    <div key={kb} className="flex items-center">
                      <Checkbox
                        id={`edit-${kb}`}
                        checked={formData.knowledgeBase?.includes(kb)}
                        onCheckedChange={() => toggleKnowledgeBase(kb)}
                      />
                      <label htmlFor={`edit-${kb}`} className="ml-2 text-sm">
                        {kb}
                      </label>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEditAgentOpen(false);
                setSelectedAgent(null);
                resetForm();
              }}
              disabled={updating}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateAgent} disabled={updating}>
              {updating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Agent"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              agent "{selectedAgent?.name}" and remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAgent}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Agent"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* View Conversation Dialog */}
      <Dialog
        open={viewConversationOpen}
        onOpenChange={setViewConversationOpen}
      >
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <DialogTitle className="text-xl">
                  Conversation Details
                </DialogTitle>
                <DialogDescription>
                  View complete conversation history
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {selectedConversation && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Student</p>
                  <div className="flex items-center gap-2">
                    <img
                      src={selectedConversation.studentAvatar}
                      alt="Student"
                      className="w-8 h-8 rounded-full"
                    />
                    <p className="font-medium">
                      {selectedConversation.studentName}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Agent</p>
                  <p className="font-medium">
                    {selectedConversation.agentName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Started</p>
                  <p className="font-medium">{selectedConversation.started}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Duration</p>
                  <p className="font-medium">{selectedConversation.duration}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Status</p>
                  {selectedConversation.status === "Completed" ? (
                    <Badge className="bg-accent/10 text-accent">
                      Completed
                    </Badge>
                  ) : (
                    <Badge className="bg-yellow-100 text-yellow-600">
                      In Progress
                    </Badge>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Conversation History</h4>
                {loadingHistory ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : conversationHistory.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No conversation history available
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {conversationHistory.map((msg: any, idx: number) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-lg ${
                          msg.role === "user"
                            ? "bg-primary/10 ml-8"
                            : "bg-gray-100 mr-8"
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <div className="font-semibold text-sm">
                            {msg.role === "user" ? "User" : "AI Agent"}:
                          </div>
                          <div className="flex-1 text-sm">{msg.content}</div>
                        </div>
                        {msg.timestamp && (
                          <div className="text-xs text-gray-500 mt-1">
                            {new Date(msg.timestamp).toLocaleString()}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* View Agent Logs Dialog */}
      <Dialog open={viewLogsOpen} onOpenChange={setViewLogsOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Logs className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <DialogTitle className="text-xl">Agent Logs</DialogTitle>
                <DialogDescription>
                  View detailed logs and activity for {selectedAgent?.name}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {loadingLogs ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : agentLogs ? (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-3 gap-4 bg-gray-50 rounded-lg p-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Agent Name</p>
                  <p className="font-semibold">
                    {agentLogs.agent?.name || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    Total Conversations
                  </p>
                  <p className="font-semibold">
                    {agentLogs.totalConversations || 0}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Status</p>
                  <Badge
                    className={
                      agentLogs.agent?.status === "active"
                        ? "bg-accent/10 text-accent"
                        : "bg-gray-100 text-gray-600"
                    }
                  >
                    {agentLogs.agent?.status || "N/A"}
                  </Badge>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Recent Activity</h4>
                {agentLogs.logs && agentLogs.logs.length > 0 ? (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {agentLogs.logs.map((log: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-medium">
                              {log.messages?.length || 0} messages
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {log.createdAt
                                ? new Date(log.createdAt).toLocaleString()
                                : "Unknown date"}
                            </p>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {log.status || "Active"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No logs available for this agent
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              Failed to load agent logs
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Test Agent Panel */}
      {agentForTest && (
        <TestAgentPanel
          agent={agentForTest}
          open={testAgentOpen}
          onOpenChange={setTestAgentOpen}
        />
      )}

      {/* Agent Configuration Panel */}
      {agentForConfig && (
        <AgentConfigPanel
          agent={agentForConfig}
          open={configAgentOpen}
          onOpenChange={setConfigAgentOpen}
          onConfigUpdate={() => {
            // Refetch agents to get updated data
            window.location.reload();
          }}
        />
      )}
    </main>
  );
}
