"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/context/ToastContext";
import { useAuth } from "@/context/AuthContext";
import { certificatesService } from "@/services/certificates.service";
import { coursesService } from "@/services/courses.service";
import { downloadCertificate } from "@/lib/certificate-generator";
import {
  Award,
  EllipsisVertical,
  Search as SearchIcon,
  Eye,
  Download,
  Share2,
  Mail,
  Ban,
  Bolt,
  SlidersHorizontal,
  Plus,
  Clock,
  CheckCircle,
  BookOpen,
  Copy,
  Link2,
  Undo2,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
//

type CertificateItem = {
  id: string;
  student: string;
  email: string;
  course: string;
  courseDetail?: string;
  certificateId: string;
  status: "issued" | "pending" | "draft" | "revoked";
  issuedText: string;
  issuedAt?: string; // Raw date for calculations
  avatarUrl: string;
};

export default function Certificates() {
  const queryClient = useQueryClient();
  const { push } = useToast();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin" || user?.role === "super_admin";
  const {
    data: myCerts,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ["my-certificates"],
    queryFn: () => certificatesService.getMyCertificates(),
  });
  const { 
    data: coursesData, 
    isLoading: coursesLoading,
    error: coursesError 
  } = useQuery({
    queryKey: ["courses", { page: 1, limit: 100 }],
    queryFn: () => coursesService.getAllCourses({ page: 1, limit: 100 }),
    retry: 2,
  });
  
  const courseList: any[] = React.useMemo(() => {
    const raw: any = coursesData as any;
    
    console.log("Certificates - Raw courses data:", raw);
    
    // Backend returns: { success: true, data: { courses: [...], total, page, totalPages } }
    if (raw?.data?.courses && Array.isArray(raw.data.courses)) {
      console.log("Found courses in raw.data.courses:", raw.data.courses.length);
      return raw.data.courses;
    }
    
    // Fallback checks for other possible structures
    if (Array.isArray(raw?.courses)) {
      console.log("Found courses in raw.courses:", raw.courses.length);
      return raw.courses;
    }
    if (Array.isArray(raw?.data)) {
      console.log("Found courses in raw.data:", raw.data.length);
      return raw.data;
    }
    if (Array.isArray(raw)) {
      console.log("Found courses in raw:", raw.length);
      return raw;
    }
    
    console.log("No courses found, returning empty array");
    return [];
  }, [coursesData]);
  const [selectedCourseId, setSelectedCourseId] = React.useState<string>("");
  const generateMutation = useMutation({
    mutationFn: async () => {
      if (!selectedCourseId) throw new Error("Select a course to generate");
      return certificatesService.generateCertificate(selectedCourseId);
    },
    onMutate() {
      push({ type: "loading", message: "Generating certificate..." });
    },
    onSuccess() {
      push({ type: "success", message: "Certificate generated" });
      queryClient.invalidateQueries({ queryKey: ["my-certificates"] });
    },
    onError(err: any) {
      push({
        type: "error",
        message: String(err?.message || "Failed to generate"),
      });
    },
  });
  const [search, setSearch] = React.useState("");
  const [courseFilter, setCourseFilter] = React.useState("All Courses");
  const [statusFilter, setStatusFilter] = React.useState("All Status");
  const [templateFilter, setTemplateFilter] = React.useState("All Templates");
  const [previewOpen, setPreviewOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<CertificateItem | null>(null);
  const [shareDialogOpen, setShareDialogOpen] = React.useState(false);
  const [revokeDialogOpen, setRevokeDialogOpen] = React.useState(false);
  const [revocationReason, setRevocationReason] = React.useState("");

  // Resend email mutation
  const resendEmailMutation = useMutation({
    mutationFn: (certificateId: string) =>
      certificatesService.resendCertificateEmail(certificateId),
    onMutate() {
      push({ type: "loading", message: "Sending email..." });
    },
    onSuccess() {
      push({ type: "success", message: "Certificate email sent!" });
    },
    onError(err: any) {
      push({
        type: "error",
        message: String(err?.message || "Failed to send email"),
      });
    },
  });

  // Revoke certificate mutation (admin only)
  const revokeMutation = useMutation({
    mutationFn: ({
      certificateId,
      reason,
    }: {
      certificateId: string;
      reason?: string;
    }) => certificatesService.revokeCertificate(certificateId, reason),
    onMutate() {
      push({ type: "loading", message: "Revoking certificate..." });
    },
    onSuccess() {
      push({ type: "success", message: "Certificate revoked successfully!" });
      queryClient.invalidateQueries({ queryKey: ["my-certificates"] });
    },
    onError(err: any) {
      push({
        type: "error",
        message: String(err?.message || "Failed to revoke certificate"),
      });
    },
  });

  // Restore certificate mutation (admin only)
  const restoreMutation = useMutation({
    mutationFn: (certificateId: string) =>
      certificatesService.restoreCertificate(certificateId),
    onMutate() {
      push({ type: "loading", message: "Restoring certificate..." });
    },
    onSuccess() {
      push({ type: "success", message: "Certificate restored successfully!" });
      queryClient.invalidateQueries({ queryKey: ["my-certificates"] });
    },
    onError(err: any) {
      push({
        type: "error",
        message: String(err?.message || "Failed to restore certificate"),
      });
    },
  });

  // Share certificate
  const handleShareCertificate = (cert: CertificateItem) => {
    setSelected(cert);
    setShareDialogOpen(true);
  };

  const copyVerificationLink = (cert: CertificateItem) => {
    const verifyUrl = `${window.location.origin}/verify/${cert.certificateId}`;
    navigator.clipboard.writeText(verifyUrl).then(() =>
      push({
        type: "success",
        message: "Verification link copied!",
      })
    );
  };

  const shareToSocial = (platform: string, cert: CertificateItem) => {
    const verifyUrl = `${window.location.origin}/verify/${cert.certificateId}`;
    const text = `I've earned a certificate for ${cert.course}!`;

    let url = "";
    switch (platform) {
      case "linkedin":
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
          verifyUrl
        )}`;
        break;
      case "twitter":
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
          text
        )}&url=${encodeURIComponent(verifyUrl)}`;
        break;
      case "facebook":
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
          verifyUrl
        )}`;
        break;
    }

    if (url) {
      window.open(url, "_blank", "width=600,height=400");
    }
  };

  const downloadPDFCertificate = async (cert: CertificateItem) => {
    await handleDownloadCertificate(cert);
  };

  // Download certificate handler
  const handleDownloadCertificate = async (cert: CertificateItem) => {
    try {
      push({ type: "loading", message: "Generating PDF..." });
      const config = await certificatesService.getCertificateTemplate();
      await downloadCertificate({
        studentName: cert.student,
        certificateId: cert.certificateId,
        courseName: cert.course,
        config: config as any,
      });
      push({ type: "success", message: "Certificate downloaded!" });
    } catch (error) {
      console.error("Failed to download certificate:", error);
      push({ type: "error", message: "Failed to download certificate" });
    }
  };

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const isCmdK = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k";
      if (isCmdK) {
        const el = document.getElementById(
          "certificate-search"
        ) as HTMLInputElement | null;
        el?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const items: CertificateItem[] = React.useMemo(() => {
    const raw: any = myCerts as any;
    const list: any[] = Array.isArray(raw)
      ? raw
      : Array.isArray(raw?.data)
      ? raw.data
      : Array.isArray(raw?.certificates)
      ? raw.certificates
      : [];

    return list.map((c: any) => {
      const studentName =
        typeof c.student === "object" && c.student
          ? `${c.student.firstName || ""} ${c.student.lastName || ""}`.trim()
          : String(c.student || "");
      const courseTitle =
        typeof c.course === "object" && c.course
          ? c.course.title || ""
          : String(c.course || "");

      // Determine status based on backend flags
      let status: "issued" | "pending" | "draft" | "revoked" = "issued";
      if (c.isRevoked) {
        status = "revoked";
      }

      // Get the raw date from backend - try multiple sources
      let rawIssuedAt = c.issuedAt || c.createdAt || c.updatedAt;

      // Handle case where date might be an object instead of string
      if (rawIssuedAt && typeof rawIssuedAt === "object") {
        // If it's a Date object, convert to ISO string
        if (rawIssuedAt instanceof Date) {
          rawIssuedAt = rawIssuedAt.toISOString();
        } else if (rawIssuedAt.$date) {
          // MongoDB extended JSON format
          rawIssuedAt = rawIssuedAt.$date;
        } else {
          rawIssuedAt = null;
        }
      }

      // Format issued date
      let issuedText = "Not Available";
      if (rawIssuedAt && typeof rawIssuedAt === "string") {
        try {
          const date = new Date(rawIssuedAt);
          if (!isNaN(date.getTime()) && date.getTime() > 0) {
            issuedText = date.toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            });
          }
        } catch (error) {
          console.error("Error parsing certificate date:", error);
        }
      }

      return {
        id: c._id,
        student: studentName || "Student",
        email: (c.student?.email as string) || "",
        course: courseTitle || "Course",
        courseDetail: "",
        certificateId: c.certificateId,
        status,
        issuedText,
        issuedAt:
          rawIssuedAt && rawIssuedAt !== "Invalid Date"
            ? rawIssuedAt
            : undefined, // Keep raw date for calculations
        avatarUrl: "",
      } as CertificateItem;
    });
  }, [myCerts]);

  const filtered = items.filter((it) => {
    const matchesSearch =
      search === "" ||
      it.student.toLowerCase().includes(search.toLowerCase()) ||
      it.course.toLowerCase().includes(search.toLowerCase());
    const matchesCourse =
      courseFilter === "All Courses" || it.course === courseFilter;
    const matchesStatus =
      statusFilter === "All Status" || it.status === statusFilter.toLowerCase();
    return matchesSearch && matchesCourse && matchesStatus;
  });

  return (
    <main className="w-full">
      <div className="mb-4 sm:mb-6 md:mb-8">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-secondary mb-1 sm:mb-2">
          Certificates
        </h2>
        <p className="text-xs sm:text-sm md:text-base text-gray-600">
          Manage certificate templates, issuance, and recent activity
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-4 sm:mb-6 md:mb-8">
        <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Issued</p>
              <p className="text-2xl font-bold text-secondary mt-1">
                {items.length}
              </p>
              <p className="text-gray-500 text-sm mt-1">Certificates earned</p>
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Award className="text-primary w-6 h-6" />
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">
                Active Courses
              </p>
              <p className="text-2xl font-bold text-secondary mt-1">
                {coursesLoading ? "..." : courseList.length}
              </p>
              <p className="text-gray-500 text-sm mt-1">
                {coursesLoading 
                  ? "Loading..." 
                  : coursesError 
                  ? "Failed to load" 
                  : "Available courses"}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <BookOpen className="text-blue-600 w-6 h-6" />
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">This Month</p>
              <p className="text-2xl font-bold text-secondary mt-1">
                {
                  items.filter((it) => {
                    if (!it.issuedAt) return false;
                    const issueDate = new Date(it.issuedAt);
                    if (isNaN(issueDate.getTime())) return false;
                    const now = new Date();
                    return (
                      issueDate.getMonth() === now.getMonth() &&
                      issueDate.getFullYear() === now.getFullYear()
                    );
                  }).length
                }
              </p>
              <p className="text-gray-500 text-sm mt-1">Issued this month</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="text-green-600 w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl p-3 sm:p-4 shadow-sm border border-gray-100 mb-4 sm:mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
          <div className="flex flex-wrap gap-2">
            <Select value={courseFilter} onValueChange={setCourseFilter}>
              <SelectTrigger className="bg-gray-50 border border-gray-200 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm w-full sm:w-40">
                <SelectValue placeholder="All Courses" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                <SelectItem value="All Courses">All Courses ({courseList.length})</SelectItem>
                {courseList.map((c: any) => (
                  <SelectItem key={c._id} value={c.title} className="cursor-pointer">
                    {c.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="bg-gray-50 border border-gray-200 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm w-full sm:w-40">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Status">All Status</SelectItem>
                <SelectItem value="Issued">Issued</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Draft">Draft</SelectItem>
                <SelectItem value="Revoked">Revoked</SelectItem>
              </SelectContent>
            </Select>
            <Select value={templateFilter} onValueChange={setTemplateFilter}>
              <SelectTrigger className="bg-gray-50 border border-gray-200 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm w-full sm:w-44">
                <SelectValue placeholder="All Templates" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Templates">All Templates</SelectItem>
                <SelectItem value="Classic Gold">Classic Gold</SelectItem>
                <SelectItem value="Modern Blue">Modern Blue</SelectItem>
                <SelectItem value="Minimal">Minimal</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="relative w-full md:w-80">
            <input
              id="certificate-search"
              type="text"
              placeholder="Search certificates... (Cmd+K)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <SearchIcon className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
        </div>
      </div>

      {/* Certificates Table */}
      <div className="bg-card rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-8 sm:p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-4 border-primary border-t-transparent"></div>
            <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-gray-600">
              Loading certificates...
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 sm:p-12 text-center">
            <Award className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
            <p className="text-sm sm:text-base text-gray-600 font-medium">
              No certificates found
            </p>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              {search
                ? "Try adjusting your search"
                : "Start earning certificates by completing courses"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px] sm:w-[50px]"></TableHead>
                  <TableHead className="text-xs sm:text-sm">Student</TableHead>
                  <TableHead className="text-xs sm:text-sm">Course</TableHead>
                  <TableHead className="text-xs sm:text-sm hidden sm:table-cell">
                    Certificate ID
                  </TableHead>
                  <TableHead className="text-xs sm:text-sm">Status</TableHead>
                  <TableHead className="text-xs sm:text-sm hidden md:table-cell">
                    Issued Date
                  </TableHead>
                  <TableHead className="text-right text-xs sm:text-sm">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((it) => (
                  <TableRow key={it.id} className="group hover:bg-gray-50">
                    <TableCell>
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Award className="text-purple-600 w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-xs sm:text-sm text-secondary truncate max-w-[120px] sm:max-w-none">
                          {it.student}
                        </p>
                        <p className="text-xs text-gray-500 truncate max-w-[120px] sm:max-w-none">
                          {it.email}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium text-xs sm:text-sm truncate max-w-[150px] sm:max-w-none">
                        {it.course}
                      </p>
                      {it.courseDetail && (
                        <p className="text-xs text-gray-500 truncate max-w-[150px] sm:max-w-none">
                          {it.courseDetail}
                        </p>
                      )}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <code className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-gray-100 rounded text-xs font-mono break-all">
                        {it.certificateId}
                      </code>
                    </TableCell>
                    <TableCell>
                      {it.status === "revoked" ? (
                        <Badge variant="destructive" className="gap-1 text-xs">
                          <Ban className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                          <span className="hidden xs:inline">Revoked</span>
                          <span className="xs:hidden">Rev</span>
                        </Badge>
                      ) : (
                        <Badge
                          variant="default"
                          className="gap-1 bg-green-600 text-xs"
                        >
                          <CheckCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                          <span className="hidden xs:inline">Issued</span>
                          <span className="xs:hidden">Iss</span>
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-600">
                        <Clock className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                        <span>{it.issuedText}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1 sm:gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelected(it);
                            setPreviewOpen(true);
                          }}
                          className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity h-7 w-7 sm:h-8 sm:w-8 p-0"
                          type="button"
                        >
                          <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownloadCertificate(it)}
                          className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity h-7 w-7 sm:h-8 sm:w-8 p-0"
                          type="button"
                        >
                          <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                              type="button"
                            >
                              <EllipsisVertical className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-52">
                            <DropdownMenuItem
                              onClick={() => {
                                setSelected(it);
                                setPreviewOpen(true);
                              }}
                            >
                              <Eye className="w-4 h-4 mr-2" /> View Certificate
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDownloadCertificate(it)}
                            >
                              <Download className="w-4 h-4 mr-2" /> Download PDF
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleShareCertificate(it)}
                            >
                              <Share2 className="w-4 h-4 mr-2" /> Share
                              Certificate
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => copyVerificationLink(it)}
                            >
                              <Link2 className="w-4 h-4 mr-2" /> Copy Verify
                              Link
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                if (it.certificateId) {
                                  resendEmailMutation.mutate(it.certificateId);
                                }
                              }}
                            >
                              <Mail className="w-4 h-4 mr-2" /> Resend Email
                            </DropdownMenuItem>

                            {/* Admin Only Actions */}
                            {isAdmin && (
                              <>
                                <DropdownMenuSeparator />
                                {it.status === "revoked" ? (
                                  <DropdownMenuItem
                                    className="text-green-600"
                                    onClick={() => {
                                      const rawCert = (myCerts as any)?.find?.(
                                        (c: any) => c._id === it.id
                                      );
                                      if (rawCert?._id) {
                                        restoreMutation.mutate(rawCert._id);
                                      }
                                    }}
                                  >
                                    <Undo2 className="w-4 h-4 mr-2" /> Restore
                                    Certificate
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem
                                    className="text-red-600"
                                    onClick={() => {
                                      setSelected(it);
                                      setRevokeDialogOpen(true);
                                      setRevocationReason("");
                                    }}
                                  >
                                    <Ban className="w-4 h-4 mr-2" /> Revoke
                                    Certificate
                                  </DropdownMenuItem>
                                )}
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <div className="bg-card rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8 mt-8">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-secondary">
            Certificate Activity
          </h3>
          <p className="text-gray-600 text-sm">
            Recent certificate issuances and updates
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Course
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Certificate ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Issued
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
              {items.map((it) => (
                <tr
                  key={`row-${it.id}`}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                        {it.student.charAt(0).toUpperCase()}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {it.student}
                        </div>
                        <div className="text-sm text-gray-500">{it.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{it.course}</div>
                    <div className="text-sm text-gray-500">
                      {it.courseDetail}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                    {it.certificateId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {it.issuedText}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {it.status === "issued" && (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Issued
                      </span>
                    )}
                    {it.status === "pending" && (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        Pending
                      </span>
                    )}
                    {it.status === "draft" && (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                        Draft
                      </span>
                    )}
                    {it.status === "revoked" && (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                        Revoked
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      className="text-primary hover:text-primary/80 mr-3"
                      onClick={() => {
                        setSelected(it);
                        setPreviewOpen(true);
                      }}
                    >
                      View
                    </button>
                    <button
                      className="text-gray-600 hover:text-primary"
                      onClick={() => handleDownloadCertificate(it)}
                    >
                      Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button className="text-primary hover:text-primary/80 text-sm font-medium flex items-center">
            <Award className="w-4 h-4 mr-2" /> View All Certificates
          </button>
        </div>
      </div>

      {/* Quick Actions Section */}
      <div className="bg-card rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-sm border border-border">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-secondary">
              Quick Actions
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Manage certificate templates and generate new ones
            </p>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-lg flex items-center justify-center">
            <Bolt className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {/* Bulk Issue - Only for admins */}
          {isAdmin && (
            <Button
              variant="outline"
              className="group flex items-center gap-3 p-3 sm:p-4 bg-accent/5 hover:bg-accent/10 rounded-lg transition-all duration-200 border border-accent/10 hover:border-accent/30 hover:shadow-md h-auto justify-start"
              onClick={() => {
                // Navigate to admin tab or show bulk generation dialog
                push({ 
                  type: "info", 
                  message: "Please use the Admin Generator tab for bulk certificate generation" 
                });
              }}
              type="button"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-accent rounded-lg flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <Bolt className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="text-left flex-1 min-w-0">
                <p className="font-semibold text-secondary text-sm sm:text-base truncate">
                  Bulk Issue
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Multiple certificates
                </p>
              </div>
            </Button>
          )}

          {/* Generate Certificate */}
          <div className="flex flex-col gap-3 p-3 sm:p-4 bg-chart-2/5 rounded-lg border border-chart-2/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-chart-2 rounded-lg flex items-center justify-center shrink-0">
                <Download className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="text-left flex-1 min-w-0">
                <p className="font-semibold text-secondary text-sm sm:text-base truncate">
                  Generate Certificate
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  For completed course
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <Select
                value={selectedCourseId}
                onValueChange={(value) => {
                  console.log("Quick Action - Course selected:", value);
                  setSelectedCourseId(value);
                }}
                disabled={coursesLoading || courseList.length === 0}
              >
                <SelectTrigger className="bg-card border-border text-xs sm:text-sm flex-1">
                  <SelectValue 
                    placeholder={
                      coursesLoading 
                        ? "Loading courses..." 
                        : courseList.length === 0 
                        ? "No courses available" 
                        : `Select course (${courseList.length} available)`
                    } 
                  />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {coursesLoading ? (
                    <div className="p-4 text-center text-xs sm:text-sm text-muted-foreground">
                      Loading courses...
                    </div>
                  ) : courseList.length === 0 ? (
                    <div className="p-4 text-center text-xs sm:text-sm text-muted-foreground">
                      No courses available
                    </div>
                  ) : (
                    courseList.map((c: any) => (
                      <SelectItem
                        key={c._id}
                        value={c._id}
                        className="text-xs sm:text-sm cursor-pointer"
                      >
                        <span className="truncate block max-w-[200px] sm:max-w-full">
                          {c.title}
                        </span>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <Button
                onClick={() => generateMutation.mutate()}
                disabled={generateMutation.isPending || !selectedCourseId || courseList.length === 0}
                className="bg-chart-2 hover:bg-chart-2/90 text-white text-xs sm:text-sm w-full sm:w-auto"
                size="sm"
                type="button"
              >
                {generateMutation.isPending ? (
                  <>
                    <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin mr-1.5" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5" />
                    <span>Generate</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Certificate Preview</DialogTitle>
            <DialogDescription>
              Preview certificate design and details
            </DialogDescription>
          </DialogHeader>
          <div className="certificate-template rounded-2xl p-8 border-8 border-yellow-400 bg-gradient-to-br from-indigo-50 to-purple-50">
            <div className="text-center">
              <div className="mb-6">
                <p className="text-2xl font-bold text-gray-800">
                  CERTIFICATE OF COMPLETION
                </p>
                <p className="text-gray-600">This certifies that</p>
              </div>
              <div className="my-6">
                <p className="text-4xl font-bold text-primary">
                  {selected?.student}
                </p>
                <p className="text-lg text-gray-600">
                  has successfully completed
                </p>
              </div>
              <div className="my-6">
                <p className="text-2xl font-semibold text-gray-800">
                  {selected?.course} {selected?.courseDetail}
                </p>
                <p className="text-gray-600">
                  with distinction and outstanding performance
                </p>
              </div>
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                <div>
                  <p className="text-sm text-gray-600">Certificate ID</p>
                  <p className="font-mono text-gray-900">
                    {selected?.certificateId}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Issued</p>
                  <p className="text-gray-900">{selected?.issuedText}</p>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Share Certificate</DialogTitle>
            <DialogDescription>
              Share your certificate with others
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Verification Link
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={
                    selected
                      ? `${window.location.origin}/verify/${selected.certificateId}`
                      : ""
                  }
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => selected && copyVerificationLink(selected)}
                  type="button"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Share on Social Media
              </label>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() =>
                    selected && shareToSocial("linkedin", selected)
                  }
                  type="button"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                  <span className="ml-2">LinkedIn</span>
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => selected && shareToSocial("twitter", selected)}
                  type="button"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                  </svg>
                  <span className="ml-2">Twitter</span>
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() =>
                    selected && shareToSocial("facebook", selected)
                  }
                  type="button"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  <span className="ml-2">Facebook</span>
                </Button>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                className="flex-1"
                onClick={() => selected && downloadPDFCertificate(selected)}
                type="button"
              >
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  if (selected?.certificateId) {
                    resendEmailMutation.mutate(selected.certificateId);
                  }
                }}
                type="button"
              >
                <Mail className="w-4 h-4 mr-2" />
                Email
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Revoke Certificate Dialog */}
      <Dialog open={revokeDialogOpen} onOpenChange={setRevokeDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Revoke Certificate
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to revoke this certificate? This action will
              mark the certificate as invalid.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selected && (
              <div className="bg-gray-50 p-3 rounded-lg text-sm">
                <p>
                  <strong>Student:</strong> {selected.student}
                </p>
                <p>
                  <strong>Course:</strong> {selected.course}
                </p>
                <p>
                  <strong>Certificate ID:</strong> {selected.certificateId}
                </p>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Reason for Revocation (Optional)
              </label>
              <Textarea
                placeholder="Enter reason for revoking this certificate..."
                value={revocationReason}
                onChange={(e) => setRevocationReason(e.target.value)}
                rows={3}
                className="w-full"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setRevokeDialogOpen(false)}
              type="button"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                const rawCert = (myCerts as any)?.find?.(
                  (c: any) => c._id === selected?.id
                );
                if (rawCert?._id) {
                  revokeMutation.mutate({
                    certificateId: rawCert._id,
                    reason: revocationReason || undefined,
                  });
                  setRevokeDialogOpen(false);
                }
              }}
              type="button"
            >
              <Ban className="w-4 h-4 mr-2" />
              Revoke Certificate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
