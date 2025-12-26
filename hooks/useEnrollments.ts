"use client";

import { useState, useCallback } from "react";
import {
    enrollmentsService,
    Enrollment,
    CreateEnrollmentDto,
    UpdateEnrollmentDto,
    EnrollmentStats,
    CourseEnrollmentDistribution,
    EnrollmentTrendPoint,
} from "@/services/enrollments.service";
import { useToast } from "@/context/ToastContext";

export function useEnrollments() {
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [stats, setStats] = useState<EnrollmentStats | null>(null);
    const [distribution, setDistribution] = useState<
        CourseEnrollmentDistribution[]
    >([]);
    const [trends, setTrends] = useState<EnrollmentTrendPoint[]>([]);
    const [loading, setLoading] = useState(false);
    const [statsLoading, setStatsLoading] = useState(false);
    const [distributionLoading, setDistributionLoading] = useState(false);
    const [trendsLoading, setTrendsLoading] = useState(false);
    const [total, setTotal] = useState(0);
    const { push } = useToast();

    // Fetch all enrollments with filters
    const fetchEnrollments = useCallback(
        async (params: {
            page?: number;
            limit?: number;
            search?: string;
            courseId?: string;
            status?: string;
            instructorId?: string;
            sortBy?: string;
            sortOrder?: "asc" | "desc";
        } = {}) => {
            setLoading(true);
            try {
                const data = await enrollmentsService.getAllEnrollments(params);
                setEnrollments(data.enrollments);
                setTotal(data.total);
                return data;
            } catch (error: any) {
                push({
                    type: "error",
                    message:
                        error.response?.data?.message || "Failed to fetch enrollments",
                });
                throw error;
            } finally {
                setLoading(false);
            }
        },
        [push]
    );

    // Fetch enrollment stats
    const fetchStats = useCallback(async () => {
        setStatsLoading(true);
        try {
            const data = await enrollmentsService.getEnrollmentStats();
            setStats(data);
            return data;
        } catch (error: any) {
            push({
                type: "error",
                message:
                    error.response?.data?.message || "Failed to fetch enrollment stats",
            });
            throw error;
        } finally {
            setStatsLoading(false);
        }
    }, [push]);

    // Fetch course distribution
    const fetchDistribution = useCallback(async () => {
        setDistributionLoading(true);
        try {
            const data = await enrollmentsService.getCourseDistribution();
            setDistribution(data);
            return data;
        } catch (error: any) {
            push({
                type: "error",
                message:
                    error.response?.data?.message ||
                    "Failed to fetch course distribution",
            });
            throw error;
        } finally {
            setDistributionLoading(false);
        }
    }, [push]);

    const fetchTrends = useCallback(
        async (range: "7d" | "30d" | "90d" | "year" = "30d") => {
            setTrendsLoading(true);
            try {
                const data = await enrollmentsService.getAdminTrends(range);
                setTrends(data);
                return data;
            } catch (error: any) {
                push({
                    type: "error",
                    message:
                        error.response?.data?.message || "Failed to fetch enrollment trends",
                });
                throw error;
            } finally {
                setTrendsLoading(false);
            }
        },
        [push]
    );

    // Get enrollment by ID
    const getEnrollmentById = useCallback(
        async (id: string) => {
            try {
                const data = await enrollmentsService.getEnrollmentById(id);
                return data;
            } catch (error: any) {
                push({
                    type: "error",
                    message:
                        error.response?.data?.message || "Failed to fetch enrollment",
                });
                throw error;
            }
        },
        [push]
    );

    // Create enrollment
    const createEnrollment = useCallback(
        async (data: CreateEnrollmentDto) => {
            try {
                const enrollment = await enrollmentsService.createEnrollment(data);
                push({
                    type: "success",
                    message: "Enrollment created successfully",
                });
                return enrollment;
            } catch (error: any) {
                push({
                    type: "error",
                    message:
                        error.response?.data?.message || "Failed to create enrollment",
                });
                throw error;
            }
        },
        [push]
    );

    // Update enrollment
    const updateEnrollment = useCallback(
        async (id: string, data: UpdateEnrollmentDto) => {
            try {
                const enrollment = await enrollmentsService.updateEnrollment(id, data);
                push({
                    type: "success",
                    message: "Enrollment updated successfully",
                });
                return enrollment;
            } catch (error: any) {
                push({
                    type: "error",
                    message:
                        error.response?.data?.message || "Failed to update enrollment",
                });
                throw error;
            }
        },
        [push]
    );

    // Delete enrollment
    const deleteEnrollment = useCallback(
        async (id: string) => {
            try {
                await enrollmentsService.deleteEnrollment(id);
                push({
                    type: "success",
                    message: "Enrollment deleted successfully",
                });
            } catch (error: any) {
                push({
                    type: "error",
                    message:
                        error.response?.data?.message || "Failed to delete enrollment",
                });
                throw error;
            }
        },
        [push]
    );

    // Bulk delete enrollments
    const bulkDeleteEnrollments = useCallback(
        async (ids: string[]) => {
            try {
                await enrollmentsService.bulkDeleteEnrollments(ids);
                push({
                    type: "success",
                    message: `${ids.length} enrollment(s) deleted successfully`,
                });
            } catch (error: any) {
                push({
                    type: "error",
                    message:
                        error.response?.data?.message || "Failed to delete enrollments",
                });
                throw error;
            }
        },
        [push]
    );

    // Approve enrollment
    const approveEnrollment = useCallback(
        async (id: string) => {
            try {
                const enrollment = await enrollmentsService.approveEnrollment(id);
                push({
                    type: "success",
                    message: "Enrollment approved successfully",
                });
                return enrollment;
            } catch (error: any) {
                push({
                    type: "error",
                    message:
                        error.response?.data?.message || "Failed to approve enrollment",
                });
                throw error;
            }
        },
        [push]
    );

    // Cancel enrollment
    const cancelEnrollment = useCallback(
        async (id: string, reason?: string) => {
            try {
                const enrollment = await enrollmentsService.cancelEnrollment(id, reason);
                push({
                    type: "success",
                    message: "Enrollment cancelled successfully",
                });
                return enrollment;
            } catch (error: any) {
                push({
                    type: "error",
                    message:
                        error.response?.data?.message || "Failed to cancel enrollment",
                });
                throw error;
            }
        },
        [push]
    );

    // Export enrollments
    const exportEnrollments = useCallback(
        async (params: {
            format?: "csv" | "xlsx" | "pdf";
            courseId?: string;
            status?: string;
        } = {}) => {
            try {
                const blob = await enrollmentsService.exportEnrollments(params);
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = `enrollments-${new Date().toISOString().split("T")[0]
                    }.${params.format || "csv"}`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
                push({
                    type: "success",
                    message: "Enrollments exported successfully",
                });
            } catch (error: any) {
                push({
                    type: "error",
                    message:
                        error.response?.data?.message || "Failed to export enrollments",
                });
                throw error;
            }
        },
        [push]
    );

    return {
        enrollments,
        stats,
        distribution,
        trends,
        loading,
        statsLoading,
        distributionLoading,
        trendsLoading,
        total,
        fetchEnrollments,
        fetchStats,
        fetchDistribution,
        fetchTrends,
        getEnrollmentById,
        createEnrollment,
        updateEnrollment,
        deleteEnrollment,
        bulkDeleteEnrollments,
        approveEnrollment,
        cancelEnrollment,
        exportEnrollments,
    };
}
