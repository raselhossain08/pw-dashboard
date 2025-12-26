import { apiClient } from "@/lib/api-client";

// API Response wrapper
interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
    meta?: {
        timestamp: string;
        path: string;
        method: string;
    };
}

export interface UploadFile {
    _id: string;
    originalName: string;
    fileName: string;
    mimeType: string;
    size: number;
    type: "image" | "video" | "document" | "audio" | "other";
    status: "pending" | "processing" | "completed" | "failed";
    path: string;
    url: string;
    uploadedBy: string;
    description?: string;
    tags: string[];
    metadata?: {
        width?: number;
        height?: number;
        duration?: number;
        format?: string;
    };
    visibility: "public" | "private";
    downloadCount: number;
    associatedEntity?: string;
    entityType?: string;
    createdAt: string;
    updatedAt: string;
}

export interface UploadResponse {
    file: UploadFile;
    message: string;
}

export interface StorageStats {
    byType: Array<{
        _id: string;
        count: number;
        totalSize: number;
    }>;
    total: {
        _id: null;
        totalFiles: number;
        totalSize: number;
    };
}

export interface FileListResponse {
    files: UploadFile[];
    total: number;
    page: number;
    pages: number;
}

export interface BulkDeleteResponse {
    deleted: number;
    failed: number;
    errors: string[];
}

