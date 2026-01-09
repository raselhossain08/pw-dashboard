import { apiClient } from "@/lib/api-client";

export interface Course {
    id?: string; // Added for frontend convenience
    _id: string;
    title: string;
    slug: string;
    description: string;
    excerpt?: string;
    content?: string;
    thumbnail?: string;
    instructor: {
        _id: string;
        firstName?: string;
        lastName?: string;
        email?: string;
        avatar?: string;
        name?: string;
    } | string;
    instructors?: Array<{
        _id: string;
        firstName?: string;
        lastName?: string;
        email?: string;
        avatar?: string;
        name?: string;
    } | string>;
    categories?: string[];
    level: "beginner" | "intermediate" | "advanced" | "expert";
    type: "theoretical" | "practical" | "simulator" | "combined";
    price: number;
    originalPrice?: number; // For discount pricing
    discountPercentage?: number; // Calculated discount
    duration?: number;
    durationHours?: number;
    maxStudents?: number;
    studentCount?: number;
    enrollmentCount?: number; // Added for sales progress tracking
    rating?: number;
    reviewCount?: number;
    totalRatings?: number; // Added for ratings display
    completionRate?: number;
    isPublished?: boolean;
    isFeatured?: boolean;
    status?: "published" | "draft" | "archived";
    tags?: string[];
    prerequisites?: string[];
    learningObjectives?: string[];
    videoUrl?: string;
    language?: string;
    certificateAvailable?: boolean;
    providesCertificate?: boolean; // Added new field
    moneyBackGuarantee?: number; // Added new field (days)
    totalRevenue?: number; // Total revenue generated
    totalEnrollments?: number; // Total enrollments
    aircraftTypes?: string[]; // Aviation specific
    metadata?: {
        faaApproved?: boolean;
        simulatorHours?: number;
        flightHours?: number;
        writtenExam?: boolean;
        practicalExam?: boolean;
    };
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateCourseDto {
    title: string;
    slug?: string;
    description: string;
    excerpt?: string;
    content?: string;
    level: "beginner" | "intermediate" | "advanced" | "expert";
    type: "theoretical" | "practical" | "simulator" | "combined";
    price: number;
    originalPrice?: number; // For discount pricing
    duration?: number;
    durationHours?: number;
    maxStudents: number;
    thumbnail?: string;
    isPublished?: boolean;
    isFeatured?: boolean;
    tags?: string[];
    categories?: string[];
    prerequisites?: string[];
    learningObjectives?: string[];
    outcomes?: string[]; // What students will get
    instructor?: string;
    instructors?: string[]; // Multiple instructors
    videoUrl?: string;
    language?: string;
    certificateAvailable?: boolean;
    providesCertificate?: boolean; // Added new field
    moneyBackGuarantee?: number; // Added new field (days)
    difficultyLevel?: string;
    aircraftTypes?: string[];
    metadata?: {
        faaApproved?: boolean;
        simulatorHours?: number;
        flightHours?: number;
        writtenExam?: boolean;
        practicalExam?: boolean;
    };
}

export type UpdateCourseDto = Partial<CreateCourseDto>

class CoursesService {
    async getAllCourses(params: {
        page?: number;
        limit?: number;
        search?: string;
        category?: string;
        level?: string;
        isPublished?: boolean;
    } = {}) {
        try {
            const { data } = await apiClient.get("/courses", { params });
            return data;
        } catch (error) {
            console.error("Failed to fetch courses:", error);
            throw error;
        }
    }

    async getCourseById(id: string) {
        try {
            const { data } = await apiClient.get(`/courses/${id}`);
            return data;
        } catch (error) {
            console.error(`Failed to fetch course ${id}:`, error);
            throw error;
        }
    }

    async createCourse(courseData: CreateCourseDto) {
        try {
            const { data } = await apiClient.post("/courses", courseData);
            return data;
        } catch (error) {
            console.error("Failed to create course:", error);
            throw error;
        }
    }

    async updateCourse(id: string, courseData: UpdateCourseDto) {
        try {
            const { data } = await apiClient.put(`/courses/${id}`, courseData);
            return data;
        } catch (error) {
            console.error(`Failed to update course ${id}:`, error);
            throw error;
        }
    }

    async deleteCourse(id: string) {
        try {
            await apiClient.delete(`/courses/${id}`);
        } catch (error) {
            console.error(`Failed to delete course ${id}:`, error);
            throw error;
        }
    }

