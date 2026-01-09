"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/context/ToastContext";
import { useCourses } from "@/hooks/useCourses";
import { coursesService, Course } from "@/services/courses.service";
import { courseCategoriesService } from "@/services/course-categories.service";
import {
  Filter,
  Plus,
  Download,
  Grid3x3,
  List,
  RefreshCw,
  Power,
  PowerOff,
  CheckSquare,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Eye,
  Copy,
  Edit,
  MoreVertical,
  Star,
  Users,
  Book,
} from "lucide-react";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import CourseStats from "./CourseStats";
import { useAuth } from "@/context/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
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
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import CoursesTable from "./CoursesTable";

export default function Courses() {
  const router = useRouter();
  const { push } = useToast();
  const { user } = useAuth();
  const {
    courses,
    loading: coursesLoading,
    stats: backendStats,
    statsLoading,
    fetchCourses,
    deleteCourse: deleteCourseHook,
    duplicateCourse: duplicateCourseHook,
    publishCourse: publishCourseHook,
    unpublishCourse: unpublishCourseHook,
    toggleCourseStatus,
    bulkDeleteCourses,
    bulkToggleStatus,
    bulkPublish,
    bulkUnpublish,
    exportCourses,
    refreshCourses,
    getCourseStats,
  } = useCourses();
  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [categoryFilter, setCategoryFilter] =
    React.useState<string>("All Categories");
  const [statusFilter, setStatusFilter] = React.useState<string>("All Status");
  const [sortBy, setSortBy] = React.useState<string>("Newest");
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [actionLoading, setActionLoading] = React.useState(false);
  const [viewMode, setViewMode] = React.useState<"table" | "grid">("table");
  const [isExporting, setIsExporting] = React.useState(false);
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [bulkDeleteOpen, setBulkDeleteOpen] = React.useState(false);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [itemsPerPage] = React.useState(12);

  // Fetch categories from API
  const { data: categoriesData } = useQuery({
    queryKey: ["course-categories"],
    queryFn: () => courseCategoriesService.getAllCategories(),
    staleTime: 60000,
  });

  // Debounce search input
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch courses when filters change
  React.useEffect(() => {
    const params: any = { page: currentPage, limit: itemsPerPage };
    if (debouncedSearch) params.search = debouncedSearch;
    if (statusFilter !== "All Status") {
      params.status = statusFilter.toLowerCase();
    }
    if (categoryFilter !== "All Categories") {
      params.category = categoryFilter;
    }
    fetchCourses(params);
  }, [debouncedSearch, statusFilter, categoryFilter, currentPage, itemsPerPage]);

  // Fetch stats on mount
  React.useEffect(() => {
    getCourseStats();
  }, [getCourseStats]);

  const roleCanManage =
    user?.role === "super_admin" ||
    user?.role === "admin" ||
    user?.role === "instructor";

  const categoryOptions = React.useMemo(() => {
    const categoryList = categoriesData?.data?.categories ?? [];
    const activeCategories = categoryList
      .filter((cat: any) => cat.isActive !== false)
      .map((cat: any) => cat.name)
      .sort();
    return ["All Categories", ...activeCategories];
  }, [categoriesData]);

  const filteredCourses = React.useMemo(() => {
    let filtered = [...courses];

    if (categoryFilter !== "All Categories") {
      filtered = filtered.filter(
        (c) => c.categories && c.categories.includes(categoryFilter)
      );
    }

    if (statusFilter !== "All Status") {
      filtered = filtered.filter((c) => {
        const status = c.status || (c.isPublished ? "published" : "draft");
        return status === statusFilter.toLowerCase();
      });
    }

    if (search) {
      filtered = filtered.filter(
        (c) =>
          c.title.toLowerCase().includes(search.toLowerCase()) ||
          (c.description || "").toLowerCase().includes(search.toLowerCase())
      );
    }

    // Sort
    if (sortBy === "Newest") {
      filtered.sort(
        (a, b) =>
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime()
      );
    } else if (sortBy === "Oldest") {
      filtered.sort(
        (a, b) =>
          new Date(a.createdAt || 0).getTime() -
          new Date(b.createdAt || 0).getTime()
      );
    } else if (sortBy === "Most Popular") {
      filtered.sort(
        (a, b) => (b.enrollmentCount || 0) - (a.enrollmentCount || 0)
      );
    } else if (sortBy === "Highest Rated") {
      filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    return filtered;
  }, [courses, categoryFilter, statusFilter, search, sortBy]);

  const stats = React.useMemo(() => {
    // Use backend stats if available, otherwise calculate from courses
    if (backendStats) {
      const discountImpact = coursesService.calculateDiscountImpact(courses);
      return {
        totalCourses: backendStats.totalCourses || courses.length,
        totalStudents:
          backendStats.totalStudents ||
          courses.reduce((sum, c) => sum + (c.enrollmentCount || 0), 0),
        avgRating:
          backendStats.averageRating ||
          (courses.length > 0
            ? courses.reduce((sum, c) => sum + (c.rating || 0), 0) /
              courses.length
            : 0),
        published:
          backendStats.publishedCourses ||
          courses.filter((c) => c.isPublished || c.status === "published")
            .length,
        discountImpact,
      };
    }

    // Fallback to calculated stats
    const totalCourses = courses.length;
    const totalStudents = courses.reduce(
      (sum, c) => sum + (c.enrollmentCount || 0),
      0
    );
    const avgRating =
      courses.length > 0
        ? courses.reduce((sum, c) => sum + (c.rating || 0), 0) / courses.length
        : 0;
    const published = courses.filter(
      (c) => c.isPublished || c.status === "published"
    ).length;

    // Calculate discount impact
    const discountImpact = coursesService.calculateDiscountImpact(courses);

    return {
      totalCourses,
      totalStudents,
      avgRating,
      published,
      discountImpact,
    };
  }, [courses, backendStats]);

  const handleDelete = async () => {
    if (!deleteId) return;
    setActionLoading(true);
    try {
      await deleteCourseHook(deleteId);
      setDeleteId(null);
    } catch (err) {
      console.error("Failed to delete course:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDuplicate = async (courseId: string) => {
    setActionLoading(true);
    try {
      await duplicateCourseHook(courseId);
    } catch (err) {
      console.error("Failed to duplicate course:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handlePublish = async (courseId: string) => {
    setActionLoading(true);
    try {
      await publishCourseHook(courseId);
    } catch (err) {
      console.error("Failed to publish course:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnpublish = async (courseId: string) => {
    setActionLoading(true);
    try {
      await unpublishCourseHook(courseId);
    } catch (err) {
      console.error("Failed to unpublish course:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async (courseId: string) => {
    setActionLoading(true);
    try {
      await toggleCourseStatus(courseId);
    } catch (err) {
      console.error("Failed to toggle course status:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    setActionLoading(true);
    try {
      await bulkDeleteCourses(selectedIds);
      setSelectedIds([]);
      setBulkDeleteOpen(false);
    } catch (err) {
      console.error("Failed to bulk delete courses:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleBulkToggleStatus = async () => {
    if (selectedIds.length === 0) return;
    setActionLoading(true);
    try {
      await bulkToggleStatus(selectedIds);
      setSelectedIds([]);
    } catch (err) {
      console.error("Failed to bulk toggle status:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleBulkPublish = async () => {
    if (selectedIds.length === 0) return;
    setActionLoading(true);
    try {
      await bulkPublish(selectedIds);
      setSelectedIds([]);
    } catch (err) {
      console.error("Failed to bulk publish courses:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleBulkUnpublish = async () => {
    if (selectedIds.length === 0) return;
    setActionLoading(true);
    try {
      await bulkUnpublish(selectedIds);
      setSelectedIds([]);
    } catch (err) {
      console.error("Failed to bulk unpublish courses:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredCourses.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(
        filteredCourses
          .map((c) => c.id || c._id)
          .filter((id): id is string => !!id)
      );
    }
  };

  const handleEdit = (course: Course) => {
    router.push(`/courses/${course.id || course._id}/edit`);
  };

  const handleReorder = async (reorderedCourses: Course[]) => {

    push({ type: "success", message: "Course order updated" });
  };

  const handleExport = async (format: "csv" | "xlsx" | "pdf") => {
    setIsExporting(true);
    try {
      await exportCourses(format, {
        status:
          statusFilter !== "All Status"
            ? statusFilter.toLowerCase()
            : undefined,
        category:
          categoryFilter !== "All Categories" ? categoryFilter : undefined,
      });
    } catch (err) {
      console.error("Failed to export courses:", err);
    } finally {
      setIsExporting(false);
    }
  };

  if (coursesLoading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-secondary mb-2">
              Courses Management
            </h2>
            <p className="text-gray-600">Loading courses...</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-gray-100 rounded-xl p-6 animate-pulse h-32"
            />
          ))}
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
          <div className="h-10 bg-gray-100 rounded animate-pulse" />
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-20 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6 lg:mb-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-secondary mb-2">
            Courses Management
          </h2>
          <p className="text-sm sm:text-base text-gray-600">
            Manage your aviation training courses and enrollments
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-white border border-gray-200 rounded-lg p-1">
            <Button
              variant={viewMode === "table" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("table")}
              className="px-2 sm:px-3"
              title="Table View"
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="px-2 sm:px-3"
              title="Grid View"
            >
              <Grid3x3 className="w-4 h-4" />
            </Button>
          </div>

          {/* Export Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                disabled={isExporting || filteredCourses.length === 0}
                className="hidden sm:flex"
              >
                {isExporting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                <span className="hidden md:inline">Export</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
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

          {/* Refresh Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => refreshCourses()}
            disabled={coursesLoading}
            title="Refresh"
          >
            <RefreshCw
              className={`w-4 h-4 ${coursesLoading ? "animate-spin" : ""}`}
            />
          </Button>

          {/* Create Course Button */}
          {roleCanManage && (
            <Button
              onClick={() => router.push("/courses/create")}
              size="sm"
              className="bg-primary hover:bg-primary/90 text-white"
            >
              <Plus className="w-4 sm:w-5 h-4 sm:h-5 sm:mr-2" />
              <span className="hidden sm:inline">Create Course</span>
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <CourseStats stats={stats} />

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 mb-6">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
          <div className="flex-1 min-w-0">
            <input
              type="text"
              placeholder="Search courses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-5 h-5 text-gray-400 hidden sm:block" />
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Status">All Status</SelectItem>
                <SelectItem value="Published">Published</SelectItem>
                <SelectItem value="Draft">Draft</SelectItem>
                <SelectItem value="Archived">Archived</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Newest">Newest</SelectItem>
                <SelectItem value="Oldest">Oldest</SelectItem>
                <SelectItem value="Most Popular">Most Popular</SelectItem>
                <SelectItem value="Highest Rated">Highest Rated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedIds.length > 0 && (
        <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckSquare className="w-5 h-5 text-primary" />
            <span className="font-medium text-secondary">
              {selectedIds.length} course{selectedIds.length > 1 ? "s" : ""}{" "}
              selected
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleBulkPublish}
              disabled={actionLoading}
            >
              <Power className="w-4 h-4 mr-2" />
              Publish
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleBulkUnpublish}
              disabled={actionLoading}
            >
              <PowerOff className="w-4 h-4 mr-2" />
              Unpublish
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleBulkToggleStatus}
              disabled={actionLoading}
            >
              Toggle Status
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setBulkDeleteOpen(true)}
              disabled={actionLoading}
              className="text-red-600 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedIds([])}
            >
              Clear Selection
            </Button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredCourses.length === 0 && !coursesLoading && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="flex flex-col items-center justify-center">
            <div className="bg-gray-100 rounded-full p-6 mb-4">
              <Book className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No Courses Found
            </h3>
            <p className="text-gray-500 mb-6 max-w-md">
              {search || categoryFilter !== "All Categories" || statusFilter !== "All Status"
                ? "No courses match your current filters. Try adjusting your search criteria."
                : "Get started by creating your first course to begin teaching students."}
            </p>
            {roleCanManage && (
              <Button
                onClick={() => router.push("/courses/create")}
                className="bg-primary hover:bg-primary/90 text-white"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Your First Course
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Data Display */}
      {filteredCourses.length > 0 && (
        viewMode === "table" ? (
          <CoursesTable
            courses={filteredCourses}
            onEdit={handleEdit}
            onDelete={(id) => setDeleteId(id)}
            onDuplicate={handleDuplicate}
            onPublish={handlePublish}
            onUnpublish={handleUnpublish}
            onToggleStatus={handleToggleStatus}
            onReorder={handleReorder}
            actionLoading={actionLoading ? "loading" : null}
            viewMode={viewMode}
            selectedIds={selectedIds}
            onToggleSelection={toggleSelection}
            onToggleSelectAll={toggleSelectAll}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mb-6">
            {filteredCourses.map((course) => {
            const courseId = course.id || course._id;
            const isSelected = selectedIds.includes(courseId);
            const statusColor =
              course.status === "published"
                ? "bg-green-100 text-green-700"
                : course.status === "draft"
                ? "bg-yellow-100 text-yellow-700"
                : "bg-gray-100 text-gray-700";

            return (
              <Card
                key={courseId}
                className="overflow-hidden hover:shadow-lg transition-shadow relative group"
              >
                {/* Selection Checkbox */}
                <div className="absolute top-3 left-3 z-10">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelection(courseId)}
                    className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                  />
                </div>

                {/* Course Thumbnail */}
                <div className="relative h-40 sm:h-48 bg-gradient-to-br from-primary/20 to-purple-100">
                  {course.thumbnail ? (
                    <Image
                      src={course.thumbnail}
                      alt={course.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Book className="w-12 h-12 text-primary/30" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    <Badge className={statusColor}>
                      {course.status || (course.isPublished ? "published" : "draft")}
                    </Badge>
                  </div>
                </div>

                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-base sm:text-lg line-clamp-2 flex-1">
                      {course.title}
                    </h3>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => router.push(`/courses/${courseId}`)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(course)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDuplicate(courseId)}
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {(course.status === "published" ||
                          course.isPublished) && (
                          <DropdownMenuItem
                            onClick={() => handleUnpublish(courseId)}
                          >
                            <PowerOff className="w-4 h-4 mr-2" />
                            Unpublish
                          </DropdownMenuItem>
                        )}
                        {(course.status === "draft" || !course.isPublished) && (
                          <DropdownMenuItem
                            onClick={() => handlePublish(courseId)}
                          >
                            <Power className="w-4 h-4 mr-2" />
                            Publish
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => setDeleteId(courseId)}
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  {course.excerpt && (
                    <p className="text-sm text-gray-600 line-clamp-2 mt-2">
                      {course.excerpt}
                    </p>
                  )}
                </CardHeader>

                <CardContent className="space-y-3 pb-3">
                  <div className="flex items-center justify-between text-sm">
                    <Badge variant="outline" className="capitalize">
                      {course.level}
                    </Badge>
                    <Badge variant="outline" className="capitalize">
                      {course.type}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-sm font-medium">
                        {(course.rating || 0).toFixed(1)}
                      </span>
                      <span className="text-xs text-gray-500">
                        ({course.totalRatings || 0})
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Users className="w-4 h-4" />
                      <span>{course.enrollmentCount || 0}</span>
                    </div>
                  </div>

                  {course.categories && course.categories.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {course.categories.slice(0, 2).map((cat, idx) => (
                        <Badge
                          key={idx}
                          variant="secondary"
                          className="text-xs"
                        >
                          {cat}
                        </Badge>
                      ))}
                      {course.categories.length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{course.categories.length - 2}
                        </Badge>
                      )}
                    </div>
                  )}
                </CardContent>

                <CardFooter className="pt-3 border-t">
                  <div className="flex items-center justify-between w-full">
                    <div>
                      {course.originalPrice && course.originalPrice > course.price ? (
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-primary">
                            ${course.price}
                          </span>
                          <span className="text-sm text-gray-500 line-through">
                            ${course.originalPrice}
                          </span>
                        </div>
                      ) : (
                        <span className="text-lg font-bold text-primary">
                          ${course.price}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      {course.duration || 0}h
                    </div>
                  </div>
                </CardFooter>
              </Card>
            );
          })}
          </div>
        )
      )}

      {/* Pagination */}
      {filteredCourses.length > 0 && (
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-600">
            Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredCourses.length)} to{" "}
            {Math.min(currentPage * itemsPerPage, filteredCourses.length)} of{" "}
            {filteredCourses.length} courses
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline ml-1">Previous</span>
            </Button>
            <div className="flex items-center gap-1">
              {Array.from(
                { length: Math.ceil(filteredCourses.length / itemsPerPage) },
                (_, i) => i + 1
              )
                .filter(
                  (page) =>
                    page === 1 ||
                    page === Math.ceil(filteredCourses.length / itemsPerPage) ||
                    Math.abs(page - currentPage) <= 1
                )
                .map((page, idx, arr) => (
                  <React.Fragment key={page}>
                    {idx > 0 && arr[idx - 1] !== page - 1 && (
                      <span className="px-2">...</span>
                    )}
                    <Button
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className="w-8 h-8 p-0"
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
                setCurrentPage((p) =>
                  Math.min(Math.ceil(filteredCourses.length / itemsPerPage), p + 1)
                )
              }
              disabled={
                currentPage >= Math.ceil(filteredCourses.length / itemsPerPage)
              }
            >
              <span className="hidden sm:inline mr-1">Next</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              course and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={actionLoading}
            >
              {actionLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Confirmation */}
      <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete{" "}
              {selectedIds.length} course{selectedIds.length > 1 ? "s" : ""} and
              all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={actionLoading}
            >
              {actionLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                `Delete ${selectedIds.length} Course${
                  selectedIds.length > 1 ? "s" : ""
                }`
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
