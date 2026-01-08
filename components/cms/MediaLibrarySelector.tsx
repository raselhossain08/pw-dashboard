"use client";

import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Image as ImageIcon,
  Upload,
  Check,
  Loader2,
  X,
  Filter,
  Grid3x3,
  List,
} from "lucide-react";
import { uploadsService } from "@/services/uploads.service";
import { uploadService } from "@/services/upload.service";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface MediaLibrarySelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (url: string) => void;
  title?: string;
  acceptedTypes?: string[];
}

export function MediaLibrarySelector({
  open,
  onOpenChange,
  onSelect,
  title = "Select Media",
  acceptedTypes = [
    "image/jpeg",
    "image/png",
    "image/jpg",
    "image/gif",
    "image/webp",
  ],
}: MediaLibrarySelectorProps) {
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"library" | "upload">("library");

  // Upload state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);

  // Fetch media from library
  const {
    data: mediaFiles,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["media-library", search],
    queryFn: async () => {
      if (search && search.trim()) {
        // Use search endpoint when there's a search query
        const files = await uploadsService.searchFiles({
          q: search,
          type: "image",
          limit: 50,
        });
        return files;
      } else {
        // Use getUserFiles for general listing
        const response = await uploadsService.getUserFiles({
          type: "image",
          limit: 50,
          page: 1,
        });
        return response.files || [];
      }
    },
    enabled: open && activeTab === "library",
  });

  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!acceptedTypes.includes(file.type)) {
      alert("Invalid file type. Please select an image.");
      return;
    }

    setUploadFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!uploadFile) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const result = await uploadService.uploadFile(uploadFile, {
        type: "image",
        onProgress: (progress) => {
          setUploadProgress(progress.percentage);
        },
      });

      // Select the uploaded image
      setSelectedUrl(result.url);
      setActiveTab("library");
      refetch();

      // Reset upload state
      setUploadFile(null);
      setUploadPreview(null);
      setUploadProgress(0);
    } catch (error) {
      alert("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSelect = () => {
    if (selectedUrl) {
      onSelect(selectedUrl);
      onOpenChange(false);
      setSelectedUrl(null);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setSelectedUrl(null);
    setUploadFile(null);
    setUploadPreview(null);
    setUploadProgress(0);
    setActiveTab("library");
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Select an image from your media library or upload a new one
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="library">
              <ImageIcon className="w-4 h-4 mr-2" />
              Media Library
            </TabsTrigger>
            <TabsTrigger value="upload">
              <Upload className="w-4 h-4 mr-2" />
              Upload New
            </TabsTrigger>
          </TabsList>

          <TabsContent value="library" className="space-y-4">
            {/* Search and Filters */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search media..."
                  className="pl-10"
                />
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setView(view === "grid" ? "list" : "grid")}
              >
                {view === "grid" ? (
                  <List className="w-4 h-4" />
                ) : (
                  <Grid3x3 className="w-4 h-4" />
                )}
              </Button>
            </div>

            {/* Media Grid/List */}
            <ScrollArea className="h-[400px] rounded-lg border">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                </div>
              ) : !mediaFiles || mediaFiles.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                  <ImageIcon className="w-16 h-16 text-gray-300 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    No media found
                  </h3>
                  <p className="text-sm text-gray-500">
                    {search
                      ? "Try a different search term"
                      : "Upload your first image to get started"}
                  </p>
                </div>
              ) : (
                <div
                  className={cn(
                    "p-4",
                    view === "grid"
                      ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
                      : "space-y-2"
                  )}
                >
                  {mediaFiles.map((file: any) => (
                    <div
                      key={file._id}
                      onClick={() => setSelectedUrl(file.url)}
                      className={cn(
                        "relative cursor-pointer rounded-lg border-2 transition-all hover:shadow-lg",
                        selectedUrl === file.url
                          ? "border-blue-500 ring-2 ring-blue-200"
                          : "border-gray-200 hover:border-blue-300"
                      )}
                    >
                      {view === "grid" ? (
                        <div className="aspect-square relative overflow-hidden rounded-lg">
                          <Image
                            src={file.url}
                            alt={file.description || "Media"}
                            fill
                            className="object-cover"
                          />
                          {selectedUrl === file.url && (
                            <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                              <div className="bg-blue-500 rounded-full p-2">
                                <Check className="w-6 h-6 text-white" />
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 p-3">
                          <div className="relative w-16 h-16 rounded overflow-hidden flex-shrink-0">
                            <Image
                              src={file.url}
                              alt={file.description || "Media"}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">
                              {file.description || file.filename}
                            </p>
                            <p className="text-sm text-gray-500">
                              {new Date(file.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          {selectedUrl === file.url && (
                            <Check className="w-5 h-5 text-blue-500 flex-shrink-0" />
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="upload" className="space-y-4">
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              {uploadPreview ? (
                <div className="space-y-4">
                  <div className="relative w-full max-w-md mx-auto aspect-video rounded-lg overflow-hidden">
                    <Image
                      src={uploadPreview}
                      alt="Upload preview"
                      fill
                      className="object-cover"
                    />
                  </div>

                  {isUploading ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                        <span className="font-semibold text-blue-600">
                          Uploading... {uploadProgress}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-blue-500 h-3 rounded-full transition-all"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setUploadFile(null);
                          setUploadPreview(null);
                        }}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                      <Button onClick={handleUpload}>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-lg font-semibold mb-2">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    PNG, JPG, GIF up to 10MB
                  </p>
                  <Input
                    type="file"
                    accept={acceptedTypes.join(",")}
                    onChange={handleFileChange}
                    className="max-w-md mx-auto cursor-pointer"
                  />
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSelect} disabled={!selectedUrl || isUploading}>
            <Check className="w-4 h-4 mr-2" />
            Select Image
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
