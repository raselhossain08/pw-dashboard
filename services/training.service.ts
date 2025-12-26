import { apiClient } from "@/lib/api-client";

// Course Sequence in Training Program
export interface CourseSequence {
    course: string;
    order: number;
    isOptional: boolean;
    prerequisites: string[];
}

// Training Program - Complete learning path with course sequences
export interface TrainingProgram {
    _id: string;
    title: string;
    description: string;
    instructor: {
        _id: string;
        firstName?: string;
        lastName?: string;
        email?: string;
        avatar?: string;
    } | string;
    courses: CourseSequence[];
    duration: number;
    level: "beginner" | "intermediate" | "advanced";
    thumbnail?: string;
    tags: string[];
    isPublished: boolean;
    completionCertificate: boolean;
    maxEnrollments?: number;
    startDate?: Date;
    endDate?: Date;
    price: number;
    discountPrice?: number;
    createdAt: string;
    updatedAt: string;
}

// Program Enrollment with Progress Tracking
export interface ProgramEnrollment {
    _id: string;
    program: string | TrainingProgram;
    student: string | {
        _id: string;
        firstName?: string;
        lastName?: string;
        email?: string;
        avatar?: string;
    };
    enrolledAt: Date;
    status: "active" | "completed" | "dropped";
    progress: {
        course: string;
        completedAt?: Date;
        score?: number;
    }[];
    completedAt?: Date;
    certificateIssued: boolean;
}

// Program Statistics
export interface ProgramStats {
    totalEnrollments: number;
    activeEnrollments: number;
    completedEnrollments: number;
    averageProgress: number;
    completionRate: number;
}

export interface CreateTrainingProgramDto {
    title: string;
    description: string;
    instructor: string;
    courses: CourseSequence[];
    level: "beginner" | "intermediate" | "advanced";
    thumbnail?: string;
    tags?: string[];
    isPublished?: boolean;
    completionCertificate?: boolean;
    maxEnrollments?: number;
    startDate?: Date;
    endDate?: Date;
    price: number;
    discountPrice?: number;
}

export type UpdateTrainingProgramDto = Partial<CreateTrainingProgramDto>;

class TrainingService {
    /**
     * Get all training programs with filters
     */
    async getAllPrograms(params: {
        page?: number;
        limit?: number;
        search?: string;
        level?: string;
        instructor?: string;
        isPublished?: boolean;
    } = {}) {
        try {
            const { data } = await apiClient.get("/training-programs", { params });
            return data;
        } catch (error) {
            console.error("Failed to fetch training programs:", error);
            throw error;
        }
    }

    /**
     * Get a single training program by ID
     */
    async getProgramById(id: string) {
        try {
            const { data } = await apiClient.get(`/training-programs/${id}`);
            return data;
        } catch (error) {
            console.error(`Failed to fetch training program ${id}:`, error);
            throw error;
        }
    }

    /**
     * Create a new training program
     */
    async createProgram(programData: CreateTrainingProgramDto) {
        try {
            const { data } = await apiClient.post("/training-programs", programData);
            return data;
        } catch (error) {
            console.error("Failed to create training program:", error);
            throw error;
        }
    }

    /**
     * Update an existing training program
     */
    async updateProgram(id: string, updates: UpdateTrainingProgramDto) {
        try {
            const { data } = await apiClient.patch(`/training-programs/${id}`, updates);
            return data;
        } catch (error) {
            console.error(`Failed to update training program ${id}:`, error);
            throw error;
        }
    }

    /**
     * Delete a training program
     */
    async deleteProgram(id: string) {
        try {
            const { data } = await apiClient.delete(`/training-programs/${id}`);
            return data;
        } catch (error) {
            console.error(`Failed to delete training program ${id}:`, error);
            throw error;
        }
    }

    /**
     * Publish a training program
     */
    async publishProgram(id: string) {
        try {
            const { data } = await apiClient.patch(`/training-programs/${id}/publish`);
            return data;
        } catch (error) {
            console.error(`Failed to publish training program ${id}:`, error);
            throw error;
        }
    }

