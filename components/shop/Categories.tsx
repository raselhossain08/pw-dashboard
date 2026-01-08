"use client";

import * as React from "react";
import Image from "next/image";
import {
  Search as SearchIcon,
  ArrowUpDown,
  EllipsisVertical,
  Tags,
  Eye,
  Edit,
  Trash,
  Plus,
  Loader2,
  AlertTriangle,
  ImageIcon,
  RefreshCw,
  Filter,
  Upload,
  X,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { useProductCategories } from "@/hooks/useProductCategories";
import {
  ProductCategory,
  CreateProductCategoryDto,
} from "@/services/product-categories.service";
import { useToast } from "@/context/ToastContext";
import { uploadsService } from "@/services/uploads.service";
import { MediaLibrarySelector } from "@/components/cms/MediaLibrarySelector";

export default function Categories() {
  const { push } = useToast();
  const {
    categories,
    loading,
    total,
    page,
    totalPages,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    refreshCategories,
    bulkUpdateStatus,
    bulkDelete,
  } = useProductCategories();

  const [search, setSearch] = React.useState("");
  const [sortBy, setSortBy] = React.useState("name");
  const [statusFilter, setStatusFilter] = React.useState<
    "all" | "active" | "inactive"
  >("all");
  const [currentPage, setCurrentPage] = React.useState(1);
  const [limit] = React.useState(12);
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [bulkDeleteOpen, setBulkDeleteOpen] = React.useState(false);
  const [bulkStatusOpen, setBulkStatusOpen] = React.useState(false);
  const [bulkStatus, setBulkStatus] = React.useState<"active" | "inactive">(
    "active"
  );

  // Dialog states
  const [createOpen, setCreateOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [viewOpen, setViewOpen] = React.useState(false);

  // Selected category for operations
  const [selectedCategory, setSelectedCategory] =
    React.useState<ProductCategory | null>(null);

  // Form states
  const [formData, setFormData] = React.useState<CreateProductCategoryDto>({
    name: "",
    description: "",
    image: "",
    status: "active",
  });

  // Local loading states
  const [submitting, setSubmitting] = React.useState(false);

  // Upload states
  const [uploadProgress, setUploadProgress] = React.useState(0);
  const [isUploading, setIsUploading] = React.useState(false);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string>("");
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Media library states
  const [mediaLibraryOpen, setMediaLibraryOpen] = React.useState(false);
  const [mediaLibraryContext, setMediaLibraryContext] = React.useState<
    "create" | "edit"
  >("create");

  // Fetch categories when filters change
  React.useEffect(() => {
    fetchCategories({
      page: currentPage,
      limit,
      search: search || undefined,
      status: statusFilter !== "all" ? statusFilter : undefined,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, search, statusFilter, limit]);

  // Keyboard shortcuts
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        const el = document.getElementById(
          "category-search"
        ) as HTMLInputElement | null;
        el?.focus();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  // Handle selection
  const handleSelectCategory = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filtered.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map((c) => c._id));
    }
  };

  // Bulk operations
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    const result = await bulkDelete(selectedIds);
    if (result) {
      setSelectedIds([]);
      setBulkDeleteOpen(false);
    }
  };

  const handleBulkUpdateStatus = async () => {
    if (selectedIds.length === 0) return;
    const result = await bulkUpdateStatus(selectedIds, bulkStatus);
    if (result) {
      setSelectedIds([]);
      setBulkStatusOpen(false);
    }
  };

  // Filter and sort categories
  const filtered = React.useMemo(() => {
    return categories
      .filter((c) => {
        const q = search.trim().toLowerCase();
        const matchesSearch =
          !q ||
          c.name.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q);
        const matchesStatus =
          statusFilter === "all" || c.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === "name") return a.name.localeCompare(b.name);
        if (sortBy === "products")
          return (b.productCount || 0) - (a.productCount || 0);
        if (sortBy === "subcategories")
          return (b.subcategoryCount || 0) - (a.subcategoryCount || 0);
        if (sortBy === "date")
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        return 0;
      });
  }, [categories, search, sortBy, statusFilter]);

  // Handle form changes
  const handleFormChange = (
    field: keyof CreateProductCategoryDto,
    value: any
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      image: "",
      status: "active",
    });
    setSelectedFile(null);
    setPreviewUrl("");
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      push({
        message: "Please select a valid image file",
        type: "error",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      push({
        message: "Image size should be less than 5MB",
        type: "error",
      });
      return;
    }

    setSelectedFile(file);

    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Handle image upload
  const handleImageUpload = async (): Promise<string | null> => {
    if (!selectedFile) return null;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Upload using uploads service
      const uploadedFile = await uploadsService.uploadFile(selectedFile, {
        type: "image",
        description: `Category image: ${formData.name || "Untitled"}`,
        tags: ["category", "product"],
        entityType: "product-category",
        visibility: "public",
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      push({
        message: "Image uploaded successfully",
        type: "success",
      });

      return uploadedFile.url || uploadedFile.path || "";
    } catch (error: any) {
      push({
        message: error?.message || "Failed to upload image",
        type: "error",
      });
      return null;
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  // Remove selected image
  const handleRemoveImage = () => {
    setSelectedFile(null);
    setPreviewUrl("");
    handleFormChange("image", "");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handle create
  const handleCreate = async () => {
    if (!formData.name.trim()) {
      push({
        message: "Category name is required",
        type: "error",
      });
      return;
    }

    setSubmitting(true);

    // Upload image if file is selected
    let imageUrl = formData.image;
    if (selectedFile) {
      const uploadedUrl = await handleImageUpload();
      if (uploadedUrl) {
        imageUrl = uploadedUrl;
      }
    }

    const result = await createCategory({ ...formData, image: imageUrl });
    setSubmitting(false);

    if (result) {
      setCreateOpen(false);
      resetForm();
    }
  };

  // Handle edit
  const handleEdit = (category: ProductCategory) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      description: category.description,
      image: category.image || "",
      status: category.status,
    });
    setPreviewUrl(category.image || "");
    setEditOpen(true);
  };

  // Handle update
  const handleUpdate = async () => {
    if (!selectedCategory) return;
    if (!formData.name.trim()) {
      push({
        message: "Category name is required",
        type: "error",
      });
      return;
    }

    setSubmitting(true);

    // Upload image if new file is selected
    let imageUrl = formData.image;
    if (selectedFile) {
      const uploadedUrl = await handleImageUpload();
      if (uploadedUrl) {
        imageUrl = uploadedUrl;
      }
    }

    const result = await updateCategory(selectedCategory._id, {
      ...formData,
      image: imageUrl,
    });
    setSubmitting(false);

    if (result) {
      setEditOpen(false);
      setSelectedCategory(null);
      resetForm();
    }
  };

  // Handle delete
  const handleDelete = (category: ProductCategory) => {
    setSelectedCategory(category);
    setDeleteOpen(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!selectedCategory) return;

    setSubmitting(true);
    const success = await deleteCategory(selectedCategory._id);
    setSubmitting(false);

    if (success) {
      setDeleteOpen(false);
      setSelectedCategory(null);
    }
  };

  // Handle view
  const handleView = (category: ProductCategory) => {
    setSelectedCategory(category);
    setViewOpen(true);
  };

  // Status badge styling
  const statusBadge = (status: string) =>
    status === "active"
      ? "bg-green-100 text-green-700 border border-green-200"
      : "bg-gray-100 text-gray-700 border border-gray-200";

  return (
    <main className="p-6 min-h-screen bg-gray-50/50">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-secondary mb-2">
            Product Categories
          </h2>
          <p className="text-gray-600">
            Organize your products with categories and subcategories
          </p>
        </div>
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={() => refreshCategories()}
            disabled={loading}
            className="border-gray-300"
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button
            onClick={() => {
              resetForm();
              setCreateOpen(true);
            }}
            disabled={loading}
          >
            <Plus className="w-4 h-4 mr-2" /> Add Category
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">
                Total Categories
              </p>
              <p className="text-3xl font-bold text-secondary mt-2">
                {loading ? (
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                ) : (
                  total
                )}
              </p>
              <p className="text-accent text-sm mt-1">
                {categories.length} loaded
              </p>
            </div>
            <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center">
              <Tags className="text-primary w-7 h-7" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">
                Active Categories
              </p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {loading ? (
                  <Loader2 className="w-8 h-8 animate-spin text-green-600" />
                ) : (
                  categories.filter((c) => c.status === "active").length
                )}
              </p>
              <p className="text-green-600 text-sm mt-1">Published</p>
            </div>
            <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center">
              <Tags className="text-green-600 w-7 h-7" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Inactive</p>
              <p className="text-3xl font-bold text-gray-500 mt-2">
                {loading ? (
                  <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
                ) : (
                  categories.filter((c) => c.status === "inactive").length
                )}
              </p>
              <p className="text-gray-500 text-sm mt-1">Unpublished</p>
            </div>
            <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center">
              <Tags className="text-gray-600 w-7 h-7" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">
                With Subcategories
              </p>
              <p className="text-3xl font-bold text-purple-600 mt-2">
                {loading ? (
                  <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                ) : (
                  categories.filter((c) => (c.subcategoryCount || 0) > 0).length
                )}
              </p>
              <p className="text-purple-600 text-sm mt-1">Organized</p>
            </div>
            <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center">
              <Tags className="text-purple-600 w-7 h-7" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div className="flex items-center space-x-2">
            <Filter className="text-gray-400 w-5 h-5" />
            <Select
              value={statusFilter}
              onValueChange={(v: any) => {
                setStatusFilter(v);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <ArrowUpDown className="text-gray-400 w-5 h-5" />
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Sort by: Name</SelectItem>
                <SelectItem value="products">Sort by: Products</SelectItem>
                <SelectItem value="subcategories">
                  Sort by: Subcategories
                </SelectItem>
                <SelectItem value="date">Sort by: Date Created</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            id="category-search"
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search categories... (Ctrl+K)"
            className="pl-10 bg-gray-50 border-gray-200 focus:border-primary focus:ring-primary"
          />
        </div>
        {/* Bulk Actions Bar */}
        {selectedIds.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                {selectedIds.length} category
                {selectedIds.length !== 1 ? "ies" : ""} selected
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setBulkStatus("active");
                  setBulkStatusOpen(true);
                }}
                disabled={loading}
              >
                Activate
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setBulkStatus("inactive");
                  setBulkStatusOpen(true);
                }}
                disabled={loading}
              >
                Deactivate
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setBulkDeleteOpen(true)}
                disabled={loading}
                className="text-red-600 hover:text-red-700"
              >
                <Trash className="w-4 h-4 mr-2" />
                Delete
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedIds([])}
              >
                Clear
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && categories.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
          <p className="text-gray-600">Loading categories...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && categories.length === 0 && (
        <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-200 text-center">
          <Tags className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-secondary mb-2">
            No categories yet
          </h3>
          <p className="text-gray-600 mb-6">
            Get started by creating your first product category
          </p>
          <Button
            onClick={() => {
              resetForm();
              setCreateOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" /> Create Category
          </Button>
        </div>
      )}

      {/* No Results */}
      {!loading && categories.length > 0 && filtered.length === 0 && (
        <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-200 text-center">
          <AlertTriangle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-secondary mb-2">
            No results found
          </h3>
          <p className="text-gray-600 mb-6">
            Try adjusting your search or filters
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setSearch("");
              setStatusFilter("all");
            }}
          >
            Clear Filters
          </Button>
        </div>
      )}

      {/* Categories Grid */}
      {!loading && filtered.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {filtered.map((category) => (
              <div
                key={category._id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-200 overflow-hidden group relative"
              >
                <div className="relative h-40">
                  {category.image ? (
                    <Image
                      src={category.image}
                      alt={category.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                      <ImageIcon className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                  {/* Selection Checkbox */}
                  <div className="absolute top-3 left-3 z-10">
                    <Checkbox
                      checked={selectedIds.includes(category._id)}
                      onCheckedChange={() => handleSelectCategory(category._id)}
                      className="bg-white/90 backdrop-blur-sm shadow-sm"
                    />
                  </div>
                  <span
                    className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-medium ${statusBadge(
                      category.status
                    )}`}
                  >
                    {category.status === "active" ? "Active" : "Inactive"}
                  </span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="absolute top-3 right-3 bg-white/90 hover:bg-white shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <EllipsisVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleView(category)}>
                        <Eye className="w-4 h-4 mr-2" /> View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEdit(category)}>
                        <Edit className="w-4 h-4 mr-2" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDelete(category)}
                        className="text-red-600 focus:text-red-600"
                      >
                        <Trash className="w-4 h-4 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="p-5">
                  <h4 className="font-semibold text-lg text-secondary mb-2 line-clamp-1">
                    {category.name}
                  </h4>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {category.description}
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span className="flex items-center">
                      <Tags className="w-4 h-4 mr-1" />
                      {category.productCount || 0} products
                    </span>
                    <span>{category.subcategoryCount || 0} subcategories</span>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      className="flex-1"
                      size="sm"
                      onClick={() => handleEdit(category)}
                    >
                      <Edit className="w-3 h-3 mr-1" /> Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-gray-300"
                      onClick={() => handleView(category)}
                    >
                      <Eye className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage > 1) {
                          setCurrentPage(currentPage - 1);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }
                      }}
                      className={
                        currentPage === 1
                          ? "pointer-events-none opacity-50"
                          : ""
                      }
                    />
                  </PaginationItem>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <PaginationItem key={pageNum}>
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            setCurrentPage(pageNum);
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                          isActive={currentPage === pageNum}
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage < totalPages) {
                          setCurrentPage(currentPage + 1);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }
                      }}
                      className={
                        currentPage === totalPages
                          ? "pointer-events-none opacity-50"
                          : ""
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      )}

      {/* Create Category Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center text-xl">
              <Plus className="w-5 h-5 mr-2 text-primary" />
              Create New Category
            </DialogTitle>
            <DialogDescription>
              Add a new product category to organize your inventory
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 py-4">
            <div className="space-y-2">
              <Label htmlFor="create-name">Category Name *</Label>
              <Input
                id="create-name"
                value={formData.name}
                onChange={(e) => handleFormChange("name", e.target.value)}
                placeholder="e.g., Electronics, Clothing, Books"
                className="border-gray-300"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-description">Description *</Label>
              <Textarea
                id="create-description"
                value={formData.description}
                onChange={(e) =>
                  handleFormChange("description", e.target.value)
                }
                placeholder="Describe this category..."
                rows={4}
                className="border-gray-300 resize-none"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-image">Category Image (Optional)</Label>
              <div className="flex flex-col gap-3">
                {/* File Input */}
                <div className="flex items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="create-image-upload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="border-gray-300"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {selectedFile ? "Change Image" : "Upload Image"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setMediaLibraryContext("create");
                      setMediaLibraryOpen(true);
                    }}
                    disabled={isUploading}
                    className="border-gray-300"
                  >
                    <ImageIcon className="w-4 h-4 mr-2" />
                    Select from Library
                  </Button>
                  {selectedFile && (
                    <span className="text-sm text-gray-600 flex-1 truncate">
                      {selectedFile.name}
                    </span>
                  )}
                  {previewUrl && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={handleRemoveImage}
                      disabled={isUploading}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                {/* Upload Progress */}
                {isUploading && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Uploading...</span>
                      <span className="text-gray-900 font-medium">
                        {uploadProgress}%
                      </span>
                    </div>
                    <Progress value={uploadProgress} className="h-2" />
                  </div>
                )}

                {/* Image Preview */}
                {previewUrl && !isUploading && (
                  <div className="relative h-40 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                    <Image
                      src={previewUrl}
                      alt="Preview"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                )}

                <p className="text-xs text-gray-500">
                  Accepted formats: JPG, PNG, GIF, WebP (Max 5MB)
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(v: any) => handleFormChange("status", v)}
              >
                <SelectTrigger id="create-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setCreateOpen(false);
                resetForm();
              }}
              disabled={submitting}
              className="border-gray-300"
            >
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={submitting}>
              {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Create Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center text-xl">
              <Edit className="w-5 h-5 mr-2 text-primary" />
              Edit Category
            </DialogTitle>
            <DialogDescription>Update category information</DialogDescription>
          </DialogHeader>
          <div className="space-y-5 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Category Name *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => handleFormChange("name", e.target.value)}
                placeholder="Category name"
                className="border-gray-300"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description *</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) =>
                  handleFormChange("description", e.target.value)
                }
                placeholder="Category description"
                rows={4}
                className="border-gray-300 resize-none"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-image">Category Image (Optional)</Label>
              <div className="flex flex-col gap-3">
                {/* File Input */}
                <div className="flex items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="edit-image-upload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="border-gray-300"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {selectedFile ? "Change Image" : "Upload New Image"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setMediaLibraryContext("edit");
                      setMediaLibraryOpen(true);
                    }}
                    disabled={isUploading}
                    className="border-gray-300"
                  >
                    <ImageIcon className="w-4 h-4 mr-2" />
                    Select from Library
                  </Button>
                  {selectedFile && (
                    <span className="text-sm text-gray-600 flex-1 truncate">
                      {selectedFile.name}
                    </span>
                  )}
                  {previewUrl && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={handleRemoveImage}
                      disabled={isUploading}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                {/* Upload Progress */}
                {isUploading && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Uploading...</span>
                      <span className="text-gray-900 font-medium">
                        {uploadProgress}%
                      </span>
                    </div>
                    <Progress value={uploadProgress} className="h-2" />
                  </div>
                )}

                {/* Image Preview */}
                {previewUrl && !isUploading && (
                  <div className="relative h-40 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                    <Image
                      src={previewUrl}
                      alt="Preview"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                )}

                <p className="text-xs text-gray-500">
                  Accepted formats: JPG, PNG, GIF, WebP (Max 5MB)
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(v: any) => handleFormChange("status", v)}
              >
                <SelectTrigger id="edit-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEditOpen(false);
                setSelectedCategory(null);
                resetForm();
              }}
              disabled={submitting}
              className="border-gray-300"
            >
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={submitting}>
              {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Update Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Category Dialog */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center text-xl">
              <Eye className="w-5 h-5 mr-2 text-primary" />
              Category Details
            </DialogTitle>
          </DialogHeader>
          {selectedCategory && (
            <div className="space-y-6 py-4">
              {selectedCategory.image && (
                <div className="relative h-48 rounded-lg overflow-hidden border border-gray-200">
                  <Image
                    src={selectedCategory.image}
                    alt={selectedCategory.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              )}
              <div className="space-y-4">
                <div>
                  <Label className="text-gray-500 text-sm">Name</Label>
                  <p className="text-lg font-semibold text-secondary mt-1">
                    {selectedCategory.name}
                  </p>
                </div>
                <div>
                  <Label className="text-gray-500 text-sm">Description</Label>
                  <p className="text-gray-700 mt-1">
                    {selectedCategory.description}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-500 text-sm">Status</Label>
                    <div className="mt-1">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${statusBadge(
                          selectedCategory.status
                        )}`}
                      >
                        {selectedCategory.status === "active"
                          ? "Active"
                          : "Inactive"}
                      </span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-gray-500 text-sm">Products</Label>
                    <p className="text-lg font-semibold text-secondary mt-1">
                      {selectedCategory.productCount || 0}
                    </p>
                  </div>
                </div>
                <div>
                  <Label className="text-gray-500 text-sm">Subcategories</Label>
                  <p className="text-lg font-semibold text-secondary mt-1">
                    {selectedCategory.subcategoryCount || 0}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-200">
                  <div>
                    <Label className="text-gray-500 text-sm">Created</Label>
                    <p className="text-sm text-gray-700 mt-1">
                      {new Date(
                        selectedCategory.createdAt
                      ).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <Label className="text-gray-500 text-sm">
                      Last Updated
                    </Label>
                    <p className="text-sm text-gray-700 mt-1">
                      {new Date(
                        selectedCategory.updatedAt
                      ).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setViewOpen(false);
                setSelectedCategory(null);
              }}
              className="border-gray-300"
            >
              Close
            </Button>
            <Button
              onClick={() => {
                if (selectedCategory) {
                  setViewOpen(false);
                  handleEdit(selectedCategory);
                }
              }}
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center text-xl">
              <AlertTriangle className="w-5 h-5 mr-2 text-red-600" />
              Delete Category
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              Are you sure you want to delete{" "}
              <span className="font-semibold">{selectedCategory?.name}</span>?
              This action cannot be undone and will remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={submitting}
              onClick={() => {
                setDeleteOpen(false);
                setSelectedCategory(null);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={submitting}
              className="bg-red-600 hover:bg-red-700"
            >
              {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Delete Category
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center text-xl">
              <AlertTriangle className="w-5 h-5 mr-2 text-red-600" />
              Delete Multiple Categories
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              Are you sure you want to delete {selectedIds.length} categor
              {selectedIds.length === 1 ? "y" : "ies"}? This action cannot be
              undone and will remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={submitting}
              onClick={() => {
                setBulkDeleteOpen(false);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              disabled={submitting}
              className="bg-red-600 hover:bg-red-700"
            >
              {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Delete {selectedIds.length} Categor
              {selectedIds.length === 1 ? "y" : "ies"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Status Update Confirmation Dialog */}
      <AlertDialog open={bulkStatusOpen} onOpenChange={setBulkStatusOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center text-xl">
              <AlertTriangle className="w-5 h-5 mr-2 text-primary" />
              Update Status
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              Are you sure you want to{" "}
              {bulkStatus === "active" ? "activate" : "deactivate"}{" "}
              {selectedIds.length} categor
              {selectedIds.length === 1 ? "y" : "ies"}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={submitting}
              onClick={() => {
                setBulkStatusOpen(false);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkUpdateStatus}
              disabled={submitting}
            >
              {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {bulkStatus === "active" ? "Activate" : "Deactivate"}{" "}
              {selectedIds.length} Categor
              {selectedIds.length === 1 ? "y" : "ies"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Media Library Selector */}
      <MediaLibrarySelector
        open={mediaLibraryOpen}
        onOpenChange={setMediaLibraryOpen}
        onSelect={(url: string) => {
          setPreviewUrl(url);
          if (mediaLibraryContext === "create") {
            setFormData({ ...formData, image: url });
          } else {
            handleFormChange("image", url);
          }
          setMediaLibraryOpen(false);
        }}
        title="Select Category Image"
      />
    </main>
  );
}
