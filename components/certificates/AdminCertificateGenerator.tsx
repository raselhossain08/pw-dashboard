"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/context/ToastContext";
import { certificatesService } from "@/services/certificates.service";
import { coursesService } from "@/services/courses.service";
import { usersService } from "@/services/users.service";
import { downloadCertificate } from "@/lib/certificate-generator";
import {
  Award,
  Mail,
  Send,
  Users,
  Clock,
  CheckCircle,
  BookOpen,
  Search,
  UserPlus,
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
import { Checkbox } from "@/components/ui/checkbox";

export default function AdminCertificateGenerator() {
  const queryClient = useQueryClient();
  const { push } = useToast();

  const [generateDialogOpen, setGenerateDialogOpen] = React.useState(false);
  const [bulkDialogOpen, setBulkDialogOpen] = React.useState(false);
  const [selectedUserId, setSelectedUserId] = React.useState<string>("");
  const [selectedCourseId, setSelectedCourseId] = React.useState<string>("");
  const [sendEmail, setSendEmail] = React.useState(true);
  const [studentSearch, setStudentSearch] = React.useState("");
  const [courseSearch, setCourseSearch] = React.useState("");
  const [bulkSelectedUserIds, setBulkSelectedUserIds] = React.useState<
    string[]
  >([]);

  const { data: coursesData, isLoading: coursesLoading, error: coursesError } = useQuery({
    queryKey: ["courses", { page: 1, limit: 100 }],
    queryFn: () => coursesService.getAllCourses({ page: 1, limit: 100 }),
    retry: 2,
  });

  const { data: usersData, isLoading: usersLoading, error: usersError } = useQuery({
    queryKey: ["users", { page: 1, limit: 100 }],
    queryFn: () => usersService.getAllUsers({ page: 1, limit: 100 }),
    retry: 2,
  });

  const courseList: any[] = React.useMemo(() => {
    const raw: any = coursesData as any;
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw?.data)) return raw.data;
    if (Array.isArray(raw?.courses)) return raw.courses;
    return [];
  }, [coursesData]);

  const usersList: any[] = React.useMemo(() => {
    const raw: any = usersData as any;
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw?.data)) return raw.data;
    if (Array.isArray(raw?.users)) return raw.users;
    return [];
  }, [usersData]);

  // Filtered lists based on search
  const filteredUsers = React.useMemo(() => {
    if (!studentSearch) return usersList;
    const searchLower = studentSearch.toLowerCase();
    return usersList.filter(
      (u: any) =>
        `${u.firstName} ${u.lastName}`.toLowerCase().includes(searchLower) ||
        u.email?.toLowerCase().includes(searchLower)
    );
  }, [usersList, studentSearch]);

  const filteredCourses = React.useMemo(() => {
    if (!courseSearch) return courseList;
    const searchLower = courseSearch.toLowerCase();
    return courseList.filter((c: any) =>
      c.title?.toLowerCase().includes(searchLower)
    );
  }, [courseList, courseSearch]);

  const generateMutation = useMutation({
    mutationFn: async () => {
      if (!selectedUserId || !selectedCourseId) {
        throw new Error("Please select both user and course");
      }

      try {

        const certificate = await certificatesService.adminGenerateCertificate(
          selectedUserId,
          selectedCourseId,
          sendEmail
        );

        // Get user details for PDF generation
        const user = usersList.find((u) => u._id === selectedUserId);
        const userName = user
          ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
          : "Student";

        // Generate and download PDF with saved template
        const config = await certificatesService.getCertificateTemplate();
        return certificate;
      } catch (error) {
        console.error("Error in generateMutation:", error);
        throw error;
      }
    },
    onMutate() {
      push({ type: "loading", message: "Generating certificate..." });
    },
    onSuccess() {
      push({
        type: "success",
        message: sendEmail
          ? "Certificate generated and email sent!"
          : "Certificate generated successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["my-certificates"] });
      setGenerateDialogOpen(false);
      setSelectedUserId("");
      setSelectedCourseId("");
      setSendEmail(true);
    },
    onError(err: any) {
      push({
        type: "error",
        message: String(err?.message || "Failed to generate certificate"),
      });
    },
  });

  const sendEmailMutation = useMutation({
    mutationFn: async (certificateId: string) => {
      return certificatesService.adminSendCertificateEmail(certificateId);
    },
    onMutate() {
      push({ type: "loading", message: "Sending email..." });
    },
    onSuccess() {
      push({ type: "success", message: "Certificate email sent!" });
      queryClient.invalidateQueries({ queryKey: ["my-certificates"] });
    },
    onError(err: any) {
      push({
        type: "error",
        message: String(err?.message || "Failed to send email"),
      });
    },
  });

  const bulkGenerateMutation = useMutation({
    mutationFn: async () => {
      if (!selectedCourseId || bulkSelectedUserIds.length === 0) {
        throw new Error("Please select course and at least one student");
      }
      return certificatesService.adminBulkGenerateCertificates(
        selectedCourseId,
        bulkSelectedUserIds,
        sendEmail
      );
    },
    onMutate() {
      push({
        type: "loading",
        message: "Generating certificates in bulk...",
      });
    },
    onSuccess(data) {
      push({
        type: "success",
        message: `Successfully generated ${data.length} certificates!`,
      });
      queryClient.invalidateQueries({ queryKey: ["my-certificates"] });
      setBulkDialogOpen(false);
      setBulkSelectedUserIds([]);
      setSelectedCourseId("");
      setSendEmail(true);
    },
    onError(err: any) {
      push({
        type: "error",
        message: String(err?.message || "Failed to generate certificates"),
      });
    },
  });

  const toggleUserSelection = (userId: string) => {
    setBulkSelectedUserIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const selectAllUsers = () => {
    if (bulkSelectedUserIds.length === usersList.length) {
      setBulkSelectedUserIds([]);
    } else {
      setBulkSelectedUserIds(usersList.map((u) => u._id));
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary/80 rounded-lg sm:rounded-xl p-4 sm:p-6 lg:p-8 text-white shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1 sm:mb-2 flex items-center gap-2 sm:gap-3">
              <Award className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 flex-shrink-0" />
              <span>Admin Certificate Generator</span>
            </h2>
            <p className="text-primary-foreground/90 text-sm sm:text-base lg:text-lg">
              Generate and send certificates to students via email
            </p>
          </div>
          <Button
            onClick={() => setGenerateDialogOpen(true)}
            className="bg-white text-primary hover:bg-white/90 font-semibold shadow-md w-full sm:w-auto"
            size="lg"
          >
            <UserPlus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            <span className="text-sm sm:text-base">Single Student</span>
          </Button>
          <Button
            onClick={() => setBulkDialogOpen(true)}
            variant="outline"
            className="bg-white/10 text-white border-white/30 hover:bg-white/20 font-semibold w-full sm:w-auto"
            size="lg"
          >
            <Users className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            <span className="text-sm sm:text-base">Bulk Generate</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-card rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-gray-600 text-xs sm:text-sm font-medium">
                Active Courses
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-secondary mt-1 sm:mt-2">
                {coursesLoading ? "..." : courseList.length}
              </p>
              <p className="text-gray-500 text-xs sm:text-sm mt-1">
                Available for certificates
              </p>
              {coursesError && (
                <p className="text-red-500 text-xs mt-1">Failed to load</p>
              )}
            </div>
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <BookOpen className="text-blue-600 w-5 h-5 sm:w-7 sm:h-7" />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-gray-600 text-xs sm:text-sm font-medium">Total Users</p>
              <p className="text-2xl sm:text-3xl font-bold text-secondary mt-1 sm:mt-2">
                {usersLoading ? "..." : usersList.length}
              </p>
              <p className="text-gray-500 text-xs sm:text-sm mt-1">Registered users</p>
              {usersError && (
                <p className="text-red-500 text-xs mt-1">Failed to load</p>
              )}
            </div>
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Users className="text-purple-600 w-5 h-5 sm:w-7 sm:h-7" />
            </div>
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-primary/5 border border-primary/20 rounded-lg sm:rounded-xl p-4 sm:p-5 lg:p-6">
        <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
            <CheckCircle className="text-white w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-base sm:text-lg font-semibold text-secondary mb-2 sm:mb-3">
              How It Works
            </h3>
            <ul className="space-y-2 sm:space-y-2.5 text-xs sm:text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold text-sm sm:text-base flex-shrink-0">
                  1.
                </span>
                <span>Select a student from the user list</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold text-sm sm:text-base flex-shrink-0">
                  2.
                </span>
                <span>Choose the course they completed</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold text-sm sm:text-base flex-shrink-0">
                  3.
                </span>
                <span>
                  Optionally enable email delivery to send the certificate
                  directly to the student
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold text-sm sm:text-base flex-shrink-0">
                  4.
                </span>
                <span>
                  The certificate will be generated with a unique ID and
                  verification URL
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Generate Certificate Dialog */}
      <Dialog open={generateDialogOpen} onOpenChange={setGenerateDialogOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl lg:text-2xl">
              <Award className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              Generate Certificate
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Generate a certificate for a student and optionally send it via
              email
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 sm:space-y-6 py-2 sm:py-4">
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-medium text-secondary flex items-center gap-2">
                <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Select Student
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger className="w-full text-xs sm:text-sm">
                  <SelectValue placeholder="Choose a student..." />
                </SelectTrigger>
                <SelectContent>
                  {filteredUsers.length === 0 ? (
                    <div className="p-4 text-center text-xs sm:text-sm text-muted-foreground">
                      No students found
                    </div>
                  ) : (
                    filteredUsers.map((user: any) => (
                      <SelectItem
                        key={user._id}
                        value={user._id}
                        className="text-xs sm:text-sm"
                      >
                        <span className="truncate block max-w-[250px] sm:max-w-full">
                          {user.firstName} {user.lastName} ({user.email})
                        </span>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-medium text-secondary flex items-center gap-2">
                <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Select Course
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={courseSearch}
                  onChange={(e) => setCourseSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <Select
                value={selectedCourseId}
                onValueChange={setSelectedCourseId}
              >
                <SelectTrigger className="w-full text-xs sm:text-sm">
                  <SelectValue placeholder="Choose a course..." />
                </SelectTrigger>
                <SelectContent>
                  {filteredCourses.length === 0 ? (
                    <div className="p-4 text-center text-xs sm:text-sm text-muted-foreground">
                      No courses found
                    </div>
                  ) : (
                    filteredCourses.map((course: any) => (
                      <SelectItem
                        key={course._id}
                        value={course._id}
                        className="text-xs sm:text-sm"
                      >
                        <span className="truncate block max-w-[250px] sm:max-w-full">
                          {course.title}
                        </span>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-start sm:items-center space-x-2 sm:space-x-3 p-3 sm:p-4 bg-primary/5 rounded-lg border border-primary/20">
              <Checkbox
                id="send-email"
                checked={sendEmail}
                onCheckedChange={(checked) => setSendEmail(checked as boolean)}
                className="mt-0.5 sm:mt-0"
              />
              <label
                htmlFor="send-email"
                className="text-xs sm:text-sm font-medium text-secondary cursor-pointer flex items-center gap-1.5 sm:gap-2 flex-1"
              >
                <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary shrink-0" />
                <span>Send certificate via email to student</span>
              </label>
            </div>

            {sendEmail && (
              <div className="bg-accent/10 border border-accent/20 rounded-lg p-3 sm:p-4">
                <p className="text-xs sm:text-sm text-accent-foreground/90 flex items-start gap-2">
                  <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4 mt-0.5 shrink-0 text-accent" />
                  <span>
                    The student will receive a professionally formatted email
                    with their certificate link, certificate ID, and
                    verification details.
                  </span>
                </p>
              </div>
            )}
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setGenerateDialogOpen(false)}
              className="w-full sm:w-auto text-xs sm:text-sm"
            >
              Cancel
            </Button>
            <Button
              onClick={() => generateMutation.mutate()}
              disabled={
                !selectedUserId ||
                !selectedCourseId ||
                generateMutation.isPending
              }
              className="bg-primary hover:bg-primary/90 text-white w-full sm:w-auto text-xs sm:text-sm"
            >
              {generateMutation.isPending ? (
                <>
                  <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2" />
                  Generate Certificate
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Generate Dialog */}
      <Dialog open={bulkDialogOpen} onOpenChange={setBulkDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Bulk Generate Certificates</DialogTitle>
            <DialogDescription>
              Select multiple students and generate certificates for a course
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Course Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-secondary">
                Select Course
              </label>
              <Select
                value={selectedCourseId}
                onValueChange={setSelectedCourseId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a course..." />
                </SelectTrigger>
                <SelectContent>
                  {courseList.map((course: any) => (
                    <SelectItem key={course._id} value={course._id}>
                      {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Student Selection */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-secondary">
                  Select Students ({bulkSelectedUserIds.length} selected)
                </label>
                <Button variant="outline" size="sm" onClick={selectAllUsers}>
                  {bulkSelectedUserIds.length === usersList.length
                    ? "Deselect All"
                    : "Select All"}
                </Button>
              </div>

              <div className="border rounded-lg max-h-60 overflow-y-auto">
                {usersList.map((user: any) => (
                  <div
                    key={user._id}
                    className="flex items-center gap-3 p-3 hover:bg-gray-50 border-b last:border-b-0"
                  >
                    <Checkbox
                      checked={bulkSelectedUserIds.includes(user._id)}
                      onCheckedChange={() => toggleUserSelection(user._id)}
                    />
                    <div className="flex-1">
                      <p className="font-medium text-sm">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs text-gray-600">{user.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Email Option */}
            <div className="flex items-center space-x-3 p-4 bg-primary/5 rounded-lg border border-primary/20">
              <Checkbox
                id="bulk-send-email"
                checked={sendEmail}
                onCheckedChange={(checked) => setSendEmail(checked as boolean)}
              />
              <div className="flex-1">
                <label
                  htmlFor="bulk-send-email"
                  className="text-sm font-medium text-secondary cursor-pointer"
                >
                  Send Email to Selected Students
                </label>
                <p className="text-xs text-muted-foreground">
                  Automatically email certificates to all selected students
                </p>
              </div>
              <Mail className="w-5 h-5 text-primary" />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setBulkDialogOpen(false)}
              disabled={bulkGenerateMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={() => bulkGenerateMutation.mutate()}
              disabled={
                bulkGenerateMutation.isPending ||
                !selectedCourseId ||
                bulkSelectedUserIds.length === 0
              }
            >
              {bulkGenerateMutation.isPending ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Generate {bulkSelectedUserIds.length} Certificate
                  {bulkSelectedUserIds.length !== 1 ? "s" : ""}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