    /**
     * Unpublish a training program
     */
    async unpublishProgram(id: string) {
        try {
            const { data } = await apiClient.patch(`/training-programs/${id}/unpublish`);
            return data;
        } catch (error) {
            console.error(`Failed to unpublish training program ${id}:`, error);
            throw error;
        }
    }

    /**
     * Duplicate a training program
     */
    async duplicateProgram(id: string) {
        try {
            const { data } = await apiClient.post(`/training-programs/${id}/duplicate`);
            return data;
        } catch (error) {
            console.error(`Failed to duplicate training program ${id}:`, error);
            throw error;
        }
    }

    /**
     * Toggle program status (publish/unpublish)
     */
    async toggleStatus(id: string) {
        try {
            const { data } = await apiClient.patch(`/training-programs/${id}/toggle-status`);
            return data;
        } catch (error) {
            console.error(`Failed to toggle program status ${id}:`, error);
            throw error;
        }
    }

    /**
     * Enroll a student in a training program
     */
    async enrollStudent(programId: string, studentId: string) {
        try {
            const { data } = await apiClient.post(`/training-programs/${programId}/enroll`, {
                studentId,
            });
            return data;
        } catch (error) {
            console.error(`Failed to enroll student in program ${programId}:`, error);
            throw error;
        }
    }

    /**
     * Get enrollments for a program
     */
    async getProgramEnrollments(programId: string, params: {
        status?: string;
        page?: number;
        limit?: number;
    } = {}): Promise<{ data: ProgramEnrollment[]; total: number }> {
        try {
            const { data } = await apiClient.get(
                `/training-programs/${programId}/enrollments`,
                { params }
            );
            return data as { data: ProgramEnrollment[]; total: number };
        } catch (error) {
            console.error(`Failed to fetch enrollments for program ${programId}:`, error);
            throw error;
        }
    }

    /**
     * Get student's enrollments
     */
    async getStudentEnrollments(studentId: string) {
        try {
            const { data } = await apiClient.get(
                `/training-programs/student/${studentId}/enrollments`
            );
            return data;
        } catch (error) {
            console.error(`Failed to fetch student enrollments:`, error);
            throw error;
        }
    }

    /**
     * Update student progress in a course
     */
    async updateProgress(
        programId: string,
        studentId: string,
        courseId: string,
        progressData: { score?: number }
    ) {
        try {
            const { data } = await apiClient.post(
                `/training-programs/${programId}/progress`,
                {
                    studentId,
                    courseId,
                    ...progressData,
                }
            );
            return data;
        } catch (error) {
            console.error(`Failed to update progress:`, error);
            throw error;
        }
    }

    /**
     * Get student progress in a program
     */
    async getStudentProgress(programId: string, studentId: string): Promise<ProgramEnrollment> {
        try {
            const { data } = await apiClient.get(
                `/training-programs/${programId}/progress/${studentId}`
            );
            return data as ProgramEnrollment;
        } catch (error) {
            console.error(`Failed to fetch student progress:`, error);
            throw error;
        }
    }

    /**
     * Get program statistics
     */
    async getProgramStats(programId: string): Promise<ProgramStats> {
        try {
            const { data } = await apiClient.get(`/training-programs/${programId}/stats`);
            return data as ProgramStats;
        } catch (error) {
            console.error(`Failed to fetch program stats:`, error);
            throw error;
        }
    }

    /**
     * Bulk delete programs
     */
    async bulkDelete(ids: string[]) {
        try {
            const { data } = await apiClient.post("/training-programs/bulk-delete", { ids });
            return data;
        } catch (error) {
            console.error("Failed to bulk delete programs:", error);
            throw error;
        }
    }

    /**
     * Upload thumbnail
     */
    async uploadThumbnail(file: File): Promise<string> {
        try {
            const formData = new FormData();
            formData.append("file", file);
            const { data } = await apiClient.post("/upload/thumbnail", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            return (data as any).url;
        } catch (error) {
            console.error("Failed to upload thumbnail:", error);
            throw error;
        }
    }
}

export const trainingService = new TrainingService();
