"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/context/ToastContext";
import {
  lessonsService,
  LessonType,
  LessonStatus,
  CreateLessonPayload,
  UpdateLessonPayload,
} from "@/services/lessons.service";
import { coursesService } from "@/services/courses.service";
import { modulesService } from "@/services/modules.service";
import { uploadService } from "@/services/upload.service";
import {
  quizzesService,
  CreateQuizPayload,
  QuizQuestion,
} from "@/services/quizzes.service";
import assignmentsService from "@/services/assignments.service";
import ReactPlayer from "react-player";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  PlayCircle,
  FileText,
  GripVertical,
  Eye,
  Clock,
  EllipsisVertical,
  ArrowUp,
  CheckCircle,
  ChartLine,
  Filter,
  Download,
  Plus,
  Pencil,
  Layers,
  Trash,
  CircleHelp,
  ListTodo,
  Search,
  Upload,
  Loader2,
  TrendingUp,
  Users,
  Target,
  AlertCircle,
  Video,
  FileTextIcon,
  Gift,
  Lock,
  Tag,
  X,
  ChevronDown,
  ChevronRight,
  List,
  Folder,
  Trash2,
  BookOpen,
  Image as ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  DialogFooter,
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

type LessonItem = {
  id: string;
  position: number;
  title: string;
  course: string;
  moduleId?: string;
  moduleTitle?: string;
  type: LessonType;
  duration: number; // in seconds
  durationDisplay: string;
  views: number;
  status: LessonStatus;
  completion: number;
  thumbnail?: string;
  videoUrl?: string;
  isFree: boolean;
  completionCount: number;
  averageScore: number;
};

