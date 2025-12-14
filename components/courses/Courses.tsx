"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/context/ToastContext";
import { coursesService, Course } from "@/services/courses.service";
import { courseCategoriesService } from "@/services/course-categories.service";
import {
  Book,
  Users,
  Star,
  ArrowUp,
  CheckCircle,
  ChartLine,
  Filter,
  Plus,
  Download,
  Grid3x3,
  List,
  RefreshCw,
} from "lucide-react";
import { Loader2 } from "lucide-react";
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
  const qc = useQueryClient();
  const [search, setSearch] = React.useState("");
  const [categoryFilter, setCategoryFilter] =
    React.useState<string>("All Categories");
  const [statusFilter, setStatusFilter] = React.useState<string>("All Status");
  const [sortBy, setSortBy] = React.useState<string>("Newest");
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [actionLoading, setActionLoading] = React.useState<string | null>(null);
  const [viewMode, setViewMode] = React.useState<"table" | "grid">("table");
  const [isExporting, setIsExporting] = React.useState(false);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["courses", { search, statusFilter }],
    queryFn: async () => {
      const params: any = { page: 1, limit: 100 };
      if (search) params.search = search;
      if (statusFilter === "Published") params.status = "published";
      if (statusFilter === "Draft") params.status = "draft";
      // Don't filter by status when "All Status" is selected - fetch everything
      const res = await coursesService.getAllCourses(params);
      return res;
    },
  });

  // Fetch categories from API
  const { data: categoriesData } = useQuery({
    queryKey: ["course-categories"],
    queryFn: () => courseCategoriesService.getAllCategories(),
    staleTime: 60000,
  });

  React.useEffect(() => {
    if (isError) {
      const message =
        error && error instanceof Error
          ? error.message
          : "Failed to load courses";
      push({ type: "error", message });
    }
  }, [isError, error, push]);

  const courses: Course[] = React.useMemo(() => {
    // API returns { success, data: { courses: [...], total }, meta }
    const apiData = (data as any)?.data || data;
    const list = apiData?.courses || [];
    return list.map((c: any) => ({
      ...c,
      id: c._id || c.id,
      enrollmentCount: c.studentCount || c.enrollmentCount || 0,
      totalRatings: c.totalRatings || c.ratingsCount || c.reviewCount || 0,
      maxStudents: c.maxStudents || 100,
      rating: c.rating || 0,
      price: c.price || 0,
      duration: c.duration || c.durationHours || 0,
      status: c.status || (c.isPublished ? "published" : "draft"),
      categories: Array.isArray(c.categories) ? c.categories : [],
      thumbnail: c.thumbnail || "",
    }));
  }, [data]);

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
    const totalCourses = courses.length;
    const totalStudents = courses.reduce(
      (sum, c) => sum + (c.enrollmentCount || 0),
      0
    );
    const avgRating =
      courses.length > 0
        ? courses.reduce((sum, c) => sum + (c.rating || 0), 0) / courses.length
        : 0;
    const published = courses.filter((c) => c.isPublished).length;

    // Calculate discount impact
    const discountImpact = coursesService.calculateDiscountImpact(courses);

    return {
      totalCourses,
      totalStudents,
      avgRating,
      published,
      discountImpact,
    };
  }, [courses]);

  const handleDelete = async () => {
    if (!deleteId) return;
    setActionLoading(deleteId);
    try {
      await coursesService.deleteCourse(deleteId);
      push({ type: "success", message: "Course deleted successfully" });
      qc.invalidateQueries({ queryKey: ["courses"] });
      setDeleteId(null);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to delete course";
      push({ type: "error", message: msg });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDuplicate = async (courseId: string) => {
    setActionLoading(courseId);
    try {
      await coursesService.duplicateCourse(courseId);
      push({ type: "success", message: "Course duplicated successfully" });
      qc.invalidateQueries({ queryKey: ["courses"] });
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to duplicate course";
      push({ type: "error", message: msg });
    } finally {
      setActionLoading(null);
    }
  };

  const handlePublish = async (courseId: string) => {
    setActionLoading(courseId);
    try {
      await coursesService.publishCourse(courseId);
      push({ type: "success", message: "Course published successfully" });
      qc.invalidateQueries({ queryKey: ["courses"] });
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to publish course";
      push({ type: "error", message: msg });
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnpublish = async (courseId: string) => {
    setActionLoading(courseId);
    try {
      await coursesService.unpublishCourse(courseId);
      push({ type: "success", message: "Course unpublished successfully" });
      qc.invalidateQueries({ queryKey: ["courses"] });
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to unpublish course";
      push({ type: "error", message: msg });
    } finally {
      setActionLoading(null);
    }
  };

  const handleEdit = (course: Course) => {
    router.push(`/courses/${course.id}/edit`);
  };

  const handleReorder = async (reorderedCourses: Course[]) => {
    // Here you could implement API call to save the new order
    console.log(
      "Courses reordered:",
      reorderedCourses.map((c) => c.id)
    );
    push({ type: "success", message: "Course order updated" });
  };

  const handleExportCSV = () => {
    setIsExporting(true);
    try {
      const headers = [
        "Title",
        "Level",
        "Price",
        "Original Price",
        "Duration",
        "Students",
        "Rating",
        "Status",
        "Categories",
        "Created Date",
      ];

      const rows = filteredCourses.map((course) => [
        course.title,
        course.level,
        course.price,
        course.originalPrice || "",
        course.duration,
        course.enrollmentCount || 0,
        course.rating || 0,
        course.status || (course.isPublished ? "published" : "draft"),
        (course.categories || []).join("; "),
        new Date(course.createdAt || "").toLocaleDateString(),
      ]);

      const csvContent =
        "data:text/csv;charset=utf-8," +
        [headers, ...rows].map((row) => row.join(",")).join("\n");

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute(
        "download",
        `courses_export_${new Date().toISOString().split("T")[0]}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      push({ type: "success", message: "Courses exported successfully" });
    } catch (err) {
      push({ type: "error", message: "Failed to export courses" });
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
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
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-secondary mb-2">
            Courses Management
          </h2>
          <p className="text-gray-600">
            Manage your aviation training courses and enrollments
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-white border border-gray-200 rounded-lg p-1">
            <Button
              variant={viewMode === "table" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("table")}
              className="px-3"
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="px-3"
            >
              <Grid3x3 className="w-4 h-4" />
            </Button>
          </div>

          {/* Export Button */}
          <Button
            variant="outline"
            onClick={handleExportCSV}
            disabled={isExporting || filteredCourses.length === 0}
          >
            {isExporting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            Export CSV
          </Button>

          {/* Refresh Button */}
          <Button
            variant="outline"
            onClick={() => qc.invalidateQueries({ queryKey: ["courses"] })}
            disabled={isLoading}
          >
            <RefreshCw
              className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
            />
          </Button>

          {/* Create Course Button */}
          {roleCanManage && (
            <Button
              onClick={() => router.push("/courses/create")}
              className="bg-primary hover:bg-primary/90 text-white"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Course
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-linear-to-br from-primary to-primary/80 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white/20 p-3 rounded-lg">
              <Book className="w-6 h-6" />
            </div>
            <div className="bg-white/20 px-3 py-1 rounded-full text-sm flex items-center gap-1">
              <ArrowUp className="w-4 h-4" />
              <span>12%</span>
            </div>
          </div>
          <p className="text-sm opacity-90 mb-1">Total Courses</p>
          <p className="text-3xl font-bold">{stats.totalCourses}</p>
        </div>

        <div className="bg-linear-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white/20 p-3 rounded-lg">
              <Users className="w-6 h-6" />
            </div>
            <div className="bg-white/20 px-3 py-1 rounded-full text-sm flex items-center gap-1">
              <ArrowUp className="w-4 h-4" />
              <span>8%</span>
            </div>
          </div>
          <p className="text-sm opacity-90 mb-1">Total Students</p>
          <p className="text-3xl font-bold">{stats.totalStudents}</p>
        </div>

        <div className="bg-linear-to-br from-yellow-500 to-yellow-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white/20 p-3 rounded-lg">
              <Star className="w-6 h-6" />
            </div>
            <div className="bg-white/20 px-3 py-1 rounded-full text-sm flex items-center gap-1">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-sm opacity-90 mb-1">Average Rating</p>
          <p className="text-3xl font-bold">{stats.avgRating.toFixed(1)}</p>
        </div>

        <div className="bg-linear-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white/20 p-3 rounded-lg">
              <ChartLine className="w-6 h-6" />
            </div>
            <div className="bg-white/20 px-3 py-1 rounded-full text-sm flex items-center gap-1">
              <ArrowUp className="w-4 h-4" />
              <span>15%</span>
            </div>
          </div>
          <p className="text-sm opacity-90 mb-1">Published Courses</p>
          <p className="text-3xl font-bold">{stats.published}</p>
        </div>
      </div>

      {/* Discount Impact Stats */}
      {stats.discountImpact.coursesWithDiscount > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-600">Courses with Discount</p>
              <div className="bg-green-100 p-2 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-secondary mb-1">
              {stats.discountImpact.coursesWithDiscount}
            </p>
            <p className="text-xs text-gray-500">
              {(
                (stats.discountImpact.coursesWithDiscount /
                  stats.totalCourses) *
                100
              ).toFixed(1)}
              % of total courses
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-600">Average Discount</p>
              <div className="bg-blue-100 p-2 rounded-lg">
                <ChartLine className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-secondary mb-1">
              {stats.discountImpact.averageDiscount.toFixed(1)}%
            </p>
            <p className="text-xs text-gray-500">Across discounted courses</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-600">Total Savings Offered</p>
              <div className="bg-red-100 p-2 rounded-lg">
                <Star className="w-5 h-5 text-red-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-secondary mb-1">
              ${stats.discountImpact.totalDiscount.toFixed(2)}
            </p>
            <p className="text-xs text-gray-500">Potential revenue impact</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Search courses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
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
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All Status">All Status</SelectItem>
              <SelectItem value="Published">Published</SelectItem>
              <SelectItem value="Draft">Draft</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40">
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

      {/* Data Table */}
      <CoursesTable
        courses={filteredCourses}
        onEdit={handleEdit}
        onDelete={(id) => setDeleteId(id)}
        onDuplicate={handleDuplicate}
        onPublish={handlePublish}
        onUnpublish={handleUnpublish}
        onReorder={handleReorder}
        actionLoading={actionLoading}
        viewMode={viewMode}
      />

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
            <AlertDialogCancel disabled={!!actionLoading}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={!!actionLoading}
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
    </div>
  );
}
