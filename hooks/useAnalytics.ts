import { useState, useEffect, useCallback } from "react";
import { analyticsService } from "@/services/analytics.service";
import { useToast } from "@/context/ToastContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export type ReportType = "Overview" | "Sales" | "Engagement" | "Traffic" | "Custom";
export type ReportStatus = "draft" | "scheduled" | "generated" | "failed";

export interface ReportItem {
  _id?: string;
  id?: string;
  name: string;
  description?: string;
  period: string;
  type: ReportType;
  status: ReportStatus;
  createdAt?: string;
  updatedAt?: string;
  generatedAt?: string;
  scheduledAt?: string;
  fileUrl?: string;
  fileFormat?: string;
  createdBy?: { firstName?: string; lastName?: string };
}

interface CreateReportData {
  name: string;
  description?: string;
  type: ReportType;
  period: string;
  status?: ReportStatus;
  autoGenerate?: boolean;
}

interface UseAnalyticsOptions {
  period?: "day" | "week" | "month" | "year";
  reportType?: ReportType;
}

export function useAnalytics(options: UseAnalyticsOptions = {}) {
  const { push } = useToast();
  const queryClient = useQueryClient();
  const { period = "month", reportType = "Overview" } = options;

  // Dashboard stats
  const {
    data: dashboard,
    isLoading: loadingDashboard,
    refetch: refetchDashboard,
  } = useQuery({
    queryKey: ["analytics", "dashboard"],
    queryFn: () => analyticsService.getDashboardStats(),
    staleTime: 60_000,
    retry: 1,
  });

  // Revenue data
  const {
    data: revenueData,
    isLoading: loadingRevenue,
    refetch: refetchRevenue,
  } = useQuery({
    queryKey: ["analytics", "revenue", period],
    queryFn: () => analyticsService.getRevenueData({ period }),
    staleTime: 60_000,
    retry: 1,
  });

  // Conversion rates
  const {
    data: conversionRates,
    isLoading: loadingConversion,
    refetch: refetchConversion,
  } = useQuery({
    queryKey: ["analytics", "conversion"],
    queryFn: () => analyticsService.getConversionRates(),
    staleTime: 60_000,
    retry: 1,
  });

  // Geographic distribution
  const {
    data: geoData,
    isLoading: loadingGeo,
    refetch: refetchGeo,
  } = useQuery({
    queryKey: ["analytics", "geo"],
    queryFn: () => analyticsService.getGeographicDistribution(),
    staleTime: 60_000,
    retry: 1,
  });

  // Course performance
  const {
    data: coursePerformance,
    isLoading: loadingPerformance,
    refetch: refetchPerformance,
  } = useQuery({
    queryKey: ["analytics", "course-performance"],
    queryFn: () => analyticsService.getCoursePerformance(),
    staleTime: 60_000,
    retry: 1,
  });

  // Reports
  const {
    data: reportsData,
    isLoading: loadingReports,
    refetch: refetchReports,
  } = useQuery({
    queryKey: ["analytics", "reports", reportType],
    queryFn: () =>
      analyticsService.getAllReports({
        type: reportType === "Overview" ? undefined : reportType,
      }),
    staleTime: 30_000,
  });

  // Create report mutation
  const createReportMutation = useMutation({
    mutationFn: (data: CreateReportData) => analyticsService.createReport(data),
    onMutate: () => {
      push({ message: "Creating report...", type: "loading", duration: 0 });
    },
    onSuccess: () => {
      push({ message: "Report created successfully!", type: "success" });
      queryClient.invalidateQueries({ queryKey: ["analytics", "reports"] });
    },
    onError: (error: any) => {
      push({
        message: error?.response?.data?.message || "Failed to create report",
        type: "error",
      });
    },
  });

  // Update report mutation
  const updateReportMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateReportData> }) =>
      analyticsService.updateReport(id, data),
    onMutate: () => {
      push({ message: "Updating report...", type: "loading", duration: 0 });
    },
    onSuccess: () => {
      push({ message: "Report updated successfully!", type: "success" });
      queryClient.invalidateQueries({ queryKey: ["analytics", "reports"] });
    },
    onError: (error: any) => {
      push({
        message: error?.response?.data?.message || "Failed to update report",
        type: "error",
      });
    },
  });

  // Delete report mutation
  const deleteReportMutation = useMutation({
    mutationFn: (id: string) => analyticsService.deleteReport(id),
    onMutate: () => {
      push({ message: "Deleting report...", type: "loading", duration: 0 });
    },
    onSuccess: () => {
      push({ message: "Report deleted successfully!", type: "success" });
      queryClient.invalidateQueries({ queryKey: ["analytics", "reports"] });
    },
    onError: (error: any) => {
      push({
        message: error?.response?.data?.message || "Failed to delete report",
        type: "error",
      });
    },
  });

  // Generate report mutation
  const generateReportMutation = useMutation({
    mutationFn: (id: string) => analyticsService.generateReport(id),
    onMutate: () => {
      push({ message: "Generating report...", type: "loading", duration: 0 });
    },
    onSuccess: () => {
      push({ message: "Report generated successfully!", type: "success" });
      queryClient.invalidateQueries({ queryKey: ["analytics", "reports"] });
    },
    onError: (error: any) => {
      push({
        message: error?.response?.data?.message || "Failed to generate report",
        type: "error",
      });
    },
  });

  // Export report mutation
  const exportReportMutation = useMutation({
    mutationFn: ({ id, format }: { id: string; format: "pdf" | "csv" | "xlsx" }) =>
      analyticsService.exportReport(id, format),
    onMutate: () => {
      push({ message: "Preparing export...", type: "loading", duration: 0 });
    },
    onSuccess: (data) => {
      push({ message: "Export ready for download!", type: "success" });
      if ((data as any)?.url) {
        window.open((data as any).url, "_blank");
      }
    },
    onError: (error: any) => {
      push({
        message: error?.response?.data?.message || "Failed to export report",
        type: "error",
      });
    },
  });

  // Actions
  const createReport = useCallback(
    (data: CreateReportData) => {
      if (!data.name || !data.period) {
        push({ message: "Please fill in all required fields", type: "error" });
        return;
      }
      createReportMutation.mutate(data);
    },
    [createReportMutation, push]
  );

  const updateReport = useCallback(
    (id: string, data: Partial<CreateReportData>) => {
      updateReportMutation.mutate({ id, data });
    },
    [updateReportMutation]
  );

  const deleteReport = useCallback(
    (id: string) => {
      deleteReportMutation.mutate(id);
    },
    [deleteReportMutation]
  );

  const generateReport = useCallback(
    (id: string) => {
      generateReportMutation.mutate(id);
    },
    [generateReportMutation]
  );

  const exportReport = useCallback(
    (id: string, format: "pdf" | "csv" | "xlsx" = "pdf") => {
      exportReportMutation.mutate({ id, format });
    },
    [exportReportMutation]
  );

  // Schedule report mutation
  const scheduleReportMutation = useMutation({
    mutationFn: (scheduleData: any) => analyticsService.scheduleReport(scheduleData),
    onMutate: () => {
      push({ message: "Scheduling report...", type: "loading", duration: 0 });
    },
    onSuccess: () => {
      push({ message: "Report scheduled successfully!", type: "success" });
      queryClient.invalidateQueries({ queryKey: ["analytics", "reports"] });
    },
    onError: (error: any) => {
      push({
        message: error?.response?.data?.message || "Failed to schedule report",
        type: "error",
      });
    },
  });

  // Bulk delete mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: string[]) => analyticsService.bulkDeleteReports(ids),
    onMutate: () => {
      push({ message: "Deleting reports...", type: "loading", duration: 0 });
    },
    onSuccess: () => {
      push({ message: "Reports deleted successfully!", type: "success" });
      queryClient.invalidateQueries({ queryKey: ["analytics", "reports"] });
    },
    onError: (error: any) => {
      push({
        message: error?.response?.data?.message || "Failed to delete reports",
        type: "error",
      });
    },
  });

  // Bulk export mutation
  const bulkExportMutation = useMutation({
    mutationFn: ({ ids, format }: { ids: string[]; format: "pdf" | "csv" | "xlsx" }) =>
      analyticsService.bulkExportReports(ids, format),
    onMutate: () => {
      push({ message: "Preparing bulk export...", type: "loading", duration: 0 });
    },
    onSuccess: () => {
      push({ message: "Bulk export completed!", type: "success" });
    },
    onError: (error: any) => {
      push({
        message: error?.response?.data?.message || "Failed to bulk export",
        type: "error",
      });
    },
  });

  const scheduleReport = useCallback(
    (scheduleData: any) => {
      scheduleReportMutation.mutate(scheduleData);
    },
    [scheduleReportMutation]
  );

  const bulkDeleteReports = useCallback(
    (ids: string[]) => {
      bulkDeleteMutation.mutate(ids);
    },
    [bulkDeleteMutation]
  );

  const bulkExportReports = useCallback(
    (ids: string[], format: "pdf" | "csv" | "xlsx" = "pdf") => {
      bulkExportMutation.mutate({ ids, format });
    },
    [bulkExportMutation]
  );

  const refreshAll = useCallback(() => {
    refetchDashboard();
    refetchRevenue();
    refetchConversion();
    refetchGeo();
    refetchPerformance();
    refetchReports();
    push({
      message: "Refreshing analytics data...",
      type: "loading",
      duration: 1000,
    });
  }, [
    refetchDashboard,
    refetchRevenue,
    refetchConversion,
    refetchGeo,
    refetchPerformance,
    refetchReports,
    push,
  ]);

  const reports: ReportItem[] = (reportsData as any)?.reports || [];

  return {
    // Data
    dashboard,
    revenueData,
    conversionRates,
    geoData,
    coursePerformance,
    reports,

    // Loading states
    loadingDashboard,
    loadingRevenue,
    loadingConversion,
    loadingGeo,
    loadingPerformance,
    loadingReports,
    isLoading:
      loadingDashboard ||
      loadingRevenue ||
      loadingConversion ||
      loadingGeo ||
      loadingPerformance ||
      loadingReports,

    // Mutations
    createReport,
    updateReport,
    deleteReport,
    generateReport,
    exportReport,
    scheduleReport,
    bulkDeleteReports,
    bulkExportReports,

    // Mutation states
    isCreating: createReportMutation.isPending,
    isUpdating: updateReportMutation.isPending,
    isDeleting: deleteReportMutation.isPending,
    isGenerating: generateReportMutation.isPending,
    isExporting: exportReportMutation.isPending,
    isScheduling: scheduleReportMutation.isPending,
    isBulkDeleting: bulkDeleteMutation.isPending,
    isBulkExporting: bulkExportMutation.isPending,

    // Refresh
    refreshAll,
  };
}
