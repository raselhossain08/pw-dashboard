import { apiClient } from "@/lib/api-client";

export interface Enrollment {
    _id: string;
    student: {
        _id: string;
        name: string;
        email: string;
        avatar?: string;
        firstName?: string;
        lastName?: string;
    };
    course: {
        _id: string;
        title: string;
        description?: string;
        thumbnail?: string;
        instructor?: {
            _id: string;
            name: string;
        };
    };
    status: "active" | "completed" | "expired" | "cancelled" | "pending" | "dropped";
    progress: number;
    completedLessons: Record<string, boolean>;
    lessonProgress: Record<string, number>;
    lastAccessedLessons: Record<string, Date>;
    order?: string;
    totalTimeSpent: number;
    lastAccessedAt?: Date;
    completedAt?: Date;
    expiresAt?: Date;
    certificate?: string;
    quizzesPassed: number;
    assignmentsCompleted: number;
    notes: string[];
    createdAt: string;
    updatedAt: string;
}

export interface CreateEnrollmentDto {
    studentId: string;
    courseId: string;
    orderId?: string;
    status?: "active" | "pending";
}

export interface UpdateEnrollmentDto {
    status?: "active" | "completed" | "expired" | "cancelled" | "pending" | "dropped";
    progress?: number;
    notes?: string[];
}

export interface UpdateProgressDto {
    lessonId: string;
    progress?: number;
    completed?: boolean;
    timeSpent?: number;
}

export interface EnrollmentStats {
    totalEnrollments: number;
    activeEnrollments: number;
    completedEnrollments: number;
    pendingEnrollments: number;
    droppedEnrollments: number;
    averageProgress: number;
    totalTimeSpent: number;
    completionRate: number;
}

export interface EnrollmentTrendPoint {
    date: string;
    enrollments: number;
    completions: number;
    cancellations: number;
}

export interface CourseEnrollmentDistribution {
    courseId: string;
    courseName: string;
    enrollmentCount: number;
    percentage: number;
}

export interface EnrollmentsResponse {
    enrollments: Enrollment[];
    total: number;
    stats?: EnrollmentStats;
}

class EnrollmentsService {
    // Admin - Get all enrollments with filters
    async getAllEnrollments(params: {
        page?: number;
        limit?: number;
        search?: string;
        courseId?: string;
        status?: string;
        instructorId?: string;
        sortBy?: string;
        sortOrder?: "asc" | "desc";
    } = {}): Promise<EnrollmentsResponse> {
        const response = await apiClient.get<EnrollmentsResponse>("/enrollments/admin/all", { params });
        return response.data;
    }

    // Admin - Get enrollment statistics
    async getEnrollmentStats(): Promise<EnrollmentStats> {
        const response = await apiClient.get<EnrollmentStats>("/enrollments/admin/stats");
        return response.data;
    }

    // Admin - Get course enrollment distribution
    async getCourseDistribution(): Promise<CourseEnrollmentDistribution[]> {
        const response = await apiClient.get<CourseEnrollmentDistribution[]>("/enrollments/admin/distribution");
        return response.data;
    }

    async getAdminTrends(
        range: "7d" | "30d" | "90d" | "year" = "30d"
    ): Promise<EnrollmentTrendPoint[]> {
        const response = await apiClient.get<EnrollmentTrendPoint[]>("/enrollments/admin/trends", {
            params: { range },
        });
        return response.data;
    }

    // Admin - Get enrollment by ID
    async getEnrollmentById(id: string): Promise<Enrollment> {
        const response = await apiClient.get<Enrollment>(`/enrollments/admin/${id}`);
        return response.data;
    }

    // Admin - Create enrollment
    async createEnrollment(data: CreateEnrollmentDto): Promise<Enrollment> {
        const response = await apiClient.post<Enrollment>("/enrollments/admin", data);
        return response.data;
    }

    // Admin - Update enrollment
    async updateEnrollment(id: string, data: UpdateEnrollmentDto): Promise<Enrollment> {
        const response = await apiClient.patch<Enrollment>(`/enrollments/admin/${id}`, data);
        return response.data;
    }

    // Admin - Delete enrollment
    async deleteEnrollment(id: string): Promise<void> {
        await apiClient.delete(`/enrollments/admin/${id}`);
    }

    // Admin - Bulk delete enrollments
    async bulkDeleteEnrollments(ids: string[]): Promise<void> {
        await apiClient.post("/enrollments/admin/bulk-delete", { ids });
    }

    // Admin - Approve pending enrollment
    async approveEnrollment(id: string): Promise<Enrollment> {
        const response = await apiClient.patch<Enrollment>(`/enrollments/admin/${id}/approve`);
        return response.data;
    }

    // Admin - Cancel enrollment
    async cancelEnrollment(id: string, reason?: string): Promise<Enrollment> {
        const response = await apiClient.patch<Enrollment>(`/enrollments/admin/${id}/cancel`, { reason });
        return response.data;
    }

    // Admin - Export enrollments data
    async exportEnrollments(params: {
        format?: "csv" | "xlsx" | "pdf";
        courseId?: string;
        status?: string;
    } = {}): Promise<Blob> {
        const response = await apiClient.get<Blob>("/enrollments/admin/export", {
            params,
            responseType: "blob",
        });
        return response.data;
    }

    // Get course enrollments (for instructors)
    async getCourseEnrollments(
        courseId: string,
        page: number = 1,
        limit: number = 10
    ): Promise<EnrollmentsResponse> {
        const response = await apiClient.get<EnrollmentsResponse>(`/enrollments/course/${courseId}/students`, {
            params: { page, limit },
        });
        return response.data;
    }

    // Get course enrollment stats
    async getCourseStats(courseId: string): Promise<EnrollmentStats> {
        const response = await apiClient.get<EnrollmentStats>(`/enrollments/course/${courseId}/stats`);
        return response.data;
    }

    // User enrollments
    async getMyEnrollments(params: {
        status?: string;
        page?: number;
        limit?: number;
    } = {}): Promise<EnrollmentsResponse> {
        const response = await apiClient.get<EnrollmentsResponse>("/enrollments/my-enrollments", { params });
        return response.data;
    }

    // Enroll in a course
    async enroll(courseId: string, orderId?: string): Promise<Enrollment> {
        const response = await apiClient.post<Enrollment>("/enrollments", {
            courseId,
            orderId,
        });
        return response.data;
    }

    // Update progress
    async updateProgress(
        courseId: string,
        data: UpdateProgressDto
    ): Promise<Enrollment> {
        const response = await apiClient.patch<Enrollment>(
            `/enrollments/course/${courseId}/progress`,
            data
        );
        return response.data;
    }

    // Check enrollment
    async checkEnrollment(courseId: string): Promise<{ enrolled: boolean }> {
        const response = await apiClient.get<{ enrolled: boolean }>(
            `/enrollments/course/${courseId}/check`
        );
        return response.data;
    }

    // Unenroll
    async unenroll(courseId: string): Promise<void> {
        await apiClient.delete(`/enrollments/course/${courseId}`);
    }

    // Get user stats
    async getMyStats(): Promise<any> {
        const response = await apiClient.get<any>("/enrollments/my-stats");
        return response.data;
    }
}

export const enrollmentsService = new EnrollmentsService();
