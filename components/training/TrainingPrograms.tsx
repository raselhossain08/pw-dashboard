"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/context/ToastContext";
import {
  trainingService,
  type TrainingProgram,
  type CreateTrainingProgramDto,
} from "@/services/training.service";
import { liveSessionsService } from "@/services/live-sessions.service";
import {
  Plane,
  Users,
  Clock,
  Award,
  Plus,
  Search,
  Eye,
  Edit3,
  Trash2,
  BookOpen,
  Target,
  TrendingUp,
  Calendar,
  DollarSign,
  GraduationCap,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { format } from "date-fns";

interface ProgramItem {
  id: string;
  title: string;
  type: "theoretical" | "practical" | "simulator" | "combined";
  level: "beginner" | "intermediate" | "advanced" | "expert";
  description: string;
  price: number;
  duration?: number;
  students?: number;
  rating?: number;
  instructor?: string;
  status?: string;
  thumbnail?: string;
  certificateAvailable?: boolean;
}

export default function TrainingProgramsNew() {
  const { push } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState("all");
  const [levelFilter, setLevelFilter] = React.useState("all");
  const [sortBy, setSortBy] = React.useState("title");
  const [previewProgram, setPreviewProgram] =
    React.useState<ProgramItem | null>(null);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [formData, setFormData] = React.useState<CreateTrainingProgramDto>({
    title: "",
    description: "",
    excerpt: "",
    type: "theoretical",
    level: "beginner",
    price: 0,
    durationHours: 0,
    maxStudents: 20,
    isPublished: true,
    certificateAvailable: true,
  });

  // Fetch training programs
  const { data, isLoading, error } = useQuery({
    queryKey: ["training-programs"],
    queryFn: () => trainingService.getAllPrograms({ limit: 100 }),
    staleTime: 30000,
  });

  // Fetch upcoming sessions for stats
  const { data: sessionsData } = useQuery({
    queryKey: ["training-upcoming-sessions"],
    queryFn: async () => {
      try {
        const res = await liveSessionsService.getAll({
          upcoming: true,
          limit: 50,
        });
        return res;
      } catch {
        return { sessions: [], total: 0 };
      }
    },
    staleTime: 60000,
  });

  const programs: ProgramItem[] = React.useMemo(() => {
    const programData = ((data as any)?.courses || []) as TrainingProgram[];
    return programData.map((p) => {
      const instructorName =
        typeof p.instructor === "object" && p.instructor
          ? `${p.instructor.firstName || ""} ${
              p.instructor.lastName || ""
            }`.trim()
          : undefined;

      return {
        id: p._id,
        title: p.title,
        type: p.type || "theoretical",
        level: p.level,
        description: p.excerpt || p.description,
        price: p.price,
        duration: p.durationHours || p.duration,
        students: p.enrollmentCount || p.studentCount,
        rating: p.rating,
        instructor: instructorName,
        status: p.status || (p.isPublished ? "published" : "draft"),
        thumbnail: p.thumbnail,
        certificateAvailable: p.certificateAvailable,
      };
    });
  }, [data]);

  const filtered = React.useMemo(() => {
    return programs
      .filter((p) => {
        if (search) {
          const searchLower = search.toLowerCase();
          return (
            p.title.toLowerCase().includes(searchLower) ||
            p.description.toLowerCase().includes(searchLower)
          );
        }
        return true;
      })
      .filter((p) => {
        if (typeFilter === "all") return true;
        return p.type === typeFilter;
      })
      .filter((p) => {
        if (levelFilter === "all") return true;
        return p.level === levelFilter;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "title":
            return a.title.localeCompare(b.title);
          case "price":
            return b.price - a.price;
          case "students":
            return (b.students || 0) - (a.students || 0);
          case "rating":
            return (b.rating || 0) - (a.rating || 0);
          default:
            return 0;
        }
      });
  }, [programs, search, typeFilter, levelFilter, sortBy]);

  const stats = React.useMemo(() => {
    const total = programs.length;
    const active = programs.filter((p) => p.status === "published").length;
    const totalStudents = programs.reduce(
      (sum, p) => sum + (p.students || 0),
      0
    );
    const avgRating =
      programs.length > 0
        ? (
            programs.reduce((sum, p) => sum + (p.rating || 0), 0) /
            programs.filter((p) => p.rating).length
          ).toFixed(1)
        : "0.0";
    const upcomingSessions = sessionsData?.total || 0;

    return { total, active, totalStudents, avgRating, upcomingSessions };
  }, [programs, sessionsData]);

  React.useEffect(() => {
    if (error) {
      push({ type: "error", message: "Failed to load training programs" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  const createMutation = useMutation({
    mutationFn: (payload: CreateTrainingProgramDto) =>
      trainingService.createProgram(payload),
    onSuccess: () => {
      push({
        type: "success",
        message: "Training program created successfully",
      });
      setCreateOpen(false);
      setFormData({
        title: "",
        description: "",
        excerpt: "",
        type: "theoretical",
        level: "beginner",
        price: 0,
        durationHours: 0,
        maxStudents: 20,
        isPublished: true,
        certificateAvailable: true,
      });
      queryClient.invalidateQueries({ queryKey: ["training-programs"] });
    },
    onError: () => {
      push({ type: "error", message: "Failed to create training program" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => trainingService.deleteProgram(id),
    onSuccess: () => {
      push({
        type: "success",
        message: "Training program deleted successfully",
      });
      setDeleteId(null);
      queryClient.invalidateQueries({ queryKey: ["training-programs"] });
    },
    onError: () => {
      push({ type: "error", message: "Failed to delete training program" });
    },
  });

  const handleCreateProgram = () => {
    if (!formData.title || !formData.description) {
      push({ type: "error", message: "Please fill in all required fields" });
      return;
    }

    createMutation.mutate(formData);
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "theoretical":
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full bg-primary/10 text-primary">
            <BookOpen className="w-3 h-3" />
            Theoretical
          </span>
        );
      case "practical":
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full bg-green-50 text-green-700">
            <Plane className="w-3 h-3" />
            Practical
          </span>
        );
      case "simulator":
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full bg-purple-50 text-purple-700">
            <Target className="w-3 h-3" />
            Simulator
          </span>
        );
      case "combined":
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full bg-amber-50 text-amber-700">
            <Award className="w-3 h-3" />
            Combined
          </span>
        );
      default:
        return null;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "beginner":
        return "text-green-600";
      case "intermediate":
        return "text-primary";
      case "advanced":
        return "text-purple-600";
      case "expert":
        return "text-red-600";
      default:
        return "text-slate-600";
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
      <div className="p-6 max-w-[1800px] mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-lg">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                    Aviation Training Programs
                  </h1>
                  <p className="text-slate-600 text-sm">
                    Comprehensive flight training courses and certification
                    programs
                  </p>
                </div>
              </div>
            </div>
            <Button
              onClick={() => setCreateOpen(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Program
            </Button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium mb-1">
                  Total Programs
                </p>
                <p className="text-3xl font-bold text-slate-900">
                  {stats.total}
                </p>
                <p className="text-blue-600 text-sm mt-2 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {stats.active} active
                </p>
              </div>
              <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center">
                <BookOpen className="text-primary w-7 h-7" />
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
                <p className="text-green-600 text-sm mt-2 flex items-center">
                  <Users className="w-3 h-3 mr-1" />
                  Enrolled
                </p>
              </div>
              <div className="w-14 h-14 bg-green-50 rounded-xl flex items-center justify-center">
                <Users className="text-green-600 w-7 h-7" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium mb-1">
                  Upcoming Sessions
                </p>
                <p className="text-3xl font-bold text-slate-900">
                  {stats.upcomingSessions}
                </p>
                <p className="text-amber-600 text-sm mt-2 flex items-center">
                  <Calendar className="w-3 h-3 mr-1" />
                  Next 30 days
                </p>
              </div>
              <div className="w-14 h-14 bg-amber-50 rounded-xl flex items-center justify-center">
                <Clock className="text-amber-600 w-7 h-7" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium mb-1">
                  Avg. Rating
                </p>
                <p className="text-3xl font-bold text-slate-900">
                  {stats.avgRating}
                </p>
                <p className="text-purple-600 text-sm mt-2 flex items-center">
                  <Award className="w-3 h-3 mr-1" />
                  Out of 5.0
                </p>
              </div>
              <div className="w-14 h-14 bg-purple-50 rounded-xl flex items-center justify-center">
                <Award className="text-purple-600 w-7 h-7" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium mb-1">
                  Aircraft Types
                </p>
                <p className="text-3xl font-bold text-slate-900">12</p>
                <p className="text-blue-600 text-sm mt-2 flex items-center">
                  <Plane className="w-3 h-3 mr-1" />
                  Available
                </p>
              </div>
              <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center">
                <Plane className="text-primary w-7 h-7" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-wrap gap-3">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="bg-slate-50 border-slate-200 rounded-lg px-4 py-2 text-sm w-40 hover:bg-slate-100 transition-colors">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="theoretical">Theoretical</SelectItem>
                  <SelectItem value="practical">Practical</SelectItem>
                  <SelectItem value="simulator">Simulator</SelectItem>
                  <SelectItem value="combined">Combined</SelectItem>
                </SelectContent>
              </Select>

              <Select value={levelFilter} onValueChange={setLevelFilter}>
                <SelectTrigger className="bg-slate-50 border-slate-200 rounded-lg px-4 py-2 text-sm w-40 hover:bg-slate-100 transition-colors">
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

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="bg-slate-50 border-slate-200 rounded-lg px-4 py-2 text-sm w-44 hover:bg-slate-100 transition-colors">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="title">Title (A-Z)</SelectItem>
                  <SelectItem value="price">Price (High-Low)</SelectItem>
                  <SelectItem value="students">Most Students</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="relative flex-1 lg:flex-initial lg:w-64">
              <input
                type="text"
                placeholder="Search programs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Program Cards */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={`skeleton-${i}`}
                className="h-96 animate-pulse bg-slate-100 rounded-xl border border-slate-200"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-16 shadow-sm border border-slate-200 text-center">
            <div className="w-24 h-24 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <GraduationCap className="text-slate-400 w-12 h-12" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">
              {search || typeFilter !== "all" || levelFilter !== "all"
                ? "No programs found"
                : "No training programs yet"}
            </h3>
            <p className="text-slate-600 mb-8 max-w-md mx-auto">
              {search || typeFilter !== "all" || levelFilter !== "all"
                ? "Try adjusting your filters to find what you're looking for"
                : "Create your first aviation training program to get started"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((program) => (
              <div
                key={program.id}
                className="group bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-xl hover:border-primary/30 transition-all duration-300 hover:-translate-y-1"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      {getTypeBadge(program.type)}
                    </div>
                    <h3 className="font-bold text-slate-900 text-lg leading-tight line-clamp-2">
                      {program.title}
                    </h3>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-slate-400 hover:text-primary hover:bg-primary/10 shrink-0"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-52">
                      <DropdownMenuItem
                        onSelect={() => setPreviewProgram(program)}
                      >
                        <Eye className="w-4 h-4 mr-2 text-primary" />
                        <span>View Details</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onSelect={() =>
                          push({
                            type: "info",
                            message: "Edit functionality coming soon",
                          })
                        }
                      >
                        <Edit3 className="w-4 h-4 mr-2 text-slate-600" />
                        <span>Edit Program</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-red-600 focus:text-red-600"
                        onSelect={() => setDeleteId(program.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        <span>Delete</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Description */}
                {program.description && (
                  <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                    {program.description}
                  </p>
                )}

                {/* Metadata Grid */}
                <div className="space-y-3 mb-4 pb-4 border-b border-slate-100">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 flex items-center">
                      <DollarSign className="w-4 h-4 mr-1 text-green-500" />
                      Price
                    </span>
                    <span className="font-bold text-green-600">
                      ${program.price.toLocaleString()}
                    </span>
                  </div>

                  {program.duration && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600 flex items-center">
                        <Clock className="w-4 h-4 mr-1 text-blue-500" />
                        Duration
                      </span>
                      <span className="font-semibold text-slate-900">
                        {program.duration} hours
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 flex items-center">
                      <Users className="w-4 h-4 mr-1 text-purple-500" />
                      Students
                    </span>
                    <span className="font-semibold text-slate-900">
                      {program.students || 0}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 flex items-center">
                      <Target className="w-4 h-4 mr-1 text-amber-500" />
                      Level
                    </span>
                    <span
                      className={`font-semibold capitalize ${getLevelColor(
                        program.level
                      )}`}
                    >
                      {program.level}
                    </span>
                  </div>
                </div>

                {/* Rating & Certificate */}
                <div className="flex items-center justify-between mb-4">
                  {program.rating ? (
                    <div className="flex items-center gap-1">
                      <Award className="w-4 h-4 text-amber-500" />
                      <span className="text-sm font-bold text-slate-900">
                        {program.rating.toFixed(1)}
                      </span>
                      <span className="text-xs text-slate-500">/5.0</span>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-500">
                      No ratings yet
                    </span>
                  )}

                  {program.certificateAvailable && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full bg-green-50 text-green-700">
                      <CheckCircle className="w-3 h-3" />
                      Certificate
                    </span>
                  )}
                </div>

                {/* Instructor */}
                {program.instructor && (
                  <div className="bg-slate-50 rounded-lg p-3 mb-4">
                    <p className="text-xs text-slate-500 mb-0.5">Instructor</p>
                    <p className="text-sm font-semibold text-slate-900">
                      {program.instructor}
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 border-primary/30 text-primary hover:bg-primary/10 hover:border-primary"
                    onClick={() => setPreviewProgram(program)}
                  >
                    <Eye className="w-3.5 h-3.5 mr-1.5" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 border-slate-200 text-slate-600 hover:bg-slate-50"
                    onClick={() =>
                      push({
                        type: "info",
                        message: "Enrollment management coming soon",
                      })
                    }
                  >
                    <Users className="w-3.5 h-3.5 mr-1.5" />
                    Students
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Program Dialog */}
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-slate-900">
                Create Training Program
              </DialogTitle>
              <DialogDescription className="text-slate-600">
                Create a new aviation training program with comprehensive
                details
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor="title"
                  className="text-sm font-medium text-slate-700"
                >
                  Program Title *
                </Label>
                <Input
                  id="title"
                  placeholder="e.g., Private Pilot License (PPL) Ground School"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="excerpt"
                  className="text-sm font-medium text-slate-700"
                >
                  Short Description
                </Label>
                <Input
                  id="excerpt"
                  placeholder="Brief summary for program cards"
                  value={formData.excerpt}
                  onChange={(e) =>
                    setFormData({ ...formData, excerpt: e.target.value })
                  }
                  className="focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="description"
                  className="text-sm font-medium text-slate-700"
                >
                  Full Description *
                </Label>
                <Textarea
                  id="description"
                  placeholder="Comprehensive program details, objectives, and outcomes"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={4}
                  className="focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="type"
                    className="text-sm font-medium text-slate-700"
                  >
                    Program Type *
                  </Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: any) =>
                      setFormData({ ...formData, type: value })
                    }
                  >
                    <SelectTrigger className="focus:ring-2 focus:ring-blue-500/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="theoretical">Theoretical</SelectItem>
                      <SelectItem value="practical">Practical</SelectItem>
                      <SelectItem value="simulator">Simulator</SelectItem>
                      <SelectItem value="combined">Combined</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="level"
                    className="text-sm font-medium text-slate-700"
                  >
                    Difficulty Level *
                  </Label>
                  <Select
                    value={formData.level}
                    onValueChange={(value: any) =>
                      setFormData({ ...formData, level: value })
                    }
                  >
                    <SelectTrigger className="focus:ring-2 focus:ring-blue-500/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                      <SelectItem value="expert">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="price"
                    className="text-sm font-medium text-slate-700"
                  >
                    Price ($) *
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        price: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="duration"
                    className="text-sm font-medium text-slate-700"
                  >
                    Duration (hours)
                  </Label>
                  <Input
                    id="duration"
                    type="number"
                    min="0"
                    value={formData.durationHours}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        durationHours: parseInt(e.target.value) || 0,
                      })
                    }
                    className="focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="maxStudents"
                    className="text-sm font-medium text-slate-700"
                  >
                    Max Students
                  </Label>
                  <Input
                    id="maxStudents"
                    type="number"
                    min="1"
                    value={formData.maxStudents}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        maxStudents: parseInt(e.target.value) || 20,
                      })
                    }
                    className="focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isPublished}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        isPublished: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500/20"
                  />
                  <span className="text-sm text-slate-700">
                    Publish immediately
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.certificateAvailable}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        certificateAvailable: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500/20"
                  />
                  <span className="text-sm text-slate-700">
                    Certificate available
                  </span>
                </label>
              </div>

              <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 mt-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-blue-900 mb-1">
                      Program Configuration
                    </p>
                    <p className="text-xs text-blue-700">
                      You can add modules, lessons, and additional resources
                      after creating the program.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setCreateOpen(false)}
                disabled={createMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateProgram}
                disabled={createMutation.isPending}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {createMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Program
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Preview Dialog */}
        <Dialog
          open={!!previewProgram}
          onOpenChange={(v) => !v && setPreviewProgram(null)}
        >
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-slate-900">
                Program Details
              </DialogTitle>
              <DialogDescription className="text-slate-600">
                Comprehensive training program information
              </DialogDescription>
            </DialogHeader>
            {previewProgram && (
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    {getTypeBadge(previewProgram.type)}
                    <span
                      className={`text-sm font-semibold capitalize ${getLevelColor(
                        previewProgram.level
                      )}`}
                    >
                      {previewProgram.level}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-3">
                    {previewProgram.title}
                  </h3>
                  {previewProgram.description && (
                    <p className="text-slate-600 whitespace-pre-line">
                      {previewProgram.description}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 rounded-lg p-4">
                    <p className="text-sm text-slate-600 mb-1 flex items-center">
                      <DollarSign className="w-4 h-4 mr-1 text-green-500" />
                      Price
                    </p>
                    <p className="text-2xl font-bold text-green-600">
                      ${previewProgram.price.toLocaleString()}
                    </p>
                  </div>
                  {previewProgram.duration && (
                    <div className="bg-slate-50 rounded-lg p-4">
                      <p className="text-sm text-slate-600 mb-1 flex items-center">
                        <Clock className="w-4 h-4 mr-1 text-blue-500" />
                        Duration
                      </p>
                      <p className="text-2xl font-bold text-slate-900">
                        {previewProgram.duration} hrs
                      </p>
                    </div>
                  )}
                  <div className="bg-slate-50 rounded-lg p-4">
                    <p className="text-sm text-slate-600 mb-1 flex items-center">
                      <Users className="w-4 h-4 mr-1 text-purple-500" />
                      Enrolled Students
                    </p>
                    <p className="text-2xl font-bold text-slate-900">
                      {previewProgram.students || 0}
                    </p>
                  </div>
                  {previewProgram.rating && (
                    <div className="bg-slate-50 rounded-lg p-4">
                      <p className="text-sm text-slate-600 mb-1 flex items-center">
                        <Award className="w-4 h-4 mr-1 text-amber-500" />
                        Rating
                      </p>
                      <p className="text-2xl font-bold text-slate-900">
                        {previewProgram.rating.toFixed(1)} / 5.0
                      </p>
                    </div>
                  )}
                </div>

                {previewProgram.instructor && (
                  <div className="bg-primary/10 rounded-lg p-4">
                    <p className="text-sm text-primary font-medium mb-1">
                      Instructor
                    </p>
                    <p className="text-lg font-semibold text-blue-900">
                      {previewProgram.instructor}
                    </p>
                  </div>
                )}

                {previewProgram.certificateAvailable && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <p className="text-sm font-semibold text-green-900">
                        Certificate of Completion Available
                      </p>
                    </div>
                  </div>
                )}
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
                Delete Training Program?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-slate-600">
                This action cannot be undone. This will permanently delete the
                training program, all associated modules, lessons, and student
                enrollment data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteId && deleteMutation.mutate(deleteId)}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete Program
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </main>
  );
}
