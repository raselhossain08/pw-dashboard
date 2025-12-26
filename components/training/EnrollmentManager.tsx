"use client";

import * as React from "react";
import {
  useEnrollStudent,
  useProgramEnrollments,
  useUpdateProgress,
} from "@/hooks/useTrainingPrograms";
import { useStudents } from "@/hooks/useStudents";
import { ProgramEnrollment } from "@/services/training.service";
import {
  Users,
  UserPlus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  MoreVertical,
  Download,
  Mail,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import { Progress } from "@/components/ui/progress";

interface EnrollmentManagerProps {
  programId: string;
  programTitle: string;
  totalCourses: number;
}

export default function EnrollmentManager({
  programId,
  programTitle,
  totalCourses,
}: EnrollmentManagerProps) {
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [enrollDialogOpen, setEnrollDialogOpen] = React.useState(false);
  const [selectedStudent, setSelectedStudent] = React.useState<string>("");
  const [page, setPage] = React.useState(1);
  const limit = 20;

  const { data: enrollmentsData, isLoading } = useProgramEnrollments(
    programId,
    {
      status: statusFilter === "all" ? undefined : statusFilter,
      page,
      limit,
    }
  );

  const { students, fetchStudents } = useStudents();

  // Fetch students on mount
  React.useEffect(() => {
    fetchStudents({ page: 1, limit: 100 });
  }, []);

  const { mutate: enrollStudent, isPending: isEnrolling } = useEnrollStudent();
  const { mutate: updateProgress } = useUpdateProgress();

  const enrollments = (enrollmentsData?.data || []) as ProgramEnrollment[];
  const total = enrollmentsData?.total || 0;

  // Filter out already enrolled students
  const availableStudents = students.filter(
    (s: any) => !enrollments.find((e: ProgramEnrollment) => e.student === s._id)
  );

  const filteredEnrollments = React.useMemo(() => {
    if (!search) return enrollments;
    return enrollments.filter((e: ProgramEnrollment) => {
      const student = typeof e.student === "string" ? null : e.student;
      const studentName = `${student?.firstName || ""} ${
        student?.lastName || ""
      }`.toLowerCase();
      const email = (student?.email || "").toLowerCase();
      return (
        studentName.includes(search.toLowerCase()) ||
        email.includes(search.toLowerCase())
      );
    });
  }, [enrollments, search]);

  const handleEnroll = () => {
    if (!selectedStudent) return;
    enrollStudent(
      { programId, studentId: selectedStudent },
      {
        onSuccess: () => {
          setEnrollDialogOpen(false);
          setSelectedStudent("");
        },
      }
    );
  };

  const getProgressPercentage = (enrollment: ProgramEnrollment) => {
    if (totalCourses === 0) return 0;
    return Math.round((enrollment.progress.length / totalCourses) * 100);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; icon: any; label: string }> =
      {
        active: {
          variant: "default",
          icon: Clock,
          label: "Active",
        },
        completed: {
          variant: "success",
          icon: CheckCircle2,
          label: "Completed",
        },
        dropped: {
          variant: "destructive",
          icon: XCircle,
          label: "Dropped",
        },
      };

    const config = variants[status] || variants.active;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant as any} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const stats = React.useMemo(() => {
    return {
      total: enrollments.length,
      active: enrollments.filter(
        (e: ProgramEnrollment) => e.status === "active"
      ).length,
      completed: enrollments.filter(
        (e: ProgramEnrollment) => e.status === "completed"
      ).length,
      dropped: enrollments.filter(
        (e: ProgramEnrollment) => e.status === "dropped"
      ).length,
    };
  }, [enrollments]);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Enrolled</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <Users className="h-8 w-8 text-blue-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active</p>
              <p className="text-2xl font-bold text-blue-600">{stats.active}</p>
            </div>
            <Clock className="h-8 w-8 text-blue-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Completed</p>
              <p className="text-2xl font-bold text-green-600">
                {stats.completed}
              </p>
            </div>
            <CheckCircle2 className="h-8 w-8 text-green-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Dropped</p>
              <p className="text-2xl font-bold text-red-600">{stats.dropped}</p>
            </div>
            <XCircle className="h-8 w-8 text-red-500" />
          </div>
        </Card>
      </div>

      {/* Actions Bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search students..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="dropped">Dropped</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => setEnrollDialogOpen(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Enroll Student
        </Button>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Enrollments Table */}
      {isLoading ? (
        <Card className="p-12 text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="mt-4 text-sm text-muted-foreground">
            Loading enrollments...
          </p>
        </Card>
      ) : filteredEnrollments.length === 0 ? (
        <Card className="p-12 text-center">
          <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Enrollments Yet</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Start by enrolling students to this training program
          </p>
          <Button onClick={() => setEnrollDialogOpen(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Enroll First Student
          </Button>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Enrolled Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Completed Courses</TableHead>
                <TableHead>Certificate</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEnrollments.map((enrollment: any) => {
                const progressPct = getProgressPercentage(enrollment);
                const student = enrollment.student;

                return (
                  <TableRow key={enrollment._id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary">
                          {(student?.firstName?.[0] || "S").toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium">
                            {student?.firstName} {student?.lastName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {student?.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {format(new Date(enrollment.enrolledAt), "MMM dd, yyyy")}
                    </TableCell>
                    <TableCell>{getStatusBadge(enrollment.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 min-w-[120px]">
                        <Progress value={progressPct} className="flex-1" />
                        <span className="text-sm font-medium">
                          {progressPct}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {enrollment.progress.length} / {totalCourses}
                    </TableCell>
                    <TableCell>
                      {enrollment.certificateIssued ? (
                        <Badge
                          variant="default"
                          className="gap-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        >
                          <Award className="h-3 w-3" />
                          Issued
                        </Badge>
                      ) : (
                        <Badge variant="outline">Not Issued</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            View Progress Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Mail className="h-4 w-4 mr-2" />
                            Send Reminder
                          </DropdownMenuItem>
                          {enrollment.status === "completed" &&
                            !enrollment.certificateIssued && (
                              <DropdownMenuItem>
                                <Award className="h-4 w-4 mr-2" />
                                Issue Certificate
                              </DropdownMenuItem>
                            )}
                          {enrollment.status === "active" && (
                            <DropdownMenuItem className="text-destructive">
                              Mark as Dropped
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Pagination */}
      {total > limit && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)}{" "}
            of {total} enrollments
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={page * limit >= total}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Enroll Student Dialog */}
      <Dialog open={enrollDialogOpen} onOpenChange={setEnrollDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enroll Student</DialogTitle>
            <DialogDescription>
              Select a student to enroll in {programTitle}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Select value={selectedStudent} onValueChange={setSelectedStudent}>
              <SelectTrigger>
                <SelectValue placeholder="Select a student..." />
              </SelectTrigger>
              <SelectContent>
                {availableStudents.length === 0 ? (
                  <SelectItem value="_empty" disabled>
                    No available students
                  </SelectItem>
                ) : (
                  availableStudents.map((student: any) => (
                    <SelectItem key={student._id} value={student._id}>
                      {student.firstName} {student.lastName} ({student.email})
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEnrollDialogOpen(false);
                setSelectedStudent("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleEnroll}
              disabled={!selectedStudent || isEnrolling}
            >
              {isEnrolling ? "Enrolling..." : "Enroll Student"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
