import axios from '@/lib/axios'
import type { AboutSection, CreateAboutSectionDto, UpdateAboutSectionDto } from '@/lib/types/about-section'
import { transformApiResponse } from '@/lib/api-utils'

/**
 * API Response wrapper interface
 */
interface ApiResponse<T> {
    success: boolean;
    message: string;
    data?: T;
    meta?: {
        timestamp?: string;
        version?: string;
        [key: string]: any;
    };
    error?: string;
}

/**
 * Retry configuration
 */
const RETRY_CONFIG = {
    maxRetries: 3,
    baseDelay: 1000, // 1 second
    maxDelay: 10000, // 10 seconds
    retryableStatuses: [408, 429, 500, 502, 503, 504],
};

/**
 * Exponential backoff delay calculation
 */
const calculateBackoffDelay = (attempt: number): number => {
    const delay = Math.min(
        RETRY_CONFIG.baseDelay * Math.pow(2, attempt),
        RETRY_CONFIG.maxDelay
    );
    // Add jitter to prevent thundering herd
    return delay + Math.random() * 1000;
};

/**
 * Retry wrapper for API calls with exponential backoff
 */
const withRetry = async <T>(
    fn: () => Promise<T>,
    retries: number = RETRY_CONFIG.maxRetries
): Promise<T> => {
    let lastError: Error;

    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            return await fn();
        } catch (error: any) {
            lastError = error;

            // Check if error is retryable
            const isRetryable =
                error?.response?.status &&
                RETRY_CONFIG.retryableStatuses.includes(error.response.status);

            // Don't retry on last attempt or non-retryable errors
            if (attempt === retries || !isRetryable) {
                break;
            }

            // Wait before retry with exponential backoff
            const delay = calculateBackoffDelay(attempt);
            console.warn(`Request failed (attempt ${attempt + 1}/${retries + 1}). Retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }

    throw lastError!;
};

export const aboutSectionService = {
    /**
     * Get about section data
     * Implements retry logic for network failures
     */
    async getAboutSection(): Promise<AboutSection> {
        return withRetry(async () => {
            const res = await axios.get<ApiResponse<AboutSection>>('/cms/home/about-section');
            return transformApiResponse<AboutSection>(res, ['isActive']);
        });
    },

    /**
     * Update about section data
     * Implements retry logic and validation
     */
    async updateAboutSection(data: UpdateAboutSectionDto): Promise<AboutSection> {
        if (!data || Object.keys(data).length === 0) {
            throw new Error('Update data cannot be empty');
        }

        return withRetry(async () => {
            const res = await axios.put<ApiResponse<AboutSection>>(
                '/cms/home/about-section',
                data,
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );
            return transformApiResponse<AboutSection>(res, ['isActive']);
        });
    },

    /**
     * Update about section with media upload
     * Includes progress tracking and comprehensive error handling
     */
    async updateAboutSectionWithMedia(
        formData: FormData,
        onUploadProgress?: (progress: number) => void
    ): Promise<ApiResponse<AboutSection>> {
        try {
            // Validate formData
            if (!formData || !(formData instanceof FormData)) {
                throw new Error('Invalid FormData provided');
            }

            const res = await axios.put<ApiResponse<AboutSection>>(
                '/cms/home/about-section/upload',
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    onUploadProgress: (progressEvent: { loaded: number; total?: number }) => {
                        if (progressEvent.total) {
                            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                            onUploadProgress?.(progress);
                        }
                    },
                    timeout: 120000,
                }
            );

            return {
                success: true,
                message: res.data?.message || 'Upload successful',
                data: transformApiResponse<AboutSection>(res),
                meta: res.data?.meta
            };
        } catch (error: any) {
            console.error('Upload failed:', error);

            // Provide user-friendly error messages
            let errorMessage = 'Failed to upload media';
            if (error.code === 'ECONNABORTED') {
                errorMessage = 'Upload timed out. Please try again with a smaller file.';
            } else if (error.response?.status === 413) {
                errorMessage = 'File size too large. Maximum size is 10MB.';
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.message) {
                errorMessage = error.message;
            }

            throw new Error(errorMessage);
        }
    },

    /**
     * Toggle active status
     * Implements retry logic
     */
    async toggleActive(): Promise<AboutSection> {
        return withRetry(async () => {
            const res = await axios.post<ApiResponse<AboutSection>>(
                '/cms/home/about-section/toggle-active'
            );
            return transformApiResponse<AboutSection>(res, ['isActive']);
        });
    },

    /**
     * Duplicate about section
     * Implements retry logic
     */
    async duplicateAboutSection(): Promise<AboutSection> {
        return withRetry(async () => {
            const res = await axios.post<ApiResponse<AboutSection>>(
                '/cms/home/about-section/duplicate'
            );
            return transformApiResponse<AboutSection>(res, ['isActive']);
        });
    },

    /**
     * Export about section
     * Handles file download with proper error handling
     */
    async exportAboutSection(format: "json" | "pdf"): Promise<void> {
        try {
            // Validate format
            if (!['json', 'pdf'].includes(format)) {
                throw new Error('Invalid export format. Use "json" or "pdf"');
            }

            const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

            // Get token from cookies
            let token = '';
            try {
                const { cookieService } = await import('@/lib/cookie.service');
                token = cookieService.get('token') || '';
            } catch {
                // Fallback to localStorage if cookie service not available
                if (typeof window !== 'undefined') {
                    token = localStorage.getItem('token') || '';
                }
            }

            if (!token) {
                throw new Error('Authentication required. Please login to export.');
            }

            const res = await fetch(`${API_BASE_URL}/cms/home/about-section/export?format=${format}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(
                    errorData.message ||
                    `Failed to export about section (${res.status}: ${res.statusText})`
                );
            }

            // Get filename from header or generate default
            const contentDisposition = res.headers.get('Content-Disposition');
            let filename = `about-section-export_${new Date().toISOString().split('T')[0]}.${format === 'pdf' ? 'pdf' : 'json'}`;

            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
                if (filenameMatch) {
                    filename = filenameMatch[1];
                }
            }

            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();

            // Cleanup
            setTimeout(() => {
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
            }, 100);
        } catch (error: any) {
            console.error('Export failed:', error);
            throw new Error(error.message || 'Failed to export about section');
        }
    },
}
