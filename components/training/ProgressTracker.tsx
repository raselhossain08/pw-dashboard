"use client";

import * as React from "react";
import { useStudentProgress } from "@/hooks/useTrainingPrograms";
import { useCourses } from "@/hooks/useCourses";
import { CourseSequence } from "@/services/training.service";
import {
  CheckCircle2,
  Clock,
  Circle,
  Award,
  TrendingUp,
  Calendar,
  Target,
  BookOpen,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";

interface ProgressTrackerProps {
  programId: string;
  studentId: string;
  studentName: string;
  courseSequences: CourseSequence[];
}

export default function ProgressTracker({
  programId,
  studentId,
  studentName,
  courseSequences,
}: ProgressTrackerProps) {
  const { data: progressData, isLoading } = useStudentProgress(
    programId,
    studentId
  );

  const { courses, fetchCourses } = useCourses();

  // Fetch courses on mount
  React.useEffect(() => {
    fetchCourses({ page: 1, limit: 100 });
  }, []);

  const getCourseById = (id: string) => {
    return courses.find((c: any) => c._id === id);
  };

  const getCourseProgress = (courseId: string) => {
    return progressData?.progress.find((p) => p.course === courseId);
  };

  const totalCourses = courseSequences.length;
  const completedCourses = progressData?.progress.length || 0;
  const progressPercentage =
    totalCourses > 0 ? Math.round((completedCourses / totalCourses) * 100) : 0;

  const averageScore = React.useMemo(() => {
    const scores = (progressData?.progress || [])
      .filter((p) => p.score !== undefined && p.score !== null)
      .map((p) => p.score!);

    if (scores.length === 0) return null;
    return Math.round(
      scores.reduce((sum, score) => sum + score, 0) / scores.length
    );
  }, [progressData]);

  if (isLoading) {
    return (
      <Card className="p-12 text-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
        <p className="mt-4 text-sm text-muted-foreground">
          Loading progress...
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Student Header */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold mb-1">{studentName}</h3>
            <p className="text-sm text-muted-foreground">
              Enrolled on{" "}
              {format(
                new Date(progressData?.enrolledAt || new Date()),
                "MMMM dd, yyyy"
              )}
            </p>
          </div>
          <Badge
            variant={
              progressData?.status === "dropped" ? "destructive" : "default"
            }
            className={`text-sm px-3 py-1 ${
              progressData?.status === "completed"
                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                : ""
            }`}
          >
            {progressData?.status === "completed"
              ? "Completed"
              : progressData?.status === "dropped"
              ? "Dropped"
              : "Active"}
          </Badge>
        </div>

        {/* Progress Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-medium text-muted-foreground">
                Overall Progress
              </p>
            </div>
            <p className="text-2xl font-bold">{progressPercentage}%</p>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-medium text-muted-foreground">
                Completed Courses
              </p>
            </div>
            <p className="text-2xl font-bold">
              {completedCourses} / {totalCourses}
            </p>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-medium text-muted-foreground">
                Average Score
              </p>
            </div>
            <p className="text-2xl font-bold">
              {averageScore !== null ? `${averageScore}%` : "N/A"}
            </p>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Award className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-medium text-muted-foreground">
                Certificate
              </p>
            </div>
            <p className="text-2xl font-bold">
              {progressData?.certificateIssued ? "Issued" : "Pending"}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Learning Path Progress</span>
            <span className="text-sm text-muted-foreground">
              {completedCourses} of {totalCourses} courses
            </span>
          </div>
          <Progress value={progressPercentage} className="h-3" />
        </div>
      </Card>

      {/* Course Timeline */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Course Timeline</h3>
        <div className="space-y-4">
          {courseSequences.map((seq, index) => {
            const course = getCourseById(seq.course);
            const courseProgress = getCourseProgress(seq.course);
            const isCompleted = !!courseProgress;
            const isLocked =
              seq.prerequisites.length > 0 &&
              !seq.prerequisites.every((prereqId) =>
                progressData?.progress.find((p) => p.course === prereqId)
              );

            if (!course) return null;

            return (
              <div
                key={seq.course}
                className={`relative flex items-start gap-4 ${
                  isLocked ? "opacity-50" : ""
                }`}
              >
                {/* Timeline Line */}
                {index < courseSequences.length - 1 && (
                  <div className="absolute left-6 top-10 w-0.5 h-12 bg-border" />
                )}

                {/* Status Icon */}
                <div
                  className={`flex items-center justify-center w-12 h-12 rounded-full shrink-0 ${
                    isCompleted
                      ? "bg-green-500 text-white"
                      : isLocked
                      ? "bg-muted text-muted-foreground"
                      : "bg-blue-500 text-white"
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-6 w-6" />
                  ) : isLocked ? (
                    <Circle className="h-6 w-6" />
                  ) : (
                    <Clock className="h-6 w-6" />
                  )}
                </div>

                {/* Course Info */}
                <Card className="flex-1 p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{course.title}</h4>
                        {seq.isOptional && (
                          <Badge variant="outline" className="text-xs">
                            Optional
                          </Badge>
                        )}
                        {isLocked && (
                          <Badge variant="secondary" className="text-xs">
                            Locked
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {course.description?.slice(0, 100)}
                        {course.description?.length > 100 && "..."}
                      </p>
                    </div>
                    {isCompleted && (
                      <div className="text-right ml-4">
                        {courseProgress.score !== undefined && (
                          <p className="text-lg font-bold text-green-600">
                            {courseProgress.score}%
                          </p>
                        )}
                        {courseProgress.completedAt && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {format(
                              new Date(courseProgress.completedAt),
                              "MMM dd, yyyy"
                            )}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Prerequisites Info */}
                  {seq.prerequisites.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      <span className="text-xs text-muted-foreground">
                        Prerequisites:
                      </span>
                      {seq.prerequisites.map((prereqId) => {
                        const prereqCourse = getCourseById(prereqId);
                        const prereqCompleted = !!getCourseProgress(prereqId);

                        return (
                          <Badge
                            key={prereqId}
                            variant={prereqCompleted ? "default" : "secondary"}
                            className={`text-xs gap-1 ${
                              prereqCompleted
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                : ""
                            }`}
                          >
                            {prereqCompleted && (
                              <CheckCircle2 className="h-3 w-3" />
                            )}
                            {prereqCourse?.title}
                          </Badge>
                        );
                      })}
                    </div>
                  )}

                  {/* Course Details */}
                  <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {course.duration || 0}h
                    </div>
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-3 w-3" />
                      {course.level || "Beginner"}
                    </div>
                    {isCompleted && (
                      <div className="flex items-center gap-1 text-green-600">
                        <CheckCircle2 className="h-3 w-3" />
                        Completed
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Certificate Status */}
      {progressData?.status === "completed" && (
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-amber-500 text-white shrink-0">
              <Award className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold mb-1">Certificate of Completion</h4>
              {progressData.certificateIssued ? (
                <p className="text-sm text-muted-foreground">
                  Certificate has been issued and sent to the student
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Certificate will be issued automatically upon program
                  completion
                </p>
              )}
            </div>
            {progressData.certificateIssued && (
              <Badge
                variant="default"
                className="gap-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
              >
                <CheckCircle2 className="h-3 w-3" />
                Issued
              </Badge>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
