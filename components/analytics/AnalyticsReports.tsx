"use client";

import * as React from "react";
import {
  Search as SearchIcon,
  Calendar,
  FileText,
  Download,
  CreditCard,
  ShoppingCart,
  TrendingUp,
  Users as UsersIcon,
  EllipsisVertical,
  BarChart3,
  PieChart,
  Eye,
  Check,
  Loader2,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  X,
  FileDown,
  Clock,
  AlertCircle,
  CheckCircle2,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Power,
  PowerOff,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useAnalytics,
  ReportItem,
  ReportType,
  ReportStatus,
} from "@/hooks/useAnalytics";
import { useToast } from "@/context/ToastContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDistanceToNow } from "date-fns";
import { RevenueChart } from "./charts/RevenueChart";
import { CustomerAcquisitionChart } from "./charts/CustomerAcquisitionChart";
import { AdvancedFilters } from "./AdvancedFilters";
import { ReportPreview } from "./ReportPreview";
import { ScheduleReportDialog, ScheduleData } from "./ScheduleReportDialog";

export default function AnalyticsReports() {
  const { push } = useToast();
  const [period, setPeriod] = React.useState<"day" | "week" | "month" | "year">(
    "month"
  );
  const [reportType, setReportType] = React.useState<ReportType>("Overview");
  const [activeTab, setActiveTab] = React.useState<
    "Overview" | "Sales" | "Customers" | "Products" | "Marketing"
  >("Overview");
  const [search, setSearch] = React.useState("");
  const [exportOpen, setExportOpen] = React.useState(false);
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [selectedReport, setSelectedReport] = React.useState<ReportItem | null>(
    null
  );
  const [exportFormat, setExportFormat] = React.useState<
    "pdf" | "csv" | "xlsx"
  >("pdf");

  // NEW: Additional state
  const [chartPeriod, setChartPeriod] = React.useState<
    "monthly" | "quarterly" | "yearly"
  >("monthly");
  const [showAdvancedFilters, setShowAdvancedFilters] = React.useState(false);
  const [advancedFilters, setAdvancedFilters] = React.useState<any>({});
  const [autoRefresh, setAutoRefresh] = React.useState(false);
  const [selectedReports, setSelectedReports] = React.useState<string[]>([]);
  const [previewOpen, setPreviewOpen] = React.useState(false);
  const [scheduleOpen, setScheduleOpen] = React.useState(false);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize] = React.useState(10);
  const [sortConfig, setSortConfig] = React.useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);

  // Form state
  const [formData, setFormData] = React.useState({
    name: "",
    description: "",
    type: "Overview" as ReportType,
    period: "",
    status: "draft" as ReportStatus,
    autoGenerate: false,
  });

  // Use analytics hook
  const {
    dashboard,
    revenueData,
    conversionRates,
    geoData,
    coursePerformance,
    reports,
    loadingDashboard,
    loadingRevenue,
    loadingReports,
    isLoading,
    createReport,
    updateReport,
    deleteReport,
    generateReport,
    exportReport,
    scheduleReport,
    bulkDeleteReports,
    bulkExportReports,
    isCreating,
    isUpdating,
    isDeleting,
    isGenerating,
    isExporting,
    isScheduling,
    isBulkDeleting,
    isBulkExporting,
    refreshAll,
  } = useAnalytics({ period, reportType });

  // Auto-refresh effect
  React.useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      refreshAll();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, refreshAll]);

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === "n") {
          e.preventDefault();
          setCreateDialogOpen(true);
        }
        if (e.key === "r") {
          e.preventDefault();
          refreshAll();
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [refreshAll]);

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      type: "Overview",
      period: "",
      status: "draft",
      autoGenerate: false,
    });
  };

  const handleCreate = () => {
    if (!formData.name || !formData.period) {
      push({ message: "Please fill in all required fields", type: "error" });
      return;
    }
    createReport(formData);
    setCreateDialogOpen(false);
    resetForm();
  };

  const handleEdit = () => {
    if (!selectedReport || !formData.name) {
      push({ message: "Invalid report data", type: "error" });
      return;
    }
    updateReport(selectedReport._id || selectedReport.id || "", formData);
    setEditDialogOpen(false);
    setSelectedReport(null);
    resetForm();
  };

  const handleDelete = () => {
    if (!selectedReport) return;
    deleteReport(selectedReport._id || selectedReport.id || "");
    setDeleteDialogOpen(false);
    setSelectedReport(null);
  };

  const openEditDialog = (report: ReportItem) => {
    setSelectedReport(report);
    setFormData({
      name: report.name,
      description: report.description || "",
      type: report.type,
      period: report.period,
      status: report.status,
      autoGenerate: false,
    });
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (report: ReportItem) => {
    setSelectedReport(report);
    setDeleteDialogOpen(true);
  };

  const handleGenerate = (reportId: string) => {
    generateReport(reportId);
  };

  const handleExport = (report: ReportItem) => {
    setSelectedReport(report);
    setExportOpen(true);
  };

  const confirmExport = () => {
    if (!selectedReport) return;
    exportReport(selectedReport._id || selectedReport.id || "", exportFormat);
    setExportOpen(false);
  };

  const filteredReports = React.useMemo(() => {
    let filtered = reports.filter((r: ReportItem) => {
      const matchesSearch = r.name.toLowerCase().includes(search.toLowerCase());
      const matchesStatus =
        !advancedFilters.statuses?.length ||
        advancedFilters.statuses.includes(r.status);
      const matchesType =
        !advancedFilters.types?.length ||
        advancedFilters.types.includes(r.type);
      return matchesSearch && matchesStatus && matchesType;
    });

    // Apply sorting
    if (sortConfig) {
      filtered = [...filtered].sort((a, b) => {
        const aValue = (a as any)[sortConfig.key];
        const bValue = (b as any)[sortConfig.key];

        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [reports, search, advancedFilters, sortConfig]);

  // Pagination
  const paginatedReports = React.useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredReports.slice(startIndex, endIndex);
  }, [filteredReports, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredReports.length / pageSize);

  // NEW: Bulk operations handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedReports(paginatedReports.map((r) => r._id || r.id || ""));
    } else {
      setSelectedReports([]);
    }
  };

  const handleSelectReport = (reportId: string, checked: boolean) => {
    if (checked) {
      setSelectedReports([...selectedReports, reportId]);
    } else {
      setSelectedReports(selectedReports.filter((id) => id !== reportId));
    }
  };

  const handleBulkDelete = () => {
    if (selectedReports.length === 0) return;
    if (confirm(`Delete ${selectedReports.length} reports?`)) {
      bulkDeleteReports(selectedReports);
      setSelectedReports([]);
    }
  };

  const handleBulkExport = () => {
    if (selectedReports.length === 0) return;
    bulkExportReports(selectedReports, exportFormat);
  };

  const handleSort = (key: string) => {
    setSortConfig((current) => ({
      key,
      direction:
        current?.key === key && current.direction === "asc" ? "desc" : "asc",
    }));
  };

  const handlePreview = (report: ReportItem) => {
    setSelectedReport(report);
    setPreviewOpen(true);
  };

  const handleSchedule = (data: ScheduleData) => {
    scheduleReport(data);
    setScheduleOpen(false);
  };

  const handleViewDetails = () => {
    push({ message: "Opening detailed funnel analysis...", type: "info" });
    // Navigate or open detailed view
  };

  const handleViewAllProducts = () => {
    push({ message: "Opening full product list...", type: "info" });
    // Navigate to products page
  };

  const handleViewReport = () => {
    push({ message: "Opening detailed acquisition report...", type: "info" });
    // Navigate or open report
  };

  const filteredReports_old = reports.filter((r: ReportItem) => {
    const matchesSearch = r.name.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  const statusConfig = {
    generated: {
      color: "bg-green-100 text-green-700 border-green-200",
      icon: CheckCircle2,
      label: "Generated",
    },
    scheduled: {
      color: "bg-blue-100 text-blue-700 border-blue-200",
      icon: Clock,
      label: "Scheduled",
    },
    failed: {
      color: "bg-red-100 text-red-700 border-red-200",
      icon: AlertCircle,
      label: "Failed",
    },
    draft: {
      color: "bg-gray-100 text-gray-700 border-gray-200",
      icon: FileText,
      label: "Draft",
    },
  };

  const funnel = [
    {
      label: "Page Views",
      value: ((conversionRates as any)?.funnelData?.visits ||
        (conversionRates as any)?.visits ||
        0) as number,
      pct: 100,
      bg: "bg-blue-500",
      icon: Eye,
      iconBg: "bg-blue-100",
      iconFg: "text-blue-600",
    },
    {
      label: "Add to Cart",
      value: ((conversionRates as any)?.addsToCart ?? 0) as number,
      pct: Number(
        (((conversionRates as any)?.addsToCart ?? 0) /
          Math.max(
            (conversionRates as any)?.funnelData?.visits ||
              (conversionRates as any)?.visits ||
              1,
            1
          )) *
          100
      ).toFixed(1),
      bg: "bg-purple-500",
      icon: ShoppingCart,
      iconBg: "bg-purple-100",
      iconFg: "text-purple-600",
    },
    {
      label: "Checkout",
      value: ((conversionRates as any)?.checkouts ?? 0) as number,
      pct: Number(
        (((conversionRates as any)?.checkouts ?? 0) /
          Math.max(
            (conversionRates as any)?.funnelData?.visits ||
              (conversionRates as any)?.visits ||
              1,
            1
          )) *
          100
      ).toFixed(1),
      bg: "bg-green-500",
      icon: CreditCard,
      iconBg: "bg-green-100",
      iconFg: "text-green-600",
    },
    {
      label: "Purchases",
      value: ((conversionRates as any)?.funnelData?.purchases ||
        (conversionRates as any)?.purchases ||
        0) as number,
      pct: Number(
        (((conversionRates as any)?.funnelData?.purchases ||
          (conversionRates as any)?.purchases ||
          0) /
          Math.max(
            (conversionRates as any)?.funnelData?.visits ||
              (conversionRates as any)?.visits ||
              1,
            1
          )) *
          100
      ).toFixed(1),
      bg: "bg-accent",
      icon: Check,
      iconBg: "bg-accent",
      iconFg: "text-white",
    },
  ];

  type CoursePerfItem = {
    title?: string;
    name?: string;
    enrollments?: number;
    sales?: number;
    revenue?: number | string;
    change?: string;
  };
  const topProducts = (
    ((coursePerformance as any)?.topPerformers || []) as CoursePerfItem[]
  ).map((c) => ({
    name: c?.title || c?.name || "",
    sales: c?.enrollments || c?.sales || 0,
    revenue:
      typeof c?.revenue === "number"
        ? `$${(c.revenue as number).toLocaleString()}`
        : c?.revenue || "",
    change: c?.change || "",
  }));

  type GeoItem = {
    country?: string;
    label?: string;
    name?: string;
    percentage?: number;
    pct?: number;
    visitsPct?: number;
    revenue?: number | string;
  };
  const geoArray = Array.isArray((geoData as any)?.countries)
    ? (geoData as any).countries
    : Array.isArray(geoData)
    ? geoData
    : [];
  const geo = (geoArray as GeoItem[]).slice(0, 10).map((g, i: number) => ({
    label: g?.country || g?.label || g?.name || `Country ${i + 1}`,
    pct: (typeof g?.percentage === "number"
      ? g.percentage
      : typeof g?.pct === "number"
      ? g.pct
      : typeof g?.visitsPct === "number"
      ? g.visitsPct
      : 0) as number,
    revenue:
      typeof g?.revenue === "number"
        ? `$${(g.revenue as number).toLocaleString()}`
        : g?.revenue || "",
    bar: [
      "bg-blue-500",
      "bg-green-500",
      "bg-purple-500",
      "bg-indigo-500",
      "bg-teal-500",
    ][i % 5],
  }));

  return (
    <main className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-secondary mb-2 flex items-center gap-2">
            <BarChart3 className="w-8 h-8 text-primary" />
            Analytics & Reports
          </h2>
          <p className="text-gray-600">
            Track performance metrics and generate business reports
          </p>
        </div>
        <div className="flex space-x-3 items-center flex-wrap">
          {(loadingDashboard || loadingRevenue) && (
            <span className="inline-flex items-center text-sm text-gray-500">
              <Loader2 className="w-4 h-4 animate-spin mr-2" /> Loading data
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            className={`border-gray-300 transition-colors ${
              autoRefresh
                ? "bg-green-50 border-green-500 text-green-700"
                : "hover:bg-gray-50"
            }`}
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            {autoRefresh ? (
              <Power className="w-4 h-4 mr-2" />
            ) : (
              <PowerOff className="w-4 h-4 mr-2" />
            )}
            Auto-refresh {autoRefresh ? "ON" : "OFF"}
          </Button>
          <Button
            variant="outline"
            className="border-gray-300 hover:bg-gray-50 transition-colors"
            onClick={refreshAll}
            disabled={isLoading}
          >
            <RefreshCw className="w-4 h-4 mr-2" /> Refresh
          </Button>
          <Button
            onClick={() => setScheduleOpen(true)}
            variant="outline"
            className="border-primary text-primary hover:bg-primary/10"
          >
            <Clock className="w-4 h-4 mr-2" /> Schedule
          </Button>
          <Button
            onClick={() => setCreateDialogOpen(true)}
            className="bg-primary hover:bg-primary/90 transition-all shadow-md hover:shadow-lg"
          >
            <Plus className="w-4 h-4 mr-2" /> Create Report
          </Button>
        </div>
      </div>

      {/* Tabs */}

      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as typeof activeTab)}
        className="w-full"
      >
        <TabsList className="bg-card rounded-xl p-1 shadow-sm border border-gray-100">
          {(
            ["Overview", "Sales", "Customers", "Products", "Marketing"] as const
          ).map((tab) => (
            <TabsTrigger
              key={tab}
              value={tab}
              className="data-[state=active]:bg-primary data-[state=active]:text-white px-6 py-2 rounded-lg transition-all"
            >
              {tab}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="Overview" className="mt-6">
          {/* Overview content shown when Overview tab is active */}
        </TabsContent>
        <TabsContent value="Sales" className="mt-6">
          <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-secondary mb-4">
              Sales Analytics
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">Total Sales</p>
                <p className="text-2xl font-bold text-blue-600">
                  {revenueData
                    ? `$${
                        (revenueData as any)?.totalRevenue?.toLocaleString() ||
                        0
                      }`
                    : "—"}
                </p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-green-600">
                  {revenueData
                    ? (revenueData as any)?.totalOrders?.toLocaleString() || 0
                    : "—"}
                </p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-gray-600">Average Order Value</p>
                <p className="text-2xl font-bold text-purple-600">
                  {revenueData && (revenueData as any)?.totalOrders > 0
                    ? `$${Math.round(
                        ((revenueData as any)?.totalRevenue || 0) /
                          ((revenueData as any)?.totalOrders || 1)
                      )}`
                    : "—"}
                </p>
              </div>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="Customers" className="mt-6">
          <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-secondary mb-4">
              Customer Analytics
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">Active Users</h4>
                <p className="text-3xl font-bold text-primary">
                  {dashboard
                    ? (
                        dashboard as any
                      )?.overview?.activeUsers?.toLocaleString() || 0
                    : "—"}
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">New Customers</h4>
                <p className="text-3xl font-bold text-green-600">
                  {dashboard
                    ? (
                        dashboard as any
                      )?.userStats?.newUsers?.toLocaleString() || 0
                    : "—"}
                </p>
              </div>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="Products" className="mt-6">
          <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-secondary mb-4">
              Product Performance
            </h3>
            <div className="space-y-4">
              {topProducts.length > 0 ? (
                topProducts.slice(0, 5).map((p, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <div className="font-medium">{p.name}</div>
                      <div className="text-sm text-gray-500">
                        {p.sales} enrollments
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{p.revenue}</div>
                      {p.change && (
                        <div className="text-xs text-accent">{p.change}</div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">
                  No product data available
                </p>
              )}
            </div>
          </div>
        </TabsContent>
        <TabsContent value="Marketing" className="mt-6">
          <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-secondary mb-4">
              Marketing Analytics
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">Conversion Rate</h4>
                <p className="text-3xl font-bold text-primary">
                  {dashboard
                    ? `${(
                        (dashboard as any)?.overview?.conversionRate || 0
                      ).toFixed(1)}%`
                    : "—"}
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Total Enrollments</h4>
                <p className="text-3xl font-bold text-green-600">
                  {dashboard
                    ? (
                        dashboard as any
                      )?.overview?.totalEnrollments?.toLocaleString() || 0
                    : "—"}
                </p>
              </div>
            </div>
            <div className="mt-6">
              <h4 className="font-medium mb-4">Geographic Distribution</h4>
              <div className="space-y-3">
                {geo.slice(0, 5).map((g, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm">{g.label}</span>
                      <span className="text-sm font-medium">{g.pct}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`${g.bar} rounded-full h-2 transition-all`}
                        style={{ width: `${g.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Filters */}
      <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {[
              { label: "Today", value: "day" },
              { label: "Last 7 days", value: "week" },
              { label: "Last 30 days", value: "month" },
              { label: "This Year", value: "year" },
            ].map(({ label, value }) => (
              <Button
                key={value}
                variant={period === value ? "default" : "secondary"}
                className={
                  period === value
                    ? "shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }
                onClick={() => setPeriod(value as typeof period)}
              >
                <Calendar className="w-4 h-4 mr-2" /> {label}
              </Button>
            ))}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={showAdvancedFilters ? "bg-primary text-white" : ""}
            >
              <Filter className="w-4 h-4 mr-2" />
              {showAdvancedFilters ? "Hide" : "Show"} Filters
            </Button>
            <Select
              value={reportType}
              onValueChange={(v) => setReportType(v as ReportType)}
            >
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Report type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Overview">All Reports</SelectItem>
                <SelectItem value="Sales">Sales</SelectItem>
                <SelectItem value="Engagement">Engagement</SelectItem>
                <SelectItem value="Traffic">Traffic</SelectItem>
                <SelectItem value="Custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            type="text"
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            placeholder="Search reports and metrics... (Ctrl+K)"
          />
        </div>
        {showAdvancedFilters && (
          <AdvancedFilters
            currentFilters={advancedFilters}
            onFiltersChange={setAdvancedFilters}
          />
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: "Total Revenue",
            value: (dashboard as any)?.overview?.totalRevenue,
            format: "currency",
            growth: (revenueData as any)?.growth,
            icon: CreditCard,
            color: "primary",
          },
          {
            label: "Enrollments",
            value: (dashboard as any)?.overview?.totalEnrollments,
            format: "number",
            subtext: `${
              (dashboard as any)?.overview?.conversionRate?.toFixed(1) || 0
            }% CR`,
            icon: ShoppingCart,
            color: "blue",
          },
          {
            label: "Conversion Rate",
            value: (dashboard as any)?.overview?.conversionRate,
            format: "percent",
            icon: TrendingUp,
            color: "green",
          },
          {
            label: "Active Users",
            value: (dashboard as any)?.overview?.activeUsers,
            format: "number",
            icon: UsersIcon,
            color: "purple",
          },
        ].map((stat, idx) => (
          <div
            key={idx}
            className="bg-card rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-gray-600 text-sm font-medium">
                  {stat.label}
                </p>
                <p className="text-2xl font-bold text-secondary mt-1">
                  {stat.format === "currency" && typeof stat.value === "number"
                    ? `$${stat.value.toLocaleString()}`
                    : stat.format === "percent" &&
                      typeof stat.value === "number"
                    ? `${stat.value.toFixed(1)}%`
                    : typeof stat.value === "number"
                    ? stat.value.toLocaleString()
                    : "—"}
                </p>
                {stat.growth !== undefined && (
                  <p
                    className={`text-sm mt-1 flex items-center gap-1 ${
                      stat.growth > 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {stat.growth > 0 ? (
                      <ArrowUpRight className="w-4 h-4" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4" />
                    )}
                    {stat.growth > 0 ? "+" : ""}
                    {stat.growth.toFixed(1)}%
                  </p>
                )}
                {stat.subtext && (
                  <p className="text-accent text-sm mt-1">{stat.subtext}</p>
                )}
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <stat.icon className="text-primary w-6 h-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-secondary flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Revenue Overview
            </h3>
            <div className="flex space-x-2">
              {(["monthly", "quarterly", "yearly"] as const).map((btn) => (
                <button
                  key={btn}
                  onClick={() => setChartPeriod(btn)}
                  className={`px-3 py-1 rounded-lg text-sm transition-all ${
                    chartPeriod === btn
                      ? "bg-primary text-white shadow-sm"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {btn.charAt(0).toUpperCase() + btn.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <RevenueChart
            data={(revenueData as any)?.chartData || []}
            period={period}
            isLoading={loadingRevenue}
            chartPeriod={chartPeriod}
          />
        </div>

        <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-secondary flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Sales Funnel
            </h3>
            <button
              onClick={handleViewDetails}
              className="text-primary hover:text-primary/80 text-sm font-medium transition-colors"
            >
              View Details
            </button>
          </div>
          <div className="space-y-4">
            {funnel.map((step, i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-8 h-8 ${step.iconBg} rounded-lg flex items-center justify-center transition-transform hover:scale-110`}
                    >
                      <step.icon className={`${step.iconFg} w-4 h-4`} />
                    </div>
                    <span className="text-sm font-medium">{step.label}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      {step.value.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">{step.pct}%</div>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className={`${step.bg} rounded-full h-2 transition-all duration-500`}
                    style={{ width: `${step.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-secondary">
              Top Performing Products
            </h3>
            <button
              onClick={handleViewAllProducts}
              className="text-primary hover:text-primary/80 text-sm font-medium"
            >
              View All
            </button>
          </div>
          <div className="space-y-4">
            {topProducts.map((p, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-linear-to-br from-primary/20 to-primary/10 flex items-center justify-center font-bold text-primary">
                    {i + 1}
                  </div>
                  <div>
                    <div className="font-medium text-sm">{p.name}</div>
                    <div className="text-xs text-gray-500">
                      {p.sales} enrollments
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-sm">{p.revenue}</div>
                  {p.change && (
                    <div className="text-xs text-accent">{p.change}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-secondary">
              Customer Acquisition
            </h3>
            <button
              onClick={handleViewReport}
              className="text-primary hover:text-primary/80 text-sm font-medium"
            >
              View Report
            </button>
          </div>
          <CustomerAcquisitionChart isLoading={loadingDashboard} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-secondary mb-4">
            Geographic Distribution
          </h3>
          <div className="space-y-4">
            {geo.map((g, i) => (
              <div key={i}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-6 h-4 ${g.bar} rounded-sm`} />
                    <span className="text-sm">{g.label}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-medium">{g.pct}%</span>
                    <span className="text-xs text-gray-500 ml-2">
                      {g.revenue}
                    </span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`${g.bar} rounded-full h-2`}
                    style={{ width: `${g.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-secondary mb-4">
            Device Analytics
          </h3>
          <div className="space-y-4">
            {[
              { label: "Desktop", pct: 58, bar: "bg-blue-500" },
              { label: "Mobile", pct: 34, bar: "bg-green-500" },
              { label: "Tablet", pct: 8, bar: "bg-purple-500" },
            ].map((d, i) => (
              <div key={i}>
                <div className="flex items-center justify-between">
                  <span className="text-sm">{d.label}</span>
                  <span className="text-sm font-medium">{d.pct}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`${d.bar} rounded-full h-2`}
                    style={{ width: `${d.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reports Table - Always visible */}
      <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-semibold text-secondary">
              Reports{" "}
              {filteredReports.length > 0 && `(${filteredReports.length})`}
            </h3>
            {selectedReports.length > 0 && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {selectedReports.length} selected
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkExport}
                  disabled={isBulkExporting}
                >
                  <Download className="w-4 h-4 mr-1" />
                  Export
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleBulkDelete}
                  disabled={isBulkDeleting}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </Button>
              </div>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="text-secondary">
                <EllipsisVertical className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setCreateDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" /> Create Report
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setScheduleOpen(true)}>
                <Clock className="w-4 h-4 mr-2" /> Schedule Report
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setExportOpen(true)}>
                <Download className="w-4 h-4 mr-2" /> Export Table
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {loadingReports ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No reports found</p>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" /> Create Your First Report
            </Button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-gray-500 text-sm border-b">
                    <th className="pb-3 w-10">
                      <Checkbox
                        checked={
                          selectedReports.length === paginatedReports.length &&
                          paginatedReports.length > 0
                        }
                        onCheckedChange={handleSelectAll}
                      />
                    </th>
                    <th
                      className="pb-3 font-medium cursor-pointer hover:text-primary"
                      onClick={() => handleSort("name")}
                    >
                      Name{" "}
                      {sortConfig?.key === "name" &&
                        (sortConfig.direction === "asc" ? "↑" : "↓")}
                    </th>
                    <th className="pb-3 font-medium">Type</th>
                    <th className="pb-3 font-medium">Period</th>
                    <th
                      className="pb-3 font-medium cursor-pointer hover:text-primary"
                      onClick={() => handleSort("status")}
                    >
                      Status{" "}
                      {sortConfig?.key === "status" &&
                        (sortConfig.direction === "asc" ? "↑" : "↓")}
                    </th>
                    <th
                      className="pb-3 font-medium cursor-pointer hover:text-primary"
                      onClick={() => handleSort("createdAt")}
                    >
                      Created{" "}
                      {sortConfig?.key === "createdAt" &&
                        (sortConfig.direction === "asc" ? "↑" : "↓")}
                    </th>
                    <th className="pb-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {paginatedReports.map((report: ReportItem) => {
                    const StatusIcon = statusConfig[report.status].icon;
                    const reportId = report._id || report.id || "";
                    const isSelected = selectedReports.includes(reportId);

                    return (
                      <tr
                        key={reportId}
                        className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                          isSelected ? "bg-primary/5" : ""
                        }`}
                      >
                        <td className="py-3">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) =>
                              handleSelectReport(reportId, checked as boolean)
                            }
                          />
                        </td>
                        <td
                          className="py-3 font-medium text-secondary cursor-pointer hover:text-primary"
                          onClick={() => handlePreview(report)}
                        >
                          {report.name}
                        </td>
                        <td className="py-3">
                          <Badge variant="outline">{report.type}</Badge>
                        </td>
                        <td className="py-3 text-gray-600">{report.period}</td>
                        <td className="py-3">
                          <div
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs border ${
                              statusConfig[report.status].color
                            }`}
                          >
                            <StatusIcon className="w-3 h-3" />
                            {statusConfig[report.status].label}
                          </div>
                        </td>
                        <td className="py-3 text-gray-500">
                          {report.createdAt
                            ? formatDistanceToNow(new Date(report.createdAt), {
                                addSuffix: true,
                              })
                            : "—"}
                        </td>
                        <td className="py-3">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handlePreview(report)}
                              title="Preview"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            {report.status === "draft" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleGenerate(reportId)}
                                disabled={isGenerating}
                                title="Generate"
                              >
                                <FileText className="w-4 h-4" />
                              </Button>
                            )}
                            {report.status === "generated" &&
                              report.fileUrl && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleExport(report)}
                                  disabled={isExporting}
                                  title="Export"
                                >
                                  <Download className="w-4 h-4" />
                                </Button>
                              )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditDialog(report)}
                              disabled={isUpdating}
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openDeleteDialog(report)}
                              disabled={isDeleting}
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <div className="text-sm text-gray-600">
                  Showing {(currentPage - 1) * pageSize + 1} to{" "}
                  {Math.min(currentPage * pageSize, filteredReports.length)} of{" "}
                  {filteredReports.length} reports
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(
                        (page) =>
                          page === 1 ||
                          page === totalPages ||
                          Math.abs(page - currentPage) <= 1
                      )
                      .map((page, idx, arr) => (
                        <React.Fragment key={page}>
                          {idx > 0 && arr[idx - 1] !== page - 1 && (
                            <span className="px-2">...</span>
                          )}
                          <Button
                            variant={
                              currentPage === page ? "default" : "outline"
                            }
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                            className="min-w-8"
                          >
                            {page}
                          </Button>
                        </React.Fragment>
                      ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Report Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Plus className="w-5 h-5 mr-2 text-primary" /> Create New Report
            </DialogTitle>
            <DialogDescription>
              Create a new analytics report with custom parameters
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="report-name">Report Name *</Label>
              <Input
                id="report-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., Monthly Sales Report"
              />
            </div>
            <div>
              <Label htmlFor="report-description">Description</Label>
              <Textarea
                id="report-description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Optional description"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="report-type">Report Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(v) =>
                    setFormData({ ...formData, type: v as ReportType })
                  }
                >
                  <SelectTrigger id="report-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Overview">Overview</SelectItem>
                    <SelectItem value="Sales">Sales</SelectItem>
                    <SelectItem value="Engagement">Engagement</SelectItem>
                    <SelectItem value="Traffic">Traffic</SelectItem>
                    <SelectItem value="Custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="report-period">Period *</Label>
                <Select
                  value={formData.period}
                  onValueChange={(v) => setFormData({ ...formData, period: v })}
                >
                  <SelectTrigger id="report-period">
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="day">Today</SelectItem>
                    <SelectItem value="week">Last 7 days</SelectItem>
                    <SelectItem value="month">Last 30 days</SelectItem>
                    <SelectItem value="year">This Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setCreateDialogOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={isCreating}>
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" /> Create Report
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Report Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Edit className="w-5 h-5 mr-2 text-primary" /> Edit Report
            </DialogTitle>
            <DialogDescription>
              Update report details and settings
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="edit-report-name">Report Name *</Label>
              <Input
                id="edit-report-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., Monthly Sales Report"
              />
            </div>
            <div>
              <Label htmlFor="edit-report-description">Description</Label>
              <Textarea
                id="edit-report-description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Optional description"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-report-type">Report Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(v) =>
                    setFormData({ ...formData, type: v as ReportType })
                  }
                >
                  <SelectTrigger id="edit-report-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Overview">Overview</SelectItem>
                    <SelectItem value="Sales">Sales</SelectItem>
                    <SelectItem value="Engagement">Engagement</SelectItem>
                    <SelectItem value="Traffic">Traffic</SelectItem>
                    <SelectItem value="Custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-report-period">Period *</Label>
                <Select
                  value={formData.period}
                  onValueChange={(v) => setFormData({ ...formData, period: v })}
                >
                  <SelectTrigger id="edit-report-period">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="day">Today</SelectItem>
                    <SelectItem value="week">Last 7 days</SelectItem>
                    <SelectItem value="month">Last 30 days</SelectItem>
                    <SelectItem value="year">This Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEditDialogOpen(false);
                setSelectedReport(null);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleEdit} disabled={isUpdating}>
              {isUpdating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Updating...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" /> Save Changes
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Report Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <AlertCircle className="w-5 h-5 mr-2 text-red-500" /> Delete
              Report
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedReport?.name}"? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setSelectedReport(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" /> Delete
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export Report Dialog */}
      <Dialog open={exportOpen} onOpenChange={setExportOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Download className="w-5 h-5 mr-2 text-primary" /> Export Report
            </DialogTitle>
            <DialogDescription>
              Export "{selectedReport?.name}" in your preferred format
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="export-format">Export Format</Label>
              <Select
                value={exportFormat}
                onValueChange={(v) =>
                  setExportFormat(v as "pdf" | "csv" | "xlsx")
                }
              >
                <SelectTrigger id="export-format" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="xlsx">Excel (XLSX)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setExportOpen(false);
                setSelectedReport(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmExport}
              disabled={isExporting || !selectedReport}
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Exporting...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" /> Export
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Report Preview Dialog */}
      <ReportPreview
        report={selectedReport}
        open={previewOpen}
        onClose={() => {
          setPreviewOpen(false);
          setSelectedReport(null);
        }}
        onExport={handleExport}
      />

      {/* Schedule Report Dialog */}
      <ScheduleReportDialog
        open={scheduleOpen}
        onClose={() => setScheduleOpen(false)}
        onSchedule={handleSchedule}
        report={selectedReport}
        isScheduling={isScheduling}
      />
    </main>
  );
}
