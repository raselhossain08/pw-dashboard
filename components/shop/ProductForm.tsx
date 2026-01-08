"use client";

import * as React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Upload, X, Loader2, ImageIcon } from "lucide-react";
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
import { productsService } from "@/lib/services/products.service";
import type { Product } from "@/lib/types/product";
import { useToast } from "@/context/ToastContext";
import { MediaLibrarySelector } from "@/components/cms/MediaLibrarySelector";

interface ProductFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProductCreated: (product: Product) => void;
  initialData?: Product;
  mode?: "create" | "edit";
}

export default function ProductForm({
  open,
  onOpenChange,
  onProductCreated,
  initialData,
  mode = "create",
}: ProductFormProps) {
  const { push } = useToast();
  const [loading, setLoading] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState<{
    [key: string]: number;
  }>({});
  const [previews, setPreviews] = React.useState<string[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [mediaLibraryOpen, setMediaLibraryOpen] = React.useState(false);
  const [formData, setFormData] = React.useState<{
    title: string;
    description: string;
    type: "aircraft" | "simulator" | "equipment" | "software" | "service";
    status: "draft" | "published" | "archived" | "sold";
    price: number;
    currency: string;
    aircraftCategory:
      | "single_engine"
      | "multi_engine"
      | "jet"
      | "turboprop"
      | "helicopter";
    manufacturer: string;
    productModel: string;
    year: number;
    totalTime: number;
    timeSinceOverhaul: number;
    engineModel: string;
    engineHorsepower: number;
    avionics: string;
    features: string[];
    location: string;
    locationDescription: string;
    images: string[];
    isFeatured: boolean;
    quantity: number;
    specifications: {
      seats: number;
      cruiseSpeed: number;
      range: number;
      fuelCapacity: number;
      maxTakeoffWeight: number;
      usefulLoad: number;
    };
    tags: string[];
  }>({
    title: "",
    description: "",
    type: "aircraft",
    status: "draft",
    price: 0,
    currency: "USD",
    aircraftCategory: "single_engine",
    manufacturer: "",
    productModel: "",
    year: new Date().getFullYear(),
    totalTime: 0,
    timeSinceOverhaul: 0,
    engineModel: "",
    engineHorsepower: 0,
    avionics: "",
    features: [],
    location: "",
    locationDescription: "",
    images: [],
    isFeatured: false,
    quantity: 1,
    specifications: {
      seats: 0,
      cruiseSpeed: 0,
      range: 0,
      fuelCapacity: 0,
      maxTakeoffWeight: 0,
      usefulLoad: 0,
    },
    tags: [],
  });

  // Load initial data when in edit mode
  React.useEffect(() => {
    if (mode === "edit" && initialData && open) {
      setFormData({
        title: initialData.title || "",
        description: initialData.description || "",
        type: (initialData.type || "aircraft") as
          | "aircraft"
          | "simulator"
          | "equipment"
          | "software"
          | "service",
        status: (initialData.status || "draft") as
          | "draft"
          | "published"
          | "archived"
          | "sold",
        price: initialData.price || 0,
        currency: initialData.currency || "USD",
        aircraftCategory: (initialData.aircraftCategory || "single_engine") as
          | "single_engine"
          | "multi_engine"
          | "jet"
          | "turboprop"
          | "helicopter",
        manufacturer: initialData.manufacturer || "",
        productModel: initialData.productModel || "",
        year: initialData.year || new Date().getFullYear(),
        totalTime: initialData.totalTime || 0,
        timeSinceOverhaul: initialData.timeSinceOverhaul || 0,
        engineModel: initialData.engineModel || "",
        engineHorsepower: initialData.engineHorsepower || 0,
        avionics: initialData.avionics || "",
        features: initialData.features || [],
        location: initialData.location || "",
        locationDescription: initialData.locationDescription || "",
        images: initialData.images || [],
        isFeatured: initialData.isFeatured || false,
        quantity: initialData.quantity || 1,
        specifications: initialData.specifications || {
          seats: 0,
          cruiseSpeed: 0,
          range: 0,
          fuelCapacity: 0,
          maxTakeoffWeight: 0,
          usefulLoad: 0,
        },
        tags: initialData.tags || [],
      });
      setPreviews(initialData.images || []);
    } else if (!open) {
      // Reset form when dialog closes
      setFormData({
        title: "",
        description: "",
        type: "aircraft",
        status: "draft",
        price: 0,
        currency: "USD",
        aircraftCategory: "single_engine",
        manufacturer: "",
        productModel: "",
        year: new Date().getFullYear(),
        totalTime: 0,
        timeSinceOverhaul: 0,
        engineModel: "",
        engineHorsepower: 0,
        avionics: "",
        features: [],
        location: "",
        locationDescription: "",
        images: [],
        isFeatured: false,
        quantity: 1,
        specifications: {
          seats: 0,
          cruiseSpeed: 0,
          range: 0,
          fuelCapacity: 0,
          maxTakeoffWeight: 0,
          usefulLoad: 0,
        },
        tags: [],
      });
      setPreviews([]);
    }
  }, [mode, initialData, open]);

  // Handle file upload with progress
  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newPreviews: string[] = [];
    const newImages: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileKey = `${file.name}-${Date.now()}`;

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result as string);
        if (newPreviews.length === files.length) {
          setPreviews([...previews, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);

      // Simulate upload with progress (replace with actual upload logic)
      await simulateUpload(file, fileKey, (progress) => {
        setUploadProgress((prev) => ({ ...prev, [fileKey]: progress }));
      });

      // After upload completes, add to images array
      // In real implementation, this would be the uploaded image URL from your server
      const uploadedUrl = URL.createObjectURL(file);
      newImages.push(uploadedUrl);
    }

    setFormData({ ...formData, images: [...formData.images, ...newImages] });
  };

  // Simulate file upload with progress (replace with actual upload to your server)
  const simulateUpload = (
    file: File,
    fileKey: string,
    onProgress: (progress: number) => void
  ): Promise<void> => {
    return new Promise((resolve) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        onProgress(progress);
        if (progress >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setUploadProgress((prev) => {
              const newProgress = { ...prev };
              delete newProgress[fileKey];
              return newProgress;
            });
            resolve();
          }, 500);
        }
      }, 200);
    });
  };

  // Remove image
  const handleRemoveImage = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    setFormData({ ...formData, images: newImages });
    setPreviews(newPreviews);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      type: "aircraft",
      status: "draft",
      price: 0,
      currency: "USD",
      aircraftCategory: "single_engine",
      manufacturer: "",
      productModel: "",
      year: new Date().getFullYear(),
      totalTime: 0,
      timeSinceOverhaul: 0,
      engineModel: "",
      engineHorsepower: 0,
      avionics: "",
      features: [],
      location: "",
      locationDescription: "",
      images: [],
      isFeatured: false,
      quantity: 1,
      specifications: {
        seats: 0,
        cruiseSpeed: 0,
        range: 0,
        fuelCapacity: 0,
        maxTakeoffWeight: 0,
        usefulLoad: 0,
      },
      tags: [],
    });
    setPreviews([]);
    setUploadProgress({});
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.title.trim()) {
      push({
        message: "Product title is required",
        type: "error",
      });
      return;
    }

    if (!formData.description.trim()) {
      push({
        message: "Product description is required",
        type: "error",
      });
      return;
    }

    if (formData.price <= 0) {
      push({
        message: "Product price must be greater than 0",
        type: "error",
      });
      return;
    }

    try {
      setLoading(true);

      const loadingToastId = push({
        message:
          mode === "edit" ? "Updating product..." : "Creating product...",
        type: "loading",
      });

      // Generate slug from title
      const slug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

      const productData = {
        ...formData,
        slug,
      };

      let product: Product;
      if (mode === "edit" && initialData) {
        product = await productsService.updateProduct(
          initialData._id,
          productData
        );
        push({
          message: "Product updated successfully!",
          type: "success",
        });
      } else {
        product = await productsService.createProduct(productData);
        push({
          message: "Product created successfully!",
          type: "success",
        });
      }

      onProductCreated(product);
      resetForm();
      onOpenChange(false);
    } catch (error: any) {
      console.error(`Failed to ${mode} product:`, error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        `Failed to ${mode} product`;
      push({
        message: errorMessage,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "edit"
              ? "Edit Aviation Product"
              : "Add New Aviation Product"}
          </DialogTitle>
          <DialogDescription>
            {mode === "edit"
              ? "Update product details for aircraft, equipment, or services"
              : "Enter comprehensive product details for aircraft, equipment, or services"}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4 border-b pb-4">
            <h3 className="font-semibold text-secondary">Basic Information</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Title *
              </label>
              <input
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="e.g. Cirrus SR22 G6"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                rows={4}
                placeholder="Detailed product description..."
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Type *
                </label>
                <Select
                  value={formData.type}
                  onValueChange={(value: any) =>
                    setFormData({ ...formData, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="aircraft">Aircraft</SelectItem>
                    <SelectItem value="simulator">Simulator</SelectItem>
                    <SelectItem value="equipment">Equipment</SelectItem>
                    <SelectItem value="software">Software</SelectItem>
                    <SelectItem value="service">Service</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status *
                </label>
                <Select
                  value={formData.status}
                  onValueChange={(value: any) =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                    <SelectItem value="sold">Sold</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price (USD) *
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      price: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="0.00"
                  step="0.01"
                />
              </div>
            </div>
          </div>

          {/* Aircraft Details */}
          {formData.type === "aircraft" && (
            <div className="space-y-4 border-b pb-4">
              <h3 className="font-semibold text-secondary">Aircraft Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Aircraft Category
                  </label>
                  <Select
                    value={formData.aircraftCategory}
                    onValueChange={(value: any) =>
                      setFormData({ ...formData, aircraftCategory: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single_engine">
                        Single Engine
                      </SelectItem>
                      <SelectItem value="multi_engine">Multi Engine</SelectItem>
                      <SelectItem value="jet">Jet</SelectItem>
                      <SelectItem value="turboprop">Turboprop</SelectItem>
                      <SelectItem value="helicopter">Helicopter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Manufacturer
                  </label>
                  <input
                    value={formData.manufacturer}
                    onChange={(e) =>
                      setFormData({ ...formData, manufacturer: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="e.g. Cirrus, Cessna, Piper"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Model
                  </label>
                  <input
                    value={formData.productModel}
                    onChange={(e) =>
                      setFormData({ ...formData, productModel: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="e.g. SR22 G6"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Year
                  </label>
                  <input
                    type="number"
                    value={formData.year}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        year: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="2024"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Time (hours)
                  </label>
                  <input
                    type="number"
                    value={formData.totalTime}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        totalTime: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Time Since Overhaul (hours)
                  </label>
                  <input
                    type="number"
                    value={formData.timeSinceOverhaul}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        timeSinceOverhaul: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Engine Model
                  </label>
                  <input
                    value={formData.engineModel}
                    onChange={(e) =>
                      setFormData({ ...formData, engineModel: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="e.g. Continental IO-550-N"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Engine Horsepower
                  </label>
                  <input
                    type="number"
                    value={formData.engineHorsepower}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        engineHorsepower: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="310"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Avionics
                  </label>
                  <input
                    value={formData.avionics}
                    onChange={(e) =>
                      setFormData({ ...formData, avionics: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="e.g. Garmin G1000 NXi, Avidyne IFD540"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Specifications */}
          {formData.type === "aircraft" && (
            <div className="space-y-4 border-b pb-4">
              <h3 className="font-semibold text-secondary">Specifications</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Seats
                  </label>
                  <input
                    type="number"
                    value={formData.specifications.seats}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        specifications: {
                          ...formData.specifications,
                          seats: parseInt(e.target.value) || 0,
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="4"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cruise Speed (knots)
                  </label>
                  <input
                    type="number"
                    value={formData.specifications.cruiseSpeed}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        specifications: {
                          ...formData.specifications,
                          cruiseSpeed: parseInt(e.target.value) || 0,
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="183"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Range (nm)
                  </label>
                  <input
                    type="number"
                    value={formData.specifications.range}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        specifications: {
                          ...formData.specifications,
                          range: parseInt(e.target.value) || 0,
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="1207"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fuel Capacity (gal)
                  </label>
                  <input
                    type="number"
                    value={formData.specifications.fuelCapacity}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        specifications: {
                          ...formData.specifications,
                          fuelCapacity: parseInt(e.target.value) || 0,
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="92"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Takeoff Weight (lbs)
                  </label>
                  <input
                    type="number"
                    value={formData.specifications.maxTakeoffWeight}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        specifications: {
                          ...formData.specifications,
                          maxTakeoffWeight: parseInt(e.target.value) || 0,
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="3600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Useful Load (lbs)
                  </label>
                  <input
                    type="number"
                    value={formData.specifications.usefulLoad}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        specifications: {
                          ...formData.specifications,
                          usefulLoad: parseInt(e.target.value) || 0,
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="1330"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Location & Additional Info */}
          <div className="space-y-4 border-b pb-4">
            <h3 className="font-semibold text-secondary">
              Location & Additional
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="e.g. KSAN, San Diego, CA"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity
                </label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      quantity: parseInt(e.target.value) || 1,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="1"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location Description
                </label>
                <textarea
                  value={formData.locationDescription}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      locationDescription: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  rows={2}
                  placeholder="Hangared at Montgomery-Gibbs Executive Airport"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags (comma-separated)
                </label>
                <input
                  value={formData.tags.join(", ")}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      tags: e.target.value
                        .split(",")
                        .map((t) => t.trim())
                        .filter(Boolean),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="high-performance, glass-cockpit, autopilot"
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="featured"
                  checked={formData.isFeatured}
                  onChange={(e) =>
                    setFormData({ ...formData, isFeatured: e.target.checked })
                  }
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary/20"
                />
                <label
                  htmlFor="featured"
                  className="text-sm font-medium text-gray-700"
                >
                  Featured Product
                </label>
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="space-y-4">
            <h3 className="font-semibold text-secondary">Product Images</h3>

            {/* Upload Area */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => handleFileUpload(e.target.files)}
              />
              <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 font-medium mb-1">
                Upload or select product images
              </p>
              <p className="text-gray-400 text-sm mb-4">
                PNG, JPG, WEBP up to 10MB
              </p>
              <div className="flex gap-2 justify-center">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Images
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setMediaLibraryOpen(true)}
                >
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Select from Library
                </Button>
              </div>
            </div>

            {/* Upload Progress */}
            {Object.keys(uploadProgress).length > 0 && (
              <div className="space-y-2">
                {Object.entries(uploadProgress).map(([key, progress]) => (
                  <div key={key} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 truncate flex-1 mr-2">
                        {key.split("-")[0]}
                      </span>
                      <span className="text-gray-500">{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-primary h-full transition-all duration-300 ease-out"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Image Previews */}
            {formData.images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {formData.images.map((url, index) => (
                  <div
                    key={index}
                    className="relative group rounded-lg overflow-hidden border border-gray-200 aspect-square"
                  >
                    <Image
                      src={url}
                      alt={`Product image ${index + 1}`}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                    <button
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      type="button"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    {index === 0 && (
                      <div className="absolute bottom-2 left-2 bg-primary text-white text-xs px-2 py-1 rounded">
                        Primary
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Alternative: Paste Image URLs */}
            <div className="pt-4 border-t">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Or paste image URLs (one per line)
              </label>
              <textarea
                value={formData.images.join("\n")}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    images: e.target.value
                      .split("\n")
                      .map((url) => url.trim())
                      .filter(Boolean),
                  })
                }
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                rows={3}
                placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              variant="outline"
              className="border-gray-300"
              onClick={() => {
                resetForm();
                onOpenChange(false);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={
                !formData.title ||
                !formData.description ||
                formData.price <= 0 ||
                loading
              }
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {mode === "edit" ? "Updating..." : "Creating..."}
                </>
              ) : mode === "edit" ? (
                "Update Product"
              ) : (
                "Create Product"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>

      {/* Media Library Selector */}
      <MediaLibrarySelector
        open={mediaLibraryOpen}
        onOpenChange={setMediaLibraryOpen}
        onSelect={(url: string) => {
          setFormData({
            ...formData,
            images: [...formData.images, url],
          });
          setMediaLibraryOpen(false);
        }}
        title="Select Product Images"
      />
    </Dialog>
  );
}
