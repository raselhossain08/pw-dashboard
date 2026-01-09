"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/context/ToastContext";
import { useLessons } from "@/hooks/useLessons";
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
import LessonLoadingSkeleton from "./LessonLoadingSkeleton";
import LessonEmptyState from "./LessonEmptyState";
import LessonStats from "./LessonStats";
import { MediaLibrarySelector } from "@/components/cms/MediaLibrarySelector";
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
  Power,
  PowerOff,
  CheckSquare,
  Copy,
  Play,
  Pause,
  Info,
  RefreshCw,
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
  description?: string;
  content?: string;
};

export default function Lessons() {
  const queryClient = useQueryClient();
  const { push } = useToast();
  const {
    createLesson: createLessonHook,
    updateLesson: updateLessonHook,
    deleteLesson: deleteLessonHook,
    toggleLessonStatus,
    duplicateLesson: duplicateLessonHook,
    bulkDeleteLessons,
    bulkToggleStatus,
    getLessonAnalytics,
    reorderLessons: reorderLessonsHook,
    refreshLessons,
    analyticsLoading,
    analytics,
  } = useLessons();
  const [selectedCourseId, setSelectedCourseId] = React.useState<string>("");
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [bulkDeleteOpen, setBulkDeleteOpen] = React.useState(false);
  const [actionLoading, setActionLoading] = React.useState(false);
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
  const [mediaLibraryOpen, setMediaLibraryOpen] = React.useState(false);
  const [mediaLibraryContext, setMediaLibraryContext] = React.useState<
    "create" | "edit"
  >("create");
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
  const [editModuleOpen, setEditModuleOpen] = React.useState(false);
  const [editModuleData, setEditModuleData] = React.useState<any>(null);
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
  // Form state for create lesson to persist across tab switches
  const [createFormData, setCreateFormData] = React.useState({
    title: "",
    description: "",
    content: "",
    duration: "0",
    type: LessonType.VIDEO,
    isFree: false,
  });

  // Optimized handlers using useCallback to prevent re-renders
  const handleCreateFormChange = React.useCallback(
    (field: keyof typeof createFormData, value: any) => {
      setCreateFormData((prev) => ({ ...prev, [field]: value }));
    },
    []
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

  const ResponsivePlayer = React.memo(function ResponsivePlayer({
    url,
    poster,
    className,
    onVideoDuration,
    autoPlay,
  }: {
    url: string;
    poster?: string;
    className?: string;
    onVideoDuration?: (seconds: number) => void;
    autoPlay?: boolean;
  }) {
    const RP: any = ReactPlayer;
    const playerRef = React.useRef<any>(null);
    const [playerReady, setPlayerReady] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    if (!url) {
      
      return (
        <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
          <p className="text-gray-500">No video URL provided</p>
        </div>
      );
    }

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
      // Don't pass onDuration to VideoPlayer - use onLoaded instead
      return (
        <VideoPlayer
          src={url}
          poster={poster}
          className={className}
          onLoaded={(d) => {
            if (onVideoDuration) onVideoDuration(d);
          }}
        />
      );
    }


    // For h-64 class, convert to aspect ratio
    const containerClass = className?.includes("h-64")
      ? "h-64"
      : className || "aspect-video";

    return (
      <div
        className={`relative w-full ${containerClass} bg-black rounded-lg overflow-hidden`}
      >
        <RP
          ref={playerRef}
          url={url}
          controls={true}
          width="100%"
          height="100%"
          playing={autoPlay}
          pip={false}
          stopOnUnmount={false}
          light={poster}
          onReady={() => {
            setPlayerReady(true);
          }}
          onError={(e: any) => {
            console.error("❌ ReactPlayer error:", e);
            setError("Failed to load video");
          }}
          onDuration={(d: number) => {

            if (onVideoDuration) onVideoDuration(d);
          }}
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
        />
        {!playerReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80">
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="text-white text-sm">Loading video...</p>
            </div>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80">
            <div className="text-center">
              <p className="text-red-500 mb-2">{error}</p>
              <p className="text-white text-sm">Please check the video URL</p>
            </div>
          </div>
        )}
      </div>
    );
  });

  // Fetch courses
  const {
    data: coursesData,
    isLoading: coursesLoading,
    error: coursesError,
  } = useQuery({
    queryKey: ["courses", { page: 1, limit: 100 }],
    queryFn: async () => {
      try {
        const result = await coursesService.getAllCourses({
          page: 1,
          limit: 100,
        });
        return result;
      } catch (error) {
        console.error("❌ Error fetching courses:", error);
        throw error;
      }
    },
  });

  React.useEffect(() => {
    console.log("📊 Courses Data State:");
    console.log("  - Courses Loading:", coursesLoading);
    console.log("  - Courses Data:", coursesData);
    console.log("  - Courses Error:", coursesError);
  }, [coursesData, coursesLoading, coursesError]);

  const courseList: any[] = React.useMemo(() => {
    const raw: any = coursesData as any;
    let courses = [];

    // Handle different response formats
    if (Array.isArray(raw)) {
      courses = raw;
    } else if (raw?.data?.courses && Array.isArray(raw.data.courses)) {
      courses = raw.data.courses; // { success: true, data: { courses: [] } }
    } else if (Array.isArray(raw?.courses)) {
      courses = raw.courses; // { courses: [] }
    } else if (Array.isArray(raw?.data)) {
      courses = raw.data; // { data: [] }
    }

    console.log("📚 Courses loaded:", courses.length, "courses");
    if (courses.length === 0) {
      console.warn("⚠️ No courses found! Raw data:", raw);
    } else {
      console.log("📋 First course:", courses[0]);
    }
    return courses;
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
      const firstCourseId = courseList[0]._id;
      console.log(
        "🎯 Auto-selecting first course:",
        firstCourseId,
        courseList[0].title
      );
      setSelectedCourseId(firstCourseId);
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
    status: queryStatus,
  } = useQuery({
    queryKey: ["lessons", selectedCourseId],
    queryFn: async () => {
      if (!selectedCourseId) {
        console.log("⚠️ No course selected, returning empty array");
        return [];
      }
      console.log("🔍 Fetching lessons for course:", selectedCourseId);
      try {
        const result = await lessonsService.getCourseLessons(selectedCourseId);
        console.log("✅ Lessons fetched successfully:", result);
        return result;
      } catch (error) {
        console.error("❌ Error fetching lessons:", error);
        throw error;
      }
    },
    enabled: !!selectedCourseId,
    retry: 1,
    staleTime: 30000, // 30 seconds
  });

  // Debug logging for query state
  React.useEffect(() => {
    console.log("🔍 Query Debug Info:");
    console.log("  - Selected Course ID:", selectedCourseId);
    console.log("  - Query Status:", queryStatus);
    console.log("  - Is Loading:", lessonsLoading);
    console.log("  - Is Fetching:", lessonsFetching);
    console.log("  - Lessons Data:", lessonsData);
    console.log("  - Error:", lessonsError);
    console.log("  - Query Enabled:", !!selectedCourseId);
  }, [
    selectedCourseId,
    queryStatus,
    lessonsLoading,
    lessonsFetching,
    lessonsData,
    lessonsError,
  ]);

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
    console.log("📊 Processing lessons data:", lessonsData);

    if (!lessonsData) {
      console.log("⚠️ No lessons data available");
      return [];
    }

    const raw: any = lessonsData as any;
    let arr: any[] = [];

    // Handle different response formats
    if (Array.isArray(raw)) {
      arr = raw;
      console.log("✓ Direct array format:", arr.length, "lessons");
    } else if (Array.isArray(raw?.data)) {
      arr = raw.data;
      console.log("✓ Nested data format:", arr.length, "lessons");
    } else if (raw?.data?.lessons && Array.isArray(raw.data.lessons)) {
      arr = raw.data.lessons;
      console.log("✓ Deep nested format:", arr.length, "lessons");
    } else if (raw?.lessons && Array.isArray(raw.lessons)) {
      arr = raw.lessons;
      console.log("✓ Lessons property format:", arr.length, "lessons");
    } else {
      console.warn("⚠️ Unknown data format:", raw);
      return [];
    }

    const mapped = arr.map((l: any, idx: number) => ({
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
      description: l.description || "",
      content: l.content || "",
    }));

    console.log("✅ Processed lessons:", mapped.length, "items");
    return mapped;
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
    const textCount = lessons.filter((l) => l.type === LessonType.TEXT).length;
    const quizCount = lessons.filter((l) => l.type === LessonType.QUIZ).length;
    const assignmentCount = lessons.filter(
      (l) => l.type === LessonType.ASSIGNMENT
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
    const totalViews = lessons.reduce((sum, l) => sum + (l.views || 0), 0);
    return {
      total,
      videoCount,
      textCount,
      quizCount,
      assignmentCount,
      avgDuration,
      avgCompletion,
      totalViews,
    };
  }, [lessons]);

  // Debug effect for selectedCourseId
  React.useEffect(() => {
    console.log("📍 Selected Course ID changed:", selectedCourseId);
    console.log("📊 Current lessons count:", lessons.length);
    console.log("⏳ Loading state:", lessonsLoading);
    console.log("❌ Error state:", lessonsError);
  }, [selectedCourseId, lessons.length, lessonsLoading, lessonsError]);

  // Debug effect for video preview
  React.useEffect(() => {
    console.log("🎬 Video Preview State Changed:");
    console.log("  - videoPreview:", videoPreview);
    console.log("  - videoFile:", videoFile);
    console.log("  - thumbnailPreview:", thumbnailPreview);
    console.log("  - thumbnailFile:", thumbnailFile);
  }, [videoPreview, videoFile, thumbnailPreview, thumbnailFile]);

  // Reorder handler
  const handleReorderLessons = async (
    courseId: string,
    lessonIds: string[],
    moduleId?: string
  ) => {
    setActionLoading(true);
    try {
      await reorderLessonsHook(courseId, lessonIds, moduleId);
      queryClient.invalidateQueries({
        queryKey: ["lessons", selectedCourseId],
      });
      await refreshLessons(courseId);
    } catch (error) {
      console.error("Failed to reorder lessons:", error);
    } finally {
      setActionLoading(false);
    }
  };

  // Create lesson handler
  const handleCreateLesson = async (
    courseId: string,
    payload: CreateLessonPayload
  ) => {
    setActionLoading(true);
    try {
      await createLessonHook(courseId, payload);
      queryClient.invalidateQueries({
        queryKey: ["lessons", selectedCourseId],
      });
      setCreateOpen(false);
      // Reset form
      setVideoPreview(null);
      setVideoFile(null);
      setThumbnailPreview(null);
      setThumbnailFile(null);
      setAutoDurationSeconds(null);
    } catch (error) {
      console.error("Failed to create lesson:", error);
    } finally {
      setActionLoading(false);
    }
  };

  // Update lesson handler
  const handleUpdateLesson = async (
    lessonId: string,
    payload: UpdateLessonPayload
  ) => {
    setActionLoading(true);
    try {
      await updateLessonHook(lessonId, payload);
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
      // Reset form
      setVideoPreview(null);
      setVideoFile(null);
      setThumbnailPreview(null);
      setThumbnailFile(null);
      setAutoDurationSeconds(null);
    } catch (error) {
      console.error("Failed to update lesson:", error);
      // Clear drag state on error too
      setDraggedId(null);
      setDragOverId(null);
      setDragOverModuleId(null);
    } finally {
      setActionLoading(false);
    }
  };

  // Delete lesson handler
  const handleDeleteLesson = async (lessonId: string) => {
    setActionLoading(true);
    try {
      await deleteLessonHook(lessonId);
      queryClient.invalidateQueries({
        queryKey: ["lessons", selectedCourseId],
      });
      queryClient.invalidateQueries({
        queryKey: ["course-modules"],
      });
      if (selectedCourseId) {
        await refreshLessons(selectedCourseId);
      }
      setDeleteId(null);
    } catch (error) {
      console.error("Failed to delete lesson:", error);
    } finally {
      setActionLoading(false);
    }
  };

  // Helper functions for bulk operations
  const toggleSelection = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filtered.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map((l) => l.id));
    }
  };

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
      handleReorderLessons(selectedCourseId, ids, moduleId);
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
    handleUpdateLesson(draggedId, { moduleId });

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
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-3 sm:p-6">
      <div className="container px-4 mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary mb-2">
                Lesson Management
              </h2>
              <p className="text-gray-600 text-sm sm:text-base lg:text-lg">
                Create, organize, and manage your course content
              </p>
            </div>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              <div className="flex bg-white rounded-lg border border-gray-200 p-1">
                <Button
                  variant={viewMode === "module" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("module")}
                  className="text-xs sm:text-sm"
                >
                  <Folder className="w-3 h-3 sm:w-4 sm:h-4 mr-1" /> Modules
                </Button>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-gray-300 hover:bg-gray-50 transition-all text-xs sm:text-sm"
                  >
                    <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Export</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onSelect={async () => {
                      try {
                        const blob = await lessonsService.exportLessons("csv", {
                          courseId: selectedCourseId,
                          moduleId:
                            filterModuleId !== "all"
                              ? filterModuleId
                              : undefined,
                        });
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = `lessons.csv`;
                        document.body.appendChild(a);
                        a.click();
                        window.URL.revokeObjectURL(url);
                        document.body.removeChild(a);
                        push({
                          type: "success",
                          message: "Lessons exported as CSV",
                        });
                      } catch (error: any) {
                        push({
                          type: "error",
                          message: error?.message || "Failed to export lessons",
                        });
                      }
                    }}
                  >
                    Export as CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={async () => {
                      try {
                        const blob = await lessonsService.exportLessons(
                          "xlsx",
                          {
                            courseId: selectedCourseId,
                            moduleId:
                              filterModuleId !== "all"
                                ? filterModuleId
                                : undefined,
                          }
                        );
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = `lessons.xlsx`;
                        document.body.appendChild(a);
                        a.click();
                        window.URL.revokeObjectURL(url);
                        document.body.removeChild(a);
                        push({
                          type: "success",
                          message: "Lessons exported as Excel",
                        });
                      } catch (error: any) {
                        push({
                          type: "error",
                          message: error?.message || "Failed to export lessons",
                        });
                      }
                    }}
                  >
                    Export as Excel
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={async () => {
                      try {
                        const blob = await lessonsService.exportLessons("pdf", {
                          courseId: selectedCourseId,
                          moduleId:
                            filterModuleId !== "all"
                              ? filterModuleId
                              : undefined,
                        });
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = `lessons.pdf`;
                        document.body.appendChild(a);
                        a.click();
                        window.URL.revokeObjectURL(url);
                        document.body.removeChild(a);
                        push({
                          type: "success",
                          message: "Lessons exported as PDF",
                        });
                      } catch (error: any) {
                        push({
                          type: "error",
                          message: error?.message || "Failed to export lessons",
                        });
                      }
                    }}
                  >
                    Export as PDF
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                onClick={() => {
                  setCreatePreset(null);
                  setCreateOpen(true);
                }}
                size="sm"
                className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg transition-all hover:shadow-xl text-xs sm:text-sm"
              >
                <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Create</span>
                <span className="sm:hidden">New</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-xl p-4 shadow-md border border-gray-200 mb-6 animate-slide-up">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
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
            {filtered.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (selectedIds.length === filtered.length) {
                    setSelectedIds([]);
                  } else {
                    setSelectedIds(filtered.map((l) => l.id));
                  }
                }}
                className="text-slate-600"
              >
                {selectedIds.length === filtered.length
                  ? "Deselect All"
                  : "Select All"}
              </Button>
            )}
          </div>
        </div>

        {/* Loading State */}
        {lessonsLoading && !lessons.length && <LessonLoadingSkeleton />}

        {/* Error State */}
        {lessonsError && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 mb-6 animate-slide-up">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-red-900 mb-2">
                  Error Loading Lessons
                </h3>
                <p className="text-red-700 mb-4">
                  {(lessonsError as any)?.response?.data?.message ||
                    (lessonsError as any)?.message ||
                    "Failed to load lessons. Please try again."}
                </p>
                <div className="bg-red-100 border border-red-300 rounded-lg p-3 mb-4">
                  <p className="text-sm text-red-800 font-mono">
                    <strong>Status Code:</strong>{" "}
                    {(lessonsError as any)?.response?.status || "Unknown"}
                  </p>
                  {(lessonsError as any)?.response?.data && (
                    <p className="text-sm text-red-800 font-mono mt-1">
                      <strong>Error Details:</strong>{" "}
                      {JSON.stringify((lessonsError as any).response.data)}
                    </p>
                  )}
                  <p className="text-sm text-red-800 mt-2">
                    <strong>Selected Course ID:</strong>{" "}
                    {selectedCourseId || "None"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      if (selectedCourseId) {
                        queryClient.invalidateQueries({
                          queryKey: ["lessons", selectedCourseId],
                        });
                      }
                    }}
                    variant="outline"
                    className="border-red-300 text-red-700 hover:bg-red-100"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Retry
                  </Button>
                  <Button
                    onClick={() => {
                      console.log("🔍 Debug Info:");
                      console.log("  Selected Course:", selectedCourseId);
                      console.log("  Course List:", courseList);
                      console.log("  Error:", lessonsError);
                      console.log("  Query Status:", queryStatus);
                    }}
                    variant="outline"
                    className="border-red-300 text-red-700 hover:bg-red-50"
                  >
                    <Info className="w-4 h-4 mr-2" />
                    Debug (Console)
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empty State - No Course Selected */}
        {!lessonsLoading && !selectedCourseId && (
          <LessonEmptyState
            title="Select a Course"
            description="Please select a course from the filters above to view and manage its lessons"
            showQuickActions={false}
          />
        )}

        {/* Empty State - No Lessons */}
        {!lessonsLoading &&
          selectedCourseId &&
          lessons.length === 0 &&
          !lessonsError && (
            <LessonEmptyState
              title="No lessons in this course"
              description="Start creating engaging content for your students"
              onCreateLesson={() => setCreateOpen(true)}
            />
          )}

        {/* Empty State - No Filtered Results */}
        {!lessonsLoading &&
          lessons.length > 0 &&
          filtered.length === 0 &&
          !lessonsError && (
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-8 text-center mb-6 animate-slide-up">
              <Search className="w-16 h-16 text-yellow-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-yellow-900 mb-2">
                No matching lessons found
              </h3>
              <p className="text-yellow-700 mb-4">
                Try adjusting your filters or search terms
              </p>
              <Button
                onClick={() => {
                  setSearch("");
                  setTypeFilter("all");
                  setStatusFilter("all");
                  setFilterModuleId("all");
                }}
                variant="outline"
                className="border-yellow-300 text-yellow-700 hover:bg-yellow-100"
              >
                Clear Filters
              </Button>
            </div>
          )}

        {/* Statistics Cards */}
        {!lessonsLoading && lessons.length > 0 && (
          <>
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
                      {((stats.videoCount / stats.total) * 100 || 0).toFixed(0)}
                      %
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

            {/* Secondary Statistics Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div
                className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer animate-slide-up"
                style={{ animationDelay: "0.5s" }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Text Lessons</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.textCount}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div
                className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer animate-slide-up"
                style={{ animationDelay: "0.6s" }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Quizzes</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.quizCount}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-violet-100 rounded-lg flex items-center justify-center">
                    <CircleHelp className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div>

              <div
                className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer animate-slide-up"
                style={{ animationDelay: "0.7s" }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Assignments</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.assignmentCount}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-amber-100 rounded-lg flex items-center justify-center">
                    <ListTodo className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </div>

              <div
                className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer animate-slide-up"
                style={{ animationDelay: "0.8s" }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Views</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.totalViews}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg flex items-center justify-center">
                    <Eye className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div
              className="bg-white rounded-xl p-3 sm:p-4 shadow-md border border-gray-100 mb-6 animate-slide-up"
              style={{ animationDelay: "0.5s" }}
            >
              <div className="flex flex-col space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2 sm:gap-3">
                  <Select
                    value={selectedCourseId}
                    onValueChange={setSelectedCourseId}
                  >
                    <SelectTrigger className="bg-gray-50 border border-gray-200 rounded-lg px-3 sm:px-4 py-2 text-xs sm:text-sm hover:bg-gray-100 transition-all">
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
                    <SelectTrigger className="bg-gray-50 border border-gray-200 rounded-lg px-3 sm:px-4 py-2 text-xs sm:text-sm hover:bg-gray-100 transition-all">
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
                    <SelectTrigger className="bg-gray-50 border border-gray-200 rounded-lg px-3 sm:px-4 py-2 text-xs sm:text-sm hover:bg-gray-100 transition-all">
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
                    <SelectTrigger className="bg-gray-50 border border-gray-200 rounded-lg px-3 sm:px-4 py-2 text-xs sm:text-sm hover:bg-gray-100 transition-all">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="position">Sort: Position</SelectItem>
                      <SelectItem value="newest">Sort: Newest</SelectItem>
                      <SelectItem value="duration">Sort: Duration</SelectItem>
                      <SelectItem value="completion">
                        Sort: Completion
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={filterModuleId}
                    onValueChange={setFilterModuleId}
                  >
                    <SelectTrigger className="bg-gray-50 border border-gray-200 rounded-lg px-3 sm:px-4 py-2 text-xs sm:text-sm hover:bg-gray-100 transition-all">
                      <SelectValue
                        placeholder={
                          modulesLoading ? "Loading..." : "All Modules"
                        }
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

            {/* Content Sections - Only show when we have lessons */}
            {!lessonsLoading && lessons.length > 0 && filtered.length > 0 && (
              <>
                {/* All Lessons Section */}
                <div className=" grid grid-cols-12 gap-8">
                  <div className="col-span-4">
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
                          All created lessons from the selected course. Drag any
                          lesson to a module below to organize your content.
                        </p>
                        <div className="grid grid-cols-1  gap-4">
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
                                  e.dataTransfer.setData(
                                    "text/plain",
                                    lesson.id
                                  );
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
                                      <div className="flex items-center gap-2 flex-1 min-w-0">
                                        <input
                                          type="checkbox"
                                          checked={selectedIds.includes(
                                            lesson.id
                                          )}
                                          onChange={(e) => {
                                            e.stopPropagation();
                                            if (e.target.checked) {
                                              setSelectedIds((prev) => [
                                                ...prev,
                                                lesson.id,
                                              ]);
                                            } else {
                                              setSelectedIds((prev) =>
                                                prev.filter(
                                                  (id) => id !== lesson.id
                                                )
                                              );
                                            }
                                          }}
                                          onClick={(e) => e.stopPropagation()}
                                          className="w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary"
                                        />
                                        <h4
                                          className="font-semibold text-gray-800 truncate group-hover:text-primary transition-colors cursor-pointer flex-1"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setPreviewLesson(lesson);
                                          }}
                                        >
                                          {lesson.title}
                                        </h4>
                                      </div>
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
                                          <DropdownMenuItem
                                            onClick={async (e) => {
                                              e.stopPropagation();
                                              setActionLoading(true);
                                              try {
                                                await getLessonAnalytics(
                                                  lesson.id
                                                );
                                                setAnalyticsLesson(lesson);
                                              } catch (error) {
                                                console.error(
                                                  "Failed to load analytics:",
                                                  error
                                                );
                                              } finally {
                                                setActionLoading(false);
                                              }
                                            }}
                                          >
                                            <ChartLine className="w-4 h-4 mr-2" />
                                            Analytics
                                          </DropdownMenuItem>
                                          <DropdownMenuSeparator />
                                          <DropdownMenuItem
                                            onClick={async (e) => {
                                              e.stopPropagation();
                                              setActionLoading(true);
                                              try {
                                                await duplicateLessonHook(
                                                  lesson.id
                                                );
                                                queryClient.invalidateQueries({
                                                  queryKey: [
                                                    "lessons",
                                                    selectedCourseId,
                                                  ],
                                                });
                                              } catch (error) {
                                                console.error(
                                                  "Failed to duplicate lesson:",
                                                  error
                                                );
                                              } finally {
                                                setActionLoading(false);
                                              }
                                            }}
                                          >
                                            <Copy className="w-4 h-4 mr-2" />
                                            Duplicate
                                          </DropdownMenuItem>
                                          <DropdownMenuItem
                                            onClick={async (e) => {
                                              e.stopPropagation();
                                              setActionLoading(true);
                                              try {
                                                await toggleLessonStatus(
                                                  lesson.id
                                                );
                                                queryClient.invalidateQueries({
                                                  queryKey: [
                                                    "lessons",
                                                    selectedCourseId,
                                                  ],
                                                });
                                              } catch (error) {
                                                console.error(
                                                  "Failed to toggle status:",
                                                  error
                                                );
                                              } finally {
                                                setActionLoading(false);
                                              }
                                            }}
                                          >
                                            {lesson.status ===
                                            LessonStatus.PUBLISHED ? (
                                              <>
                                                <PowerOff className="w-4 h-4 mr-2 text-amber-600" />
                                                Unpublish
                                              </>
                                            ) : (
                                              <>
                                                <Power className="w-4 h-4 mr-2 text-green-600" />
                                                Publish
                                              </>
                                            )}
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
                                        <span className="capitalize">
                                          {lesson.type}
                                        </span>
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
                                          lesson.status ===
                                          LessonStatus.PUBLISHED
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
                  </div>
                  <div className="col-span-8">
                    <div className="space-y-3 mb-8">
                      {moduleList.map((module: any) => {
                        const moduleId = module._id || module.id;
                        const moduleLessons =
                          lessonsByModule.get(moduleId) || [];

                        const isModuleExpanded = expandedModules.has(moduleId);
                        const moduleTitle = module.title || "Untitled Module";
                        const moduleStatus = module.status || "draft";
                        const moduleCourse =
                          module.course?.title ||
                          module.courses?.[0]?.title ||
                          "No Course";

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
                                    <DropdownMenuContent
                                      align="start"
                                      className="w-56"
                                    >
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
                                          setCreatePreset({
                                            type: LessonType.TEXT,
                                          });
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
                                          setCreatePreset({
                                            type: LessonType.QUIZ,
                                          });
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
                                          setCreatePreset({
                                            type: LessonType.ASSIGNMENT,
                                          });
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
                                        onClick={() => {
                                          setEditModuleData(module);
                                          setEditModuleOpen(true);
                                        }}
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
                                            <Eye className="w-4 h-4 mr-2" />{" "}
                                            View Module
                                          </DropdownMenuItem>
                                          <DropdownMenuItem
                                            onSelect={() => {
                                              window.location.href = `/modules/${moduleId}/analytics`;
                                            }}
                                          >
                                            <ChartLine className="w-4 h-4 mr-2" />{" "}
                                            Analytics
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
                                    const isBeingDragged =
                                      draggedId === lesson.id;
                                    const isDropTarget =
                                      dragOverId === lesson.id;
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
                                          if (
                                            draggedId &&
                                            draggedId !== lesson.id
                                          ) {
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
                                          pointerEvents: isBeingDragged
                                            ? "none"
                                            : "auto",
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
                                                    lesson.status ===
                                                    LessonStatus.PUBLISHED
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
                                              onClick={() =>
                                                setEditLesson(lesson)
                                              }
                                              className="h-7 px-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50"
                                            >
                                              <Pencil className="w-3.5 h-3.5" />
                                            </Button>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() =>
                                                setPreviewLesson(lesson)
                                              }
                                              className="h-7 px-2 text-slate-600 hover:text-green-600 hover:bg-green-50"
                                            >
                                              <Eye className="w-3.5 h-3.5" />
                                            </Button>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => {
                                                // Remove from module (unassign)
                                                handleUpdateLesson(lesson.id, {
                                                  moduleId: undefined,
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
                </div>
                {/* Close lessons content conditional */}
              </>
            )}

            {/* Close stats conditional */}
          </>
        )}

        {/* Dialogs and Modals */}

        {/* Create Lesson Dialog */}
        <Dialog
          open={createOpen}
          onOpenChange={(open) => {
            setCreateOpen(open);
            if (!open) {
              setVideoPreview(null);
              setVideoFile(null);
              setThumbnailPreview(null);
              setThumbnailFile(null);
              setAutoDurationSeconds(null);
              setSeoTags([]);
              setTagInput("");
              setCreateFormData({
                title: "",
                description: "",
                content: "",
                duration: "0",
                type: LessonType.VIDEO,
                isFree: false,
              });
            }
          }}
        >
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

                const title = createFormData.title;
                const description = createFormData.description;
                const type = createFormData.type;
                const durationInput = createFormData.duration;
                const durationMinutes =
                  Number(durationInput.replace(/[^0-9]/g, "")) || 0;
                let duration = durationMinutes * 60;
                if (autoDurationSeconds && autoDurationSeconds > 0) {
                  duration = autoDurationSeconds;
                }
                const content = createFormData.content;
                const videoUrl = videoPreview || "";
                const isFree = createFormData.isFree;
                const status = LessonStatus.PUBLISHED;
                const moduleId = selectedModuleId || "";

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
                    const result = await uploadService.uploadFile(
                      thumbnailFile,
                      {
                        type: "image",
                      }
                    );
                    finalThumbnail = result.url;
                  } catch (err) {
                    console.error("Thumbnail upload failed:", err);
                    // Don't fail the entire upload if thumbnail fails
                  }
                }

                payload.videoUrl = finalVideoUrl || undefined;
                payload.thumbnail = finalThumbnail || undefined;

                handleCreateLesson(selectedCourseId, payload);
              }}
              className="space-y-6"
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
                      SEO & Settings
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
                            value={createFormData.title}
                            onChange={(e) =>
                              handleCreateFormChange("title", e.target.value)
                            }
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
                            <Select
                              value={createFormData.type}
                              onValueChange={(value) => {
                                handleCreateFormChange(
                                  "type",
                                  value as LessonType
                                );
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

                          <div className="space-y-2">
                            <Label
                              htmlFor="duration"
                              className="flex items-center gap-2"
                            >
                              <Clock className="w-4 h-4 text-primary" />
                              Duration (minutes)
                            </Label>
                            <Input
                              id="duration"
                              name="duration"
                              type="number"
                              min="0"
                              value={createFormData.duration}
                              onChange={(e) =>
                                handleCreateFormChange(
                                  "duration",
                                  e.target.value
                                )
                              }
                              placeholder="Auto-detected from video"
                            />
                          </div>
                        </div>

                        <input
                          type="hidden"
                          name="status"
                          value={LessonStatus.PUBLISHED}
                        />

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
                            value={createFormData.description}
                            onChange={(e) =>
                              handleCreateFormChange(
                                "description",
                                e.target.value
                              )
                            }
                          />
                        </div>

                        <div className="flex items-center space-x-2 p-4 bg-muted/50 rounded-lg">
                          <Switch
                            id="isFree"
                            name="isFree"
                            checked={createFormData.isFree}
                            onCheckedChange={(checked) =>
                              handleCreateFormChange("isFree", checked)
                            }
                          />
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
                                console.log("📹 Video file selected:", file);

                                if (file) {
                                  console.log("📹 File details:", {
                                    name: file.name,
                                    type: file.type,
                                    size: file.size,
                                  });

                                  setVideoFile(file);
                                  const url = URL.createObjectURL(file);
                                  console.log("📹 Blob URL created:", url);
                                  setVideoPreview(url);
                                  setAutoDurationSeconds(null);

                                  // Auto-generate thumbnail
                                  try {
                                    console.log("📸 Extracting thumbnail...");
                                    const thumbnail =
                                      await extractVideoThumbnail(file);
                                    if (thumbnail) {
                                      console.log(
                                        "✅ Thumbnail extracted:",
                                        thumbnail
                                      );
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
                                          console.log(
                                            "✅ Thumbnail file created"
                                          );
                                        })
                                        .catch((err) => {
                                          console.error(
                                            "❌ Thumbnail fetch error:",
                                            err
                                          );
                                        });
                                    } else {
                                      console.warn("⚠️ No thumbnail extracted");
                                    }
                                  } catch (error) {
                                    console.error(
                                      "❌ Thumbnail extraction error:",
                                      error
                                    );
                                  }
                                }
                              }}
                            />
                            {videoPreview && (
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <Label className="text-sm font-medium flex items-center gap-2">
                                    <PlayCircle className="w-4 h-4 text-primary" />
                                    Video Preview
                                  </Label>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      setPreviewAutoplay(!previewAutoplay)
                                    }
                                  >
                                    {previewAutoplay ? (
                                      <>
                                        <Pause className="w-3 h-3 mr-1" />
                                        Auto-play Off
                                      </>
                                    ) : (
                                      <>
                                        <Play className="w-3 h-3 mr-1" />
                                        Auto-play On
                                      </>
                                    )}
                                  </Button>
                                </div>
                                <div className="relative border border-border rounded-lg overflow-hidden bg-muted">
                                  <ResponsivePlayer
                                    url={videoPreview}
                                    className="h-64"
                                    autoPlay={previewAutoplay}
                                    onVideoDuration={(d: number) => {
                                      setAutoDurationSeconds(d);
                                      handleCreateFormChange(
                                        "duration",
                                        String(Math.max(1, Math.ceil(d / 60)))
                                      );
                                    }}
                                  />
                                  {uploadProgress > 0 &&
                                    uploadProgress < 100 && (
                                      <>
                                        <div className="absolute bottom-0 left-0 right-0 bg-gray-800/80 h-3 z-50 backdrop-blur-sm">
                                          <div
                                            className="bg-gradient-to-r from-primary to-accent h-3 transition-all duration-300 ease-out relative overflow-hidden"
                                            style={{
                                              width: `${uploadProgress}%`,
                                            }}
                                          >
                                            <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                                          </div>
                                        </div>
                                        <div className="absolute bottom-5 right-3 bg-primary text-primary-foreground text-sm px-4 py-2 rounded-full font-bold shadow-2xl z-50 flex items-center gap-2 border-2 border-white/30">
                                          <Loader2 className="w-4 h-4 animate-spin" />
                                          <span>
                                            Uploading {uploadProgress}%
                                          </span>
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
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Info className="w-3 h-3" />
                                  Preview your video before creating the lesson
                                </p>
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
                            value={createFormData.content}
                            onChange={(e) =>
                              handleCreateFormChange("content", e.target.value)
                            }
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
                            <div className="space-y-3">
                              <div className="text-sm text-muted-foreground p-4 border-2 border-dashed rounded-lg text-center">
                                Thumbnail will be auto-generated from video or
                                you can manually select one
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setMediaLibraryContext("create");
                                  setMediaLibraryOpen(true);
                                }}
                                className="w-full"
                              >
                                <ImageIcon className="w-4 h-4 mr-2" />
                                Select from Library
                              </Button>
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
                  disabled={actionLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  disabled={actionLoading}
                >
                  {actionLoading ? (
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

                  try {
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
                    const status = String(
                      fd.get("status") || editLesson.status
                    );

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
                        const result = await uploadService.uploadFile(
                          videoFile,
                          {
                            type: "video",
                            onProgress: (p) => setUploadProgress(p.percentage),
                          }
                        );
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

                    await handleUpdateLesson(editLesson.id, payload);
                  } catch (error) {
                    console.error("Error updating lesson:", error);
                    push({
                      type: "error",
                      message:
                        error instanceof Error
                          ? error.message
                          : "Failed to update lesson",
                    });
                  }
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
                              defaultValue={editLesson.description}
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
                                      const thumb = await getVimeoThumbnail(
                                        url
                                      );
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
                                  console.log(
                                    "📹 Edit - Video file selected:",
                                    file
                                  );

                                  if (file) {
                                    console.log("📹 Edit - File details:", {
                                      name: file.name,
                                      type: file.type,
                                      size: file.size,
                                    });

                                    setVideoFile(file);
                                    const url = URL.createObjectURL(file);
                                    console.log(
                                      "📹 Edit - Blob URL created:",
                                      url
                                    );
                                    setVideoPreview(url);
                                    setAutoDurationSeconds(null);

                                    try {
                                      console.log(
                                        "📸 Edit - Extracting thumbnail..."
                                      );
                                      const thumbnail =
                                        await extractVideoThumbnail(file);
                                      if (thumbnail) {
                                        console.log(
                                          "✅ Edit - Thumbnail extracted:",
                                          thumbnail
                                        );
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
                                            console.log(
                                              "✅ Edit - Thumbnail file created"
                                            );
                                          })
                                          .catch((err) => {
                                            console.error(
                                              "❌ Edit - Thumbnail fetch error:",
                                              err
                                            );
                                          });
                                      } else {
                                        console.warn(
                                          "⚠️ Edit - No thumbnail extracted"
                                        );
                                      }
                                    } catch (error) {
                                      console.error(
                                        "❌ Edit - Thumbnail extraction error:",
                                        error
                                      );
                                    }
                                  }
                                }}
                              />
                              {videoPreview && (
                                <div className="relative border border-border rounded-lg overflow-hidden bg-muted">
                                  <ResponsivePlayer
                                    url={videoPreview}
                                    className="h-48"
                                    onVideoDuration={(d: number) => {
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
                                  {uploadProgress > 0 &&
                                    uploadProgress < 100 && (
                                      <>
                                        <div className="absolute bottom-0 left-0 right-0 bg-gray-800/80 h-3 z-50 backdrop-blur-sm">
                                          <div
                                            className="bg-gradient-to-r from-primary to-accent h-3 transition-all duration-300 ease-out relative overflow-hidden"
                                            style={{
                                              width: `${uploadProgress}%`,
                                            }}
                                          >
                                            <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                                          </div>
                                        </div>
                                        <div className="absolute bottom-5 right-3 bg-primary text-primary-foreground text-sm px-4 py-2 rounded-full font-bold shadow-2xl z-50 flex items-center gap-2 border-2 border-white/30">
                                          <Loader2 className="w-4 h-4 animate-spin" />
                                          <span>
                                            Uploading {uploadProgress}%
                                          </span>
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
                              defaultValue={editLesson.content}
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
                              <div className="space-y-3">
                                <div className="text-sm text-muted-foreground p-4 border-2 border-dashed rounded-lg text-center">
                                  Thumbnail will be auto-generated from video or
                                  you can manually select one
                                </div>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setMediaLibraryContext("edit");
                                    setMediaLibraryOpen(true);
                                  }}
                                  className="w-full"
                                >
                                  <ImageIcon className="w-4 h-4 mr-2" />
                                  Select from Library
                                </Button>
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
                            Configure additional lesson settings and metadata
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                              <Target className="w-4 h-4 text-primary" />
                              Lesson Order/Position
                            </Label>
                            <Input
                              type="number"
                              min="1"
                              defaultValue={editLesson.position}
                              placeholder="Lesson position in the course"
                              className="w-full"
                            />
                            <p className="text-xs text-muted-foreground">
                              Set the order in which this lesson appears in the
                              course
                            </p>
                          </div>

                          <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                              <Tag className="w-4 h-4 text-primary" />
                              Lesson Tags
                            </Label>
                            <Input
                              placeholder="Add tags separated by commas (e.g., beginner, important, theory)"
                              className="w-full"
                            />
                            <p className="text-xs text-muted-foreground">
                              Tags help organize and filter lessons
                            </p>
                          </div>

                          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-start gap-3">
                              <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-sm font-medium text-blue-900">
                                  Additional Metadata
                                </p>
                                <p className="text-xs text-blue-700 mt-1">
                                  More advanced settings and metadata options
                                  will be available here in future updates.
                                </p>
                              </div>
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
                    onClick={() => {
                      setEditLesson(null);
                      setVideoPreview(null);
                      setVideoFile(null);
                      setThumbnailPreview(null);
                      setThumbnailFile(null);
                      setAutoDurationSeconds(null);
                    }}
                    disabled={actionLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-primary text-white"
                    disabled={actionLoading}
                  >
                    {actionLoading ? (
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
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="text-base font-semibold flex items-center gap-2">
                            <PlayCircle className="w-5 h-5 text-primary" />
                            Video Preview
                          </Label>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => setPreviewAutoplay(!previewAutoplay)}
                          >
                            {previewAutoplay ? (
                              <>
                                <Pause className="w-3 h-3 mr-1" />
                                Auto-play Off
                              </>
                            ) : (
                              <>
                                <Play className="w-3 h-3 mr-1" />
                                Auto-play On
                              </>
                            )}
                          </Button>
                        </div>
                        <div className="relative border border-border rounded-lg overflow-hidden bg-muted">
                          <ResponsivePlayer
                            url={previewLesson.videoUrl}
                            poster={previewLesson.thumbnail}
                            className="h-96"
                            autoPlay={previewAutoplay}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Info className="w-3 h-3" />
                          Use the video controls to play, pause, and adjust
                          volume
                        </p>
                      </div>
                    )}
                  <div className="flex items-start space-x-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-secondary mb-2">
                        {previewLesson.title}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className="flex items-center space-x-1">
                          {getLessonIcon(previewLesson.type)}
                          <span className="capitalize">
                            {previewLesson.type}
                          </span>
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
                        <p className="text-sm text-gray-600 mb-1">
                          Completions
                        </p>
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
          <DialogContent className="min-w-[90vw] max-w-[90vw] w-[95vw] max-h-[95vh] overflow-hidden flex flex-col">
            <DialogHeader className="flex-shrink-0">
              <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                <CircleHelp className="w-6 h-6 text-purple-600" />
                Create Quiz
              </DialogTitle>
              <DialogDescription>
                Build an interactive quiz to test student knowledge
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
                <Tabs defaultValue="basic" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger
                      value="basic"
                      className="flex items-center gap-2"
                    >
                      <FileText className="w-4 h-4" />
                      Basic Info
                    </TabsTrigger>
                    <TabsTrigger
                      value="questions"
                      className="flex items-center gap-2"
                    >
                      <CircleHelp className="w-4 h-4" />
                      Questions ({quizForm.questions.length})
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="basic" className="space-y-4 mt-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Quiz Settings</CardTitle>
                        <CardDescription>
                          Configure basic quiz information and rules
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="md:col-span-2">
                            <Label
                              htmlFor="quiz-title"
                              className="flex items-center gap-2"
                            >
                              <FileText className="w-4 h-4 text-primary" />
                              Quiz Title *
                            </Label>
                            <Input
                              id="quiz-title"
                              className="mt-2"
                              placeholder="e.g., Module 1 Assessment"
                              value={quizForm.title}
                              onChange={(e) =>
                                setQuizForm({
                                  ...quizForm,
                                  title: e.target.value,
                                })
                              }
                              required
                            />
                          </div>
                          <div className="md:col-span-2">
                            <Label
                              htmlFor="quiz-description"
                              className="flex items-center gap-2"
                            >
                              <FileText className="w-4 h-4 text-primary" />
                              Description
                            </Label>
                            <Textarea
                              id="quiz-description"
                              className="mt-2"
                              rows={3}
                              placeholder="Brief description of what this quiz covers..."
                              value={quizForm.description}
                              onChange={(e) =>
                                setQuizForm({
                                  ...quizForm,
                                  description: e.target.value,
                                })
                              }
                            />
                          </div>
                          <div>
                            <Label
                              htmlFor="quiz-duration"
                              className="flex items-center gap-2"
                            >
                              <Clock className="w-4 h-4 text-primary" />
                              Duration (minutes)
                            </Label>
                            <Input
                              id="quiz-duration"
                              type="number"
                              min={1}
                              className="mt-2"
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
                            <Label
                              htmlFor="quiz-passing"
                              className="flex items-center gap-2"
                            >
                              <Target className="w-4 h-4 text-primary" />
                              Passing Score (%)
                            </Label>
                            <Input
                              id="quiz-passing"
                              type="number"
                              min={0}
                              max={100}
                              className="mt-2"
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
                            <Label
                              htmlFor="quiz-attempts"
                              className="flex items-center gap-2"
                            >
                              <CheckCircle className="w-4 h-4 text-primary" />
                              Attempts Allowed
                            </Label>
                            <Input
                              id="quiz-attempts"
                              type="number"
                              min={1}
                              className="mt-2"
                              value={quizForm.attemptsAllowed}
                              onChange={(e) =>
                                setQuizForm({
                                  ...quizForm,
                                  attemptsAllowed: Number(e.target.value),
                                })
                              }
                            />
                          </div>
                          <div className="flex flex-col gap-3">
                            <Label className="text-sm font-medium">
                              Quiz Options
                            </Label>
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <Switch
                                  id="shuffle-questions"
                                  checked={quizForm.shuffleQuestions}
                                  onCheckedChange={(checked) =>
                                    setQuizForm({
                                      ...quizForm,
                                      shuffleQuestions: checked,
                                    })
                                  }
                                />
                                <Label
                                  htmlFor="shuffle-questions"
                                  className="cursor-pointer"
                                >
                                  Shuffle Questions
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Switch
                                  id="show-answers"
                                  checked={quizForm.showCorrectAnswers}
                                  onCheckedChange={(checked) =>
                                    setQuizForm({
                                      ...quizForm,
                                      showCorrectAnswers: checked,
                                    })
                                  }
                                />
                                <Label
                                  htmlFor="show-answers"
                                  className="cursor-pointer"
                                >
                                  Show Correct Answers
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Switch
                                  id="allow-review"
                                  checked={quizForm.allowReview}
                                  onCheckedChange={(checked) =>
                                    setQuizForm({
                                      ...quizForm,
                                      allowReview: checked,
                                    })
                                  }
                                />
                                <Label
                                  htmlFor="allow-review"
                                  className="cursor-pointer"
                                >
                                  Allow Review After Submission
                                </Label>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="questions" className="space-y-4 mt-4">
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg">
                              Quiz Questions
                            </CardTitle>
                            <CardDescription>
                              Add and manage quiz questions
                            </CardDescription>
                          </div>
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
                            <Plus className="w-4 h-4 mr-2" />
                            Add Question
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {quizForm.questions.length === 0 ? (
                          <div className="text-center py-12 border-2 border-dashed rounded-lg">
                            <CircleHelp className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                            <p className="text-gray-600 mb-2">
                              No questions added yet
                            </p>
                            <p className="text-sm text-gray-500 mb-4">
                              Click "Add Question" to start building your quiz
                            </p>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() =>
                                setQuizForm({
                                  ...quizForm,
                                  questions: [
                                    {
                                      type: "multiple_choice",
                                      question: "",
                                      options: ["", "", "", ""],
                                      correctAnswer: "",
                                      points: 1,
                                      order: 1,
                                    },
                                  ],
                                })
                              }
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Add First Question
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {quizForm.questions.map((q, idx) => (
                              <Card
                                key={idx}
                                className="border-l-4 border-l-purple-500"
                              >
                                <CardHeader className="pb-3">
                                  <div className="flex items-start justify-between">
                                    <CardTitle className="text-base flex items-center gap-2">
                                      <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-sm font-semibold">
                                        Q{idx + 1}
                                      </span>
                                      Question {idx + 1}
                                    </CardTitle>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        const arr = quizForm.questions.filter(
                                          (_, i) => i !== idx
                                        );
                                        setQuizForm({
                                          ...quizForm,
                                          questions: arr,
                                        });
                                      }}
                                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                  <div>
                                    <Label className="text-sm font-medium mb-2 block">
                                      Question Text *
                                    </Label>
                                    <Textarea
                                      placeholder={`Enter question ${
                                        idx + 1
                                      }...`}
                                      value={q.question}
                                      onChange={(e) => {
                                        const arr = [...quizForm.questions];
                                        arr[idx] = {
                                          ...arr[idx],
                                          question: e.target.value,
                                        };
                                        setQuizForm({
                                          ...quizForm,
                                          questions: arr,
                                        });
                                      }}
                                      rows={2}
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium mb-2 block">
                                      Answer Options
                                    </Label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                      {(q.options || []).map((opt, i) => (
                                        <div
                                          key={i}
                                          className="flex items-center gap-2"
                                        >
                                          <span className="text-sm font-semibold text-gray-500 w-6">
                                            {String.fromCharCode(65 + i)}.
                                          </span>
                                          <Input
                                            placeholder={`Option ${String.fromCharCode(
                                              65 + i
                                            )}`}
                                            value={opt}
                                            onChange={(e) => {
                                              const arr = [
                                                ...quizForm.questions,
                                              ];
                                              const opts = [
                                                ...(arr[idx].options || []),
                                              ];
                                              opts[i] = e.target.value;
                                              arr[idx] = {
                                                ...arr[idx],
                                                options: opts,
                                              };
                                              setQuizForm({
                                                ...quizForm,
                                                questions: arr,
                                              });
                                            }}
                                          />
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium mb-2 block flex items-center gap-2">
                                      <CheckCircle className="w-4 h-4 text-green-600" />
                                      Correct Answer *
                                    </Label>
                                    <Input
                                      placeholder="Enter the correct answer exactly as shown in options"
                                      value={(q.correctAnswer as string) || ""}
                                      onChange={(e) => {
                                        const arr = [...quizForm.questions];
                                        arr[idx] = {
                                          ...arr[idx],
                                          correctAnswer: e.target.value,
                                        };
                                        setQuizForm({
                                          ...quizForm,
                                          questions: arr,
                                        });
                                      }}
                                      className="border-green-200 focus:border-green-500"
                                    />
                                  </div>
                                  <div className="flex items-center gap-4 pt-2">
                                    <div className="flex items-center gap-2">
                                      <Label className="text-sm">Points:</Label>
                                      <Input
                                        type="number"
                                        min={1}
                                        value={q.points}
                                        onChange={(e) => {
                                          const arr = [...quizForm.questions];
                                          arr[idx] = {
                                            ...arr[idx],
                                            points: Number(e.target.value),
                                          };
                                          setQuizForm({
                                            ...quizForm,
                                            questions: arr,
                                          });
                                        }}
                                        className="w-20"
                                      />
                                    </div>
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      Multiple Choice
                                    </Badge>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
              <DialogFooter className="flex-shrink-0 border-t pt-4 mt-4 gap-2">
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
          onOpenChange={(v) => {
            if (!v) {
              setAnalyticsLesson(null);
            }
          }}
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
                  {analyticsLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    </div>
                  ) : analytics ? (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-primary/10 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-primary font-medium">
                                Total Views
                              </p>
                              <p className="text-2xl font-bold text-primary mt-1">
                                {analytics.views || analyticsLesson.views}
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
                                {analytics.completions ||
                                  analyticsLesson.completionCount}
                              </p>
                            </div>
                            <CheckCircle className="w-8 h-8 text-green-500" />
                          </div>
                        </div>

                        <div className="bg-purple-50 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-purple-600 font-medium">
                                Avg. Progress
                              </p>
                              <p className="text-2xl font-bold text-purple-900 mt-1">
                                {analytics.averageProgress ||
                                  analyticsLesson.completion}
                                %
                              </p>
                            </div>
                            <Target className="w-8 h-8 text-purple-500" />
                          </div>
                        </div>

                        <div className="bg-orange-50 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-orange-600 font-medium">
                                Avg. Time Spent
                              </p>
                              <p className="text-2xl font-bold text-orange-900 mt-1">
                                {analytics.averageTimeSpent
                                  ? `${Math.floor(
                                      analytics.averageTimeSpent / 60
                                    )}m`
                                  : analyticsLesson.durationDisplay}
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
                            style={{
                              width: `${
                                analytics.averageProgress ||
                                analyticsLesson.completion
                              }%`,
                            }}
                          />
                        </div>
                        <p className="text-sm text-gray-600 mt-2 text-right">
                          {analytics.averageProgress ||
                            analyticsLesson.completion}
                          %
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-12 text-slate-500">
                      No analytics data available yet
                    </div>
                  )}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Bulk Actions */}
        {selectedIds.length > 0 && (
          <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckSquare className="w-5 h-5 text-primary" />
              <span className="font-semibold text-primary">
                {selectedIds.length} lesson{selectedIds.length > 1 ? "s" : ""}{" "}
                selected
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  setActionLoading(true);
                  try {
                    await bulkToggleStatus(selectedIds);
                    setSelectedIds([]);
                    queryClient.invalidateQueries({
                      queryKey: ["lessons", selectedCourseId],
                    });
                  } catch (error) {
                    console.error("Failed to toggle status:", error);
                  } finally {
                    setActionLoading(false);
                  }
                }}
                disabled={actionLoading}
              >
                <Power className="w-4 h-4 mr-2" />
                Toggle Status
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setBulkDeleteOpen(true)}
                disabled={actionLoading}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedIds([])}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Dialogs and Modals */}

        {/* Bulk Delete Confirmation */}
        <AlertDialog
          open={bulkDeleteOpen}
          onOpenChange={(v) => !v && setBulkDeleteOpen(false)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl font-bold">
                Delete {selectedIds.length} Lesson
                {selectedIds.length > 1 ? "s" : ""}?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-base">
                This will permanently delete the selected lesson
                {selectedIds.length > 1 ? "s" : ""} from the course. This action
                cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={async () => {
                  setActionLoading(true);
                  try {
                    await bulkDeleteLessons(selectedIds);
                    setBulkDeleteOpen(false);
                    setSelectedIds([]);
                    queryClient.invalidateQueries({
                      queryKey: ["lessons", selectedCourseId],
                    });
                  } catch (error) {
                    console.error("Failed to delete lessons:", error);
                  } finally {
                    setActionLoading(false);
                  }
                }}
                className="bg-red-600 hover:bg-red-700"
                disabled={actionLoading}
              >
                {actionLoading ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

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
              <AlertDialogCancel disabled={actionLoading}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (deleteId) {
                    handleDeleteLesson(deleteId);
                  }
                }}
                disabled={actionLoading}
                className="bg-red-600 hover:bg-red-700"
              >
                {actionLoading ? (
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
                        updateLessonHook(lessonId, {
                          moduleId: targetModuleForExisting,
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
                disabled={selectedLessonsToAdd.size === 0 || actionLoading}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {actionLoading ? (
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

        {/* Edit Module Dialog */}
        <Dialog open={editModuleOpen} onOpenChange={setEditModuleOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                <Folder className="w-6 h-6 text-primary" />
                Edit Module
              </DialogTitle>
              <DialogDescription>
                Update module details and settings
              </DialogDescription>
            </DialogHeader>
            {editModuleData && (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const fd = new FormData(e.currentTarget as HTMLFormElement);
                  const title = String(fd.get("title") || "");
                  const description = String(fd.get("description") || "");
                  const status = String(
                    fd.get("status") || "draft"
                  ) as LessonStatus;

                  setActionLoading(true);
                  try {
                    await modulesService.updateModule(
                      editModuleData._id || editModuleData.id,
                      {
                        title,
                        description,
                        status,
                      }
                    );

                    push({
                      type: "success",
                      message: "Module updated successfully!",
                    });

                    queryClient.invalidateQueries({
                      queryKey: ["course-modules"],
                    });
                    setEditModuleOpen(false);
                    setEditModuleData(null);
                  } catch (error: any) {
                    push({
                      type: "error",
                      message: error?.message || "Failed to update module",
                    });
                  } finally {
                    setActionLoading(false);
                  }
                }}
                className="space-y-6"
              >
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="module-title"
                      className="flex items-center gap-2"
                    >
                      <Folder className="w-4 h-4 text-primary" />
                      Module Title *
                    </Label>
                    <Input
                      id="module-title"
                      name="title"
                      defaultValue={editModuleData.title}
                      required
                      placeholder="e.g., Introduction to Aviation"
                      className="text-base"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="module-description"
                      className="flex items-center gap-2"
                    >
                      <FileText className="w-4 h-4 text-primary" />
                      Description
                    </Label>
                    <Textarea
                      id="module-description"
                      name="description"
                      defaultValue={editModuleData.description}
                      rows={4}
                      placeholder="Brief description of the module..."
                      className="resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="module-status"
                      className="flex items-center gap-2"
                    >
                      <Target className="w-4 h-4 text-primary" />
                      Status *
                    </Label>
                    <Select
                      name="status"
                      defaultValue={editModuleData.status || "draft"}
                    >
                      <SelectTrigger id="module-status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-amber-500" />
                            <span>Draft</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="published">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span>Published</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-blue-900">
                          Module Information
                        </p>
                        <p className="text-xs text-blue-700 mt-1">
                          This module contains{" "}
                          {editModuleData.lessons?.length || 0} lesson(s).
                          Changes will be applied immediately.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <DialogFooter className="gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEditModuleOpen(false)}
                    disabled={actionLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                    disabled={actionLoading}
                  >
                    {actionLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Update Module
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </form>
            )}
          </DialogContent>
        </Dialog>

        {/* Media Library Selector */}
        <MediaLibrarySelector
          open={mediaLibraryOpen}
          onOpenChange={setMediaLibraryOpen}
          onSelect={(url: string) => {
            setThumbnailPreview(url);
            setMediaLibraryOpen(false);
          }}
          title="Select Lesson Thumbnail"
        />
      </div>
    </main>
  );
}
