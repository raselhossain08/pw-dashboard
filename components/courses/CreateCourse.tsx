"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/context/ToastContext";
import { coursesService } from "@/services/courses.service";
import { uploadService } from "@/services/upload.service";
import { courseCategoriesService } from "@/services/course-categories.service";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import {
  CheckCircle,
  Plus,
  X,
  ImageIcon,
  ArrowLeft,
  Upload,
  Eye,
  Save,
  Trash2,
  Star,
  Award,
} from "lucide-react";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RichTextEditor } from "@/components/shared/RichTextEditor";
import { MediaLibrarySelector } from "@/components/cms/MediaLibrarySelector";

export default function CreateCourse() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const moduleId = searchParams.get("moduleId"); // Get moduleId from query params
  const { push } = useToast();
  const qc = useQueryClient();
  const [selectedCats, setSelectedCats] = React.useState<string[]>([]);
  const [customCategory, setCustomCategory] = React.useState<string>("");
  const [selectedTags, setSelectedTags] = React.useState<string[]>([]);
  const [customTag, setCustomTag] = React.useState<string>("");
  const [thumbnailFile, setThumbnailFile] = React.useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = React.useState<string>("");
  const [uploadProgress, setUploadProgress] = React.useState<number>(0);
  const [isUploading, setIsUploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [mediaLibraryOpen, setMediaLibraryOpen] = React.useState(false);
  const [instructors, setInstructors] = React.useState<any[]>([]);
  const [selectedInstructors, setSelectedInstructors] = React.useState<
    string[]
  >([]);
  const [level, setLevel] = React.useState<string>("beginner");
  const [type, setType] = React.useState<string>("theoretical");
  const [maxStudents, setMaxStudents] = React.useState<string>("20");
  const [activeTab, setActiveTab] = React.useState("basic");
  const [isSaving, setIsSaving] = React.useState(false);
  const [isDragging, setIsDragging] = React.useState(false);
  const [description, setDescription] = React.useState<string>("");
  const [content, setContent] = React.useState<string>("");
  const [isFeatured, setIsFeatured] = React.useState(false);
  const [providesCertificate, setProvidesCertificate] = React.useState(false);
  const [aircraftTypes, setAircraftTypes] = React.useState<string[]>([]);
  const [excerpt, setExcerpt] = React.useState("");
  const [language, setLanguage] = React.useState("en");
  const [moneyBackGuarantee, setMoneyBackGuarantee] = React.useState("30");
  const [title, setTitle] = React.useState("");
  const [price, setPrice] = React.useState("99.99");
  const [originalPrice, setOriginalPrice] = React.useState("");
  const [duration, setDuration] = React.useState("10");
  const [isFree, setIsFree] = React.useState(false);
  const [prerequisites, setPrerequisites] = React.useState("");
  const [learningObjectives, setLearningObjectives] = React.useState("");

  React.useEffect(() => {
    const fetchInstructors = async () => {
      try {
        const response = await fetch(
          `${
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
          }/users/instructors`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data && Array.isArray(data.data)) {
          setInstructors(data.data);
        } else {
          setInstructors([]);
        }
      } catch (error) {
        setInstructors([]);
        push({ type: "error", message: "Failed to load instructors" });
      }
    };
    fetchInstructors();
  }, [push]);

  // Fetch categories from API
  const { data: categoriesData } = useQuery({
    queryKey: ["course-categories"],
    queryFn: () => courseCategoriesService.getAllCategories(),
    staleTime: 60000,
  });

  const availableCategories = React.useMemo(() => {
    const categoryList = categoriesData?.data?.categories ?? [];
    return categoryList
      .filter((cat: any) => cat.isActive !== false)
      .map((cat: any) => cat.name);
  }, [categoriesData]);

  const handleThumbnailSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      push({ type: "error", message: "Please select an image file" });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      push({ type: "error", message: "Image size must be less than 5MB" });
      return;
    }

    setThumbnailFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setThumbnailPreview(reader.result as string);
    };
    reader.onerror = () => {
      push({ type: "error", message: "Failed to read image file" });
      setThumbnailFile(null);
    };
    reader.readAsDataURL(file);
  };

  const clearThumbnail = () => {
    setThumbnailFile(null);
    setThumbnailPreview("");
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length === 0) return;

    const file = files[0];
    if (!file.type.startsWith("image/")) {
      push({ type: "error", message: "Please drop an image file" });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      push({ type: "error", message: "Image size must be less than 5MB" });
      return;
    }

    setThumbnailFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setThumbnailPreview(reader.result as string);
    };
    reader.onerror = () => {
      push({ type: "error", message: "Failed to read dropped image" });
      setThumbnailFile(null);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="p-6  mx-auto">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          {moduleId ? "Back to Modules" : "Back to Courses"}
        </Button>
        <h2 className="text-3xl font-bold text-secondary mb-2">
          Create New Course
        </h2>
        <p className="text-gray-600">
          {moduleId
            ? "Add a new course to the selected module for your Personal Wings aviation training."
            : "Add details for your Personal Wings aviation training course."}
        </p>
        {moduleId && (
          <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium">
            <CheckCircle className="w-4 h-4" />
            This course will be automatically linked to the module
          </div>
        )}
      </div>

      <div className="bg-card rounded-xl p-8 shadow-sm border border-gray-100">
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setIsSaving(true);

            // Use state values directly instead of FormData
            const titleValue = title.trim();
            const descriptionValue = description.trim();
            const contentValue = content.trim();
            const levelValue = level;
            const typeValue = type;
            const isFreeValue = isFree;
            const priceValue = isFreeValue ? 0 : Number(price) || 0;
            const originalPriceValue =
              originalPrice && Number(originalPrice) > 0
                ? Number(originalPrice)
                : undefined;
            const durationValue = Number(duration) || 1;
            const maxStudentsValue =
              maxStudents === "unlimited" ? 999999 : Number(maxStudents) || 1;
            const instructorsList = selectedInstructors.filter(Boolean);

            const tags = selectedTags.length > 0 ? selectedTags : undefined;
            const prerequisitesArray = prerequisites
              ? prerequisites
                  .split(",")
                  .map((t) => t.trim())
                  .filter(Boolean)
              : undefined;
            const learningObjectivesArray = learningObjectives
              ? learningObjectives
                  .split(",")
                  .map((t) => t.trim())
                  .filter(Boolean)
              : undefined;

            // Validate required fields
            if (!title) {
              push({ type: "error", message: "Course title is required" });
              setIsSaving(false);
              setActiveTab("basic");
              return;
            }

            if (!descriptionValue) {
              push({
                type: "error",
                message: "Course description is required",
              });
              setIsSaving(false);
              setActiveTab("basic");
              return;
            }

            if (instructorsList.length === 0) {
              push({
                type: "error",
                message: "At least one instructor must be selected",
              });
              setIsSaving(false);
              setActiveTab("basic");
              return;
            }

            const slug = title
              .toLowerCase()
              .replace(/[^a-z0-9\s-]/g, "")
              .trim()
              .replace(/\s+/g, "-");

            try {
              let thumbnailUrl = "";

              if (thumbnailFile) {
                setIsUploading(true);
                try {
                  const uploadResult = await uploadService.uploadFile(
                    thumbnailFile,
                    {
                      type: "image",
                      description: "Course thumbnail",
                      tags: ["course", "thumbnail"],
                      onProgress: (progress) => {
                        setUploadProgress(progress.percentage);
                      },
                    }
                  );
                  thumbnailUrl = uploadResult.url;
                  setIsUploading(false);
                } catch (uploadError) {
                  setIsUploading(false);
                  push({
                    type: "error",
                    message:
                      "Failed to upload thumbnail. Saving course without image.",
                  });
                }
              } else if (
                thumbnailPreview &&
                !thumbnailPreview.startsWith("data:")
              ) {
                // Using URL from media library
                thumbnailUrl = thumbnailPreview;
              }

              const createPayload: any = {
                title: titleValue,
                slug,
                description: descriptionValue,
                content: contentValue || undefined,
                excerpt: excerpt?.trim() || undefined,
                level: levelValue as any,
                type: typeValue as any,
                price: priceValue,
                originalPrice: originalPriceValue,
                isFree: isFreeValue,
                duration: Math.max(durationValue, 1),
                durationHours: Math.max(durationValue, 1),
                maxStudents: maxStudentsValue,
                status: "published", // Always published
                isPublished: true, // Always published
                tags,
                categories: selectedCats.length ? selectedCats : undefined,
                prerequisites: prerequisitesArray,
                learningObjectives: learningObjectivesArray,
                instructors:
                  instructorsList.length > 0 ? instructorsList : undefined,
                instructor: instructorsList[0] || undefined, // Primary instructor for backward compatibility
                module: moduleId || undefined,
                aircraftTypes: aircraftTypes.length ? aircraftTypes : undefined,
                isFeatured,
                providesCertificate,
                moneyBackGuarantee: Number(moneyBackGuarantee),
                language,
              };

              // Only include thumbnail if it has a value
              if (thumbnailUrl) {
                createPayload.thumbnail = thumbnailUrl;
              }

              await coursesService.createCourse(createPayload);

              push({
                type: "success",
                message: "Course created successfully!",
              });
              qc.invalidateQueries({ queryKey: ["courses"] });
              qc.invalidateQueries({ queryKey: ["modules"] });

              // Small delay to show success message before redirect
              setTimeout(() => {
                if (moduleId) {
                  router.push("/modules");
                } else {
                  router.push("/courses");
                }
              }, 800);
            } catch (err) {
              setIsSaving(false);
              setIsUploading(false);
              const msg =
                err instanceof Error ? err.message : "Failed to create course";
              push({ type: "error", message: msg });
            }
          }}
        >
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
              <TabsTrigger
                value="basic"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-b-primary data-[state=active]:bg-transparent px-6 py-3 [state=active]:shadow-none"
              >
                Basic Info
              </TabsTrigger>
              <TabsTrigger
                value="pricing"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-b-primary data-[state=active]:bg-transparent px-6 py-3 [state=active]:shadow-none"
              >
                Pricing & Settings
              </TabsTrigger>
              <TabsTrigger
                value="media"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-b-primary data-[state=active]:bg-transparent px-6 py-3 [state=active]:shadow-none"
              >
                Media & Categories
              </TabsTrigger>
              <TabsTrigger
                value="content"
                className="rounded-none border-b-2 border-transparent  data-[state=active]:border-b-primary data-[state=active]:bg-transparent px-6 py-3 [state=active]:shadow-none"
              >
                Content & Details
              </TabsTrigger>
            </TabsList>

            {/* Basic Info Tab */}
            <TabsContent value="basic" className="p-8 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div>
                    <label className="text-sm font-medium text-secondary block mb-2">
                      Course Title *
                    </label>
                    <input
                      name="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g., Citation Jet Pro Line 21 Training"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-secondary block mb-2">
                        Level *
                      </label>
                      <Select value={level} onValueChange={setLevel}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">
                            Intermediate
                          </SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                          <SelectItem value="expert">Expert</SelectItem>
                        </SelectContent>
                      </Select>
                      <input type="hidden" name="level" value={level} />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-secondary block mb-2">
                        Type *
                      </label>
                      <Select value={type} onValueChange={setType}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="theoretical">
                            Theoretical
                          </SelectItem>
                          <SelectItem value="practical">Practical</SelectItem>
                          <SelectItem value="simulator">Simulator</SelectItem>
                          <SelectItem value="combined">Combined</SelectItem>
                        </SelectContent>
                      </Select>
                      <input type="hidden" name="type" value={type} />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-secondary block mb-2">
                      Short Excerpt
                    </label>
                    <textarea
                      value={excerpt}
                      onChange={(e) => setExcerpt(e.target.value)}
                      rows={3}
                      placeholder="A brief one or two sentence description for previews..."
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                    />
                    <input type="hidden" name="excerpt" value={excerpt} />
                    <p className="text-xs text-gray-500 mt-1.5">
                      Short description that appears in course cards and
                      previews
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-secondary block mb-4">
                      Brief Description *
                      {description && (
                        <span className="ml-2 text-xs text-green-600 font-normal">
                          ✓ {description.length} characters
                        </span>
                      )}
                    </label>
                    <RichTextEditor
                      content={description}
                      onChange={setDescription}
                      placeholder="Brief course description that will appear in course listings"
                    />
                    <p className="text-xs text-gray-500 mt-1.5">
                      This description appears in course listings and search
                      results
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-medium text-secondary">
                        Instructors *
                        {selectedInstructors.length > 0 && (
                          <span className="ml-2 text-xs text-green-600 font-normal">
                            ✓ {selectedInstructors.length} selected
                          </span>
                        )}
                      </label>
                      <Badge variant="outline" className="bg-purple-50">
                        {selectedInstructors.length} instructor
                        {selectedInstructors.length !== 1 ? "s" : ""}
                      </Badge>
                    </div>

                    <Select
                      value=""
                      onValueChange={(value) => {
                        if (value && !selectedInstructors.includes(value)) {
                          setSelectedInstructors((prev) => [...prev, value]);
                        }
                      }}
                    >
                      <SelectTrigger
                        className={`w-full ${
                          selectedInstructors.length === 0
                            ? "border-red-300"
                            : ""
                        }`}
                      >
                        <SelectValue placeholder="Select instructors for this course" />
                      </SelectTrigger>
                      <SelectContent>
                        {instructors.length > 0 ? (
                          instructors
                            .filter(
                              (inst) => !selectedInstructors.includes(inst._id)
                            )
                            .map((instructor) => (
                              <SelectItem
                                key={instructor._id}
                                value={instructor._id}
                              >
                                {instructor.firstName} {instructor.lastName} (
                                {instructor.email})
                              </SelectItem>
                            ))
                        ) : (
                          <div className="px-2 py-4 text-sm text-gray-500 text-center">
                            No instructors available
                          </div>
                        )}
                      </SelectContent>
                    </Select>

                    <p className="text-xs text-gray-500 mt-1.5">
                      Select one or more instructors who will teach this course
                    </p>

                    {/* Selected Instructors Display */}
                    {selectedInstructors.length > 0 && (
                      <div className="mt-3 space-y-2">
                        <p className="text-xs font-medium text-gray-700">
                          Selected Instructors:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {selectedInstructors.map((instructorId, index) => {
                            const instructor = instructors.find(
                              (i) => i._id === instructorId
                            );
                            if (!instructor) return null;
                            return (
                              <Badge
                                key={instructorId}
                                className="bg-purple-600 text-white shadow-sm pr-1"
                              >
                                {index === 0 && (
                                  <Star className="w-3 h-3 mr-1" />
                                )}
                                {instructor.firstName} {instructor.lastName}
                                <button
                                  type="button"
                                  onClick={() =>
                                    setSelectedInstructors((prev) =>
                                      prev.filter((id) => id !== instructorId)
                                    )
                                  }
                                  className="ml-2 hover:bg-white/30 rounded-full p-0.5 transition-all"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </Badge>
                            );
                          })}
                        </div>
                        <p className="text-xs text-gray-500 italic">
                          <Star className="w-3 h-3 inline mr-1" />
                          First instructor will be set as primary instructor
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-secondary block mb-2">
                        Duration (hours) *
                      </label>
                      <input
                        name="duration"
                        type="number"
                        min={1}
                        step="0.5"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        placeholder="10"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-secondary block mb-2">
                        Max Students *
                      </label>
                      <Select
                        value={maxStudents}
                        onValueChange={setMaxStudents}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select max students" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unlimited">
                            ∞ Unlimited Students
                          </SelectItem>
                          <SelectItem value="10">10 Students</SelectItem>
                          <SelectItem value="20">20 Students</SelectItem>
                          <SelectItem value="30">30 Students</SelectItem>
                          <SelectItem value="50">50 Students</SelectItem>
                          <SelectItem value="100">100 Students</SelectItem>
                          <SelectItem value="200">200 Students</SelectItem>
                          <SelectItem value="500">500 Students</SelectItem>
                          <SelectItem value="1000">1000 Students</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-gray-500 mt-1.5">
                        {maxStudents === "unlimited"
                          ? "No limit on student enrollments"
                          : `Maximum ${maxStudents} students can enroll`}
                      </p>
                      <input
                        type="hidden"
                        name="maxStudents"
                        value={
                          maxStudents === "unlimited" ? "999999" : maxStudents
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-secondary block mb-2">
                      Aircraft Types
                    </label>
                    <input
                      value={aircraftTypes.join(", ")}
                      onChange={(e) => {
                        const types = e.target.value
                          .split(",")
                          .map((t) => t.trim())
                          .filter(Boolean);
                        setAircraftTypes(types);
                      }}
                      placeholder="e.g., Boeing 737, Airbus A320, Citation CJ3+"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                    <input
                      type="hidden"
                      name="aircraftTypes"
                      value={JSON.stringify(aircraftTypes)}
                    />
                    <p className="text-xs text-gray-500 mt-1.5">
                      Comma-separated list of aircraft covered in this course
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Pricing & Settings Tab */}
            <TabsContent value="pricing" className="p-8 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg p-6 border border-primary/20">
                    <h3 className="text-lg font-semibold text-secondary mb-4">
                      Pricing Information
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="flex items-center gap-2 mb-4">
                          <input
                            type="checkbox"
                            name="isFree"
                            checked={isFree}
                            className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                            onChange={(e) => {
                              setIsFree(e.target.checked);
                              if (e.target.checked) {
                                setPrice("0");
                              }
                            }}
                          />
                          <span className="text-sm font-medium text-secondary">
                            Free Course
                          </span>
                        </label>
                        <p className="text-xs text-gray-500 mb-4">
                          Check this box to make the course free. Price will be
                          set to $0.
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-secondary block mb-2">
                          Sale Price ($) *
                        </label>
                        <input
                          name="price"
                          type="number"
                          step="0.01"
                          min="0"
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                          placeholder="99.99"
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                          disabled={isFree}
                          required
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-secondary block mb-2">
                          Original Price ($)
                        </label>
                        <input
                          name="originalPrice"
                          type="number"
                          step="0.01"
                          min="0"
                          value={originalPrice}
                          onChange={(e) => setOriginalPrice(e.target.value)}
                          placeholder="149.99"
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                        <p className="text-xs text-gray-500 mt-1.5">
                          Optional: Show crossed-out original price to display
                          discount
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                    <h3 className="text-lg font-semibold text-secondary mb-4">
                      Course Settings
                    </h3>
                    <div className="space-y-4">
                      <div className="border-t pt-4 space-y-4 mt-4">
                        <h4 className="text-sm font-semibold text-secondary mb-3">
                          Additional Options
                        </h4>

                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isFeatured}
                            onChange={(e) => setIsFeatured(e.target.checked)}
                            className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                          />
                          <span className="text-sm font-medium text-secondary flex items-center gap-1.5">
                            <Star className="w-4 h-4" /> Featured Course
                          </span>
                        </label>
                        <input
                          type="hidden"
                          name="isFeatured"
                          value={isFeatured.toString()}
                        />

                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={providesCertificate}
                            onChange={(e) =>
                              setProvidesCertificate(e.target.checked)
                            }
                            className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                          />
                          <span className="text-sm font-medium text-secondary flex items-center gap-1.5">
                            <Award className="w-4 h-4" /> Provides Certificate
                          </span>
                        </label>
                        <input
                          type="hidden"
                          name="providesCertificate"
                          value={providesCertificate.toString()}
                        />

                        <div>
                          <label className="text-sm font-medium text-secondary block mb-2">
                            Money Back Guarantee (days)
                          </label>
                          <Select
                            value={moneyBackGuarantee}
                            onValueChange={setMoneyBackGuarantee}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="0">No Guarantee</SelectItem>
                              <SelectItem value="7">7 Days</SelectItem>
                              <SelectItem value="14">14 Days</SelectItem>
                              <SelectItem value="30">30 Days</SelectItem>
                              <SelectItem value="60">60 Days</SelectItem>
                              <SelectItem value="90">90 Days</SelectItem>
                            </SelectContent>
                          </Select>
                          <input
                            type="hidden"
                            name="moneyBackGuarantee"
                            value={moneyBackGuarantee}
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium text-secondary block mb-2">
                            Primary Language
                          </label>
                          <Select value={language} onValueChange={setLanguage}>
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="en">English</SelectItem>
                              <SelectItem value="es">Spanish</SelectItem>
                              <SelectItem value="fr">French</SelectItem>
                              <SelectItem value="de">German</SelectItem>
                              <SelectItem value="pt">Portuguese</SelectItem>
                              <SelectItem value="zh">Chinese</SelectItem>
                            </SelectContent>
                          </Select>
                          <input
                            type="hidden"
                            name="language"
                            value={language}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Media & Categories Tab */}
            <TabsContent value="media" className="p-8 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-secondary block mb-3">
                    Course Thumbnail
                    {thumbnailPreview && (
                      <span className="ml-2 text-xs text-green-600 font-normal">
                        ✓ Image loaded
                      </span>
                    )}
                  </label>
                  <div
                    className={`border-2 border-dashed rounded-xl p-6 transition-all ${
                      isDragging
                        ? "border-primary bg-primary/5 scale-102"
                        : "border-gray-300 hover:border-primary/50"
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    {thumbnailPreview ? (
                      <div className="relative">
                        <div className="relative w-full h-64 rounded-lg overflow-hidden shadow-lg">
                          <Image
                            src={thumbnailPreview}
                            alt="Thumbnail preview"
                            fill
                            className="object-cover"
                            unoptimized={thumbnailPreview.startsWith("data:")}
                          />
                        </div>
                        <div className="absolute top-2 right-2 flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => fileInputRef.current?.click()}
                            className="bg-white/90 hover:bg-white shadow-lg"
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            Change
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={clearThumbnail}
                            className="bg-white/90 hover:bg-white shadow-lg"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                        {isUploading && (
                          <div className="mt-4">
                            <div className="flex justify-between text-sm text-gray-600 mb-2">
                              <span className="font-medium">Uploading...</span>
                              <span className="font-semibold">
                                {uploadProgress}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3">
                              <div
                                className="bg-primary h-3 rounded-full transition-all duration-300"
                                style={{ width: `${uploadProgress}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12">
                        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                          <Upload className="w-10 h-10 text-primary" />
                        </div>
                        <p className="text-sm font-medium text-gray-700 mb-4">
                          Upload or select thumbnail image
                        </p>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            Upload Image
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setMediaLibraryOpen(true)}
                          >
                            <ImageIcon className="w-4 h-4 mr-2" />
                            Select from Library
                          </Button>
                        </div>
                        <p className="text-xs text-gray-500 mt-3">
                          PNG, JPG or WEBP (MAX. 5MB)
                        </p>
                      </div>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailSelect}
                      className="hidden"
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Categories */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-secondary">
                        Categories
                      </label>
                      <span className="text-xs text-gray-500">
                        {selectedCats.length} selected
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={customCategory}
                        onChange={(e) => setCustomCategory(e.target.value)}
                        placeholder="Add custom category"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            const trimmed = customCategory.trim();
                            if (trimmed && !selectedCats.includes(trimmed)) {
                              setSelectedCats((prev) => [...prev, trimmed]);
                              setCustomCategory("");
                            }
                          }
                        }}
                      />
                      <Button
                        type="button"
                        onClick={() => {
                          const trimmed = customCategory.trim();
                          if (trimmed && !selectedCats.includes(trimmed)) {
                            setSelectedCats((prev) => [...prev, trimmed]);
                            setCustomCategory("");
                          }
                        }}
                        className="bg-accent hover:bg-accent/90 text-white"
                        disabled={!customCategory.trim()}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-3 bg-gray-50 rounded-lg">
                      {availableCategories.length > 0 ? (
                        availableCategories.map((cat) => {
                          const isSelected = selectedCats.includes(cat);
                          return (
                            <Badge
                              key={cat}
                              variant={isSelected ? "default" : "outline"}
                              className={`cursor-pointer transition-all hover:scale-105 ${
                                isSelected ? "bg-primary text-white" : ""
                              }`}
                              onClick={() => {
                                setSelectedCats((prev) =>
                                  prev.includes(cat)
                                    ? prev.filter((c) => c !== cat)
                                    : [...prev, cat]
                                );
                              }}
                            >
                              {isSelected && (
                                <CheckCircle className="w-3 h-3 mr-1" />
                              )}
                              {cat}
                            </Badge>
                          );
                        })
                      ) : (
                        <p className="text-sm text-gray-500 py-2">
                          No categories available. Create categories first in
                          the Course Categories section.
                        </p>
                      )}
                    </div>

                    {selectedCats.length > 0 && (
                      <div className="flex flex-wrap gap-2 p-3 bg-primary/5 rounded-lg">
                        {selectedCats.map((cat) => (
                          <Badge key={cat} className="bg-accent text-white">
                            {cat}
                            <button
                              type="button"
                              onClick={() =>
                                setSelectedCats((prev) =>
                                  prev.filter((c) => c !== cat)
                                )
                              }
                              className="ml-2 hover:bg-white/30 rounded-full"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* SEO Tags */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-medium text-secondary">
                        SEO Tags
                        {selectedTags.length > 0 && (
                          <span className="ml-2 text-xs text-green-600 font-normal">
                            ✓ {selectedTags.length} tags added
                          </span>
                        )}
                      </label>
                      <Badge variant="outline" className="bg-blue-50">
                        {selectedTags.length} tags
                      </Badge>
                    </div>

                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        value={customTag}
                        onChange={(e) => setCustomTag(e.target.value)}
                        placeholder="Add SEO tag"
                        className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            const trimmed = customTag.trim().toLowerCase();
                            if (trimmed && !selectedTags.includes(trimmed)) {
                              setSelectedTags((prev) => [...prev, trimmed]);
                              setCustomTag("");
                            }
                          }
                        }}
                      />
                      <Button
                        type="button"
                        onClick={() => {
                          const trimmed = customTag.trim().toLowerCase();
                          if (trimmed && !selectedTags.includes(trimmed)) {
                            setSelectedTags((prev) => [...prev, trimmed]);
                            setCustomTag("");
                          }
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        disabled={!customTag.trim()}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="flex flex-wrap gap-2 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      {[
                        "flight training",
                        "aviation courses",
                        "pilot training",
                        "jet training",
                        "aircraft training",
                      ].map((tag) => {
                        const isSelected = selectedTags.includes(tag);
                        return (
                          <Badge
                            key={tag}
                            variant={isSelected ? "default" : "outline"}
                            className={`cursor-pointer transition-all ${
                              isSelected
                                ? "bg-blue-600 text-white shadow-md"
                                : ""
                            }`}
                            onClick={() => {
                              setSelectedTags((prev) =>
                                prev.includes(tag)
                                  ? prev.filter((t) => t !== tag)
                                  : [...prev, tag]
                              );
                            }}
                          >
                            {isSelected && (
                              <CheckCircle className="w-3 h-3 mr-1" />
                            )}
                            {tag}
                          </Badge>
                        );
                      })}
                    </div>

                    {selectedTags.length > 0 && (
                      <div className="flex flex-wrap gap-2 p-4 bg-blue-50/50 rounded-lg border border-blue-200/50 mt-3">
                        {selectedTags.map((tag) => (
                          <Badge
                            key={tag}
                            className="bg-blue-600 text-white shadow-sm"
                          >
                            {tag}
                            <button
                              type="button"
                              onClick={() =>
                                setSelectedTags((prev) =>
                                  prev.filter((t) => t !== tag)
                                )
                              }
                              className="ml-2 hover:bg-white/30 rounded-full p-0.5 transition-all"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Content & Details Tab */}
            <TabsContent value="content" className="p-8 space-y-6">
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-medium text-secondary block mb-4">
                    Detailed Content
                    {content && (
                      <span className="ml-2 text-xs text-green-600 font-normal">
                        ✓ {content.length} characters
                      </span>
                    )}
                  </label>
                  <RichTextEditor
                    content={content}
                    onChange={setContent}
                    placeholder="Detailed course content and curriculum description..."
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Provide comprehensive information about the course
                    curriculum, modules, and learning materials
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-secondary block mb-2">
                      Prerequisites
                    </label>
                    <textarea
                      name="prerequisites"
                      value={prerequisites}
                      onChange={(e) => setPrerequisites(e.target.value)}
                      rows={4}
                      placeholder="Comma-separated (e.g., Private Pilot License, Medical Certificate, Minimum 200 flight hours)"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                    />
                    <p className="text-xs text-gray-500 mt-1.5">
                      List requirements students must have before enrolling
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-secondary block mb-2">
                      Learning Objectives
                    </label>
                    <textarea
                      name="learningObjectives"
                      value={learningObjectives}
                      onChange={(e) => setLearningObjectives(e.target.value)}
                      rows={4}
                      placeholder="Comma-separated (e.g., Master Pro Line 21 systems, Perform emergency procedures)"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                    />
                    <p className="text-xs text-gray-500 mt-1.5">
                      What students will learn upon completion
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Action Buttons - Always Visible */}
          <div className="flex items-center justify-between p-6 border-t bg-gray-50">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSaving || isUploading}
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-primary hover:bg-primary/90 text-white min-w-[140px]"
              disabled={isSaving || isUploading}
            >
              {isSaving || isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isUploading ? "Uploading..." : "Creating..."}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Create Course
                </>
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* Media Library Selector */}
      <MediaLibrarySelector
        open={mediaLibraryOpen}
        onOpenChange={setMediaLibraryOpen}
        onSelect={(url: string) => {
          setThumbnailPreview(url);
          setThumbnailFile(null); // Clear file since we're using URL
          setMediaLibraryOpen(false);
          push({ type: "success", message: "Thumbnail selected from library" });
        }}
        title="Select Course Thumbnail"
      />
    </div>
  );
}
