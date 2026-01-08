"use client";

import React, { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Upload,
  Save,
  RefreshCw,
  Plus,
  Trash2,
  Edit3,
  Image as ImageIcon,
  Video,
  Link as LinkIcon,
  Eye,
  EyeOff,
  Download,
  Copy,
  ExternalLink,
  Loader2,
  CheckSquare,
  Square,
  Search,
  Filter,
  BarChart3,
  TrendingUp,
  FileText,
  GripVertical,
} from "lucide-react";
import { useBanners } from "@/hooks/useBanner";
import { MediaLibrarySelector } from "@/components/cms/MediaLibrarySelector";
import type {
  Banner,
  CreateBannerDto,
  UpdateBannerDto,
  SeoMeta,
} from "@/lib/types/banner";

export function BannerEditor() {
  const {
    banners,
    loading,
    saving,
    uploadProgress,
    error,
    createBannerWithMedia,
    updateBannerWithMedia,
    updateBanner,
    deleteBanner,
    duplicateBanner,
    toggleActiveStatus,
    bulkDelete,
    bulkToggleStatus,
    exportBanners,
    refreshBanners,
  } = useBanners();

  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [activeTab, setActiveTab] = useState("list");
  const [selectedBanners, setSelectedBanners] = useState<string[]>([]);
  const [previewBanner, setPreviewBanner] = useState<Banner | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [mediaLibraryOpen, setMediaLibraryOpen] = useState(false);

  const [formData, setFormData] = useState<
    CreateBannerDto & { videoFile?: File; thumbnailFile?: File }
  >({
    title: "",
    description: "",
    videoUrl: "",
    thumbnail: "",
    alt: "",
    link: "/course",
    order: 0,
    isActive: true,
    seo: {
      title: "",
      description: "",
      keywords: "",
      ogImage: "",
      ogTitle: "",
      ogDescription: "",
      canonicalUrl: "",
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      videoUrl: "",
      thumbnail: "",
      alt: "",
      link: "/course",
      order: 0,
      isActive: true,
      seo: {
        title: "",
        description: "",
        keywords: "",
        ogImage: "",
        ogTitle: "",
        ogDescription: "",
        canonicalUrl: "",
      },
    });
    setEditingBanner(null);
    setIsCreating(false);
  };

  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title,
      description: banner.description,
      videoUrl: banner.videoUrl,
      thumbnail: banner.thumbnail,
      alt: banner.alt,
      link: banner.link,
      order: banner.order,
      isActive: banner.isActive,
      seo: banner.seo || {
        title: "",
        description: "",
        keywords: "",
        ogImage: "",
        ogTitle: "",
        ogDescription: "",
        canonicalUrl: "",
      },
    });
    setActiveTab("form");
    setIsCreating(false);
  };

  const handleCreate = () => {
    resetForm();
    setIsCreating(true);
    setActiveTab("form");
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, videoFile: file });
    }
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, thumbnailFile: file });
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          thumbnail: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const submitFormData = new FormData();

      // Add files if present
      if (formData.videoFile) {
        submitFormData.append("video", formData.videoFile);
      }
      if (formData.thumbnailFile) {
        submitFormData.append("thumbnail", formData.thumbnailFile);
      }

      // Add text fields
      submitFormData.append("title", formData.title);
      submitFormData.append("description", formData.description);

      // Only send videoUrl if no file is being uploaded
      if (formData.videoUrl && !formData.videoFile) {
        submitFormData.append("videoUrl", formData.videoUrl);
      }

      // Only send thumbnail URL if no file is being uploaded and it's a valid URL
      if (
        !formData.thumbnailFile &&
        formData.thumbnail &&
        formData.thumbnail.startsWith("http")
      ) {
        submitFormData.append("thumbnail", formData.thumbnail);
      }

      submitFormData.append("alt", formData.alt);
      submitFormData.append("link", formData.link);
      submitFormData.append("order", String(formData.order ?? 0));
      submitFormData.append("isActive", String(formData.isActive ?? true));

      // Add SEO metadata
      if (formData.seo) {
        Object.entries(formData.seo).forEach(([key, value]) => {
          if (value) {
            submitFormData.append(`seo[${key}]`, value);
          }
        });
      }

      if (editingBanner) {
        await updateBannerWithMedia(editingBanner._id, submitFormData);
      } else {
        await createBannerWithMedia(submitFormData);
      }

      resetForm();
      setActiveTab("list");
      await refreshBanners();
    } catch (error) {
      console.error("Failed to save banner:", error);
    }
  };

  const handleQuickToggle = async (banner: Banner) => {
    await toggleActiveStatus(banner._id);
  };

  const handleDelete = async (id: string) => {
    await deleteBanner(id);
  };

  const handleDuplicate = async (id: string) => {
    await duplicateBanner(id);
    await refreshBanners();
  };

  const handleExport = async (format: "json" | "pdf") => {
    setIsExporting(true);
    try {
      const ids = selectedBanners.length > 0 ? selectedBanners : undefined;
      await exportBanners(format, ids);
    } catch (err) {
      console.error("Failed to export:", err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedBanners.length === 0) return;
    await bulkDelete(selectedBanners);
    setSelectedBanners([]);
    setShowDeleteDialog(false);
  };

  const handleBulkToggle = async (isActive: boolean) => {
    if (selectedBanners.length === 0) return;
    await bulkToggleStatus(selectedBanners, isActive);
    setSelectedBanners([]);
  };

  const toggleSelectBanner = (id: string) => {
    setSelectedBanners((prev) =>
      prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedBanners.length === banners.length) {
      setSelectedBanners([]);
    } else {
      setSelectedBanners(banners.map((b) => b._id));
    }
  };

  // Filter and search banners
  const filteredBanners = useMemo(() => {
    let result = [...banners];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (banner) =>
          banner.title.toLowerCase().includes(query) ||
          banner.description.toLowerCase().includes(query) ||
          banner.link.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (filterStatus !== "all") {
      result = result.filter((banner) =>
        filterStatus === "active" ? banner.isActive : !banner.isActive
      );
    }

    return result;
  }, [banners, searchQuery, filterStatus]);

  // Calculate statistics
  const statistics = useMemo(() => {
    const total = banners.length;
    const active = banners.filter((b) => b.isActive).length;
    const inactive = total - active;
    const recentlyUpdated = banners.filter((b) => {
      const updatedAt = new Date(b.updatedAt);
      const daysDiff =
        (Date.now() - updatedAt.getTime()) / (1000 * 60 * 60 * 24);
      return daysDiff <= 7;
    }).length;

    return { total, active, inactive, recentlyUpdated };
  }, [banners]);

  if (loading && banners.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="relative">
          <RefreshCw className="w-12 h-12 animate-spin text-blue-500" />
          <div className="absolute -inset-1 bg-blue-500/20 rounded-full animate-ping" />
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-900">Loading Banners</p>
          <p className="text-sm text-gray-600">
            Please wait while we fetch your data...
          </p>
        </div>
      </div>
    );
  }

  if (error && banners.length === 0) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-12 text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <Trash2 className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold text-red-900 mb-2">
            Failed to Load Banners
          </h3>
          <p className="text-red-600 mb-4">{error}</p>
          <div className="flex gap-2 justify-center">
            <Button onClick={refreshBanners} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            <Button onClick={handleCreate} variant="default">
              <Plus className="w-4 h-4 mr-2" />
              Create New Banner
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-linear-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">
                  Total Banners
                </p>
                <p className="text-3xl font-bold text-blue-900">
                  {statistics.total}
                </p>
              </div>
              <div className="p-3 bg-blue-500 rounded-lg">
                <Video className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-linear-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Active</p>
                <p className="text-3xl font-bold text-green-900">
                  {statistics.active}
                </p>
              </div>
              <div className="p-3 bg-green-500 rounded-lg">
                <Eye className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-linear-to-br from-gray-50 to-gray-100 border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Inactive</p>
                <p className="text-3xl font-bold text-gray-900">
                  {statistics.inactive}
                </p>
              </div>
              <div className="p-3 bg-gray-500 rounded-lg">
                <EyeOff className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-linear-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">
                  Recent Updates
                </p>
                <p className="text-3xl font-bold text-purple-900">
                  {statistics.recentlyUpdated}
                </p>
              </div>
              <div className="p-3 bg-purple-500 rounded-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search banners by title, description, or link..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Filter className="w-4 h-4" />
                    Filter:{" "}
                    {filterStatus === "all"
                      ? "All"
                      : filterStatus === "active"
                      ? "Active"
                      : "Inactive"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setFilterStatus("all")}>
                    All Banners
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterStatus("active")}>
                    Active Only
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterStatus("inactive")}>
                    Inactive Only
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Header Actions */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2">
          {selectedBanners.length > 0 && (
            <Badge variant="default">{selectedBanners.length} selected</Badge>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {selectedBanners.length > 0 && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkToggle(true)}
                disabled={saving || loading}
              >
                <Eye className="w-4 h-4 mr-2" />
                Activate Selected
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkToggle(false)}
                disabled={saving || loading}
              >
                <EyeOff className="w-4 h-4 mr-2" />
                Deactivate Selected
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowDeleteDialog(true)}
                disabled={saving || loading}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Selected
              </Button>
            </>
          )}
          <Button
            variant="outline"
            onClick={() => setPreviewBanner(banners[0] || null)}
            disabled={saving || loading || banners.length === 0}
          >
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                disabled={isExporting || saving || loading}
              >
                {isExporting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleExport("json")}>
                Export as JSON
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("pdf")}>
                Export as PDF
              </DropdownMenuItem>
              {selectedBanners.length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleExport("json")}>
                    Export Selected as JSON
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport("pdf")}>
                    Export Selected as PDF
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="outline"
            onClick={refreshBanners}
            disabled={saving || loading}
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="inline-flex h-auto items-center justify-start rounded-xl bg-white p-2 shadow-sm border border-gray-200 gap-2 flex-wrap">
          <TabsTrigger
            value="list"
            className={`
              flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium
              transition-all duration-200 ease-in-out min-w-[120px] sm:min-w-40
              ${
                activeTab === "list"
                  ? "bg-linear-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }
            `}
          >
            <Video className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Banner List</span>
          </TabsTrigger>
          <TabsTrigger
            value="form"
            className={`
              flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium
              transition-all duration-200 ease-in-out min-w-[120px] sm:min-w-40
              ${
                activeTab === "form"
                  ? "bg-linear-to-r from-purple-500 to-pink-600 text-white shadow-lg shadow-purple-500/30"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }
            `}
          >
            <Edit3 className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>{editingBanner ? "Edit" : "Create"} Banner</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <h3 className="text-lg font-semibold">Manage Banners</h3>
              {banners.length > 0 && (
                <Button variant="outline" size="sm" onClick={toggleSelectAll}>
                  {selectedBanners.length === banners.length ? (
                    <CheckSquare className="w-4 h-4 mr-2" />
                  ) : (
                    <Square className="w-4 h-4 mr-2" />
                  )}
                  {selectedBanners.length === banners.length
                    ? "Deselect All"
                    : "Select All"}
                </Button>
              )}
            </div>
            <Button onClick={handleCreate} disabled={saving || loading}>
              <Plus className="w-4 h-4 mr-2" />
              Add New Banner
            </Button>
          </div>

          <div className="grid gap-4">
            {filteredBanners.length === 0 && searchQuery && (
              <Card>
                <CardContent className="p-12 text-center">
                  <Search className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold mb-2">
                    No results found
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Try adjusting your search or filter criteria
                  </p>
                  <Button
                    onClick={() => {
                      setSearchQuery("");
                      setFilterStatus("all");
                    }}
                    variant="outline"
                  >
                    Clear Filters
                  </Button>
                </CardContent>
              </Card>
            )}
            {filteredBanners.map((banner) => (
              <Card
                key={banner._id}
                className={`transition-all duration-200 hover:shadow-lg ${
                  selectedBanners.includes(banner._id)
                    ? "ring-2 ring-blue-500 bg-blue-50/50"
                    : ""
                }`}
              >
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="flex items-center pt-1">
                        <Checkbox
                          checked={selectedBanners.includes(banner._id)}
                          onCheckedChange={() => toggleSelectBanner(banner._id)}
                        />
                      </div>
                      <div
                        className="w-full sm:w-48 h-32 relative rounded-lg overflow-hidden bg-linear-to-br from-gray-100 to-gray-200 shrink-0 cursor-pointer group"
                        onClick={() => setPreviewBanner(banner)}
                      >
                        <img
                          src={banner.thumbnail}
                          alt={banner.alt}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                          <Eye className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                        <Badge
                          className="absolute top-2 right-2"
                          variant={banner.isActive ? "default" : "secondary"}
                        >
                          {banner.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h4 className="text-base sm:text-lg font-semibold text-gray-900 line-clamp-1">
                            {banner.title}
                          </h4>
                          <Badge variant="outline" className="shrink-0">
                            #{banner.order}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {banner.description}
                        </p>
                        <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Video className="w-3 h-3 sm:w-4 sm:h-4" />
                            Video
                          </span>
                          <span className="flex items-center gap-1 max-w-[200px] truncate">
                            <LinkIcon className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
                            {banner.link}
                          </span>
                          <span className="text-xs text-gray-400">
                            Updated:{" "}
                            {new Date(banner.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex lg:flex-col gap-2 justify-end lg:justify-start">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(banner)}
                        disabled={saving || loading}
                        className="flex-1 lg:flex-none"
                      >
                        <Edit3 className="w-4 h-4 sm:mr-2" />
                        <span className="hidden sm:inline">Edit</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDuplicate(banner._id)}
                        disabled={saving || loading}
                        className="flex-1 lg:flex-none"
                      >
                        <Copy className="w-4 h-4 sm:mr-2" />
                        <span className="hidden sm:inline">Duplicate</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleQuickToggle(banner)}
                        disabled={saving || loading}
                        className="flex-1 lg:flex-none"
                      >
                        {banner.isActive ? (
                          <EyeOff className="w-4 h-4 sm:mr-2" />
                        ) : (
                          <Eye className="w-4 h-4 sm:mr-2" />
                        )}
                        <span className="hidden sm:inline">
                          {banner.isActive ? "Hide" : "Show"}
                        </span>
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(banner._id)}
                        disabled={saving || loading}
                        className="flex-1 lg:flex-none"
                      >
                        <Trash2 className="w-4 h-4 sm:mr-2" />
                        <span className="hidden sm:inline">Delete</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {banners.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <Video className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold mb-2">No banners yet</h3>
                  <p className="text-gray-600 mb-4">
                    Create your first banner to get started
                  </p>
                  <Button onClick={handleCreate}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Banner
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="form" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{editingBanner ? "Edit" : "Create"} Banner</CardTitle>
              <CardDescription>
                {editingBanner
                  ? "Update banner content and media"
                  : "Add a new banner to your homepage"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      placeholder="High Performance Aircraft Training"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="link">Link *</Label>
                    <Input
                      id="link"
                      value={formData.link}
                      onChange={(e) =>
                        setFormData({ ...formData, link: e.target.value })
                      }
                      placeholder="/course"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Master high-performance aircraft..."
                    rows={3}
                    required
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="alt">Alt Text *</Label>
                    <Input
                      id="alt"
                      value={formData.alt}
                      onChange={(e) =>
                        setFormData({ ...formData, alt: e.target.value })
                      }
                      placeholder="High performance aircraft training"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="order">Display Order</Label>
                    <Input
                      id="order"
                      type="number"
                      value={formData.order}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          order: parseInt(e.target.value) || 0,
                        })
                      }
                      min="0"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="video">Video File</Label>
                    <div className="flex items-center gap-4">
                      <Input
                        id="video"
                        type="file"
                        accept="video/*"
                        onChange={handleVideoChange}
                      />
                      <Button type="button" variant="outline" size="sm">
                        <Upload className="w-4 h-4 mr-2" />
                        Upload
                      </Button>
                    </div>
                    {uploadProgress > 0 && uploadProgress < 100 && (
                      <div className="space-y-1">
                        <Progress value={uploadProgress} />
                        <p className="text-sm text-gray-600">
                          Uploading: {uploadProgress}%
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="videoUrl">Or Video URL</Label>
                    <Input
                      id="videoUrl"
                      value={formData.videoUrl}
                      onChange={(e) =>
                        setFormData({ ...formData, videoUrl: e.target.value })
                      }
                      placeholder="https://cdn.example.com/video.mp4"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="thumbnail">Thumbnail Image</Label>
                    <div
                      className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
                        uploadProgress > 0 && uploadProgress < 100
                          ? "border-blue-400 bg-blue-50"
                          : "border-blue-200 hover:border-blue-400 cursor-pointer bg-white"
                      }`}
                    >
                      {uploadProgress > 0 && uploadProgress < 100 ? (
                        <div className="space-y-3">
                          <RefreshCw className="mx-auto h-12 w-12 text-blue-500 animate-spin" />
                          <div>
                            <p className="text-base font-semibold text-blue-700">
                              Uploading Thumbnail...
                            </p>
                            <p className="text-sm text-blue-600 mt-1 font-medium">
                              {uploadProgress}% Complete
                            </p>
                          </div>
                          <Progress
                            value={uploadProgress}
                            className="w-full h-3 bg-blue-100"
                          />
                        </div>
                      ) : formData.thumbnail ? (
                        <div className="space-y-3">
                          <div className="relative w-full h-48 rounded-lg overflow-hidden border-2 border-blue-100 shadow-sm mx-auto max-w-md">
                            <img
                              src={formData.thumbnail}
                              alt="Thumbnail Preview"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <p className="text-sm text-gray-600 font-medium">
                            Thumbnail Ready
                          </p>
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setMediaLibraryOpen(true);
                              }}
                              className="border-2 border-purple-300 hover:border-purple-500 hover:bg-purple-50"
                            >
                              <ImageIcon className="w-4 h-4 mr-2" />
                              Select from Library
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setFormData({
                                  ...formData,
                                  thumbnail: "",
                                  thumbnailFile: undefined,
                                });
                              }}
                              className="border-2 hover:border-blue-400 hover:bg-blue-50"
                            >
                              <RefreshCw className="w-4 h-4 mr-2" />
                              Change Thumbnail
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                          <p className="text-sm font-medium text-gray-700 mb-1">
                            Upload or Select from Library
                          </p>
                          <div className="flex items-center justify-center gap-3 mb-3 relative z-10">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setMediaLibraryOpen(true);
                              }}
                              className="border-2 border-purple-300 hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 relative z-20 pointer-events-auto"
                            >
                              <ImageIcon className="w-4 h-4 mr-2" />
                              Select from Library
                            </Button>
                          </div>
                          <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                              <div className="w-full border-t border-gray-300"></div>
                            </div>
                            <div className="relative flex justify-center text-xs">
                              <span className="bg-white dark:bg-gray-800 px-2 text-gray-500">
                                or drag and drop to upload
                              </span>
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 mt-3">
                            PNG, JPG, GIF up to 10MB
                          </p>
                        </div>
                      )}
                      {uploadProgress === 0 && !formData.thumbnail && (
                        <>
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={handleThumbnailChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer pointer-events-none"
                            style={{ pointerEvents: "none" }}
                            disabled={saving || loading}
                          />
                          <div
                            className="absolute inset-0 cursor-pointer"
                            onClick={(e) => {
                              const fileInput = document.getElementById(
                                "banner-thumbnail-input"
                              ) as HTMLInputElement;
                              if (fileInput) {
                                fileInput.click();
                              }
                            }}
                          >
                            <input
                              id="banner-thumbnail-input"
                              type="file"
                              accept="image/*"
                              onChange={handleThumbnailChange}
                              className="hidden"
                              disabled={saving || loading}
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, isActive: checked })
                    }
                  />
                  <Label htmlFor="isActive">Active</Label>
                </div>

                {/* SEO Metadata Section */}
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="seo">
                    <AccordionTrigger className="text-lg font-semibold">
                      <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        SEO Metadata (Optional)
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4 pt-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="seoTitle">SEO Title</Label>
                            <Input
                              id="seoTitle"
                              value={formData.seo?.title || ""}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  seo: {
                                    ...formData.seo,
                                    title: e.target.value,
                                  },
                                })
                              }
                              placeholder="High Performance Aircraft Training | Course"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="seoKeywords">SEO Keywords</Label>
                            <Input
                              id="seoKeywords"
                              value={formData.seo?.keywords || ""}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  seo: {
                                    ...formData.seo,
                                    keywords: e.target.value,
                                  },
                                })
                              }
                              placeholder="aircraft, training, courses"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="seoDescription">
                            SEO Description
                          </Label>
                          <Textarea
                            id="seoDescription"
                            value={formData.seo?.description || ""}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                seo: {
                                  ...formData.seo,
                                  description: e.target.value,
                                },
                              })
                            }
                            placeholder="Comprehensive description for search engines..."
                            rows={2}
                          />
                        </div>

                        <div className="border-t pt-4">
                          <h4 className="text-sm font-semibold mb-3">
                            Open Graph / Social Media
                          </h4>
                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="ogTitle">OG Title</Label>
                              <Input
                                id="ogTitle"
                                value={formData.seo?.ogTitle || ""}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    seo: {
                                      ...formData.seo,
                                      ogTitle: e.target.value,
                                    },
                                  })
                                }
                                placeholder="Title for social media"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="ogImage">OG Image URL</Label>
                              <Input
                                id="ogImage"
                                value={formData.seo?.ogImage || ""}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    seo: {
                                      ...formData.seo,
                                      ogImage: e.target.value,
                                    },
                                  })
                                }
                                placeholder="https://example.com/image.jpg"
                              />
                            </div>
                          </div>

                          <div className="space-y-2 mt-4">
                            <Label htmlFor="ogDescription">
                              OG Description
                            </Label>
                            <Textarea
                              id="ogDescription"
                              value={formData.seo?.ogDescription || ""}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  seo: {
                                    ...formData.seo,
                                    ogDescription: e.target.value,
                                  },
                                })
                              }
                              placeholder="Description for social media sharing"
                              rows={2}
                            />
                          </div>

                          <div className="space-y-2 mt-4">
                            <Label htmlFor="canonicalUrl">Canonical URL</Label>
                            <Input
                              id="canonicalUrl"
                              value={formData.seo?.canonicalUrl || ""}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  seo: {
                                    ...formData.seo,
                                    canonicalUrl: e.target.value,
                                  },
                                })
                              }
                              placeholder="https://example.com/canonical-page"
                            />
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                <div className="flex gap-4">
                  <Button
                    type="submit"
                    disabled={
                      (uploadProgress > 0 && uploadProgress < 100) ||
                      saving ||
                      loading
                    }
                  >
                    {saving ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    {saving ? "Saving..." : editingBanner ? "Update" : "Create"}{" "}
                    Banner
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetForm}
                    disabled={saving || loading}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Upload Progress Indicator */}
      {uploadProgress > 0 && uploadProgress < 100 && (
        <div className="fixed bottom-4 right-4 z-50 w-80">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Uploading media...</span>
                  <span className="text-muted-foreground">
                    {uploadProgress}%
                  </span>
                </div>
                <Progress value={uploadProgress} />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Preview Dialog */}
      <Dialog
        open={!!previewBanner}
        onOpenChange={(open) => !open && setPreviewBanner(null)}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Banner Preview</DialogTitle>
            <DialogDescription>
              Preview how your banner will appear to users
            </DialogDescription>
          </DialogHeader>
          {previewBanner && (
            <div className="space-y-6 mt-4">
              {/* Thumbnail */}
              {previewBanner.thumbnail && (
                <div className="relative w-full h-64 rounded-lg overflow-hidden">
                  <img
                    src={previewBanner.thumbnail}
                    alt={previewBanner.alt}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Video */}
              {previewBanner.videoUrl && (
                <div className="space-y-2">
                  <h3 className="font-semibold">Video</h3>
                  <video
                    src={previewBanner.videoUrl}
                    controls
                    className="w-full rounded-lg"
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
              )}

              {/* Title & Description */}
              <div>
                <h1 className="text-3xl font-bold">{previewBanner.title}</h1>
                <p className="text-muted-foreground mt-2">
                  {previewBanner.description}
                </p>
              </div>

              {/* Link */}
              {previewBanner.link && (
                <div className="pt-4">
                  <a
                    href={previewBanner.link}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
                  >
                    View More
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              )}

              {/* Metadata */}
              <div className="border-t pt-4 space-y-2 text-sm text-muted-foreground">
                <p>Order: {previewBanner.order}</p>
                <p>Status: {previewBanner.isActive ? "Active" : "Inactive"}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Selected Banners?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedBanners.length}{" "}
              banner(s)? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={saving || loading}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              disabled={saving || loading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4 mr-2" />
              )}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Media Library Selector */}
      <MediaLibrarySelector
        open={mediaLibraryOpen}
        onOpenChange={setMediaLibraryOpen}
        onSelect={(url) => {
          setFormData({
            ...formData,
            thumbnail: url,
            thumbnailFile: undefined,
          });
          setMediaLibraryOpen(false);
        }}
        title="Select Banner Thumbnail"
      />
    </div>
  );
}