class UploadsService {
    async uploadFile(
        file: File,
        data: {
            type?: string;
            description?: string;
            tags?: string[];
            associatedEntity?: string;
            entityType?: string;
            visibility?: string;
        } = {}
    ): Promise<UploadFile> {
        const formData = new FormData();
        formData.append("file", file);

        if (data.type) formData.append("type", data.type);
        if (data.description) formData.append("description", data.description);
        if (data.tags) formData.append("tags", JSON.stringify(data.tags));
        if (data.associatedEntity) formData.append("associatedEntity", data.associatedEntity);
        if (data.entityType) formData.append("entityType", data.entityType);
        if (data.visibility) formData.append("visibility", data.visibility);

        const response = await apiClient.post<ApiResponse<UploadFile>>("/uploads/upload", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data.data;
    }

    async uploadFromUrl(
        url: string,
        uploadFileDto: {
            type?: string;
            description?: string;
            tags?: string[];
            associatedEntity?: string;
            entityType?: string;
            visibility?: string;
        } = {}
    ): Promise<UploadFile> {
        const response = await apiClient.post<ApiResponse<UploadFile>>("/uploads/upload-from-url", {
            url,
            uploadFileDto,
        });
        return response.data.data;
    }

    async getUserFiles(params: {
        page?: number;
        limit?: number;
        type?: string;
        sort?: string;
    } = {}): Promise<FileListResponse> {
        try {
            const response = await apiClient.get<any>("/uploads", { params });
            console.log('🔧 Raw API Response:', response);
            console.log('🔧 response.data:', response.data);

            // Handle both response formats
            let result: FileListResponse;
            if (response.data.data) {
                // Wrapped format: { success, data: { files, total } }
                result = response.data.data;
            } else if (response.data.files) {
                // Direct format: { files, total }
                result = response.data;
            } else {
                result = { files: [], total: 0, page: 1, pages: 0 };
            }

            console.log('🔧 Final result:', result);
            console.log('🔧 Files count:', result.files?.length);
            return result;
        } catch (error) {
            console.error('❌ Error fetching user files:', error);
            throw error;
        }
    }

    async getStorageStats(): Promise<StorageStats> {
        try {
            const response = await apiClient.get<StorageStats>("/uploads/storage-stats");
            console.log('📊 Raw API Response:', response.data);
            const result = response.data || { byType: [], total: { _id: null, totalFiles: 0, totalSize: 0 } };
            console.log('📊 Final result:', result);
            return result;
        } catch (error) {
            console.error('❌ Error fetching storage stats:', error);
            return { byType: [], total: { _id: null, totalFiles: 0, totalSize: 0 } };
        }
    }

    async getFilesByEntity(entityType: string, entityId: string): Promise<UploadFile[]> {
        const response = await apiClient.get<ApiResponse<UploadFile[]>>(`/uploads/entity/${entityType}/${entityId}`);
        return response.data.data;
    }

    async getFileById(id: string): Promise<UploadFile> {
        const response = await apiClient.get<ApiResponse<UploadFile>>(`/uploads/${id}`);
        return response.data.data;
    }

    async updateFile(
        id: string,
        updateData: {
            description?: string;
            tags?: string[];
            visibility?: string;
        }
    ): Promise<UploadFile> {
        const response = await apiClient.put<ApiResponse<UploadFile>>(`/uploads/${id}`, updateData);
        return response.data.data;
    }

    async deleteFile(id: string): Promise<void> {
        await apiClient.delete(`/uploads/${id}`);
    }

    async bulkDeleteFiles(fileIds: string[]): Promise<BulkDeleteResponse> {
        const response = await apiClient.post<ApiResponse<BulkDeleteResponse>>("/uploads/bulk-delete", { fileIds });
        return response.data.data;
    }

    async searchFiles(params: {
        q: string;
        type?: string;
        limit?: number;
        sort?: string;
        page?: number;
    }): Promise<UploadFile[]> {
        try {
            const response = await apiClient.get<ApiResponse<UploadFile[]>>("/uploads/search/query", { params });
            return response.data.data || [];
        } catch (error) {
            console.error('Error searching files:', error);
            return [];
        }
    }

    async incrementDownloadCount(id: string): Promise<void> {
        await apiClient.post(`/uploads/${id}/download`);
    }

    async bulkDownload(fileIds: string[]): Promise<void> {
        // This will trigger downloads for each file
        for (const id of fileIds) {
            const file = await this.getFileById(id);
            window.open(file.url, "_blank");
        }
    }

    async exportFiles(format: "json" | "csv" = "json"): Promise<void> {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        let token = '';
        try {
            const { cookieService } = await import('@/lib/cookie.service');
            token = cookieService.get('token') || '';
        } catch {
            if (typeof window !== 'undefined') {
                token = localStorage.getItem('token') || '';
            }
        }

        const res = await fetch(`${API_BASE_URL}/uploads/export?format=${format}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!res.ok) {
            throw new Error('Failed to export files');
        }

        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `media-library-export_${new Date().toISOString().split('T')[0]}.${format === 'csv' ? 'csv' : 'json'}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    }

    async duplicateFile(id: string): Promise<UploadFile> {
        const response = await apiClient.post<ApiResponse<UploadFile>>(`/uploads/${id}/duplicate`);
        return response.data.data;
    }

    async bulkUpdateVisibility(fileIds: string[], visibility: "public" | "private"): Promise<void> {
        await apiClient.post<ApiResponse<void>>("/uploads/bulk-update-visibility", {
            fileIds,
            visibility,
        });
    }

    async bulkAddTags(fileIds: string[], tags: string[]): Promise<void> {
        await apiClient.post<ApiResponse<void>>("/uploads/bulk-add-tags", {
            fileIds,
            tags,
        });
    }

    // Helper methods
    getFileIcon(type: string): string {
        const iconMap: Record<string, string> = {
            image: "🖼️",
            video: "🎥",
            document: "📄",
            audio: "🎵",
            other: "📎",
        };
        return iconMap[type] || "📎";
    }

    formatFileSize(bytes: number): string {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
    }

    getFileExtension(filename: string): string {
        return filename.split(".").pop()?.toUpperCase() || "";
    }

    isImage(mimeType: string): boolean {
        return mimeType.startsWith("image/");
    }

    isVideo(mimeType: string): boolean {
        return mimeType.startsWith("video/");
    }

    isDocument(mimeType: string): boolean {
        return mimeType.startsWith("application/") || mimeType.startsWith("text/");
    }
}

export const uploadsService = new UploadsService();
export default uploadsService;