export default function Lessons() {
  const queryClient = useQueryClient();
  const { push } = useToast();
  const [selectedCourseId, setSelectedCourseId] = React.useState<string>("");
  const [search, setSearch] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState<string>("all");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [sortBy, setSortBy] = React.useState<string>("position");
  const [createOpen, setCreateOpen] = React.useState(false);
  const [editLesson, setEditLesson] = React.useState<LessonItem | null>(null);
  const [previewLesson, setPreviewLesson] = React.useState<LessonItem | null>(
    null
  );
  const [analyticsLesson, setAnalyticsLesson] =
    React.useState<LessonItem | null>(null);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [draggedId, setDraggedId] = React.useState<string | null>(null);
  const [dragOverId, setDragOverId] = React.useState<string | null>(null);
  const [dragOverModuleId, setDragOverModuleId] = React.useState<string | null>(
    null
  );
  const [createPreset, setCreatePreset] = React.useState<{
    type?: LessonType;
  } | null>(null);
  const [selectedModuleId, setSelectedModuleId] = React.useState<string>("");
  const [uploadProgress, setUploadProgress] = React.useState<number>(0);
  const [videoPreview, setVideoPreview] = React.useState<string | null>(null);
  const [videoFile, setVideoFile] = React.useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = React.useState<string | null>(
    null
  );
  const [thumbnailFile, setThumbnailFile] = React.useState<File | null>(null);
  const [autoDurationSeconds, setAutoDurationSeconds] = React.useState<
    number | null
  >(null);
  const [seoTags, setSeoTags] = React.useState<string[]>([]);
  const [tagInput, setTagInput] = React.useState("");
  const searchRef = React.useRef<HTMLInputElement>(null);
  const videoInputRef = React.useRef<HTMLInputElement>(null);
  const [filterModuleId, setFilterModuleId] = React.useState<string>("all");
  const [createQuizOpen, setCreateQuizOpen] = React.useState(false);
  const [createAssignmentOpen, setCreateAssignmentOpen] = React.useState(false);
  const [addExistingLessonOpen, setAddExistingLessonOpen] =
    React.useState(false);
  const [selectedLessonsToAdd, setSelectedLessonsToAdd] = React.useState<
    Set<string>
  >(new Set());
  const [targetModuleForExisting, setTargetModuleForExisting] =
    React.useState<string>("");
  const [previewAutoplay, setPreviewAutoplay] = React.useState(false);
  const [searchLoading, setSearchLoading] = React.useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [quizForm, setQuizForm] = React.useState<{
    title: string;
    description: string;
    durationMinutes: number;
    passingScore: number;
    attemptsAllowed: number;
    shuffleQuestions: boolean;
    showCorrectAnswers: boolean;
    allowReview: boolean;
    questions: Omit<QuizQuestion, "id">[];
  }>({
    title: "",
    description: "",
    durationMinutes: 15,
    passingScore: 70,
    attemptsAllowed: 1,
    shuffleQuestions: false,
    showCorrectAnswers: false,
    allowReview: true,
    questions: [],
  });
  const [assignmentForm, setAssignmentForm] = React.useState<{
    title: string;
    description: string;
    dueDate: string;
    maxPoints: number;
  }>({ title: "", description: "", dueDate: "", maxPoints: 100 });
  const [viewMode, setViewMode] = React.useState<"table" | "module">("module");
  const [expandedModules, setExpandedModules] = React.useState<Set<string>>(
    new Set()
  );

  function formatTime(t: number) {
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m}:${String(s).padStart(2, "0")}`;
  }

  function isNativePlayable(url: string | null): boolean {
    if (!url) return false;
    const u = url.toLowerCase();
    return (
      u.startsWith("blob:") ||
      u.endsWith(".mp4") ||
      u.endsWith(".webm") ||
      u.endsWith(".ogg") ||
      u.endsWith(".mov") ||
      u.endsWith(".avi") ||
      u.endsWith(".mkv") ||
      u.endsWith(".flv")
    );
  }

  function isBunnyEmbed(url: string | null): boolean {
    if (!url) return false;
    return /mediadelivery\.net\/embed\//i.test(url);
  }

  function isYouTubeUrl(url: string | null): boolean {
    if (!url) return false;
    return /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i.test(
      url
    );
  }

  function isVimeoUrl(url: string | null): boolean {
    if (!url) return false;
    return /vimeo\.com\/(?:.*\/)?(\d+)/i.test(url);
  }

  function getYouTubeThumbnail(url: string): string | null {
    const match = url.match(
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i
    );
    if (match && match[1]) {
      return `https://img.youtube.com/vi/${match[1]}/maxresdefault.jpg`;
    }
    return null;
  }

  function getVimeoThumbnail(url: string): Promise<string | null> {
    const match = url.match(/vimeo\.com\/(?:.*\/)?(\d+)/i);
    if (match && match[1]) {
      return fetch(`https://vimeo.com/api/v2/video/${match[1]}.json`)
        .then((res) => res.json())
        .then((data) => data[0]?.thumbnail_large || null)
        .catch(() => null);
    }
    return Promise.resolve(null);
  }

  async function extractVideoThumbnail(
    videoFile: File
  ): Promise<string | null> {
    return new Promise((resolve) => {
      const video = document.createElement("video");
      video.preload = "metadata";
      video.muted = true;
      video.playsInline = true;

      video.onloadeddata = () => {
        video.currentTime = Math.min(2, video.duration / 4); // Seek to 2 seconds or 25% of video
      };

      video.onseeked = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            canvas.toBlob(
              (blob) => {
                if (blob) {
                  const thumbnailUrl = URL.createObjectURL(blob);
                  resolve(thumbnailUrl);
                } else {
                  resolve(null);
                }
              },
              "image/jpeg",
              0.8
            );
          } else {
            resolve(null);
          }
        } catch (error) {
          console.error("Error generating thumbnail:", error);
          resolve(null);
        } finally {
          URL.revokeObjectURL(video.src);
        }
      };

      video.onerror = () => {
        URL.revokeObjectURL(video.src);
        resolve(null);
      };

      video.src = URL.createObjectURL(videoFile);
    });
  }

  function VideoPlayer({
    src,
    poster,
    className,
    onLoaded,
  }: {
    src: string;
    poster?: string;
    className?: string;
    onLoaded?: (duration: number) => void;
  }) {
    const ref = React.useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = React.useState(false);
    const [current, setCurrent] = React.useState(0);
    const [duration, setDuration] = React.useState(0);
    const [volume, setVolume] = React.useState(1);
    const [muted, setMuted] = React.useState(false);

    React.useEffect(() => {
      const v = ref.current;
      if (!v) return;
      const onTime = () => setCurrent(v.currentTime || 0);
      const onMeta = () => {
        const d = Math.round(v.duration || 0);
        setDuration(d);
        if (onLoaded) onLoaded(d);
      };
      v.addEventListener("timeupdate", onTime);
      v.addEventListener("loadedmetadata", onMeta);
      return () => {
        v.removeEventListener("timeupdate", onTime);
        v.removeEventListener("loadedmetadata", onMeta);
      };
    }, [onLoaded]);

    function togglePlay() {
      const v = ref.current;
      if (!v) return;
      if (isPlaying) {
        v.pause();
        setIsPlaying(false);
      } else {
        v.play();
        setIsPlaying(true);
      }
    }

    function seek(p: number) {
      const v = ref.current;
      if (!v || duration <= 0) return;
      v.currentTime = Math.min(duration, Math.max(0, p * duration));
    }

    function changeVolume(val: number) {
      const v = ref.current;
      if (!v) return;
      const clamped = Math.min(1, Math.max(0, val));
      v.volume = clamped;
      setVolume(clamped);
      if (clamped === 0) setMuted(true);
      else setMuted(false);
    }

    function toggleMute() {
      const v = ref.current;
      if (!v) return;
      v.muted = !muted;
      setMuted(!muted);
    }

    const progress = duration > 0 ? current / duration : 0;

    return (
      <div className={`relative w-full ${className || ""}`}>
        <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
          <video
            ref={ref}
            src={src}
            poster={poster}
            className="w-full h-full object-contain"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
          <div className="absolute bottom-0 left-0 right-0 p-3 flex items-center gap-2">
            <button
              type="button"
              onClick={togglePlay}
              className="bg-white/20 hover:bg-white/30 text-white rounded px-2 py-1 text-xs"
            >
              {isPlaying ? "Pause" : "Play"}
            </button>
            <div
              className="flex-1 h-1.5 bg-white/30 rounded cursor-pointer"
              onClick={(e) => {
                const rect = (
                  e.target as HTMLDivElement
                ).getBoundingClientRect();
                seek((e.clientX - rect.left) / rect.width);
              }}
            >
              <div
                className="h-1.5 bg-primary rounded"
                style={{ width: `${Math.round(progress * 100)}%` }}
              />
            </div>
            <span className="text-white text-xs">
              {formatTime(current)} / {formatTime(duration)}
            </span>
            <button
              type="button"
              onClick={toggleMute}
              className="bg-white/20 hover:bg-white/30 text-white rounded px-2 py-1 text-xs"
            >
              {muted || volume === 0 ? "Unmute" : "Mute"}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={volume}
              onChange={(e) => changeVolume(Number(e.target.value))}
              className="w-24"
            />
          </div>
        </div>
      </div>
    );
  }

  function ResponsivePlayer({
    url,
    poster,
    className,
    onDuration,
    autoPlay,
  }: {
    url: string;
    poster?: string;
    className?: string;
    onDuration?: (seconds: number) => void;
    autoPlay?: boolean;
  }) {
    const RP: any = ReactPlayer;
    const playerRef = React.useRef<any>(null);
    const [playerReady, setPlayerReady] = React.useState(false);

    // Bunny CDN embed
    if (isBunnyEmbed(url)) {
      const src = url.includes("?")
        ? `${url}&autoplay=${autoPlay ? "true" : "false"}`
        : `${url}?autoplay=${autoPlay ? "true" : "false"}`;
      return (
        <div className={`relative w-full ${className || "aspect-video"}`}>
          <iframe
            src={src}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
          />
        </div>
      );
    }

    // Native video files (mp4, webm, etc.)
    if (isNativePlayable(url)) {
      return (
        <VideoPlayer
          src={url}
          poster={poster}
          className={className}
          onLoaded={(d) => onDuration && onDuration(d)}
        />
      );
    }

    // YouTube, Vimeo, and other platforms via ReactPlayer
    return (
      <div className={`relative w-full ${className || "aspect-video"}`}>
        <div className="absolute inset-0 w-full h-full bg-black rounded-lg overflow-hidden">
          <RP
            ref={playerRef}
            url={url}
            controls={true}
            width="100%"
            height="100%"
            playing={autoPlay}
            pip={false}
            stopOnUnmount={false}
            config={{
              youtube: {
                playerVars: {
                  showinfo: 1,
                  modestbranding: 1,
                  rel: 0,
                  fs: 1,
                  controls: 1,
                  disablekb: 0,
                  iv_load_policy: 3,
                },
                embedOptions: {
                  host: "https://www.youtube-nocookie.com",
                },
              },
              vimeo: {
                playerOptions: {
                  controls: true,
                  title: true,
                  byline: true,
                  portrait: true,
                  responsive: true,
                },
              },
              dailymotion: {
                params: {
                  controls: true,
                },
              },
              facebook: {
                appId: "",
              },
            }}
            onReady={() => {
              setPlayerReady(true);
              if (playerRef.current && onDuration) {
                setTimeout(() => {
                  try {
                    const duration = playerRef.current.getDuration();
                    if (duration && !isNaN(duration) && duration > 0) {
                      onDuration(Math.round(duration));
                    }
                  } catch (error) {
                    console.warn("Failed to get video duration:", error);
                  }
                }, 500);
              }
            }}
            onDuration={(d) => {
              if (onDuration && d && !isNaN(d) && d > 0) {
                onDuration(Math.round(d));
              }
            }}
            onError={(error, data) => {
              console.error("Video playback error:", error, data);
            }}
          />
          {!playerReady && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80">
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-white text-sm">Loading video...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Fetch courses
  const { data: coursesData, isLoading: coursesLoading } = useQuery({
    queryKey: ["courses", { page: 1, limit: 100 }],
    queryFn: () => coursesService.getAllCourses({ page: 1, limit: 100 }),
  });

  const courseList: any[] = React.useMemo(() => {
    const raw: any = coursesData as any;
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw?.data)) return raw.data;
    if (Array.isArray(raw?.courses)) return raw.courses;
    return [];
  }, [coursesData]);

  const { data: modulesData, isLoading: modulesLoading } = useQuery({
    queryKey: ["course-modules", { page: 1, limit: 100 }],
    queryFn: () =>
      modulesService.getAllModules({
        page: 1,
        limit: 100,
      }),
  });

  const moduleList: any[] = React.useMemo(() => {
    const raw: any = modulesData as any;
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw?.modules)) return raw.modules;
    return [];
  }, [modulesData]);

  React.useEffect(() => {
    const initial = searchParams?.get("q") || "";
    if (initial && !search) setSearch(initial);
  }, [searchParams]);

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      const params = new URLSearchParams(
        Array.from(searchParams?.entries?.() || [])
      );
      if (search) params.set("q", search);
      else params.delete("q");
      const qs = params.toString();
      const url = qs ? `${pathname}?${qs}` : `${pathname}`;
      router.replace(url);
      setSearchLoading(false);
      if (!search) return;
      if (filtered.length === 0) {
        push({ type: "info", message: `No lessons match "${search}"` });
      } else {
        push({ type: "info", message: `Showing ${filtered.length} result(s)` });
      }
    }, 300);
    setSearchLoading(true);
    return () => clearTimeout(timeout);
  }, [search, pathname]);

  React.useEffect(() => {
    if (!selectedModuleId && moduleList.length > 0) {
      setSelectedModuleId(moduleList[0]._id || moduleList[0].id);
    }
  }, [moduleList, selectedModuleId]);

  React.useEffect(() => {
    if (!selectedCourseId && courseList.length > 0) {
      setSelectedCourseId(courseList[0]._id);
    }
  }, [courseList, selectedCourseId]);

  // Auto-expand all modules in module view
  React.useEffect(() => {
    if (viewMode === "module" && moduleList.length > 0) {
      const allModuleIds = moduleList.map((m: any) => m._id || m.id);
      allModuleIds.push("no-module"); // Include lessons without module
      setExpandedModules(new Set(allModuleIds));
    }
  }, [viewMode, moduleList]);

  // Fetch lessons
  const {
    data: lessonsData,
    isLoading: lessonsLoading,
    isFetching: lessonsFetching,
    error: lessonsError,
  } = useQuery({
    queryKey: ["lessons", selectedCourseId],
    queryFn: () =>
      selectedCourseId
        ? lessonsService.getCourseLessons(selectedCourseId)
        : Promise.resolve([]),
    enabled: !!selectedCourseId,
  });

  // Fetch analytics
  const { data: analyticsData } = useQuery({
    queryKey: ["lessons-analytics", selectedCourseId],
    queryFn: () =>
      selectedCourseId
        ? lessonsService.getCourseAnalytics(selectedCourseId)
        : Promise.resolve(null),
    enabled: !!selectedCourseId,
  });

  const lessons: LessonItem[] = React.useMemo(() => {
    const raw: any = lessonsData as any;
    const arr: any[] = Array.isArray(raw)
      ? raw
      : Array.isArray(raw?.data)
      ? raw.data
      : [];
    return arr.map((l: any, idx: number) => ({
      id: l._id,
      position: l.order ?? idx + 1,
      title: l.title,
      course:
        courseList.find((c: any) => c._id === selectedCourseId)?.title || "",
      moduleId:
        l.module?._id || (typeof l.module === "string" ? l.module : undefined),
      moduleTitle: l.module?.title || undefined,
      type: (l.type || LessonType.VIDEO) as LessonType,
      duration: l.duration || 0,
      durationDisplay: formatDuration(l.duration || 0),
      views: l.completionCount || 0,
      status: (l.status || LessonStatus.DRAFT) as LessonStatus,
      completion: l.averageScore || 0,
      thumbnail: l.thumbnail,
      videoUrl: l.videoUrl,
      isFree: l.isFree || false,
      completionCount: l.completionCount || 0,
      averageScore: l.averageScore || 0,
    }));
  }, [lessonsData, selectedCourseId, courseList]);

  function formatDuration(seconds: number): string {
    if (!seconds) return "0m";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  }

  // Filtered and sorted lessons
  const filtered = React.useMemo(() => {
    return lessons
      .filter((l) =>
        search ? l.title.toLowerCase().includes(search.toLowerCase()) : true
      )
      .filter((l) => (typeFilter === "all" ? true : l.type === typeFilter))
      .filter((l) =>
        statusFilter === "all" ? true : l.status === statusFilter
      )
      .filter((l) =>
        filterModuleId !== "all" ? l.moduleId === filterModuleId : true
      )
      .sort((a, b) => {
        if (sortBy === "position") return a.position - b.position;
        if (sortBy === "newest") return b.id.localeCompare(a.id);
        if (sortBy === "duration") return b.duration - a.duration;
        if (sortBy === "completion") return b.completion - a.completion;
        return 0;
      });
  }, [lessons, search, typeFilter, statusFilter, sortBy, filterModuleId]);

  // Group lessons by module
  const lessonsByModule = React.useMemo(() => {
    const grouped = new Map<string, LessonItem[]>();
    filtered.forEach((lesson) => {
      const moduleId = lesson.moduleId || "no-module";
      if (!grouped.has(moduleId)) {
        grouped.set(moduleId, []);
      }
      grouped.get(moduleId)!.push(lesson);
    });
    return grouped;
  }, [filtered]);

  // Statistics
  const stats = React.useMemo(() => {
    const total = lessons.length;
    const videoCount = lessons.filter(
      (l) => l.type === LessonType.VIDEO
    ).length;
    const avgDuration =
      total > 0
        ? Math.floor(
            lessons.reduce((sum, l) => sum + l.duration, 0) / total / 60
          )
        : 0;
    const avgCompletion =
      total > 0
        ? Math.round(lessons.reduce((sum, l) => sum + l.completion, 0) / total)
        : 0;
    return { total, videoCount, avgDuration, avgCompletion };
  }, [lessons]);

  // Reorder mutation
  const reorderMutation = useMutation({
    mutationFn: ({
      courseId,
      lessonIds,
      moduleId,
    }: {
      courseId: string;
      lessonIds: string[];
      moduleId?: string;
    }) => lessonsService.reorderLessons(courseId, lessonIds, moduleId),
    onSuccess: () => {
      push({ type: "success", message: "Order updated successfully" });
      queryClient.invalidateQueries({
        queryKey: ["lessons", selectedCourseId],
      });
    },
    onError: (error: any) => {
      push({
        type: "error",
        message: error?.message || "Failed to update order",
      });
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: ({
      courseId,
      payload,
    }: {
      courseId: string;
      payload: CreateLessonPayload;
    }) => lessonsService.createLesson(courseId, payload),
    onSuccess: () => {
      push({ type: "success", message: "Lesson created successfully" });
      queryClient.invalidateQueries({
        queryKey: ["lessons", selectedCourseId],
      });
      setCreateOpen(false);
    },
    onError: (error: any) => {
      push({
        type: "error",
        message: error?.message || "Failed to create lesson",
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ lessonId, payload }: { lessonId: string; payload: any }) =>
      lessonsService.updateLesson(lessonId, payload),
    onSuccess: () => {
      push({ type: "success", message: "Lesson updated successfully" });
      // Invalidate all lesson queries to ensure fresh data
      queryClient.invalidateQueries({
        queryKey: ["lessons"],
      });
      queryClient.invalidateQueries({
        queryKey: ["course-modules"],
      });
      // Clear drag state
      setDraggedId(null);
      setDragOverId(null);
      setDragOverModuleId(null);
      setEditLesson(null);
    },
    onError: (error: any) => {
      push({
        type: "error",
        message: error?.message || "Failed to update lesson",
      });
      // Clear drag state on error too
      setDraggedId(null);
      setDragOverId(null);
      setDragOverModuleId(null);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (lessonId: string) => lessonsService.deleteLesson(lessonId),
    onSuccess: () => {
      push({ type: "success", message: "Lesson deleted successfully" });
      queryClient.invalidateQueries({
        queryKey: ["lessons", selectedCourseId],
      });
      setDeleteId(null);
    },
    onError: (error: any) => {
      push({
        type: "error",
        message: error?.message || "Failed to delete lesson",
      });
    },
  });

  // Duplicate mutation
  const duplicateMutation = useMutation({
    mutationFn: (lessonId: string) => lessonsService.duplicateLesson(lessonId),
    onSuccess: () => {
      push({ type: "success", message: "Lesson duplicated successfully" });
      queryClient.invalidateQueries({
        queryKey: ["lessons", selectedCourseId],
      });
    },
    onError: (error: any) => {
      push({
        type: "error",
        message: error?.message || "Failed to duplicate lesson",
      });
    },
  });

  function onDrop(targetId: string) {
    if (!draggedId || draggedId === targetId) {
      setDraggedId(null);
      setDragOverId(null);
      return;
    }
    const order = [...lessons];
    const from = order.findIndex((l) => l.id === draggedId);
    const to = order.findIndex((l) => l.id === targetId);
    if (from === -1 || to === -1) {
      setDraggedId(null);
      setDragOverId(null);
      return;
    }
    const [moved] = order.splice(from, 1);
    order.splice(to, 0, moved);
    const ids = order.map((l) => l.id);
    if (selectedCourseId) {
      const moduleId = filterModuleId !== "all" ? filterModuleId : undefined;
      reorderMutation.mutate({
        courseId: selectedCourseId,
        lessonIds: ids,
        moduleId,
      });
    }
    setDraggedId(null);
    setDragOverId(null);
  }

  function onDropToModule(moduleId: string) {
    if (!draggedId) {
      setDraggedId(null);
      setDragOverModuleId(null);
      return;
    }

    const draggedLesson = lessons.find((l) => l.id === draggedId);
    if (!draggedLesson) {
      setDraggedId(null);
      setDragOverModuleId(null);
      return;
    }

    // If already in this module, just reorder
    if (draggedLesson.moduleId === moduleId) {
      setDraggedId(null);
      setDragOverModuleId(null);
      return;
    }

    // Move lesson to new module
    updateMutation.mutate({
      lessonId: draggedId,
      payload: { moduleId },
    });

    setDraggedId(null);
    setDragOverModuleId(null);
  }

  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function getLessonIcon(type: LessonType) {
    switch (type) {
      case LessonType.VIDEO:
        return <PlayCircle className="w-4 h-4" />;
      case LessonType.TEXT:
        return <FileText className="w-4 h-4" />;
      case LessonType.QUIZ:
        return <CircleHelp className="w-4 h-4" />;
      case LessonType.ASSIGNMENT:
        return <ListTodo className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="p-6  mx-auto">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-4xl font-bold text-primary mb-2">
                Lesson Management
              </h2>
              <p className="text-gray-600 text-lg">
                Create, organize, and manage your course content
              </p>
            </div>
            <div className="flex space-x-3">
              <div className="flex bg-white rounded-lg border border-gray-200 p-1">
                <Button
                  variant={viewMode === "module" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("module")}
                  className="text-xs"
                >
                  <Folder className="w-4 h-4 mr-1" /> Modules
                </Button>
              </div>
              <Button
                variant="outline"
                className="border-gray-300 hover:bg-gray-50 transition-all"
              >
                <Download className="w-4 h-4 mr-2" /> Export
              </Button>
              <Button
                onClick={() => {
                  setCreatePreset(null);
                  setCreateOpen(true);
                }}
                className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg transition-all hover:shadow-xl"
              >
                <Plus className="w-4 h-4 mr-2" /> Create Lesson
              </Button>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-xl p-4 shadow-md border border-gray-200 mb-6 animate-slide-up">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search lessons... (Ctrl+K)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              ref={searchRef}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
            {(searchLoading || lessonsFetching) && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary animate-spin" />
            )}
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div
            className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-all cursor-pointer animate-slide-up"
            style={{ animationDelay: "0.1s" }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">
                  Total Lessons
                </p>
                <p className="text-3xl font-bold text-secondary">
                  {lessonsLoading ? (
                    <Loader2 className="w-8 h-8 animate-spin" />
                  ) : (
                    stats.total
                  )}
                </p>
                <p className="text-accent text-sm mt-2 flex items-center">
                  <TrendingUp className="inline w-3 h-3 mr-1" /> Active
                </p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center">
                <PlayCircle className="text-primary w-7 h-7" />
              </div>
            </div>
          </div>

          <div
            className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-all cursor-pointer animate-slide-up"
            style={{ animationDelay: "0.2s" }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">
                  Video Lessons
                </p>
                <p className="text-3xl font-bold text-secondary">
                  {lessonsLoading ? (
                    <Loader2 className="w-8 h-8 animate-spin" />
                  ) : (
                    stats.videoCount
                  )}
                </p>
                <p className="text-accent text-sm mt-2 flex items-center">
                  <CheckCircle className="inline w-3 h-3 mr-1" />{" "}
                  {((stats.videoCount / stats.total) * 100 || 0).toFixed(0)}%
                </p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-accent/20 to-accent/10 rounded-xl flex items-center justify-center">
                <PlayCircle className="text-accent w-7 h-7" />
              </div>
            </div>
          </div>

          <div
            className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-all cursor-pointer animate-slide-up"
            style={{ animationDelay: "0.3s" }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">
                  Avg. Duration
                </p>
                <p className="text-3xl font-bold text-secondary">
                  {lessonsLoading ? (
                    <Loader2 className="w-8 h-8 animate-spin" />
                  ) : (
                    `${stats.avgDuration}m`
                  )}
                </p>
                <p className="text-accent text-sm mt-2 flex items-center">
                  <Clock className="inline w-3 h-3 mr-1" /> Optimal
                </p>
              </div>
              <div className="w-14 h-14 bg-linear-to-br from-yellow-100 to-yellow-50 rounded-xl flex items-center justify-center">
                <Clock className="text-yellow-600 w-7 h-7" />
              </div>
            </div>
          </div>

          <div
            className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-all cursor-pointer animate-slide-up"
            style={{ animationDelay: "0.4s" }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">
                  Completion
                </p>
                <p className="text-3xl font-bold text-secondary">
                  {lessonsLoading ? (
                    <Loader2 className="w-8 h-8 animate-spin" />
                  ) : (
                    `${stats.avgCompletion}%`
                  )}
                </p>
                <p className="text-accent text-sm mt-2 flex items-center">
                  <ArrowUp className="inline w-3 h-3 mr-1" /> +8%
                </p>
              </div>
              <div className="w-14 h-14 bg-linear-to-br from-purple-100 to-purple-50 rounded-xl flex items-center justify-center">
                <ChartLine className="text-purple-600 w-7 h-7" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div
          className="bg-white rounded-xl p-4 shadow-md border border-gray-100 mb-6 animate-slide-up"
          style={{ animationDelay: "0.5s" }}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
            <div className="flex flex-wrap gap-3">
              <Select
                value={selectedCourseId}
                onValueChange={setSelectedCourseId}
              >
                <SelectTrigger className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm w-56 hover:bg-gray-100 transition-all">
                  <SelectValue
                    placeholder={
                      coursesLoading ? "Loading..." : "Select course"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {courseList.map((c: any) => (
                    <SelectItem key={c._id} value={c._id}>
                      {c.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm w-40 hover:bg-gray-100 transition-all">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value={LessonType.VIDEO}>Video</SelectItem>
                  <SelectItem value={LessonType.TEXT}>Text</SelectItem>
                  <SelectItem value={LessonType.QUIZ}>Quiz</SelectItem>
                  <SelectItem value={LessonType.ASSIGNMENT}>
                    Assignment
                  </SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm w-40 hover:bg-gray-100 transition-all">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value={LessonStatus.PUBLISHED}>
                    Published
                  </SelectItem>
                  <SelectItem value={LessonStatus.DRAFT}>Draft</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm w-44 hover:bg-gray-100 transition-all">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="position">Sort: Position</SelectItem>
                  <SelectItem value="newest">Sort: Newest</SelectItem>
                  <SelectItem value="duration">Sort: Duration</SelectItem>
                  <SelectItem value="completion">Sort: Completion</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterModuleId} onValueChange={setFilterModuleId}>
                <SelectTrigger className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm w-56 hover:bg-gray-100 transition-all">
                  <SelectValue
                    placeholder={modulesLoading ? "Loading..." : "All Modules"}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Modules</SelectItem>
                  {moduleList.map((m: any) => (
                    <SelectItem key={m._id || m.id} value={m._id || m.id}>
                      {m.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* All Lessons Section */}
        {lessons && lessons.length > 0 && (
          <div
            className="bg-white rounded-xl p-6 shadow-md border border-gray-100 mb-6 animate-slide-up"
            style={{ animationDelay: "0.7s" }}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  All Lessons
                  <span className="text-xs font-normal text-slate-500">
                    (Drag to modules below)
                  </span>
                </h3>
              </div>
              <span className="text-sm bg-primary/10 text-primary px-3 py-1 rounded-full font-semibold">
                {lessons.length} Total
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              All created lessons from the selected course. Drag any lesson to a
              module below to organize your content.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {lessons.map((lesson: LessonItem) => {
                const isBeingDragged = draggedId === lesson.id;
                const isDropTarget = dragOverId === lesson.id;

                return (
                  <div
                    key={lesson.id}
                    draggable
                    onDragStart={(e) => {
                      e.stopPropagation();
                      setDraggedId(lesson.id);
                      e.dataTransfer.effectAllowed = "move";
                      e.dataTransfer.setData("text/plain", lesson.id);
                    }}
                    onDragEnd={(e) => {
                      e.stopPropagation();
                      setDraggedId(null);
                      setDragOverId(null);
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      e.dataTransfer.dropEffect = "move";
                      if (draggedId && draggedId !== lesson.id) {
                        setDragOverId(lesson.id);
                      }
                    }}
                    onDragEnter={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (draggedId && draggedId !== lesson.id) {
                        setDragOverId(lesson.id);
                      }
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      // Only clear if leaving to a non-child element
                      const rect = e.currentTarget.getBoundingClientRect();
                      const x = e.clientX;
                      const y = e.clientY;
                      if (
                        x < rect.left ||
                        x >= rect.right ||
                        y < rect.top ||
                        y >= rect.bottom
                      ) {
                        setDragOverId(null);
                      }
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (draggedId && draggedId !== lesson.id) {
                        onDrop(lesson.id);
                      }
                      setDragOverId(null);
                    }}
                    className={`bg-gray-50 border border-gray-200 rounded-lg p-4 transition-all group ${
                      isBeingDragged
                        ? "opacity-50 scale-95 cursor-grabbing shadow-2xl ring-2 ring-primary rotate-2"
                        : "cursor-grab hover:shadow-md hover:scale-105"
                    } ${
                      isDropTarget
                        ? "border-primary border-2 shadow-lg scale-105 bg-primary/5"
                        : ""
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden relative">
                        {lesson.thumbnail ? (
                          <img
                            src={lesson.thumbnail}
                            alt={lesson.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                            {getLessonIcon(lesson.type)}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4
                            className="font-semibold text-gray-800 truncate group-hover:text-primary transition-colors cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewLesson(lesson);
                            }}
                          >
                            {lesson.title}
                          </h4>
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              asChild
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <EllipsisVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditLesson(lesson);
                                }}
                              >
                                <Pencil className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setPreviewLesson(lesson);
                                }}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                Preview
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteId(lesson.id);
                                }}
                                className="text-red-600 focus:text-red-600"
                              >
                                <Trash className="w-4 h-4 mr-2" />
                                Delete Permanently
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <div className="flex items-center space-x-3 text-xs text-gray-600 mb-2">
                          <span className="flex items-center space-x-1">
                            <span className="capitalize">{lesson.type}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{lesson.durationDisplay}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Eye className="w-3 h-3" />
                            <span>{lesson.views}</span>
                          </span>
                          {lesson.moduleTitle && (
                            <span className="flex items-center space-x-1 text-primary">
                              <Folder className="w-3 h-3" />
                              <span>{lesson.moduleTitle}</span>
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              lesson.status === LessonStatus.PUBLISHED
                                ? "bg-green-100 text-green-700"
                                : "bg-orange-100 text-orange-700"
                            }`}
                          >
                            {lesson.status}
                          </span>
                          {lesson.isFree && (
                            <span className="flex items-center space-x-1 text-xs text-green-600">
                              <Gift className="w-3 h-3" />
                              <span>Free</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="space-y-3 mb-8">
          {moduleList.map((module: any) => {
            const moduleId = module._id || module.id;
            const moduleLessons = lessonsByModule.get(moduleId) || [];

            const isModuleExpanded = expandedModules.has(moduleId);
            const moduleTitle = module.title || "Untitled Module";
            const moduleStatus = module.status || "draft";
            const moduleCourse =
              module.course?.title || module.courses?.[0]?.title || "No Course";

            return (
              <div
                key={moduleId}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (draggedId) {
                    setDragOverModuleId(moduleId);
                  }
                }}
                onDragEnter={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (draggedId) {
                    setDragOverModuleId(moduleId);
                  }
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = e.clientX;
                  const y = e.clientY;
                  if (
                    x < rect.left ||
                    x >= rect.right ||
                    y < rect.top ||
                    y >= rect.bottom
                  ) {
                    setDragOverModuleId(null);
                  }
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (draggedId) {
                    onDropToModule(moduleId);
                  }
                }}
                className={`bg-white rounded-lg shadow-sm border-2 overflow-hidden transition-all ${
                  dragOverModuleId === moduleId
                    ? "border-primary border-4 shadow-lg bg-primary/5 scale-[1.02]"
                    : "border-slate-200"
                }`}
              >
                {/* Module Header (Top Level Container) */}
                <div className="bg-gradient-to-r from-primary/5 to-white border-b border-slate-200">
                  <div className="flex items-center justify-between p-4">
                    <button
                      onClick={() => {
                        const newSet = new Set(expandedModules);
                        if (isModuleExpanded) {
                          newSet.delete(moduleId);
                        } else {
                          newSet.add(moduleId);
                        }
                        setExpandedModules(newSet);
                      }}
                      className="flex items-center gap-3 flex-1 text-left hover:text-primary transition-colors"
                    >
                      <div className="text-slate-400">
                        {isModuleExpanded ? (
                          <ChevronDown className="w-5 h-5" />
                        ) : (
                          <ChevronRight className="w-5 h-5" />
                        )}
                      </div>
                      <Folder className="w-6 h-6 text-primary" />
                      <span className="font-bold text-slate-900">
                        {moduleTitle}
                      </span>
                      <Badge
                        variant="outline"
                        className={
                          moduleStatus === "published"
                            ? "bg-green-50 text-green-700"
                            : "bg-amber-50 text-amber-700"
                        }
                      >
                        {moduleStatus}
                      </Badge>
                      {moduleLessons.length > 0 && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                          {moduleLessons.length} lesson
                          {moduleLessons.length !== 1 ? "s" : ""}
                        </span>
                      )}
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <BookOpen className="w-3 h-3" />
                        {moduleCourse}
                      </span>
                    </button>
                    <div className="flex items-center gap-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-primary hover:text-primary hover:bg-primary/10"
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Add Content
                            <ChevronDown className="w-3 h-3 ml-1" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-56">
                          <div className="px-2 py-1.5 text-xs font-semibold text-slate-500">
                            Create New
                          </div>
                          <DropdownMenuItem
                            onSelect={(e) => {
                              if (module) {
                                setSelectedModuleId(moduleId);
                              }
                              setCreateOpen(true);
                            }}
                          >
                            <PlayCircle className="w-4 h-4 mr-2 text-primary" />
                            Video Lesson
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onSelect={(e) => {
                              if (module) {
                                setSelectedModuleId(moduleId);
                              }
                              setCreatePreset({ type: LessonType.TEXT });
                              setCreateOpen(true);
                            }}
                          >
                            <FileText className="w-4 h-4 mr-2 text-blue-600" />
                            Text Lesson
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onSelect={(e) => {
                              if (module) {
                                setSelectedModuleId(moduleId);
                              }
                              setCreatePreset({ type: LessonType.QUIZ });
                              setCreateQuizOpen(true);
                            }}
                          >
                            <CircleHelp className="w-4 h-4 mr-2 text-purple-600" />
                            Quiz
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onSelect={(e) => {
                              if (module) {
                                setSelectedModuleId(moduleId);
                              }
                              setCreatePreset({ type: LessonType.ASSIGNMENT });
                              setCreateAssignmentOpen(true);
                            }}
                          >
                            <ListTodo className="w-4 h-4 mr-2 text-orange-600" />
                            Assignment
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <div className="px-2 py-1.5 text-xs font-semibold text-slate-500">
                            Add Existing
                          </div>
                          <DropdownMenuItem
                            onSelect={(e) => {
                              setTargetModuleForExisting(moduleId);
                              setSelectedLessonsToAdd(new Set());
                              setAddExistingLessonOpen(true);
                            }}
                          >
                            <Layers className="w-4 h-4 mr-2 text-green-600" />
                            Select Existing Lessons
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      {module && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditLesson(moduleLessons[0])}
                            className="text-slate-600 hover:text-primary hover:bg-primary/10"
                          >
                            <Pencil className="w-4 h-4 mr-1" />
                            Edit Module
                          </Button>
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
                                  window.location.href = `/modules/${moduleId}`;
                                }}
                              >
                                <Eye className="w-4 h-4 mr-2" /> View Module
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onSelect={() => {
                                  window.location.href = `/modules/${moduleId}/analytics`;
                                }}
                              >
                                <ChartLine className="w-4 h-4 mr-2" /> Analytics
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Module Content - Lessons under this Module */}
                {isModuleExpanded && (
                  <div className="bg-slate-50/30">
                    {moduleLessons.length === 0 ? (
                      <div
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (draggedId) {
                            onDropToModule(moduleId);
                          }
                        }}
                        className={`p-6 text-center transition-all ${
                          dragOverModuleId === moduleId
                            ? "bg-primary/10 border-2 border-dashed border-primary text-primary"
                            : "text-slate-500 border-2 border-dashed border-transparent"
                        }`}
                      >
                        <FileText className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                        <p className="text-sm">
                          {dragOverModuleId === moduleId
                            ? "Drop lesson here to add to this module"
                            : "No lessons yet"}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          {dragOverModuleId === moduleId
                            ? "Release to add"
                            : 'Click "Add Lesson" or drag lessons here'}
                        </p>
                      </div>
                    ) : (
                      moduleLessons.map((lesson, idx) => {
                        const isBeingDragged = draggedId === lesson.id;
                        const isDropTarget = dragOverId === lesson.id;
                        return (
                          <div
                            key={lesson.id}
                            draggable
                            onDragStart={(e) => {
                              e.stopPropagation();
                              setDraggedId(lesson.id);
                            }}
                            onDragEnd={(e) => {
                              e.stopPropagation();
                              setDraggedId(null);
                              setDragOverId(null);
                            }}
                            onDragOver={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if (draggedId !== lesson.id) {
                                setDragOverId(lesson.id);
                              }
                            }}
                            onDragEnter={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if (draggedId !== lesson.id) {
                                setDragOverId(lesson.id);
                              }
                            }}
                            onDragLeave={(e) => {
                              e.stopPropagation();
                              const rect =
                                e.currentTarget.getBoundingClientRect();
                              const x = e.clientX;
                              const y = e.clientY;
                              if (
                                x < rect.left ||
                                x >= rect.right ||
                                y < rect.top ||
                                y >= rect.bottom
                              ) {
                                setDragOverId(null);
                              }
                            }}
                            onDrop={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if (draggedId && draggedId !== lesson.id) {
                                onDrop(lesson.id);
                              }
                              setDragOverId(null);
                            }}
                            className={`p-3 pl-8 border-b border-slate-100 transition-all cursor-move group/lesson ${
                              isBeingDragged
                                ? "opacity-40 bg-primary/10 border-primary"
                                : isDropTarget
                                ? "border-l-4 border-l-primary bg-primary/5"
                                : "hover:bg-white/50 hover:border-l-4 hover:border-l-primary"
                            }`}
                            style={{
                              pointerEvents: isBeingDragged ? "none" : "auto",
                            }}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-3 flex-1">
                                <div className="text-slate-400 cursor-grab active:cursor-grabbing opacity-0 group-hover/lesson:opacity-100 transition-opacity">
                                  <GripVertical className="w-4 h-4" />
                                </div>
                                <div className="w-14 h-14 rounded-lg bg-gray-200 overflow-hidden relative flex-shrink-0">
                                  {lesson.thumbnail ? (
                                    <img
                                      src={lesson.thumbnail}
                                      alt={lesson.title}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full bg-blue-50 flex items-center justify-center">
                                      {getLessonIcon(lesson.type)}
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-slate-400 font-mono">
                                      #{lesson.position}
                                    </span>
                                    <span className="font-semibold text-slate-800">
                                      {lesson.title}
                                    </span>
                                    <Badge
                                      variant="outline"
                                      className={
                                        lesson.status === LessonStatus.PUBLISHED
                                          ? "bg-green-50 text-green-700"
                                          : "bg-amber-50 text-amber-700"
                                      }
                                    >
                                      {lesson.status}
                                    </Badge>
                                    {lesson.isFree && (
                                      <Badge
                                        variant="outline"
                                        className="bg-emerald-50 text-emerald-700"
                                      >
                                        Free
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                                    <span className="flex items-center gap-1">
                                      {getLessonIcon(lesson.type)}
                                      <span className="text-xs">
                                        {lesson.type}
                                      </span>
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Clock className="w-3.5 h-3.5" />
                                      {lesson.durationDisplay}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Eye className="w-3.5 h-3.5" />
                                      {lesson.views} views
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setEditLesson(lesson)}
                                  className="h-7 px-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setPreviewLesson(lesson)}
                                  className="h-7 px-2 text-slate-600 hover:text-green-600 hover:bg-green-50"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    // Remove from module (unassign)
                                    updateMutation.mutate({
                                      lessonId: lesson.id,
                                      payload: { moduleId: null },
                                    });
                                  }}
                                  className="h-7 px-2 text-slate-600 hover:text-orange-600 hover:bg-orange-50"
                                  title="Remove from module"
                                >
                                  <X className="w-3.5 h-3.5" />
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
              setCreateOpen(true);
            }}
            className="w-full p-4 border-2 border-dashed border-slate-300 rounded-lg text-slate-500 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium">Add New Lesson</span>
          </button>
        </div>
      </div>

      {/* Create Lesson Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="min-w-[80vw] max-w-[80vw] w-[95vw] max-h-[95vh] overflow-y-auto flex flex-col ">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <PlayCircle className="w-6 h-6 text-primary" />
              Create New Lesson
            </DialogTitle>
            <DialogDescription>
              Add a new lesson to your course. Choose the lesson type and fill
              in the details.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const form = e.currentTarget as HTMLFormElement;
              const fd = new FormData(form);

              const title = String(fd.get("title") || "");
              const description = String(fd.get("description") || "");
              const type = String(
                fd.get("type") || createPreset?.type || LessonType.VIDEO
              );
              const durationInput = String(fd.get("duration") || "0");
              const durationMinutes =
                Number(durationInput.replace(/[^0-9]/g, "")) || 0;
              let duration = durationMinutes * 60;
              if (autoDurationSeconds && autoDurationSeconds > 0) {
                duration = autoDurationSeconds;
              }
              const content = String(fd.get("content") || "");
              const videoUrl = String(fd.get("videoUrl") || "");
              const isFree = fd.get("isFree") === "on";
              const status = String(fd.get("status") || LessonStatus.DRAFT);
              const moduleId = String(
                fd.get("moduleId") || selectedModuleId || ""
              );
              const metaTitle = String(fd.get("metaTitle") || "");
              const metaDescription = String(fd.get("metaDescription") || "");

              if (!selectedCourseId) {
                push({
                  type: "error",
                  message: "Please select a course first",
                });
                return;
              }

              const payload: CreateLessonPayload = {
                title,
                description,
                type: type as LessonType,
                content,
                duration,
                isFree,
                status: status as LessonStatus,
                moduleId: moduleId || undefined,
              };

              let finalVideoUrl = videoUrl;
              let finalThumbnail = thumbnailPreview || "";

              if (videoFile) {
                try {
                  const result = await uploadService.uploadFile(videoFile, {
                    type: "video",
                    onProgress: (p) => setUploadProgress(p.percentage),
                  });
                  finalVideoUrl = result.url;
                  if (result.duration && result.duration > 0) {
                    payload.duration = Math.round(result.duration);
                  }
                } catch (err) {
                  push({ type: "error", message: "Video upload failed" });
                  return;
                } finally {
                  setUploadProgress(0);
                }
              }

              // Upload thumbnail if available
              if (thumbnailFile) {
                try {
                  const result = await uploadService.uploadFile(thumbnailFile, {
                    type: "image",
                  });
                  finalThumbnail = result.url;
                } catch (err) {
                  console.error("Thumbnail upload failed:", err);
                  // Don't fail the entire upload if thumbnail fails
                }
              }

              payload.videoUrl = finalVideoUrl || undefined;
              payload.thumbnail = finalThumbnail || undefined;

              createMutation.mutate({ courseId: selectedCourseId, payload });
            }}
            className="space-y-6"
            onReset={() => {
              setVideoPreview(null);
              setVideoFile(null);
              setThumbnailPreview(null);
              setThumbnailFile(null);
              setAutoDurationSeconds(null);
              setSeoTags([]);
              setTagInput("");
            }}
          >
            <div className="flex-1 overflow-y-auto pr-2">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger
                    value="basic"
                    className="flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    Basic Info
                  </TabsTrigger>
                  <TabsTrigger
                    value="content"
                    className="flex items-center gap-2"
                  >
                    <Video className="w-4 h-4" />
                    Content
                  </TabsTrigger>
                  <TabsTrigger value="seo" className="flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    SEO & Settings
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4 mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Lesson Details</CardTitle>
                      <CardDescription>
                        Basic information about your lesson
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor="lesson-title"
                          className="flex items-center gap-2"
                        >
                          <FileText className="w-4 h-4 text-primary" />
                          Lesson Title *
                        </Label>
                        <Input
                          id="lesson-title"
                          name="title"
                          placeholder="e.g., Introduction to Flight Controls"
                          required
                          className="text-base"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label
                            htmlFor="module"
                            className="flex items-center gap-2"
                          >
                            <Folder className="w-4 h-4 text-primary" />
                            Module
                          </Label>
                          <input
                            type="hidden"
                            name="moduleId"
                            value={selectedModuleId}
                          />
                          <Select
                            value={selectedModuleId}
                            onValueChange={(v) => setSelectedModuleId(v)}
                          >
                            <SelectTrigger id="module">
                              <SelectValue
                                placeholder={
                                  modulesLoading
                                    ? "Loading..."
                                    : "Select module"
                                }
                              />
                            </SelectTrigger>
                            <SelectContent>
                              {moduleList.map((m: any) => (
                                <SelectItem
                                  key={m._id || m.id}
                                  value={m._id || m.id}
                                >
                                  <div className="flex items-center gap-2">
                                    <Folder className="w-4 h-4" />
                                    {m.title}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="lesson-type"
                            className="flex items-center gap-2"
                          >
                            <Layers className="w-4 h-4 text-primary" />
                            Lesson Type *
                          </Label>
                          <input
                            type="hidden"
                            name="type"
                            value={createPreset?.type || LessonType.VIDEO}
                          />
                          <Select
                            defaultValue={
                              createPreset?.type || LessonType.VIDEO
                            }
                            onValueChange={(value) => {
                              const input = document.querySelector(
                                'input[name="type"]'
                              ) as HTMLInputElement;
                              if (input) input.value = value;
                            }}
                          >
                            <SelectTrigger id="lesson-type">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={LessonType.VIDEO}>
                                <div className="flex items-center gap-2">
                                  <Video className="w-4 h-4 text-blue-500" />
                                  <span>Video Lesson</span>
                                </div>
                              </SelectItem>
                              <SelectItem value={LessonType.TEXT}>
                                <div className="flex items-center gap-2">
                                  <FileTextIcon className="w-4 h-4 text-green-500" />
                                  <span>Text/Article</span>
                                </div>
                              </SelectItem>
                              <SelectItem value={LessonType.QUIZ}>
                                <div className="flex items-center gap-2">
                                  <CircleHelp className="w-4 h-4 text-purple-500" />
                                  <span>Quiz</span>
                                </div>
                              </SelectItem>
                              <SelectItem value={LessonType.ASSIGNMENT}>
                                <div className="flex items-center gap-2">
                                  <ListTodo className="w-4 h-4 text-orange-500" />
                                  <span>Assignment</span>
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="status"
                          className="flex items-center gap-2"
                        >
                          <Target className="w-4 h-4 text-primary" />
                          Status
                        </Label>
                        <input
                          type="hidden"
                          name="status"
                          value={LessonStatus.DRAFT}
                        />
                        <Select
                          defaultValue={LessonStatus.DRAFT}
                          onValueChange={(value) => {
                            const input = document.querySelector(
                              'input[name="status"]'
                            ) as HTMLInputElement;
                            if (input) input.value = value;
                          }}
                        >
                          <SelectTrigger id="status">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={LessonStatus.DRAFT}>
                              <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-amber-500" />
                                <span>Draft</span>
                              </div>
                            </SelectItem>
                            <SelectItem value={LessonStatus.PUBLISHED}>
                              <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                <span>Published</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {autoDurationSeconds !== null &&
                        autoDurationSeconds > 0 && (
                          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-sm text-blue-700 flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              <span className="font-medium">
                                Auto-detected Duration:
                              </span>
                              <span className="font-bold">
                                {Math.floor(autoDurationSeconds / 60)}m{" "}
                                {Math.round(autoDurationSeconds % 60)}s
                              </span>
                            </p>
                          </div>
                        )}

                      <div className="space-y-2">
                        <Label
                          htmlFor="description"
                          className="flex items-center gap-2"
                        >
                          <FileText className="w-4 h-4 text-primary" />
                          Description
                        </Label>
                        <Textarea
                          id="description"
                          name="description"
                          rows={3}
                          placeholder="Brief description of the lesson content..."
                          className="resize-none"
                        />
                      </div>

                      <div className="flex items-center space-x-2 p-4 bg-muted/50 rounded-lg">
                        <Switch id="isFree" name="isFree" />
                        <Label
                          htmlFor="isFree"
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <Gift className="w-4 h-4 text-green-500" />
                          <span className="font-medium">
                            Make this lesson free to preview
                          </span>
                        </Label>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="content" className="space-y-4 mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Lesson Content</CardTitle>
                      <CardDescription>
                        Add video or text content for your lesson
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Video className="w-4 h-4 text-primary" />
                          Video Upload or URL
                        </Label>
                        <div className="space-y-3">
                          <div className="flex gap-2">
                            <Input
                              name="videoUrl"
                              type="url"
                              placeholder="YouTube, Vimeo, or any video URL"
                              value={videoPreview || ""}
                              onChange={async (e) => {
                                const url = e.target.value;
                                setVideoPreview(url);

                                // Auto-detect thumbnail from URL
                                if (isYouTubeUrl(url)) {
                                  const thumb = getYouTubeThumbnail(url);
                                  if (thumb) {
                                    setThumbnailPreview(thumb);
                                  }
                                } else if (isVimeoUrl(url)) {
                                  const thumb = await getVimeoThumbnail(url);
                                  if (thumb) {
                                    setThumbnailPreview(thumb);
                                  }
                                }
                              }}
                              className="flex-1"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => videoInputRef.current?.click()}
                            >
                              <Upload className="w-4 h-4 mr-2" />
                              Upload
                            </Button>
                          </div>
                          <input
                            ref={videoInputRef}
                            type="file"
                            accept="video/*"
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setVideoFile(file);
                                const url = URL.createObjectURL(file);
                                setVideoPreview(url);
                                setAutoDurationSeconds(null);

                                // Auto-generate thumbnail
                                const thumbnail = await extractVideoThumbnail(
                                  file
                                );
                                if (thumbnail) {
                                  setThumbnailPreview(thumbnail);
                                  // Convert thumbnail URL to File for upload
                                  fetch(thumbnail)
                                    .then((res) => res.blob())
                                    .then((blob) => {
                                      const thumbFile = new File(
                                        [blob],
                                        `${file.name}-thumb.jpg`,
                                        { type: "image/jpeg" }
                                      );
                                      setThumbnailFile(thumbFile);
                                    })
                                    .catch(console.error);
                                }
                              }
                            }}
                          />
                          {videoPreview && (
                            <div className="relative border border-border rounded-lg overflow-hidden bg-muted">
                              <ResponsivePlayer
                                url={videoPreview}
                                className="h-48"
                                onDuration={(d: number) => {
                                  setAutoDurationSeconds(d);
                                  const input = document.querySelector(
                                    'input[name="duration"]'
                                  ) as HTMLInputElement | null;
                                  if (input)
                                    input.value = String(
                                      Math.max(1, Math.ceil(d / 60))
                                    );
                                }}
                              />
                              {uploadProgress > 0 && uploadProgress < 100 && (
                                <>
                                  <div className="absolute bottom-0 left-0 right-0 bg-muted h-2">
                                    <div
                                      className="bg-primary h-2 transition-all"
                                      style={{ width: `${uploadProgress}%` }}
                                    />
                                  </div>
                                  <div className="absolute bottom-3 right-3 bg-background/90 backdrop-blur-sm text-foreground text-xs px-3 py-1.5 rounded-full font-medium shadow-lg">
                                    <Loader2 className="w-3 h-3 inline-block animate-spin mr-1" />
                                    {uploadProgress}%
                                  </div>
                                </>
                              )}
                              <Button
                                type="button"
                                size="icon"
                                variant="destructive"
                                onClick={() => {
                                  setVideoPreview(null);
                                  setVideoFile(null);
                                  setThumbnailPreview(null);
                                  setThumbnailFile(null);
                                  setAutoDurationSeconds(null);
                                  if (videoInputRef.current)
                                    videoInputRef.current.value = "";
                                }}
                                className="absolute top-2 right-2"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="content"
                          className="flex items-center gap-2"
                        >
                          <FileTextIcon className="w-4 h-4 text-primary" />
                          Text Content (for text lessons)
                        </Label>
                        <Textarea
                          id="content"
                          name="content"
                          rows={8}
                          placeholder="Write your lesson content here..."
                          className="resize-none font-mono text-sm"
                        />
                        <p className="text-xs text-muted-foreground">
                          Use markdown formatting for better content structure.
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <ImageIcon className="w-4 h-4 text-primary" />
                          Thumbnail{" "}
                          {thumbnailPreview && (
                            <span className="text-xs text-green-600">
                              (Auto-generated)
                            </span>
                          )}
                        </Label>
                        {thumbnailPreview && (
                          <div className="relative border border-border rounded-lg overflow-hidden">
                            <img
                              src={thumbnailPreview}
                              alt="Thumbnail preview"
                              className="w-full h-40 object-cover"
                            />
                            <Button
                              type="button"
                              size="icon"
                              variant="destructive"
                              onClick={() => {
                                setThumbnailPreview(null);
                                setThumbnailFile(null);
                              }}
                              className="absolute top-2 right-2"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                        {!thumbnailPreview && (
                          <div className="text-sm text-muted-foreground p-4 border-2 border-dashed rounded-lg text-center">
                            Thumbnail will be auto-generated from video or you
                            can manually upload one
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="seo" className="space-y-4 mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Tag className="w-5 h-5 text-primary" />
                        SEO & Metadata
                      </CardTitle>
                      <CardDescription>
                        Optimize your lesson for search engines and
                        discoverability
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor="metaTitle"
                          className="flex items-center gap-2"
                        >
                          <FileText className="w-4 h-4 text-primary" />
                          Meta Title
                        </Label>
                        <Input
                          id="metaTitle"
                          name="metaTitle"
                          placeholder="SEO-friendly title for search engines"
                          maxLength={60}
                        />
                        <p className="text-xs text-muted-foreground">
                          Recommended: 50-60 characters
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="metaDescription"
                          className="flex items-center gap-2"
                        >
                          <FileText className="w-4 h-4 text-primary" />
                          Meta Description
                        </Label>
                        <Textarea
                          id="metaDescription"
                          name="metaDescription"
                          rows={3}
                          placeholder="Brief description for search results..."
                          maxLength={160}
                          className="resize-none"
                        />
                        <p className="text-xs text-muted-foreground">
                          Recommended: 150-160 characters
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Tag className="w-4 h-4 text-primary" />
                          Tags
                        </Label>
                        <div className="space-y-3">
                          <div className="flex gap-2">
                            <Input
                              type="text"
                              value={tagInput}
                              onChange={(e) => setTagInput(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && tagInput.trim()) {
                                  e.preventDefault();
                                  if (!seoTags.includes(tagInput.trim())) {
                                    setSeoTags([...seoTags, tagInput.trim()]);
                                  }
                                  setTagInput("");
                                }
                              }}
                              placeholder="Add tags (press Enter)"
                              className="flex-1"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                if (
                                  tagInput.trim() &&
                                  !seoTags.includes(tagInput.trim())
                                ) {
                                  setSeoTags([...seoTags, tagInput.trim()]);
                                  setTagInput("");
                                }
                              }}
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                          {seoTags.length > 0 && (
                            <div className="flex flex-wrap gap-2 p-3 bg-muted/50 rounded-lg">
                              {seoTags.map((tag, idx) => (
                                <Badge
                                  key={idx}
                                  variant="secondary"
                                  className="gap-1"
                                >
                                  <Tag className="w-3 h-3" />
                                  {tag}
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setSeoTags(
                                        seoTags.filter((_, i) => i !== idx)
                                      )
                                    }
                                    className="ml-1 hover:text-destructive transition-colors"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            <DialogFooter className="gap-2 flex-shrink-0 border-t pt-4 mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateOpen(false)}
                disabled={createMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Lesson
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Lesson Dialog */}
      <Dialog
        open={!!editLesson}
        onOpenChange={(v) => {
          if (!v) {
            setEditLesson(null);
            setVideoPreview(null);
            setVideoFile(null);
            setThumbnailPreview(null);
            setThumbnailFile(null);
            setAutoDurationSeconds(null);
          }
        }}
      >
        <DialogContent className="min-w-[80vw] max-w-[80vw] w-[95vw] max-h-[95vh] overflow-y-auto flex flex-col ">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <Pencil className="w-6 h-6 text-primary" />
              Edit Lesson
            </DialogTitle>
            <DialogDescription>
              Update the lesson details below.
            </DialogDescription>
          </DialogHeader>
          {editLesson && (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget as HTMLFormElement);

                const title = String(fd.get("title") || editLesson.title);
                const description = String(fd.get("description") || "");
                const type = String(fd.get("type") || editLesson.type);
                const durationInput = String(fd.get("duration") || "0");
                const durationMinutes =
                  Number(durationInput.replace(/[^0-9]/g, "")) || 0;
                let duration = durationMinutes * 60;
                if (autoDurationSeconds && autoDurationSeconds > 0) {
                  duration = autoDurationSeconds;
                }
                const content = String(fd.get("content") || "");
                const videoUrl = String(fd.get("videoUrl") || "");
                const isFree = fd.get("isFree") === "on";
                const status = String(fd.get("status") || editLesson.status);

                const payload: UpdateLessonPayload = {
                  title,
                  description,
                  type: type as LessonType,
                  content,
                  duration,
                  isFree,
                  status: status as LessonStatus,
                };

                let finalVideoUrl = videoUrl;
                let finalThumbnail =
                  thumbnailPreview || editLesson.thumbnail || "";

                if (videoFile) {
                  try {
                    const result = await uploadService.uploadFile(videoFile, {
                      type: "video",
                      onProgress: (p) => setUploadProgress(p.percentage),
                    });
                    finalVideoUrl = result.url;
                    if (result.duration && result.duration > 0) {
                      payload.duration = Math.round(result.duration);
                    }
                  } catch (err) {
                    push({ type: "error", message: "Video upload failed" });
                    return;
                  } finally {
                    setUploadProgress(0);
                  }
                }

                // Upload thumbnail if available
                if (thumbnailFile) {
                  try {
                    const result = await uploadService.uploadFile(
                      thumbnailFile,
                      {
                        type: "image",
                      }
                    );
                    finalThumbnail = result.url;
                  } catch (err) {
                    console.error("Thumbnail upload failed:", err);
                  }
                }

                payload.videoUrl = finalVideoUrl || undefined;
                payload.thumbnail = finalThumbnail || undefined;

                updateMutation.mutate({ lessonId: editLesson.id, payload });
              }}
              className="space-y-6"
              onReset={() => {
                setVideoPreview(null);
                setVideoFile(null);
                setThumbnailPreview(null);
                setThumbnailFile(null);
                setAutoDurationSeconds(null);
              }}
            >
              <div className="flex-1 overflow-y-auto pr-2">
                <Tabs defaultValue="basic" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger
                      value="basic"
                      className="flex items-center gap-2"
                    >
                      <FileText className="w-4 h-4" />
                      Basic Info
                    </TabsTrigger>
                    <TabsTrigger
                      value="content"
                      className="flex items-center gap-2"
                    >
                      <Video className="w-4 h-4" />
                      Content
                    </TabsTrigger>
                    <TabsTrigger
                      value="seo"
                      className="flex items-center gap-2"
                    >
                      <Tag className="w-4 h-4" />
                      Settings
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="basic" className="space-y-4 mt-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">
                          Lesson Details
                        </CardTitle>
                        <CardDescription>
                          Basic information about your lesson
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label
                            htmlFor="edit-lesson-title"
                            className="flex items-center gap-2"
                          >
                            <FileText className="w-4 h-4 text-primary" />
                            Lesson Title *
                          </Label>
                          <Input
                            id="edit-lesson-title"
                            name="title"
                            defaultValue={editLesson.title}
                            required
                            placeholder="e.g., Introduction to the Course"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label
                              htmlFor="edit-type"
                              className="flex items-center gap-2"
                            >
                              <Layers className="w-4 h-4 text-primary" />
                              Lesson Type
                            </Label>
                            <input
                              type="hidden"
                              name="type"
                              defaultValue={editLesson.type}
                            />
                            <Select
                              defaultValue={editLesson.type}
                              onValueChange={(value) => {
                                const input = document.querySelector(
                                  'input[name="type"]'
                                ) as HTMLInputElement;
                                if (input) input.value = value;
                              }}
                            >
                              <SelectTrigger id="edit-type">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value={LessonType.VIDEO}>
                                  Video
                                </SelectItem>
                                <SelectItem value={LessonType.TEXT}>
                                  Text
                                </SelectItem>
                                <SelectItem value={LessonType.QUIZ}>
                                  Quiz
                                </SelectItem>
                                <SelectItem value={LessonType.ASSIGNMENT}>
                                  Assignment
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label
                              htmlFor="edit-duration"
                              className="flex items-center gap-2"
                            >
                              <Clock className="w-4 h-4 text-primary" />
                              Duration (minutes)
                            </Label>
                            <Input
                              id="edit-duration"
                              name="duration"
                              type="number"
                              min="0"
                              defaultValue={Math.floor(
                                editLesson.duration / 60
                              )}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="edit-status"
                            className="flex items-center gap-2"
                          >
                            <CheckCircle className="w-4 h-4 text-primary" />
                            Status
                          </Label>
                          <input
                            type="hidden"
                            name="status"
                            defaultValue={editLesson.status}
                          />
                          <Select
                            defaultValue={editLesson.status}
                            onValueChange={(value) => {
                              const input = document.querySelector(
                                'input[name="status"]'
                              ) as HTMLInputElement;
                              if (input) input.value = value;
                            }}
                          >
                            <SelectTrigger id="edit-status">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={LessonStatus.DRAFT}>
                                <div className="flex items-center gap-2">
                                  <FileText className="w-4 h-4 text-amber-500" />
                                  <span>Draft</span>
                                </div>
                              </SelectItem>
                              <SelectItem value={LessonStatus.PUBLISHED}>
                                <div className="flex items-center gap-2">
                                  <CheckCircle className="w-4 h-4 text-green-500" />
                                  <span>Published</span>
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {autoDurationSeconds !== null &&
                          autoDurationSeconds > 0 && (
                            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                              <p className="text-sm text-blue-700 flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                <span className="font-medium">
                                  Auto-detected Duration:
                                </span>
                                <span className="font-bold">
                                  {Math.floor(autoDurationSeconds / 60)}m{" "}
                                  {Math.round(autoDurationSeconds % 60)}s
                                </span>
                              </p>
                            </div>
                          )}

                        <div className="space-y-2">
                          <Label
                            htmlFor="edit-description"
                            className="flex items-center gap-2"
                          >
                            <FileText className="w-4 h-4 text-primary" />
                            Description
                          </Label>
                          <Textarea
                            id="edit-description"
                            name="description"
                            rows={3}
                            placeholder="Brief description of the lesson content..."
                            className="resize-none"
                          />
                        </div>

                        <div className="flex items-center space-x-2 p-4 bg-muted/50 rounded-lg">
                          <Switch
                            id="edit-isFree"
                            name="isFree"
                            defaultChecked={editLesson.isFree}
                          />
                          <Label
                            htmlFor="edit-isFree"
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <Gift className="w-4 h-4 text-green-500" />
                            <span className="font-medium">
                              Make this lesson free to preview
                            </span>
                          </Label>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="content" className="space-y-4 mt-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">
                          Lesson Content
                        </CardTitle>
                        <CardDescription>
                          Add video or text content for your lesson
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label className="flex items-center gap-2">
                            <Video className="w-4 h-4 text-primary" />
                            Video Upload or URL
                          </Label>
                          <div className="space-y-3">
                            <div className="flex gap-2">
                              <Input
                                name="videoUrl"
                                type="url"
                                placeholder="YouTube, Vimeo, or any video URL"
                                value={
                                  videoPreview || editLesson.videoUrl || ""
                                }
                                onChange={async (e) => {
                                  const url = e.target.value;
                                  setVideoPreview(url);

                                  if (isYouTubeUrl(url)) {
                                    const thumb = getYouTubeThumbnail(url);
                                    if (thumb) {
                                      setThumbnailPreview(thumb);
                                    }
                                  } else if (isVimeoUrl(url)) {
                                    const thumb = await getVimeoThumbnail(url);
                                    if (thumb) {
                                      setThumbnailPreview(thumb);
                                    }
                                  }
                                }}
                                className="flex-1"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => videoInputRef.current?.click()}
                              >
                                <Upload className="w-4 h-4 mr-2" />
                                Upload
                              </Button>
                            </div>
                            <input
                              ref={videoInputRef}
                              type="file"
                              accept="video/*"
                              className="hidden"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  setVideoFile(file);
                                  const url = URL.createObjectURL(file);
                                  setVideoPreview(url);
                                  setAutoDurationSeconds(null);

                                  const thumbnail = await extractVideoThumbnail(
                                    file
                                  );
                                  if (thumbnail) {
                                    setThumbnailPreview(thumbnail);
                                    fetch(thumbnail)
                                      .then((res) => res.blob())
                                      .then((blob) => {
                                        const thumbFile = new File(
                                          [blob],
                                          `${file.name}-thumb.jpg`,
                                          { type: "image/jpeg" }
                                        );
                                        setThumbnailFile(thumbFile);
                                      })
                                      .catch(console.error);
                                  }
                                }
                              }}
                            />
                            {videoPreview && (
                              <div className="relative border border-border rounded-lg overflow-hidden bg-muted">
                                <ResponsivePlayer
                                  url={videoPreview}
                                  className="h-48"
                                  onDuration={(d: number) => {
                                    setAutoDurationSeconds(d);
                                    const input = document.querySelector(
                                      'input[name="duration"]'
                                    ) as HTMLInputElement | null;
                                    if (input)
                                      input.value = String(
                                        Math.max(1, Math.ceil(d / 60))
                                      );
                                  }}
                                />
                                {uploadProgress > 0 && uploadProgress < 100 && (
                                  <>
                                    <div className="absolute bottom-0 left-0 right-0 bg-muted h-2">
                                      <div
                                        className="bg-primary h-2 transition-all"
                                        style={{ width: `${uploadProgress}%` }}
                                      />
                                    </div>
                                    <div className="absolute bottom-3 right-3 bg-background/90 backdrop-blur-sm text-foreground text-xs px-3 py-1.5 rounded-full font-medium shadow-lg">
                                      <Loader2 className="w-3 h-3 inline-block animate-spin mr-1" />
                                      {uploadProgress}%
                                    </div>
                                  </>
                                )}
                                <Button
                                  type="button"
                                  size="icon"
                                  variant="destructive"
                                  onClick={() => {
                                    setVideoPreview(null);
                                    setVideoFile(null);
                                    setThumbnailPreview(null);
                                    setThumbnailFile(null);
                                    setAutoDurationSeconds(null);
                                    if (videoInputRef.current)
                                      videoInputRef.current.value = "";
                                  }}
                                  className="absolute top-2 right-2"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="edit-content"
                            className="flex items-center gap-2"
                          >
                            <FileTextIcon className="w-4 h-4 text-primary" />
                            Text Content (for text lessons)
                          </Label>
                          <Textarea
                            id="edit-content"
                            name="content"
                            rows={8}
                            placeholder="Write your lesson content here..."
                            className="resize-none font-mono text-sm"
                          />
                          <p className="text-xs text-muted-foreground">
                            Use markdown formatting for better content
                            structure.
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label className="flex items-center gap-2">
                            <ImageIcon className="w-4 h-4 text-primary" />
                            Thumbnail{" "}
                            {thumbnailPreview && (
                              <span className="text-xs text-green-600">
                                (Auto-generated)
                              </span>
                            )}
                          </Label>
                          {(thumbnailPreview || editLesson.thumbnail) && (
                            <div className="relative border border-border rounded-lg overflow-hidden">
                              <img
                                src={thumbnailPreview || editLesson.thumbnail}
                                alt="Thumbnail preview"
                                className="w-full h-40 object-cover"
                              />
                              <Button
                                type="button"
                                size="icon"
                                variant="destructive"
                                onClick={() => {
                                  setThumbnailPreview(null);
                                  setThumbnailFile(null);
                                }}
                                className="absolute top-2 right-2"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          )}
                          {!thumbnailPreview && !editLesson.thumbnail && (
                            <div className="text-sm text-muted-foreground p-4 border-2 border-dashed rounded-lg text-center">
                              Thumbnail will be auto-generated from video or you
                              can manually upload one
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="seo" className="space-y-4 mt-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Tag className="w-5 h-5 text-primary" />
                          Additional Settings
                        </CardTitle>
                        <CardDescription>
                          Configure additional lesson settings
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-sm text-blue-700">
                            <strong>Note:</strong> Additional settings and
                            metadata can be configured here.
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>

              <DialogFooter className="gap-2 flex-shrink-0 border-t pt-4 mt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditLesson(null);
                    setVideoPreview(null);
                    setVideoFile(null);
                    setThumbnailPreview(null);
                    setThumbnailFile(null);
                    setAutoDurationSeconds(null);
                  }}
                  disabled={updateMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-primary text-white"
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Preview Lesson Dialog */}
      <Dialog
        open={!!previewLesson}
        onOpenChange={(v) => {
          if (!v) {
            setPreviewLesson(null);
            setPreviewAutoplay(false);
          }
        }}
      >
        <DialogContent className="max-w-5xl w-[95vw] max-h-[95vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="text-2xl font-bold">
              Preview Lesson
            </DialogTitle>
            <DialogDescription>
              Quick overview of the lesson content.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto pr-2">
            {previewLesson && (
              <div className="space-y-4">
                {previewLesson.type === LessonType.VIDEO &&
                  previewLesson.videoUrl && (
                    <ResponsivePlayer
                      url={previewLesson.videoUrl}
                      poster={previewLesson.thumbnail}
                      className="w-full"
                      autoPlay={previewAutoplay}
                    />
                  )}
                <div className="flex items-start space-x-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-secondary mb-2">
                      {previewLesson.title}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span className="flex items-center space-x-1">
                        {getLessonIcon(previewLesson.type)}
                        <span className="capitalize">{previewLesson.type}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{previewLesson.durationDisplay}</span>
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          previewLesson.status === LessonStatus.PUBLISHED
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {previewLesson.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Position</p>
                      <p className="text-lg font-semibold">
                        #{previewLesson.position}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Completions</p>
                      <p className="text-lg font-semibold">
                        {previewLesson.completionCount}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">
                        Average Score
                      </p>
                      <p className="text-lg font-semibold">
                        {previewLesson.averageScore}%
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Access</p>
                      <p className="text-lg font-semibold flex items-center space-x-2">
                        {previewLesson.isFree ? (
                          <>
                            <Gift className="w-5 h-5 text-green-600" />
                            <span>Free</span>
                          </>
                        ) : (
                          <>
                            <Lock className="w-5 h-5 text-gray-600" />
                            <span>Paid</span>
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={createQuizOpen} onOpenChange={setCreateQuizOpen}>
        <DialogContent className="max-w-4xl w-[95vw] max-h-[95vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="text-2xl font-bold">
              Create Quiz
            </DialogTitle>
            <DialogDescription>Build a quiz for this course</DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!selectedCourseId) {
                push({
                  type: "error",
                  message: "Please select a course first",
                });
                return;
              }
              const payload: CreateQuizPayload = {
                title: quizForm.title,
                description: quizForm.description,
                courseId: selectedCourseId,
                moduleId: selectedModuleId || undefined,
                questions:
                  quizForm.questions.length > 0
                    ? quizForm.questions
                    : [
                        {
                          type: "multiple_choice",
                          question: "Sample question",
                          options: ["A", "B", "C", "D"],
                          correctAnswer: "A",
                          points: 1,
                          order: 1,
                        },
                      ],
                passingScore: quizForm.passingScore,
                duration: Math.max(1, quizForm.durationMinutes) * 60,
                attemptsAllowed: quizForm.attemptsAllowed,
                shuffleQuestions: quizForm.shuffleQuestions,
                showCorrectAnswers: quizForm.showCorrectAnswers,
                allowReview: quizForm.allowReview,
              };
              quizzesService
                .createQuiz(payload)
                .then(() => {
                  push({
                    type: "success",
                    message: "Quiz created successfully",
                  });
                  queryClient.invalidateQueries({ queryKey: ["lessons"] });
                  queryClient.invalidateQueries({
                    queryKey: ["course-modules"],
                  });
                  setCreateQuizOpen(false);
                  setQuizForm({
                    title: "",
                    description: "",
                    durationMinutes: 15,
                    passingScore: 70,
                    attemptsAllowed: 1,
                    shuffleQuestions: false,
                    showCorrectAnswers: false,
                    allowReview: true,
                    questions: [],
                  });
                })
                .catch((err) => {
                  push({
                    type: "error",
                    message: err?.message || "Failed to create quiz",
                  });
                });
            }}
            className="space-y-4"
          >
            <div className="flex-1 overflow-y-auto pr-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    Quiz Title *
                  </label>
                  <input
                    className="w-full px-4 py-2.5 border rounded-lg"
                    value={quizForm.title}
                    onChange={(e) =>
                      setQuizForm({ ...quizForm, title: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    Description
                  </label>
                  <textarea
                    className="w-full px-4 py-2.5 border rounded-lg"
                    rows={3}
                    value={quizForm.description}
                    onChange={(e) =>
                      setQuizForm({ ...quizForm, description: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    min={1}
                    className="w-full px-4 py-2.5 border rounded-lg"
                    value={quizForm.durationMinutes}
                    onChange={(e) =>
                      setQuizForm({
                        ...quizForm,
                        durationMinutes: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    Passing Score (%)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    className="w-full px-4 py-2.5 border rounded-lg"
                    value={quizForm.passingScore}
                    onChange={(e) =>
                      setQuizForm({
                        ...quizForm,
                        passingScore: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    Attempts Allowed
                  </label>
                  <input
                    type="number"
                    min={1}
                    className="w-full px-4 py-2.5 border rounded-lg"
                    value={quizForm.attemptsAllowed}
                    onChange={(e) =>
                      setQuizForm({
                        ...quizForm,
                        attemptsAllowed: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="flex items-center gap-4">
                  <label className="inline-flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={quizForm.shuffleQuestions}
                      onChange={(e) =>
                        setQuizForm({
                          ...quizForm,
                          shuffleQuestions: e.target.checked,
                        })
                      }
                    />{" "}
                    Shuffle Questions
                  </label>
                  <label className="inline-flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={quizForm.showCorrectAnswers}
                      onChange={(e) =>
                        setQuizForm({
                          ...quizForm,
                          showCorrectAnswers: e.target.checked,
                        })
                      }
                    />{" "}
                    Show Answers
                  </label>
                  <label className="inline-flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={quizForm.allowReview}
                      onChange={(e) =>
                        setQuizForm({
                          ...quizForm,
                          allowReview: e.target.checked,
                        })
                      }
                    />{" "}
                    Allow Review
                  </label>
                </div>
              </div>
              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-gray-700">
                    Questions
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      setQuizForm({
                        ...quizForm,
                        questions: [
                          ...quizForm.questions,
                          {
                            type: "multiple_choice",
                            question: "",
                            options: ["", "", "", ""],
                            correctAnswer: "",
                            points: 1,
                            order: quizForm.questions.length + 1,
                          },
                        ],
                      })
                    }
                  >
                    Add Question
                  </Button>
                </div>
                <div className="space-y-3">
                  {quizForm.questions.map((q, idx) => (
                    <div key={idx} className="border rounded-lg p-3">
                      <input
                        className="w-full px-3 py-2 border rounded mb-2"
                        placeholder={`Question ${idx + 1}`}
                        value={q.question}
                        onChange={(e) => {
                          const arr = [...quizForm.questions];
                          arr[idx] = { ...arr[idx], question: e.target.value };
                          setQuizForm({ ...quizForm, questions: arr });
                        }}
                      />
                      <div className="grid grid-cols-2 gap-2">
                        {(q.options || []).map((opt, i) => (
                          <input
                            key={i}
                            className="px-3 py-2 border rounded"
                            placeholder={`Option ${i + 1}`}
                            value={opt}
                            onChange={(e) => {
                              const arr = [...quizForm.questions];
                              const opts = [...(arr[idx].options || [])];
                              opts[i] = e.target.value;
                              arr[idx] = { ...arr[idx], options: opts };
                              setQuizForm({ ...quizForm, questions: arr });
                            }}
                          />
                        ))}
                      </div>
                      <input
                        className="mt-2 px-3 py-2 border rounded w-full"
                        placeholder="Correct answer"
                        value={(q.correctAnswer as string) || ""}
                        onChange={(e) => {
                          const arr = [...quizForm.questions];
                          arr[idx] = {
                            ...arr[idx],
                            correctAnswer: e.target.value,
                          };
                          setQuizForm({ ...quizForm, questions: arr });
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter className="flex-shrink-0 border-t pt-4 mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateQuizOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-primary text-white">
                Create Quiz
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={createAssignmentOpen}
        onOpenChange={setCreateAssignmentOpen}
      >
        <DialogContent className="max-w-3xl w-[95vw] max-h-[95vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="text-2xl font-bold">
              Create Assignment
            </DialogTitle>
            <DialogDescription>
              Create a practical task for students
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!selectedCourseId) {
                push({
                  type: "error",
                  message: "Please select a course first",
                });
                return;
              }
              assignmentsService
                .createAssignment(selectedCourseId, {
                  title: assignmentForm.title,
                  description: assignmentForm.description,
                  dueDate: assignmentForm.dueDate,
                  maxPoints: assignmentForm.maxPoints,
                  moduleId: selectedModuleId || undefined,
                })
                .then(() => {
                  push({
                    type: "success",
                    message: "Assignment created successfully",
                  });
                  queryClient.invalidateQueries({ queryKey: ["lessons"] });
                  queryClient.invalidateQueries({
                    queryKey: ["course-modules"],
                  });
                  setCreateAssignmentOpen(false);
                  setAssignmentForm({
                    title: "",
                    description: "",
                    dueDate: "",
                    maxPoints: 100,
                  });
                })
                .catch((err) => {
                  push({
                    type: "error",
                    message: err?.message || "Failed to create assignment",
                  });
                });
            }}
            className="space-y-4"
          >
            <div className="flex-1 overflow-y-auto pr-2">
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    Assignment Title *
                  </label>
                  <input
                    className="w-full px-4 py-2.5 border rounded-lg"
                    value={assignmentForm.title}
                    onChange={(e) =>
                      setAssignmentForm({
                        ...assignmentForm,
                        title: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    Description *
                  </label>
                  <textarea
                    className="w-full px-4 py-2.5 border rounded-lg"
                    rows={4}
                    value={assignmentForm.description}
                    onChange={(e) =>
                      setAssignmentForm({
                        ...assignmentForm,
                        description: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">
                      Due Date *
                    </label>
                    <input
                      type="datetime-local"
                      className="w-full px-4 py-2.5 border rounded-lg"
                      value={assignmentForm.dueDate}
                      onChange={(e) =>
                        setAssignmentForm({
                          ...assignmentForm,
                          dueDate: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">
                      Max Points
                    </label>
                    <input
                      type="number"
                      min={0}
                      className="w-full px-4 py-2.5 border rounded-lg"
                      value={assignmentForm.maxPoints}
                      onChange={(e) =>
                        setAssignmentForm({
                          ...assignmentForm,
                          maxPoints: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter className="flex-shrink-0 border-t pt-4 mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateAssignmentOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-primary text-white">
                Create Assignment
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Analytics Lesson Dialog */}
      <Dialog
        open={!!analyticsLesson}
        onOpenChange={(v) => !v && setAnalyticsLesson(null)}
      >
        <DialogContent className="max-w-4xl w-[95vw] max-h-[95vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="text-2xl font-bold flex items-center space-x-2">
              <ChartLine className="w-6 h-6 text-primary" />
              <span>Lesson Analytics</span>
            </DialogTitle>
            <DialogDescription>
              Performance metrics and student engagement data.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto pr-2">
            {analyticsLesson && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-primary/10 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-primary font-medium">
                          Total Views
                        </p>
                        <p className="text-2xl font-bold text-primary mt-1">
                          {analyticsLesson.views}
                        </p>
                      </div>
                      <Eye className="w-8 h-8 text-primary" />
                    </div>
                  </div>

                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-green-600 font-medium">
                          Completions
                        </p>
                        <p className="text-2xl font-bold text-green-900 mt-1">
                          {analyticsLesson.completionCount}
                        </p>
                      </div>
                      <CheckCircle className="w-8 h-8 text-green-500" />
                    </div>
                  </div>

                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-purple-600 font-medium">
                          Avg. Score
                        </p>
                        <p className="text-2xl font-bold text-purple-900 mt-1">
                          {analyticsLesson.averageScore}%
                        </p>
                      </div>
                      <Target className="w-8 h-8 text-purple-500" />
                    </div>
                  </div>

                  <div className="bg-orange-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-orange-600 font-medium">
                          Duration
                        </p>
                        <p className="text-2xl font-bold text-orange-900 mt-1">
                          {analyticsLesson.durationDisplay}
                        </p>
                      </div>
                      <Clock className="w-8 h-8 text-orange-500" />
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-3">Completion Rate</h4>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div
                      className="bg-gradient-to-r from-accent to-primary h-4 rounded-full transition-all duration-500"
                      style={{ width: `${analyticsLesson.completion}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-600 mt-2 text-right">
                    {analyticsLesson.completion}%
                  </p>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog - For permanent deletion */}
      <AlertDialog
        open={!!deleteId}
        onOpenChange={(v) => !v && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold">
              Permanently Delete Lesson?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              This will permanently delete the lesson from the course. The
              lesson will be removed from all modules and cannot be recovered.
              <br />
              <br />
              <strong>Note:</strong> To remove a lesson from a module without
              deleting it, use the remove (X) button in the module view.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteId) {
                  deleteMutation.mutate(deleteId);
                }
              }}
              disabled={deleteMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash className="w-4 h-4 mr-2" />
                  Permanently Delete
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add Existing Lesson Dialog */}
      <Dialog
        open={addExistingLessonOpen}
        onOpenChange={(open) => {
          setAddExistingLessonOpen(open);
          if (!open) {
            setSelectedLessonsToAdd(new Set());
            setTargetModuleForExisting("");
          }
        }}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <Layers className="w-6 h-6 text-green-600" />
              Add Existing Lessons to Module
            </DialogTitle>
            <DialogDescription>
              Select lessons from "All Lessons" to add to this module. You can
              select multiple lessons at once.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto">
            {lessons.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="w-16 h-16 text-slate-300 mb-4" />
                <h3 className="text-lg font-semibold text-slate-700 mb-2">
                  No Lessons Available
                </h3>
                <p className="text-slate-500 text-sm max-w-md">
                  No lessons found in this course. Create new lessons first.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between mb-4 pb-2 border-b">
                  <p className="text-sm text-slate-600">
                    {selectedLessonsToAdd.size} lesson
                    {selectedLessonsToAdd.size !== 1 ? "s" : ""} selected
                  </p>
                  {selectedLessonsToAdd.size > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedLessonsToAdd(new Set())}
                      className="text-slate-600 hover:text-primary"
                    >
                      Clear Selection
                    </Button>
                  )}
                </div>

                {lessons.map((lesson) => {
                  const isSelected = selectedLessonsToAdd.has(lesson.id);
                  const isAlreadyInModule =
                    lesson.moduleId === targetModuleForExisting;
                  return (
                    <div
                      key={lesson.id}
                      onClick={() => {
                        const newSet = new Set(selectedLessonsToAdd);
                        if (isSelected) {
                          newSet.delete(lesson.id);
                        } else {
                          newSet.add(lesson.id);
                        }
                        setSelectedLessonsToAdd(newSet);
                      }}
                      className={`p-4 rounded-lg border-2 transition-all cursor-pointer relative ${
                        isSelected
                          ? "border-primary bg-primary/5 shadow-md"
                          : isAlreadyInModule
                          ? "border-blue-200 bg-blue-50/50"
                          : "border-slate-200 hover:border-primary/50 hover:bg-slate-50"
                      }`}
                    >
                      {isAlreadyInModule && (
                        <div className="absolute top-2 right-2">
                          <Badge
                            variant="outline"
                            className="bg-blue-100 text-blue-700 text-xs"
                          >
                            Already in module
                          </Badge>
                        </div>
                      )}
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                            isSelected
                              ? "bg-primary border-primary"
                              : "border-slate-300"
                          }`}
                        >
                          {isSelected && (
                            <CheckCircle className="w-4 h-4 text-white" />
                          )}
                        </div>
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            isSelected ? "bg-primary/20" : "bg-slate-100"
                          }`}
                        >
                          {getLessonIcon(lesson.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-slate-800 truncate">
                            {lesson.title}
                          </h4>
                          <div className="flex items-center gap-3 text-xs text-slate-600 mt-1">
                            <span className="flex items-center gap-1 capitalize">
                              {lesson.type}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {lesson.durationDisplay}
                            </span>
                            <span className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              {lesson.views} views
                            </span>
                            {lesson.moduleTitle && (
                              <span className="flex items-center gap-1 text-blue-600">
                                <Folder className="w-3 h-3" />
                                {lesson.moduleTitle}
                              </span>
                            )}
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className={
                            lesson.status === LessonStatus.PUBLISHED
                              ? "bg-green-50 text-green-700"
                              : "bg-orange-50 text-orange-700"
                          }
                        >
                          {lesson.status}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex-shrink-0 flex justify-end gap-3 pt-4 border-t mt-4">
            <Button
              variant="outline"
              onClick={() => setAddExistingLessonOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={async () => {
                if (selectedLessonsToAdd.size === 0) {
                  push({
                    type: "error",
                    message: "Please select at least one lesson",
                  });
                  return;
                }

                try {
                  // Update each selected lesson to add to the target module
                  const updatePromises = Array.from(selectedLessonsToAdd).map(
                    (lessonId) =>
                      updateMutation.mutateAsync({
                        lessonId,
                        payload: { moduleId: targetModuleForExisting },
                      })
                  );

                  await Promise.all(updatePromises);

                  push({
                    type: "success",
                    message: `${selectedLessonsToAdd.size} lesson${
                      selectedLessonsToAdd.size !== 1 ? "s" : ""
                    } added to module`,
                  });

                  setAddExistingLessonOpen(false);
                  setSelectedLessonsToAdd(new Set());
                  setTargetModuleForExisting("");
                } catch (error) {
                  push({
                    type: "error",
                    message: "Failed to add lessons to module",
                  });
                }
              }}
              disabled={
                selectedLessonsToAdd.size === 0 || updateMutation.isPending
              }
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Add{" "}
                  {selectedLessonsToAdd.size > 0
                    ? `${selectedLessonsToAdd.size} `
                    : ""}
                  Lesson{selectedLessonsToAdd.size !== 1 ? "s" : ""}
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
