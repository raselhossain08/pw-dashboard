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
  Calendar,
  Clock,
  MapPin,
  Eye,
  EyeOff,
  Search,
  ChevronDown,
  Download,
  Copy,
  ExternalLink,
  Loader2,
  FileText,
  Settings,
} from "lucide-react";
import { useEvents } from "@/hooks/useEvents";
import Image from "next/image";
import { uploadService } from "@/services/upload.service";
import { RichTextEditor } from "@/components/shared/RichTextEditor";
import { MediaLibrarySelector } from "@/components/cms/MediaLibrarySelector";
import type {
  Events,
  UpdateEventsDto,
  Event,
  SeoMeta,
} from "@/lib/types/events";
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

export function EventsEditor() {
  const {
    events,
    loading,
    saving,
    uploadProgress,
    fetchEvents,
    updateEvents,
    updateEventsWithMedia,
    exportEvents,
    refreshEvents,
  } = useEvents();

  const [activeTab, setActiveTab] = useState("content");
  const [eventImageFiles, setEventImageFiles] = useState<{
    [key: number]: File;
  }>({});
  const [eventImagePreviews, setEventImagePreviews] = useState<{
    [key: number]: string;
  }>({});

  const [formData, setFormData] = useState<UpdateEventsDto>({
    title: "",
    subtitle: "",
    events: [],
    seo: {
      title: "",
      description: "",
      keywords: "",
      ogImage: "",
    },
  });

  const handleEventImageChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setEventImageFiles({ ...eventImageFiles, [index]: file });
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setEventImagePreviews({
          ...eventImagePreviews,
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

      // Add events array
      formData.events?.forEach((event, index) => {
        // Add event image file if present
        if (eventImageFiles[index]) {
          submitFormData.append(
            `events[${index}][image]`,
            eventImageFiles[index]
          );
        } else if (event.image && event.image.startsWith("http")) {
          // Use existing URL if no new file
          submitFormData.append(`events[${index}][image]`, event.image);
        }

        submitFormData.append(
          `events[${index}][id]`,
          String(event.id || index + 1)
        );
        submitFormData.append(`events[${index}][title]`, event.title || "");
        submitFormData.append(`events[${index}][date]`, event.date || "");
        submitFormData.append(`events[${index}][time]`, event.time || "");
        submitFormData.append(`events[${index}][venue]`, event.venue || "");
        submitFormData.append(
          `events[${index}][location]`,
          event.location || ""
        );
        submitFormData.append(`events[${index}][slug]`, event.slug || "");
        submitFormData.append(
          `events[${index}][description]`,
          event.description || ""
        );
        submitFormData.append(
          `events[${index}][price]`,
          String(event.price || 0)
        );
        submitFormData.append(
          `events[${index}][videoUrl]`,
          event.videoUrl || ""
        );

        // Add training content
        if (event.trainingContent && event.trainingContent.length > 0) {
          submitFormData.append(
            `events[${index}][trainingContent]`,
            JSON.stringify(event.trainingContent)
          );
        }

        // Add learning points
        if (event.learningPoints && event.learningPoints.length > 0) {
          submitFormData.append(
            `events[${index}][learningPoints]`,
            JSON.stringify(event.learningPoints)
          );
        }

        // Add FAQs
        if (event.faqs && event.faqs.length > 0) {
          submitFormData.append(
            `events[${index}][faqs]`,
            JSON.stringify(event.faqs)
          );
        }

        // Add instructors
        if (event.instructors && event.instructors.length > 0) {
          submitFormData.append(
            `events[${index}][instructors]`,
            JSON.stringify(event.instructors)
          );
        }

        // Add related events
        if (event.relatedEvents && event.relatedEvents.length > 0) {
          submitFormData.append(
            `events[${index}][relatedEvents]`,
            JSON.stringify(event.relatedEvents)
          );
        }
      });

      await updateEventsWithMedia(submitFormData);
      setEventImageFiles({});
      fetchEvents();
    } catch (error) {
      // Handle error silently or show user notification
    }
  };

  const addEvent = () => {
    const newId =
      formData.events && formData.events.length > 0
        ? Math.max(...formData.events.map((e) => e.id)) + 1
        : 1;
    setFormData({
      ...formData,
      events: [
        ...(formData.events || []),
        {
          id: newId,
          title: "",
          image: "",
          date: "",
          time: "",
          venue: "",
          location: "",
          slug: "",
          description: "",
        },
      ],
    });
  };

  const removeEvent = (index: number) => {
    setFormData({
      ...formData,
      events: formData.events?.filter((_, i) => i !== index) || [],
    });
    // Clean up image files and previews
    const newFiles = { ...eventImageFiles };
    const newPreviews = { ...eventImagePreviews };
    delete newFiles[index];
    delete newPreviews[index];
    setEventImageFiles(newFiles);
    setEventImagePreviews(newPreviews);
  };

  const updateEvent = (
    index: number,
    field: keyof Event,
    value: string | number
  ) => {
    const newEvents = [...(formData.events || [])];
    newEvents[index] = { ...newEvents[index], [field]: value };
    setFormData({ ...formData, events: newEvents });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }

  return (
    <EventsForm
      key={events?._id || "empty"}
      initialEvents={events || null}
      uploadProgress={uploadProgress}
      saving={saving}
      loading={loading}
      fetchEvents={fetchEvents}
      updateEvents={updateEvents}
      updateEventsWithMedia={updateEventsWithMedia}
      exportEvents={exportEvents}
      refreshEvents={refreshEvents}
    />
  );
}

