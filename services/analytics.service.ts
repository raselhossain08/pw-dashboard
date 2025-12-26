import { apiClient } from "@/lib/api-client";

export interface DashboardStats {
    totalRevenue: number;
    totalOrders: number;
    totalUsers: number;
    totalCourses: number;
    revenueGrowth: number;
    ordersGrowth: number;
    usersGrowth: number;
    coursesGrowth: number;
}

export interface RevenueData {
    date: string;
    revenue: number;
    orders: number;
}

export interface TopCourse {
    _id: string;
    title: string;
    enrollments: number;
    revenue: number;
}

export interface TopProduct {
    _id: string;
    name: string;
    sales: number;
    revenue: number;
}

class AnalyticsService {
    async getDashboardStats() {
        try {
            const { data } = await apiClient.get("/analytics/dashboard");
            return data;
        } catch (error) {
            console.error("Failed to fetch dashboard analytics:", error);
            throw error;
        }
    }

    async getRevenueData(params: { period?: "day" | "week" | "month" | "year" } = {}) {
        try {
            const { data } = await apiClient.get("/analytics/revenue", { params });
            return data;
        } catch (error) {
            console.error("Failed to fetch revenue analytics:", error);
            throw error;
        }
    }

    async getCoursePerformance() {
        try {
            const { data } = await apiClient.get("/analytics/course-performance");
            return data;
        } catch (error) {
            console.error("Failed to fetch course performance:", error);
            throw error;
        }
    }

    async getGeographicDistribution() {
        try {
            const { data } = await apiClient.get("/analytics/geographic-distribution");
            return data;
        } catch (error) {
            console.error("Failed to fetch geographic distribution:", error);
            throw error;
        }
    }

    async getConversionRates() {
        try {
            const { data } = await apiClient.get("/analytics/conversion-rates");
            return data;
        } catch (error) {
            console.error("Failed to fetch conversion rates:", error);
            throw error;
        }
    }

    async getEnrollments(params: { period?: "day" | "week" | "month" | "year" } = {}) {
        try {
            const { data } = await apiClient.get("/analytics/enrollments", { params });
            return data;
        } catch (error) {
            console.error("Failed to fetch enrollment analytics:", error);
            throw error;
        }
    }

    // ===== REPORTS CRUD METHODS =====
    async createReport(reportData: any) {
        try {
            const { data } = await apiClient.post("/analytics/reports", reportData);
            return data;
        } catch (error) {
            console.error("Failed to create report:", error);
            throw error;
        }
    }

    async getAllReports(params: {
        type?: string;
        status?: string;
        limit?: number;
        page?: number;
    } = {}) {
        try {
            const { data } = await apiClient.get("/analytics/reports", { params });
            return data;
        } catch (error) {
            console.error("Failed to fetch reports:", error);
            throw error;
        }
    }

    async getReportById(id: string) {
        try {
            const { data } = await apiClient.get(`/analytics/reports/${id}`);
            return data;
        } catch (error) {
            console.error("Failed to fetch report:", error);
            throw error;
        }
    }

    async updateReport(id: string, reportData: any) {
        try {
            const { data } = await apiClient.put(`/analytics/reports/${id}`, reportData);
            return data;
        } catch (error) {
            console.error("Failed to update report:", error);
            throw error;
        }
    }

    async deleteReport(id: string) {
        try {
            await apiClient.delete(`/analytics/reports/${id}`);
        } catch (error) {
            console.error("Failed to delete report:", error);
            throw error;
        }
    }

    async generateReport(id: string) {
        try {
            const { data } = await apiClient.post(`/analytics/reports/${id}/generate`);
            return data;
        } catch (error) {
            console.error("Failed to generate report:", error);
            throw error;
        }
    }

    async exportReport(id: string, format: "pdf" | "csv" | "xlsx" = "pdf") {
        try {
            const { data } = await apiClient.post(`/analytics/reports/${id}/export`, null, {
                params: { format },
            });
            return data;
        } catch (error) {
            console.error("Failed to export report:", error);
            throw error;
        }
    }

    // ===== NEW ANALYTICS ENDPOINTS =====
    async getStudentProgress() {
        try {
            const { data } = await apiClient.get("/analytics/student-progress");
            return data;
        } catch (error) {
            console.error("Failed to fetch student progress:", error);
            throw error;
        }
    }

    async getInstructorPerformance() {
        try {
            const { data } = await apiClient.get("/analytics/instructor-performance");
            return data;
        } catch (error) {
            console.error("Failed to fetch instructor performance:", error);
            throw error;
        }
    }

    async scheduleReport(scheduleData: any) {
        try {
            const { data } = await apiClient.post("/analytics/reports/schedule", scheduleData);
            return data;
        } catch (error) {
            console.error("Failed to schedule report:", error);
            throw error;
        }
    }

    async bulkDeleteReports(ids: string[]) {
        try {
            await apiClient.post("/analytics/reports/bulk-delete", { ids });
        } catch (error) {
            console.error("Failed to bulk delete reports:", error);
            throw error;
        }
    }

    async bulkExportReports(ids: string[], format: "pdf" | "csv" | "xlsx" = "pdf") {
        try {
            const { data } = await apiClient.post("/analytics/reports/bulk-export", {
                ids,
                format,
            });
            return data;
        } catch (error) {
            console.error("Failed to bulk export reports:", error);
            throw error;
        }
    }
}

export const analyticsService = new AnalyticsService();
export default analyticsService;
