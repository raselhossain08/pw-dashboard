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
  GripVertical,
  Grid3x3,
  List,
  CheckSquare as CheckboxIcon,
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
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CoursesTableProps {
  courses: Course[];
  onEdit: (course: Course) => void;
  onDelete: (courseId: string) => void;
  onDuplicate: (courseId: string) => void;
  onPublish: (courseId: string) => void;
  onUnpublish: (courseId: string) => void;
  onReorder?: (courses: Course[]) => void;
  actionLoading?: string | null;
  viewMode?: "table" | "grid";
}

export default function CoursesTable({
  courses,
  onEdit,
  onDelete,
  onDuplicate,
  onPublish,
  onUnpublish,
  onReorder,
  actionLoading,
  viewMode = "table",
}: CoursesTableProps) {
  const [selectedCourses, setSelectedCourses] = React.useState<Set<string>>(
    new Set()
  );
  const [quickViewCourse, setQuickViewCourse] = React.useState<Course | null>(
    null
  );
  const [localCourses, setLocalCourses] = React.useState<Course[]>(courses);

  React.useEffect(() => {
    setLocalCourses(courses);
  }, [courses]);

  const handleSelectAll = () => {
    if (selectedCourses.size === localCourses.length) {
      setSelectedCourses(new Set());
    } else {
      setSelectedCourses(
        new Set(
          localCourses.map((c) => c.id).filter((id): id is string => !!id)
        )
      );
    }
  };

  const handleSelectCourse = (courseId: string) => {
    const newSelected = new Set(selectedCourses);
    if (newSelected.has(courseId)) {
      newSelected.delete(courseId);
    } else {
      newSelected.add(courseId);
    }
    setSelectedCourses(newSelected);
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(localCourses);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setLocalCourses(items);
    if (onReorder) {
      onReorder(items);
    }
  };

  const handleBulkDelete = () => {
    selectedCourses.forEach((id) => onDelete(id));
    setSelectedCourses(new Set());
  };

  const handleBulkPublish = () => {
    selectedCourses.forEach((id) => onPublish(id));
    setSelectedCourses(new Set());
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

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {/* Bulk Actions Bar */}
        {selectedCourses.size > 0 && (
          <div className="bg-primary/5 border-b border-primary/10 px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckboxIcon className="w-4 h-4 text-primary" />
              <span className="font-medium text-secondary">
                {selectedCourses.size} course
                {selectedCourses.size > 1 ? "s" : ""} selected
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkPublish}
                disabled={!!actionLoading}
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Publish Selected
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkDelete}
                disabled={!!actionLoading}
                className="text-red-600 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Selected
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedCourses(new Set())}
              >
                Clear
              </Button>
            </div>
          </div>
        )}

        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="courses-table">
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={snapshot.isDraggingOver ? "bg-primary/5" : ""}
              >
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={
                            selectedCourses.size === localCourses.length &&
                            localCourses.length > 0
                          }
                          onCheckedChange={handleSelectAll}
                        />
                      </TableHead>
                      <TableHead className="w-12">
                        <GripVertical className="w-4 h-4 text-gray-400" />
                      </TableHead>
                      <TableHead className="w-20">Thumbnail</TableHead>
                      <TableHead>Course Title</TableHead>
                      <TableHead>Instructor</TableHead>
                      <TableHead>Categories</TableHead>
                      <TableHead className="text-center">Students</TableHead>
                      <TableHead className="text-center">Rating</TableHead>
                      <TableHead className="w-[200px]">
                        Sales Progress
                      </TableHead>
                      <TableHead className="text-center">Price</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {localCourses.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={12}
                          className="text-center py-8 text-gray-500"
                        >
                          No courses found
                        </TableCell>
                      </TableRow>
                    ) : (
                      localCourses.map((course, index) => {
                        if (!course.id) return null;
                        const courseId = course.id; // Type assertion
                        const salesProgress = calculateSalesProgress(course);
                        const enrolled = course.enrollmentCount || 0;
                        const maxStudents = course.maxStudents || 0;
                        const instructor =
                          typeof course.instructor === "object"
                            ? course.instructor
                            : null;

                        return (
                          <Draggable
                            key={courseId}
                            draggableId={courseId}
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <TableRow
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={`${
                                  snapshot.isDragging
                                    ? "bg-primary/10 shadow-lg"
                                    : selectedCourses.has(courseId)
                                    ? "bg-primary/5"
                                    : ""
                                } transition-colors`}
                              >
                                <TableCell>
                                  <Checkbox
                                    checked={selectedCourses.has(courseId)}
                                    onCheckedChange={() =>
                                      handleSelectCourse(courseId)
                                    }
                                  />
                                </TableCell>
                                <TableCell>
                                  <div
                                    {...provided.dragHandleProps}
                                    className="cursor-grab active:cursor-grabbing"
                                  >
                                    <GripVertical className="w-5 h-5 text-gray-400 hover:text-primary transition-colors" />
                                  </div>
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
                                    <div className="flex items-center gap-2 mt-1">
                                      <Badge
                                        variant="outline"
                                        className={getLevelColor(course.level)}
                                      >
                                        {course.level}
                                      </Badge>
                                      <span className="text-xs text-gray-500">
                                        {course.duration} hours
                                      </span>
                                    </div>
                                  </div>
                                </TableCell>

                                <TableCell>
                                  {instructor ? (
                                    <div className="flex items-center gap-2">
                                      {instructor.avatar && (
                                        <div className="relative w-8 h-8 rounded-full overflow-hidden bg-gray-100">
                                          <Image
                                            src={instructor.avatar}
                                            alt={`${
                                              instructor.firstName || ""
                                            } ${instructor.lastName || ""}`}
                                            fill
                                            className="object-cover"
                                          />
                                        </div>
                                      )}
                                      <div>
                                        <p className="text-sm font-medium text-secondary">
                                          {instructor.firstName}{" "}
                                          {instructor.lastName}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                          {instructor.email}
                                        </p>
                                      </div>
                                    </div>
                                  ) : (
                                    <span className="text-xs text-gray-400">
                                      No instructor
                                    </span>
                                  )}
                                </TableCell>

                                <TableCell>
                                  <div className="flex flex-wrap gap-1 max-w-xs">
                                    {course.categories &&
                                    course.categories.length > 0 ? (
                                      course.categories
                                        .slice(0, 2)
                                        .map((cat, idx) => (
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
                                        <Badge
                                          variant="outline"
                                          className="text-xs"
                                        >
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

                                <TableCell className="text-center">
                                  <div className="flex items-center justify-center gap-1">
                                    <span className="text-yellow-500">★</span>
                                    <span className="font-semibold">
                                      {course.rating
                                        ? course.rating.toFixed(1)
                                        : "N/A"}
                                    </span>
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    ({course.totalRatings || 0})
                                  </div>
                                </TableCell>

                                <TableCell>
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
                                              ((course.originalPrice -
                                                course.price) /
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
                                      (course.isPublished
                                        ? "published"
                                        : "draft")}
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
                                      <DropdownMenuContent
                                        align="end"
                                        className="w-48"
                                      >
                                        <DropdownMenuLabel>
                                          Actions
                                        </DropdownMenuLabel>
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
                                        {course.isPublished ? (
                                          <DropdownMenuItem
                                            onClick={() =>
                                              course.id &&
                                              onUnpublish(course.id)
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
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                          onClick={() =>
                                            course.id && onDelete(course.id)
                                          }
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
                            )}
                          </Draggable>
                        );
                      })
                    )}
                    {provided.placeholder}
                  </TableBody>
                </Table>
              </div>
            )}
          </Droppable>
        </DragDropContext>
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
                  <p className="text-gray-600">{quickViewCourse.description}</p>
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
