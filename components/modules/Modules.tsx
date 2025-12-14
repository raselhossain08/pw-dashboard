"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/context/ToastContext";
import {
  modulesService,
  type ModuleDto,
  type Lesson,
} from "@/services/modules.service";
import { coursesService } from "@/services/courses.service";
import {
  Layers,
  PlayCircle,
  Clock,
  EllipsisVertical,
  ArrowUp,
  CheckCircle,
  ChartLine,
  Paintbrush,
  Database,
  Share2,
  Pencil,
  Download,
  Filter,
  Plus,
  Eye,
  Trash,
  BookOpen,
  TrendingUp,
  Copy,
  Plane,
  Award,
  GripVertical,
  LayoutGrid,
  List,
  ChevronDown,
  ChevronRight,
  Folder,
  FileText,
  Star,
  ExternalLink,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "../ui/badge";

type ModuleItem = {
  id: string;
  title: string;
  course: string;
  courseTitle?: string;
  lessons: number;
  duration: string;
  durationHours: number;
  status: "published" | "draft" | "archived";
  completion: number;
  description?: string;
  icon: React.ReactNode;
  accentClass: string;
  badgeClass: string;
  type?: string;
  level?: string;
  price?: number;
  thumbnail?: string;
  instructor?: any;
  rating?: number;
  courses?: any[];
  order?: number;
};

export default function Modules() {
  const { push } = useToast();
  const queryClient = useQueryClient();
  const [page, setPage] = React.useState(1);
  const [limit] = React.useState(50);

  // Fetch courses as the primary entity
  const {
    data: coursesData,
    isLoading,
    isFetching,
    error,
    refetch: refetchCourses,
  } = useQuery({
    queryKey: ["courses", page, limit],
    queryFn: () => coursesService.getAllCourses({ page, limit }),
    staleTime: 30000,
  });

  // Fetch modules for adding to courses
  const { data: modulesData } = useQuery({
    queryKey: ["modules"],
    queryFn: () => modulesService.getAllModules({ page: 1, limit: 100 }),
    staleTime: 60000,
  });

  // Parse courses (primary containers)
  const courses = React.useMemo(() => {
    const responseData: any = coursesData;
    const coursesList = Array.isArray(responseData?.data?.courses)
      ? responseData.data.courses
      : Array.isArray(responseData?.courses)
      ? responseData.courses
      : Array.isArray(responseData?.data)
      ? responseData.data
      : Array.isArray(coursesData)
      ? coursesData
      : [];

    return coursesList.map((c: any) => ({
      id: c._id || c.id,
      title: c.title,
      description: c.description,
      thumbnail: c.thumbnail,
      instructor: c.instructor,
      status: c.status || (c.isPublished ? "published" : "draft"),
      price: c.price,
      rating: c.rating || 0,
      students: c.enrolledStudents || 0,
      modules: Array.isArray(c.modules) ? c.modules : [],
    }));
  }, [coursesData]);

  // Parse available modules that can be added to courses
  const availableModules: ModuleItem[] = React.useMemo(() => {
    const responseData: any = modulesData;
    const modulesList = Array.isArray(responseData?.data?.modules)
      ? responseData.data.modules
      : Array.isArray(responseData?.modules)
      ? responseData.modules
      : Array.isArray(responseData?.data)
      ? responseData.data
      : Array.isArray(modulesData)
      ? modulesData
      : [];

    return modulesList.map((m: any) => {
      const lessonsCount = Array.isArray(m.lessons)
        ? m.lessons.length
        : m.lessonsCount || 0;
      const durationHours = m.duration || m.durationHours || 0;
      const durationStr =
        durationHours >= 1
          ? `${Math.floor(durationHours)}h ${Math.round(
              (durationHours % 1) * 60
            )}m`
          : `${Math.round(durationHours * 60)}m`;

      // Parse primary course
      const courseObj = typeof m.course === "object" ? m.course : null;
      const courseId = courseObj?._id || m.course || "";
      const courseTitle = courseObj?.title || "No Course";

      // Parse courses array - filter out null values
      const coursesArray = Array.isArray(m.courses)
        ? m.courses
            .filter((c: any) => c && c._id)
            .map((c: any) => ({
              id: c._id || c.id,
              title: c.title,
              instructor: c.instructor,
            }))
        : [];

      return {
        id: m._id || m.id,
        title: m.title,
        course: courseId,
        courseTitle: courseTitle,
        lessons: lessonsCount,
        duration: durationStr,
        durationHours,
        status: m.status || (m.isPublished ? "published" : "draft"),
        completion: m.completionRate || m.completion || 0,
        description: m.description || m.excerpt,
        icon: <Plane className="text-blue-600" />,
        accentClass: "bg-blue-50",
        badgeClass:
          m.status === "published" || m.isPublished
            ? "bg-green-50 text-green-700"
            : "bg-amber-50 text-amber-700",
        type: m.type,
        level: m.level,
        price: m.price,
        thumbnail: m.thumbnail,
        instructor: m.instructor,
        rating: m.rating || 0,
        courses: coursesArray,
        order: m.order || 1,
      };
    });
  }, [modulesData]);

  React.useEffect(() => {
    if (error) {
      push({ type: "error", message: "Failed to load modules" });
    }
  }, [error, push]);

  // Debug logging
  React.useEffect(() => {
    console.log("📊 Modules Data:", modulesData);
    console.log("📦 Available Modules Count:", availableModules.length);
    console.log("📦 Available Modules:", availableModules);
  }, [modulesData, availableModules]);

  const [search, setSearch] = React.useState("");
  const [levelFilter, setLevelFilter] = React.useState<string>("all");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [sortBy, setSortBy] = React.useState<string>("newest");
  const [createOpen, setCreateOpen] = React.useState(false);
  const [filtersOpen, setFiltersOpen] = React.useState(false);
  const [editModule, setEditModule] = React.useState<ModuleItem | null>(null);
  const [previewModule, setPreviewModule] = React.useState<ModuleItem | null>(
    null
  );
  const [analyticsModule, setAnalyticsModule] =
    React.useState<ModuleItem | null>(null);
  const [shareModule, setShareModule] = React.useState<ModuleItem | null>(null);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("list");
  const [draggedId, setDraggedId] = React.useState<string | null>(null);
  const [dragOverId, setDragOverId] = React.useState<string | null>(null);
  const [draggedCourseId, setDraggedCourseId] = React.useState<string | null>(
    null
  );
  const [dropTargetModuleId, setDropTargetModuleId] = React.useState<
    string | null
  >(null);
  const [expandedModules, setExpandedModules] = React.useState<Set<string>>(
    new Set()
  );
  const [expandedCourses, setExpandedCourses] = React.useState<Set<string>>(
    new Set()
  );
  const [addCourseModule, setAddCourseModule] =
    React.useState<ModuleItem | null>(null);
  const [selectedCourseToAdd, setSelectedCourseToAdd] =
    React.useState<string>("");
  const [preSelectedCourseId, setPreSelectedCourseId] =
    React.useState<string>("");

  const filtered = React.useMemo(() => {
    return courses
      .filter((c: any) => {
        if (search) {
          const searchLower = search.toLowerCase();
          return (
            c.title.toLowerCase().includes(searchLower) ||
            c.description?.toLowerCase().includes(searchLower)
          );
        }
        return true;
      })
      .filter((c: any) => {
        if (statusFilter === "all") return true;
        return c.status === statusFilter;
      })
      .sort((a: any, b: any) => {
        switch (sortBy) {
          case "newest":
            return b.id.localeCompare(a.id);
          case "oldest":
            return a.id.localeCompare(b.id);
          case "name":
            return a.title.localeCompare(b.title);
          case "price":
            return (b.price || 0) - (a.price || 0);
          default:
            return 0;
        }
      });
  }, [courses, search, statusFilter, sortBy]);

  const stats = React.useMemo(() => {
    const published = courses.filter(
      (c: any) => c.status === "published"
    ).length;
    const totalModules = courses.reduce(
      (sum: number, c: any) => sum + (c.modules?.length || 0),
      0
    );
    const totalStudents = courses.reduce(
      (sum: number, c: any) => sum + (c.students || 0),
      0
    );
    const totalRevenue = courses.reduce(
      (sum: number, c: any) => sum + (c.price || 0),
      0
    );

    return {
      total: courses.length,
      published,
      totalModules,
      totalStudents,
      totalRevenue,
    };
  }, [courses]);

  // Auto-expand all courses in list view
  React.useEffect(() => {
    if (viewMode === "list" && courses.length > 0) {
      const allCourseIds = courses.map((c: any) => c.id);
      setExpandedModules(new Set(allCourseIds));
    }
  }, [viewMode, courses]);

  // Drag handlers for courses
  const handleDragStart = (courseId: string) => {
    setDraggedId(courseId);
  };

  const handleDragOver = (e: React.DragEvent, courseId: string) => {
    e.preventDefault();
    setDragOverId(courseId);
  };

  const handleDrop = (targetId: string) => {
    if (!draggedId || draggedId === targetId) {
      setDraggedId(null);
      setDragOverId(null);
      return;
    }

    // Reorder logic for courses
    console.log(`Move course ${draggedId} to position of ${targetId}`);

    setDraggedId(null);
    setDragOverId(null);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOverId(null);
  };

  const handleDeleteModule = async (moduleId: string, courseId: string) => {
    try {
      // Call the module delete API
      await modulesService.deleteModule(moduleId);

      // Refetch courses to update the modules list
      await refetchCourses();

      push({
        type: "success",
        message: "Module deleted successfully",
      });
    } catch (error) {
      console.error("Failed to delete module:", error);
      push({
        type: "error",
        message: "Failed to delete module. Please try again.",
      });
    }
  };

  // Module drag handlers - drag modules into courses
  const handleModuleDragStart = (moduleId: string) => {
    setDraggedCourseId(moduleId); // Reusing this state for module dragging
  };

  const handleModuleDragEnd = () => {
    setDraggedCourseId(null);
    setDropTargetModuleId(null);
  };

  const handleCourseDragOver = (e: React.DragEvent, courseId: string) => {
    if (draggedCourseId) {
      e.preventDefault();
      e.stopPropagation();
      setDropTargetModuleId(courseId); // Reusing this state for course drop target
    }
  };

  const handleCourseDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDropTargetModuleId(null);
  };

  const handleModuleDropOnCourse = async (
    e: React.DragEvent,
    courseId: string
  ) => {
    e.preventDefault();
    e.stopPropagation();

    if (!draggedCourseId) return;

    const module = availableModules.find((m: any) => m.id === draggedCourseId);
    const targetCourse = courses.find((c: any) => c.id === courseId);
    if (!module || !targetCourse) return;

    // Check if module already belongs to this course
    const alreadyInCourse =
      module.course === courseId ||
      (module.courses?.some((c: any) => c.id === courseId) ?? false);

    if (alreadyInCourse) {
      push({
        type: "info",
        message: `Module "${module.title}" already belongs to "${targetCourse.title}"`,
      });
      setDraggedCourseId(null);
      setDropTargetModuleId(null);
      return;
    }

    // Get current modules in target course for order calculation
    const courseModules = availableModules.filter(
      (mod) =>
        mod.course === courseId ||
        (mod.courses?.some((c: any) => c.id === courseId) ?? false)
    );
    const nextOrder = courseModules.length + 1;

    console.log("Dropping module:", module);
    console.log("Target course:", targetCourse);
    console.log("Current courses:", module.courses);
    console.log("Adding to course:", targetCourse.title);
    console.log(
      "Updating module with courseId and order:",
      courseId,
      nextOrder
    );

    try {
      // Build the courses array - add new course to existing ones
      const existingCourseIds = (module.courses || []).map((c: any) => c.id);
      const updatedCourseIds = [...existingCourseIds, courseId];

      // Update the module to link it to the dropped course
      const updateData = {
        courseId: courseId, // Primary course
        courseIds: updatedCourseIds, // All courses this module belongs to
        title: module.title,
        order: nextOrder,
      };

      console.log("Update payload:", updateData);

      const result = await modulesService.updateModule(
        draggedCourseId,
        updateData
      );

      console.log("Update result:", result);

      const totalCourses = updatedCourseIds.length;
      push({
        type: "success",
        message: `✓ Module "${module.title}" added to "${
          targetCourse.title
        }" (${totalCourses} course${totalCourses > 1 ? "s" : ""} total)`,
      });

      // Force refetch courses data
      await refetchCourses();
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      queryClient.invalidateQueries({ queryKey: ["modules"] });
    } catch (err: any) {
      console.error("Drop error:", err);
      console.error("Error response:", err.response?.data);
      push({
        type: "error",
        message:
          err.response?.data?.message || "Failed to add module to course",
      });
    } finally {
      setDraggedCourseId(null);
      setDropTargetModuleId(null);
    }
  };

  return (
    <main className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-slate-50">
      <div className="p-6 max-w-[1800px] mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-lg">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-linear-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                    Courses & Modules
                  </h1>
                  <p className="text-slate-600 text-sm">
                    Manage courses and their training modules
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex bg-white rounded-lg border border-slate-200 p-1">
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="text-xs"
                >
                  <List className="w-4 h-4 mr-1" /> List
                </Button>
              </div>
              <Button
                onClick={() => setCreateOpen(true)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create New Module
              </Button>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="hidden md:flex flex-wrap gap-3">
              <Select value={levelFilter} onValueChange={setLevelFilter}>
                <SelectTrigger className="bg-slate-50 border-slate-200 rounded-lg px-4 py-2 text-sm w-44 hover:bg-slate-100 transition-colors">
                  <SelectValue placeholder="All Levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                  <SelectItem value="expert">Expert</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-slate-50 border-slate-200 rounded-lg px-4 py-2 text-sm w-40 hover:bg-slate-100 transition-colors">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="bg-slate-50 border-slate-200 rounded-lg px-4 py-2 text-sm w-52 hover:bg-slate-100 transition-colors">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="name">Name (A-Z)</SelectItem>
                  <SelectItem value="lessons">Most Lessons</SelectItem>
                  <SelectItem value="duration">Longest Duration</SelectItem>
                  <SelectItem value="price">Highest Price</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative flex-1 lg:flex-initial lg:w-64">
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
                <Database className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              </div>
              <Button
                variant="outline"
                className="md:hidden border-slate-200"
                onClick={() => setFiltersOpen(true)}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-slate-600 hover:text-primary hover:bg-primary/10"
                onClick={() => {
                  push({
                    type: "info",
                    message: "Export functionality coming soon",
                  });
                }}
              >
                <Download className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium mb-1">
                  Total Courses
                </p>
                <p className="text-3xl font-bold text-slate-900">
                  {stats.total}
                </p>
                <p className="text-primary text-sm mt-2 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {stats.published} published
                </p>
              </div>
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center">
                <BookOpen className="text-primary w-7 h-7" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium mb-1">
                  Active Courses
                </p>
                <p className="text-3xl font-bold text-slate-900">
                  {stats.published}
                </p>
                <p className="text-green-600 text-sm mt-2 flex items-center">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  {stats.total > 0
                    ? Math.round((stats.published / stats.total) * 100)
                    : 0}
                  % of total
                </p>
              </div>
              <div className="w-14 h-14 bg-green-50 rounded-xl flex items-center justify-center">
                <Award className="text-green-600 w-7 h-7" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium mb-1">
                  Total Modules
                </p>
                <p className="text-3xl font-bold text-slate-900">
                  {stats.totalModules}
                </p>
                <p className="text-amber-600 text-sm mt-2 flex items-center">
                  <PlayCircle className="w-3 h-3 mr-1" />
                  Across all courses
                </p>
              </div>
              <div className="w-14 h-14 bg-amber-50 rounded-xl flex items-center justify-center">
                <PlayCircle className="text-amber-600 w-7 h-7" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium mb-1">
                  Total Students
                </p>
                <p className="text-3xl font-bold text-slate-900">
                  {stats.totalStudents}
                </p>
                <p className="text-purple-600 text-sm mt-2 flex items-center">
                  <Users className="w-3 h-3 mr-1" />
                  Enrolled students
                </p>
              </div>
              <div className="w-14 h-14 bg-purple-50 rounded-xl flex items-center justify-center">
                <ChartLine className="text-purple-600 w-7 h-7" />
              </div>
            </div>
          </div>
        </div>
        {/* Available Modules Section - Drag to add to courses */}
        {availableModules && availableModules.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  All Modules
                </h3>
                <p className="text-sm text-slate-600">
                  Drag modules to add them to courses (supports multiple courses
                  per module)
                </p>
              </div>
              <Badge variant="outline" className="text-primary border-primary">
                {availableModules.length} Total
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {availableModules.map((module) => {
                const isDragging = draggedCourseId === module.id;
                return (
                  <div
                    key={module.id}
                    draggable
                    onDragStart={() => handleModuleDragStart(module.id)}
                    onDragEnd={handleModuleDragEnd}
                    className={`relative flex items-center justify-between p-3 rounded-lg border-2 transition-all group cursor-grab active:cursor-grabbing ${
                      isDragging
                        ? "opacity-40 scale-95 border-dashed border-primary bg-primary/10"
                        : "bg-gradient-to-br from-white to-slate-50 border-slate-200 hover:border-primary hover:shadow-md hover:scale-[1.02]"
                    }`}
                  >
                    {isDragging && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white/90 rounded-lg">
                        <span className="text-xs font-semibold text-primary animate-pulse">
                          Dragging...
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div className="p-1.5 rounded-md bg-blue-50 group-hover:bg-blue-100 transition-colors">
                        {module.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate group-hover:text-primary transition-colors">
                          {module.title}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <p className="text-xs text-slate-500">
                            {module.lessons} lessons · {module.duration}
                          </p>
                          {(module.courses?.length ?? 0) > 0 && (
                            <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-medium">
                              {module.courses?.length ?? 0} course
                              {(module.courses?.length ?? 0) > 1 ? "s" : ""}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline" className={module.badgeClass}>
                      {module.status}
                    </Badge>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <GripVertical className="w-3 h-3 text-white" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading || isFetching ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {[...Array(6)].map((_, i: number) => (
              <div
                key={`skeleton-${i}`}
                className="h-80 animate-pulse bg-slate-100 rounded-xl border border-slate-200"
              >
                <div className="p-6 space-y-4">
                  <div className="h-12 bg-slate-200 rounded-lg w-12"></div>
                  <div className="h-6 bg-slate-200 rounded w-3/4"></div>
                  <div className="h-4 bg-slate-200 rounded w-full"></div>
                  <div className="h-4 bg-slate-200 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-16 shadow-sm border border-slate-200 text-center">
            <div className="w-24 h-24 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Plane className="text-slate-400 w-12 h-12" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">
              {search || levelFilter !== "all" || statusFilter !== "all"
                ? "No courses found"
                : "No training courses yet"}
            </h3>
            <p className="text-slate-600 mb-8 max-w-md mx-auto">
              {search || levelFilter !== "all" || statusFilter !== "all"
                ? "Try adjusting your filters to find what you're looking for"
                : "Create your first aviation training course to start building your flight training program"}
            </p>
            {!search && levelFilter === "all" && statusFilter === "all" && (
              <Button
                onClick={() => setCreateOpen(true)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create First Course
              </Button>
            )}
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 mb-8">
            {filtered.map((m: any) => (
              <div
                key={m.id}
                className="group bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-xl hover:border-primary/30 transition-all duration-300 hover:-translate-y-1"
              >
                {/* Course Thumbnail */}
                {m.thumbnail && (
                  <div className="mb-4 -mx-6 -mt-6 h-40 overflow-hidden rounded-t-xl">
                    <img
                      src={m.thumbnail}
                      alt={m.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}

                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className={`w-10 h-10 ${m.accentClass} rounded-lg flex items-center justify-center shrink-0`}
                      >
                        {m.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-slate-900 text-lg leading-tight truncate">
                          {m.title}
                        </h3>
                        {m.level && (
                          <span className="text-xs font-medium text-slate-500 capitalize">
                            {m.level} Level
                          </span>
                        )}
                        {m.courseTitle && (
                          <div className="mt-1">
                            <span className="text-xs font-semibold px-2 py-1 rounded-full bg-slate-100 text-slate-700">
                              {m.courseTitle}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-slate-400 hover:text-primary hover:bg-primary/10 -mr-2"
                      >
                        <EllipsisVertical className="w-5 h-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-52">
                      <DropdownMenuItem onSelect={() => setEditModule(m)}>
                        <Pencil className="w-4 h-4 mr-2 text-primary" />
                        <span>Edit Course</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => setPreviewModule(m)}>
                        <Eye className="w-4 h-4 mr-2 text-slate-600" />
                        <span>Preview</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => setAnalyticsModule(m)}>
                        <ChartLine className="w-4 h-4 mr-2 text-purple-600" />
                        <span>View Analytics</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onSelect={async () => {
                          try {
                            await modulesService.duplicateModule(m.id);
                            push({
                              type: "success",
                              message: "Course duplicated successfully",
                            });
                            queryClient.invalidateQueries({
                              queryKey: ["modules"],
                            });
                          } catch {
                            push({
                              type: "error",
                              message: "Failed to duplicate course",
                            });
                          }
                        }}
                      >
                        <Copy className="w-4 h-4 mr-2 text-slate-600" />
                        <span>Duplicate</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => setShareModule(m)}>
                        <Share2 className="w-4 h-4 mr-2 text-slate-600" />
                        <span>Share</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-red-600 focus:text-red-600"
                        onSelect={() => setDeleteId(m.id)}
                      >
                        <Trash className="w-4 h-4 mr-2" />
                        <span>Delete</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Description */}
                {m.description && (
                  <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                    {m.description}
                  </p>
                )}

                {/* Metadata */}
                <div className="flex flex-wrap items-center gap-3 mb-4 pb-4 border-b border-slate-100">
                  <div className="flex items-center text-sm text-slate-600">
                    <PlayCircle className="w-4 h-4 mr-1.5 text-amber-500" />
                    <span className="font-medium">{m.lessons}</span>
                    <span className="ml-1">lessons</span>
                  </div>
                  <div className="flex items-center text-sm text-slate-600">
                    <Clock className="w-4 h-4 mr-1.5 text-blue-500" />
                    <span className="font-medium">{m.duration}</span>
                  </div>
                  {m.type && (
                    <div className="flex items-center text-sm text-slate-600 capitalize">
                      <Layers className="w-4 h-4 mr-1.5 text-purple-500" />
                      <span className="font-medium">{m.type}</span>
                    </div>
                  )}
                </div>

                {/* Status Badge */}
                <div className="flex items-center justify-between mb-4">
                  <span
                    className={`text-xs font-semibold px-3 py-1.5 rounded-full ${m.badgeClass}`}
                  >
                    {m.status === "published"
                      ? "✓ Published"
                      : m.status === "draft"
                      ? "Draft"
                      : "Archived"}
                  </span>
                  {m.price !== undefined && (
                    <span className="text-lg font-bold text-primary">
                      ${m.price.toFixed(2)}
                    </span>
                  )}
                </div>

                {/* Progress Bar */}
                {m.completion > 0 && (
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-slate-600 mb-1.5">
                      <span className="font-medium">Completion Rate</span>
                      <span className="font-semibold">{m.completion}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-500"
                        style={{ width: `${m.completion}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 border-primary/30 text-primary hover:bg-primary/10 hover:border-primary"
                    onClick={() => setEditModule(m)}
                  >
                    <Pencil className="w-3.5 h-3.5 mr-1.5" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 border-slate-200 text-slate-600 hover:bg-slate-50"
                    onClick={() => setPreviewModule(m)}
                  >
                    <Eye className="w-3.5 h-3.5 mr-1.5" />
                    View
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Hierarchical View: Course > Modules */
          <div className="space-y-3 mb-8">
            {filtered.map((course: any) => {
              const isCourseExpanded = expandedModules.has(course.id);

              // Get modules that belong to this course
              // Check both 'course' field and 'courses' array
              const courseModules = availableModules.filter(
                (mod) =>
                  mod.course === course.id ||
                  (mod.courses?.some((c: any) => c.id === course.id) ?? false)
              );

              return (
                <div
                  key={course.id}
                  onDragOver={(e) => handleCourseDragOver(e, course.id)}
                  onDragLeave={(e) => handleCourseDragLeave(e)}
                  onDrop={(e) => handleModuleDropOnCourse(e, course.id)}
                  className={`bg-white rounded-lg shadow-sm border-2 overflow-hidden transition-all ${
                    dropTargetModuleId === course.id
                      ? "border-primary bg-primary/5 shadow-lg scale-[1.02]"
                      : "border-slate-200"
                  }`}
                >
                  {/* Course Header (Top Level Container) */}
                  <div className="bg-linear-to-r from-primary/5 to-white border-b border-slate-200">
                    <div className="flex items-center justify-between p-4">
                      <button
                        onClick={() => {
                          const newSet = new Set(expandedModules);
                          if (isCourseExpanded) {
                            newSet.delete(course.id);
                          } else {
                            newSet.add(course.id);
                          }
                          setExpandedModules(newSet);
                        }}
                        className="flex items-center gap-3 flex-1 text-left hover:text-primary transition-colors"
                      >
                        <div className="text-slate-400">
                          {isCourseExpanded ? (
                            <ChevronDown className="w-5 h-5" />
                          ) : (
                            <ChevronRight className="w-5 h-5" />
                          )}
                        </div>
                        <BookOpen className="w-6 h-6 text-primary" />
                        <span className="font-bold text-slate-900">
                          {course.title}
                        </span>
                        <Badge
                          variant="outline"
                          className={
                            course.status === "published"
                              ? "bg-green-50 text-green-700"
                              : "bg-amber-50 text-amber-700"
                          }
                        >
                          {course.status}
                        </Badge>
                        {courseModules.length > 0 && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                            {courseModules.length} module
                            {courseModules.length !== 1 ? "s" : ""}
                          </span>
                        )}
                        {dropTargetModuleId === course.id &&
                          draggedCourseId && (
                            <span className="text-xs bg-primary text-white px-3 py-1 rounded-full font-semibold animate-pulse">
                              ↓ Drop Module Here
                            </span>
                          )}
                      </button>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreSelectedCourseId(course.id);
                            setCreateOpen(true);
                          }}
                          className="text-primary hover:text-primary hover:bg-primary/10"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Add Module
                        </Button>
                        <Link href={`/courses/${course.id}/edit`}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-slate-600 hover:text-primary hover:bg-primary/10"
                          >
                            <Pencil className="w-4 h-4 mr-1" />
                            Edit Course
                          </Button>
                        </Link>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-slate-600 hover:bg-slate-100"
                            >
                              <EllipsisVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onSelect={() => {
                                // Navigate to course detail page
                                window.location.href = `/courses/${course.id}`;
                              }}
                            >
                              <Eye className="w-4 h-4 mr-2" /> View Course
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onSelect={() => {
                                window.location.href = `/courses/${course.id}/analytics`;
                              }}
                            >
                              <ChartLine className="w-4 h-4 mr-2" /> Analytics
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onSelect={() =>
                                setShareModule({
                                  ...course,
                                  icon: <BookOpen />,
                                } as any)
                              }
                            >
                              <Share2 className="w-4 h-4 mr-2" /> Share
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>

                  {/* Course Content - Modules under this Course */}
                  {isCourseExpanded && (
                    <div className="bg-slate-50/30">
                      {courseModules.length === 0 ? (
                        <div className="p-6 text-center text-slate-500">
                          <Folder className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                          <p className="text-sm">No modules yet</p>
                          <p className="text-xs text-slate-400 mt-1">
                            Drag a module from above or click "Add Module"
                          </p>
                        </div>
                      ) : (
                        courseModules.map((module, idx) => {
                          const isBeingDragged = draggedCourseId === module.id;
                          return (
                            <div
                              key={module.id}
                              draggable
                              onDragStart={() =>
                                handleModuleDragStart(module.id)
                              }
                              onDragEnd={handleModuleDragEnd}
                              className={`p-3 pl-8 border-b border-slate-100 transition-all cursor-move group/module ${
                                isBeingDragged
                                  ? "opacity-40 bg-primary/10 border-primary"
                                  : "hover:bg-white/50 hover:border-l-4 hover:border-l-primary"
                              }`}
                            >
                              <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3 flex-1">
                                  <div className="text-slate-400 cursor-grab active:cursor-grabbing opacity-0 group-hover/module:opacity-100 transition-opacity">
                                    <GripVertical className="w-4 h-4" />
                                  </div>
                                  <div
                                    className={`${module.accentClass} p-2 rounded-lg`}
                                  >
                                    {module.icon}
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs text-slate-400 font-mono">
                                        #{idx + 1}
                                      </span>
                                      <span className="font-semibold text-slate-800">
                                        {module.title}
                                      </span>
                                      <Badge
                                        variant="outline"
                                        className={module.badgeClass}
                                      >
                                        {module.status}
                                      </Badge>
                                    </div>
                                    <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                                      <span className="flex items-center gap-1">
                                        <FileText className="w-3.5 h-3.5" />
                                        {module.lessons} lesson
                                        {module.lessons !== 1 ? "s" : ""}
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <Clock className="w-3.5 h-3.5" />
                                        {module.duration}
                                      </span>
                                      <span className="text-xs text-blue-600 font-medium">
                                        📚 {course.title}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setEditModule(module)}
                                    className="h-7 px-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50"
                                  >
                                    <Pencil className="w-3.5 h-3.5" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setPreviewModule(module)}
                                    className="h-7 px-2 text-slate-600 hover:text-green-600 hover:bg-green-50"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      handleDeleteModule(module.id, course.id)
                                    }
                                    className="h-7 px-2 text-slate-600 hover:text-red-600 hover:bg-red-50"
                                  >
                                    <Trash className="w-3.5 h-3.5" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            <button
              onClick={() => {
                // Navigate to create course page
                window.location.href = "/courses/create";
              }}
              className="w-full p-4 border-2 border-dashed border-slate-300 rounded-lg text-slate-500 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              <span className="font-medium">Add New Course</span>
            </button>
          </div>
        )}

        {/* Create Dialog */}
        <Dialog
          open={createOpen}
          onOpenChange={(open) => {
            setCreateOpen(open);
            if (!open) {
              setPreSelectedCourseId(""); // Reset on close
            }
          }}
        >
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-slate-900">
                {preSelectedCourseId
                  ? `Add Module to ${
                      courses.find((c: any) => c.id === preSelectedCourseId)
                        ?.title || "Course"
                    }`
                  : "Create New Module"}
              </DialogTitle>
              <DialogDescription className="text-slate-600">
                {preSelectedCourseId
                  ? `Create a new training module for this course`
                  : `Create a new training module within an existing course`}
              </DialogDescription>
            </DialogHeader>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget as HTMLFormElement);
                const title = String(fd.get("title") || "");
                const courseId = String(
                  fd.get("course") || preSelectedCourseId || ""
                );
                const description = String(fd.get("description") || "");
                const order = Number(fd.get("order") || 1);

                try {
                  await modulesService.createModule({
                    title,
                    courseId,
                    description,
                    order,
                  });
                  push({
                    type: "success",
                    message: "Module created successfully",
                  });
                  setCreateOpen(false);
                  queryClient.invalidateQueries({ queryKey: ["modules"] });
                } catch (err) {
                  console.error(err);
                  push({ type: "error", message: "Failed to create module" });
                }
              }}
              className="space-y-5"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between mb-1">
                  <Label
                    htmlFor="course"
                    className="text-sm font-semibold text-slate-700"
                  >
                    Course
                  </Label>
                  <Link
                    href="/courses/create"
                    className="text-xs text-primary hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    Create New Course
                  </Link>
                </div>
                <Select
                  name="course"
                  defaultValue={preSelectedCourseId}
                  value={preSelectedCourseId || undefined}
                  onValueChange={(value) => setPreSelectedCourseId(value)}
                >
                  <SelectTrigger id="course">
                    <SelectValue placeholder="Select a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.length > 0 ? (
                      courses.map((course: any) => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.title}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="" disabled>
                        No courses available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-500">
                  Optional: You can add the module to a course now or later by
                  dragging it
                </p>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="title"
                  className="text-sm font-semibold text-slate-700"
                >
                  Module Title *
                </Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="e.g., Introduction to Citation Jet"
                  className="w-full"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="description"
                  className="text-sm font-semibold text-slate-700"
                >
                  Description
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  rows={4}
                  placeholder="Describe what this module covers..."
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="order"
                  className="text-sm font-semibold text-slate-700"
                >
                  Order *
                </Label>
                <Input
                  id="order"
                  name="order"
                  type="number"
                  min="1"
                  defaultValue={availableModules.length + 1}
                  placeholder="Module order in the course"
                  className="w-full"
                  required
                />
                <p className="text-xs text-slate-500">
                  Position of this module in the course (1 = first)
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCreateOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={courses.length === 0}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Module
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={filtersOpen} onOpenChange={setFiltersOpen}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold">Filters</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Select value={levelFilter} onValueChange={setLevelFilter}>
                <SelectTrigger className="bg-slate-50 border-slate-200 rounded-lg px-4 py-2 text-sm">
                  <SelectValue placeholder="All Levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                  <SelectItem value="expert">Expert</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-slate-50 border-slate-200 rounded-lg px-4 py-2 text-sm">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="bg-slate-50 border-slate-200 rounded-lg px-4 py-2 text-sm">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="name">Name (A-Z)</SelectItem>
                  <SelectItem value="lessons">Most Lessons</SelectItem>
                  <SelectItem value="duration">Longest Duration</SelectItem>
                  <SelectItem value="price">Highest Price</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <Button
                  className="flex-1 bg-primary text-primary-foreground"
                  onClick={() => setFiltersOpen(false)}
                >
                  Apply
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setLevelFilter("all");
                    setStatusFilter("all");
                    setSortBy("newest");
                    setFiltersOpen(false);
                  }}
                >
                  Reset
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      {/* Edit Dialog */}
      <Dialog
        open={!!editModule}
        onOpenChange={(v) => !v && setEditModule(null)}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-slate-900">
              Edit Module
            </DialogTitle>
            <DialogDescription className="text-slate-600">
              Update module information and settings
            </DialogDescription>
          </DialogHeader>
          {editModule && (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget as HTMLFormElement);
                const title = String(fd.get("title") || editModule.title);
                const courseId = String(fd.get("course") || editModule.course);
                const description = String(
                  fd.get("description") || editModule.description || ""
                );
                const order = Number(fd.get("order") || editModule.order || 1);

                try {
                  await modulesService.updateModule(editModule.id, {
                    title,
                    courseId,
                    description,
                    order,
                  });
                  push({
                    type: "success",
                    message: "Module updated successfully",
                  });
                  setEditModule(null);
                  await refetchCourses();
                  queryClient.invalidateQueries({ queryKey: ["modules"] });
                  queryClient.invalidateQueries({ queryKey: ["courses"] });
                } catch (err) {
                  console.error(err);
                  push({ type: "error", message: "Failed to update module" });
                }
              }}
              className="space-y-5"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between mb-1">
                  <Label
                    htmlFor="edit-course"
                    className="text-sm font-semibold text-slate-700"
                  >
                    Course
                  </Label>
                  <Link
                    href="/courses/create"
                    className="text-xs text-primary hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    Create New Course
                  </Link>
                </div>
                <Select name="course" defaultValue={editModule.course}>
                  <SelectTrigger id="edit-course">
                    <SelectValue placeholder="Select a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.length > 0 ? (
                      courses.map((course: any) => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.title}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="" disabled>
                        No courses available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="edit-title"
                  className="text-sm font-semibold text-slate-700"
                >
                  Module Title *
                </Label>
                <Input
                  id="edit-title"
                  name="title"
                  placeholder="e.g., Introduction to Citation Jet"
                  defaultValue={editModule.title}
                  className="w-full"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="edit-description"
                  className="text-sm font-semibold text-slate-700"
                >
                  Description
                </Label>
                <Textarea
                  id="edit-description"
                  name="description"
                  rows={4}
                  placeholder="Describe what this module covers..."
                  defaultValue={editModule.description || ""}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="edit-order"
                  className="text-sm font-semibold text-slate-700"
                >
                  Order *
                </Label>
                <Input
                  id="edit-order"
                  name="order"
                  type="number"
                  min="1"
                  defaultValue={editModule.order || 1}
                  placeholder="Module order in the course"
                  className="w-full"
                  required
                />
                <p className="text-xs text-slate-500">
                  Position of this module in the course (1 = first)
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditModule(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog
        open={!!previewModule}
        onOpenChange={(v) => !v && setPreviewModule(null)}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-slate-900">
              Course Preview
            </DialogTitle>
            <DialogDescription className="text-slate-600">
              Complete overview of the training course
            </DialogDescription>
          </DialogHeader>
          {previewModule && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  {previewModule.title}
                </h3>
                {previewModule.description && (
                  <p className="text-slate-600">{previewModule.description}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-sm text-slate-600 mb-1">Level</p>
                  <p className="text-lg font-semibold text-slate-900 capitalize">
                    {previewModule.level || "N/A"}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-sm text-slate-600 mb-1">Type</p>
                  <p className="text-lg font-semibold text-slate-900 capitalize">
                    {previewModule.type || "N/A"}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-sm text-slate-600 mb-1">Duration</p>
                  <p className="text-lg font-semibold text-slate-900">
                    {previewModule.duration}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-sm text-slate-600 mb-1">Lessons</p>
                  <p className="text-lg font-semibold text-slate-900">
                    {previewModule.lessons}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-sm text-slate-600 mb-1">Status</p>
                  <p className="text-lg font-semibold text-slate-900 capitalize">
                    {previewModule.status}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-sm text-slate-600 mb-1">Price</p>
                  <p className="text-lg font-semibold text-primary">
                    $
                    {previewModule.price
                      ? previewModule.price.toFixed(2)
                      : "0.00"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Analytics Dialog */}
      <Dialog
        open={!!analyticsModule}
        onOpenChange={(v) => !v && setAnalyticsModule(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-slate-900">
              Course Analytics
            </DialogTitle>
            <DialogDescription className="text-slate-600">
              Performance metrics and insights
            </DialogDescription>
          </DialogHeader>
          {analyticsModule && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-primary/10 rounded-lg p-5 text-center">
                  <p className="text-sm text-primary font-medium mb-2">
                    Completion Rate
                  </p>
                  <p className="text-3xl font-bold text-blue-700">
                    {analyticsModule.completion}%
                  </p>
                </div>
                <div className="bg-amber-50 rounded-lg p-5 text-center">
                  <p className="text-sm text-amber-600 font-medium mb-2">
                    Total Lessons
                  </p>
                  <p className="text-3xl font-bold text-amber-700">
                    {analyticsModule.lessons}
                  </p>
                </div>
                <div className="bg-purple-50 rounded-lg p-5 text-center">
                  <p className="text-sm text-purple-600 font-medium mb-2">
                    Duration
                  </p>
                  <p className="text-3xl font-bold text-purple-700">
                    {analyticsModule.durationHours}h
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 rounded-lg p-5">
                <h4 className="font-semibold text-slate-900 mb-3">
                  Course Progress
                </h4>
                <div className="w-full bg-slate-200 rounded-full h-4 overflow-hidden">
                  <div
                    className="bg-blue-600 h-4 rounded-full transition-all duration-500"
                    style={{ width: `${analyticsModule.completion}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Share Dialog */}
      <Dialog
        open={!!shareModule}
        onOpenChange={(v) => !v && setShareModule(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900">
              Share Course
            </DialogTitle>
            <DialogDescription className="text-slate-600">
              Share this training course with others
            </DialogDescription>
          </DialogHeader>
          {shareModule && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Input
                  readOnly
                  value={`${window.location.origin}/courses/${shareModule.id}`}
                  className="flex-1"
                />
                <Button
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `${window.location.origin}/courses/${shareModule.id}`
                    );
                    push({
                      type: "success",
                      message: "Link copied to clipboard",
                    });
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
              </div>
              <p className="text-sm text-slate-600">
                Share this link with pilots interested in:{" "}
                <strong>{shareModule.title}</strong>
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteId}
        onOpenChange={(v) => !v && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold text-slate-900">
              Delete Training Course?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600">
              This action cannot be undone. This will permanently delete the
              course and all associated lessons and progress data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!deleteId) return;
                try {
                  await modulesService.deleteModule(deleteId);
                  push({
                    type: "success",
                    message: "Course deleted successfully",
                  });
                  setDeleteId(null);
                  queryClient.invalidateQueries({ queryKey: ["modules"] });
                } catch {
                  push({ type: "error", message: "Failed to delete course" });
                }
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Course
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add Course to Module Dialog */}
      <Dialog
        open={!!addCourseModule}
        onOpenChange={(v) => !v && setAddCourseModule(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900">
              Add Course to Module
            </DialogTitle>
            <DialogDescription className="text-slate-600">
              Add a course to "{addCourseModule?.title}" module
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between mb-1">
                <Label
                  htmlFor="course-select"
                  className="text-sm font-semibold text-slate-700"
                >
                  Select Course
                </Label>
                <Link
                  href="/courses/create"
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  Create New Course
                </Link>
              </div>
              <Select
                value={selectedCourseToAdd}
                onValueChange={setSelectedCourseToAdd}
              >
                <SelectTrigger id="course-select">
                  <SelectValue placeholder="Choose a course to add" />
                </SelectTrigger>
                <SelectContent>
                  {courses.length > 0 ? (
                    courses.map((course: any) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.title}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="" disabled>
                      No courses available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <Button
                variant="outline"
                onClick={() => setAddCourseModule(null)}
              >
                Cancel
              </Button>
              <Button
                onClick={async () => {
                  if (!selectedCourseToAdd || !addCourseModule) return;

                  const course = courses.find(
                    (c: any) => c.id === selectedCourseToAdd
                  );
                  if (!course) return;

                  try {
                    await modulesService.updateModule(addCourseModule.id, {
                      courseId: selectedCourseToAdd,
                      title: addCourseModule.title,
                      order: addCourseModule.order || 1,
                    });

                    push({
                      type: "success",
                      message: `Course "${course.title}" added to module "${addCourseModule.title}"`,
                    });

                    setAddCourseModule(null);
                    setSelectedCourseToAdd("");
                    queryClient.invalidateQueries({ queryKey: ["modules"] });
                    queryClient.invalidateQueries({ queryKey: ["courses"] });
                  } catch (err: any) {
                    console.error("Add course error:", err);
                    push({
                      type: "error",
                      message:
                        err.response?.data?.message ||
                        "Failed to add course to module",
                    });
                  }
                }}
                disabled={!selectedCourseToAdd}
                className="bg-primary hover:bg-primary/90"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Course
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
