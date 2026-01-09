"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Course } from "@/services/courses.service";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Edit,
  Trash2,
  Eye,
  MoreVertical,
  Copy,
  CheckCircle2,
  XCircle,
  Loader2,
  Grid3x3,
  List,
  CheckSquare as CheckboxIcon,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Filter,
  X,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";

interface CoursesTableProps {
  courses: Course[];
  onEdit: (course: Course) => void;
  onDelete: (courseId: string) => void;
  onDuplicate: (courseId: string) => void;
  onPublish: (courseId: string) => void;
  onUnpublish: (courseId: string) => void;
  onToggleStatus?: (courseId: string) => void;
  onReorder?: (courses: Course[]) => void;
  actionLoading?: string | null;
  viewMode?: "table" | "grid";
  selectedIds?: string[];
  onToggleSelection?: (id: string) => void;
  onToggleSelectAll?: () => void;
}

type SortConfig = {
  key: string;
  direction: "asc" | "desc" | null;
};

type FilterConfig = {
  title: string;
  instructor: string;
  category: string;
  status: string;
  level: string;
};

export default function CoursesTable({
  courses,
  onEdit,
  onDelete,
  onDuplicate,
  onPublish,
  onUnpublish,
  onToggleStatus,
  onReorder,
  actionLoading,
  viewMode = "table",
  selectedIds = [],
  onToggleSelection,
  onToggleSelectAll,
}: CoursesTableProps) {
  const [quickViewCourse, setQuickViewCourse] = React.useState<Course | null>(
    null
  );
  const [sortConfig, setSortConfig] = React.useState<SortConfig>({
    key: "",
    direction: null,
  });
  const [filters, setFilters] = React.useState<FilterConfig>({
    title: "",
    instructor: "",
    category: "",
    status: "",
    level: "",
  });
  const [activeFilters, setActiveFilters] = React.useState<string[]>([]);

  const handleSelectAll = () => {
    if (onToggleSelectAll) {
      onToggleSelectAll();
    }
  };

  const handleSelectCourse = (courseId: string) => {
    if (onToggleSelection) {
      onToggleSelection(courseId);
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-700";
      case "draft":
        return "bg-yellow-100 text-yellow-700";
      case "archived":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-primary/10 text-primary";
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "beginner":
        return "bg-green-100 text-green-700";
      case "intermediate":
        return "bg-primary/10 text-primary";
      case "advanced":
        return "bg-orange-100 text-orange-700";
      case "expert":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const calculateSalesProgress = (course: Course): number => {
    if (!course.maxStudents) return 0;
    const enrolled = course.enrollmentCount || 0;
    return Math.min((enrolled / course.maxStudents) * 100, 100);
  };

  // Handle sorting
  const handleSort = (key: string) => {
    setSortConfig((prev) => ({
      key,
      direction:
        prev.key === key
          ? prev.direction === "asc"
            ? "desc"
            : prev.direction === "desc"
            ? null
            : "asc"
          : "asc",
    }));
  };

  // Handle filtering
  const handleFilterChange = (key: keyof FilterConfig, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));

    // Update active filters list
    if (value) {
      setActiveFilters((prev) => (prev.includes(key) ? prev : [...prev, key]));
    } else {
      setActiveFilters((prev) => prev.filter((f) => f !== key));
    }
  };

  const clearAllFilters = () => {
    setFilters({
      title: "",
      instructor: "",
      category: "",
      status: "",
      level: "",
    });
    setActiveFilters([]);
  };

  // Apply filters and sorting to courses (client-side for instant feedback)
  const processedCourses = React.useMemo(() => {
    let result = [...courses];

    // Apply filters
    if (filters.title) {
      result = result.filter((course) =>
        course.title.toLowerCase().includes(filters.title.toLowerCase())
      );
    }

    if (filters.instructor) {
      result = result.filter((course) => {
        const searchTerm = filters.instructor.toLowerCase();

        // Check instructors array first
        if (
          course.instructors &&
          Array.isArray(course.instructors) &&
          course.instructors.length > 0
        ) {
          return course.instructors.some((inst: any) => {
            if (typeof inst === "object" && inst !== null) {
              const name = `${inst.firstName || ""} ${
                inst.lastName || ""
              }`.toLowerCase();
              return name.includes(searchTerm);
            }
            return false;
          });
        }

        // Fallback to single instructor
        const instructor =
          typeof course.instructor === "object" ? course.instructor : null;
        if (!instructor) return false;
        const instructorName = `${instructor.firstName || ""} ${
          instructor.lastName || ""
        }`.toLowerCase();
        return instructorName.includes(searchTerm);
      });
    }

    if (filters.category) {
      result = result.filter((course) =>
        course.categories?.some((cat) =>
          cat.toLowerCase().includes(filters.category.toLowerCase())
        )
      );
    }

    if (filters.status) {
      result = result.filter((course) => {
        const status =
          course.status || (course.isPublished ? "published" : "draft");
        return status.toLowerCase() === filters.status.toLowerCase();
      });
    }

    if (filters.level) {
      result = result.filter((course) =>
        course.level.toLowerCase().includes(filters.level.toLowerCase())
      );
    }

    // Apply sorting
    if (sortConfig.key && sortConfig.direction) {
      result.sort((a, b) => {
        let aValue: any;
        let bValue: any;

        switch (sortConfig.key) {
          case "title":
            aValue = a.title.toLowerCase();
            bValue = b.title.toLowerCase();
            break;
          case "students":
            aValue = a.enrollmentCount || 0;
            bValue = b.enrollmentCount || 0;
            break;
          case "rating":
            aValue = a.rating || 0;
            bValue = b.rating || 0;
            break;
          case "price":
            aValue = a.price || 0;
            bValue = b.price || 0;
            break;
          case "status":
            aValue = a.status || (a.isPublished ? "published" : "draft");
            bValue = b.status || (b.isPublished ? "published" : "draft");
            break;
          default:
            return 0;
        }

        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [courses, filters, sortConfig]);

  const getSortIcon = (key: string) => {
    if (sortConfig.key !== key) return <ArrowUpDown className="w-4 h-4" />;
    if (sortConfig.direction === "asc") return <ArrowUp className="w-4 h-4" />;
    if (sortConfig.direction === "desc")
      return <ArrowDown className="w-4 h-4" />;
    return <ArrowUpDown className="w-4 h-4" />;
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Filter Summary & Clear */}
        {activeFilters.length > 0 && (
          <div className="px-4 py-3 bg-blue-50 border-b border-blue-100 flex items-center justify-between">
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">
                Active Filters:
              </span>
              {activeFilters.map((filterKey) => (
                <Badge key={filterKey} variant="outline" className="bg-white">
                  {filterKey}: {filters[filterKey as keyof FilterConfig]}
                  <button
                    onClick={() =>
                      handleFilterChange(filterKey as keyof FilterConfig, "")
                    }
                    className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="text-blue-600 hover:text-blue-700"
            >
              Clear All
            </Button>
          </div>
        )}

        <div className="overflow-x-auto">
          <Table className="min-w-[1000px]">
            <TableHeader>
              <TableRow>
                <TableHead className="w-10 sm:w-12">
                  <Checkbox
                    checked={
                      selectedIds.length === processedCourses.length &&
                      processedCourses.length > 0
                    }
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead className="w-16 sm:w-20">Thumbnail</TableHead>

                {/* Course Title - Sortable & Filterable */}
                <TableHead className="min-w-[200px]">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleSort("title")}
                      className="flex items-center gap-1 hover:text-primary transition-colors"
                    >
                      Course Title
                      {getSortIcon("title")}
                    </button>
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          className={`p-1 rounded hover:bg-gray-100 ${
                            filters.title ? "text-blue-600" : ""
                          }`}
                        >
                          <Filter className="w-3.5 h-3.5" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-64" align="start">
                        <div className="space-y-2">
                          <label className="text-xs font-medium">
                            Filter by Title
                          </label>
                          <Input
                            placeholder="Search title..."
                            value={filters.title}
                            onChange={(e) =>
                              handleFilterChange("title", e.target.value)
                            }
                            className="h-8 text-sm"
                          />
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </TableHead>

                {/* Instructor - Filterable */}
                <TableHead className="hidden lg:table-cell">
                  <div className="flex items-center gap-2">
                    <span>Instructor</span>
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          className={`p-1 rounded hover:bg-gray-100 ${
                            filters.instructor ? "text-blue-600" : ""
                          }`}
                        >
                          <Filter className="w-3.5 h-3.5" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-64" align="start">
                        <div className="space-y-2">
                          <label className="text-xs font-medium">
                            Filter by Instructor
                          </label>
                          <Input
                            placeholder="Search instructor..."
                            value={filters.instructor}
                            onChange={(e) =>
                              handleFilterChange("instructor", e.target.value)
                            }
                            className="h-8 text-sm"
                          />
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </TableHead>

                {/* Categories - Filterable */}
                <TableHead className="hidden md:table-cell">
                  <div className="flex items-center gap-2">
                    <span>Categories</span>
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          className={`p-1 rounded hover:bg-gray-100 ${
                            filters.category ? "text-blue-600" : ""
                          }`}
                        >
                          <Filter className="w-3.5 h-3.5" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-64" align="start">
                        <div className="space-y-2">
                          <label className="text-xs font-medium">
                            Filter by Category
                          </label>
                          <Input
                            placeholder="Search category..."
                            value={filters.category}
                            onChange={(e) =>
                              handleFilterChange("category", e.target.value)
                            }
                            className="h-8 text-sm"
                          />
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </TableHead>

                {/* Students - Sortable */}
                <TableHead className="text-center">
                  <button
                    onClick={() => handleSort("students")}
                    className="flex items-center gap-1 hover:text-primary transition-colors mx-auto"
                  >
                    Students
                    {getSortIcon("students")}
                  </button>
                </TableHead>

                {/* Rating - Sortable */}
                <TableHead className="text-center hidden xl:table-cell">
                  <button
                    onClick={() => handleSort("rating")}
                    className="flex items-center gap-1 hover:text-primary transition-colors mx-auto"
                  >
                    Rating
                    {getSortIcon("rating")}
                  </button>
                </TableHead>

                <TableHead className="w-[150px] sm:w-[200px] hidden lg:table-cell">
                  Sales Progress
                </TableHead>

                {/* Price - Sortable */}
                <TableHead className="text-center">
                  <button
                    onClick={() => handleSort("price")}
                    className="flex items-center gap-1 hover:text-primary transition-colors mx-auto"
                  >
                    Price
                    {getSortIcon("price")}
                  </button>
                </TableHead>

                {/* Status - Filterable */}
                <TableHead className="text-center">
                  <div className="flex items-center gap-2 justify-center">
                    <span>Status</span>
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          className={`p-1 rounded hover:bg-gray-100 ${
                            filters.status ? "text-blue-600" : ""
                          }`}
                        >
                          <Filter className="w-3.5 h-3.5" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-48" align="center">
                        <div className="space-y-2">
                          <label className="text-xs font-medium">
                            Filter by Status
                          </label>
                          <div className="space-y-1">
                            <button
                              onClick={() => handleFilterChange("status", "")}
                              className={`w-full text-left px-2 py-1.5 text-sm rounded hover:bg-gray-100 ${
                                !filters.status ? "bg-gray-100" : ""
                              }`}
                            >
                              All
                            </button>
                            <button
                              onClick={() =>
                                handleFilterChange("status", "published")
                              }
                              className={`w-full text-left px-2 py-1.5 text-sm rounded hover:bg-gray-100 ${
                                filters.status === "published"
                                  ? "bg-gray-100"
                                  : ""
                              }`}
                            >
                              Published
                            </button>
                            <button
                              onClick={() =>
                                handleFilterChange("status", "draft")
                              }
                              className={`w-full text-left px-2 py-1.5 text-sm rounded hover:bg-gray-100 ${
                                filters.status === "draft" ? "bg-gray-100" : ""
                              }`}
                            >
                              Draft
                            </button>
                            <button
                              onClick={() =>
                                handleFilterChange("status", "archived")
                              }
                              className={`w-full text-left px-2 py-1.5 text-sm rounded hover:bg-gray-100 ${
                                filters.status === "archived"
                                  ? "bg-gray-100"
                                  : ""
                              }`}
                            >
                              Archived
                            </button>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </TableHead>

                <TableHead className="text-right w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {processedCourses.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={11}
                    className="text-center py-8 text-gray-500"
                  >
                    {activeFilters.length > 0 ? (
                      <div className="space-y-2">
                        <p>No courses match your filters</p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={clearAllFilters}
                        >
                          Clear Filters
                        </Button>
                      </div>
                    ) : (
                      "No courses found"
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                processedCourses.map((course) => {
                  if (!course.id) return null;
                  const courseId = course.id;
                  const salesProgress = calculateSalesProgress(course);
                  const enrolled = course.enrollmentCount || 0;
                  const maxStudents = course.maxStudents || 0;

                  // Smart instructor display: prioritize instructors array, fallback to instructor
                  const displayInstructors =
                    course.instructors &&
                    Array.isArray(course.instructors) &&
                    course.instructors.length > 0
                      ? course.instructors
                      : typeof course.instructor === "object" &&
                        course.instructor
                      ? [course.instructor]
                      : [];

                  const primaryInstructor = displayInstructors[0] || null;
                  const instructorCount = displayInstructors.length;

                  return (
                    <TableRow
                      key={courseId}
                      className={`${
                        selectedIds.includes(courseId) ? "bg-primary/5" : ""
                      } transition-colors hover:bg-gray-50`}
                    >
                      <TableCell>
                        <Checkbox
                          checked={selectedIds.includes(courseId)}
                          onCheckedChange={() => handleSelectCourse(courseId)}
                        />
                      </TableCell>

                      <TableCell>
                        <div
                          className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                          onClick={() => setQuickViewCourse(course)}
                        >
                          {course.thumbnail ? (
                            <Image
                              src={course.thumbnail}
                              alt={course.title}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                              No image
                            </div>
                          )}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="max-w-md">
                          <div
                            className="font-semibold text-secondary hover:text-primary transition-colors line-clamp-2 cursor-pointer"
                            onClick={() => setQuickViewCourse(course)}
                          >
                            {course.title}
                          </div>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <Badge
                              variant="outline"
                              className={getLevelColor(course.level)}
                            >
                              {course.level}
                            </Badge>
                            {course.isFeatured && (
                              <Badge className="bg-yellow-500 text-white text-xs">
                                ⭐ Featured
                              </Badge>
                            )}
                            {course.providesCertificate && (
                              <Badge className="bg-blue-500 text-white text-xs">
                                🎓 Certificate
                              </Badge>
                            )}
                            <span className="text-xs text-gray-500">
                              {course.duration} hours
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="hidden lg:table-cell">
                        {primaryInstructor &&
                        typeof primaryInstructor === "object" ? (
                          <div className="flex items-center gap-2">
                            {primaryInstructor.avatar && (
                              <div className="relative w-8 h-8 rounded-full overflow-hidden bg-gray-100">
                                <Image
                                  src={primaryInstructor.avatar}
                                  alt={`${primaryInstructor.firstName || ""} ${
                                    primaryInstructor.lastName || ""
                                  }`}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            )}
                            <div>
                              <p className="text-sm font-medium text-secondary">
                                {primaryInstructor.firstName}{" "}
                                {primaryInstructor.lastName}
                                {instructorCount > 1 && (
                                  <span className="ml-2 text-xs text-gray-500">
                                    +{instructorCount - 1} more
                                  </span>
                                )}
                              </p>
                              <p className="text-xs text-gray-500">
                                {primaryInstructor.email}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">
                            No instructor
                          </span>
                        )}
                      </TableCell>

                      <TableCell className="hidden md:table-cell">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {course.categories && course.categories.length > 0 ? (
                            course.categories.slice(0, 2).map((cat, idx) => (
                              <Badge
                                key={idx}
                                variant="outline"
                                className="text-xs bg-primary/10 text-primary border-primary/30"
                              >
                                {cat}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-xs text-gray-400">
                              No category
                            </span>
                          )}
                          {course.categories &&
                            course.categories.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{course.categories.length - 2}
                              </Badge>
                            )}
                        </div>
                      </TableCell>

                      <TableCell className="text-center">
                        <div className="font-semibold text-secondary">
                          {enrolled}
                        </div>
                        <div className="text-xs text-gray-500">
                          / {maxStudents}
                        </div>
                      </TableCell>

                      <TableCell className="text-center hidden xl:table-cell">
                        <div className="flex items-center justify-center gap-1">
                          <span className="text-yellow-500">★</span>
                          <span className="font-semibold">
                            {course.rating ? course.rating.toFixed(1) : "N/A"}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">
                          ({course.totalRatings || 0})
                        </div>
                      </TableCell>

                      <TableCell className="hidden lg:table-cell">
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs text-gray-600">
                            <span>Enrollment</span>
                            <span className="font-semibold">
                              {salesProgress.toFixed(0)}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all duration-300 ${
                                salesProgress >= 80
                                  ? "bg-green-500"
                                  : salesProgress >= 50
                                  ? "bg-primary"
                                  : "bg-yellow-500"
                              }`}
                              style={{ width: `${salesProgress}%` }}
                            />
                          </div>
                          <div className="text-xs text-gray-500">
                            {enrolled} / {maxStudents} students
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="text-center">
                        <div className="flex flex-col items-center gap-1">
                          <div className="font-bold text-primary">
                            ${course.price.toFixed(2)}
                          </div>
                          {course.originalPrice &&
                            course.originalPrice > course.price && (
                              <>
                                <div className="text-xs text-gray-400 line-through">
                                  ${course.originalPrice.toFixed(2)}
                                </div>
                                <Badge
                                  variant="outline"
                                  className="text-xs bg-green-50 text-green-600 border-green-200"
                                >
                                  -
                                  {Math.round(
                                    ((course.originalPrice - course.price) /
                                      course.originalPrice) *
                                      100
                                  )}
                                  % OFF
                                </Badge>
                              </>
                            )}
                        </div>
                      </TableCell>

                      <TableCell className="text-center">
                        <Badge
                          variant="outline"
                          className={getStatusColor(course.status)}
                        >
                          {course.status ||
                            (course.isPublished ? "published" : "draft")}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setQuickViewCourse(course)}
                            title="Quick View"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onEdit(course)}
                            title="Edit"
                            disabled={!!actionLoading}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                disabled={actionLoading === course.id}
                              >
                                {actionLoading === course.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <MoreVertical className="w-4 h-4" />
                                )}
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem asChild>
                                <Link href={`/courses/${course.id}`}>
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Details
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => onEdit(course)}
                                disabled={!!actionLoading}
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                Edit Course
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  course.id && onDuplicate(course.id)
                                }
                                disabled={!!actionLoading}
                              >
                                {actionLoading === course.id ? (
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                  <Copy className="w-4 h-4 mr-2" />
                                )}
                                Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {onToggleStatus ? (
                                <DropdownMenuItem
                                  onClick={() =>
                                    course.id && onToggleStatus(course.id)
                                  }
                                  disabled={!!actionLoading}
                                >
                                  {actionLoading === course.id ? (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  ) : course.isPublished ||
                                    course.status === "published" ? (
                                    <XCircle className="w-4 h-4 mr-2" />
                                  ) : (
                                    <CheckCircle2 className="w-4 h-4 mr-2" />
                                  )}
                                  {course.isPublished ||
                                  course.status === "published"
                                    ? "Unpublish"
                                    : "Publish"}
                                </DropdownMenuItem>
                              ) : (
                                <>
                                  {course.isPublished ? (
                                    <DropdownMenuItem
                                      onClick={() =>
                                        course.id && onUnpublish(course.id)
                                      }
                                      disabled={!!actionLoading}
                                    >
                                      {actionLoading === course.id ? (
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                      ) : (
                                        <XCircle className="w-4 h-4 mr-2" />
                                      )}
                                      Unpublish
                                    </DropdownMenuItem>
                                  ) : (
                                    <DropdownMenuItem
                                      onClick={() =>
                                        course.id && onPublish(course.id)
                                      }
                                      disabled={!!actionLoading}
                                    >
                                      {actionLoading === course.id ? (
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                      ) : (
                                        <CheckCircle2 className="w-4 h-4 mr-2" />
                                      )}
                                      Publish
                                    </DropdownMenuItem>
                                  )}
                                </>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => course.id && onDelete(course.id)}
                                className="text-red-600 focus:text-red-600"
                                disabled={!!actionLoading}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Results Counter Footer */}
        {(activeFilters.length > 0 || sortConfig.key) && (
          <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-600">
            <div className="flex items-center gap-4">
              <span>
                Showing{" "}
                <strong className="text-secondary">
                  {processedCourses.length}
                </strong>{" "}
                of <strong className="text-secondary">{courses.length}</strong>{" "}
                courses
              </span>
              {sortConfig.key && (
                <Badge variant="outline" className="text-xs">
                  Sorted by: {sortConfig.key} ({sortConfig.direction})
                </Badge>
              )}
            </div>
            {activeFilters.length > 0 && (
              <button
                onClick={clearAllFilters}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Reset Filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Quick View Dialog */}
      <Dialog
        open={!!quickViewCourse}
        onOpenChange={() => setQuickViewCourse(null)}
      >
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Course Quick View</DialogTitle>
            <DialogDescription>
              Preview course details without leaving this page
            </DialogDescription>
          </DialogHeader>
          {quickViewCourse && (
            <div className="space-y-6">
              {/* Thumbnail */}
              {quickViewCourse.thumbnail && (
                <div className="relative w-full h-64 rounded-lg overflow-hidden bg-gray-100">
                  <Image
                    src={quickViewCourse.thumbnail}
                    alt={quickViewCourse.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              {/* Title & Status */}
              <div>
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-2xl font-bold text-secondary">
                    {quickViewCourse.title}
                  </h3>
                  <Badge
                    variant="outline"
                    className={getStatusColor(quickViewCourse.status)}
                  >
                    {quickViewCourse.status ||
                      (quickViewCourse.isPublished ? "published" : "draft")}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 mt-3">
                  <Badge
                    variant="outline"
                    className={getLevelColor(quickViewCourse.level)}
                  >
                    {quickViewCourse.level}
                  </Badge>
                  <span className="text-sm text-gray-600">
                    {quickViewCourse.duration} hours
                  </span>
                  <span className="text-sm text-gray-600">•</span>
                  <span className="text-sm text-gray-600">
                    {quickViewCourse.enrollmentCount || 0} students enrolled
                  </span>
                </div>
              </div>

              {/* Description */}
              {quickViewCourse.description && (
                <div>
                  <h4 className="font-semibold text-secondary mb-2">
                    Description
                  </h4>
                  <div
                    className="text-gray-600 prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{
                      __html: quickViewCourse.description,
                    }}
                  />
                </div>
              )}

              {/* Price */}
              <div className="flex items-center gap-4">
                <div>
                  <h4 className="font-semibold text-secondary mb-1">Price</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-primary">
                      ${quickViewCourse.price.toFixed(2)}
                    </span>
                    {quickViewCourse.originalPrice &&
                      quickViewCourse.originalPrice > quickViewCourse.price && (
                        <>
                          <span className="text-lg text-gray-400 line-through">
                            ${quickViewCourse.originalPrice.toFixed(2)}
                          </span>
                          <Badge
                            variant="outline"
                            className="bg-green-50 text-green-600 border-green-200"
                          >
                            {Math.round(
                              ((quickViewCourse.originalPrice -
                                quickViewCourse.price) /
                                quickViewCourse.originalPrice) *
                                100
                            )}
                            % OFF
                          </Badge>
                        </>
                      )}
                  </div>
                </div>
              </div>

              {/* Categories */}
              {quickViewCourse.categories &&
                quickViewCourse.categories.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-secondary mb-2">
                      Categories
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {quickViewCourse.categories.map((cat, idx) => (
                        <Badge
                          key={idx}
                          variant="outline"
                          className="bg-primary/10 text-primary border-primary/30"
                        >
                          {cat}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

              {/* Aircraft Types */}
              {quickViewCourse.aircraftTypes &&
                quickViewCourse.aircraftTypes.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-secondary mb-2">
                      Aircraft Types
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {quickViewCourse.aircraftTypes.map((aircraft, idx) => (
                        <Badge
                          key={idx}
                          variant="outline"
                          className="bg-blue-50 text-blue-700 border-blue-300"
                        >
                          {aircraft}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

              {/* Excerpt */}
              {quickViewCourse.excerpt && (
                <div>
                  <h4 className="font-semibold text-secondary mb-2">
                    Quick Overview
                  </h4>
                  <p className="text-gray-600 text-sm">
                    {quickViewCourse.excerpt}
                  </p>
                </div>
              )}

              {/* Additional Features */}
              <div className="flex flex-wrap gap-2">
                {quickViewCourse.isFeatured && (
                  <Badge className="bg-yellow-500 text-white">
                    ⭐ Featured Course
                  </Badge>
                )}
                {quickViewCourse.providesCertificate && (
                  <Badge className="bg-blue-500 text-white">
                    🎓 Provides Certificate
                  </Badge>
                )}
                {(quickViewCourse.moneyBackGuarantee ?? 0) > 0 && (
                  <Badge className="bg-green-500 text-white">
                    ✓ {quickViewCourse.moneyBackGuarantee} Day Money Back
                  </Badge>
                )}
                {quickViewCourse.language && (
                  <Badge variant="outline">
                    🌐 {quickViewCourse.language.toUpperCase()}
                  </Badge>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-4 border-t">
                <Button
                  onClick={() => {
                    onEdit(quickViewCourse);
                    setQuickViewCourse(null);
                  }}
                  className="bg-primary hover:bg-primary/90"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Course
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setQuickViewCourse(null);
                    window.open(`/courses/${quickViewCourse.id}`, "_blank");
                  }}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Full Details
                </Button>
                {quickViewCourse.isPublished ? (
                  <Button
                    variant="outline"
                    onClick={() => {
                      quickViewCourse.id && onUnpublish(quickViewCourse.id);
                      setQuickViewCourse(null);
                    }}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Unpublish
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => {
                      quickViewCourse.id && onPublish(quickViewCourse.id);
                      setQuickViewCourse(null);
                    }}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Publish
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
