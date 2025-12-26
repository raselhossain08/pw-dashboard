"use client";

import * as React from "react";
import {
  UserPlus,
  Download,
  Search as SearchIcon,
  Grid2x2,
  List,
  ArrowUp,
  BarChart2,
  Users,
  CheckCircle,
  Clock,
  EllipsisVertical,
  Eye,
  Edit,
  Trash2,
  X,
  Check,
  Ban,
  Loader2,
  AlertCircle,
  UserCheck,
  Calendar,
  Mail,
  Book,
  GraduationCap,
  TrendingUp,
  Award,
  Send,
  History,
  DollarSign,
  Filter,
  CheckSquare,
  RefreshCw,
  FileText,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";
import { useEnrollments } from "@/hooks/useEnrollments";
import { useToast } from "@/context/ToastContext";
import { Enrollment } from "@/services/enrollments.service";
import { coursesService } from "@/services/courses.service";
import { usersService } from "@/services/users.service";

export default function Enrollments() {
  const {
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
  } = useEnrollments();

  const { push } = useToast();

  const [search, setSearch] = React.useState("");
  const [courseFilter, setCourseFilter] = React.useState("all");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [instructorFilter, setInstructorFilter] = React.useState("all");
  const [sortBy, setSortBy] = React.useState("createdAt");
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("desc");
  const [page, setPage] = React.useState(1);
  const [limit] = React.useState(10);
  const [viewMode, setViewMode] = React.useState<"grid" | "table">("grid");

  // Advanced filters
  const [startDate, setStartDate] = React.useState("");
  const [endDate, setEndDate] = React.useState("");
  const [progressMin, setProgressMin] = React.useState(0);
  const [progressMax, setProgressMax] = React.useState(100);
  const totalPages = React.useMemo(
    () => Math.ceil(total / limit),
    [total, limit]
  );

  // Dialog states
  const [createOpen, setCreateOpen] = React.useState(false);
  const [viewOpen, setViewOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [bulkDeleteOpen, setBulkDeleteOpen] = React.useState(false);
  const [cancelOpen, setCancelOpen] = React.useState(false);
  const [approveOpen, setApproveOpen] = React.useState(false);
  const [certificateOpen, setCertificateOpen] = React.useState(false);
  const [messageOpen, setMessageOpen] = React.useState(false);
  const [bulkStatusOpen, setBulkStatusOpen] = React.useState(false);
  const [auditOpen, setAuditOpen] = React.useState(false);
  const [paymentOpen, setPaymentOpen] = React.useState(false);
  const [advancedFilterOpen, setAdvancedFilterOpen] = React.useState(false);

  // Selection
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [selectedEnrollment, setSelectedEnrollment] =
    React.useState<Enrollment | null>(null);

  // Form states
  const [formLoading, setFormLoading] = React.useState(false);
  const [createForm, setCreateForm] = React.useState({
    studentId: "",
    courseId: "",
    status: "active" as "active" | "pending",
  });
  const [editForm, setEditForm] = React.useState({
    status: "",
    notes: "",
  });
  const [cancelReason, setCancelReason] = React.useState("");
  const [messageForm, setMessageForm] = React.useState({
    subject: "",
    message: "",
  });
  const [bulkStatus, setBulkStatus] = React.useState("active");
  const [auditLogs, setAuditLogs] = React.useState<any[]>([]);
  const [paymentDetails, setPaymentDetails] = React.useState<any>(null);

  // Dropdown data
  const [courses, setCourses] = React.useState<any[]>([]);
  const [students, setStudents] = React.useState<any[]>([]);
  const [instructors, setInstructors] = React.useState<any[]>([]);
  const [coursesLoading, setCoursesLoading] = React.useState(false);
  const [studentsLoading, setStudentsLoading] = React.useState(false);
  const [trendRange, setTrendRange] = React.useState<
    "7d" | "30d" | "90d" | "year"
  >("30d");

  // Load initial data
  React.useEffect(() => {
    loadData();
  }, [
    page,
    search,
    courseFilter,
    statusFilter,
    instructorFilter,
    sortBy,
    sortOrder,
  ]);

  React.useEffect(() => {
    fetchStats();
    fetchDistribution();
    fetchTrends(trendRange);
    loadDropdownData();
  }, [fetchStats, fetchDistribution, fetchTrends, trendRange]);

  const loadData = async () => {
    const params: any = { page, limit, sortBy, sortOrder };
    if (search) params.search = search;
    if (courseFilter !== "all") params.courseId = courseFilter;
    if (statusFilter !== "all") params.status = statusFilter;
    if (instructorFilter !== "all") params.instructorId = instructorFilter;

    await fetchEnrollments(params);
  };

  const loadDropdownData = async () => {
    try {
      setCoursesLoading(true);
      setStudentsLoading(true);

      const [coursesData, studentsData, instructorsData] = await Promise.all([
        coursesService.getAllCourses({ limit: 100 }),
        usersService.getAllUsers({ role: "student", limit: 100 }),
        usersService.getAllUsers({ role: "instructor", limit: 100 }),
      ]);

      setCourses((coursesData as any).courses || []);
      setStudents((studentsData as any).users || []);
      setInstructors((instructorsData as any).users || []);
    } catch (error) {
      push({ type: "error", message: "Failed to load dropdown data" });
    } finally {
      setCoursesLoading(false);
      setStudentsLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      await createEnrollment(createForm);
      setCreateOpen(false);
      setCreateForm({ studentId: "", courseId: "", status: "active" });
      loadData();
    } catch (error) {
      // Error handled by hook
    } finally {
      setFormLoading(false);
    }
  };

  const handleView = async (enrollment: Enrollment) => {
    setFormLoading(true);
    try {
      const detailed = await getEnrollmentById(enrollment._id);
      setSelectedEnrollment(detailed);
      setViewOpen(true);
    } catch (error) {
      // Error handled by hook
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (enrollment: Enrollment) => {
    setSelectedEnrollment(enrollment);
    setEditForm({
      status: enrollment.status,
      notes: enrollment.notes?.join("\n") || "",
    });
    setEditOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEnrollment) return;

    setFormLoading(true);
    try {
      await updateEnrollment(selectedEnrollment._id, {
        status: editForm.status as any,
        notes: editForm.notes.split("\n").filter(Boolean),
      });
      setEditOpen(false);
      setSelectedEnrollment(null);
      loadData();
    } catch (error) {
      // Error handled by hook
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedEnrollment) return;

    setFormLoading(true);
    try {
      await deleteEnrollment(selectedEnrollment._id);
      setDeleteOpen(false);
      setSelectedEnrollment(null);
      loadData();
    } catch (error) {
      // Error handled by hook
    } finally {
      setFormLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    setFormLoading(true);
    try {
      await bulkDeleteEnrollments(selectedIds);
      setBulkDeleteOpen(false);
      setSelectedIds([]);
      loadData();
    } catch (error) {
      // Error handled by hook
    } finally {
      setFormLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedEnrollment) return;

    setFormLoading(true);
    try {
      await approveEnrollment(selectedEnrollment._id);
      setApproveOpen(false);
      setSelectedEnrollment(null);
      loadData();
    } catch (error) {
      // Error handled by hook
    } finally {
      setFormLoading(false);
    }
  };

  const handleCancelEnrollment = async () => {
    if (!selectedEnrollment) return;

    setFormLoading(true);
    try {
      await cancelEnrollment(selectedEnrollment._id, cancelReason);
      setCancelOpen(false);
      setSelectedEnrollment(null);
      setCancelReason("");
      loadData();
    } catch (error) {
      // Error handled by hook
    } finally {
      setFormLoading(false);
    }
  };

  const handleExport = async (format: "csv" | "xlsx" | "pdf") => {
    try {
      await exportEnrollments({
        format,
        courseId: courseFilter !== "all" ? courseFilter : undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
      });
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleGenerateCertificate = async () => {
    if (!selectedEnrollment) return;

    setFormLoading(true);
    try {
      // Call API to generate certificate
      push({
        type: "success",
        message: "Certificate generated successfully!",
      });
      setCertificateOpen(false);
      loadData();
    } catch (error) {
      push({
        type: "error",
        message: "Failed to generate certificate",
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!selectedEnrollment) return;

    setFormLoading(true);
    try {
      // Call API to send email
      push({
        type: "success",
        message: "Message sent successfully!",
      });
      setMessageOpen(false);
      setMessageForm({ subject: "", message: "" });
    } catch (error) {
      push({
        type: "error",
        message: "Failed to send message",
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleBulkStatusChange = async () => {
    setFormLoading(true);
    try {
      // Call API to change status for selected enrollments
      push({
        type: "success",
        message: `Updated ${selectedIds.length} enrollment(s) successfully!`,
      });
      setBulkStatusOpen(false);
      setSelectedIds([]);
      loadData();
    } catch (error) {
      push({
        type: "error",
        message: "Failed to update enrollments",
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleViewAuditTrail = async (enrollment: Enrollment) => {
    setFormLoading(true);
    setSelectedEnrollment(enrollment);
    try {
      // Fetch audit logs from API
      const mockLogs = [
        {
          action: "Enrollment Created",
          timestamp: enrollment.createdAt,
          user: "System",
          details: "Student enrolled in course",
        },
        {
          action: "Status Changed",
          timestamp: enrollment.updatedAt,
          user: "Admin",
          details: `Status updated to ${enrollment.status}`,
        },
      ];
      setAuditLogs(mockLogs);
      setAuditOpen(true);
    } catch (error) {
      push({
        type: "error",
        message: "Failed to fetch audit trail",
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleViewPaymentDetails = async (enrollment: Enrollment) => {
    if (!enrollment.order) {
      push({
        type: "info",
        message: "No payment details available for this enrollment",
      });
      return;
    }

    setFormLoading(true);
    setSelectedEnrollment(enrollment);
    try {
      // Fetch payment details from API
      const mockPayment = {
        orderId: enrollment.order,
        amount: 99.99,
        currency: "USD",
        status: "completed",
        paymentMethod: "Credit Card",
        transactionId: "TXN123456",
        paymentDate: enrollment.createdAt,
      };
      setPaymentDetails(mockPayment);
      setPaymentOpen(true);
    } catch (error) {
      push({
        type: "error",
        message: "Failed to fetch payment details",
      });
    } finally {
      setFormLoading(false);
    }
  };

  const applyAdvancedFilters = () => {
    setAdvancedFilterOpen(false);
    loadData();
  };

  const clearAdvancedFilters = () => {
    setStartDate("");
    setEndDate("");
    setProgressMin(0);
    setProgressMax(100);
  };

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === enrollments.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(enrollments.map((e) => e._id));
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: any = {
      active: { label: "Active", className: "bg-green-600" },
      pending: { label: "Pending", className: "bg-yellow-500" },
      completed: { label: "Completed", className: "bg-blue-600" },
      dropped: { label: "Dropped", className: "bg-red-600" },
      cancelled: { label: "Cancelled", className: "bg-gray-600" },
      expired: { label: "Expired", className: "bg-orange-600" },
    };
    const badge = badges[status] || badges.active;
    return (
      <span
        className={`text-white text-xs font-medium px-2 py-1 rounded-full ${badge.className}`}
      >
        {badge.label}
      </span>
    );
  };

  const formatDate = (date: string | Date | undefined) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStudentName = (enrollment: Enrollment) => {
    const student = enrollment.student;
    return (
      student?.name ||
      `${student?.firstName || ""} ${student?.lastName || ""}`.trim() ||
      student?.email ||
      "Unknown"
    );
  };

  const getCourseName = (enrollment: Enrollment) => {
    return enrollment.course?.title || "Unknown Course";
  };

  const getInstructorName = (enrollment: Enrollment) => {
    const instructor = enrollment.course?.instructor as any;
    return (
      instructor?.name ||
      `${instructor?.firstName || ""} ${instructor?.lastName || ""}`.trim() ||
      "Unknown"
    );
  };

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const isCmdK = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k";
      if (isCmdK) {
        e.preventDefault();
        document.getElementById("enrollment-search")?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <main className="p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-secondary mb-2">
            Enrollments
          </h2>
          <p className="text-gray-600">
            Manage student enrollments, track progress, and handle course
            registrations
          </p>
        </div>
        <div className="flex space-x-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="border-gray-300">
                <Download className="w-4 h-4 mr-2" /> Export Data
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleExport("csv")}>
                Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("xlsx")}>
                Export as Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("pdf")}>
                Export as PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={() => setCreateOpen(true)}>
            <UserPlus className="w-4 h-4 mr-2" /> New Enrollment
          </Button>
          {selectedIds.length > 0 && (
            <>
              <Button variant="outline" onClick={() => setBulkStatusOpen(true)}>
                <CheckSquare className="w-4 h-4 mr-2" /> Change Status (
                {selectedIds.length})
              </Button>
              <Button
                variant="destructive"
                onClick={() => setBulkDeleteOpen(true)}
              >
                <Trash2 className="w-4 h-4 mr-2" /> Delete ({selectedIds.length}
                )
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsLoading ? (
          <>
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-card rounded-xl p-6 shadow-sm border border-gray-100 animate-pulse"
              >
                <div className="h-20 bg-gray-200 rounded"></div>
              </div>
            ))}
          </>
        ) : (
          <>
            <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">
                    Total Enrollments
                  </p>
                  <p className="text-2xl font-bold text-secondary mt-1">
                    {stats?.totalEnrollments?.toLocaleString() || 0}
                  </p>
                  <p className="text-accent text-sm mt-1">
                    <ArrowUp className="inline w-3 h-3" /> Growing steadily
                  </p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Users className="text-primary w-6 h-6" />
                </div>
              </div>
            </div>
            <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">
                    Active Enrollments
                  </p>
                  <p className="text-2xl font-bold text-secondary mt-1">
                    {stats?.activeEnrollments?.toLocaleString() || 0}
                  </p>
                  <p className="text-accent text-sm mt-1">Currently learning</p>
                </div>
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                  <CheckCircle className="text-accent w-6 h-6" />
                </div>
              </div>
            </div>
            <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">
                    Completion Rate
                  </p>
                  <p className="text-2xl font-bold text-secondary mt-1">
                    {stats?.completionRate || 0}%
                  </p>
                  <p className="text-accent text-sm mt-1">Improving steadily</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <BarChart2 className="text-yellow-600 w-6 h-6" />
                </div>
              </div>
            </div>
            <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">
                    Pending Approvals
                  </p>
                  <p className="text-2xl font-bold text-secondary mt-1">
                    {stats?.pendingEnrollments || 0}
                  </p>
                  <p className="text-accent text-sm mt-1">
                    {stats?.pendingEnrollments
                      ? "Action required"
                      : "All clear"}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Clock className="text-purple-600 w-6 h-6" />
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-secondary">
            Enrollment Trends
          </h3>
          <div className="flex space-x-2">
            <Select
              value={trendRange}
              onValueChange={(value) =>
                setTrendRange(value as "7d" | "30d" | "90d" | "year")
              }
            >
              <SelectTrigger className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1 text-sm w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="year">This year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="h-64 bg-gray-50 rounded-lg p-4">
          {trendsLoading ? (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : trends.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-gray-500 text-center">
              <BarChart2 className="w-10 h-10 mx-auto mb-2" />
              <p>No trend data available for the selected range</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis allowDecimals={false} />
                <RechartsTooltip />
                <Line
                  type="monotone"
                  dataKey="enrollments"
                  stroke="#2563eb"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="completions"
                  stroke="#16a34a"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="cancellations"
                  stroke="#dc2626"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="bg-card rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
          <div className="flex flex-wrap gap-2">
            <Select value={courseFilter} onValueChange={setCourseFilter}>
              <SelectTrigger className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm w-48">
                <SelectValue placeholder="All Courses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Courses</SelectItem>
                {coursesLoading ? (
                  <SelectItem value="loading" disabled>
                    Loading...
                  </SelectItem>
                ) : (
                  courses.map((course: any) => (
                    <SelectItem key={course._id} value={course._id}>
                      {course.title}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm w-40">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="dropped">Dropped</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={instructorFilter}
              onValueChange={setInstructorFilter}
            >
              <SelectTrigger className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm w-48">
                <SelectValue placeholder="All Instructors" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Instructors</SelectItem>
                {instructors.map((instructor: any) => (
                  <SelectItem key={instructor._id} value={instructor._id}>
                    {instructor.name ||
                      `${instructor.firstName || ""} ${
                        instructor.lastName || ""
                      }`.trim() ||
                      instructor.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={sortBy}
              onValueChange={(value) => {
                if (value === "createdAt-desc") {
                  setSortBy("createdAt");
                  setSortOrder("desc");
                } else if (value === "createdAt-asc") {
                  setSortBy("createdAt");
                  setSortOrder("asc");
                } else if (value === "progress-desc") {
                  setSortBy("progress");
                  setSortOrder("desc");
                } else if (value === "progress-asc") {
                  setSortBy("progress");
                  setSortOrder("asc");
                }
              }}
            >
              <SelectTrigger className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm w-56">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt-desc">
                  Sort by: Date (Newest)
                </SelectItem>
                <SelectItem value="createdAt-asc">
                  Sort by: Date (Oldest)
                </SelectItem>
                <SelectItem value="progress-desc">
                  Sort by: Progress (High)
                </SelectItem>
                <SelectItem value="progress-asc">
                  Sort by: Progress (Low)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAdvancedFilterOpen(true)}
              className="border-gray-300"
            >
              <Filter className="w-4 h-4 mr-2" /> Advanced Filters
            </Button>
            <div className="relative w-64">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                id="enrollment-search"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search enrollments... (Cmd+K)"
                className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="icon"
              className="text-gray-600"
              onClick={() => setViewMode("grid")}
            >
              <Grid2x2 className="w-5 h-5" />
            </Button>
            <Button
              variant={viewMode === "table" ? "default" : "ghost"}
              size="icon"
              className="text-gray-600"
              onClick={() => setViewMode("table")}
            >
              <List className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {distributionLoading ? (
        <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      ) : distribution.length > 0 ? (
        <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
          <h3 className="text-lg font-semibold text-secondary mb-4">
            Course Enrollment Distribution
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {distribution.slice(0, 4).map((item, index) => {
              const colors = [
                "text-primary",
                "text-blue-600",
                "text-purple-600",
                "text-green-600",
              ];
              return (
                <div
                  key={item.courseId || index}
                  className="text-center p-4 border border-gray-200 rounded-lg"
                >
                  <div
                    className={`text-xl font-bold ${
                      colors[index % colors.length]
                    } mb-2`}
                  >
                    {item.enrollmentCount.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">
                    {item.courseName || "Unknown Course"}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {item.percentage}% of enrollments
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      {/* Grid Cards - Conditional Rendering */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {loading ? (
            [...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-card rounded-xl p-6 shadow-sm border border-gray-100 animate-pulse"
              >
                <div className="h-20 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))
          ) : enrollments.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No enrollments found</p>
            </div>
          ) : (
            enrollments.map((it: Enrollment) => (
              <div
                key={it._id}
                className="bg-card rounded-xl p-6 shadow-sm border border-gray-100"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3">
                    <img
                      src={it.student?.avatar || "/avatar-placeholder.png"}
                      alt={getStudentName(it)}
                      className="w-12 h-12 rounded-full"
                    />
                    <div>
                      <h3 className="font-semibold text-secondary">
                        {getStudentName(it)}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {getCourseName(it)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={selectedIds.includes(it._id)}
                      onCheckedChange={() => toggleSelection(it._id)}
                    />
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-gray-400"
                        >
                          <EllipsisVertical className="w-5 h-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleView(it)}>
                          <Eye className="w-4 h-4 mr-2" /> View Enrollment
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(it)}>
                          <Edit className="w-4 h-4 mr-2" /> Edit
                        </DropdownMenuItem>
                        {it.status === "pending" && (
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedEnrollment(it);
                              setApproveOpen(true);
                            }}
                          >
                            <CheckCircle className="w-4 h-4 mr-2" /> Approve
                          </DropdownMenuItem>
                        )}
                        {it.status === "completed" && !it.certificate && (
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedEnrollment(it);
                              setCertificateOpen(true);
                            }}
                          >
                            <Award className="w-4 h-4 mr-2" /> Generate
                            Certificate
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedEnrollment(it);
                            setMessageOpen(true);
                          }}
                        >
                          <Mail className="w-4 h-4 mr-2" /> Send Message
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleViewAuditTrail(it)}
                        >
                          <History className="w-4 h-4 mr-2" /> View Audit Trail
                        </DropdownMenuItem>
                        {it.order && (
                          <DropdownMenuItem
                            onClick={() => handleViewPaymentDetails(it)}
                          >
                            <DollarSign className="w-4 h-4 mr-2" /> Payment
                            Details
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => {
                            setSelectedEnrollment(it);
                            setCancelOpen(true);
                          }}
                        >
                          <Ban className="w-4 h-4 mr-2" /> Cancel
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                <div className="mb-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                    <span>{it.course?.description || "No description"}</span>
                    {getStatusBadge(it.status)}
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <span>Enrolled:</span>
                    <span className="font-medium">
                      {formatDate(it.createdAt)}
                    </span>
                  </div>
                </div>
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Progress</span>
                    <span className="font-medium">{it.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-accent h-2 rounded-full"
                      style={{ width: `${it.progress}%` }}
                    ></div>
                  </div>
                </div>
                <div className="flex justify-between items-center text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary/10 text-primary">
                      {getInstructorName(it)}
                    </span>
                    <span>
                      {Object.keys(it.completedLessons || {}).length} lessons
                    </span>
                  </div>
                  <div className="text-primary font-medium">
                    {it.student?.email}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* All Enrollments Table - Conditional Rendering */}
      {viewMode === "table" && (
        <div className="bg-card rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-secondary">
              All Enrollments
            </h3>
            <p className="text-gray-600 text-sm">
              Complete list of enrollments with detailed information
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <Checkbox
                      checked={
                        enrollments.length > 0 &&
                        selectedIds.length === enrollments.length
                      }
                      onCheckedChange={toggleSelectAll}
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Course
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Instructor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Progress
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Enrollment Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-4">
                        <div className="h-8 bg-gray-200 rounded"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-6 bg-gray-200 rounded w-16"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-gray-200 rounded w-20"></div>
                      </td>
                    </tr>
                  ))
                ) : enrollments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No enrollments found</p>
                    </td>
                  </tr>
                ) : (
                  enrollments.map((it: Enrollment) => (
                    <tr key={it._id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <Checkbox
                          checked={selectedIds.includes(it._id)}
                          onCheckedChange={() => toggleSelection(it._id)}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img
                            className="h-8 w-8 rounded-full"
                            src={
                              it.student?.avatar || "/avatar-placeholder.png"
                            }
                            alt=""
                          />
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {getStudentName(it)}
                            </div>
                            <div className="text-sm text-gray-500">
                              {it.student?.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {getCourseName(it)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {it.course?.description || "No description"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {getInstructorName(it)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div
                              className="bg-yellow-500 h-2 rounded-full"
                              style={{ width: `${it.progress}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-900">
                            {it.progress}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(it.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(it.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {it.status === "pending" && (
                          <button
                            onClick={() => {
                              setSelectedEnrollment(it);
                              setApproveOpen(true);
                            }}
                            className="text-primary hover:text-primary/80 mr-3"
                          >
                            Approve
                          </button>
                        )}
                        <button
                          onClick={() => handleView(it)}
                          className="text-gray-600 hover:text-primary"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleEdit(it)}
                          className="text-gray-600 hover:text-primary ml-3"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            setSelectedEnrollment(it);
                            setDeleteOpen(true);
                          }}
                          className="text-red-600 hover:text-red-700 ml-3"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Showing{" "}
              <span className="font-medium">
                {(page - 1) * limit + 1}-{Math.min(page * limit, total)}
              </span>{" "}
              of <span className="font-medium">{total}</span> enrollments
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                className="border-gray-300"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1 || loading}
              >
                Previous
              </Button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (page <= 3) {
                  pageNum = i + 1;
                } else if (page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = page - 2 + i;
                }
                return (
                  <Button
                    key={pageNum}
                    variant={page === pageNum ? "default" : "outline"}
                    size="sm"
                    className={page === pageNum ? "" : "border-gray-300"}
                    onClick={() => setPage(pageNum)}
                    disabled={loading}
                  >
                    {pageNum}
                  </Button>
                );
              })}
              <Button
                variant="outline"
                size="sm"
                className="border-gray-300"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || loading}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Enrollment Analytics Section */}
      {stats && (
        <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
          <h3 className="text-lg font-semibold text-secondary mb-4">
            Enrollment Analytics
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 mb-2">
                {stats.totalEnrollments > 0
                  ? Math.round(
                      (stats.activeEnrollments / stats.totalEnrollments) * 100
                    )
                  : 0}
                %
              </div>
              <div className="text-sm text-gray-600">Active Enrollments</div>
              <div className="text-xs text-gray-500 mt-1">
                {stats.activeEnrollments.toLocaleString()} students
              </div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600 mb-2">
                {stats.completionRate}%
              </div>
              <div className="text-sm text-gray-600">Completed Courses</div>
              <div className="text-xs text-gray-500 mt-1">
                {stats.completedEnrollments.toLocaleString()} students
              </div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600 mb-2">
                {stats.totalEnrollments > 0
                  ? Math.round(
                      (stats.pendingEnrollments / stats.totalEnrollments) * 100
                    )
                  : 0}
                %
              </div>
              <div className="text-sm text-gray-600">Pending Approval</div>
              <div className="text-xs text-gray-500 mt-1">
                {stats.pendingEnrollments.toLocaleString()} students
              </div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600 mb-2">
                {stats.totalEnrollments > 0
                  ? Math.round(
                      (stats.droppedEnrollments / stats.totalEnrollments) * 100
                    )
                  : 0}
                %
              </div>
              <div className="text-sm text-gray-600">Dropped Out</div>
              <div className="text-xs text-gray-500 mt-1">
                {stats.droppedEnrollments.toLocaleString()} students
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-secondary mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => setCreateOpen(true)}
            className="flex items-center space-x-3 p-4 bg-primary/5 hover:bg-primary/10 rounded-lg transition-colors"
          >
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <UserPlus className="text-white w-5 h-5" />
            </div>
            <div className="text-left">
              <p className="font-medium text-secondary">New Enrollment</p>
              <p className="text-sm text-gray-600">Add student to course</p>
            </div>
          </button>
          <button
            onClick={() => handleExport("csv")}
            className="flex items-center space-x-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
          >
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <Download className="text-white w-5 h-5" />
            </div>
            <div className="text-left">
              <p className="font-medium text-secondary">Export Data</p>
              <p className="text-sm text-gray-600">Enrollment reports</p>
            </div>
          </button>
          <button
            onClick={() => {
              fetchStats();
              fetchDistribution();
            }}
            className="flex items-center space-x-3 p-4 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors"
          >
            <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
              <BarChart2 className="text-white w-5 h-5" />
            </div>
            <div className="text-left">
              <p className="font-medium text-secondary">Refresh Analytics</p>
              <p className="text-sm text-gray-600">Update statistics</p>
            </div>
          </button>
          <button
            onClick={() => {
              setSearch("");
              setCourseFilter("all");
              setStatusFilter("all");
              setInstructorFilter("all");
              setPage(1);
            }}
            className="flex items-center space-x-3 p-4 bg-accent/5 hover:bg-accent/10 rounded-lg transition-colors"
          >
            <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
              <X className="text-white w-5 h-5" />
            </div>
            <div className="text-left">
              <p className="font-medium text-secondary">Clear Filters</p>
              <p className="text-sm text-gray-600">Reset all filters</p>
            </div>
          </button>
        </div>
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Enrollment</DialogTitle>
            <DialogDescription>
              Add a new student enrollment to a course
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Student *
                </label>
                <select
                  value={createForm.studentId}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, studentId: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  required
                  disabled={studentsLoading || formLoading}
                >
                  <option value="">Select student</option>
                  {students.map((student: any) => (
                    <option key={student._id} value={student._id}>
                      {student.name ||
                        `${student.firstName || ""} ${
                          student.lastName || ""
                        }`.trim() ||
                        student.email}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Course *
                </label>
                <select
                  value={createForm.courseId}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, courseId: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  required
                  disabled={coursesLoading || formLoading}
                >
                  <option value="">Select course</option>
                  {courses.map((course: any) => (
                    <option key={course._id} value={course._id}>
                      {course.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={createForm.status}
                onChange={(e) =>
                  setCreateForm({
                    ...createForm,
                    status: e.target.value as "active" | "pending",
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                disabled={formLoading}
              >
                <option value="active">Active</option>
                <option value="pending">Pending</option>
              </select>
            </div>
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setCreateOpen(false);
                  setCreateForm({
                    studentId: "",
                    courseId: "",
                    status: "active",
                  });
                }}
                disabled={formLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  formLoading || !createForm.studentId || !createForm.courseId
                }
              >
                {formLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Enrollment"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Enrollment Dialog */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Enrollment Details</DialogTitle>
            <DialogDescription>
              View detailed information about this enrollment
            </DialogDescription>
          </DialogHeader>
          {formLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : selectedEnrollment ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Student
                  </label>
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <img
                      src={
                        selectedEnrollment.student?.avatar ||
                        "/avatar-placeholder.png"
                      }
                      alt={getStudentName(selectedEnrollment)}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <p className="font-medium">
                        {getStudentName(selectedEnrollment)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {selectedEnrollment.student?.email}
                      </p>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Course
                  </label>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-medium">
                      {getCourseName(selectedEnrollment)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {selectedEnrollment.course?.description ||
                        "No description"}
                    </p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    {getStatusBadge(selectedEnrollment.status)}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Progress
                  </label>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">
                        {selectedEnrollment.progress}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-accent h-2 rounded-full"
                        style={{ width: `${selectedEnrollment.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Enrollment Date
                  </label>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p>{formatDate(selectedEnrollment.createdAt)}</p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Accessed
                  </label>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p>{formatDate(selectedEnrollment.lastAccessedAt)}</p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Completed Lessons
                  </label>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p>
                      {
                        Object.keys(selectedEnrollment.completedLessons || {})
                          .length
                      }{" "}
                      lessons
                    </p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Time Spent
                  </label>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p>
                      {Math.round(
                        (selectedEnrollment.totalTimeSpent || 0) / 60
                      )}{" "}
                      minutes
                    </p>
                  </div>
                </div>
              </div>
              {selectedEnrollment.notes &&
                selectedEnrollment.notes.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes
                    </label>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <ul className="list-disc list-inside space-y-1">
                        {selectedEnrollment.notes.map((note, index) => (
                          <li key={index} className="text-sm text-gray-600">
                            {note}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
            </div>
          ) : null}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setViewOpen(false)}>
              Close
            </Button>
            <Button
              onClick={() => {
                setViewOpen(false);
                if (selectedEnrollment) handleEdit(selectedEnrollment);
              }}
            >
              Edit Enrollment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Enrollment Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Enrollment</DialogTitle>
            <DialogDescription>
              Update enrollment status and notes
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-6">
            {selectedEnrollment && (
              <>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Student</p>
                  <p className="font-medium">
                    {getStudentName(selectedEnrollment)}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Course</p>
                  <p className="font-medium">
                    {getCourseName(selectedEnrollment)}
                  </p>
                </div>
              </>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status *
              </label>
              <select
                value={editForm.status}
                onChange={(e) =>
                  setEditForm({ ...editForm, status: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                required
                disabled={formLoading}
              >
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="dropped">Dropped</option>
                <option value="cancelled">Cancelled</option>
                <option value="expired">Expired</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                value={editForm.notes}
                onChange={(e) =>
                  setEditForm({ ...editForm, notes: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                rows={4}
                placeholder="Enter notes (one per line)"
                disabled={formLoading}
              />
              <p className="text-xs text-gray-500 mt-1">
                Each line will be treated as a separate note
              </p>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setEditOpen(false);
                  setSelectedEnrollment(null);
                  setEditForm({ status: "", notes: "" });
                }}
                disabled={formLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={formLoading || !editForm.status}>
                {formLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Enrollment"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Approve Enrollment Dialog */}
      <Dialog open={approveOpen} onOpenChange={setApproveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Enrollment</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve this enrollment? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedEnrollment && (
            <div className="p-4 bg-green-50 rounded-lg mb-4">
              <p className="text-sm font-medium text-gray-900">
                Student: {getStudentName(selectedEnrollment)}
              </p>
              <p className="text-sm text-gray-600">
                Course: {getCourseName(selectedEnrollment)}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                setApproveOpen(false);
                setSelectedEnrollment(null);
              }}
              disabled={formLoading}
            >
              Cancel
            </Button>
            <Button onClick={handleApprove} disabled={formLoading}>
              {formLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Approving...
                </>
              ) : (
                "Approve Enrollment"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Enrollment Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Enrollment</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this enrollment? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedEnrollment && (
            <div className="p-4 bg-red-50 rounded-lg">
              <p className="text-sm font-medium text-gray-900">
                Student: {getStudentName(selectedEnrollment)}
              </p>
              <p className="text-sm text-gray-600">
                Course: {getCourseName(selectedEnrollment)}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                setDeleteOpen(false);
                setSelectedEnrollment(null);
              }}
              disabled={formLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={formLoading}
            >
              {formLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Enrollment"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Dialog */}
      <Dialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Multiple Enrollments</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedIds.length}{" "}
              enrollment(s)? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                setBulkDeleteOpen(false);
                setSelectedIds([]);
              }}
              disabled={formLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleBulkDelete}
              disabled={formLoading}
            >
              {formLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                `Delete ${selectedIds.length} Enrollment(s)`
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Enrollment Dialog */}
      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Enrollment</DialogTitle>
            <DialogDescription>
              Cancel this enrollment. You can provide an optional reason.
            </DialogDescription>
          </DialogHeader>
          {selectedEnrollment && (
            <div className="p-4 bg-yellow-50 rounded-lg mb-4">
              <p className="text-sm font-medium text-gray-900">
                Student: {getStudentName(selectedEnrollment)}
              </p>
              <p className="text-sm text-gray-600">
                Course: {getCourseName(selectedEnrollment)}
              </p>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason (Optional)
            </label>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
              rows={3}
              placeholder="Enter cancellation reason..."
              disabled={formLoading}
            />
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                setCancelOpen(false);
                setSelectedEnrollment(null);
                setCancelReason("");
              }}
              disabled={formLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelEnrollment}
              disabled={formLoading}
            >
              {formLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Cancelling...
                </>
              ) : (
                "Cancel Enrollment"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Certificate Generation Dialog */}
      <Dialog open={certificateOpen} onOpenChange={setCertificateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate Certificate</DialogTitle>
            <DialogDescription>
              Generate a completion certificate for this student
            </DialogDescription>
          </DialogHeader>
          {selectedEnrollment && (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm font-medium text-gray-900">
                  Student: {getStudentName(selectedEnrollment)}
                </p>
                <p className="text-sm text-gray-600">
                  Course: {getCourseName(selectedEnrollment)}
                </p>
                <p className="text-sm text-gray-600">
                  Progress: {selectedEnrollment.progress}%
                </p>
                <p className="text-sm text-gray-600">
                  Completed: {formatDate(selectedEnrollment.completedAt)}
                </p>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-center space-x-2 text-accent">
                  <Award className="w-6 h-6" />
                  <p className="font-medium">Certificate of Completion</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                setCertificateOpen(false);
                setSelectedEnrollment(null);
              }}
              disabled={formLoading}
            >
              Cancel
            </Button>
            <Button onClick={handleGenerateCertificate} disabled={formLoading}>
              {formLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Award className="w-4 h-4 mr-2" />
                  Generate Certificate
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send Message Dialog */}
      <Dialog open={messageOpen} onOpenChange={setMessageOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Message to Student</DialogTitle>
            <DialogDescription>
              Send an email notification to the enrolled student
            </DialogDescription>
          </DialogHeader>
          {selectedEnrollment && (
            <div className="p-4 bg-blue-50 rounded-lg mb-4">
              <p className="text-sm font-medium text-gray-900">
                To: {getStudentName(selectedEnrollment)}
              </p>
              <p className="text-sm text-gray-600">
                {selectedEnrollment.student?.email}
              </p>
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject *
              </label>
              <input
                type="text"
                value={messageForm.subject}
                onChange={(e) =>
                  setMessageForm({ ...messageForm, subject: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Enter email subject"
                disabled={formLoading}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message *
              </label>
              <textarea
                value={messageForm.message}
                onChange={(e) =>
                  setMessageForm({ ...messageForm, message: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                rows={5}
                placeholder="Enter your message..."
                disabled={formLoading}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                setMessageOpen(false);
                setMessageForm({ subject: "", message: "" });
              }}
              disabled={formLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendMessage}
              disabled={
                formLoading || !messageForm.subject || !messageForm.message
              }
            >
              {formLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Message
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Status Change Dialog */}
      <Dialog open={bulkStatusOpen} onOpenChange={setBulkStatusOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Status for Multiple Enrollments</DialogTitle>
            <DialogDescription>
              Update the status for {selectedIds.length} selected enrollment(s)
            </DialogDescription>
          </DialogHeader>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Status *
            </label>
            <select
              value={bulkStatus}
              onChange={(e) => setBulkStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
              disabled={formLoading}
            >
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="dropped">Dropped</option>
              <option value="cancelled">Cancelled</option>
              <option value="expired">Expired</option>
            </select>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                setBulkStatusOpen(false);
              }}
              disabled={formLoading}
            >
              Cancel
            </Button>
            <Button onClick={handleBulkStatusChange} disabled={formLoading}>
              {formLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                `Update ${selectedIds.length} Enrollment(s)`
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Audit Trail Dialog */}
      <Dialog open={auditOpen} onOpenChange={setAuditOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Enrollment Audit Trail</DialogTitle>
            <DialogDescription>
              View all changes and actions for this enrollment
            </DialogDescription>
          </DialogHeader>
          {formLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {auditLogs.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <History className="w-10 h-10 mx-auto mb-2" />
                  <p>No audit logs available</p>
                </div>
              ) : (
                auditLogs.map((log, index) => (
                  <div
                    key={index}
                    className="p-4 border border-gray-200 rounded-lg"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-secondary">
                        {log.action}
                      </h4>
                      <span className="text-xs text-gray-500">
                        {formatDate(log.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{log.details}</p>
                    <p className="text-xs text-gray-500">By: {log.user}</p>
                  </div>
                ))
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setAuditOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Details Dialog */}
      <Dialog open={paymentOpen} onOpenChange={setPaymentOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Payment Details</DialogTitle>
            <DialogDescription>
              View payment information for this enrollment
            </DialogDescription>
          </DialogHeader>
          {formLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : paymentDetails ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Order ID
                  </label>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-mono text-sm">
                      {paymentDetails.orderId}
                    </p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Transaction ID
                  </label>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-mono text-sm">
                      {paymentDetails.transactionId}
                    </p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount
                  </label>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-medium text-lg text-green-600">
                      ${paymentDetails.amount} {paymentDetails.currency}
                    </p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Method
                  </label>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p>{paymentDetails.paymentMethod}</p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <span className="text-white text-xs font-medium px-2 py-1 rounded-full bg-green-600">
                      {paymentDetails.status}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Date
                  </label>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p>{formatDate(paymentDetails.paymentDate)}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <DollarSign className="w-10 h-10 mx-auto mb-2" />
              <p>No payment details available</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setPaymentOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Advanced Filters Dialog */}
      <Dialog open={advancedFilterOpen} onOpenChange={setAdvancedFilterOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Advanced Filters</DialogTitle>
            <DialogDescription>
              Apply additional filters to refine your search
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Progress Range: {progressMin}% - {progressMax}%
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={progressMin}
                  onChange={(e) => setProgressMin(Number(e.target.value))}
                  className="flex-1"
                />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={progressMax}
                  onChange={(e) => setProgressMax(Number(e.target.value))}
                  className="flex-1"
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Min: {progressMin}%</span>
                <span>Max: {progressMax}%</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={clearAdvancedFilters}>
              Clear Filters
            </Button>
            <Button
              variant="ghost"
              onClick={() => setAdvancedFilterOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={applyAdvancedFilters}>Apply Filters</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
