import axios from '@/lib/axios';
import {
    Integration,
    CreateIntegrationDto,
    UpdateIntegrationDto,
    IntegrationConfigDto,
    IntegrationStats,
    IntegrationQuery,
    IntegrationTestResult,
} from '@/types/integrations';

const BASE_URL = '/integrations';

export const integrationsService = {
    // Get all integrations with optional filters
    async getAll(query?: IntegrationQuery): Promise<Integration[]> {
        const params: Record<string, string> = {};
        if (query?.search) params.search = query.search;
        if (query?.category) params.category = query.category;
        if (query?.status) params.status = query.status;

        const { data } = await axios.get<Integration[]>(BASE_URL, { params });
        return data;
    },

    // Get integration stats
    async getStats(): Promise<IntegrationStats> {
        const { data } = await axios.get<IntegrationStats>(`${BASE_URL}/stats`);
        return data;
    },

    // Get single integration by ID
    async getById(id: string): Promise<Integration> {
        const { data } = await axios.get<Integration>(`${BASE_URL}/${id}`);
        return data;
    },

    // Get integration by slug
    async getBySlug(slug: string): Promise<Integration> {
        const { data } = await axios.get<Integration>(`${BASE_URL}/slug/${slug}`);
        return data;
    },

    // Create new integration
    async create(dto: CreateIntegrationDto): Promise<Integration> {
        const { data } = await axios.post<Integration>(BASE_URL, dto);
        return data;
    },

    // Update integration
    async update(id: string, dto: UpdateIntegrationDto): Promise<Integration> {
        const { data } = await axios.put<Integration>(`${BASE_URL}/${id}`, dto);
        return data;
    },

    // Update integration config
    async updateConfig(
        id: string,
        config: IntegrationConfigDto
    ): Promise<Integration> {
        const { data } = await axios.patch<Integration>(`${BASE_URL}/${id}/config`, config);
        return data;
    },

    // Connect integration
    async connect(id: string): Promise<Integration> {
        const { data } = await axios.post<Integration>(`${BASE_URL}/${id}/connect`);
        return data;
    },

    // Disconnect integration
    async disconnect(id: string): Promise<Integration> {
        const { data } = await axios.post<Integration>(`${BASE_URL}/${id}/disconnect`);
        return data;
    },

    // Test connection
    async testConnection(id: string): Promise<IntegrationTestResult> {
        const { data } = await axios.post<IntegrationTestResult>(`${BASE_URL}/${id}/test`);
        return data;
    },

    // Delete integration
    async delete(id: string): Promise<void> {
        await axios.delete(`${BASE_URL}/${id}`);
    },

    // Seed initial data (admin only)
    async seed(): Promise<void> {
        await axios.post(`${BASE_URL}/seed`);
    },

    // Generate API Key
    async generateApiKey(): Promise<{ apiKey: string }> {
        const { data } = await axios.post<{ apiKey: string }>('/users/api-key');
        return data;
    },

    // Save Webhook Config
    async saveWebhooks(config: { url: string; events: string[] }): Promise<any> {
        const { data } = await axios.post(`${BASE_URL}/webhooks`, config);
        return data;
    },

    // Get Webhook Config
    async getWebhooks(): Promise<{ url: string; events: string[] }> {
        const { data } = await axios.get<{ url: string; events: string[] }>(`${BASE_URL}/webhooks`);
        return data;
    },
};
