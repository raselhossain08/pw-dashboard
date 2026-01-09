"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { useRouter } from "next/navigation";
import {
  Bot,
  Users,
  Book,
  CreditCard,
  MessageSquare,
  Plus,
  Play,
  Megaphone,
  Plane,
  ShoppingCart,
  Download,
  RefreshCw,
  AlertCircle,
  FileDown,
} from "lucide-react";
import { useDashboard } from "@/hooks/useDashboard";
import { useToast } from "@/context/ToastContext";
import AppLayout from "@/components/layout/AppLayout";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

declare global {
  interface Window {
    Plotly?: { newPlot: (...args: unknown[]) => void };
  }
}

export default function Dashboard() {
  const {
    stats,
    charts,
    loading,
    error,
    refresh,
    shopRevenue,
    aircraftForSale,
  } = useDashboard();
  const { push: toast, remove: removeToast } = useToast();
  const router = useRouter();
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<"pdf" | "csv" | "excel">(
    "pdf"
  );
  const [isExporting, setIsExporting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    const toastId = toast({
      message: "Refreshing dashboard data...",
      type: "loading",
    });
    try {
      await refresh();
      removeToast(toastId);
      toast({ message: "Dashboard refreshed successfully!", type: "success" });
    } catch (err) {
      removeToast(toastId);
      toast({ message: "Failed to refresh dashboard", type: "error" });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    const toastId = toast({
      message: `Generating ${exportFormat.toUpperCase()} report...`,
      type: "loading",
    });

    try {
      // Simulate export - in production, call real API
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Create download link
      const data = {
        stats,
        charts,
        generatedAt: new Date().toISOString(),
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `dashboard-report-${Date.now()}.${
        exportFormat === "excel" ? "xlsx" : exportFormat
      }`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      removeToast(toastId);
      toast({ message: "Report exported successfully!", type: "success" });
      setIsExportDialogOpen(false);
    } catch (err) {
      removeToast(toastId);
      toast({ message: "Failed to export report", type: "error" });
    } finally {
      setIsExporting(false);
    }
  };

  const quickActions = [
    {
      icon: Book,
      label: "Add New Course",
      description: "Create learning content",
      color: "primary",
      route: "/courses/new",
    },
    {
      icon: Play,
      label: "Add Training Program",
      description: "Create certification",
      color: "accent",
      route: "/training/new",
    },
    {
      icon: MessageSquare,
      label: "Add Blog Post",
      description: "Publish content",
      color: "blue",
      route: "/cms/blog/new",
    },
    {
      icon: Plane,
      label: "Add Aircraft Listing",
      description: "List for sale",
      color: "yellow",
      route: "/aircraft/new",
    },
    {
      icon: ShoppingCart,
      label: "Add Product",
      description: "Shopify store",
      color: "purple",
      route: "/shop/products/new",
    },
    {
      icon: Megaphone,
      label: "Send Announcement",
      description: "Notify users",
      color: "red",
      route: "/notifications/new",
    },
  ];

  useEffect(() => {
    if (!charts || !window.Plotly) return;

    const enrollmentsData = [
      {
        type: "scatter",
        mode: "lines",
        x: charts.enrollments.x,
        y: charts.enrollments.y,
        line: { color: "#6366F1", width: 3 },
        fill: "tozeroy",
        fillcolor: "rgba(99, 102, 241, 0.1)",
      },
    ];
    const enrollmentsLayout = {
      margin: { t: 20, r: 20, b: 40, l: 40 },
      plot_bgcolor: "#FFFFFF",
      paper_bgcolor: "#FFFFFF",
      showlegend: false,
      xaxis: { showgrid: false },
      yaxis: { showgrid: true, gridcolor: "#e5e7eb" },
    };
    window.Plotly.newPlot(
      "enrollments-chart",
      enrollmentsData,
      enrollmentsLayout,
      {
        responsive: true,
        displayModeBar: false,
      }
    );

    const revenueData = [
      {
        type: "bar",
        x: charts.revenue.x,
        y: charts.revenue.y,
        marker: { color: "#10B981" },
      },
    ];
    const revenueLayout = {
      margin: { t: 20, r: 20, b: 40, l: 60 },
      plot_bgcolor: "#FFFFFF",
      paper_bgcolor: "#FFFFFF",
      showlegend: false,
      xaxis: { showgrid: false },
      yaxis: { showgrid: true, gridcolor: "#e5e7eb" },
    };
    window.Plotly.newPlot("sales-chart", revenueData, revenueLayout, {
      responsive: true,
      displayModeBar: false,
    });

    const aircraftData = [
      {
        type: "bar",
        x: charts.aircraftInquiries.x,
        y: charts.aircraftInquiries.y,
        marker: { color: "#3B82F6" },
      },
    ];
    const aircraftLayout = {
      margin: { t: 20, r: 20, b: 40, l: 60 },
      plot_bgcolor: "#FFFFFF",
      paper_bgcolor: "#FFFFFF",
      showlegend: false,
      xaxis: { showgrid: false },
      yaxis: { showgrid: true, gridcolor: "#e5e7eb" },
    };
    window.Plotly.newPlot("aircraft-chart", aircraftData, aircraftLayout, {
      responsive: true,
      displayModeBar: false,
    });

    const aiPerfData = [
      {
        type: "scatter",
        mode: "lines+markers",
        x: charts.aiPerformance.x,
        y: charts.aiPerformance.y,
        line: { color: "#8B5CF6", width: 3 },
        marker: { size: 8 },
      },
    ];
    const aiPerfLayout = {
      margin: { t: 20, r: 20, b: 40, l: 40 },
      plot_bgcolor: "#FFFFFF",
      paper_bgcolor: "#FFFFFF",
      showlegend: false,
      xaxis: { showgrid: false },
      yaxis: { showgrid: true, gridcolor: "#e5e7eb" },
    };
    window.Plotly.newPlot("ai-performance-chart", aiPerfData, aiPerfLayout, {
      responsive: true,
      displayModeBar: false,
    });

    const progressData = [
      {
        type: "pie",
        labels: charts.progress.labels,
        values: charts.progress.values,
        marker: { colors: ["#10B981", "#F59E0B", "#EF4444"] },
      },
    ];
    const progressLayout = {
      margin: { t: 20, r: 20, b: 20, l: 20 },
      plot_bgcolor: "#FFFFFF",
      paper_bgcolor: "#FFFFFF",
      showlegend: true,
      legend: { orientation: "h", y: -0.1 },
    };
    window.Plotly.newPlot("progress-chart", progressData, progressLayout, {
      responsive: true,
      displayModeBar: false,
    });

    const trafficData = charts.traffic.series.map((s) => ({
      type: "bar",
      name: s.name,
      x: charts.traffic.categories,
      y: s.values,
    }));
    const trafficLayout = {
      margin: { t: 20, r: 20, b: 40, l: 60 },
      barmode: "group",
      plot_bgcolor: "#FFFFFF",
      paper_bgcolor: "#FFFFFF",
      showlegend: true,
      xaxis: { showgrid: false },
      yaxis: { showgrid: true, gridcolor: "#e5e7eb" },
      legend: { orientation: "h" },
    } as const;
    window.Plotly.newPlot("traffic-chart", trafficData, trafficLayout, {
      responsive: true,
      displayModeBar: false,
    });
  }, [charts]);

  return (
    <AppLayout>
      <Script
        src="https://cdn.plot.ly/plotly-3.1.1.min.js"
        strategy="afterInteractive"
      />
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-secondary mb-2">
              Dashboard Overview
            </h2>
            <p className="text-gray-600">
              Welcome back! Here&apos;s what&apos;s happening with Personal
              Wings today.
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw
                className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
              <span>Refresh</span>
            </button>
            <button
              onClick={() => setIsExportDialogOpen(true)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Export Report</span>
            </button>
            <button
              onClick={() => setIsQuickAddOpen(true)}
              className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Quick Add</span>
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-primary/20 rounded-full"></div>
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
            </div>
            <p className="mt-4 text-gray-600 font-medium">
              Loading dashboard data...
            </p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-start space-x-4">
            <AlertCircle className="w-6 h-6 text-red-600 shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-900 mb-2">
                Failed to Load Dashboard
              </h3>
              <p className="text-red-700 mb-4">{error}</p>
              <button
                onClick={handleRefresh}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center space-x-2 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Retry</span>
              </button>
            </div>
          </div>
        )}

        {/* Dashboard Content */}
        {!loading && !error && stats && charts && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">
                      {stats?.students.label}
                    </p>
                    <p className="text-2xl font-bold text-secondary mt-1">
                      {stats?.students.value}
                    </p>
                    <p className="text-accent text-sm mt-1">
                      <span className="inline-flex items-center gap-1">
                        <span>+{stats?.students.trendDelta}%</span>{" "}
                        <span>{stats?.students.trendLabel}</span>
                      </span>
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Users className="text-primary w-5 h-5" />
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">
                      {stats?.courses.label}
                    </p>
                    <p className="text-2xl font-bold text-secondary mt-1">
                      {stats?.courses.value}
                    </p>
                    <p className="text-accent text-sm mt-1">
                      <span className="inline-flex items-center gap-1">
                        <span>+{stats?.courses.trendDelta}%</span>{" "}
                        <span>{stats?.courses.trendLabel}</span>
                      </span>
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                    <Book className="text-accent w-5 h-5" />
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">
                      {stats?.revenue.label}
                    </p>
                    <p className="text-2xl font-bold text-secondary mt-1">
                      {stats?.revenue.value}
                    </p>
                    <p className="text-accent text-sm mt-1">
                      <span className="inline-flex items-center gap-1">
                        <span>+{stats?.revenue.trendDelta}%</span>{" "}
                        <span>{stats?.revenue.trendLabel}</span>
                      </span>
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <CreditCard className="text-yellow-600 w-5 h-5" />
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">
                      {stats?.aiConversations.label}
                    </p>
                    <p className="text-2xl font-bold text-secondary mt-1">
                      {stats?.aiConversations.value}
                    </p>
                    <p className="text-accent text-sm mt-1">
                      <span className="inline-flex items-center gap-1">
                        <span>+{stats?.aiConversations.trendDelta}%</span>{" "}
                        <span>{stats?.aiConversations.trendLabel}</span>
                      </span>
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Bot className="text-purple-600 w-5 h-5" />
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">
                      Shop Revenue
                    </p>
                    <p className="text-2xl font-bold text-secondary mt-1">
                      {shopRevenue || "$0"}
                    </p>
                    <p className="text-accent text-sm mt-1">+18.6%</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <ShoppingCart className="text-green-600 w-5 h-5" />
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">
                      Aircraft for Sale
                    </p>
                    <p className="text-2xl font-bold text-secondary mt-1">
                      {aircraftForSale || 0}
                    </p>
                    <p className="text-accent text-sm mt-1">+5.2%</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Plane className="text-blue-600 w-5 h-5" />
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">
                      Live Chats
                    </p>
                    <p className="text-2xl font-bold text-secondary mt-1">
                      {stats?.aiConversations?.value || 0}
                    </p>
                    <p className="text-accent text-sm mt-1">+22.1%</p>
                  </div>
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <MessageSquare className="text-indigo-600 w-5 h-5" />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-secondary mb-4">
                  Enrollment Trends
                </h3>
                <div id="enrollments-chart" style={{ height: 300 }} />
              </div>

              <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-secondary mb-4">
                  Total Sales Performance
                </h3>
                <div id="sales-chart" style={{ height: 300 }} />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-secondary mb-4">
                  Aircraft Inquiries
                </h3>
                <div id="aircraft-chart" style={{ height: 300 }} />
              </div>

              <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-secondary mb-4">
                  AI Agent Performance
                </h3>
                <div id="ai-performance-chart" style={{ height: 300 }} />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-secondary mb-4">
                  Student Progress Rate
                </h3>
                <div id="progress-chart" style={{ height: 300 }} />
              </div>

              <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-secondary mb-4">
                  Traffic Analytics
                </h3>
                <div id="traffic-chart" style={{ height: 300 }} />
              </div>
            </div>

            <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-secondary mb-4">
                Quick Actions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                {quickActions.map((action, index) => {
                  const Icon = action.icon;
                  const colorClasses = {
                    primary: "bg-primary/5 hover:bg-primary/10 bg-primary",
                    accent: "bg-accent/5 hover:bg-accent/10 bg-accent",
                    blue: "bg-blue-50 hover:bg-blue-100 bg-blue-500",
                    yellow: "bg-yellow-50 hover:bg-yellow-100 bg-yellow-500",
                    purple: "bg-purple-50 hover:bg-purple-100 bg-purple-500",
                    red: "bg-red-50 hover:bg-red-100 bg-red-500",
                  };

                  return (
                    <button
                      key={index}
                      onClick={() => {
                        toast({
                          message: `Navigating to ${action.label}...`,
                          type: "info",
                          duration: 2000,
                        });
                        router.push(action.route);
                      }}
                      className={`flex flex-col items-center space-y-3 p-4 ${
                        colorClasses[
                          action.color as keyof typeof colorClasses
                        ].split(" ")[0]
                      } ${
                        colorClasses[
                          action.color as keyof typeof colorClasses
                        ].split(" ")[1]
                      } rounded-lg transition-colors`}
                    >
                      <div
                        className={`w-12 h-12 ${
                          colorClasses[
                            action.color as keyof typeof colorClasses
                          ].split(" ")[2]
                        } rounded-lg flex items-center justify-center`}
                      >
                        <Icon className="text-white w-6 h-6" />
                      </div>
                      <div className="text-center">
                        <p className="font-medium text-secondary text-sm">
                          {action.label}
                        </p>
                        <p className="text-xs text-gray-600">
                          {action.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100 mt-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-secondary">
                  Recent Activity
                </h3>
                <button className="text-primary hover:text-primary/80 text-sm font-medium">
                  View All
                </button>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Users className="text-green-600 w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-medium text-secondary">
                        New Student Enrollment
                      </div>
                      <div className="text-sm text-gray-500">
                        Michael Chen enrolled in Private Pilot Course
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">2 hours ago</div>
                    <div className="text-sm text-accent">+1 student</div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Plane className="text-blue-600 w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-medium text-secondary">
                        Aircraft Inquiry
                      </div>
                      <div className="text-sm text-gray-500">
                        New inquiry for Cessna 172 Skyhawk
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">4 hours ago</div>
                    <div className="text-sm text-accent">High priority</div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <ShoppingCart className="text-purple-600 w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-medium text-secondary">
                        Shop Order
                      </div>
                      <div className="text-sm text-gray-500">
                        New order for Pilot Headset Pro
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">6 hours ago</div>
                    <div className="text-sm text-accent">$249.99</div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Export Dialog */}
        <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <FileDown className="w-5 h-5 text-primary" />
                </div>
                <DialogTitle>Export Dashboard Report</DialogTitle>
              </div>
              <DialogDescription>
                Choose the format for your dashboard report export
              </DialogDescription>
            </DialogHeader>

            <div className="py-4">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Select Export Format
              </label>
              <div className="space-y-2">
                {["pdf", "csv", "excel"].map((format) => (
                  <button
                    key={format}
                    onClick={() =>
                      setExportFormat(format as "pdf" | "csv" | "excel")
                    }
                    className={`w-full px-4 py-3 rounded-lg border-2 transition-all text-left ${
                      exportFormat === format
                        ? "border-primary bg-primary/5"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-secondary capitalize">
                          {format.toUpperCase()}
                        </p>
                        <p className="text-sm text-gray-600">
                          {format === "pdf" &&
                            "Portable Document Format - Best for printing"}
                          {format === "csv" &&
                            "Comma-Separated Values - For spreadsheets"}
                          {format === "excel" &&
                            "Microsoft Excel Format - Advanced analysis"}
                        </p>
                      </div>
                      {exportFormat === format && (
                        <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                          <svg
                            className="w-3 h-3 text-white"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <DialogFooter>
              <button
                onClick={() => setIsExportDialogOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                disabled={isExporting}
              >
                Cancel
              </button>
              <button
                onClick={handleExport}
                disabled={isExporting}
                className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg flex items-center space-x-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isExporting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Exporting...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Export Report</span>
                  </>
                )}
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Quick Add Dialog */}
        <Dialog open={isQuickAddOpen} onOpenChange={setIsQuickAddOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Plus className="w-5 h-5 text-primary" />
                </div>
                <DialogTitle>Quick Add</DialogTitle>
              </div>
              <DialogDescription>
                Choose what you&apos;d like to create
              </DialogDescription>
            </DialogHeader>

            <div className="py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quickActions.map((action, index) => {
                  const Icon = action.icon;
                  const colorClasses = {
                    primary: "bg-primary/5 hover:bg-primary/10 bg-primary",
                    accent: "bg-accent/5 hover:bg-accent/10 bg-accent",
                    blue: "bg-blue-50 hover:bg-blue-100 bg-blue-500",
                    yellow: "bg-yellow-50 hover:bg-yellow-100 bg-yellow-500",
                    purple: "bg-purple-50 hover:bg-purple-100 bg-purple-500",
                    red: "bg-red-50 hover:bg-red-100 bg-red-500",
                  };

                  return (
                    <button
                      key={index}
                      onClick={() => {
                        setIsQuickAddOpen(false);
                        toast({
                          message: `Navigating to ${action.label}...`,
                          type: "info",
                          duration: 2000,
                        });
                        router.push(action.route);
                      }}
                      className={`flex items-center space-x-4 p-4 ${
                        colorClasses[
                          action.color as keyof typeof colorClasses
                        ].split(" ")[0]
                      } ${
                        colorClasses[
                          action.color as keyof typeof colorClasses
                        ].split(" ")[1]
                      } rounded-lg transition-all transform hover:scale-105`}
                    >
                      <div
                        className={`w-12 h-12 ${
                          colorClasses[
                            action.color as keyof typeof colorClasses
                          ].split(" ")[2]
                        } rounded-lg flex items-center justify-center shrink-0`}
                      >
                        <Icon className="text-white w-6 h-6" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-secondary text-sm">
                          {action.label}
                        </p>
                        <p className="text-xs text-gray-600">
                          {action.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <DialogFooter>
              <button
                onClick={() => setIsQuickAddOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
