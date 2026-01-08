"use client";

import React, { useState, useEffect } from "react";
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Upload,
  Save,
  RefreshCw,
  Plus,
  Trash2,
  Image as ImageIcon,
  Star,
  Eye,
  EyeOff,
  Search,
  ChevronDown,
  Download,
  Copy,
  Loader2,
} from "lucide-react";
import { useTestimonials } from "@/hooks/useTestimonials";
import { MediaLibrarySelector } from "@/components/cms/MediaLibrarySelector";
import Image from "next/image";
import type {
  Testimonials,
  UpdateTestimonialsDto,
  Testimonial,
  SeoMeta,
} from "@/lib/types/testimonials";
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

export function TestimonialsEditor() {
  const {
    testimonials,
    loading,
    saving,
    uploadProgress,
    fetchTestimonials,
    updateTestimonialsWithMedia,
    toggleActive,
    duplicateTestimonial,
    exportTestimonials,
    refreshTestimonials,
  } = useTestimonials();

  const [activeTab, setActiveTab] = useState("content");
  const [avatarFiles, setAvatarFiles] = useState<{ [key: number]: File }>({});
  const [avatarPreviews, setAvatarPreviews] = useState<{
    [key: number]: string;
  }>({});
  const [previewTestimonial, setPreviewTestimonial] =
    useState<Testimonial | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [mediaLibraryOpen, setMediaLibraryOpen] = useState(false);
  const [currentAvatarIndex, setCurrentAvatarIndex] = useState<number | null>(
    null
  );

  const [formData, setFormData] = useState<UpdateTestimonialsDto>({
    title: "",
    subtitle: "",
    description: "",
    testimonials: [],
    seo: {
      title: "",
      description: "",
      keywords: "",
      ogImage: "",
    },
    isActive: true,
  });

  useEffect(() => {
    if (testimonials) {
      setFormData({
        title: testimonials.title || "",
        subtitle: testimonials.subtitle || "",
        description: testimonials.description || "",
        testimonials: testimonials.testimonials || [],
        seo: testimonials.seo || {
          title: "",
          description: "",
          keywords: "",
          ogImage: "",
        },
        isActive: testimonials.isActive ?? true,
      });
    }
  }, [testimonials]);

  const handleAvatarChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFiles({ ...avatarFiles, [index]: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreviews({
          ...avatarPreviews,
          [index]: reader.result as string,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const submitFormData = new FormData();

      // Add text fields
      submitFormData.append("title", formData.title || "");
      submitFormData.append("subtitle", formData.subtitle || "");
      submitFormData.append("description", formData.description || "");

      // Filter out completely empty testimonials (no name AND no comment)
      // Keep testimonials that have at least a name or comment filled
      const validTestimonials = (formData.testimonials || []).filter(
        (t) => t.name?.trim() || t.comment?.trim()
      );

      // Add testimonials as JSON
      if (validTestimonials.length > 0) {
        submitFormData.append(
          "testimonials",
          JSON.stringify(validTestimonials)
        );
      }

      // Add avatar files (adjust indices based on valid testimonials)
      Object.entries(avatarFiles).forEach(([index, file]) => {
        submitFormData.append(`avatar_${index}`, file);
      });

      await updateTestimonialsWithMedia(submitFormData);
      setAvatarFiles({});
      setAvatarPreviews({});
      await refreshTestimonials();
    } catch (error) {
      console.error("Failed to update testimonials:", error);
    }
  };

  const handleDuplicate = async (index: number) => {
    await duplicateTestimonial(index);
    await refreshTestimonials();
  };

  const handleExport = async (format: "json" | "pdf") => {
    setIsExporting(true);
    try {
      await exportTestimonials(format);
    } catch (err) {
      console.error("Failed to export:", err);
    } finally {
      setIsExporting(false);
    }
  };

  const addTestimonial = () => {
    setFormData({
      ...formData,
      testimonials: [
        ...(formData.testimonials || []),
        {
          name: "",
          position: "",
          company: "",
          avatar: "",
          rating: 5,
          comment: "",
          fallback: "",
        },
      ],
    });
  };

  const removeTestimonial = (index: number) => {
    const newTestimonials = [...(formData.testimonials || [])];
    newTestimonials.splice(index, 1);
    setFormData({ ...formData, testimonials: newTestimonials });

    // Remove preview if exists
    const newPreviews = { ...avatarPreviews };
    delete newPreviews[index];
    setAvatarPreviews(newPreviews);

    const newFiles = { ...avatarFiles };
    delete newFiles[index];
    setAvatarFiles(newFiles);
  };

  const updateTestimonial = (
    index: number,
    field: keyof Testimonial,
    value: any
  ) => {
    const newTestimonials = [...(formData.testimonials || [])];
    newTestimonials[index] = { ...newTestimonials[index], [field]: value };
    setFormData({ ...formData, testimonials: newTestimonials });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading Testimonials...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-end flex-wrap gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            onClick={() => {
              if (formData.testimonials && formData.testimonials.length > 0) {
                setPreviewTestimonial(formData.testimonials[0]);
              }
            }}
            disabled={
              saving ||
              loading ||
              !formData.testimonials ||
              formData.testimonials.length === 0
            }
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
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="outline"
            onClick={refreshTestimonials}
            disabled={saving || loading}
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Testimonials Management</CardTitle>
                <CardDescription>
                  Manage pilot testimonials and feedback section
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full space-y-6"
            >
              <TabsList className="w-full h-auto flex lg:grid lg:grid-cols-3 gap-1 sm:gap-2 p-1 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl overflow-x-auto">
                <TabsTrigger
                  value="content"
                  className="flex items-center justify-center gap-1 sm:gap-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white min-w-20 sm:min-w-0 px-2 sm:px-4 py-2 text-xs sm:text-sm whitespace-nowrap"
                >
                  <ImageIcon className="w-4 h-4" />
                  <span>Content</span>
                </TabsTrigger>
                <TabsTrigger
                  value="testimonials"
                  className="flex items-center justify-center gap-1 sm:gap-2 data-[state=active]:bg-green-500 data-[state=active]:text-white min-w-20 sm:min-w-0 px-2 sm:px-4 py-2 text-xs sm:text-sm whitespace-nowrap"
                >
                  <Star className="w-4 h-4" />
                  <span>
                    Testimonials ({formData.testimonials?.length || 0})
                  </span>
                </TabsTrigger>
              </TabsList>

              {/* Content Tab */}
              <TabsContent value="content" className="space-y-6 mt-4">
                <Card className="border-0 shadow-lg pt-0 bg-white dark:bg-gray-800">
                  <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-t-lg py-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-xl">
                          Section Content
                        </CardTitle>
                        <CardDescription className="text-blue-100">
                          Manage testimonials section content
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Label
                          htmlFor="active-toggle"
                          className="text-sm text-white"
                        >
                          Active
                        </Label>
                        <Switch
                          id="active-toggle"
                          checked={formData.isActive}
                          onCheckedChange={(checked) => {
                            setFormData({ ...formData, isActive: checked });
                            toggleActive();
                          }}
                          className="data-[state=checked]:bg-green-500"
                        />
                        {formData.isActive ? (
                          <Eye className="w-5 h-5" />
                        ) : (
                          <EyeOff className="w-5 h-5" />
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-4">
                    <div>
                      <Label htmlFor="title">Section Title</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) =>
                          setFormData({ ...formData, title: e.target.value })
                        }
                        placeholder="Pilot's Testimonials"
                      />
                    </div>

                    <div>
                      <Label htmlFor="subtitle">Subtitle</Label>
                      <Input
                        id="subtitle"
                        value={formData.subtitle}
                        onChange={(e) =>
                          setFormData({ ...formData, subtitle: e.target.value })
                        }
                        placeholder="AVIATION EXCELLENCE"
                      />
                    </div>

                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            description: e.target.value,
                          })
                        }
                        placeholder="What our pilots say about their training experience"
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Testimonials Tab */}
              <TabsContent value="testimonials" className="space-y-6 mt-4">
                <Card className="shadow-xl border-0 bg-white dark:bg-gray-800">
                  <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-t-lg py-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-xl">
                          Testimonials List
                        </CardTitle>
                        <CardDescription className="text-green-100">
                          Add and manage pilot testimonials
                        </CardDescription>
                      </div>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="bg-white text-green-600 hover:bg-green-50"
                        onClick={addTestimonial}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Testimonial
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-6">
                    {formData.testimonials &&
                    formData.testimonials.length > 0 ? (
                      <div className="space-y-4">
                        {formData.testimonials.map((testimonial, index) => (
                          <Collapsible key={index} className="group">
                            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200">
                              <CardHeader className="p-4">
                                <div className="flex items-center justify-between">
                                  {/* Left Section - Avatar + Info */}
                                  <div className="flex items-center gap-3 flex-1 min-w-0">
                                    {/* Avatar */}
                                    <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-600 shrink-0 bg-gray-100 dark:bg-gray-700">
                                      {avatarPreviews[index] ||
                                      testimonial.avatar ? (
                                        <Image
                                          src={
                                            avatarPreviews[index] ||
                                            testimonial.avatar
                                          }
                                          alt={
                                            testimonial.name || "Testimonial"
                                          }
                                          fill
                                          className="object-cover"
                                        />
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400 font-semibold text-lg">
                                          {testimonial.fallback || "?"}
                                        </div>
                                      )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 mb-0.5">
                                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                          Testimonial {index + 1}
                                        </span>
                                        <div className="flex items-center gap-0.5">
                                          {[
                                            ...Array(testimonial.rating || 5),
                                          ].map((_, i) => (
                                            <Star
                                              key={i}
                                              className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400"
                                            />
                                          ))}
                                        </div>
                                      </div>
                                      <h3 className="font-semibold text-base text-gray-900 dark:text-white truncate">
                                        {testimonial.name ||
                                          "Unnamed Testimonial"}
                                      </h3>
                                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                                        {testimonial.position &&
                                        testimonial.company
                                          ? `${testimonial.position} at ${testimonial.company}`
                                          : testimonial.position ||
                                            testimonial.company ||
                                            "No position"}
                                      </p>
                                      {testimonial.comment && (
                                        <p className="text-sm text-gray-700 dark:text-gray-300 mt-1 line-clamp-2">
                                          {testimonial.comment}
                                        </p>
                                      )}
                                    </div>
                                  </div>

                                  {/* Right Section - Actions */}
                                  <div className="flex items-center gap-1 shrink-0 ml-2">
                                    <CollapsibleTrigger asChild>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
                                      >
                                        <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]:rotate-180" />
                                      </Button>
                                    </CollapsibleTrigger>
                                    <Button
                                      type="button"
                                      onClick={() => removeTestimonial(index)}
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              </CardHeader>
                              <CollapsibleContent>
                                <CardContent className="space-y-4">
                                  <div>
                                    <Label>Avatar Image</Label>
                                    <div className="mt-2">
                                      {avatarPreviews[index] ||
                                      testimonial.avatar ? (
                                        <div className="space-y-3">
                                          <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-blue-100 shadow-sm mx-auto">
                                            <Image
                                              src={
                                                avatarPreviews[index] ||
                                                testimonial.avatar
                                              }
                                              alt={testimonial.name}
                                              fill
                                              className="object-cover"
                                            />
                                          </div>
                                          <div className="flex items-center justify-center gap-2">
                                            <Button
                                              type="button"
                                              variant="outline"
                                              size="sm"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setCurrentAvatarIndex(index);
                                                setMediaLibraryOpen(true);
                                              }}
                                              className="border-2 border-purple-300 hover:border-purple-500 hover:bg-purple-50"
                                            >
                                              <ImageIcon className="w-4 h-4 mr-2" />
                                              Select from Library
                                            </Button>
                                            <label
                                              htmlFor={`avatar-${index}`}
                                              className="cursor-pointer inline-flex items-center px-3 py-1.5 border-2 border-gray-300 rounded-md hover:bg-gray-50 text-sm"
                                            >
                                              <Upload className="h-4 w-4 mr-2" />
                                              Change Avatar
                                            </label>
                                            <input
                                              id={`avatar-${index}`}
                                              type="file"
                                              accept="image/*"
                                              className="hidden"
                                              onChange={(e) =>
                                                handleAvatarChange(index, e)
                                              }
                                            />
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="border-2 border-dashed rounded-xl p-6 text-center">
                                          <Upload className="mx-auto h-10 w-10 text-gray-400 mb-2" />
                                          <p className="text-sm font-medium text-gray-700 mb-2">
                                            Upload or Select from Library
                                          </p>
                                          <div className="flex items-center justify-center gap-2">
                                            <Button
                                              type="button"
                                              variant="outline"
                                              size="sm"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setCurrentAvatarIndex(index);
                                                setMediaLibraryOpen(true);
                                              }}
                                              className="border-2 border-purple-300 hover:border-purple-500 hover:bg-purple-50"
                                            >
                                              <ImageIcon className="w-4 h-4 mr-2" />
                                              Select from Library
                                            </Button>
                                            <label
                                              htmlFor={`avatar-${index}`}
                                              className="cursor-pointer inline-flex items-center px-3 py-1.5 border-2 border-gray-300 rounded-md hover:bg-gray-50 text-sm"
                                            >
                                              <Upload className="h-4 w-4 mr-2" />
                                              Upload Avatar
                                            </label>
                                            <input
                                              id={`avatar-${index}`}
                                              type="file"
                                              accept="image/*"
                                              className="hidden"
                                              onChange={(e) =>
                                                handleAvatarChange(index, e)
                                              }
                                            />
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <Label>Name</Label>
                                      <Input
                                        value={testimonial.name}
                                        onChange={(e) =>
                                          updateTestimonial(
                                            index,
                                            "name",
                                            e.target.value
                                          )
                                        }
                                        placeholder="Captain Michael Anderson"
                                      />
                                    </div>

                                    <div>
                                      <Label>Fallback (Initials)</Label>
                                      <Input
                                        value={testimonial.fallback}
                                        onChange={(e) =>
                                          updateTestimonial(
                                            index,
                                            "fallback",
                                            e.target.value
                                          )
                                        }
                                        placeholder="MA"
                                        maxLength={2}
                                      />
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <Label>Position</Label>
                                      <Input
                                        value={testimonial.position}
                                        onChange={(e) =>
                                          updateTestimonial(
                                            index,
                                            "position",
                                            e.target.value
                                          )
                                        }
                                        placeholder="Commercial Pilot"
                                      />
                                    </div>

                                    <div>
                                      <Label>Company</Label>
                                      <Input
                                        value={testimonial.company}
                                        onChange={(e) =>
                                          updateTestimonial(
                                            index,
                                            "company",
                                            e.target.value
                                          )
                                        }
                                        placeholder="Regional Airlines"
                                      />
                                    </div>
                                  </div>

                                  <div>
                                    <Label>Rating (1-5)</Label>
                                    <div className="flex items-center gap-2 mt-2">
                                      {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                          key={star}
                                          type="button"
                                          onClick={() =>
                                            updateTestimonial(
                                              index,
                                              "rating",
                                              star
                                            )
                                          }
                                          className="focus:outline-none"
                                        >
                                          <Star
                                            className={`h-6 w-6 ${
                                              star <= testimonial.rating
                                                ? "fill-yellow-400 text-yellow-400"
                                                : "text-gray-300"
                                            }`}
                                          />
                                        </button>
                                      ))}
                                      <span className="ml-2 text-sm text-gray-600">
                                        {testimonial.rating}/5
                                      </span>
                                    </div>
                                  </div>

                                  <div>
                                    <Label>Comment/Feedback</Label>
                                    <Textarea
                                      value={testimonial.comment}
                                      onChange={(e) =>
                                        updateTestimonial(
                                          index,
                                          "comment",
                                          e.target.value
                                        )
                                      }
                                      placeholder="Personal Wings provided exceptional training..."
                                      rows={4}
                                    />
                                  </div>
                                </CardContent>
                              </CollapsibleContent>
                            </Card>
                          </Collapsible>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <p>
                          No testimonials yet. Click "Add Testimonial" to get
                          started.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardContent className="pt-6 border-t">
            <div className="flex justify-end">
              <Button
                type="submit"
                className="h-12 px-8 text-base bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                disabled={saving || loading}
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>

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
        open={!!previewTestimonial}
        onOpenChange={(open) => !open && setPreviewTestimonial(null)}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Testimonial Preview</DialogTitle>
            <DialogDescription>
              Preview how your testimonial will appear to users
            </DialogDescription>
          </DialogHeader>
          {previewTestimonial && (
            <div className="space-y-6 mt-4">
              {/* Avatar & Header */}
              <div className="flex items-center gap-4">
                <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-gray-200 shrink-0 bg-gray-100">
                  {previewTestimonial.avatar ? (
                    <img
                      src={previewTestimonial.avatar}
                      alt={previewTestimonial.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 font-semibold text-2xl">
                      {previewTestimonial.fallback || "?"}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold">
                    {previewTestimonial.name || "Unnamed"}
                  </h3>
                  <p className="text-muted-foreground">
                    {previewTestimonial.position && previewTestimonial.company
                      ? `${previewTestimonial.position} at ${previewTestimonial.company}`
                      : previewTestimonial.position ||
                        previewTestimonial.company ||
                        "No position"}
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    {[...Array(previewTestimonial.rating || 5)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-5 h-5 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                    <span className="ml-2 text-sm text-muted-foreground">
                      {previewTestimonial.rating}/5
                    </span>
                  </div>
                </div>
              </div>

              {/* Comment */}
              {previewTestimonial.comment && (
                <div className="p-4 border rounded-lg bg-muted/50">
                  <p className="text-base leading-relaxed">
                    {previewTestimonial.comment}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Media Library Selector */}
      <MediaLibrarySelector
        open={mediaLibraryOpen}
        onOpenChange={setMediaLibraryOpen}
        onSelect={(url) => {
          if (currentAvatarIndex !== null) {
            setAvatarPreviews({
              ...avatarPreviews,
              [currentAvatarIndex]: url,
            });
            updateTestimonial(currentAvatarIndex, "avatar", url);
            setMediaLibraryOpen(false);
            setCurrentAvatarIndex(null);
          }
        }}
        title="Select Testimonial Avatar"
      />
    </div>
  );
}
