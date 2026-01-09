"use client";

import React, { useEffect, useMemo, useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Upload,
  Save,
  RefreshCw,
  Image as ImageIcon,
  Share2,
  List,
  Mail,
  Phone,
  Building2,
  Link as LinkIcon,
  Globe,
  Plus,
  Trash2,
  Download,
  Copy,
  Eye,
  Loader2,
  EyeOff,
} from "lucide-react";
import type { Footer, FooterSocialLink } from "@/types/cms";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { footerApi } from "@/services/cms.service";
import { useToast } from "@/context/ToastContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";

interface FooterEditorProps {
  footerId?: string;
  initialData?: Partial<Footer>;
  onSave?: (data: Footer) => void;
}

export function FooterEditor({
  footerId,
  initialData,
  onSave,
}: FooterEditorProps) {
  const queryClient = useQueryClient();
  const { push } = useToast();

  const {
    data: activeFooter,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["activeFooter"],
    queryFn: footerApi.getActive,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });


  const effectiveFooter = useMemo<Footer | null>(() => {
    if (initialData && initialData.logo && initialData.socialMedia) {
      return initialData as Footer;
    }
    return activeFooter ?? null;
  }, [initialData, activeFooter]);

  const [data, setData] = useState<Footer | null>(null);
  const [activeTab, setActiveTab] = useState("logo");
  const [uploadProgress, setUploadProgress] = useState<{
    [key: string]: number;
  }>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Sync data when effectiveFooter loads
  useEffect(() => {
    if (effectiveFooter) {
      setData(effectiveFooter);
    }
  }, [effectiveFooter]);

  // Image Upload Field Component
  const ImageUploadField = ({
    label,
    value,
    onUpload,
    field,
    className = "",
  }: {
    label: string;
    value: string;
    onUpload: (file: File) => void;
    field: string;
    className?: string;
  }) => {
    const progress = uploadProgress[field];
    const isUploading = progress !== undefined && progress < 100;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        onUpload(file);
      }
    };

    return (
      <div className={`space-y-2 ${className}`}>
        <Label htmlFor={field}>{label}</Label>
        <div
          className={`relative border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
            isUploading
              ? "border-blue-400 bg-blue-50 dark:bg-blue-950"
              : "border-gray-300 hover:border-gray-400 cursor-pointer"
          }`}
        >
          {isUploading ? (
            <div className="space-y-3">
              <RefreshCw className="mx-auto h-8 w-8 text-blue-500 animate-spin" />
              <div>
                <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  Uploading...
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  {progress}%
                </p>
              </div>
              <Progress value={progress} className="w-full h-2" />
            </div>
          ) : value ? (
            <div className="space-y-2 pointer-events-none">
              <img
                src={value}
                alt="Preview"
                className="mx-auto h-20 w-20 object-contain rounded"
              />
              <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                {value}
              </p>
            </div>
          ) : (
            <div className="text-center pointer-events-none">
              <Upload className="mx-auto h-8 w-8 text-gray-400" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Click to upload
              </p>
            </div>
          )}
          {!isUploading && (
            <Input
              id={field}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          )}
        </div>
      </div>
    );
  };

  const updateMutation = useMutation({
    mutationFn: (payload: Partial<Footer>) => {
      const id = data?._id || footerId;
      if (!id) throw new Error("Footer ID is required");
      return footerApi.update(id, payload);
    },
    onSuccess: (updatedData) => {
      queryClient.invalidateQueries({ queryKey: ["activeFooter"] });
      push({
        message: "Footer updated successfully",
        type: "success",
      });
      setData(updatedData);
      setIsSaving(false);
    },
    onError: (error: any) => {
      push({
        message: error?.message || "Failed to update footer",
        type: "error",
      });
      setIsSaving(false);
    },
  });

  // Helper function to recursively remove _id fields from nested objects
  const cleanFooterData = (data: Footer): any => {
    const clean = (obj: any): any => {
      if (Array.isArray(obj)) {
        return obj.map((item) => clean(item));
      }
      if (obj && typeof obj === "object") {
        const cleaned: any = {};
        for (const [key, value] of Object.entries(obj)) {
          if (key !== "_id" && key !== "publicId") {
            cleaned[key] = clean(value);
          }
        }
        return cleaned;
      }
      return obj;
    };

    const { _id, createdAt, updatedAt, ...rest } = data;
    return clean(rest);
  };

  const handleSave = () => {
    if (!data) return;
    setIsSaving(true);
    const cleanedData = cleanFooterData(data);
    updateMutation.mutate(cleanedData);
  };

  const handleLogoUpload = async (file: File) => {
    if (!data?._id && !footerId) {
      push({
        message: "Footer must be saved before uploading logo",
        type: "error",
      });
      return;
    }

    const field = "logo";

    try {
      // Initialize progress at 0
      setUploadProgress((prev) => ({ ...prev, [field]: 0 }));
      const id = data?._id || footerId!;
      const updatedFooter = await footerApi.uploadLogo(
        id,
        file,
        {
          alt: data?.logo?.alt || "Footer Logo",
          width: data?.logo?.width || 140,
          height: data?.logo?.height || 50,
        },
        (progress) => {
          setUploadProgress((prev) => ({ ...prev, [field]: progress }));
        }
      );

      setData(updatedFooter);
      queryClient.invalidateQueries({ queryKey: ["activeFooter"] });
      // Clear progress after short delay to show completion
      setTimeout(() => {
        setUploadProgress((prev) => {
          const newProgress = { ...prev };
          delete newProgress[field];
          return newProgress;
        });
      }, 1000);
      push({
        message: "Logo uploaded successfully",
        type: "success",
      });
    } catch (error: any) {
      // Clear progress on error
      setUploadProgress((prev) => {
        const newProgress = { ...prev };
        delete newProgress[field];
        return newProgress;
      });
      push({
        message: error?.message || "Failed to upload logo",
        type: "error",
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleLogoUpload(file);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading footer data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-destructive">
            Error loading footer: {(error as Error).message}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="p-6 space-y-3">
          <p className="text-muted-foreground">No footer data available</p>
          <Button
            onClick={() => {
              queryClient.invalidateQueries({ queryKey: ["activeFooter"] });
            }}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 w-full container mx-auto px-3 sm:px-4 lg:px-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Footer CMS
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your website footer content
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant={data?.isActive ? "default" : "secondary"}>
            {data?.isActive ? (
              <>
                <Eye className="w-3 h-3 mr-1" /> Active
              </>
            ) : (
              <>
                <EyeOff className="w-3 h-3 mr-1" /> Inactive
              </>
            )}
          </Badge>
          <Button
            variant="outline"
            onClick={() => setShowPreview(true)}
            disabled={!data || isSaving}
          >
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          {data?._id && (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" disabled={isExporting || isSaving}>
                    {isExporting ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4 mr-2" />
                    )}
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={async () => {
                      if (!data._id) return;
                      setIsExporting(true);
                      try {
                        await footerApi.export(data._id, "json");
                        push({
                          message: "Footer exported as JSON",
                          type: "success",
                        });
                      } catch (err) {
                        push({ message: "Failed to export", type: "error" });
                      } finally {
                        setIsExporting(false);
                      }
                    }}
                  >
                    Export as JSON
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={async () => {
                      if (!data._id) return;
                      setIsExporting(true);
                      try {
                        await footerApi.export(data._id, "pdf");
                        push({
                          message: "Footer exported as PDF",
                          type: "success",
                        });
                      } catch (err) {
                        push({ message: "Failed to export", type: "error" });
                      } finally {
                        setIsExporting(false);
                      }
                    }}
                  >
                    Export as PDF
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                variant="outline"
                onClick={async () => {
                  if (!data._id) return;
                  setIsSaving(true);
                  try {
                    const duplicated = await footerApi.duplicate(data._id);
                    queryClient.invalidateQueries({
                      queryKey: ["activeFooter"],
                    });
                    push({
                      message: "Footer duplicated successfully",
                      type: "success",
                    });
                    setData(duplicated);
                  } catch (err) {
                    push({ message: "Failed to duplicate", type: "error" });
                  } finally {
                    setIsSaving(false);
                  }
                }}
                disabled={isSaving}
              >
                <Copy className="w-4 h-4 mr-2" />
                Duplicate
              </Button>
              <Button
                variant="outline"
                onClick={async () => {
                  if (!data._id) return;
                  setIsSaving(true);
                  try {
                    const toggled = await footerApi.toggleActive(data._id);
                    queryClient.invalidateQueries({
                      queryKey: ["activeFooter"],
                    });
                    push({
                      message: `Footer ${
                        toggled.isActive ? "activated" : "deactivated"
                      }`,
                      type: "success",
                    });
                    setData(toggled);
                  } catch (err) {
                    push({ message: "Failed to toggle status", type: "error" });
                  } finally {
                    setIsSaving(false);
                  }
                }}
                disabled={isSaving}
              >
                <RefreshCw
                  className={`w-4 h-4 mr-2 ${isSaving ? "animate-spin" : ""}`}
                />
                Toggle Active
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  queryClient.invalidateQueries({ queryKey: ["activeFooter"] });
                  push({ message: "Footer refreshed", type: "success" });
                }}
                disabled={isSaving}
              >
                <RefreshCw
                  className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
            </>
          )}
          <Button
            onClick={handleSave}
            disabled={isSaving}
            size="lg"
            className="w-full sm:w-auto"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="mb-6 sm:mb-8">
          <div className="w-full overflow-x-auto pb-2">
            <TabsList className="inline-flex gap-2 p-1 bg-white rounded-xl shadow-md border border-gray-200 min-w-max">
              <TabsTrigger
                value="logo"
                className={`
                  flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium text-sm sm:text-base
                  transition-all duration-200 ease-in-out min-w-[120px] sm:min-w-[140px] whitespace-nowrap
                  ${
                    activeTab === "logo"
                      ? "bg-linear-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }
                `}
              >
                <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Logo</span>
              </TabsTrigger>
              <TabsTrigger
                value="social"
                className={`
                  flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium text-sm sm:text-base
                  transition-all duration-200 ease-in-out min-w-[120px] sm:min-w-[140px] whitespace-nowrap
                  ${
                    activeTab === "social"
                      ? "bg-linear-to-r from-purple-500 to-pink-600 text-white shadow-lg shadow-purple-500/30"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }
                `}
              >
                <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Social</span>
              </TabsTrigger>
              <TabsTrigger
                value="sections"
                className={`
                  flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium text-sm sm:text-base
                  transition-all duration-200 ease-in-out min-w-[120px] sm:min-w-[140px] whitespace-nowrap
                  ${
                    activeTab === "sections"
                      ? "bg-linear-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/30"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }
                `}
              >
                <List className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Sections</span>
              </TabsTrigger>
              <TabsTrigger
                value="newsletter"
                className={`
                  flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium text-sm sm:text-base
                  transition-all duration-200 ease-in-out min-w-[120px] sm:min-w-[140px] whitespace-nowrap
                  ${
                    activeTab === "newsletter"
                      ? "bg-linear-to-r from-orange-500 to-red-600 text-white shadow-lg shadow-orange-500/30"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }
                `}
              >
                <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Newsletter</span>
              </TabsTrigger>
              <TabsTrigger
                value="contact"
                className={`
                  flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium text-sm sm:text-base
                  transition-all duration-200 ease-in-out min-w-[120px] sm:min-w-[140px] whitespace-nowrap
                  ${
                    activeTab === "contact"
                      ? "bg-linear-to-r from-indigo-500 to-blue-600 text-white shadow-lg shadow-indigo-500/30"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }
                `}
              >
                <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Contact</span>
              </TabsTrigger>
              <TabsTrigger
                value="company"
                className={`
                  flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium text-sm sm:text-base
                  transition-all duration-200 ease-in-out min-w-[120px] sm:min-w-[140px] whitespace-nowrap
                  ${
                    activeTab === "company"
                      ? "bg-linear-to-r from-teal-500 to-cyan-600 text-white shadow-lg shadow-teal-500/30"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }
                `}
              >
                <Building2 className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Company</span>
              </TabsTrigger>
              <TabsTrigger
                value="bottom"
                className={`
                  flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium text-sm sm:text-base
                  transition-all duration-200 ease-in-out min-w-[120px] sm:min-w-40 whitespace-nowrap
                  ${
                    activeTab === "bottom"
                      ? "bg-linear-to-r from-gray-600 to-gray-800 text-white shadow-lg shadow-gray-600/30"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }
                `}
              >
                <LinkIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Bottom Links</span>
              </TabsTrigger>
              <TabsTrigger
                value="language"
                className={`
                  flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium text-sm sm:text-base
                  transition-all duration-200 ease-in-out min-w-[120px] sm:min-w-[140px] whitespace-nowrap
                  ${
                    activeTab === "language"
                      ? "bg-linear-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/30"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }
                `}
              >
                <Globe className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Language</span>
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        {/* Logo Tab */}
        <TabsContent value="logo" className="mt-4">
          <Card className="border-0 shadow-lg pt-0">
            <CardHeader className="bg-linear-to-r from-blue-500 to-cyan-600 text-white rounded-t-lg py-4">
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="w-6 h-6" />
                Footer Logo
              </CardTitle>
              <CardDescription className="text-blue-100">
                Upload and configure your footer logo
              </CardDescription>
            </CardHeader>
            <CardContent className="p-3 sm:p-6 space-y-4 sm:space-y-6">
              <ImageUploadField
                label="Footer Logo"
                value={data.logo?.src || ""}
                onUpload={handleLogoUpload}
                field="logo"
              />

              <Separator />

              {/* Logo Alt Text */}
              <div className="space-y-2">
                <Label htmlFor="logo-alt">Alt Text</Label>
                <Input
                  id="logo-alt"
                  value={data.logo?.alt || ""}
                  onChange={(e) =>
                    setData((prev) =>
                      prev
                        ? {
                            ...prev,
                            logo: { ...prev.logo, alt: e.target.value },
                          }
                        : prev
                    )
                  }
                  placeholder="Footer logo description"
                />
              </div>

              {/* Logo Dimensions */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="logo-width">Width (px)</Label>
                  <Input
                    id="logo-width"
                    type="number"
                    value={data.logo?.width || 140}
                    onChange={(e) =>
                      setData((prev) =>
                        prev
                          ? {
                              ...prev,
                              logo: {
                                ...prev.logo,
                                width: parseInt(e.target.value) || 140,
                              },
                            }
                          : prev
                      )
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="logo-height">Height (px)</Label>
                  <Input
                    id="logo-height"
                    type="number"
                    value={data.logo?.height || 50}
                    onChange={(e) =>
                      setData((prev) =>
                        prev
                          ? {
                              ...prev,
                              logo: {
                                ...prev.logo,
                                height: parseInt(e.target.value) || 50,
                              },
                            }
                          : prev
                      )
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Social Media Tab */}
        <TabsContent value="social" className="mt-4">
          <Card className="border-0 shadow-lg pt-0">
            <CardHeader className="bg-linear-to-r from-purple-500 to-pink-600 text-white rounded-t-lg py-4">
              <CardTitle className="flex items-center gap-2">
                <Share2 className="w-6 h-6" />
                Social Media
              </CardTitle>
              <CardDescription className="text-purple-100">
                Manage social media links
              </CardDescription>
            </CardHeader>
            <CardContent className="p-3 sm:p-6 space-y-4">
              {/* Social Title */}
              <div className="space-y-2">
                <Label htmlFor="social-title">Section Title</Label>
                <Input
                  id="social-title"
                  value={data.socialMedia?.title || ""}
                  onChange={(e) =>
                    setData((prev) =>
                      prev
                        ? {
                            ...prev,
                            socialMedia: {
                              ...prev.socialMedia,
                              title: e.target.value,
                            },
                          }
                        : prev
                    )
                  }
                  placeholder="FOLLOW US"
                />
              </div>

              <Separator />

              {/* Social Links */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Social Links</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (!data) return;
                      const newLink = {
                        platform: "Platform",
                        href: "https://",
                        label: "Follow us on Platform",
                      };
                      setData({
                        ...data,
                        socialMedia: {
                          ...data.socialMedia,
                          links: [...(data.socialMedia?.links || []), newLink],
                        },
                      });
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Link
                  </Button>
                </div>

                {data.socialMedia?.links?.map((link, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <Badge variant="outline">Link {index + 1}</Badge>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (!data) return;
                          const links = [...(data.socialMedia?.links || [])];
                          links.splice(index, 1);
                          setData({
                            ...data,
                            socialMedia: { ...data.socialMedia, links },
                          });
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label>Platform</Label>
                        <Input
                          value={link.platform}
                          onChange={(e) => {
                            if (!data) return;
                            const links = [...(data.socialMedia?.links || [])];
                            links[index] = {
                              ...links[index],
                              platform: e.target.value,
                            };
                            setData({
                              ...data,
                              socialMedia: { ...data.socialMedia, links },
                            });
                          }}
                          placeholder="Facebook"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>URL</Label>
                        <Input
                          value={link.href}
                          onChange={(e) => {
                            if (!data) return;
                            const links = [...(data.socialMedia?.links || [])];
                            links[index] = {
                              ...links[index],
                              href: e.target.value,
                            };
                            setData({
                              ...data,
                              socialMedia: { ...data.socialMedia, links },
                            });
                          }}
                          placeholder="https://facebook.com/yourpage"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Label</Label>
                        <Input
                          value={link.label}
                          onChange={(e) => {
                            if (!data) return;
                            const links = [...(data.socialMedia?.links || [])];
                            links[index] = {
                              ...links[index],
                              label: e.target.value,
                            };
                            setData({
                              ...data,
                              socialMedia: { ...data.socialMedia, links },
                            });
                          }}
                          placeholder="Follow us on Facebook"
                        />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sections Tab */}
        <TabsContent value="sections" className="mt-4">
          <Card className="border-0 shadow-lg pt-0">
            <CardHeader className="bg-linear-to-r from-green-500 to-emerald-600 text-white rounded-t-lg py-4">
              <CardTitle className="flex items-center gap-2">
                <List className="w-6 h-6" />
                Footer Sections
              </CardTitle>
              <CardDescription className="text-green-100">
                Organize footer navigation sections
              </CardDescription>
            </CardHeader>
            <CardContent className="p-3 sm:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <Label>Sections</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (!data) return;
                    const newSection = {
                      title: "New Section",
                      links: [],
                    };
                    setData({
                      ...data,
                      sections: [...(data.sections || []), newSection],
                    });
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Section
                </Button>
              </div>

              {data.sections?.map((section, sectionIndex) => (
                <Card key={sectionIndex} className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <Badge>Section {sectionIndex + 1}</Badge>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (!data) return;
                        const sections = [...(data.sections || [])];
                        sections.splice(sectionIndex, 1);
                        setData({ ...data, sections });
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label>Section Title</Label>
                      <Input
                        value={section.title}
                        onChange={(e) => {
                          if (!data) return;
                          const sections = [...(data.sections || [])];
                          sections[sectionIndex] = {
                            ...sections[sectionIndex],
                            title: e.target.value,
                          };
                          setData({ ...data, sections });
                        }}
                        placeholder="LEARNING"
                      />
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">Links</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (!data) return;
                            const sections = [...(data.sections || [])];
                            const newLink = { label: "New Link", href: "/" };
                            sections[sectionIndex].links = [
                              ...(sections[sectionIndex].links || []),
                              newLink,
                            ];
                            setData({ ...data, sections });
                          }}
                        >
                          <Plus className="mr-1 h-3 w-3" />
                          Link
                        </Button>
                      </div>

                      {section.links?.map((link, linkIndex) => (
                        <div key={linkIndex} className="flex gap-2 items-end">
                          <div className="flex-1 grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <Label className="text-xs">Label</Label>
                              <Input
                                value={link.label}
                                onChange={(e) => {
                                  if (!data) return;
                                  const sections = [...(data.sections || [])];
                                  sections[sectionIndex].links[linkIndex] = {
                                    ...sections[sectionIndex].links[linkIndex],
                                    label: e.target.value,
                                  };
                                  setData({ ...data, sections });
                                }}
                                placeholder="Link text"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">URL</Label>
                              <Input
                                value={link.href}
                                onChange={(e) => {
                                  if (!data) return;
                                  const sections = [...(data.sections || [])];
                                  sections[sectionIndex].links[linkIndex] = {
                                    ...sections[sectionIndex].links[linkIndex],
                                    href: e.target.value,
                                  };
                                  setData({ ...data, sections });
                                }}
                                placeholder="/path"
                              />
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (!data) return;
                              const sections = [...(data.sections || [])];
                              sections[sectionIndex].links.splice(linkIndex, 1);
                              setData({ ...data, sections });
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Newsletter Tab */}
        <TabsContent value="newsletter" className="mt-4">
          <Card className="border-0 shadow-lg pt-0">
            <CardHeader className="bg-linear-to-r from-orange-500 to-red-600 text-white rounded-t-lg py-4">
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-6 h-6" />
                Newsletter
              </CardTitle>
              <CardDescription className="text-orange-100">
                Configure newsletter subscription form
              </CardDescription>
            </CardHeader>
            <CardContent className="p-3 sm:p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newsletter-title">Title</Label>
                <Input
                  id="newsletter-title"
                  value={data.newsletter?.title || ""}
                  onChange={(e) =>
                    setData((prev) =>
                      prev
                        ? {
                            ...prev,
                            newsletter: {
                              ...prev.newsletter,
                              title: e.target.value,
                            },
                          }
                        : prev
                    )
                  }
                  placeholder="GET IN TOUCH"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newsletter-description">Description</Label>
                <Textarea
                  id="newsletter-description"
                  value={data.newsletter?.description || ""}
                  onChange={(e) =>
                    setData((prev) =>
                      prev
                        ? {
                            ...prev,
                            newsletter: {
                              ...prev.newsletter,
                              description: e.target.value,
                            },
                          }
                        : prev
                    )
                  }
                  placeholder="Subscribe to our newsletter..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newsletter-placeholder">
                  Input Placeholder
                </Label>
                <Input
                  id="newsletter-placeholder"
                  value={data.newsletter?.placeholder || ""}
                  onChange={(e) =>
                    setData((prev) =>
                      prev
                        ? {
                            ...prev,
                            newsletter: {
                              ...prev.newsletter,
                              placeholder: e.target.value,
                            },
                          }
                        : prev
                    )
                  }
                  placeholder="Enter your email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newsletter-button">Button Text</Label>
                <Input
                  id="newsletter-button"
                  value={data.newsletter?.buttonText || ""}
                  onChange={(e) =>
                    setData((prev) =>
                      prev
                        ? {
                            ...prev,
                            newsletter: {
                              ...prev.newsletter,
                              buttonText: e.target.value,
                            },
                          }
                        : prev
                    )
                  }
                  placeholder="Subscribe"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contact Tab */}
        <TabsContent value="contact" className="mt-4">
          <Card className="border-0 shadow-lg pt-0">
            <CardHeader className="bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg py-4">
              <CardTitle className="flex items-center gap-2">
                <Phone className="w-6 h-6" />
                Contact Information
              </CardTitle>
              <CardDescription className="text-blue-100">
                Update contact details
              </CardDescription>
            </CardHeader>
            <CardContent className="p-3 sm:p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contact-phone">Phone</Label>
                  <Input
                    id="contact-phone"
                    value={data.contact?.phone || ""}
                    onChange={(e) =>
                      setData((prev) =>
                        prev
                          ? {
                              ...prev,
                              contact: {
                                ...prev.contact,
                                phone: e.target.value,
                              },
                            }
                          : prev
                      )
                    }
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact-phone-href">Phone Link</Label>
                  <Input
                    id="contact-phone-href"
                    value={data.contact?.phoneHref || ""}
                    onChange={(e) =>
                      setData((prev) =>
                        prev
                          ? {
                              ...prev,
                              contact: {
                                ...prev.contact,
                                phoneHref: e.target.value,
                              },
                            }
                          : prev
                      )
                    }
                    placeholder="tel:+15551234567"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact-email">Email</Label>
                  <Input
                    id="contact-email"
                    type="email"
                    value={data.contact?.email || ""}
                    onChange={(e) =>
                      setData((prev) =>
                        prev
                          ? {
                              ...prev,
                              contact: {
                                ...prev.contact,
                                email: e.target.value,
                              },
                            }
                          : prev
                      )
                    }
                    placeholder="contact@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact-email-href">Email Link</Label>
                  <Input
                    id="contact-email-href"
                    value={data.contact?.emailHref || ""}
                    onChange={(e) =>
                      setData((prev) =>
                        prev
                          ? {
                              ...prev,
                              contact: {
                                ...prev.contact,
                                emailHref: e.target.value,
                              },
                            }
                          : prev
                      )
                    }
                    placeholder="mailto:contact@example.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact-address">Address</Label>
                <Textarea
                  id="contact-address"
                  value={data.contact?.address || ""}
                  onChange={(e) =>
                    setData((prev) =>
                      prev
                        ? {
                            ...prev,
                            contact: {
                              ...prev.contact,
                              address: e.target.value,
                            },
                          }
                        : prev
                    )
                  }
                  placeholder="123 Main St, City, State 12345"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact-hours">Business Hours</Label>
                <Input
                  id="contact-hours"
                  value={data.contact?.hours || ""}
                  onChange={(e) =>
                    setData((prev) =>
                      prev
                        ? {
                            ...prev,
                            contact: { ...prev.contact, hours: e.target.value },
                          }
                        : prev
                    )
                  }
                  placeholder="Mon-Fri: 9AM-5PM"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Company Info Tab */}
        <TabsContent value="company" className="mt-4">
          <Card className="border-0 shadow-lg pt-0">
            <CardHeader className="bg-linear-to-r from-teal-500 to-cyan-600 text-white rounded-t-lg py-4">
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-6 h-6" />
                Company Information
              </CardTitle>
              <CardDescription className="text-teal-100">
                Configure company details and copyright
              </CardDescription>
            </CardHeader>
            <CardContent className="p-3 sm:p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="company-description">Description</Label>
                <Textarea
                  id="company-description"
                  value={data.companyInfo?.description || ""}
                  onChange={(e) =>
                    setData((prev) =>
                      prev
                        ? {
                            ...prev,
                            companyInfo: {
                              ...prev.companyInfo,
                              description: e.target.value,
                            },
                          }
                        : prev
                    )
                  }
                  placeholder="Your company description..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company-founded">Founded Year</Label>
                  <Input
                    id="company-founded"
                    value={data.companyInfo?.foundedYear || ""}
                    onChange={(e) =>
                      setData((prev) =>
                        prev
                          ? {
                              ...prev,
                              companyInfo: {
                                ...prev.companyInfo,
                                foundedYear: e.target.value,
                              },
                            }
                          : prev
                      )
                    }
                    placeholder="2024"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company-name">Company Name</Label>
                  <Input
                    id="company-name"
                    value={data.companyInfo?.companyName || ""}
                    onChange={(e) =>
                      setData((prev) =>
                        prev
                          ? {
                              ...prev,
                              companyInfo: {
                                ...prev.companyInfo,
                                companyName: e.target.value,
                              },
                            }
                          : prev
                      )
                    }
                    placeholder="Your Company, Inc."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company-rights">Rights Text</Label>
                  <Input
                    id="company-rights"
                    value={data.companyInfo?.rightsText || ""}
                    onChange={(e) =>
                      setData((prev) =>
                        prev
                          ? {
                              ...prev,
                              companyInfo: {
                                ...prev.companyInfo,
                                rightsText: e.target.value,
                              },
                            }
                          : prev
                      )
                    }
                    placeholder="All Rights Reserved"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company-contact-link">Contact Link</Label>
                  <Input
                    id="company-contact-link"
                    value={data.companyInfo?.contactLink || ""}
                    onChange={(e) =>
                      setData((prev) =>
                        prev
                          ? {
                              ...prev,
                              companyInfo: {
                                ...prev.companyInfo,
                                contactLink: e.target.value,
                              },
                            }
                          : prev
                      )
                    }
                    placeholder="/contact"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bottom Links Tab */}
        <TabsContent value="bottom" className="mt-4">
          <Card className="border-0 shadow-lg pt-0">
            <CardHeader className="bg-linear-to-r from-gray-600 to-gray-800 text-white rounded-t-lg py-4">
              <CardTitle className="flex items-center gap-2">
                <LinkIcon className="w-6 h-6" />
                Bottom Links
              </CardTitle>
              <CardDescription className="text-gray-200">
                Legal and policy links
              </CardDescription>
            </CardHeader>
            <CardContent className="p-3 sm:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <Label>Links</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (!data) return;
                    const newLink = { label: "New Link", href: "/" };
                    setData({
                      ...data,
                      bottomLinks: [...(data.bottomLinks || []), newLink],
                    });
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Link
                </Button>
              </div>

              {data.bottomLinks?.map((link, index) => (
                <div key={index} className="flex gap-2 items-end">
                  <div className="flex-1 grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Label</Label>
                      <Input
                        value={link.label}
                        onChange={(e) => {
                          if (!data) return;
                          const links = [...(data.bottomLinks || [])];
                          links[index] = {
                            ...links[index],
                            label: e.target.value,
                          };
                          setData({ ...data, bottomLinks: links });
                        }}
                        placeholder="Privacy Policy"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">URL</Label>
                      <Input
                        value={link.href}
                        onChange={(e) => {
                          if (!data) return;
                          const links = [...(data.bottomLinks || [])];
                          links[index] = {
                            ...links[index],
                            href: e.target.value,
                          };
                          setData({ ...data, bottomLinks: links });
                        }}
                        placeholder="/privacy"
                      />
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (!data) return;
                      const links = [...(data.bottomLinks || [])];
                      links.splice(index, 1);
                      setData({ ...data, bottomLinks: links });
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Language Tab */}
        <TabsContent value="language" className="mt-4">
          <Card className="border-0 shadow-lg pt-0">
            <CardHeader className="bg-linear-to-r from-violet-500 to-purple-600 text-white rounded-t-lg py-4">
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-6 h-6" />
                Language Selector
              </CardTitle>
              <CardDescription className="text-violet-100">
                Configure available languages
              </CardDescription>
            </CardHeader>
            <CardContent className="p-3 sm:p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-language">Current Language Code</Label>
                <Input
                  id="current-language"
                  value={data.languageSelector?.currentLanguage || ""}
                  onChange={(e) =>
                    setData((prev) =>
                      prev
                        ? {
                            ...prev,
                            languageSelector: {
                              ...prev.languageSelector,
                              currentLanguage: e.target.value,
                            },
                          }
                        : prev
                    )
                  }
                  placeholder="en"
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Available Languages</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (!data) return;
                      const newLang = { code: "en", name: "English" };
                      setData({
                        ...data,
                        languageSelector: {
                          ...data.languageSelector,
                          languages: [
                            ...(data.languageSelector?.languages || []),
                            newLang,
                          ],
                        },
                      });
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Language
                  </Button>
                </div>

                {data.languageSelector?.languages?.map((lang, index) => (
                  <div key={index} className="flex gap-2 items-end">
                    <div className="flex-1 grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label className="text-xs">Code</Label>
                        <Input
                          value={lang.code}
                          onChange={(e) => {
                            if (!data) return;
                            const languages = [
                              ...(data.languageSelector?.languages || []),
                            ];
                            languages[index] = {
                              ...languages[index],
                              code: e.target.value,
                            };
                            setData({
                              ...data,
                              languageSelector: {
                                ...data.languageSelector,
                                languages,
                              },
                            });
                          }}
                          placeholder="en"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Name</Label>
                        <Input
                          value={lang.name}
                          onChange={(e) => {
                            if (!data) return;
                            const languages = [
                              ...(data.languageSelector?.languages || []),
                            ];
                            languages[index] = {
                              ...languages[index],
                              name: e.target.value,
                            };
                            setData({
                              ...data,
                              languageSelector: {
                                ...data.languageSelector,
                                languages,
                              },
                            });
                          }}
                          placeholder="English"
                        />
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (!data) return;
                        const languages = [
                          ...(data.languageSelector?.languages || []),
                        ];
                        languages.splice(index, 1);
                        setData({
                          ...data,
                          languageSelector: {
                            ...data.languageSelector,
                            languages,
                          },
                        });
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Upload Progress Indicator */}
      {Object.values(uploadProgress).some(
        (progress) => progress > 0 && progress < 100
      ) && (
        <div className="fixed bottom-4 right-4 z-50 w-80">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Uploading media...</span>
                  <span className="text-muted-foreground">
                    {Math.max(...Object.values(uploadProgress))}%
                  </span>
                </div>
                <Progress value={Math.max(...Object.values(uploadProgress))} />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Footer Preview</DialogTitle>
            <DialogDescription>
              Preview how your footer will appear to users
            </DialogDescription>
          </DialogHeader>
          {data && (
            <div className="space-y-6 mt-4">
              {/* Logo Preview */}
              {data.logo && (
                <div className="space-y-2">
                  <h3 className="font-semibold">Logo</h3>
                  <div className="p-4 border rounded-lg">
                    <img
                      src={data.logo.src}
                      alt={data.logo.alt || "Footer Logo"}
                      className="h-12"
                    />
                  </div>
                </div>
              )}

              {/* Company Info Preview */}
              {data.companyInfo?.description && (
                <div className="space-y-2">
                  <h3 className="font-semibold">Company Description</h3>
                  <p className="text-muted-foreground">
                    {data.companyInfo.description}
                  </p>
                </div>
              )}

              {/* Sections Preview */}
              {data.sections && data.sections.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-semibold">Footer Sections</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {data.sections.map((section, idx) => (
                      <div key={idx} className="p-3 border rounded-lg">
                        <p className="font-medium">{section.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {section.links.length} links
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Contact Info Preview */}
              {data.contact && (
                <div className="space-y-2">
                  <h3 className="font-semibold">Contact Information</h3>
                  <div className="p-4 border rounded-lg space-y-2">
                    {data.contact.email && (
                      <p className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        {data.contact.email}
                      </p>
                    )}
                    {data.contact.phone && (
                      <p className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        {data.contact.phone}
                      </p>
                    )}
                    {data.contact.address && (
                      <p className="flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        {data.contact.address}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Social Media Preview */}
              {data.socialMedia?.links && data.socialMedia.links.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-semibold">Social Media</h3>
                  <div className="flex flex-wrap gap-2">
                    {data.socialMedia.links.map(
                      (social: FooterSocialLink, idx: number) => (
                        <Badge key={idx} variant="outline">
                          {social.platform}: {social.href}
                        </Badge>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* Copyright Preview */}
              {data.companyInfo?.rightsText && (
                <div className="space-y-2">
                  <h3 className="font-semibold">Copyright</h3>
                  <p className="text-sm text-muted-foreground">
                    {data.companyInfo.rightsText}
                  </p>
                </div>
              )}

              {/* Status */}
              <div className="space-y-2">
                <h3 className="font-semibold">Status</h3>
                <Badge variant={data.isActive ? "default" : "secondary"}>
                  {data.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