    async publishCourse(id: string) {
        try {
            const { data } = await apiClient.patch(`/courses/${id}/publish`);
            return data;
        } catch (error) {
            console.error(`Failed to publish course ${id}:`, error);
            throw error;
        }
    }

    async unpublishCourse(id: string) {
        try {
            const { data } = await apiClient.patch(`/courses/${id}/unpublish`);
            return data;
        } catch (error) {
            console.error(`Failed to unpublish course ${id}:`, error);
            throw error;
        }
    }

    async duplicateCourse(id: string) {
        try {
            const { data } = await apiClient.post(`/courses/${id}/duplicate`);
            return data;
        } catch (error) {
            console.error(`Failed to duplicate course ${id}:`, error);
            throw error;
        }
    }

    async toggleCourseStatus(id: string) {
        try {
            const course = await this.getCourseById(id);
            const isPublished = (course as any)?.data?.isPublished || (course as any)?.isPublished || (course as any)?.data?.status === 'published' || (course as any)?.status === 'published';
            if (isPublished) {
                return await this.unpublishCourse(id);
            } else {
                return await this.publishCourse(id);
            }
        } catch (error) {
            console.error(`Failed to toggle course status ${id}:`, error);
            throw error;
        }
    }

    async bulkDeleteCourses(ids: string[]) {
        try {
            const { data } = await apiClient.post('/courses/bulk-delete', { ids });
            return data;
        } catch (error) {
            console.error('Failed to bulk delete courses:', error);
            throw error;
        }
    }

    async bulkToggleStatus(ids: string[]) {
        try {
            const { data } = await apiClient.post('/courses/bulk-toggle-status', { ids });
            return data;
        } catch (error) {
            console.error('Failed to bulk toggle course status:', error);
            throw error;
        }
    }

    async bulkPublishCourses(ids: string[]) {
        try {
            const { data } = await apiClient.post('/courses/bulk-publish', { ids });
            return data;
        } catch (error) {
            console.error('Failed to bulk publish courses:', error);
            throw error;
        }
    }

    async bulkUnpublishCourses(ids: string[]) {
        try {
            const { data } = await apiClient.post('/courses/bulk-unpublish', { ids });
            return data;
        } catch (error) {
            console.error('Failed to bulk unpublish courses:', error);
            throw error;
        }
    }

    async exportCourses(format: "csv" | "xlsx" | "pdf", params?: { status?: string; category?: string }) {
        try {
            const queryParams = new URLSearchParams();
            if (params?.status) queryParams.append('status', params.status);
            if (params?.category) queryParams.append('category', params.category);
            queryParams.append('format', format);

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/courses/export?${queryParams.toString()}`,
                {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error('Failed to export courses');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `courses_export_${new Date().toISOString().split('T')[0]}.${format === 'xlsx' ? 'xlsx' : format === 'pdf' ? 'pdf' : 'csv'}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Failed to export courses:', error);
            throw error;
        }
    }

    // Utility Methods
    calculateDiscount(course: Course): number {
        if (!course.originalPrice || course.originalPrice <= course.price) return 0;
        return Math.round(((course.originalPrice - course.price) / course.originalPrice) * 100);
    }

    calculateSavings(course: Course): number {
        if (!course.originalPrice || course.originalPrice <= course.price) return 0;
        return course.originalPrice - course.price;
    }

    calculateRevenue(course: Course): number {
        return course.price * (course.studentCount || course.enrollmentCount || 0);
    }

    calculatePotentialRevenue(course: Course): number {
        const price = course.originalPrice || course.price;
        return price * (course.studentCount || course.enrollmentCount || 0);
    }

    calculateDiscountImpact(courses: Course[]) {
        let totalRevenue = 0;
        let potentialRevenue = 0;
        let coursesWithDiscount = 0;

        courses.forEach(course => {
            const actualRevenue = this.calculateRevenue(course);
            const potential = this.calculatePotentialRevenue(course);
            totalRevenue += actualRevenue;
            potentialRevenue += potential;
            if (course.originalPrice && course.originalPrice > course.price) {
                coursesWithDiscount++;
            }
        });

        const totalDiscount = potentialRevenue - totalRevenue;
        const discountPercentage = potentialRevenue > 0
            ? (totalDiscount / potentialRevenue) * 100
            : 0;

        return {
            totalRevenue,
            potentialRevenue,
            totalDiscount,
            discountPercentage: Number(discountPercentage.toFixed(2)),
            coursesWithDiscount,
            averageDiscount: coursesWithDiscount > 0
                ? Number((totalDiscount / coursesWithDiscount).toFixed(2))
                : 0
        };
    }

