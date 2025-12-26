"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { useDebounce } from "@/hooks/useDebounce";
import {
  Search as SearchIcon,
  Grid2x2,
  List,
  Upload as UploadIcon,
  Image as ImageIcon,
  Video,
  File,
  HardDrive,
  Eye,
  Download,
  Trash,
  Plus,
  Edit,
  X,
  Check,
  Loader2,
  Cloud,
  CloudUpload,
  AlertCircle,
  FileText,
  Music,
  RefreshCw,
  Filter,
  CheckSquare,
  Square,
  MoreVertical,
  Copy,
  FileDown,
  EyeOff,
  Tag,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  uploadsService,
  type UploadFile as BaseUploadFile,
} from "@/services/uploads.service";
import { useToast } from "@/context/ToastContext";

// Extend UploadFile to include provider field
interface UploadFile extends BaseUploadFile {
  provider?: string;
}

// File type helpers
const getFileIcon = (mimeType: string) => {
  if (mimeType.startsWith("image/")) return <ImageIcon className="w-6 h-6" />;
  if (mimeType.startsWith("video/")) return <Video className="w-6 h-6" />;
  if (mimeType.startsWith("audio/")) return <Music className="w-6 h-6" />;
  if (mimeType.includes("pdf"))
    return <File className="w-6 h-6 text-red-500" />;
  return <FileText className="w-6 h-6" />;
};

// Generate video thumbnail URL (for Bunny.net)
const getVideoThumbnail = (url: string) => {
  // For Bunny.net iframe URLs: https://iframe.mediadelivery.net/embed/{libraryId}/{videoId}
  if (url.includes("iframe.mediadelivery.net/embed/")) {
    const match = url.match(/\/embed\/(\d+)\/([a-f0-9-]+)/);
    if (match) {
      const [, libraryId, videoId] = match;
      return `https://vz-${libraryId}.b-cdn.net/${videoId}/thumbnail.jpg`;
    }
  }
  return null;
};

const getProviderBadge = (provider?: string) => {
  if (provider === "bunny") {
    return (
      <Badge
        variant="outline"
        className="bg-orange-50 text-orange-600 border-orange-200"
      >
        <Cloud className="w-3 h-3 mr-1" /> Bunny.net
      </Badge>
    );
  }
  return (
    <Badge
      variant="outline"
      className="bg-blue-50 text-blue-600 border-blue-200"
    >
      <Cloud className="w-3 h-3 mr-1" /> Cloudinary
    </Badge>
  );
};

// Dynamically import ReactPlayer to avoid SSR issues
const ReactPlayer = dynamic(() => import("react-player"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] bg-gray-200 animate-pulse rounded-lg" />
  ),
}) as any;

