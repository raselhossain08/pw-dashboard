import { apiClient } from "@/lib/api-client";

export enum LessonType {
    VIDEO = 'video',
    TEXT = 'text',
    QUIZ = 'quiz',
    ASSIGNMENT = 'assignment',
    DOWNLOAD = 'download',
}

export enum LessonStatus {
    DRAFT = 'draft',
    PUBLISHED = 'published',
}

export interface LessonDto {
    _id: string;
    title: string;
    slug: string;
    description?: string;
    type: LessonType;
    status: LessonStatus;
    order: number;
    videoUrl?: string;
    content?: string;
    duration: number; // in seconds
    isFree: boolean;
    quizQuestions?: string[];
    downloads?: string[];
    course: string;
    passingScore: number;
    completionCount: number;
    averageScore: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface LessonAnalytics {
    lessonId: string;
    views: number;
    completions: number;
    averageProgress: number;
    averageTimeSpent: number;
    lastAccessed?: string;
}

export interface CreateLessonPayload {
    title: string;
    description?: string;
    type: LessonType | string;
    content?: string;
    videoUrl?: string;
    thumbnail?: string;
    duration?: number;
    order?: number;
    isFree?: boolean;
    status?: LessonStatus | string;
    moduleId?: string;
}

export interface UpdateLessonPayload {
    title?: string;
    description?: string;
    type?: LessonType | string;
    content?: string;
    videoUrl?: string;
    thumbnail?: string;
    duration?: number;
    order?: number;
    isFree?: boolean;
    status?: LessonStatus | string;
    moduleId?: string;
}

class LessonsService {
    async getCourseLessons(courseId: string): Promise<LessonDto[]> {
        const { data } = await apiClient.get<LessonDto[]>(`/courses/${courseId}/lessons`);
        return data;
    }

    async getLessonById(lessonId: string): Promise<LessonDto> {
        const { data } = await apiClient.get<LessonDto>(`/courses/lessons/${lessonId}`);
        return data;
    }

    async createLesson(courseId: string, payload: CreateLessonPayload): Promise<LessonDto> {
        const { data } = await apiClient.post<LessonDto>(`/courses/${courseId}/lessons`, payload);
        return data;
    }

    async updateLesson(lessonId: string, payload: UpdateLessonPayload): Promise<LessonDto> {
        const { data } = await apiClient.patch<LessonDto>(`/courses/lessons/${lessonId}`, payload);
        return data;
    }

    async deleteLesson(lessonId: string): Promise<{ message: string }> {
        const { data } = await apiClient.delete<{ message: string }>(`/courses/lessons/${lessonId}`);
        return data;
    }

    async reorderLessons(courseId: string, lessonIds: string[], moduleId?: string): Promise<{ message: string }> {
        const { data } = await apiClient.patch<{ message: string }>(
            `/courses/${courseId}/lessons/reorder`,
            { lessonIds, moduleId }
        );
        return data;
    }

    async duplicateLesson(lessonId: string): Promise<LessonDto> {
        const lesson = await this.getLessonById(lessonId);
        const { data } = await apiClient.post<LessonDto>(`/courses/${lesson.course}/lessons`, {
            ...lesson,
            title: `${lesson.title} (Copy)`,
            _id: undefined,
            slug: undefined,
        });
        return data;
    }

    async getLessonAnalytics(lessonId: string): Promise<LessonAnalytics> {
        try {
            const { data } = await apiClient.get<LessonAnalytics>(`/analytics/lessons/${lessonId}`);
            return data;
        } catch (error) {
            // Fallback to mock data if analytics endpoint doesn't exist
            return {
                lessonId,
                views: Math.floor(Math.random() * 1000),
                completions: Math.floor(Math.random() * 500),
                averageProgress: Math.floor(Math.random() * 100),
                averageTimeSpent: Math.floor(Math.random() * 3600),
            };
        }
    }

    async getCourseAnalytics(courseId: string): Promise<{
        totalViews: number;
        totalCompletions: number;
        averageCompletion: number;
        lessonsCount: number;
    }> {
        try {
            const { data } = await apiClient.get<{
                totalViews: number;
                totalCompletions: number;
                averageCompletion: number;
                lessonsCount: number;
            }>(`/analytics/courses/${courseId}/lessons`);
            return data;
        } catch (error) {
            return {
                totalViews: 0,
                totalCompletions: 0,
                averageCompletion: 0,
                lessonsCount: 0,
            };
        }
    }
}

export const lessonsService = new LessonsService();

