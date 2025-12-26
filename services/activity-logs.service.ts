import axios from '@/lib/axios';
import type {
    ActivityLog,
    ErrorLog,
    AiLog,
    ChatLog,
    SystemLog,
    LogsResponse,
    ActivityStats,
    ErrorStats,
    AiStats,
    ChatStats,
    SystemStats,
    LogFilters,
} from '@/types/activity-logs';

const BASE_URL = '/activity-logs';

export const activityLogsService = {
    // ==================== ACTIVITY LOGS ====================
    async getActivityLogs(filters?: LogFilters): Promise<LogsResponse<ActivityLog>> {
        const res = await axios.get<{ data: LogsResponse<ActivityLog> }>(`${BASE_URL}/activity`, { params: filters as any });
        return res.data.data;
    },

    async getActivityStats(): Promise<ActivityStats> {
        const res = await axios.get<{ data: ActivityStats }>(`${BASE_URL}/activity/stats`);
        return res.data.data;
    },

    // ==================== ERROR LOGS ====================
    async getErrorLogs(filters?: LogFilters): Promise<LogsResponse<ErrorLog>> {
        const res = await axios.get<{ data: LogsResponse<ErrorLog> }>(`${BASE_URL}/errors`, { params: filters as any });
        return res.data.data;
    },

    async getErrorStats(): Promise<ErrorStats> {
        const res = await axios.get<{ data: ErrorStats }>(`${BASE_URL}/errors/stats`);
        return res.data.data;
    },

    // ==================== AI LOGS ====================
    async getAiLogs(filters?: LogFilters): Promise<LogsResponse<AiLog>> {
        const res = await axios.get<{ data: LogsResponse<AiLog> }>(`${BASE_URL}/ai`, { params: filters as any });
        return res.data.data;
    },

    async getAiStats(): Promise<AiStats> {
        const res = await axios.get<{ data: AiStats }>(`${BASE_URL}/ai/stats`);
        return res.data.data;
    },

    // ==================== CHAT LOGS ====================
    async getChatLogs(filters?: LogFilters): Promise<LogsResponse<ChatLog>> {
        const res = await axios.get<{ data: LogsResponse<ChatLog> }>(`${BASE_URL}/chat`, { params: filters as any });
        return res.data.data;
    },

    async getChatStats(): Promise<ChatStats> {
        const res = await axios.get<{ data: ChatStats }>(`${BASE_URL}/chat/stats`);
        return res.data.data;
    },

    // ==================== SYSTEM LOGS ====================
    async getSystemLogs(filters?: LogFilters): Promise<LogsResponse<SystemLog>> {
        const res = await axios.get<{ data: LogsResponse<SystemLog> }>(`${BASE_URL}/system`, { params: filters as any });
        return res.data.data;
    },

    async getSystemStats(): Promise<SystemStats> {
        const res = await axios.get<{ data: SystemStats }>(`${BASE_URL}/system/stats`);
        return res.data.data;
    },

    // ==================== EXPORT ====================
    async exportLogs(type: 'activity' | 'error' | 'ai' | 'chat' | 'system', filters?: LogFilters) {
        const res = await axios.get<{ data: any }>(`${BASE_URL}/export/${type}`, {
            params: filters as any,
        });
        return res.data.data;
    },

    // ==================== LOG ACTIONS ====================
    async getLogById(type: 'activity' | 'error' | 'ai' | 'chat' | 'system', id: string) {
        const res = await axios.get<{ data: any }>(`${BASE_URL}/${type}/${id}`);
        return res.data.data;
    },

    async markErrorAsResolved(id: string, solution?: string) {
        const res = await axios.post<{ data: any }>(`${BASE_URL}/errors/${id}/resolve`, { solution });
        return res.data.data;
    },

    async markErrorAsUnresolved(id: string) {
        const res = await axios.post<{ data: any }>(`${BASE_URL}/errors/${id}/unresolve`);
        return res.data.data;
    },

    async bulkMarkErrorsAsResolved(ids: string[], solution?: string) {
        const res = await axios.post<{ data: any }>(`${BASE_URL}/errors/bulk-resolve`, { ids, solution });
        return res.data.data;
    },

    async deleteLog(type: 'activity' | 'error' | 'ai' | 'chat' | 'system', id: string) {
        const res = await axios.delete<{ data: any }>(`${BASE_URL}/${type}/${id}`);
        return res.data.data;
    },

    async bulkDeleteLogs(type: 'activity' | 'error' | 'ai' | 'chat' | 'system', ids: string[]) {
        const res = await axios.post<{ data: any }>(`${BASE_URL}/${type}/bulk-delete`, { ids });
        return res.data.data;
    },
};