    calculateCategoryStats(courses: Course[]) {
        const stats: Record<string, { count: number; revenue: number; students: number }> = {};

        courses.forEach(course => {
            const categories = course.categories || ['Uncategorized'];
            const revenue = this.calculateRevenue(course);
            const students = course.studentCount || course.enrollmentCount || 0;

            categories.forEach(category => {
                if (!stats[category]) {
                    stats[category] = { count: 0, revenue: 0, students: 0 };
                }
                stats[category].count++;
                stats[category].revenue += revenue;
                stats[category].students += students;
            });
        });

        return Object.entries(stats).map(([category, data]) => ({
            category,
            ...data,
            averagePrice: data.count > 0 ? data.revenue / data.students || 0 : 0
        })).sort((a, b) => b.revenue - a.revenue);
    }

    formatCurrency(amount: number, currency = 'USD'): string {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    }

    getStatusColor(status?: string): string {
        switch (status) {
            case 'published': return 'success';
            case 'draft': return 'warning';
            case 'archived': return 'secondary';
            default: return 'default';
        }
    }

    getLevelColor(level: string): string {
        switch (level) {
            case 'beginner': return 'success';
            case 'intermediate': return 'info';
            case 'advanced': return 'warning';
            case 'expert': return 'error';
            default: return 'default';
        }
    }

    getInstructorName(instructor: Course['instructor']): string {
        if (typeof instructor === 'string') return instructor;
        return instructor?.name ||
            `${instructor?.firstName || ''} ${instructor?.lastName || ''}`.trim() ||
            'Unknown Instructor';
    }

    getSalesProgress(course: Course): number {
        if (!course.maxStudents || course.maxStudents === 0) return 0;
        const enrolled = course.studentCount || course.enrollmentCount || 0;
        return Math.min((enrolled / course.maxStudents) * 100, 100);
    }

    // Dashboard Analytics Methods
    async getDashboardStats() {
        try {
            const response = await apiClient.get<any>("/courses/stats");
            return (response.data as any)?.data || this.getDefaultStats();
        } catch (error) {
            console.error("Failed to fetch dashboard stats:", error);
            return this.getDefaultStats();
        }
    }

    async getFeaturedCourses(limit = 6) {
        try {
            const response = await apiClient.get<any>("/courses/featured", { params: { limit } });
            return (response.data as any)?.data || [];
        } catch (error) {
            console.error("Failed to fetch featured courses:", error);
            return [];
        }
    }

    async getTopPerformingCourses(limit = 10) {
        try {
            const response = await apiClient.get<any>("/courses", {
                params: { limit, sortBy: "revenue" }
            });
            return (response.data as any)?.data?.courses || [];
        } catch (error) {
            console.error("Failed to fetch top courses:", error);
            return [];
        }
    }

    async getRecommendations(limit = 10) {
        try {
            const response = await apiClient.get<any>("/courses/recommendations", { params: { limit } });
            return (response.data as any)?.data || [];
        } catch (error) {
            console.error("Failed to fetch recommendations:", error);
            return [];
        }
    }

    async compareCourses(ids: string[]) {
        try {
            const response = await apiClient.get<any>("/courses/compare", {
                params: { ids: ids.join(',') }
            });
            return (response.data as any)?.data || [];
        } catch (error) {
            console.error("Failed to compare courses:", error);
            throw error;
        }
    }

    async getInstructorCourses(page = 1, limit = 10) {
        try {
            const response = await apiClient.get<any>("/courses/instructor/my-courses", {
                params: { page, limit }
            });
            return (response.data as any)?.data || { courses: [], total: 0 };
        } catch (error) {
            console.error("Failed to fetch instructor courses:", error);
            return { courses: [], total: 0 };
        }
    }

    async getCourseAnalytics(id: string) {
        try {
            const response = await apiClient.get<any>(`/courses/${id}/analytics`);
            return (response.data as any)?.data || null;
        } catch (error) {
            console.error(`Failed to fetch course analytics for ${id}:`, error);
            throw error;
        }
    }

    async previewCourse(id: string) {
        try {
            const response = await apiClient.get<any>(`/courses/${id}/preview`);
            return (response.data as any)?.data || null;
        } catch (error) {
            console.error(`Failed to preview course ${id}:`, error);
            throw error;
        }
    }