function EventsForm({
  initialEvents,
  uploadProgress,
  saving,
  loading,
  fetchEvents,
  updateEvents,
  updateEventsWithMedia,
  exportEvents,
  refreshEvents,
}: {
  initialEvents: Events | null;
  uploadProgress: number;
  saving: boolean;
  loading: boolean;
  fetchEvents: () => Promise<void>;
  updateEvents: (dto: Partial<UpdateEventsDto>) => Promise<Events | null>;
  updateEventsWithMedia: (fd: FormData) => Promise<Events | null>;
  exportEvents: (format: "json" | "pdf") => Promise<void>;
  refreshEvents: () => Promise<void>;
}) {
  const [activeTab, setActiveTab] = useState("content");
  const [eventImageFiles, setEventImageFiles] = useState<{
    [key: number]: File;
  }>({});
  const [eventImagePreviews, setEventImagePreviews] = useState<{
    [key: number]: string;
  }>(() => {
    const previews: { [key: number]: string } = {};
    initialEvents?.events?.forEach((ev, index) => {
      if (ev.image) previews[index] = ev.image;
    });
    return previews;
  });
  const [perImageProgress, setPerImageProgress] = useState<{
    [key: number]: number;
  }>({});
  const [previewEvent, setPreviewEvent] = useState<Event | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedDescIndex, setSelectedDescIndex] = useState<number | null>(
    null
  );
  const [mediaLibraryOpen, setMediaLibraryOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState<number | null>(
    null
  );
  const [videoUploadProgress, setVideoUploadProgress] = useState<{
    [key: number]: number;
  }>({});
  const [uploadingVideo, setUploadingVideo] = useState<{
    [key: number]: boolean;
  }>({});

  const [formData, setFormData] = useState<UpdateEventsDto>(() => ({
    title: initialEvents?.title || "",
    subtitle: initialEvents?.subtitle || "",
    events: initialEvents?.events || [],
    seo: initialEvents?.seo || {
      title: "",
      description: "",
      keywords: "",
      ogImage: "",
    },
  }));

  // Sync formData when initialEvents changes (after update/refetch)
  useEffect(() => {
    if (initialEvents) {
      const newFormData = {
        title: initialEvents.title || "",
        subtitle: initialEvents.subtitle || "",
        events: initialEvents.events || [],
        seo: initialEvents.seo || {
          title: "",
          description: "",
          keywords: "",
          ogImage: "",
        },
      };

      setFormData(newFormData);

      // Update previews with existing images
      const previews: { [key: number]: string } = {};
      initialEvents.events?.forEach((ev, index) => {
        if (ev.image) previews[index] = ev.image;
      });
      setEventImagePreviews(previews);
    }
  }, [initialEvents]);

  const handleEventImageChange = async (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setEventImageFiles({ ...eventImageFiles, [index]: file });
    setPerImageProgress((p) => ({ ...p, [index]: 0 }));
    try {
      const result = await uploadService.uploadFile(file, {
        type: "image",
        onProgress: (progress) => {
          setPerImageProgress((p) => ({ ...p, [index]: progress.percentage }));
        },
      });
      setEventImagePreviews({ ...eventImagePreviews, [index]: result.url });
      const newEvents = [...(formData.events || [])];
      if (newEvents[index]) {
        newEvents[index] = { ...newEvents[index], image: result.url } as Event;
        setFormData({ ...formData, events: newEvents });
      }
    } catch (err) {
      setPerImageProgress((p) => ({ ...p, [index]: 0 }));
      // Handle error silently or show user notification
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const submitFormData = new FormData();
      submitFormData.append("title", formData.title || "");
      submitFormData.append("subtitle", formData.subtitle || "");

      // Add SEO data
      if (formData.seo) {
        submitFormData.append("seo[title]", formData.seo.title || "");
        submitFormData.append(
          "seo[description]",
          formData.seo.description || ""
        );
        submitFormData.append("seo[keywords]", formData.seo.keywords || "");
        submitFormData.append("seo[ogImage]", formData.seo.ogImage || "");
      }

      formData.events?.forEach((event, index) => {
        if (eventImageFiles[index]) {
          submitFormData.append(
            `events[${index}][image]`,
            eventImageFiles[index]
          );
        } else if (event.image && event.image.startsWith("http")) {
          submitFormData.append(`events[${index}][image]`, event.image);
        }
        submitFormData.append(
          `events[${index}][id]`,
          String(event.id || index + 1)
        );
        submitFormData.append(`events[${index}][title]`, event.title || "");
        submitFormData.append(`events[${index}][date]`, event.date || "");
        submitFormData.append(`events[${index}][time]`, event.time || "");
        submitFormData.append(`events[${index}][venue]`, event.venue || "");
        submitFormData.append(
          `events[${index}][location]`,
          event.location || ""
        );
        submitFormData.append(`events[${index}][slug]`, event.slug || "");
        submitFormData.append(
          `events[${index}][description]`,
          event.description || ""
        );
        submitFormData.append(
          `events[${index}][price]`,
          String(event.price || 0)
        );
        submitFormData.append(
          `events[${index}][videoUrl]`,
          event.videoUrl || ""
        );

        // Add nested data as JSON strings
        if (event.trainingContent && event.trainingContent.length > 0) {
          submitFormData.append(
            `events[${index}][trainingContent]`,
            JSON.stringify(event.trainingContent)
          );
        }

        if (event.learningPoints && event.learningPoints.length > 0) {
          submitFormData.append(
            `events[${index}][learningPoints]`,
            JSON.stringify(event.learningPoints)
          );
        }

        if (event.faqs && event.faqs.length > 0) {
          submitFormData.append(
            `events[${index}][faqs]`,
            JSON.stringify(event.faqs)
          );
        }

        if (event.instructors && event.instructors.length > 0) {
          submitFormData.append(
            `events[${index}][instructors]`,
            JSON.stringify(event.instructors)
          );
        }

        if (event.relatedEvents && event.relatedEvents.length > 0) {
          submitFormData.append(
            `events[${index}][relatedEvents]`,
            JSON.stringify(event.relatedEvents)
          );
        }
      });

      const result = await updateEventsWithMedia(submitFormData);

      if (result) {
        // Directly update formData with the response
        setFormData({
          title: result.title || "",
          subtitle: result.subtitle || "",
          events: result.events || [],
          seo: result.seo || {
            title: "",
            description: "",
            keywords: "",
            ogImage: "",
          },
        });

        // Update previews with existing images
        const previews: { [key: number]: string } = {};
        result.events?.forEach((ev, index) => {
          if (ev.image) previews[index] = ev.image;
        });
        setEventImagePreviews(previews);
      }

      setEventImageFiles({});
      // Don't call refreshEvents here - we already have the updated data from result
    } catch (error) {
      // Handle error silently or show user notification
    }
  };

  const addEvent = () => {
    const newId =
      formData.events && formData.events.length > 0
        ? Math.max(...formData.events.map((e) => e.id)) + 1
        : 1;

    const newEvent = {
      id: newId,
      title: "",
      image: "",
      date: "",
      time: "",
      venue: "",
      location: "",
      slug: "",
      description: "",
    };

    const updatedEvents = [...(formData.events || []), newEvent];

    setFormData({
      ...formData,
      events: updatedEvents,
    });
  };

  const removeEvent = (index: number) => {
    setFormData({
      ...formData,
      events: formData.events?.filter((_, i) => i !== index) || [],
    });
    const newFiles = { ...eventImageFiles };
    const newPreviews = { ...eventImagePreviews };
    delete newFiles[index];
    delete newPreviews[index];
    setEventImageFiles(newFiles);
    setEventImagePreviews(newPreviews);
  };

  const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const updateEvent = (
    index: number,
    field: keyof Event,
    value: string | number
  ) => {
    const newEvents = [...(formData.events || [])];
    newEvents[index] = { ...newEvents[index], [field]: value };

    // Auto-generate slug when title changes
    if (field === "title" && typeof value === "string") {
      const slug = generateSlug(value);
      newEvents[index] = { ...newEvents[index], slug };
    }

    setFormData({ ...formData, events: newEvents });
  };

  const handleVideoUpload = async (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      alert("Please select a video file");
      return;
    }

    setUploadingVideo({ ...uploadingVideo, [index]: true });
    setVideoUploadProgress({ ...videoUploadProgress, [index]: 0 });

    try {
      const result = await uploadService.uploadFile(file, {
        type: "video",
        onProgress: (progress) => {
          setVideoUploadProgress({
            ...videoUploadProgress,
            [index]: progress.percentage,
          });
        },
      });

      const newEvents = [...(formData.events || [])];
      if (newEvents[index]) {
        newEvents[index] = {
          ...newEvents[index],
          videoUrl: result.url,
        } as Event;
        setFormData({ ...formData, events: newEvents });
      }
    } catch (err) {
      alert("Video upload failed. Please try again.");
    } finally {
      setUploadingVideo({ ...uploadingVideo, [index]: false });
      setVideoUploadProgress({ ...videoUploadProgress, [index]: 0 });
    }
  };

  const handleExport = async (format: "json" | "pdf") => {
    setIsExporting(true);
    try {
      await exportEvents(format);
    } catch (error) {
      // Handle error silently or show user notification
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <Badge variant="default">
            <Eye className="w-3 h-3 mr-1" /> Events Section
          </Badge>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            onClick={() => {
              if (formData.events && formData.events.length > 0) {
                setPreviewEvent(formData.events[0]);
              }
            }}
            disabled={
              saving ||
              loading ||
              !formData.events ||
              formData.events.length === 0
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
            onClick={refreshEvents}
            disabled={saving || loading}
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </div>

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
            <Calendar className="w-4 h-4" />
            <span>Content</span>
          </TabsTrigger>
          <TabsTrigger
            value="events"
            className="flex items-center justify-center gap-1 sm:gap-2 data-[state=active]:bg-green-500 data-[state=active]:text-white min-w-20 sm:min-w-0 px-2 sm:px-4 py-2 text-xs sm:text-sm whitespace-nowrap"
          >
            <MapPin className="w-4 h-4" />
            <span>Events</span>
          </TabsTrigger>
          <TabsTrigger
            value="seo"
            className="flex items-center justify-center gap-1 sm:gap-2 data-[state=active]:bg-purple-500 data-[state=active]:text-white min-w-20 sm:min-w-0 px-2 sm:px-4 py-2 text-xs sm:text-sm whitespace-nowrap"
          >
            <Settings className="w-4 h-4" />
            <span>SEO</span>
          </TabsTrigger>
        </TabsList>

        <form onSubmit={handleSubmit}>
          <TabsContent value="content" className="space-y-6">
            <Card className="border-0 shadow-lg pt-0 bg-white dark:bg-gray-800">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-t-lg py-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">Section Content</CardTitle>
                    <CardDescription className="text-blue-100">
                      Manage the main title and subtitle for events section
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-base font-semibold">
                    Section Title
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="Upcoming Events"
                    className="text-base h-10"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subtitle" className="text-base font-semibold">
                    Section Subtitle
                  </Label>
                  <Input
                    id="subtitle"
                    value={formData.subtitle}
                    onChange={(e) =>
                      setFormData({ ...formData, subtitle: e.target.value })
                    }
                    placeholder="JOIN OUR AVIATION COMMUNITY"
                    className="text-base h-10"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="events" className="space-y-6">
            <Card className="shadow-xl border-0 bg-white dark:bg-gray-800">
              <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-t-lg py-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">Events List</CardTitle>
                    <CardDescription className="text-green-100">
                      Add and manage individual event items
                    </CardDescription>
                  </div>
                  <Button
                    type="button"
                    onClick={addEvent}
                    variant="secondary"
                    size="sm"
                    className="bg-white text-green-600 hover:bg-green-50"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Event
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                {formData.events?.map((event, index) => (
                  <Collapsible key={index} className="group">
                    <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200">
                      <CardHeader className="p-4">
                        <div className="flex items-center justify-between">
                          {/* Left Section - Event Info */}
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            {/* Event Image Thumbnail */}
                            <div className="relative w-16 h-16 rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-600 shrink-0 bg-gray-100 dark:bg-gray-700">
                              {eventImagePreviews[index] || event.image ? (
                                <Image
                                  src={eventImagePreviews[index] || event.image}
                                  alt={event.title || "Event"}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Calendar className="w-8 h-8 text-gray-400" />
                                </div>
                              )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                  Event {index + 1}
                                </span>
                                <Badge
                                  variant="secondary"
                                  className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 text-xs px-2 py-0"
                                >
                                  ID: {event.id}
                                </Badge>
                              </div>
                              <h3 className="font-semibold text-base text-gray-900 dark:text-white truncate">
                                {event.title || "Untitled Event"}
                              </h3>
                              <div className="flex items-center gap-3 mt-1 text-sm text-gray-600 dark:text-gray-400">
                                {event.date && (
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-3.5 h-3.5" />
                                    {event.date}
                                  </span>
                                )}
                                {event.location && (
                                  <span className="flex items-center gap-1">
                                    <MapPin className="w-3.5 h-3.5" />
                                    {event.location}
                                  </span>
                                )}
                              </div>
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
                                disabled={saving || loading}
                              >
                                <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]:rotate-180" />
                              </Button>
                            </CollapsibleTrigger>
                            <Button
                              type="button"
                              onClick={() => setPreviewEvent(event)}
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-green-500 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
                              title="Preview Event"
                              disabled={saving || loading}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              onClick={() => removeEvent(index)}
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                              disabled={saving || loading}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CollapsibleContent>
                        <CardContent className="space-y-4">
                          <div className="space-y-2">
                            <Label className="text-sm font-semibold flex items-center gap-2">
                              <ImageIcon className="w-4 h-4" />
                              Event Image
                            </Label>
                            <div
                              className={`relative border-2 border-dashed rounded-xl p-4 text-center transition-all duration-300 ${
                                perImageProgress[index] > 0 &&
                                perImageProgress[index] < 100
                                  ? "border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 shadow-lg"
                                  : "border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 cursor-pointer bg-white dark:bg-gray-800 hover:shadow-md"
                              }`}
                            >
                              {perImageProgress[index] > 0 &&
                              perImageProgress[index] < 100 ? (
                                <div className="space-y-4 py-4">
                                  <div className="relative">
                                    <div className="mx-auto h-16 w-16 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center animate-pulse">
                                      <Upload className="h-8 w-8 text-white animate-bounce" />
                                    </div>
                                  </div>
                                  <div className="space-y-2">
                                    <p className="text-lg font-bold text-blue-700 dark:text-blue-300">
                                      Uploading Image...
                                    </p>
                                    <div className="flex items-center justify-center gap-2">
                                      <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></div>
                                      <p className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">
                                        {perImageProgress[index]}%
                                      </p>
                                      <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></div>
                                    </div>
                                  </div>
                                  <div className="space-y-2">
                                    <Progress
                                      value={perImageProgress[index]}
                                      className="w-full h-4 bg-gray-200 dark:bg-gray-700"
                                    />
                                    <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                                      <span>0%</span>
                                      <span className="font-semibold text-blue-600 dark:text-blue-400">
                                        {perImageProgress[index]}% Complete
                                      </span>
                                      <span>100%</span>
                                    </div>
                                  </div>
                                  <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                                    <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-ping"></div>
                                    <span>Please wait...</span>
                                  </div>
                                </div>
                              ) : eventImagePreviews[index] ? (
                                <div className="space-y-3">
                                  <div className="relative w-full h-48 rounded-xl overflow-hidden border-2 border-green-200 dark:border-green-800 shadow-md mx-auto max-w-md group">
                                    <Image
                                      src={eventImagePreviews[index]}
                                      alt={`Event ${index + 1}`}
                                      fill
                                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                                      unoptimized
                                    />
                                    <div className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-lg">
                                      <div className="h-2 w-2 rounded-full bg-white animate-pulse"></div>
                                      Uploaded
                                    </div>
                                  </div>
                                  <div className="flex items-center justify-center gap-2">
                                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                                    <p className="text-sm text-green-700 dark:text-green-400 font-semibold">
                                      Image Ready to Save
                                    </p>
                                  </div>
                                  <div className="flex items-center justify-center gap-2">
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        setCurrentImageIndex(index);
                                        setMediaLibraryOpen(true);
                                      }}
                                      className="border-2 border-purple-300 hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all"
                                    >
                                      <ImageIcon className="w-4 h-4 mr-2" />
                                      Select from Library
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        const newFiles = { ...eventImageFiles };
                                        const newPreviews = {
                                          ...eventImagePreviews,
                                        };
                                        delete newFiles[index];
                                        newPreviews[index] = event.image || "";
                                        setEventImageFiles(newFiles);
                                        setEventImagePreviews(newPreviews);
                                        setPerImageProgress((p) => {
                                          const updated = { ...p };
                                          delete updated[index];
                                          return updated;
                                        });
                                      }}
                                      className="border-2 border-blue-300 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
                                    >
                                      <RefreshCw className="w-4 h-4 mr-2" />
                                      Change Upload
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <div className="text-center py-10">
                                  <div className="relative inline-block mb-4">
                                    <Upload className="mx-auto h-14 w-14 text-gray-400 dark:text-gray-500" />
                                    <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-blue-500 flex items-center justify-center">
                                      <Plus className="h-3 w-3 text-white" />
                                    </div>
                                  </div>
                                  <p className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                    Upload or Select from Library
                                  </p>
                                  <div className="flex items-center justify-center gap-3 mb-4 relative z-10">
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setCurrentImageIndex(index);
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
                                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
                                    PNG, JPG, GIF up to 10MB
                                  </p>
                                  <div className="mt-2 flex items-center justify-center gap-2 text-xs text-gray-400">
                                    <ImageIcon className="w-3 h-3" />
                                    <span>Recommended: 1200x630px</span>
                                  </div>
                                </div>
                              )}
                              {!(
                                perImageProgress[index] > 0 &&
                                perImageProgress[index] < 100
                              ) &&
                                !eventImagePreviews[index] && (
                                  <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) =>
                                      handleEventImageChange(index, e)
                                    }
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed pointer-events-none"
                                    style={{ pointerEvents: "none" }}
                                    disabled={saving || loading}
                                  />
                                )}
                              <div
                                className={`absolute inset-0 ${
                                  perImageProgress[index] > 0 &&
                                  perImageProgress[index] < 100
                                    ? "pointer-events-none"
                                    : eventImagePreviews[index]
                                    ? "pointer-events-none"
                                    : "cursor-pointer"
                                }`}
                                onClick={(e) => {
                                  if (
                                    !eventImagePreviews[index] &&
                                    !(
                                      perImageProgress[index] > 0 &&
                                      perImageProgress[index] < 100
                                    )
                                  ) {
                                    const fileInput = document.getElementById(
                                      `event-image-${index}`
                                    ) as HTMLInputElement;
                                    if (fileInput) {
                                      fileInput.click();
                                    }
                                  }
                                }}
                              >
                                <input
                                  id={`event-image-${index}`}
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) =>
                                    handleEventImageChange(index, e)
                                  }
                                  className="hidden"
                                  disabled={saving || loading}
                                />
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-sm font-semibold flex items-center gap-2">
                              Title
                              <Badge variant="secondary" className="text-xs">
                                Auto-generates slug
                              </Badge>
                            </Label>
                            <Input
                              value={event.title}
                              onChange={(e) =>
                                updateEvent(index, "title", e.target.value)
                              }
                              placeholder="Event title"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label className="text-sm font-semibold">
                              Description (Rich Text)
                            </Label>
                            <RichTextEditor
                              content={event.description || ""}
                              onChange={(content) =>
                                updateEvent(index, "description", content)
                              }
                              placeholder="Write event description with rich formatting..."
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label className="text-sm font-semibold flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                Date
                              </Label>
                              <Input
                                type="date"
                                value={event.date}
                                onChange={(e) =>
                                  updateEvent(index, "date", e.target.value)
                                }
                                className="cursor-pointer"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm font-semibold flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                Time
                              </Label>
                              <Input
                                value={event.time}
                                onChange={(e) =>
                                  updateEvent(index, "time", e.target.value)
                                }
                                placeholder="9:00 am - 5:00 pm"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label className="text-sm font-semibold">
                                Venue
                              </Label>
                              <Input
                                value={event.venue}
                                onChange={(e) =>
                                  updateEvent(index, "venue", e.target.value)
                                }
                                placeholder="Personal Wings"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm font-semibold flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                Location
                              </Label>
                              <Input
                                value={event.location}
                                onChange={(e) =>
                                  updateEvent(index, "location", e.target.value)
                                }
                                placeholder="Florida"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label className="text-sm font-semibold">
                                Price ($)
                              </Label>
                              <Input
                                type="number"
                                value={event.price || 0}
                                onChange={(e) =>
                                  updateEvent(
                                    index,
                                    "price",
                                    Number(e.target.value)
                                  )
                                }
                                placeholder="3499"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm font-semibold flex items-center gap-2">
                                <FileText className="w-4 h-4" />
                                Video URL or Upload
                              </Label>
                              {uploadingVideo[index] ? (
                                <div className="space-y-2 p-4 border-2 border-blue-500 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                                      Uploading Video...
                                    </span>
                                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                                      {videoUploadProgress[index]}%
                                    </span>
                                  </div>
                                  <Progress
                                    value={videoUploadProgress[index]}
                                    className="h-3"
                                  />
                                  <p className="text-xs text-blue-600 dark:text-blue-400">
                                    Please wait while your video is being
                                    uploaded...
                                  </p>
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  <Input
                                    value={event.videoUrl || ""}
                                    onChange={(e) =>
                                      updateEvent(
                                        index,
                                        "videoUrl",
                                        e.target.value
                                      )
                                    }
                                    placeholder="https://youtube.com/... or upload below"
                                  />
                                  <div className="flex items-center gap-2">
                                    <div className="relative flex-1">
                                      <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full border-2 border-dashed hover:border-blue-500"
                                        onClick={() => {
                                          document
                                            .getElementById(
                                              `video-upload-${index}`
                                            )
                                            ?.click();
                                        }}
                                      >
                                        <Upload className="w-4 h-4 mr-2" />
                                        Upload Video
                                      </Button>
                                      <input
                                        id={`video-upload-${index}`}
                                        type="file"
                                        accept="video/*"
                                        onChange={(e) =>
                                          handleVideoUpload(index, e)
                                        }
                                        className="hidden"
                                      />
                                    </div>
                                    {event.videoUrl && (
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        onClick={() => {
                                          window.open(event.videoUrl, "_blank");
                                        }}
                                      >
                                        <ExternalLink className="w-4 h-4" />
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-sm font-semibold flex items-center gap-2">
                              URL Slug
                              <Badge
                                variant="outline"
                                className="text-xs bg-green-50 text-green-700 border-green-300"
                              >
                                Auto-generated from title
                              </Badge>
                            </Label>
                            <div className="flex gap-2">
                              <Input
                                value={event.slug}
                                onChange={(e) =>
                                  updateEvent(index, "slug", e.target.value)
                                }
                                placeholder="event-slug-url"
                                className="flex-1"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={() => {
                                  if (event.title) {
                                    updateEvent(
                                      index,
                                      "slug",
                                      generateSlug(event.title)
                                    );
                                  }
                                }}
                                title="Regenerate slug from title"
                              >
                                <RefreshCw className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>

                          {/* Training Content Section */}
                          <div className="space-y-3 pt-4 border-t">
                            <div className="flex items-center justify-between">
                              <Label className="text-base font-bold">
                                Training Content
                              </Label>
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  const updated = [...(formData.events || [])];
                                  if (!updated[index].trainingContent) {
                                    updated[index].trainingContent = [];
                                  }
                                  updated[index].trainingContent!.push({
                                    text: "",
                                  });
                                  setFormData({ ...formData, events: updated });
                                }}
                              >
                                <Plus className="w-3 h-3 mr-1" />
                                Add Item
                              </Button>
                            </div>
                            {event.trainingContent?.map((item, itemIndex) => (
                              <div key={itemIndex} className="flex gap-2">
                                <Input
                                  value={item.text}
                                  onChange={(e) => {
                                    const updated = [
                                      ...(formData.events || []),
                                    ];
                                    updated[index].trainingContent![
                                      itemIndex
                                    ].text = e.target.value;
                                    setFormData({
                                      ...formData,
                                      events: updated,
                                    });
                                  }}
                                  placeholder="Training content item"
                                />
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    const updated = [
                                      ...(formData.events || []),
                                    ];
                                    updated[index].trainingContent!.splice(
                                      itemIndex,
                                      1
                                    );
                                    setFormData({
                                      ...formData,
                                      events: updated,
                                    });
                                  }}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            ))}
                          </div>

                          {/* Learning Points Section */}
                          <div className="space-y-3 pt-4 border-t">
                            <div className="flex items-center justify-between">
                              <Label className="text-base font-bold">
                                Learning Points
                              </Label>
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  const updated = [...(formData.events || [])];
                                  if (!updated[index].learningPoints) {
                                    updated[index].learningPoints = [];
                                  }
                                  updated[index].learningPoints!.push({
                                    text: "",
                                  });
                                  setFormData({ ...formData, events: updated });
                                }}
                              >
                                <Plus className="w-3 h-3 mr-1" />
                                Add Point
                              </Button>
                            </div>
                            {event.learningPoints?.map((item, itemIndex) => (
                              <div key={itemIndex} className="flex gap-2">
                                <Input
                                  value={item.text}
                                  onChange={(e) => {
                                    const updated = [
                                      ...(formData.events || []),
                                    ];
                                    updated[index].learningPoints![
                                      itemIndex
                                    ].text = e.target.value;
                                    setFormData({
                                      ...formData,
                                      events: updated,
                                    });
                                  }}
                                  placeholder="Learning point"
                                />
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    const updated = [
                                      ...(formData.events || []),
                                    ];
                                    updated[index].learningPoints!.splice(
                                      itemIndex,
                                      1
                                    );
                                    setFormData({
                                      ...formData,
                                      events: updated,
                                    });
                                  }}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            ))}
                          </div>

                          {/* FAQs Section */}
                          <div className="space-y-3 pt-4 border-t">
                            <div className="flex items-center justify-between">
                              <Label className="text-base font-bold">
                                FAQs
                              </Label>
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  const updated = [...(formData.events || [])];
                                  if (!updated[index].faqs) {
                                    updated[index].faqs = [];
                                  }
                                  updated[index].faqs!.push({
                                    question: "",
                                    answer: "",
                                  });
                                  setFormData({ ...formData, events: updated });
                                }}
                              >
                                <Plus className="w-3 h-3 mr-1" />
                                Add FAQ
                              </Button>
                            </div>
                            {event.faqs?.map((faq, faqIndex) => (
                              <Card
                                key={faqIndex}
                                className="p-4 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 border-2 border-gray-200 dark:border-gray-700 shadow-sm"
                              >
                                <div className="space-y-3">
                                  <div className="flex items-start justify-between">
                                    <Badge
                                      variant="outline"
                                      className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                                    >
                                      FAQ {faqIndex + 1}
                                    </Badge>
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => {
                                        const updated = [
                                          ...(formData.events || []),
                                        ];
                                        updated[index].faqs!.splice(
                                          faqIndex,
                                          1
                                        );
                                        setFormData({
                                          ...formData,
                                          events: updated,
                                        });
                                      }}
                                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                  <div className="space-y-2">
                                    <Label className="text-sm font-semibold">
                                      Question
                                    </Label>
                                    <Input
                                      value={faq.question}
                                      onChange={(e) => {
                                        const updated = [
                                          ...(formData.events || []),
                                        ];
                                        updated[index].faqs![
                                          faqIndex
                                        ].question = e.target.value;
                                        setFormData({
                                          ...formData,
                                          events: updated,
                                        });
                                      }}
                                      placeholder="What is included in this event?"
                                      className="font-medium"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label className="text-sm font-semibold">
                                      Answer (Rich Text)
                                    </Label>
                                    <RichTextEditor
                                      content={faq.answer}
                                      onChange={(content) => {
                                        const updated = [
                                          ...(formData.events || []),
                                        ];
                                        updated[index].faqs![faqIndex].answer =
                                          content;
                                        setFormData({
                                          ...formData,
                                          events: updated,
                                        });
                                      }}
                                      placeholder="Provide a detailed answer with formatting..."
                                    />
                                  </div>
                                </div>
                              </Card>
                            ))}
                            {(!event.faqs || event.faqs.length === 0) && (
                              <div className="text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
                                <FileText className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  No FAQs added yet. Click "Add FAQ" to get
                                  started.
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Instructors Section */}
                          <div className="space-y-3 pt-4 border-t">
                            <div className="flex items-center justify-between">
                              <Label className="text-base font-bold">
                                Instructors
                              </Label>
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  const updated = [...(formData.events || [])];
                                  if (!updated[index].instructors) {
                                    updated[index].instructors = [];
                                  }
                                  updated[index].instructors!.push({
                                    name: "",
                                    title: "",
                                    image: "",
                                    bio: "",
                                    social: {},
                                  });
                                  setFormData({ ...formData, events: updated });
                                }}
                              >
                                <Plus className="w-3 h-3 mr-1" />
                                Add Instructor
                              </Button>
                            </div>
                            {event.instructors?.map(
                              (instructor, instrIndex) => (
                                <Card
                                  key={instrIndex}
                                  className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 border-2 border-blue-200 dark:border-blue-800 shadow-sm"
                                >
                                  <div className="space-y-3">
                                    <div className="flex items-start justify-between">
                                      <Badge
                                        variant="outline"
                                        className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                                      >
                                        Instructor {instrIndex + 1}
                                      </Badge>
                                      <Button
                                        type="button"
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => {
                                          const updated = [
                                            ...(formData.events || []),
                                          ];
                                          updated[index].instructors!.splice(
                                            instrIndex,
                                            1
                                          );
                                          setFormData({
                                            ...formData,
                                            events: updated,
                                          });
                                        }}
                                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                      <div>
                                        <Label className="text-xs font-semibold">
                                          Name
                                        </Label>
                                        <Input
                                          value={instructor.name}
                                          onChange={(e) => {
                                            const updated = [
                                              ...(formData.events || []),
                                            ];
                                            updated[index].instructors![
                                              instrIndex
                                            ].name = e.target.value;
                                            setFormData({
                                              ...formData,
                                              events: updated,
                                            });
                                          }}
                                          placeholder="John Doe"
                                        />
                                      </div>
                                      <div>
                                        <Label className="text-xs font-semibold">
                                          Title
                                        </Label>
                                        <Input
                                          value={instructor.title}
                                          onChange={(e) => {
                                            const updated = [
                                              ...(formData.events || []),
                                            ];
                                            updated[index].instructors![
                                              instrIndex
                                            ].title = e.target.value;
                                            setFormData({
                                              ...formData,
                                              events: updated,
                                            });
                                          }}
                                          placeholder="Chief Instructor"
                                        />
                                      </div>
                                    </div>
                                    <div>
                                      <Label className="text-xs font-semibold">
                                        Image URL
                                      </Label>
                                      <Input
                                        value={instructor.image}
                                        onChange={(e) => {
                                          const updated = [
                                            ...(formData.events || []),
                                          ];
                                          updated[index].instructors![
                                            instrIndex
                                          ].image = e.target.value;
                                          setFormData({
                                            ...formData,
                                            events: updated,
                                          });
                                        }}
                                        placeholder="https://..."
                                      />
                                      {instructor.image && (
                                        <div className="mt-2">
                                          <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-blue-300">
                                            <Image
                                              src={instructor.image}
                                              alt={
                                                instructor.name || "Instructor"
                                              }
                                              fill
                                              className="object-cover"
                                            />
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                    <div>
                                      <Label className="text-xs font-semibold">
                                        Bio (Rich Text)
                                      </Label>
                                      <RichTextEditor
                                        content={instructor.bio}
                                        onChange={(content) => {
                                          const updated = [
                                            ...(formData.events || []),
                                          ];
                                          updated[index].instructors![
                                            instrIndex
                                          ].bio = content;
                                          setFormData({
                                            ...formData,
                                            events: updated,
                                          });
                                        }}
                                        placeholder="Enter instructor biography with formatting..."
                                      />
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                      <div>
                                        <Label className="text-xs">
                                          Facebook
                                        </Label>
                                        <Input
                                          value={
                                            instructor.social?.facebook || ""
                                          }
                                          onChange={(e) => {
                                            const updated = [
                                              ...(formData.events || []),
                                            ];
                                            if (
                                              !updated[index].instructors![
                                                instrIndex
                                              ].social
                                            ) {
                                              updated[index].instructors![
                                                instrIndex
                                              ].social = {};
                                            }
                                            updated[index].instructors![
                                              instrIndex
                                            ].social!.facebook = e.target.value;
                                            setFormData({
                                              ...formData,
                                              events: updated,
                                            });
                                          }}
                                          placeholder="URL"
                                        />
                                      </div>
                                      <div>
                                        <Label className="text-xs">
                                          Twitter
                                        </Label>
                                        <Input
                                          value={
                                            instructor.social?.twitter || ""
                                          }
                                          onChange={(e) => {
                                            const updated = [
                                              ...(formData.events || []),
                                            ];
                                            if (
                                              !updated[index].instructors![
                                                instrIndex
                                              ].social
                                            ) {
                                              updated[index].instructors![
                                                instrIndex
                                              ].social = {};
                                            }
                                            updated[index].instructors![
                                              instrIndex
                                            ].social!.twitter = e.target.value;
                                            setFormData({
                                              ...formData,
                                              events: updated,
                                            });
                                          }}
                                          placeholder="URL"
                                        />
                                      </div>
                                      <div>
                                        <Label className="text-xs">
                                          Instagram
                                        </Label>
                                        <Input
                                          value={
                                            instructor.social?.instagram || ""
                                          }
                                          onChange={(e) => {
                                            const updated = [
                                              ...(formData.events || []),
                                            ];
                                            if (
                                              !updated[index].instructors![
                                                instrIndex
                                              ].social
                                            ) {
                                              updated[index].instructors![
                                                instrIndex
                                              ].social = {};
                                            }
                                            updated[index].instructors![
                                              instrIndex
                                            ].social!.instagram =
                                              e.target.value;
                                            setFormData({
                                              ...formData,
                                              events: updated,
                                            });
                                          }}
                                          placeholder="URL"
                                        />
                                      </div>
                                      <div>
                                        <Label className="text-xs">
                                          LinkedIn
                                        </Label>
                                        <Input
                                          value={
                                            instructor.social?.linkedin || ""
                                          }
                                          onChange={(e) => {
                                            const updated = [
                                              ...(formData.events || []),
                                            ];
                                            if (
                                              !updated[index].instructors![
                                                instrIndex
                                              ].social
                                            ) {
                                              updated[index].instructors![
                                                instrIndex
                                              ].social = {};
                                            }
                                            updated[index].instructors![
                                              instrIndex
                                            ].social!.linkedin = e.target.value;
                                            setFormData({
                                              ...formData,
                                              events: updated,
                                            });
                                          }}
                                          placeholder="URL"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </Card>
                              )
                            )}
                            {(!event.instructors ||
                              event.instructors.length === 0) && (
                              <div className="text-center py-8 bg-blue-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-blue-300 dark:border-blue-600">
                                <ImageIcon className="w-12 h-12 mx-auto text-blue-400 mb-2" />
                                <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                                  No instructors added yet. Click "Add
                                  Instructor" to get started.
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Related Events Section */}
                          <div className="space-y-3 pt-4 border-t">
                            <div className="flex items-center justify-between">
                              <Label className="text-base font-bold">
                                Related Events
                              </Label>
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  const updated = [...(formData.events || [])];
                                  if (!updated[index].relatedEvents) {
                                    updated[index].relatedEvents = [];
                                  }
                                  updated[index].relatedEvents!.push({
                                    title: "",
                                    image: "",
                                    slug: "",
                                    badge: "",
                                  });
                                  setFormData({ ...formData, events: updated });
                                }}
                              >
                                <Plus className="w-3 h-3 mr-1" />
                                Add Related Event
                              </Button>
                            </div>
                            {event.relatedEvents?.map((related, relIndex) => (
                              <Card key={relIndex} className="p-4 bg-gray-50">
                                <div className="space-y-3">
                                  <div className="flex items-start justify-between">
                                    <Label className="text-sm font-bold">
                                      Related Event {relIndex + 1}
                                    </Label>
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => {
                                        const updated = [
                                          ...(formData.events || []),
                                        ];
                                        updated[index].relatedEvents!.splice(
                                          relIndex,
                                          1
                                        );
                                        setFormData({
                                          ...formData,
                                          events: updated,
                                        });
                                      }}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                  <div className="grid grid-cols-2 gap-3">
                                    <div>
                                      <Label className="text-xs">Title</Label>
                                      <Input
                                        value={related.title}
                                        onChange={(e) => {
                                          const updated = [
                                            ...(formData.events || []),
                                          ];
                                          updated[index].relatedEvents![
                                            relIndex
                                          ].title = e.target.value;
                                          setFormData({
                                            ...formData,
                                            events: updated,
                                          });
                                        }}
                                        placeholder="Event title"
                                      />
                                    </div>
                                    <div>
                                      <Label className="text-xs">
                                        Badge (Optional)
                                      </Label>
                                      <Input
                                        value={related.badge || ""}
                                        onChange={(e) => {
                                          const updated = [
                                            ...(formData.events || []),
                                          ];
                                          updated[index].relatedEvents![
                                            relIndex
                                          ].badge = e.target.value;
                                          setFormData({
                                            ...formData,
                                            events: updated,
                                          });
                                        }}
                                        placeholder="New Event"
                                      />
                                    </div>
                                  </div>
                                  <div>
                                    <Label className="text-xs">Image URL</Label>
                                    <Input
                                      value={related.image}
                                      onChange={(e) => {
                                        const updated = [
                                          ...(formData.events || []),
                                        ];
                                        updated[index].relatedEvents![
                                          relIndex
                                        ].image = e.target.value;
                                        setFormData({
                                          ...formData,
                                          events: updated,
                                        });
                                      }}
                                      placeholder="https://..."
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-xs">Slug</Label>
                                    <Input
                                      value={related.slug}
                                      onChange={(e) => {
                                        const updated = [
                                          ...(formData.events || []),
                                        ];
                                        updated[index].relatedEvents![
                                          relIndex
                                        ].slug = e.target.value;
                                        setFormData({
                                          ...formData,
                                          events: updated,
                                        });
                                      }}
                                      placeholder="event-slug"
                                    />
                                  </div>
                                </div>
                              </Card>
                            ))}
                          </div>
                        </CardContent>
                      </CollapsibleContent>
                    </Card>
                  </Collapsible>
                ))}

                {(!formData.events || formData.events.length === 0) && (
                  <div className="text-center py-12 text-gray-500">
                    <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">No events added yet</p>
                    <p className="text-sm">
                      Click Add Event to create your first event
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="seo" className="space-y-6">
            <Card className="border-0 shadow-lg bg-white dark:bg-gray-800">
              <CardHeader className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-t-lg py-3">
                <CardTitle className="text-xl">SEO Settings</CardTitle>
                <CardDescription className="text-purple-100">
                  Configure meta tags and search engine optimization settings
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="seo-title"
                    className="text-base font-semibold"
                  >
                    SEO Title
                  </Label>
                  <Input
                    id="seo-title"
                    value={formData.seo?.title || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        seo: {
                          ...formData.seo,
                          title: e.target.value,
                          description: formData.seo?.description || "",
                          keywords: formData.seo?.keywords || "",
                          ogImage: formData.seo?.ogImage || "",
                        },
                      })
                    }
                    placeholder="Events - Aviation Training"
                    className="text-base h-10"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Recommended: 50-60 characters
                  </p>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="seo-description"
                    className="text-base font-semibold"
                  >
                    SEO Description
                  </Label>
                  <Textarea
                    id="seo-description"
                    value={formData.seo?.description || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        seo: {
                          ...formData.seo,
                          title: formData.seo?.title || "",
                          description: e.target.value,
                          keywords: formData.seo?.keywords || "",
                          ogImage: formData.seo?.ogImage || "",
                        },
                      })
                    }
                    placeholder="Discover upcoming aviation training events and workshops..."
                    rows={4}
                    className="text-base resize-none"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Recommended: 150-160 characters
                  </p>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="seo-keywords"
                    className="text-base font-semibold"
                  >
                    SEO Keywords
                  </Label>
                  <Input
                    id="seo-keywords"
                    value={formData.seo?.keywords || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        seo: {
                          ...formData.seo,
                          title: formData.seo?.title || "",
                          description: formData.seo?.description || "",
                          keywords: e.target.value,
                          ogImage: formData.seo?.ogImage || "",
                        },
                      })
                    }
                    placeholder="aviation events, pilot training, workshops"
                    className="text-base h-10"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Separate keywords with commas
                  </p>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="seo-og-image"
                    className="text-base font-semibold"
                  >
                    Open Graph Image URL
                  </Label>
                  <Input
                    id="seo-og-image"
                    value={formData.seo?.ogImage || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        seo: {
                          ...formData.seo,
                          title: formData.seo?.title || "",
                          description: formData.seo?.description || "",
                          keywords: formData.seo?.keywords || "",
                          ogImage: e.target.value,
                        },
                      })
                    }
                    placeholder="https://example.com/og-image.jpg"
                    className="text-base h-10"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Image displayed when shared on social media (1200x630px
                    recommended)
                  </p>
                  {formData.seo?.ogImage && (
                    <div className="mt-3">
                      <div className="relative w-full max-w-md h-40 rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700">
                        <Image
                          src={formData.seo.ogImage}
                          alt="OG Image Preview"
                          fill
                          className="object-cover"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
                    SEO Preview
                  </h4>
                  <div className="space-y-1">
                    <div className="text-blue-600 dark:text-blue-400 text-lg font-medium">
                      {formData.seo?.title || "Events - Aviation Training"}
                    </div>
                    <div className="text-green-700 dark:text-green-400 text-xs">
                      www.example.com › events
                    </div>
                    <div className="text-gray-700 dark:text-gray-300 text-sm">
                      {formData.seo?.description ||
                        "Discover upcoming aviation training events..."}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {uploadProgress > 0 && uploadProgress < 100 && (
            <Card className="shadow-lg border-2 border-blue-500 bg-blue-50 dark:bg-blue-900/20">
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-blue-700 dark:text-blue-300">
                      Uploading...
                    </span>
                    <span className="font-bold text-blue-700 dark:text-blue-300">
                      {uploadProgress}%
                    </span>
                  </div>
                  <Progress value={uploadProgress} className="h-3" />
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="shadow-xl border-0 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 mt-20">
            <CardContent className="pt-3">
              <div className="flex flex-col sm:flex-row gap-4 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={fetchEvents}
                  className="h-12 px-6 text-base"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
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
        open={!!previewEvent}
        onOpenChange={(open) => !open && setPreviewEvent(null)}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Event Preview</DialogTitle>
            <DialogDescription>
              Preview how your event will appear to users
            </DialogDescription>
          </DialogHeader>
          {previewEvent && (
            <div className="space-y-6 mt-4">
              {/* Image */}
              {previewEvent.image && (
                <div className="relative w-full h-64 rounded-lg overflow-hidden">
                  <img
                    src={previewEvent.image}
                    alt={previewEvent.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Title & Meta */}
              <div>
                <h1 className="text-3xl font-bold">{previewEvent.title}</h1>
                {previewEvent.description && (
                  <p className="text-muted-foreground mt-2">
                    {previewEvent.description}
                  </p>
                )}
                <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                  {previewEvent.date && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {previewEvent.date}
                    </span>
                  )}
                  {previewEvent.time && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {previewEvent.time}
                    </span>
                  )}
                  {previewEvent.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {previewEvent.location}
                    </span>
                  )}
                </div>
                {previewEvent.venue && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Venue: {previewEvent.venue}
                  </p>
                )}
              </div>

              {/* Price */}
              {previewEvent.price !== undefined && (
                <div className="p-4 border rounded-lg">
                  <p className="text-2xl font-bold">${previewEvent.price}</p>
                </div>
              )}

              {/* Training Content */}
              {previewEvent.trainingContent &&
                previewEvent.trainingContent.length > 0 && (
                  <div className="space-y-4">
                    <h2 className="text-2xl font-semibold">Training Content</h2>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      {previewEvent.trainingContent.map((content, idx) => (
                        <li key={idx} className="text-muted-foreground">
                          {content.text}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

              {/* Learning Points */}
              {previewEvent.learningPoints &&
                previewEvent.learningPoints.length > 0 && (
                  <div className="space-y-4">
                    <h2 className="text-2xl font-semibold">Learning Points</h2>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      {previewEvent.learningPoints.map((point, idx) => (
                        <li key={idx} className="text-muted-foreground">
                          {point.text}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

              {/* Instructors */}
              {previewEvent.instructors &&
                previewEvent.instructors.length > 0 && (
                  <div className="space-y-4">
                    <h2 className="text-2xl font-semibold">Instructors</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                      {previewEvent.instructors.map((instructor, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-4 p-4 border rounded-lg"
                        >
                          {instructor.image && (
                            <div className="relative w-16 h-16 rounded-full overflow-hidden">
                              <img
                                src={instructor.image}
                                alt={instructor.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <div>
                            <h3 className="font-semibold">{instructor.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {instructor.title}
                            </p>
                            {instructor.bio && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {instructor.bio}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* FAQs */}
              {previewEvent.faqs && previewEvent.faqs.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-semibold">
                    Frequently Asked Questions
                  </h2>
                  <div className="space-y-4">
                    {previewEvent.faqs.map((faq, idx) => (
                      <div key={idx} className="p-4 border rounded-lg">
                        <h3 className="font-semibold mb-2">{faq.question}</h3>
                        <p className="text-muted-foreground">{faq.answer}</p>
                      </div>
                    ))}
                  </div>
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
          if (currentImageIndex !== null) {
            setEventImagePreviews({
              ...eventImagePreviews,
              [currentImageIndex]: url,
            });
            const newEvents = [...(formData.events || [])];
            if (newEvents[currentImageIndex]) {
              newEvents[currentImageIndex] = {
                ...newEvents[currentImageIndex],
                image: url,
              } as Event;
              setFormData({ ...formData, events: newEvents });
            }
            setCurrentImageIndex(null);
          }
        }}
        title="Select Event Image"
      />
    </div>
  );
}