export default function MediaLibrary() {
  const { push: showToast } = useToast();
  const queryClient = useQueryClient();

  // View state
  const [view, setView] = React.useState<"grid" | "list">("grid");
  const [search, setSearch] = React.useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [typeFilter, setTypeFilter] = React.useState<string>("all");
  const [sortBy, setSortBy] = React.useState("newest");
  const [page, setPage] = React.useState(1);
  const [limit] = React.useState(20);

  // Reset page when filters change
  React.useEffect(() => {
    setPage(1);
  }, [debouncedSearch, typeFilter, sortBy]);

  // Selection state
  const [selectedItems, setSelectedItems] = React.useState<
    Record<string, boolean>
  >({});
  const selectedCount = Object.values(selectedItems).filter(Boolean).length;

  // Dialog state
  const [uploadOpen, setUploadOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [previewOpen, setPreviewOpen] = React.useState(false);
  const [currentFile, setCurrentFile] = React.useState<UploadFile | null>(null);

  // Upload state
  const [uploadFiles, setUploadFiles] = React.useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = React.useState(0);
  const [dragActive, setDragActive] = React.useState(false);

  // Edit form state
  const [editForm, setEditForm] = React.useState({
    description: "",
    tags: "",
    visibility: "public",
  });

  // Fetch files
  const {
    data: filesData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["media-files", debouncedSearch, typeFilter, sortBy, page],
    queryFn: async () => {
      if (debouncedSearch) {
        const result = await uploadsService.searchFiles({
          q: debouncedSearch,
          type: typeFilter !== "all" ? typeFilter : undefined,
          sort: sortBy,
          page,
          limit,
        });
        console.log("🔍 Search Result:", result);
        // Search returns array, wrapping it to match structure
        return { files: result, total: result.length, page: 1, pages: 1 };
      }
      const result = await uploadsService.getUserFiles({
        page,
        limit,
        type: typeFilter !== "all" ? typeFilter : undefined,
        sort: sortBy,
      });
      console.log("📁 getUserFiles Result:", result);
      console.log("📁 Files Array:", result?.files);
      console.log("📁 Total:", result?.total);
      return result || { files: [], total: 0, page: 1, pages: 0 };
    },
  });

  // Fetch storage stats
  const {
    data: stats,
    isLoading: isStatsLoading,
    error: statsError,
  } = useQuery({
    queryKey: ["storage-stats"],
    queryFn: async () => {
      const result = await uploadsService.getStorageStats();
      console.log("📊 Storage Stats Response:", result);
      console.log("Total Files:", result?.total?.totalFiles);
      console.log("Total Size:", result?.total?.totalSize);
      console.log("By Type:", result?.byType);
      return result;
    },
  });

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (files: File[]) => {
      const results = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadProgress(Math.round(((i + 1) / files.length) * 100));
        const result = await uploadsService.uploadFile(file, {
          entityType: "media-library",
          description: `Uploaded file: ${file.name}`,
        });
        results.push(result);
      }
      return results;
    },
    onMutate: () => {
      showToast({ message: "Uploading files...", type: "info" });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["media-files"] });
      queryClient.invalidateQueries({ queryKey: ["storage-stats"] });
      showToast({
        message: `Successfully uploaded ${data.length} file(s)`,
        type: "success",
      });
      setUploadOpen(false);
      setUploadFiles([]);
      setUploadProgress(0);
    },
    onError: (error: any) => {
      showToast({
        message: error.response?.data?.message || "Upload failed",
        type: "error",
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: {
      id: string;
      description?: string;
      tags?: string[];
      visibility?: string;
    }) =>
      uploadsService.updateFile(data.id, {
        description: data.description,
        tags: data.tags,
        visibility: data.visibility,
      }),
    onMutate: () => {
      showToast({ message: "Updating file...", type: "info" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media-files"] });
      showToast({ message: "File updated successfully", type: "success" });
      setEditOpen(false);
      setCurrentFile(null);
    },
    onError: (error: any) => {
      showToast({
        message: error.response?.data?.message || "Update failed",
        type: "error",
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => uploadsService.deleteFile(id),
    onMutate: () => {
      showToast({ message: "Deleting file...", type: "info" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media-files"] });
      queryClient.invalidateQueries({ queryKey: ["storage-stats"] });
      showToast({ message: "File deleted successfully", type: "success" });
      setDeleteOpen(false);
      setCurrentFile(null);
    },
    onError: (error: any) => {
      showToast({
        message: error.response?.data?.message || "Delete failed",
        type: "error",
      });
    },
  });

  // Bulk delete mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: (fileIds: string[]) => uploadsService.bulkDeleteFiles(fileIds),
    onMutate: () => {
      showToast({ message: "Deleting selected files...", type: "info" });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["media-files"] });
      queryClient.invalidateQueries({ queryKey: ["storage-stats"] });
      showToast({
        message: `Deleted ${data.deleted} file(s)`,
        type: "success",
      });
      setSelectedItems({});
    },
    onError: (error: any) => {
      showToast({
        message: error.response?.data?.message || "Bulk delete failed",
        type: "error",
      });
    },
  });

  const files = Array.isArray(filesData) ? filesData : filesData?.files || [];
  console.log("📋 filesData:", filesData);
  console.log("📋 Extracted files:", files);
  console.log("📋 Files length:", files?.length);

  // Drag and drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const validateFile = (file: File) => {
    const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
    if (file.size > MAX_FILE_SIZE) {
      showToast({
        message: `File ${file.name} exceeds 50MB limit`,
        type: "error",
      });
      return false;
    }
    return true;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files).filter(validateFile);
    if (files.length > 0) {
      setUploadFiles((prev) => [...prev, ...files]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).filter(validateFile);
      if (files.length > 0) {
        setUploadFiles((prev) => [...prev, ...files]);
      }
    }
  };

  const toggleSelectAll = () => {
    if (selectedCount === files.length) {
      setSelectedItems({});
    } else {
      const newSelection: Record<string, boolean> = {};
      files.forEach((file) => {
        newSelection[file._id] = true;
      });
      setSelectedItems(newSelection);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const openEditDialog = (file: UploadFile) => {
    setCurrentFile(file);
    setEditForm({
      description: file.description || "",
      tags: file.tags?.join(", ") || "",
      visibility: file.visibility || "public",
    });
    setEditOpen(true);
  };

  const openDeleteDialog = (file: UploadFile) => {
    setCurrentFile(file);
    setDeleteOpen(true);
  };

  const openPreviewDialog = (file: UploadFile) => {
    setCurrentFile(file);
    setPreviewOpen(true);
  };

  const handleBulkDelete = () => {
    const selectedIds = Object.keys(selectedItems).filter(
      (id) => selectedItems[id]
    );
    if (selectedIds.length > 0) {
      bulkDeleteMutation.mutate(selectedIds);
    }
  };

  const handleDownload = async (file: UploadFile) => {
    try {
      await uploadsService.incrementDownloadCount(file._id);
      window.open(file.url, "_blank");
      showToast({ message: "Download started", type: "success" });
    } catch (error) {
      showToast({ message: "Download failed", type: "error" });
    }
  };

  return (
    <main className="p-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-secondary mb-2">
            Media Library
          </h1>
          <p className="text-gray-600">
            Manage your files with Bunny.net and Cloudinary integration
          </p>
        </div>
        <div className="flex items-center space-x-3 flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => {
              queryClient.invalidateQueries({ queryKey: ["media-files"] });
              queryClient.invalidateQueries({ queryKey: ["storage-stats"] });
            }}
            disabled={isLoading || isStatsLoading}
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${
                isLoading || isStatsLoading ? "animate-spin" : ""
              }`}
            />
            Refresh
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <FileDown className="w-4 h-4 mr-2" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={async () => {
                  try {
                    await uploadsService.exportFiles("json");
                    showToast({
                      message: "Files exported as JSON",
                      type: "success",
                    });
                  } catch (error) {
                    showToast({
                      message: "Failed to export files",
                      type: "error",
                    });
                  }
                }}
              >
                Export as JSON
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={async () => {
                  try {
                    await uploadsService.exportFiles("csv");
                    showToast({
                      message: "Files exported as CSV",
                      type: "success",
                    });
                  } catch (error) {
                    showToast({
                      message: "Failed to export files",
                      type: "error",
                    });
                  }
                }}
              >
                Export as CSV
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={() => setUploadOpen(true)}>
            <UploadIcon className="w-4 h-4 mr-2" />
            Upload Files
          </Button>
        </div>
      </div>

      {/* Storage Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Files</p>
              <p className="text-2xl font-bold text-secondary mt-1">
                {isStatsLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  stats?.total?.totalFiles || 0
                )}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <File className="text-blue-600 w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Storage Used</p>
              <p className="text-2xl font-bold text-secondary mt-1">
                {isStatsLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  uploadsService.formatFileSize(stats?.total?.totalSize || 0)
                )}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <HardDrive className="text-purple-600 w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Images</p>
              <p className="text-2xl font-bold text-secondary mt-1">
                {isStatsLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  stats?.byType?.find((t) => t._id === "image")?.count || 0
                )}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <ImageIcon className="text-green-600 w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Videos</p>
              <p className="text-2xl font-bold text-secondary mt-1">
                {isStatsLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  stats?.byType?.find((t) => t._id === "video")?.count || 0
                )}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Video className="text-yellow-600 w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search files by name, tags, description..."
                className="pl-9"
              />
            </div>
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="image">Images</SelectItem>
                <SelectItem value="video">Videos</SelectItem>
                <SelectItem value="audio">Audio</SelectItem>
                <SelectItem value="document">Documents</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="name-asc">Name A-Z</SelectItem>
              <SelectItem value="name-desc">Name Z-A</SelectItem>
              <SelectItem value="size-desc">Largest Size</SelectItem>
              <SelectItem value="size-asc">Smallest Size</SelectItem>
            </SelectContent>
          </Select>

          {/* View Toggle */}
          <div className="flex items-center gap-2">
            <Button
              variant={view === "grid" ? "default" : "outline"}
              size="sm"
              onClick={() => setView("grid")}
            >
              <Grid2x2 className="w-4 h-4" />
            </Button>
            <Button
              variant={view === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setView("list")}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedCount > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={toggleSelectAll}>
                {selectedCount === files.length ? (
                  <CheckSquare className="w-4 h-4 mr-2" />
                ) : (
                  <Square className="w-4 h-4 mr-2" />
                )}
                {selectedCount} selected
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
                disabled={bulkDeleteMutation.isPending}
              >
                {bulkDeleteMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Trash className="w-4 h-4 mr-2" />
                )}
                Delete Selected
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedItems({})}
            >
              <X className="w-4 h-4 mr-2" />
              Clear Selection
            </Button>
          </div>
        )}
      </div>

      {/* Files Grid/List */}
      <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-3 text-gray-600">Loading files...</span>
          </div>
        ) : isError ? (
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-900 mb-2">
              Error loading files
            </h3>
            <p className="text-red-600 mb-4">
              {(error as Error)?.message || "Something went wrong"}
            </p>
            <Button onClick={() => refetch()}>Try Again</Button>
          </div>
        ) : files.length === 0 ? (
          <div className="text-center py-12">
            <File className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No files found
            </h3>
            {stats?.total?.totalFiles && stats.total.totalFiles > 0 ? (
              <div className="space-y-3">
                <p className="text-gray-600">
                  Storage shows {stats.total.totalFiles} file(s) exist, but none
                  are visible to your account.
                </p>
                <p className="text-sm text-gray-500">
                  Files may have been uploaded by other users or you may need
                  admin access.
                </p>
                <Button onClick={() => setUploadOpen(true)}>
                  <UploadIcon className="w-4 h-4 mr-2" />
                  Upload Your Files
                </Button>
              </div>
            ) : (
              <>
                <p className="text-gray-600 mb-4">
                  Upload your first file to get started
                </p>
                <Button onClick={() => setUploadOpen(true)}>
                  <UploadIcon className="w-4 h-4 mr-2" />
                  Upload Files
                </Button>
              </>
            )}
          </div>
        ) : view === "grid" ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {files.map((file: UploadFile) => (
              <div
                key={file._id}
                className={`group relative rounded-lg overflow-hidden border cursor-pointer transition-all hover:shadow-lg ${
                  selectedItems[file._id]
                    ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                    : "border-gray-200 bg-gray-50 hover:border-primary/50"
                }`}
              >
                {/* Selection Checkbox */}
                <div className="absolute top-2 left-2 z-10">
                  <Button
                    variant="secondary"
                    size="icon"
                    className="w-6 h-6 bg-white/90 hover:bg-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSelect(file._id);
                    }}
                  >
                    {selectedItems[file._id] ? (
                      <CheckSquare className="w-4 h-4 text-primary" />
                    ) : (
                      <Square className="w-4 h-4 text-gray-400" />
                    )}
                  </Button>
                </div>

                {/* Preview */}
                <div
                  className="relative h-40 bg-gray-100 flex items-center justify-center overflow-hidden group/preview"
                  onClick={() => openPreviewDialog(file)}
                >
                  {uploadsService.isImage(file.mimeType) ? (
                    <img
                      src={file.url}
                      alt={file.originalName}
                      className="w-full h-full object-cover"
                    />
                  ) : uploadsService.isVideo(file.mimeType) ? (
                    <>
                      {getVideoThumbnail(file.url) ? (
                        <>
                          <img
                            src={getVideoThumbnail(file.url)!}
                            alt={file.originalName}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover/preview:bg-black/40 transition-colors">
                            <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
                              <div className="w-0 h-0 border-l-[16px] border-l-blue-600 border-t-[10px] border-t-transparent border-b-[10px] border-b-transparent ml-1" />
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="text-blue-500">
                          {getFileIcon(file.mimeType)}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-gray-500">
                      {getFileIcon(file.mimeType)}
                    </div>
                  )}

                  {/* Provider Badge */}
                  <div className="absolute top-2 right-2 z-10">
                    {getProviderBadge(file.provider)}
                  </div>
                </div>

                {/* File Info */}
                <div className="p-3 bg-white">
                  <p className="text-sm font-medium text-gray-900 truncate mb-1">
                    {file.originalName}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{uploadsService.formatFileSize(file.size)}</span>
                    <span className="uppercase">
                      {uploadsService.getFileExtension(file.originalName)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-white via-white/95 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 bg-white hover:bg-gray-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        openPreviewDialog(file);
                      }}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 bg-white hover:bg-gray-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(file);
                      }}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 bg-white hover:bg-gray-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditDialog(file);
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 bg-white hover:bg-gray-100"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={async (e) => {
                            e.stopPropagation();
                            try {
                              await uploadsService.duplicateFile(file._id);
                              queryClient.invalidateQueries({
                                queryKey: ["media-files"],
                              });
                              showToast({
                                message: "File duplicated successfully",
                                type: "success",
                              });
                            } catch (error) {
                              showToast({
                                message: "Failed to duplicate file",
                                type: "error",
                              });
                            }
                          }}
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            navigator.clipboard.writeText(file.url);
                            showToast({
                              message: "URL copied to clipboard",
                              type: "success",
                            });
                          }}
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Copy URL
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            openDeleteDialog(file);
                          }}
                          className="text-red-600"
                        >
                          <Trash className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {files.map((file: UploadFile) => (
              <div
                key={file._id}
                className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                  selectedItems[file._id]
                    ? "border-primary bg-primary/5"
                    : "border-gray-200 bg-gray-50 hover:border-primary/50"
                }`}
              >
                {/* Checkbox */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSelect(file._id);
                  }}
                >
                  {selectedItems[file._id] ? (
                    <CheckSquare className="w-5 h-5 text-primary" />
                  ) : (
                    <Square className="w-5 h-5 text-gray-400" />
                  )}
                </Button>

                {/* Preview */}
                <div
                  className="shrink-0 w-16 h-16 rounded bg-gray-100 flex items-center justify-center overflow-hidden relative group/preview cursor-pointer"
                  onClick={() => openPreviewDialog(file)}
                >
                  {uploadsService.isImage(file.mimeType) ? (
                    <img
                      src={file.url}
                      alt={file.originalName}
                      className="w-full h-full object-cover"
                    />
                  ) : uploadsService.isVideo(file.mimeType) &&
                    getVideoThumbnail(file.url) ? (
                    <>
                      <img
                        src={getVideoThumbnail(file.url)!}
                        alt={file.originalName}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover/preview:bg-black/40 transition-colors">
                        <div className="w-6 h-6 bg-white/90 rounded-full flex items-center justify-center">
                          <div className="w-0 h-0 border-l-[8px] border-l-blue-600 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent ml-0.5" />
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-gray-500">
                      {getFileIcon(file.mimeType)}
                    </div>
                  )}
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate mb-1">
                    {file.originalName}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span>{uploadsService.formatFileSize(file.size)}</span>
                    <span>•</span>
                    <span className="uppercase">
                      {uploadsService.getFileExtension(file.originalName)}
                    </span>
                    <span>•</span>
                    <span>{new Date(file.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Provider Badge */}
                <div className="shrink-0">
                  {getProviderBadge(file.provider)}
                </div>

                {/* Actions */}
                <div className="shrink-0 flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      openPreviewDialog(file);
                    }}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload(file);
                    }}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEditDialog(file)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Details
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={async () => {
                          try {
                            await uploadsService.duplicateFile(file._id);
                            queryClient.invalidateQueries({
                              queryKey: ["media-files"],
                            });
                            showToast({
                              message: "File duplicated successfully",
                              type: "success",
                            });
                          } catch (error) {
                            showToast({
                              message: "Failed to duplicate file",
                              type: "error",
                            });
                          }
                        }}
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          navigator.clipboard.writeText(file.url);
                          showToast({
                            message: "URL copied to clipboard",
                            type: "success",
                          });
                        }}
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy URL
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => openDeleteDialog(file)}
                        className="text-red-600"
                      >
                        <Trash className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {!isLoading && files.length > 0 && (
        <div className="flex items-center justify-between mt-6 bg-card rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-600">
            Showing {(page - 1) * limit + 1} to{" "}
            {Math.min(page * limit, filesData?.total || 0)} of{" "}
            {filesData?.total || 0} files
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
            <span className="text-sm font-medium px-2">
              Page {page} of {filesData?.pages || 1}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setPage((p) => Math.min(filesData?.pages || 1, p + 1))
              }
              disabled={page === (filesData?.pages || 1)}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      )}

      {/* Upload Dialog */}
      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CloudUpload className="w-5 h-5 text-primary" />
              Upload Files
            </DialogTitle>
            <DialogDescription>
              Upload files to Bunny.net (videos) or Cloudinary
              (images/documents)
            </DialogDescription>
          </DialogHeader>

          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? "border-primary bg-primary/5"
                : "border-gray-300 hover:border-primary/50"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <UploadIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2 font-medium">
              Drag and drop files here
            </p>
            <p className="text-sm text-gray-500 mb-4">or</p>
            <label htmlFor="file-input">
              <Button
                type="button"
                onClick={() => document.getElementById("file-input")?.click()}
              >
                Browse Files
              </Button>
            </label>
            <input
              id="file-input"
              type="file"
              multiple
              accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
              className="hidden"
              onChange={handleFileInput}
            />
            <p className="text-xs text-gray-500 mt-4">
              Supports: Images, Videos, Audio, Documents (Max: 50MB per file)
            </p>
          </div>

          {uploadFiles.length > 0 && (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {uploadFiles.map((file: File, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {uploadsService.getFileIcon(file.name)}
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {uploadsService.formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      setUploadFiles((prev) =>
                        prev.filter((_, i) => i !== index)
                      )
                    }
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {uploadMutation.isPending && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Uploading...</span>
                <span className="text-primary font-medium">
                  {uploadProgress}%
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setUploadOpen(false);
                setUploadFiles([]);
              }}
              disabled={uploadMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={() => uploadMutation.mutate(uploadFiles)}
              disabled={uploadFiles.length === 0 || uploadMutation.isPending}
            >
              {uploadMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <UploadIcon className="w-4 h-4 mr-2" />
              )}
              Upload {uploadFiles.length > 0 && `(${uploadFiles.length})`}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5 text-primary" />
              Edit File Details
            </DialogTitle>
            <DialogDescription>
              Update file information and settings
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={editForm.description}
                onChange={(e) =>
                  setEditForm({ ...editForm, description: e.target.value })
                }
                placeholder="Enter file description..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                value={editForm.tags}
                onChange={(e) =>
                  setEditForm({ ...editForm, tags: e.target.value })
                }
                placeholder="e.g., course, video, lecture"
              />
            </div>

            <div>
              <Label htmlFor="visibility">Visibility</Label>
              <Select
                value={editForm.visibility}
                onValueChange={(value) =>
                  setEditForm({ ...editForm, visibility: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (currentFile) {
                  updateMutation.mutate({
                    id: currentFile._id,
                    description: editForm.description,
                    tags: editForm.tags
                      .split(",")
                      .map((t) => t.trim())
                      .filter(Boolean),
                    visibility: editForm.visibility,
                  });
                }
              }}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Check className="w-4 h-4 mr-2" />
              )}
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              Delete File
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this file? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>

          {currentFile && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-900 mb-1">
                {currentFile.originalName}
              </p>
              <p className="text-xs text-gray-500">
                {uploadsService.formatFileSize(currentFile.size)} •{" "}
                {new Date(currentFile.createdAt).toLocaleDateString()}
              </p>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                currentFile && deleteMutation.mutate(currentFile._id)
              }
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Trash className="w-4 h-4 mr-2" />
              )}
              Delete File
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-primary" />
              File Preview
            </DialogTitle>
          </DialogHeader>

          {currentFile && (
            <div className="space-y-4">
              {/* Preview */}
              <div className="bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center min-h-[400px]">
                {uploadsService.isImage(currentFile.mimeType) ? (
                  <img
                    src={currentFile.url}
                    alt={currentFile.originalName}
                    className="max-w-full max-h-[500px] object-contain"
                  />
                ) : uploadsService.isVideo(currentFile.mimeType) ? (
                  <div className="w-full">
                    {currentFile.url.includes("iframe.mediadelivery.net") ? (
                      <iframe
                        src={currentFile.url}
                        loading="lazy"
                        className="w-full aspect-video rounded-lg"
                        allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                        allowFullScreen
                      />
                    ) : (
                      <ReactPlayer
                        url={currentFile.url}
                        controls
                        width="100%"
                        height="500px"
                        playing={false}
                      />
                    )}
                  </div>
                ) : (
                  <div className="text-center p-8">
                    {getFileIcon(currentFile.mimeType)}
                    <p className="mt-4 text-gray-600">Preview not available</p>
                    <Button
                      className="mt-4"
                      onClick={() => handleDownload(currentFile)}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download File
                    </Button>
                  </div>
                )}
              </div>

              {/* File Details */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Filename</p>
                  <p className="text-sm font-medium">
                    {currentFile.originalName}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Size</p>
                  <p className="text-sm font-medium">
                    {uploadsService.formatFileSize(currentFile.size)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Type</p>
                  <p className="text-sm font-medium">{currentFile.mimeType}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Provider</p>
                  <div className="mt-1">
                    {getProviderBadge(currentFile.provider)}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Uploaded</p>
                  <p className="text-sm font-medium">
                    {new Date(currentFile.createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Downloads</p>
                  <p className="text-sm font-medium">
                    {currentFile.downloadCount || 0}
                  </p>
                </div>
              </div>

              {currentFile.description && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Description</p>
                  <p className="text-sm">{currentFile.description}</p>
                </div>
              )}

              {currentFile.tags && currentFile.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {currentFile.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setPreviewOpen(false)}>
              Close
            </Button>
            {currentFile && (
              <>
                <Button
                  variant="outline"
                  onClick={() => openEditDialog(currentFile)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button
                  onClick={() => currentFile && handleDownload(currentFile)}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
