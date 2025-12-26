"use client";

import { useState, useCallback } from "react";
import { useToast } from "@/context/ToastContext";
import { integrationsService } from "@/services/integrations.service";
import {
    Integration,
    IntegrationStats,
    IntegrationQuery,
    CreateIntegrationDto,
    UpdateIntegrationDto,
    IntegrationConfigDto,
    IntegrationTestResult,
} from "@/types/integrations";

export function useIntegrations() {
    const [integrations, setIntegrations] = useState<Integration[]>([]);
    const [stats, setStats] = useState<IntegrationStats | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingStats, setIsLoadingStats] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const { push } = useToast();

    // Fetch all integrations with optional filters
    const fetchIntegrations = useCallback(
        async (query?: IntegrationQuery) => {
            setIsLoading(true);
            setError(null);
            try {
                const data = await integrationsService.getAll(query);
                setIntegrations(data);
                return data;
            } catch (error: any) {
                const errorMsg =
                    error?.response?.data?.message ||
                    error?.message ||
                    "Failed to fetch integrations";
                setError(errorMsg);
                push({
                    message: errorMsg,
                    type: "error",
                });
                throw error;
            } finally {
                setIsLoading(false);
            }
        },
        [push]
    );

    // Fetch integration stats
    const fetchStats = useCallback(async () => {
        setIsLoadingStats(true);
        try {
            const data = await integrationsService.getStats();
            setStats(data);
            return data;
        } catch (error: any) {
            const errorMsg =
                error?.response?.data?.message ||
                error?.message ||
                "Failed to fetch integration stats";
            push({
                message: errorMsg,
                type: "error",
            });
            throw error;
        } finally {
            setIsLoadingStats(false);
        }
    }, [push]);

    // Get single integration by ID
    const getIntegrationById = useCallback(
        async (id: string) => {
            setActionLoading(id);
            try {
                const data = await integrationsService.getById(id);
                return data;
            } catch (error: any) {
                const errorMsg =
                    error?.response?.data?.message ||
                    error?.message ||
                    "Failed to fetch integration";
                push({
                    message: errorMsg,
                    type: "error",
                });
                throw error;
            } finally {
                setActionLoading(null);
            }
        },
        [push]
    );

    // Create new integration
    const createIntegration = useCallback(
        async (dto: CreateIntegrationDto) => {
            setActionLoading("create");
            try {
                const data = await integrationsService.create(dto);
                push({
                    message: "Integration created successfully",
                    type: "success",
                });
                await fetchIntegrations();
                await fetchStats();
                return data;
            } catch (error: any) {
                const errorMsg =
                    error?.response?.data?.message ||
                    error?.message ||
                    "Failed to create integration";
                push({
                    message: errorMsg,
                    type: "error",
                });
                throw error;
            } finally {
                setActionLoading(null);
            }
        },
        [push, fetchIntegrations, fetchStats]
    );

    // Update integration
    const updateIntegration = useCallback(
        async (id: string, dto: UpdateIntegrationDto) => {
            setActionLoading(id);
            try {
                const data = await integrationsService.update(id, dto);
                push({
                    message: "Integration updated successfully",
                    type: "success",
                });
                await fetchIntegrations();
                await fetchStats();
                return data;
            } catch (error: any) {
                const errorMsg =
                    error?.response?.data?.message ||
                    error?.message ||
                    "Failed to update integration";
                push({
                    message: errorMsg,
                    type: "error",
                });
                throw error;
            } finally {
                setActionLoading(null);
            }
        },
        [push, fetchIntegrations, fetchStats]
    );

    // Update integration configuration
    const updateConfig = useCallback(
        async (id: string, config: IntegrationConfigDto) => {
            setActionLoading(`config-${id}`);
            try {
                const data = await integrationsService.updateConfig(id, config);
                push({
                    message: "Configuration saved successfully",
                    type: "success",
                });
                await fetchIntegrations();
                await fetchStats();
                return data;
            } catch (error: any) {
                const errorMsg =
                    error?.response?.data?.message ||
                    error?.message ||
                    "Failed to save configuration";
                push({
                    message: errorMsg,
                    type: "error",
                });
                throw error;
            } finally {
                setActionLoading(null);
            }
        },
        [push, fetchIntegrations, fetchStats]
    );

    // Connect integration
    const connectIntegration = useCallback(
        async (id: string) => {
            setActionLoading(id);
            try {
                const data = await integrationsService.connect(id);
                push({
                    message: "Integration connected successfully",
                    type: "success",
                });
                await fetchIntegrations();
                await fetchStats();
                return data;
            } catch (error: any) {
                const errorMsg =
                    error?.response?.data?.message ||
                    error?.message ||
                    "Failed to connect integration";
                push({
                    message: errorMsg,
                    type: "error",
                });
                throw error;
            } finally {
                setActionLoading(null);
            }
        },
        [push, fetchIntegrations, fetchStats]
    );

    // Disconnect integration
    const disconnectIntegration = useCallback(
        async (id: string) => {
            setActionLoading(id);
            try {
                const data = await integrationsService.disconnect(id);
                push({
                    message: "Integration disconnected successfully",
                    type: "success",
                });
                await fetchIntegrations();
                await fetchStats();
                return data;
            } catch (error: any) {
                const errorMsg =
                    error?.response?.data?.message ||
                    error?.message ||
                    "Failed to disconnect integration";
                push({
                    message: errorMsg,
                    type: "error",
                });
                throw error;
            } finally {
                setActionLoading(null);
            }
        },
        [push, fetchIntegrations, fetchStats]
    );

    // Test connection
    const testConnection = useCallback(
        async (id: string) => {
            setActionLoading(id);
            try {
                const result = await integrationsService.testConnection(id);
                push({
                    message: result.message,
                    type: result.success ? "success" : "error",
                });
                return result;
            } catch (error: any) {
                const errorMsg =
                    error?.response?.data?.message ||
                    error?.message ||
                    "Connection test failed";
                push({
                    message: errorMsg,
                    type: "error",
                });
                throw error;
            } finally {
                setActionLoading(null);
            }
        },
        [push]
    );

    // Delete integration
    const deleteIntegration = useCallback(
        async (id: string) => {
            setActionLoading(id);
            try {
                await integrationsService.delete(id);
                push({
                    message: "Integration removed successfully",
                    type: "success",
                });
                await fetchIntegrations();
                await fetchStats();
            } catch (error: any) {
                const errorMsg =
                    error?.response?.data?.message ||
                    error?.message ||
                    "Failed to delete integration";
                push({
                    message: errorMsg,
                    type: "error",
                });
                throw error;
            } finally {
                setActionLoading(null);
            }
        },
        [push, fetchIntegrations, fetchStats]
    );

    // Generate API Key
    const generateApiKey = useCallback(async () => {
        setActionLoading("generate-key");
        try {
            const { apiKey } = await integrationsService.generateApiKey();
            push({
                message: "API Key generated successfully",
                type: "success",
            });
            return apiKey;
        } catch (error: any) {
            const errorMsg =
                error?.response?.data?.message ||
                error?.message ||
                "Failed to generate API Key";
            push({
                message: errorMsg,
                type: "error",
            });
            throw error;
        } finally {
            setActionLoading(null);
        }
    }, [push]);

    // Save Webhooks
    const saveWebhooks = useCallback(async (config: { url: string; events: string[] }) => {
        setActionLoading("save-webhooks");
        try {
            await integrationsService.saveWebhooks(config);
            push({
                message: "Webhook configuration saved",
                type: "success",
            });
        } catch (error: any) {
            const errorMsg =
                error?.response?.data?.message ||
                error?.message ||
                "Failed to save webhook configuration";
            push({
                message: errorMsg,
                type: "error",
            });
            throw error;
        } finally {
            setActionLoading(null);
        }
    }, [push]);

    // Get Webhooks
    const getWebhooks = useCallback(async () => {
        try {
            return await integrationsService.getWebhooks();
        } catch (error: any) {
            console.error("Failed to fetch webhooks:", error);
            return { url: "", events: [] };
        }
    }, []);

    // Refresh all data
    const refreshAll = useCallback(async () => {
        await Promise.all([fetchIntegrations(), fetchStats()]);
    }, [fetchIntegrations, fetchStats]);

    return {
        // Data
        integrations,
        stats,

        // Loading states
        isLoading,
        isLoadingStats,
        actionLoading,
        error,

        // Actions
        fetchIntegrations,
        fetchStats,
        getIntegrationById,
        createIntegration,
        updateIntegration,
        updateConfig,
        connectIntegration,
        disconnectIntegration,
        testConnection,
        deleteIntegration,
        generateApiKey,
        saveWebhooks,
        getWebhooks,
        refreshAll,
    };
}