    // Calculate dashboard overview statistics
    calculateDashboardStats(courses: Course[]) {
        const totalCourses = courses.length;
        const publishedCourses = courses.filter(c => c.status === 'published' || c.isPublished).length;
        const draftCourses = courses.filter(c => c.status === 'draft' || !c.isPublished).length;

        const totalStudents = courses.reduce((sum, c) => sum + (c.studentCount || c.enrollmentCount || 0), 0);
        const totalRevenue = courses.reduce((sum, c) => sum + this.calculateRevenue(c), 0);
        const totalPotentialRevenue = courses.reduce((sum, c) => sum + this.calculatePotentialRevenue(c), 0);

        const ratingsSum = courses.reduce((sum, c) => sum + (c.rating || 0), 0);
        const coursesWithRatings = courses.filter(c => c.rating).length;
        const averageRating = coursesWithRatings > 0 ? ratingsSum / coursesWithRatings : 0;

        const discountImpact = this.calculateDiscountImpact(courses);

        const instructors = new Set<string>();
        courses.forEach(c => {
            const name = this.getInstructorName(c.instructor);
            if (name !== 'Unknown Instructor') instructors.add(name);
        });

        return {
            totalCourses,
            publishedCourses,
            draftCourses,
            totalStudents,
            totalRevenue,
            totalPotentialRevenue,
            totalDiscountGiven: discountImpact.totalDiscount,
            discountPercentage: discountImpact.discountPercentage,
            averageRating: Number(averageRating.toFixed(1)),
            activeInstructors: instructors.size,
            coursesWithDiscount: discountImpact.coursesWithDiscount,
            averageStudentsPerCourse: totalCourses > 0 ? Math.round(totalStudents / totalCourses) : 0,
            averageRevenuePerCourse: totalCourses > 0 ? Math.round(totalRevenue / totalCourses) : 0,
        };
    }

    // Calculate level distribution for dashboard
    calculateLevelDistribution(courses: Course[]) {
        const distribution: Record<string, number> = {
            beginner: 0,
            intermediate: 0,
            advanced: 0,
            expert: 0
        };

        courses.forEach(course => {
            const level = course.level || 'beginner';
            distribution[level] = (distribution[level] || 0) + 1;
        });

        return Object.entries(distribution).map(([level, count]) => ({
            level: level.charAt(0).toUpperCase() + level.slice(1),
            count,
            percentage: courses.length > 0 ? Number(((count / courses.length) * 100).toFixed(1)) : 0
        }));
    }

    // Calculate monthly revenue trend
    calculateMonthlyRevenue(courses: Course[]) {
        const monthlyData: Record<string, number> = {};

        courses.forEach(course => {
            if (course.createdAt) {
                const date = new Date(course.createdAt);
                const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                const revenue = this.calculateRevenue(course);
                monthlyData[monthKey] = (monthlyData[monthKey] || 0) + revenue;
            }
        });

        return Object.entries(monthlyData)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([month, revenue]) => ({ month, revenue }));
    }

    // Export data to CSV
    exportToCSV(courses: Course[], filename: string = 'courses') {
        if (courses.length === 0) return;

        const csvData = courses.map(course => ({
            Title: course.title,
            Category: course.categories?.join(', ') || 'N/A',
            Level: course.level,
            Price: course.price,
            OriginalPrice: course.originalPrice || course.price,
            Discount: this.calculateDiscount(course) + '%',
            Students: course.studentCount || 0,
            Revenue: this.calculateRevenue(course),
            Rating: course.rating || 0,
            Status: course.status || (course.isPublished ? 'published' : 'draft'),
            Instructor: this.getInstructorName(course.instructor),
            CreatedAt: course.createdAt || '',
        }));

        const headers = Object.keys(csvData[0]);
        const csv = [
            headers.join(','),
            ...csvData.map(row =>
                headers.map(header => JSON.stringify(row[header as keyof typeof row])).join(',')
            ),
        ].join('\n');

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        link.setAttribute('href', url);
        link.setAttribute('download', `${filename}-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // Calculate growth rate
    calculateGrowthRate(current: number, previous: number): number {
        if (previous === 0) return current > 0 ? 100 : 0;
        return Number((((current - previous) / previous) * 100).toFixed(1));
    }

    // Default stats helper
    private getDefaultStats() {
        return {
            totalCourses: 0,
            publishedCourses: 0,
            draftCourses: 0,
            totalStudents: 0,
            totalRevenue: 0,
            averageRating: 0,
            activeInstructors: 0,
        };
    }
}

export const coursesService = new CoursesService();
export default coursesService;
