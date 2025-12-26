"use client";

import { apiClient } from "@/lib/api-client";

export type AgentStatus = "active" | "inactive" | "training";

export type Agent = {
    _id: string;
    name: string;
    description: string;
    status: AgentStatus;
    agentType: string;
    conversations: number;
    avgResponseSec: number;
    iconBg?: string;
    iconColor?: string;
    knowledgeBase: string[];
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
};

export type ConversationRow = {
    _id: string;
    studentName: string;
    studentAvatar: string;
    agentName: string;
    started: string;
    duration: string;
    status: "Completed" | "In Progress";
};

export type AgentAnalytics = {
    activeAgents: number;
    dailyConversations: number;
    avgResponseTime: number;
    satisfactionRate: number;
    conversationTrend: number;
    responseTrend: number;
    satisfactionTrend: number;
};

export type CreateAgentDto = {
    name: string;
    description: string;
    agentType: string;
    knowledgeBase?: string[];
    status?: AgentStatus;
};

export type UpdateAgentDto = Partial<CreateAgentDto>;

export const aiAgentsService = {
    // Get all agents
    getAllAgents() {
        return apiClient.get<Agent[]>("/ai-bot/agents");
    },

    // Get single agent
    getAgent(id: string) {
        return apiClient.get<Agent>(`/ai-bot/agents/${id}`);
    },

    // Create new agent
    createAgent(data: CreateAgentDto) {
        return apiClient.post<Agent>("/ai-bot/agents", data);
    },

    // Update agent
    updateAgent(id: string, data: UpdateAgentDto) {
        return apiClient.patch<Agent>(`/ai-bot/agents/${id}`, data);
    },

    // Delete agent
    deleteAgent(id: string) {
        return apiClient.delete(`/ai-bot/agents/${id}`);
    },

    // Toggle agent status
    toggleAgentStatus(id: string, status: AgentStatus) {
        return apiClient.patch<Agent>(`/ai-bot/agents/${id}/status`, { status });
    },

    // Duplicate agent
    duplicateAgent(id: string) {
        return apiClient.post<Agent>(`/ai-bot/agents/${id}/duplicate`);
    },

    // Get agent analytics
    getAnalytics() {
        return apiClient.get<AgentAnalytics>("/ai-bot/agents/analytics");
    },

    // Get recent conversations
    getConversations(agentId?: string) {
        return apiClient.get<ConversationRow[]>("/ai-bot/agents/conversations", {
            params: agentId ? { agentId } : undefined,
        });
    },

    // Get agent logs
    getAgentLogs(id: string) {
        return apiClient.get(`/ai-bot/agents/${id}/logs`);
    },

    // Get conversation messages by conversation ID
    getConversationMessages(conversationId: string) {
        return apiClient.get(`/ai-bot/conversations/${conversationId}/messages`);
    },

    // Test agent with a message
    testAgent(id: string, message: string, context?: Record<string, unknown>) {
        return apiClient.post(`/ai-bot/agents/${id}/test`, { message, context });
    },

    // Get agent configuration
    getAgentConfig(id: string) {
        return apiClient.get(`/ai-bot/agents/${id}/config`);
    },

    // Update agent configuration
    updateAgentConfig(id: string, config: Record<string, unknown>) {
        return apiClient.put(`/ai-bot/agents/${id}/config`, config);
    },

    // Get per-agent analytics
    getAgentAnalytics(id: string, startDate?: string, endDate?: string) {
        return apiClient.get(`/ai-bot/agents/${id}/analytics`, {
            params: { startDate, endDate },
        });
    },
};
