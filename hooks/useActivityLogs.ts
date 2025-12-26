import { useCallback } from 'react';
import { useActivityLogsStore } from '@/store/activityLogsStore';
import { activityLogsService } from '@/services/activity-logs.service';
import type { LogFilters } from '@/types/activity-logs';
import { useToast } from '@/context/ToastContext';

export const useActivityLogs = () => {
    const { push } = useToast();
    const store = useActivityLogsStore();

    // ==================== ACTIVITY LOGS ====================
    const fetchActivityLogs = useCallback(
        async (filters?: LogFilters) => {
            store.setLoadingActivity(true);
            store.setActivityError(null);
            try {
                const response = await activityLogsService.getActivityLogs({
                    ...store.activityFilters,
                    ...filters,
                });
                store.setActivityLogs(response.data, response.pagination);
                if (filters) store.setActivityFilters(filters);
            } catch (error: any) {
                const errorMsg = error?.message || 'Failed to fetch activity logs';
                store.setActivityError(errorMsg);
                push({ message: errorMsg, type: 'error' });
            } finally {
                store.setLoadingActivity(false);
            }
        },
        [store, push],
    );

    const fetchActivityStats = useCallback(async () => {
        store.setLoadingStats(true);
        try {
            const stats = await activityLogsService.getActivityStats();
            store.setActivityStats(stats);
        } catch (error: any) {
            console.error('Failed to fetch activity stats:', error);
        } finally {
            store.setLoadingStats(false);
        }
    }, [store]);

    // ==================== ERROR LOGS ====================
    const fetchErrorLogs = useCallback(
        async (filters?: LogFilters) => {
            store.setLoadingErrors(true);
            store.setErrorLogsError(null);
            try {
                const response = await activityLogsService.getErrorLogs({
                    ...store.errorFilters,
                    ...filters,
                });
                store.setErrorLogs(response.data, response.pagination);
                if (filters) store.setErrorFilters(filters);
            } catch (error: any) {
                const errorMsg = error?.message || 'Failed to fetch error logs';
                store.setErrorLogsError(errorMsg);
                push({ message: errorMsg, type: 'error' });
            } finally {
                store.setLoadingErrors(false);
            }
        },
        [store, push],
    );

    const fetchErrorStats = useCallback(async () => {
        try {
            const stats = await activityLogsService.getErrorStats();
            store.setErrorStats(stats);
        } catch (error: any) {
            console.error('Failed to fetch error stats:', error);
        }
    }, [store]);

    // ==================== AI LOGS ====================
    const fetchAiLogs = useCallback(
        async (filters?: LogFilters) => {
            store.setLoadingAi(true);
            store.setAiError(null);
            try {
                const response = await activityLogsService.getAiLogs({
                    ...store.aiFilters,
                    ...filters,
                });
                store.setAiLogs(response.data, response.pagination);
                if (filters) store.setAiFilters(filters);
            } catch (error: any) {
                const errorMsg = error?.message || 'Failed to fetch AI logs';
                store.setAiError(errorMsg);
                push({ message: errorMsg, type: 'error' });
            } finally {
                store.setLoadingAi(false);
            }
        },
        [store, push],
    );

    const fetchAiStats = useCallback(async () => {
        try {
            const stats = await activityLogsService.getAiStats();
            store.setAiStats(stats);
        } catch (error: any) {
            console.error('Failed to fetch AI stats:', error);
        }
    }, [store]);

    // ==================== CHAT LOGS ====================
    const fetchChatLogs = useCallback(
        async (filters?: LogFilters) => {
            store.setLoadingChat(true);
            store.setChatError(null);
            try {
                const response = await activityLogsService.getChatLogs({
                    ...store.chatFilters,
                    ...filters,
                });
                store.setChatLogs(response.data, response.pagination);
                if (filters) store.setChatFilters(filters);
            } catch (error: any) {
                const errorMsg = error?.message || 'Failed to fetch chat logs';
                store.setChatError(errorMsg);
                push({ message: errorMsg, type: 'error' });
            } finally {
                store.setLoadingChat(false);
            }
        },
        [store, push],
    );

    const fetchChatStats = useCallback(async () => {
        try {
            const stats = await activityLogsService.getChatStats();
            store.setChatStats(stats);
        } catch (error: any) {
            console.error('Failed to fetch chat stats:', error);
        }
    }, [store]);

    // ==================== SYSTEM LOGS ====================
    const fetchSystemLogs = useCallback(
        async (filters?: LogFilters) => {
            store.setLoadingSystem(true);
            store.setSystemError(null);
            try {
                const response = await activityLogsService.getSystemLogs({
                    ...store.systemFilters,
                    ...filters,
                });
                store.setSystemLogs(response.data, response.pagination);
                if (filters) store.setSystemFilters(filters);
            } catch (error: any) {
                const errorMsg = error?.message || 'Failed to fetch system logs';
                store.setSystemError(errorMsg);
                push({ message: errorMsg, type: 'error' });
            } finally {
                store.setLoadingSystem(false);
            }
        },
        [store, push],
    );

    const fetchSystemStats = useCallback(async () => {
        try {
            const stats = await activityLogsService.getSystemStats();
            store.setSystemStats(stats);
        } catch (error: any) {
            console.error('Failed to fetch system stats:', error);
        }
    }, [store]);

    // ==================== EXPORT ====================
    const exportLogs = useCallback(
        async (type: 'activity' | 'error' | 'ai' | 'chat' | 'system') => {
            try {
                push({ message: 'Exporting logs...', type: 'info' });
                let filters: LogFilters = {};

                switch (type) {
                    case 'activity':
                        filters = store.activityFilters;
                        break;
                    case 'error':
                        filters = store.errorFilters;
                        break;
                    case 'ai':
                        filters = store.aiFilters;
                        break;
                    case 'chat':
                        filters = store.chatFilters;
                        break;
                    case 'system':
                        filters = store.systemFilters;
                        break;
                }

                const data = await activityLogsService.exportLogs(type, filters);

                // Create download link
                const url = window.URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `${type}-logs-${new Date().toISOString()}.json`);
                document.body.appendChild(link);
                link.click();
                link.remove();
                window.URL.revokeObjectURL(url);

                push({ message: 'Logs exported successfully', type: 'success' });
            } catch (error: any) {
                push({ message: 'Failed to export logs', type: 'error' });
            }
        },
        [store, push],
    );

    // ==================== REFRESH ALL ====================
    const refreshAllStats = useCallback(async () => {
        await Promise.all([
            fetchActivityStats(),
            fetchErrorStats(),
            fetchAiStats(),
            fetchChatStats(),
            fetchSystemStats(),
        ]);
    }, [fetchActivityStats, fetchErrorStats, fetchAiStats, fetchChatStats, fetchSystemStats]);

    return {
        // State
        activityLogs: store.activityLogs,
        errorLogs: store.errorLogs,
        aiLogs: store.aiLogs,
        chatLogs: store.chatLogs,
        systemLogs: store.systemLogs,

        activityStats: store.activityStats,
        errorStats: store.errorStats,
        aiStats: store.aiStats,
        chatStats: store.chatStats,
        systemStats: store.systemStats,

        activityPagination: store.activityPagination,
        errorPagination: store.errorPagination,
        aiPagination: store.aiPagination,
        chatPagination: store.chatPagination,
        systemPagination: store.systemPagination,

        isLoadingActivity: store.isLoadingActivity,
        isLoadingErrors: store.isLoadingErrors,
        isLoadingAi: store.isLoadingAi,
        isLoadingChat: store.isLoadingChat,
        isLoadingSystem: store.isLoadingSystem,
        isLoadingStats: store.isLoadingStats,

        activityError: store.activityError,
        errorLogsError: store.errorLogsError,
        aiError: store.aiError,
        chatError: store.chatError,
        systemError: store.systemError,

        activityFilters: store.activityFilters,
        errorFilters: store.errorFilters,
        aiFilters: store.aiFilters,
        chatFilters: store.chatFilters,
        systemFilters: store.systemFilters,

        // Actions
        fetchActivityLogs,
        fetchErrorLogs,
        fetchAiLogs,
        fetchChatLogs,
        fetchSystemLogs,

        fetchActivityStats,
        fetchErrorStats,
        fetchAiStats,
        fetchChatStats,
        fetchSystemStats,
        refreshAllStats,

        exportLogs,

        setActivityFilters: store.setActivityFilters,
        setErrorFilters: store.setErrorFilters,
        setAiFilters: store.setAiFilters,
        setChatFilters: store.setChatFilters,
        setSystemFilters: store.setSystemFilters,

        clearFilters: store.clearFilters,
        resetStore: store.resetStore,

        // New actions
        getLogById: async (type: 'activity' | 'error' | 'ai' | 'chat' | 'system', id: string) => {
            try {
                return await activityLogsService.getLogById(type, id);
            } catch (error: any) {
                push({ message: 'Failed to load log details', type: 'error' });
                throw error;
            }
        },
        markErrorAsResolved: async (id: string, solution?: string) => {
            try {
                await activityLogsService.markErrorAsResolved(id, solution);
                push({ message: 'Error marked as resolved', type: 'success' });
                fetchErrorLogs();
            } catch (error: any) {
                push({ message: 'Failed to mark error as resolved', type: 'error' });
            }
        },
        markErrorAsUnresolved: async (id: string) => {
            try {
                await activityLogsService.markErrorAsUnresolved(id);
                push({ message: 'Error marked as unresolved', type: 'success' });
                fetchErrorLogs();
            } catch (error: any) {
                push({ message: 'Failed to mark error as unresolved', type: 'error' });
            }
        },
        bulkMarkErrorsAsResolved: async (ids: string[], solution?: string) => {
            try {
                await activityLogsService.bulkMarkErrorsAsResolved(ids, solution);
                push({ message: `${ids.length} errors marked as resolved`, type: 'success' });
                fetchErrorLogs();
            } catch (error: any) {
                push({ message: 'Failed to resolve errors', type: 'error' });
            }
        },
        deleteLog: async (type: 'activity' | 'error' | 'ai' | 'chat' | 'system', id: string) => {
            try {
                await activityLogsService.deleteLog(type, id);
                push({ message: 'Log deleted successfully', type: 'success' });
                switch (type) {
                    case 'activity':
                        fetchActivityLogs();
                        break;
                    case 'error':
                        fetchErrorLogs();
                        break;
                    case 'ai':
                        fetchAiLogs();
                        break;
                    case 'chat':
                        fetchChatLogs();
                        break;
                    case 'system':
                        fetchSystemLogs();
                        break;
                }
            } catch (error: any) {
                push({ message: 'Failed to delete log', type: 'error' });
            }
        },
        bulkDeleteLogs: async (type: 'activity' | 'error' | 'ai' | 'chat' | 'system', ids: string[]) => {
            try {
                await activityLogsService.bulkDeleteLogs(type, ids);
                push({ message: `${ids.length} logs deleted`, type: 'success' });
                switch (type) {
                    case 'activity':
                        fetchActivityLogs();
                        break;
                    case 'error':
                        fetchErrorLogs();
                        break;
                    case 'ai':
                        fetchAiLogs();
                        break;
                    case 'chat':
                        fetchChatLogs();
                        break;
                    case 'system':
                        fetchSystemLogs();
                        break;
                }
            } catch (error: any) {
                push({ message: 'Failed to delete logs', type: 'error' });
            }
        },
    };
};
