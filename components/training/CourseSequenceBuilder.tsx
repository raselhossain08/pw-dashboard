"use client";

import * as React from "react";
import { useCourses } from "@/hooks/useCourses";
import { CourseSequence } from "@/services/training.service";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import {
  GripVertical,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  GitBranch,
  Clock,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface CourseSequenceBuilderProps {
  sequences: CourseSequence[];
  onChange: (sequences: CourseSequence[]) => void;
}

export default function CourseSequenceBuilder({
  sequences,
  onChange,
}: CourseSequenceBuilderProps) {
  const {
    courses: coursesData,
    loading: isLoading,
    fetchCourses,
  } = useCourses();

  // Fetch courses on mount
  React.useEffect(() => {
    fetchCourses({ page: 1, limit: 100 });
  }, []);

  const courses = React.useMemo(() => {
    return (coursesData || []).filter(
      (c: any) => !sequences.find((s) => s.course === c._id)
    );
  }, [coursesData, sequences]);

  const [selectedCourse, setSelectedCourse] = React.useState<string>("");

  const addCourse = () => {
    if (!selectedCourse) return;

    const newSequence: CourseSequence = {
      course: selectedCourse,
      order: sequences.length + 1,
      isOptional: false,
      prerequisites: [],
    };

    onChange([...sequences, newSequence]);
    setSelectedCourse("");
  };

  const removeCourse = (courseId: string) => {
    const filtered = sequences.filter((s) => s.course !== courseId);
    // Reorder remaining courses
    const reordered = filtered.map((s, idx) => ({
      ...s,
      order: idx + 1,
      // Remove deleted course from prerequisites
      prerequisites: s.prerequisites.filter((p) => p !== courseId),
    }));
    onChange(reordered);
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(sequences);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update order numbers
    const reordered = items.map((item, idx) => ({
      ...item,
      order: idx + 1,
    }));

    onChange(reordered);
  };

  const toggleOptional = (courseId: string) => {
    onChange(
      sequences.map((s) =>
        s.course === courseId ? { ...s, isOptional: !s.isOptional } : s
      )
    );
  };

  const addPrerequisite = (courseId: string, prerequisiteId: string) => {
    onChange(
      sequences.map((s) =>
        s.course === courseId
          ? {
              ...s,
              prerequisites: [...new Set([...s.prerequisites, prerequisiteId])],
            }
          : s
      )
    );
  };

  const removePrerequisite = (courseId: string, prerequisiteId: string) => {
    onChange(
      sequences.map((s) =>
        s.course === courseId
          ? {
              ...s,
              prerequisites: s.prerequisites.filter(
                (p) => p !== prerequisiteId
              ),
            }
          : s
      )
    );
  };

  const getCourseById = (id: string) => {
    return (
      coursesData.find((c: any) => c._id === id) ||
      courses.find((c: any) => c._id === id)
    );
  };

  const getAvailablePrerequisites = (currentCourseId: string) => {
    const currentIndex = sequences.findIndex(
      (s) => s.course === currentCourseId
    );
    // Only courses before this one can be prerequisites
    return sequences.slice(0, currentIndex);
  };

  const getTotalDuration = () => {
    return sequences.reduce((total, seq) => {
      const course = getCourseById(seq.course);
      return total + (course?.duration || 0);
    }, 0);
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <BookOpen className="h-8 w-8 text-blue-500" />
            <div>
              <p className="text-sm text-muted-foreground">Total Courses</p>
              <p className="text-2xl font-bold">{sequences.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Clock className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-sm text-muted-foreground">Total Duration</p>
              <p className="text-2xl font-bold">{getTotalDuration()}h</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <GitBranch className="h-8 w-8 text-purple-500" />
            <div>
              <p className="text-sm text-muted-foreground">Prerequisites</p>
              <p className="text-2xl font-bold">
                {sequences.reduce((sum, s) => sum + s.prerequisites.length, 0)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Add Course */}
      <div className="flex gap-3">
        <Select value={selectedCourse} onValueChange={setSelectedCourse}>
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Select a course to add..." />
          </SelectTrigger>
          <SelectContent>
            {isLoading ? (
              <SelectItem value="_loading" disabled>
                Loading courses...
              </SelectItem>
            ) : courses.length === 0 ? (
              <SelectItem value="_empty" disabled>
                No available courses
              </SelectItem>
            ) : (
              courses.map((course: any) => (
                <SelectItem key={course._id} value={course._id}>
                  {course.title} ({course.duration || 0}h)
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
        <Button onClick={addCourse} disabled={!selectedCourse}>
          <Plus className="h-4 w-4 mr-2" />
          Add Course
        </Button>
      </div>

      {/* Course Sequence List */}
      {sequences.length === 0 ? (
        <Card className="p-12 text-center">
          <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Courses Added</h3>
          <p className="text-sm text-muted-foreground">
            Start building your learning path by adding courses above
          </p>
        </Card>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="course-sequence">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-3"
              >
                {sequences.map((seq, index) => {
                  const course = getCourseById(seq.course);
                  if (!course) return null;

                  const availablePrereqs = getAvailablePrerequisites(
                    seq.course
                  );

                  return (
                    <Draggable
                      key={seq.course}
                      draggableId={seq.course}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <Card
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`p-4 transition-shadow ${
                            snapshot.isDragging ? "shadow-lg" : ""
                          }`}
                        >
                          <div className="flex items-start gap-4">
                            {/* Drag Handle */}
                            <div
                              {...provided.dragHandleProps}
                              className="cursor-grab active:cursor-grabbing pt-1"
                            >
                              <GripVertical className="h-5 w-5 text-muted-foreground" />
                            </div>

                            {/* Order Number */}
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm shrink-0">
                              {index + 1}
                            </div>

                            {/* Course Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-semibold truncate">
                                  {course.title}
                                </h4>
                                {seq.isOptional && (
                                  <Badge variant="outline">Optional</Badge>
                                )}
                              </div>

                              <div className="flex flex-wrap gap-2 mb-3">
                                <Badge variant="secondary" className="gap-1">
                                  <Clock className="h-3 w-3" />
                                  {course.duration || 0}h
                                </Badge>
                                <Badge variant="secondary">
                                  {course.level || "Beginner"}
                                </Badge>
                                {seq.prerequisites.length > 0 && (
                                  <Badge variant="outline" className="gap-1">
                                    <GitBranch className="h-3 w-3" />
                                    {seq.prerequisites.length} Prerequisites
                                  </Badge>
                                )}
                              </div>

                              {/* Prerequisites List */}
                              {seq.prerequisites.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-2">
                                  {seq.prerequisites.map((prereqId) => {
                                    const prereqCourse =
                                      getCourseById(prereqId);
                                    if (!prereqCourse) return null;
                                    return (
                                      <Badge
                                        key={prereqId}
                                        variant="secondary"
                                        className="gap-1"
                                      >
                                        Requires: {prereqCourse.title}
                                        <button
                                          onClick={() =>
                                            removePrerequisite(
                                              seq.course,
                                              prereqId
                                            )
                                          }
                                          className="ml-1 hover:text-destructive"
                                        >
                                          ×
                                        </button>
                                      </Badge>
                                    );
                                  })}
                                </div>
                              )}

                              {/* Actions */}
                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2">
                                  <Checkbox
                                    id={`optional-${seq.course}`}
                                    checked={seq.isOptional}
                                    onCheckedChange={() =>
                                      toggleOptional(seq.course)
                                    }
                                  />
                                  <Label
                                    htmlFor={`optional-${seq.course}`}
                                    className="text-sm cursor-pointer"
                                  >
                                    Optional Course
                                  </Label>
                                </div>

                                {availablePrereqs.length > 0 && (
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <Button variant="outline" size="sm">
                                        <GitBranch className="h-4 w-4 mr-2" />
                                        Add Prerequisite
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-80">
                                      <div className="space-y-2">
                                        <h4 className="font-semibold text-sm">
                                          Select Prerequisites
                                        </h4>
                                        <p className="text-xs text-muted-foreground">
                                          Students must complete these courses
                                          first
                                        </p>
                                        {availablePrereqs.map((prereqSeq) => {
                                          const prereqCourse = getCourseById(
                                            prereqSeq.course
                                          );
                                          if (!prereqCourse) return null;

                                          const isSelected =
                                            seq.prerequisites.includes(
                                              prereqSeq.course
                                            );

                                          return (
                                            <div
                                              key={prereqSeq.course}
                                              className="flex items-center gap-2"
                                            >
                                              <Checkbox
                                                id={`prereq-${prereqSeq.course}`}
                                                checked={isSelected}
                                                onCheckedChange={(checked) => {
                                                  if (checked) {
                                                    addPrerequisite(
                                                      seq.course,
                                                      prereqSeq.course
                                                    );
                                                  } else {
                                                    removePrerequisite(
                                                      seq.course,
                                                      prereqSeq.course
                                                    );
                                                  }
                                                }}
                                              />
                                              <Label
                                                htmlFor={`prereq-${prereqSeq.course}`}
                                                className="text-sm cursor-pointer flex-1"
                                              >
                                                {prereqCourse.title}
                                              </Label>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </PopoverContent>
                                  </Popover>
                                )}
                              </div>
                            </div>

                            {/* Delete Button */}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeCourse(seq.course)}
                              className="shrink-0 text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </Card>
                      )}
                    </Draggable>
                  );
                })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}

      {/* Validation Messages */}
      {sequences.length > 0 && (
        <Card className="p-4">
          <div className="flex items-start gap-3">
            {sequences.length >= 3 ? (
              <>
                <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm">Learning Path Valid</p>
                  <p className="text-xs text-muted-foreground">
                    {sequences.filter((s) => !s.isOptional).length} required
                    courses, {sequences.filter((s) => s.isOptional).length}{" "}
                    optional
                  </p>
                </div>
              </>
            ) : (
              <>
                <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm">Minimum Requirement</p>
                  <p className="text-xs text-muted-foreground">
                    Add at least 3 courses to create a valid training program
                  </p>
                </div>
              </>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
