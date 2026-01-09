"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search as SearchIcon,
  Image as ImageIcon,
  Video,
  File,
  Check,
  Upload as UploadIcon,
  Loader2,
  Filter,
  Folder,
  Music,
  FileText,
  Cloud,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  uploadsService,
  type UploadFile as BaseUploadFile,
} from "@/services/uploads.service";
import { useDebounce } from "@/hooks/useDebounce";

// Extend UploadFile to include provider field
interface UploadFile extends BaseUploadFile {
  provider?: string;
}

interface MediaPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (file: UploadFile | UploadFile[]) => void;
  multiple?: boolean;
  accept?: "all" | "image" | "video" | "document" | "audio";
  title?: string;
  description?: string;
}

const getFileIcon = (mimeType: string) => {
  if (mimeType.startsWith("image/")) return <ImageIcon className="w-5 h-5" />;
  if (mimeType.startsWith("video/")) return <Video className="w-5 h-5" />;
  if (mimeType.startsWith("audio/")) return <Music className="w-5 h-5" />;
  if (mimeType.includes("pdf"))
    return <File className="w-5 h-5 text-red-500" />;
  return <FileText className="w-5 h-5" />;
};

const getVideoThumbnail = (url: string) => {
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
        className="bg-orange-50 text-orange-600 border-orange-200 text-xs"
      >
        <Cloud className="w-2.5 h-2.5 mr-1" /> Bunny
      </Badge>
    );
  }
  return (
    <Badge
      variant="outline"
      className="bg-blue-50 text-blue-600 border-blue-200 text-xs"
    >
      <Cloud className="w-2.5 h-2.5 mr-1" /> Cloudinary
    </Badge>
  );
};

