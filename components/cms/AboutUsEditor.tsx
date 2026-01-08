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
  Upload,
  Save,
  RefreshCw,
  Plus,
  Trash2,
  Eye,
  Edit,
  X,
  ChevronUp,
  ChevronDown,
  Image as ImageIcon,
  AlertTriangle,
} from "lucide-react";
import Image from "next/image";
import { useAboutUs } from "@/hooks/useAboutUs";
import type {
  AboutUs,
  HeaderSection,
  ContentSection,
  SeoMeta,
  TeamMember,
  TeamSection,
  Stat,
  StatsSection,
} from "@/lib/services/about-us.service";
import { useToast } from "@/context/ToastContext";
import { RichTextEditor } from "@/components/shared/RichTextEditor";
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
import { ExternalLink, Download, Loader2 } from "lucide-react";

export function AboutUsEditor() {
  const { push } = useToast();
  const {
    aboutUs,
    loading,
    saving,
    uploadProgress,
    error,
    fetchAboutUs,
    updateAboutUs,
    updateAboutUsWithUpload,
    exportAboutUs,
    refreshAboutUs,
  } = useAboutUs();
  const [activeTab, setActiveTab] = useState("header");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [headerImageFile, setHeaderImageFile] = useState<File | null>(null);
  const [headerImagePreview, setHeaderImagePreview] = useState<string>("");

  const [formData, setFormData] = useState<Partial<AboutUs>>({
    headerSection: {
      title: "",
      subtitle: "",
      image: "",
      imageAlt: "",
    },
    sections: [],
    seo: {
      title: "",
      description: "",
      keywords: [],
      ogTitle: "",
      ogDescription: "",
      ogImage: "",
      canonicalUrl: "",
    },
  });

  const [editingSection, setEditingSection] = useState<ContentSection | null>(
    null
  );
  const [sectionForm, setSectionForm] = useState<ContentSection>({
    id: "",
    title: "",
    content: "",
    image: "",
    imageAlt: "",
    isActive: true,
    order: 0,
  });
  const [sectionImageFile, setSectionImageFile] = useState<File | null>(null);
  const [sectionImagePreview, setSectionImagePreview] = useState<string>("");

  // Team Management State
  const [editingTeamMember, setEditingTeamMember] = useState<TeamMember | null>(
    null
  );
  const [teamMemberForm, setTeamMemberForm] = useState<TeamMember>({
    id: "",
    name: "",
    position: "",
    image: "",
    imageAlt: "",
    bio: "",
    certifications: "",
    isActive: true,
    order: 0,
  });
  const [teamMemberImageFile, setTeamMemberImageFile] = useState<File | null>(
    null
  );
  const [teamMemberImagePreview, setTeamMemberImagePreview] =
    useState<string>("");
  const [teamMemberImageFiles, setTeamMemberImageFiles] = useState<
    Map<string, File>
  >(new Map());

  // Stats Management State
  const [editingStat, setEditingStat] = useState<Stat | null>(null);
  const [statForm, setStatForm] = useState<Stat>({
    value: "",
    label: "",
  });

  useEffect(() => {
    if (aboutUs) {
      setFormData({
        headerSection: aboutUs.headerSection || {
          title: "",
          subtitle: "",
          image: "",
          imageAlt: "",
        },
        sections: aboutUs.sections || [],
        teamSection: aboutUs.teamSection || {
          isActive: true,
          title: "",
          subtitle: "",
          description: "",
          members: [],
        },
        statsSection: aboutUs.statsSection || {
          isActive: true,
          stats: [],
        },
        seo: aboutUs.seo || {
          title: "",
          description: "",
          keywords: [],
          ogTitle: "",
          ogDescription: "",
          ogImage: "",
          canonicalUrl: "",
        },
      });
      if (aboutUs.headerSection?.image) {
        setHeaderImagePreview(aboutUs.headerSection.image);
      }
    }
  }, [aboutUs]);

  const handleHeaderImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setHeaderImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setHeaderImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSectionImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSectionImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSectionImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!aboutUs?._id) {
      push({ message: "About Us page not found", type: "error" });
      return;
    }

    try {
      if (
        headerImageFile ||
        sectionImageFile ||
        teamMemberImageFile ||
        teamMemberImageFiles.size > 0
      ) {
        const formDataToSend = new FormData();
        formDataToSend.append(
          "headerSection",
          JSON.stringify(formData.headerSection)
        );
        formDataToSend.append("sections", JSON.stringify(formData.sections));
        if (formData.teamSection) {
          formDataToSend.append(
            "teamSection",
            JSON.stringify(formData.teamSection)
          );
        }
        if (formData.statsSection) {
          formDataToSend.append(
            "statsSection",
            JSON.stringify(formData.statsSection)
          );
        }
        formDataToSend.append("seo", JSON.stringify(formData.seo));

        if (headerImageFile) {
          formDataToSend.append("headerImage", headerImageFile);
        }

        if (sectionImageFile) {
          formDataToSend.append("sectionImages", sectionImageFile);
        }

        // Collect team member images in order
        if (teamMemberImageFiles.size > 0 || teamMemberImageFile) {
          const members = formData.teamSection?.members || [];
          const sortedMembers = [...members].sort((a, b) => a.order - b.order);

          // Add current editing member's image if exists
          if (teamMemberImageFile && editingTeamMember) {
            const newMap = new Map(teamMemberImageFiles);
            newMap.set(editingTeamMember.id, teamMemberImageFile);
            setTeamMemberImageFiles(newMap);
          }

          // Append images in member order
          sortedMembers.forEach((member) => {
            const file = teamMemberImageFiles.get(member.id);
            if (file) {
              formDataToSend.append("teamMemberImages", file);
            }
          });
        }

        await updateAboutUsWithUpload(aboutUs._id, formDataToSend);
        setHeaderImageFile(null);
        setSectionImageFile(null);
        setTeamMemberImageFile(null);
        setTeamMemberImageFiles(new Map());
        // Refresh data after upload to show updated content
        await refreshAboutUs();
      } else {
        await updateAboutUs(aboutUs._id, formData);
        // Refresh data after update to show updated content
        await refreshAboutUs();
      }
    } catch (error: any) {
      console.error("Failed to save:", error);
    }
  };

  const handleRefresh = () => {
    refreshAboutUs();
    setHeaderImageFile(null);
    setSectionImageFile(null);
    setTeamMemberImageFile(null);
    setTeamMemberImageFiles(new Map());
  };

  const handleExport = async (format: "json" | "pdf") => {
    if (!aboutUs?._id) return;
    setIsExporting(true);
    try {
      await exportAboutUs(format, aboutUs._id);
    } catch (error) {
      console.error("Failed to export:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleSaveSection = () => {
    if (!sectionForm.id || !sectionForm.title || !sectionForm.content.trim()) {
      push({
        message: "Section ID, title, and content are required",
        type: "error",
      });
      return;
    }

    const updatedSections = [...(formData.sections || [])];
    if (editingSection) {
      const index = updatedSections.findIndex(
        (s) => s.id === editingSection.id
      );
      if (index !== -1) {
        updatedSections[index] = { ...sectionForm };
      }
    } else {
      updatedSections.push({ ...sectionForm });
    }

    // Update orders
    updatedSections.forEach((s, i) => (s.order = i + 1));

    setFormData({ ...formData, sections: updatedSections });
    setSectionForm({
      id: "",
      title: "",
      content: "",
      image: "",
      imageAlt: "",
      isActive: true,
      order: 0,
    });
    setEditingSection(null);
    setSectionImageFile(null);
    setSectionImagePreview("");

    push({
      message: editingSection ? "Section updated" : "Section added",
      type: "success",
    });
  };

  const handleEditSection = (section: ContentSection) => {
    setEditingSection(section);
    setSectionForm(section);
    if (section.image) {
      setSectionImagePreview(section.image);
    }
  };

  const handleDeleteSection = (sectionId: string) => {
    const updatedSections = (formData.sections || []).filter(
      (s) => s.id !== sectionId
    );
    updatedSections.forEach((s, i) => (s.order = i + 1));
    setFormData({ ...formData, sections: updatedSections });
    push({ message: "Section deleted", type: "success" });
  };

  const moveSectionUp = (index: number) => {
    if (index === 0) return;
    const sections = [...(formData.sections || [])];
    [sections[index - 1], sections[index]] = [
      sections[index],
      sections[index - 1],
    ];
    sections.forEach((s, i) => (s.order = i + 1));
    setFormData({ ...formData, sections });
  };

  const moveSectionDown = (index: number) => {
    const sections = [...(formData.sections || [])];
    if (index === sections.length - 1) return;
    [sections[index], sections[index + 1]] = [
      sections[index + 1],
      sections[index],
    ];
    sections.forEach((s, i) => (s.order = i + 1));
    setFormData({ ...formData, sections });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="relative">
              <RefreshCw className="w-12 h-12 animate-spin text-primary" />
              <div className="absolute inset-0 bg-primary/10 blur-xl animate-pulse" />
            </div>
            <div className="text-center space-y-1">
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Loading About Us Editor
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Please wait while we fetch the data...
              </p>
            </div>
            <div className="flex gap-2">
              <div
                className="w-2 h-2 bg-primary rounded-full animate-bounce"
                style={{ animationDelay: "0ms" }}
              />
              <div
                className="w-2 h-2 bg-primary rounded-full animate-bounce"
                style={{ animationDelay: "150ms" }}
              />
              <div
                className="w-2 h-2 bg-primary rounded-full animate-bounce"
                style={{ animationDelay: "300ms" }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 dark:border-red-800">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <CardTitle className="text-red-900 dark:text-red-100">
                Error Loading Data
              </CardTitle>
              <CardDescription className="text-red-700 dark:text-red-300">
                {error}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            <Button
              onClick={() => (window.location.href = "/dashboard")}
              variant="ghost"
            >
              Back to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
        <div className="flex-1">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            About Us Page Management
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Manage About Us page content with WordPress-like editor
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPreviewOpen(true)}
            disabled={saving}
            className="flex-1 sm:flex-none min-w-[100px]"
          >
            <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
            Preview
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                disabled={saving || isExporting}
                className="flex-1 sm:flex-none min-w-[100px]"
              >
                {isExporting ? (
                  <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 mr-2 animate-spin" />
                ) : (
                  <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                )}
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => handleExport("json")}>
                Export as JSON
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleExport("pdf")}>
                Export as PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={saving}
            className="flex-1 sm:flex-none min-w-[100px]"
          >
            <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
            Refresh
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            size="sm"
            className="flex-1 sm:flex-none min-w-[120px] bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-300"
          >
            {saving ? (
              <>
                <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1 sm:gap-2 h-auto p-1 bg-gray-100 dark:bg-gray-800">
          <TabsTrigger
            value="header"
            className="text-xs sm:text-sm py-2 sm:py-2.5"
          >
            Header
          </TabsTrigger>
          <TabsTrigger
            value="sections"
            className="text-xs sm:text-sm py-2 sm:py-2.5"
          >
            Sections
          </TabsTrigger>
          <TabsTrigger
            value="team"
            className="text-xs sm:text-sm py-2 sm:py-2.5"
          >
            Team
          </TabsTrigger>
          <TabsTrigger
            value="stats"
            className="text-xs sm:text-sm py-2 sm:py-2.5"
          >
            Stats
          </TabsTrigger>
          <TabsTrigger
            value="seo"
            className="text-xs sm:text-sm py-2 sm:py-2.5 col-span-2 sm:col-span-1"
          >
            SEO
          </TabsTrigger>
        </TabsList>

        {/* Header Tab */}
        <TabsContent value="header" className="space-y-3 sm:space-y-4 mt-4">
          <Card className="shadow-md border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-lg">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="text-lg sm:text-xl">
                Header Section
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Configure the header content for your About Us page
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium">
                  Title
                </Label>
                <Input
                  id="title"
                  value={formData.headerSection?.title || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      headerSection: {
                        ...formData.headerSection!,
                        title: e.target.value,
                      },
                    })
                  }
                  placeholder="About Us"
                  className="text-sm sm:text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subtitle" className="text-sm font-medium">
                  Subtitle
                </Label>
                <Textarea
                  id="subtitle"
                  value={formData.headerSection?.subtitle || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      headerSection: {
                        ...formData.headerSection!,
                        subtitle: e.target.value,
                      },
                    })
                  }
                  placeholder="LEARN MORE ABOUT PERSONAL WINGS"
                  rows={2}
                  className="text-sm sm:text-base resize-none"
                />
              </div>

              {/* Image Upload */}
              <div className="space-y-3 sm:space-y-4">
                <Label className="text-sm font-medium">
                  Header Image (Optional)
                </Label>
                {headerImagePreview && (
                  <div className="relative w-full h-48 sm:h-56 md:h-64 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600 group">
                    <Image
                      src={headerImagePreview}
                      alt="Header preview"
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                  </div>
                )}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                  <Button
                    variant="outline"
                    onClick={() =>
                      document.getElementById("header-image-upload")?.click()
                    }
                    type="button"
                    className="w-full sm:w-auto text-sm"
                  >
                    <Upload className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                    {headerImageFile ? "Change Image" : "Upload Image"}
                  </Button>
                  {headerImageFile && (
                    <Badge
                      variant="secondary"
                      className="text-xs sm:text-sm truncate max-w-[150px] sm:max-w-[200px]"
                    >
                      {headerImageFile.name}
                    </Badge>
                  )}
                </div>
                <input
                  id="header-image-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleHeaderImageChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="imageAlt" className="text-sm font-medium">
                  Image Alt Text
                </Label>
                <Input
                  id="imageAlt"
                  value={formData.headerSection?.imageAlt || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      headerSection: {
                        ...formData.headerSection!,
                        imageAlt: e.target.value,
                      },
                    })
                  }
                  placeholder="Descriptive text for the image"
                  className="text-sm sm:text-base"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sections Tab */}
        <TabsContent value="sections" className="space-y-3 sm:space-y-4 mt-4">
          <Card className="shadow-md border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-lg">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="text-lg sm:text-xl">
                {editingSection ? "Edit Section" : "Add New Section"}
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                {editingSection
                  ? "Update section information"
                  : "Create a new content section with rich text editor"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sectionId" className="text-sm font-medium">
                    Section ID
                  </Label>
                  <Input
                    id="sectionId"
                    value={sectionForm.id}
                    onChange={(e) =>
                      setSectionForm({ ...sectionForm, id: e.target.value })
                    }
                    placeholder="mission"
                    className="text-sm sm:text-base"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sectionOrder" className="text-sm font-medium">
                    Order
                  </Label>
                  <Input
                    id="sectionOrder"
                    type="number"
                    value={sectionForm.order}
                    onChange={(e) =>
                      setSectionForm({
                        ...sectionForm,
                        order: parseInt(e.target.value) || 0,
                      })
                    }
                    placeholder="1"
                    className="text-sm sm:text-base"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sectionTitle" className="text-sm font-medium">
                  Title
                </Label>
                <Input
                  id="sectionTitle"
                  value={sectionForm.title}
                  onChange={(e) =>
                    setSectionForm({ ...sectionForm, title: e.target.value })
                  }
                  placeholder="Our Mission"
                  className="text-sm sm:text-base"
                />
              </div>

              {/* Rich Text Editor */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Content (WordPress-like Editor)
                </Label>
                <RichTextEditor
                  content={sectionForm.content}
                  onChange={(content) =>
                    setSectionForm({ ...sectionForm, content })
                  }
                  placeholder="Write your content here..."
                />
              </div>

              {/* Section Image */}
              <div className="space-y-3 sm:space-y-4">
                <Label className="text-sm font-medium">
                  Section Image (Optional)
                </Label>
                {sectionImagePreview && (
                  <div className="relative w-full h-40 sm:h-48 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600 group">
                    <Image
                      src={sectionImagePreview}
                      alt="Section preview"
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                  </div>
                )}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                  <Button
                    variant="outline"
                    onClick={() =>
                      document.getElementById("section-image-upload")?.click()
                    }
                    type="button"
                    className="w-full sm:w-auto text-sm"
                  >
                    <ImageIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                    {sectionImageFile ? "Change Image" : "Upload Image"}
                  </Button>
                  {sectionImageFile && (
                    <Badge
                      variant="secondary"
                      className="text-xs sm:text-sm truncate max-w-[150px] sm:max-w-[200px]"
                    >
                      {sectionImageFile.name}
                    </Badge>
                  )}
                </div>
                <input
                  id="section-image-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleSectionImageChange}
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="sectionImageAlt"
                  className="text-sm font-medium"
                >
                  Image Alt Text
                </Label>
                <Input
                  id="sectionImageAlt"
                  value={sectionForm.imageAlt || ""}
                  onChange={(e) =>
                    setSectionForm({ ...sectionForm, imageAlt: e.target.value })
                  }
                  placeholder="Descriptive text for the image"
                  className="text-sm sm:text-base"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={sectionForm.isActive}
                  onCheckedChange={(checked) =>
                    setSectionForm({ ...sectionForm, isActive: checked })
                  }
                />
                <Label className="text-sm font-medium">Section Active</Label>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  onClick={handleSaveSection}
                  className="flex-1 text-sm sm:text-base"
                >
                  {editingSection ? "Update Section" : "Add Section"}
                </Button>
                {editingSection && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditingSection(null);
                      setSectionForm({
                        id: "",
                        title: "",
                        content: "",
                        image: "",
                        imageAlt: "",
                        isActive: true,
                        order: 0,
                      });
                      setSectionImageFile(null);
                      setSectionImagePreview("");
                    }}
                    className="flex-1 sm:flex-none text-sm sm:text-base"
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Existing Sections List */}
          <Card className="shadow-md border-gray-200 dark:border-gray-700">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="text-lg sm:text-xl">
                Content Sections
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Manage your content sections. Drag to reorder or edit.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 sm:space-y-4">
                {(formData.sections || [])
                  .sort((a, b) => a.order - b.order)
                  .map((section, index) => (
                    <div
                      key={section.id}
                      className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4 p-3 sm:p-4 border rounded-lg hover:border-blue-500 transition-all duration-300 bg-white dark:bg-gray-800"
                    >
                      <div className="flex gap-1 sm:gap-2 order-1 sm:order-0">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => moveSectionUp(index)}
                          disabled={index === 0}
                          className="h-8 w-8 p-0"
                        >
                          <ChevronUp className="w-3 h-3 sm:w-4 sm:h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => moveSectionDown(index)}
                          disabled={
                            index === (formData.sections || []).length - 1
                          }
                          className="h-8 w-8 p-0"
                        >
                          <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4" />
                        </Button>
                      </div>

                      <div className="flex-1 space-y-2 min-w-0 order-2 w-full sm:w-auto">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-semibold text-sm sm:text-base truncate">
                            {section.title}
                          </h4>
                          <Badge
                            variant={section.isActive ? "default" : "secondary"}
                            className="text-xs shrink-0"
                          >
                            {section.isActive ? "Active" : "Inactive"}
                          </Badge>
                          <Badge variant="outline" className="text-xs shrink-0">
                            Order: {section.order}
                          </Badge>
                        </div>
                        <div
                          className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 line-clamp-2"
                          dangerouslySetInnerHTML={{ __html: section.content }}
                        />
                        {section.image && (
                          <div className="relative w-full sm:w-32 h-20 rounded overflow-hidden border">
                            <Image
                              src={section.image}
                              alt={section.imageAlt || section.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 order-3 sm:order-0 w-full sm:w-auto">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditSection(section)}
                          className="flex-1 sm:flex-none text-xs sm:text-sm h-8"
                        >
                          <Edit className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
                          <span className="hidden sm:inline">Edit</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteSection(section.id)}
                          className="flex-1 sm:flex-none text-xs sm:text-sm h-8"
                        >
                          <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
                          <span className="hidden sm:inline">Delete</span>
                        </Button>
                      </div>
                    </div>
                  ))}
                {(!formData.sections || formData.sections.length === 0) && (
                  <div className="text-center py-12 px-4">
                    <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                      <Plus className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
                    </div>
                    <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">
                      No sections yet. Add your first section above.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team Tab */}
        <TabsContent value="team" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Team Section Settings</CardTitle>
              <CardDescription>
                Configure the team section header and manage team members
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.teamSection?.isActive ?? true}
                    onCheckedChange={(checked) =>
                      setFormData({
                        ...formData,
                        teamSection: {
                          ...formData.teamSection!,
                          isActive: checked,
                          members: formData.teamSection?.members || [],
                        },
                      })
                    }
                  />
                  <Label>Enable Team Section</Label>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="teamTitle">Section Title</Label>
                <Input
                  id="teamTitle"
                  value={formData.teamSection?.title || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      teamSection: {
                        ...formData.teamSection!,
                        title: e.target.value,
                        members: formData.teamSection?.members || [],
                      },
                    })
                  }
                  placeholder="Meet Our Expert Instructors"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="teamSubtitle">Section Subtitle</Label>
                <Input
                  id="teamSubtitle"
                  value={formData.teamSection?.subtitle || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      teamSection: {
                        ...formData.teamSection!,
                        subtitle: e.target.value,
                        members: formData.teamSection?.members || [],
                      },
                    })
                  }
                  placeholder="Our Team"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="teamDescription">Section Description</Label>
                <Textarea
                  id="teamDescription"
                  value={formData.teamSection?.description || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      teamSection: {
                        ...formData.teamSection!,
                        description: e.target.value,
                        members: formData.teamSection?.members || [],
                      },
                    })
                  }
                  placeholder="Our dedicated team of aviation professionals..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Add/Edit Team Member */}
          <Card>
            <CardHeader>
              <CardTitle>
                {editingTeamMember ? "Edit Team Member" : "Add Team Member"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="memberId">Member ID</Label>
                  <Input
                    id="memberId"
                    value={teamMemberForm.id}
                    onChange={(e) =>
                      setTeamMemberForm({
                        ...teamMemberForm,
                        id: e.target.value,
                      })
                    }
                    placeholder="team-1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="memberOrder">Order</Label>
                  <Input
                    id="memberOrder"
                    type="number"
                    value={teamMemberForm.order}
                    onChange={(e) =>
                      setTeamMemberForm({
                        ...teamMemberForm,
                        order: parseInt(e.target.value) || 0,
                      })
                    }
                    placeholder="1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="memberName">Name</Label>
                  <Input
                    id="memberName"
                    value={teamMemberForm.name}
                    onChange={(e) =>
                      setTeamMemberForm({
                        ...teamMemberForm,
                        name: e.target.value,
                      })
                    }
                    placeholder="Captain John Smith"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="memberPosition">Position</Label>
                  <Input
                    id="memberPosition"
                    value={teamMemberForm.position}
                    onChange={(e) =>
                      setTeamMemberForm({
                        ...teamMemberForm,
                        position: e.target.value,
                      })
                    }
                    placeholder="Chief Flight Instructor"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="memberBio">Bio</Label>
                <Textarea
                  id="memberBio"
                  value={teamMemberForm.bio}
                  onChange={(e) =>
                    setTeamMemberForm({
                      ...teamMemberForm,
                      bio: e.target.value,
                    })
                  }
                  placeholder="Brief bio about the team member..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="memberCertifications">Certifications</Label>
                <Input
                  id="memberCertifications"
                  value={teamMemberForm.certifications}
                  onChange={(e) =>
                    setTeamMemberForm({
                      ...teamMemberForm,
                      certifications: e.target.value,
                    })
                  }
                  placeholder="ATP, CFI, CFII, MEI"
                />
              </div>

              <div className="space-y-4">
                <Label>Member Image (Optional)</Label>
                {teamMemberImagePreview && (
                  <div className="relative w-full h-48 rounded-lg overflow-hidden border">
                    <Image
                      src={teamMemberImagePreview}
                      alt="Team member preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    onClick={() =>
                      document.getElementById("member-image-upload")?.click()
                    }
                    type="button"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {teamMemberImageFile ? "Change Image" : "Upload Image"}
                  </Button>
                  {teamMemberImageFile && (
                    <Badge variant="secondary">
                      {teamMemberImageFile.name}
                    </Badge>
                  )}
                </div>
                <input
                  id="member-image-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setTeamMemberImageFile(file);
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        const preview = reader.result as string;
                        setTeamMemberImagePreview(preview);
                        // Store preview URL in form for now, will be replaced with actual URL on save
                        setTeamMemberForm({
                          ...teamMemberForm,
                          image: preview,
                        });
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="memberImageAlt">Image Alt Text</Label>
                <Input
                  id="memberImageAlt"
                  value={teamMemberForm.imageAlt}
                  onChange={(e) =>
                    setTeamMemberForm({
                      ...teamMemberForm,
                      imageAlt: e.target.value,
                    })
                  }
                  placeholder="Team member name"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={teamMemberForm.isActive}
                  onCheckedChange={(checked) =>
                    setTeamMemberForm({ ...teamMemberForm, isActive: checked })
                  }
                />
                <Label>Active</Label>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    const members = formData.teamSection?.members || [];
                    if (editingTeamMember) {
                      // Store image file for edited member
                      if (teamMemberImageFile) {
                        const newMap = new Map(teamMemberImageFiles);
                        newMap.set(editingTeamMember.id, teamMemberImageFile);
                        setTeamMemberImageFiles(newMap);
                      }
                      const updated = members.map((m) =>
                        m.id === editingTeamMember.id ? teamMemberForm : m
                      );
                      setFormData({
                        ...formData,
                        teamSection: {
                          ...formData.teamSection!,
                          members: updated,
                        },
                      });
                      setEditingTeamMember(null);
                    } else {
                      // Store image file for new member
                      if (teamMemberImageFile) {
                        const newMap = new Map(teamMemberImageFiles);
                        newMap.set(teamMemberForm.id, teamMemberImageFile);
                        setTeamMemberImageFiles(newMap);
                      }
                      setFormData({
                        ...formData,
                        teamSection: {
                          ...formData.teamSection!,
                          members: [...members, teamMemberForm],
                        },
                      });
                    }
                    const newOrder = editingTeamMember
                      ? teamMemberForm.order
                      : members.length;
                    setTeamMemberForm({
                      id: "",
                      name: "",
                      position: "",
                      image: "",
                      imageAlt: "",
                      bio: "",
                      certifications: "",
                      isActive: true,
                      order: newOrder,
                    });
                    setTeamMemberImageFile(null);
                    setTeamMemberImagePreview("");
                  }}
                >
                  {editingTeamMember ? "Update Member" : "Add Member"}
                </Button>
                {editingTeamMember && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditingTeamMember(null);
                      setTeamMemberForm({
                        id: "",
                        name: "",
                        position: "",
                        image: "",
                        imageAlt: "",
                        bio: "",
                        certifications: "",
                        isActive: true,
                        order: 0,
                      });
                      setTeamMemberImageFile(null);
                      setTeamMemberImagePreview("");
                    }}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Team Members List */}
          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>
                Manage your team members. Drag to reorder or edit/delete.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {formData.teamSection?.members
                  ?.sort((a, b) => a.order - b.order)
                  .map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="flex flex-col">
                          <span className="font-semibold">{member.name}</span>
                          <span className="text-sm text-gray-500">
                            {member.position}
                          </span>
                          <span className="text-xs text-gray-400">
                            Order: {member.order} |{" "}
                            {member.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                        {member.image && (
                          <div className="relative w-16 h-16 rounded overflow-hidden">
                            <Image
                              src={member.image}
                              alt={member.imageAlt || member.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingTeamMember(member);
                            setTeamMemberForm(member);
                            if (member.image) {
                              setTeamMemberImagePreview(member.image);
                            }
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            const members = formData.teamSection?.members || [];
                            setFormData({
                              ...formData,
                              teamSection: {
                                ...formData.teamSection!,
                                members: members.filter(
                                  (m) => m.id !== member.id
                                ),
                              },
                            });
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                {(!formData.teamSection?.members ||
                  formData.teamSection.members.length === 0) && (
                  <p className="text-center text-gray-500 py-8">
                    No team members yet. Add your first team member above.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Stats Tab */}
        <TabsContent value="stats" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Stats Section Settings</CardTitle>
              <CardDescription>
                Configure statistics displayed on the about page
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.statsSection?.isActive ?? true}
                    onCheckedChange={(checked) =>
                      setFormData({
                        ...formData,
                        statsSection: {
                          ...formData.statsSection!,
                          isActive: checked,
                          stats: formData.statsSection?.stats || [],
                        },
                      })
                    }
                  />
                  <Label>Enable Stats Section</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Add/Edit Stat */}
          <Card>
            <CardHeader>
              <CardTitle>
                {editingStat ? "Edit Stat" : "Add Statistic"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="statValue">Value</Label>
                  <Input
                    id="statValue"
                    value={statForm.value}
                    onChange={(e) =>
                      setStatForm({ ...statForm, value: e.target.value })
                    }
                    placeholder="15+"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="statLabel">Label</Label>
                  <Input
                    id="statLabel"
                    value={statForm.label}
                    onChange={(e) =>
                      setStatForm({ ...statForm, label: e.target.value })
                    }
                    placeholder="Years Experience"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    const stats = formData.statsSection?.stats || [];
                    if (editingStat) {
                      const index = stats.findIndex(
                        (s) =>
                          s.value === editingStat.value &&
                          s.label === editingStat.label
                      );
                      if (index !== -1) {
                        const updated = [...stats];
                        updated[index] = statForm;
                        setFormData({
                          ...formData,
                          statsSection: {
                            ...formData.statsSection!,
                            stats: updated,
                          },
                        });
                      }
                      setEditingStat(null);
                    } else {
                      setFormData({
                        ...formData,
                        statsSection: {
                          ...formData.statsSection!,
                          stats: [...stats, statForm],
                        },
                      });
                    }
                    setStatForm({ value: "", label: "" });
                  }}
                >
                  {editingStat ? "Update Stat" : "Add Stat"}
                </Button>
                {editingStat && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditingStat(null);
                      setStatForm({ value: "", label: "" });
                    }}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Stats List */}
          <Card>
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
              <CardDescription>
                Manage statistics displayed on the about page
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {formData.statsSection?.stats?.map((stat, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex flex-col">
                      <span className="font-semibold text-lg">
                        {stat.value}
                      </span>
                      <span className="text-sm text-gray-500">
                        {stat.label}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingStat(stat);
                          setStatForm(stat);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          const stats = formData.statsSection?.stats || [];
                          setFormData({
                            ...formData,
                            statsSection: {
                              ...formData.statsSection!,
                              stats: stats.filter((s, i) => i !== index),
                            },
                          });
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {(!formData.statsSection?.stats ||
                  formData.statsSection.stats.length === 0) && (
                  <p className="text-center text-gray-500 py-8">
                    No statistics yet. Add your first statistic above.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SEO Tab */}
        <TabsContent value="seo" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>SEO Settings</CardTitle>
              <CardDescription>
                Configure search engine optimization for the About Us page
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="seoTitle">Meta Title</Label>
                <Input
                  id="seoTitle"
                  value={formData.seo?.title || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      seo: { ...formData.seo!, title: e.target.value },
                    })
                  }
                  placeholder="About Us | Personal Wings"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="seoDescription">Meta Description</Label>
                <Textarea
                  id="seoDescription"
                  value={formData.seo?.description || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      seo: { ...formData.seo!, description: e.target.value },
                    })
                  }
                  placeholder="Learn about Personal Wings and our commitment to excellence"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="seoKeywords">Keywords (comma-separated)</Label>
                <Input
                  id="seoKeywords"
                  value={formData.seo?.keywords?.join(", ") || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      seo: {
                        ...formData.seo!,
                        keywords: e.target.value
                          .split(",")
                          .map((k) => k.trim())
                          .filter((k) => k),
                      },
                    })
                  }
                  placeholder="about, aviation training, flight school"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ogTitle">Open Graph Title</Label>
                <Input
                  id="ogTitle"
                  value={formData.seo?.ogTitle || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      seo: { ...formData.seo!, ogTitle: e.target.value },
                    })
                  }
                  placeholder="About Us | Personal Wings"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ogDescription">Open Graph Description</Label>
                <Textarea
                  id="ogDescription"
                  value={formData.seo?.ogDescription || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      seo: {
                        ...formData.seo!,
                        ogDescription: e.target.value,
                      },
                    })
                  }
                  placeholder="Learn about our mission and values"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ogImage">Open Graph Image URL</Label>
                <Input
                  id="ogImage"
                  value={formData.seo?.ogImage || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      seo: { ...formData.seo!, ogImage: e.target.value },
                    })
                  }
                  placeholder="https://example.com/about-og-image.jpg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="canonicalUrl">Canonical URL</Label>
                <Input
                  id="canonicalUrl"
                  value={formData.seo?.canonicalUrl || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      seo: { ...formData.seo!, canonicalUrl: e.target.value },
                    })
                  }
                  placeholder="https://personalwings.com/about-us"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-[98vw] sm:max-w-[95vw] md:max-w-4xl lg:max-w-6xl xl:max-w-7xl max-h-[92vh] sm:max-h-[90vh] overflow-y-auto">
          <DialogHeader className="sticky top-0 bg-white dark:bg-gray-900 z-10 pb-4 border-b">
            <DialogTitle className="text-xl sm:text-2xl font-bold">
              Preview About Us Page
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              This is how your About Us page will appear to visitors
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 sm:space-y-6 mt-4 px-2 sm:px-4">
            {/* Header Section Preview */}
            {formData.headerSection && (
              <div className="border rounded-lg p-4 sm:p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900">
                <h2 className="text-2xl sm:text-3xl font-bold mb-2">
                  {formData.headerSection.title || "About Us"}
                </h2>
                {formData.headerSection.subtitle && (
                  <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-400 mb-4">
                    {formData.headerSection.subtitle}
                  </p>
                )}
                {headerImagePreview && (
                  <div className="relative w-full h-48 sm:h-56 md:h-64 rounded-lg overflow-hidden border">
                    <Image
                      src={headerImagePreview}
                      alt={formData.headerSection.imageAlt || "Header image"}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Sections Preview */}
            {formData.sections && formData.sections.length > 0 && (
              <div className="space-y-4 sm:space-y-6">
                {formData.sections
                  .filter((s) => s.isActive)
                  .sort((a, b) => a.order - b.order)
                  .map((section) => (
                    <div
                      key={section.id}
                      className="border rounded-lg p-4 sm:p-6 bg-white dark:bg-gray-800"
                    >
                      <h3 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">
                        {section.title}
                      </h3>
                      <div
                        className="prose prose-sm sm:prose max-w-none dark:prose-invert"
                        dangerouslySetInnerHTML={{ __html: section.content }}
                      />
                      {section.image && (
                        <div className="relative w-full h-40 sm:h-48 rounded-lg overflow-hidden border mt-4">
                          <Image
                            src={section.image}
                            alt={section.imageAlt || section.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            )}

            {/* Team Section Preview */}
            {formData.teamSection?.isActive && formData.teamSection.members && (
              <div className="border rounded-lg p-4 sm:p-6 bg-white dark:bg-gray-800">
                {formData.teamSection.title && (
                  <h3 className="text-xl sm:text-2xl font-semibold mb-2">
                    {formData.teamSection.title}
                  </h3>
                )}
                {formData.teamSection.subtitle && (
                  <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-400 mb-4">
                    {formData.teamSection.subtitle}
                  </p>
                )}
                {formData.teamSection.description && (
                  <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 mb-6">
                    {formData.teamSection.description}
                  </p>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {formData.teamSection.members
                    .filter((m) => m.isActive)
                    .sort((a, b) => a.order - b.order)
                    .map((member) => (
                      <div
                        key={member.id}
                        className="border rounded-lg p-3 sm:p-4 hover:shadow-lg transition-shadow duration-300"
                      >
                        {member.image && (
                          <div className="relative w-full h-40 sm:h-48 rounded-lg overflow-hidden border mb-4">
                            <Image
                              src={member.image}
                              alt={member.imageAlt || member.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <h4 className="font-semibold text-base sm:text-lg">
                          {member.name}
                        </h4>
                        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-2">
                          {member.position}
                        </p>
                        {member.bio && (
                          <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 mb-2">
                            {member.bio}
                          </p>
                        )}
                        {member.certifications && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {member.certifications}
                          </p>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Stats Section Preview */}
            {formData.statsSection?.isActive && formData.statsSection.stats && (
              <div className="border rounded-lg p-4 sm:p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900">
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                  {formData.statsSection.stats.map((stat, index) => (
                    <div
                      key={index}
                      className="text-center p-3 sm:p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm"
                    >
                      <div className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400">
                        {stat.value}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="flex flex-col sm:flex-row justify-end gap-2 mt-6 pt-4 border-t sticky bottom-0 bg-white dark:bg-gray-900">
            <Button
              variant="outline"
              onClick={() => {
                const frontendUrl =
                  process.env.NEXT_PUBLIC_FRONTEND_URL ||
                  "http://localhost:3000";
                window.open(`${frontendUrl}/about-us`, "_blank");
              }}
              className="w-full sm:w-auto text-sm"
            >
              <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
              View Live Page
            </Button>
            <Button
              onClick={() => setPreviewOpen(false)}
              className="w-full sm:w-auto text-sm"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Upload Progress */}
      {uploadProgress > 0 && uploadProgress < 100 && (
        <div className="fixed bottom-4 right-4 left-4 sm:left-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-2xl p-4 w-auto sm:w-80 z-50 animate-in slide-in-from-bottom-5 duration-300">
          <div className="flex items-center gap-2 mb-3">
            <div className="relative">
              <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin text-blue-600" />
              <div className="absolute inset-0 bg-blue-600/20 blur-md animate-pulse" />
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Uploading images...
            </span>
          </div>
          <Progress value={uploadProgress} className="h-2 sm:h-2.5 mb-2" />
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {uploadProgress}% complete
            </span>
            <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
              {uploadProgress === 100 ? "Processing..." : "Uploading..."}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
