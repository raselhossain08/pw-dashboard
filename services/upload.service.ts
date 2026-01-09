import { apiClient } from "@/lib/api-client";

export interface UploadProgress {
    loaded: number;
    total: number;
    percentage: number;
}

export interface UploadOptions {
    type?: "image" | "video" | "raw" | "auto";
    description?: string;
    tags?: string[];
    onProgress?: (progress: UploadProgress) => void;
}

export interface UploadResult {
    id: string;
    url: string;
    publicId: string;
    format: string;
    resourceType: string;
    size: number;
    width?: number;
    height?: number;
    duration?: number;
}

interface UploadApiPayload {
    _id: string;
    url: string;
    publicId: string;
    format: string;
    resourceType: string;
    size: number;
    width?: number;
    height?: number;
    duration?: number;
}

class UploadService {
    async uploadFile(
        file: File,
        options: UploadOptions = {}
    ): Promise<UploadResult> {
        const formData = new FormData();
        formData.append("file", file);

        if (options.type) {
            formData.append("type", options.type);
        }

        if (options.description) {
            formData.append("description", options.description);
        }

        if (options.tags && options.tags.length > 0) {
            options.tags.forEach((tag) => {
                formData.append("tags[]", tag);
            });
        }

        try {
            const response = await apiClient.post<UploadApiPayload>("/uploads/upload", formData, {
                onUploadProgress: (progressEvent) => {
                    if (options.onProgress && progressEvent.total) {
                        const progress: UploadProgress = {
                            loaded: progressEvent.loaded,
                            total: progressEvent.total,
                            percentage: Math.round(
                                (progressEvent.loaded / progressEvent.total) * 100
                            ),
                        };
                        options.onProgress(progress);
                    }
                },
            });

            const responseData: any = response.data;


            // Handle nested response structure: {success: true, data: {...}}
            const data = responseData.data || responseData;

            return {
                id: data._id,
                url: data.url,
                publicId: data.publicId,
                format: data.format,
                resourceType: data.resourceType,
                size: data.size,
                width: data.width,
                height: data.height,
                duration: data.duration,
            };
        } catch (error) {
            console.error("Upload failed:", error);
            throw error;
        }
    }

    async uploadMultiple(
        files: File[],
        options: UploadOptions = {}
    ): Promise<UploadResult[]> {
        const uploadPromises = files.map((file) => this.uploadFile(file, options));
        return Promise.all(uploadPromises);
    }

    async uploadFromUrl(
        url: string,
        options: Omit<UploadOptions, "onProgress"> = {}
    ): Promise<UploadResult> {
        try {
            const { data } = await apiClient.post<UploadApiPayload>("/uploads/upload-from-url", {
                url,
                uploadFileDto: {
                    type: options.type,
                    description: options.description,
                    tags: options.tags,
                },
            });

            return {
                id: data._id,
                url: data.url,
                publicId: data.publicId,
                format: data.format,
                resourceType: data.resourceType,
                size: data.size,
                width: data.width,
                height: data.height,
                duration: data.duration,
            };
        } catch (error) {
            console.error("Upload from URL failed:", error);
            throw error;
        }
    }

    async deleteFile(fileId: string): Promise<void> {
        try {
            await apiClient.delete(`/uploads/${fileId}`);
        } catch (error) {
            console.error("Delete file failed:", error);
            throw error;
        }
    }

    async getUserFiles(params: {
        page?: number;
        limit?: number;
        type?: string;
    } = {}) {
        try {
            const { data } = await apiClient.get("/uploads", { params });
            return data;
        } catch (error) {
            console.error("Failed to fetch user files:", error);
            throw error;
        }
    }

    async getStorageStats() {
        try {
            const { data } = await apiClient.get("/uploads/storage-stats");
            return data;
        } catch (error) {
            console.error("Failed to fetch storage stats:", error);
            throw error;
        }
    }
}

export const uploadService = new UploadService();
export default uploadService;