export default function MediaPicker({
  open,
  onOpenChange,
  onSelect,
  multiple = false,
  accept = "all",
  title = "Select Media",
  description = "Choose files from your media library",
}: MediaPickerProps) {
  const [search, setSearch] = React.useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [typeFilter, setTypeFilter] = React.useState(
    accept === "all" ? "all" : accept
  );
  const [sortBy, setSortBy] = React.useState("newest");
  const [page, setPage] = React.useState(1);
  const [limit] = React.useState(12);
  const [selectedItems, setSelectedItems] = React.useState<
    Record<string, UploadFile>
  >({});
  const [currentFolder, setCurrentFolder] = React.useState<string | null>(null);
  const [activeTab, setActiveTab] = React.useState<"library" | "upload">(
    "library"
  );

  // Reset when closed
  React.useEffect(() => {
    if (!open) {
      setSelectedItems({});
      setSearch("");
      setPage(1);
      setCurrentFolder(null);
      setActiveTab("library");
    }
  }, [open]);

  // Fetch folders
  const { data: folders = [] } = useQuery({
    queryKey: ["media-folders"],
    queryFn: async () => {
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
        }/uploads/folders`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (!response.ok) return [];
      const data = await response.json();
      return data.data || data || [];
    },
    enabled: open,
  });

  // Fetch files
  const { data: filesData, isLoading } = useQuery({
    queryKey: [
      "media-picker-files",
      debouncedSearch,
      typeFilter,
      sortBy,
      page,
      currentFolder,
    ],
    queryFn: async () => {
      if (currentFolder) {
        const response = await fetch(
          `${
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
          }/uploads/folder/${encodeURIComponent(
            currentFolder
          )}?page=${page}&limit=${limit}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (!response.ok) throw new Error("Failed to fetch folder files");
        const data = await response.json();
        return data.data || data;
      }

      if (debouncedSearch) {
        const result = await uploadsService.searchFiles({
          q: debouncedSearch,
          type: typeFilter !== "all" ? typeFilter : undefined,
          sort: sortBy,
          page,
          limit,
        });
        return { files: result, total: result.length, page: 1, pages: 1 };
      }

      return await uploadsService.getUserFiles({
        page,
        limit,
        type: typeFilter !== "all" ? typeFilter : undefined,
        sort: sortBy,
      });
    },
    enabled: open && activeTab === "library",
  });

  const files = Array.isArray(filesData) ? filesData : filesData?.files || [];
  const selectedCount = Object.keys(selectedItems).length;

  const toggleSelect = (file: UploadFile) => {
    if (multiple) {
      setSelectedItems((prev) => {
        const newSelection = { ...prev };
        if (newSelection[file._id]) {
          delete newSelection[file._id];
        } else {
          newSelection[file._id] = file;
        }
        return newSelection;
      });
    } else {
      setSelectedItems({ [file._id]: file });
    }
  };

  const handleSelect = () => {
    const selected = Object.values(selectedItems);
    if (selected.length > 0) {
      onSelect(multiple ? selected : selected[0]);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="library">Media Library</TabsTrigger>
            <TabsTrigger value="upload">Upload New</TabsTrigger>
          </TabsList>

          <TabsContent value="library" className="space-y-4">
            {/* Filters */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search files..."
                    className="pl-9"
                  />
                </div>
              </div>

              {accept === "all" && (
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-32">
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
              )}

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="name-asc">Name A-Z</SelectItem>
                  <SelectItem value="name-desc">Name Z-A</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-5 gap-4">
              {/* Sidebar - Folders */}
              <div className="col-span-1">
                <ScrollArea className="h-[400px]">
                  <div className="space-y-1 pr-2">
                    <button
                      onClick={() => setCurrentFolder(null)}
                      className={`w-full text-left px-2 py-1.5 rounded text-sm transition-colors ${
                        currentFolder === null
                          ? "bg-primary text-white"
                          : "hover:bg-gray-100"
                      }`}
                    >
                      All Files
                    </button>
                    {folders.map((folder: any) => (
                      <button
                        key={folder.name}
                        onClick={() => setCurrentFolder(folder.name)}
                        className={`w-full text-left px-2 py-1.5 rounded text-sm transition-colors ${
                          currentFolder === folder.name
                            ? "bg-primary text-white"
                            : "hover:bg-gray-100"
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <Folder className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{folder.name}</span>
                        </div>
                        <div className="text-xs opacity-75 pl-5">
                          {folder.fileCount}
                        </div>
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              {/* Files Grid */}
              <div className="col-span-4">
                <ScrollArea className="h-[400px]">
                  {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                      <span className="ml-2 text-sm text-gray-600">
                        Loading files...
                      </span>
                    </div>
                  ) : files.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <File className="w-12 h-12 text-gray-300 mb-3" />
                      <p className="text-sm text-gray-600">No files found</p>
                      <Button
                        variant="link"
                        size="sm"
                        onClick={() => setActiveTab("upload")}
                        className="mt-2"
                      >
                        Upload files
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-3 pr-2">
                      {files.map((file: UploadFile) => {
                        const isSelected = !!selectedItems[file._id];
                        return (
                          <div
                            key={file._id}
                            onClick={() => toggleSelect(file)}
                            className={`group relative rounded-lg overflow-hidden border-2 cursor-pointer transition-all hover:shadow-md ${
                              isSelected
                                ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                                : "border-gray-200 hover:border-primary/50"
                            }`}
                          >
                            {/* Selection Indicator */}
                            {isSelected && (
                              <div className="absolute top-2 right-2 z-10 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                                <Check className="w-4 h-4 text-white" />
                              </div>
                            )}

                            {/* Preview */}
                            <div className="relative h-32 bg-gray-100 flex items-center justify-center overflow-hidden">
                              {uploadsService.isImage(file.mimeType) ? (
                                <img
                                  src={file.url}
                                  alt={file.altText || file.originalName}
                                  className="w-full h-full object-cover"
                                />
                              ) : uploadsService.isVideo(file.mimeType) &&
                                getVideoThumbnail(file.url) ? (
                                <img
                                  src={getVideoThumbnail(file.url)!}
                                  alt={file.originalName}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="text-gray-500">
                                  {getFileIcon(file.mimeType)}
                                </div>
                              )}

                              {/* Provider Badge */}
                              <div className="absolute top-1.5 left-1.5">
                                {getProviderBadge(file.provider)}
                              </div>
                            </div>

                            {/* File Info */}
                            <div className="p-2 bg-white">
                              <p className="text-xs font-medium text-gray-900 truncate">
                                {file.originalName}
                              </p>
                              <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                                <span>
                                  {uploadsService.formatFileSize(file.size)}
                                </span>
                                <span className="uppercase text-[10px]">
                                  {uploadsService.getFileExtension(
                                    file.originalName
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </ScrollArea>

                {/* Pagination */}
                {!isLoading && files.length > 0 && (
                  <div className="flex items-center justify-between mt-3 pt-3 border-t">
                    <p className="text-xs text-gray-600">
                      {(page - 1) * limit + 1} -{" "}
                      {Math.min(page * limit, filesData?.total || 0)} of{" "}
                      {filesData?.total || 0}
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </Button>
                      <span className="text-xs">
                        {page} / {filesData?.pages || 1}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setPage((p) => Math.min(filesData?.pages || 1, p + 1))
                        }
                        disabled={page === (filesData?.pages || 1)}
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="upload" className="space-y-4">
            <div className="border-2 border-dashed rounded-lg p-12 text-center">
              <UploadIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">
                Drag and drop files here or click to browse
              </p>
              <Button variant="outline" size="sm">
                <UploadIcon className="w-4 h-4 mr-2" />
                Browse Files
              </Button>
              <p className="text-xs text-gray-500 mt-4">
                Upload files directly to your media library
              </p>
            </div>
            <p className="text-sm text-gray-500 text-center">
              After uploading, switch to the Media Library tab to select your
              files
            </p>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <div className="flex items-center justify-between w-full">
            <div className="text-sm text-gray-600">
              {selectedCount > 0 && (
                <span>
                  {selectedCount} file{selectedCount > 1 ? "s" : ""} selected
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedItems({});
                  onOpenChange(false);
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleSelect} disabled={selectedCount === 0}>
                <Check className="w-4 h-4 mr-2" />
                Select {selectedCount > 0 && `(${selectedCount})`}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


