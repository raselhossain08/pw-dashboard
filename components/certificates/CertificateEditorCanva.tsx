"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/context/ToastContext";
import { apiClient } from "@/lib/api-client";
import {
  Dialog,
  DialogContent,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import {
  Award,
  Download,
  Type,
  Image as ImageIcon,
  Square,
  Circle,
  Star,
  Trash2,
  Copy,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Underline,
  Layers,
  Save,
  Undo,
  Redo,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  MousePointer2,
  Palette,
  Sparkles,
  Heart,
  Shield,
  Trophy,
  Crown,
  Medal,
  BadgeCheck,
  Hexagon,
  Triangle,
  Pentagon,
  Octagon,
  Flame,
  Zap,
  Sun,
  Moon,
  Cloud,
  Mountain,
  Target,
  Diamond,
  Gem,
  Ribbon,
  Flag,
  FileText,
} from "lucide-react";

interface CertificateEditorCanvaProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type ElementType = "text" | "shape" | "background" | "image";
type ShapeType = "rectangle" | "circle" | "star" | "line";

interface CertificateTemplate {
  _id?: string;
  id: string;
  name: string;
  elements: CanvasElement[];
  thumbnail: string;
  createdAt: number;
  dynamicFields?: string[]; // Fields like {{studentName}}, {{courseName}}
}

interface CanvasElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  content?: string;
  isDynamic?: boolean; // Mark if this field contains dynamic placeholders
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string;
  fontStyle?: string;
  textDecoration?: string;
  color?: string;
  backgroundColor?: string;
  textAlign?: "left" | "center" | "right";
  opacity?: number;
  locked?: boolean;
  visible?: boolean;
  zIndex?: number;
  shapeType?: ShapeType;
  borderRadius?: number;
  borderWidth?: number;
  borderColor?: string;
  imageUrl?: string;
}

export default function CertificateEditorCanva({
  open,
  onOpenChange,
}: CertificateEditorCanvaProps) {
  const { push: showToast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [elements, setElements] = React.useState<CanvasElement[]>([
    {
      id: "bg-1",
      type: "background",
      x: 0,
      y: 0,
      width: 800,
      height: 600,
      rotation: 0,
      backgroundColor: "#fef3c7",
      opacity: 1,
      locked: true,
      visible: true,
      zIndex: 0,
    },
    {
      id: "title-1",
      type: "text",
      x: 150,
      y: 80,
      width: 500,
      height: 60,
      rotation: 0,
      content: "CERTIFICATE OF COMPLETION",
      fontSize: 36,
      fontFamily: "serif",
      fontWeight: "bold",
      color: "#1e40af",
      textAlign: "center",
      opacity: 1,
      locked: false,
      visible: true,
      zIndex: 1,
    },
    {
      id: "name-1",
      type: "text",
      x: 200,
      y: 250,
      width: 400,
      height: 50,
      rotation: 0,
      content: "John Doe",
      fontSize: 48,
      fontFamily: "serif",
      fontWeight: "bold",
      color: "#1f2937",
      textAlign: "center",
      opacity: 1,
      locked: false,
      visible: true,
      zIndex: 2,
    },
    {
      id: "shape-1",
      type: "shape",
      x: 350,
      y: 150,
      width: 100,
      height: 100,
      rotation: 0,
      shapeType: "star",
      backgroundColor: "#fbbf24",
      opacity: 0.3,
      locked: false,
      visible: true,
      zIndex: 1,
    },
  ]);

  const [selectedElement, setSelectedElement] = React.useState<string | null>(
    null
  );
  const [isDragging, setIsDragging] = React.useState(false);
  const [isResizing, setIsResizing] = React.useState(false);
  const [resizeHandle, setResizeHandle] = React.useState<string | null>(null);
  const [dragStart, setDragStart] = React.useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = React.useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  const [canvasSize] = React.useState({ width: 800, height: 600 });
  const [zoom, setZoom] = React.useState(100);
  const [history, setHistory] = React.useState<CanvasElement[][]>([]);
  const [historyIndex, setHistoryIndex] = React.useState(-1);
  const [uploadedImages, setUploadedImages] = React.useState<string[]>([]);
  const [savedTemplates, setSavedTemplates] = React.useState<
    CertificateTemplate[]
  >([]);
  const [currentTemplateId, setCurrentTemplateId] = React.useState<
    string | null
  >(null);
  const [showSaveDialog, setShowSaveDialog] = React.useState(false);
  const [templateName, setTemplateName] = React.useState("");
  const canvasRef = React.useRef<HTMLDivElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Load templates from backend on mount
  React.useEffect(() => {
    if (open) {
      fetchTemplates();
    }
  }, [open]);

  // Auto-save effect (debounced)
  React.useEffect(() => {
    if (!currentTemplateId || !open) return;

    const autoSaveTimer = setTimeout(() => {
      autoSaveTemplate();
    }, 3000); // Auto-save after 3 seconds of inactivity

    return () => clearTimeout(autoSaveTimer);
  }, [elements, currentTemplateId, open]);

  // Fetch templates from backend
  const fetchTemplates = async () => {
    try {
      setIsLoading(true);
      const { data } = await apiClient.get<any[]>("/certificates/templates");
      // Map _id to id for consistency
      const mappedTemplates = data.map((t) => ({
        ...t,
        id: t._id || t.id,
      }));
      setSavedTemplates(mappedTemplates || []);
    } catch (error) {
      console.error("Failed to fetch templates:", error);
      showToast({ message: "Failed to load templates", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-save current template
  const autoSaveTemplate = async () => {
    if (!currentTemplateId || isSaving) return;

    try {
      const template = savedTemplates.find((t) => t.id === currentTemplateId);
      if (!template) return;

      await apiClient.put(
        `/certificates/templates/${template._id || currentTemplateId}`,
        {
          elements: JSON.parse(JSON.stringify(elements)),
        }
      );
    } catch (error) {
      console.error("Auto-save failed:", error);
    }
  };

  // Save template to backend
  const saveTemplate = async () => {
    if (!canvasRef.current) return;

    try {
      setIsSaving(true);
      // Generate thumbnail
      const html2canvas = (await import("html2canvas")).default;
      const originalTransform = canvasRef.current.style.transform;
      canvasRef.current.style.transform = "scale(1)";

      const canvas = await html2canvas(canvasRef.current, {
        backgroundColor: "#ffffff",
        scale: 0.5, // Smaller for thumbnail
        logging: false,
        useCORS: true,
      });

      canvasRef.current.style.transform = originalTransform;

      const thumbnail = canvas.toDataURL("image/png");

      // Extract dynamic fields from elements
      const dynamicFields: string[] = [];
      elements.forEach((el) => {
        if (el.content) {
          const matches = el.content.match(/\{\{([^}]+)\}\}/g);
          if (matches) {
            matches.forEach((match) => {
              const field = match.replace(/\{\{|\}\}/g, "").trim();
              if (!dynamicFields.includes(field)) {
                dynamicFields.push(field);
              }
            });
          }
        }
      });

      const templateData = {
        name: templateName || `Template ${savedTemplates.length + 1}`,
        elements: JSON.parse(JSON.stringify(elements)),
        thumbnail,
        dynamicFields,
      };

      const { data } = await apiClient.post<any>(
        "/certificates/templates",
        templateData
      );

      const mappedTemplate = { ...data, id: data._id || data.id };
      setSavedTemplates([...savedTemplates, mappedTemplate]);
      setCurrentTemplateId(mappedTemplate.id);
      setShowSaveDialog(false);
      setTemplateName("");
      showToast({ message: "Template saved successfully!", type: "success" });
    } catch (error: any) {
      console.error("Save failed:", error);
      showToast({
        message: error?.response?.data?.message || "Failed to save template",
        type: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Load template with optional dynamic field values
  const loadTemplate = (
    templateId: string,
    dynamicValues?: Record<string, string>
  ) => {
    const template = savedTemplates.find((t) => t.id === templateId);
    if (template) {
      let loadedElements = JSON.parse(JSON.stringify(template.elements));

      // Replace dynamic fields if values provided
      if (dynamicValues) {
        loadedElements = loadedElements.map((el: CanvasElement) => {
          if (el.content) {
            let newContent = el.content;
            Object.entries(dynamicValues).forEach(([key, value]) => {
              newContent = newContent.replace(
                new RegExp(`\\{\\{${key}\\}\\}`, "g"),
                value
              );
            });
            return { ...el, content: newContent };
          }
          return el;
        });
      }

      setElements(loadedElements);
      setSelectedElement(null);
      setCurrentTemplateId(templateId);
      saveToHistory();

      if (dynamicValues) {
        showToast({
          message: "Template loaded with custom values",
          type: "success",
        });
      }
    }
  };

  // Delete template from backend
  const deleteTemplate = async (templateId: string) => {
    if (!confirm("Are you sure you want to delete this template?")) return;

    try {
      const template = savedTemplates.find((t) => t.id === templateId);
      if (template?._id) {
        await apiClient.delete(`/certificates/templates/${template._id}`);
      }

      const updatedTemplates = savedTemplates.filter(
        (t) => t.id !== templateId
      );
      setSavedTemplates(updatedTemplates);

      if (currentTemplateId === templateId) {
        setCurrentTemplateId(null);
      }

      showToast({ message: "Template deleted successfully", type: "success" });
    } catch (error) {
      console.error("Delete failed:", error);
      showToast({ message: "Failed to delete template", type: "error" });
    }
  };

  // Export canvas as image
  const exportCertificate = async () => {
    if (!canvasRef.current) return;

    try {
      // Use html2canvas to capture the canvas
      const html2canvas = (await import("html2canvas")).default;

      // Temporarily reset zoom for export
      const originalTransform = canvasRef.current.style.transform;
      canvasRef.current.style.transform = "scale(1)";

      const canvas = await html2canvas(canvasRef.current, {
        backgroundColor: "#ffffff",
        scale: 2, // Higher quality
        logging: false,
        useCORS: true,
      });

      // Restore zoom
      canvasRef.current.style.transform = originalTransform;

      // Convert to blob and download
      canvas.toBlob((blob: Blob | null) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `certificate-${Date.now()}.png`;
          link.click();
          URL.revokeObjectURL(url);
        }
      }, "image/png");
      showToast({
        message: "Certificate exported successfully!",
        type: "success",
      });
    } catch (error) {
      console.error("Export failed:", error);
      showToast({ message: "Failed to export certificate", type: "error" });
    }
  };

  // Save to history for undo/redo
  const saveToHistory = React.useCallback(() => {
    setHistory((prev) => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(JSON.parse(JSON.stringify(elements)));
      return newHistory;
    });
    setHistoryIndex((prev) => prev + 1);
  }, [elements, historyIndex]);

  // Add element functions
  const addTextElement = () => {
    const newElement: CanvasElement = {
      id: `text-${Date.now()}`,
      type: "text",
      x: 100,
      y: 100,
      width: 200,
      height: 40,
      rotation: 0,
      content: "New Text",
      fontSize: 24,
      fontFamily: "sans-serif",
      fontWeight: "normal",
      color: "#000000",
      textAlign: "left",
      opacity: 1,
      locked: false,
      visible: true,
      zIndex: elements.length,
    };
    setElements([...elements, newElement]);
    setSelectedElement(newElement.id);
    saveToHistory();
  };

  const addShapeElement = (shapeType: ShapeType) => {
    const newElement: CanvasElement = {
      id: `shape-${Date.now()}`,
      type: "shape",
      x: 150,
      y: 150,
      width: 100,
      height: 100,
      rotation: 0,
      shapeType,
      backgroundColor: "#3b82f6",
      borderWidth: 0,
      borderColor: "#000000",
      borderRadius: shapeType === "rectangle" ? 8 : 0,
      opacity: 1,
      locked: false,
      visible: true,
      zIndex: elements.length,
    };
    setElements([...elements, newElement]);
    setSelectedElement(newElement.id);
    saveToHistory();
  };

  const addImageElement = (imageUrl: string) => {
    const newElement: CanvasElement = {
      id: `image-${Date.now()}`,
      type: "image",
      x: 100,
      y: 100,
      width: 200,
      height: 200,
      rotation: 0,
      imageUrl,
      opacity: 1,
      locked: false,
      visible: true,
      zIndex: elements.length,
    };
    setElements([...elements, newElement]);
    setSelectedElement(newElement.id);
    saveToHistory();
  };

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      // Validate file type
      const validTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
        "image/svg+xml",
        "image/bmp",
        "image/tiff",
      ];
      if (!validTypes.includes(file.type)) {
        alert(`Invalid file type: ${file.name}. Please upload an image file.`);
        return;
      }

      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        alert(`File too large: ${file.name}. Maximum size is 10MB.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string;
        setUploadedImages((prev) => [...prev, imageUrl]);
        addImageElement(imageUrl);
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    if (e.target) {
      e.target.value = "";
    }
  };

  // Update element
  const updateElement = (id: string, updates: Partial<CanvasElement>) => {
    setElements((prev) =>
      prev.map((el) => (el.id === id ? { ...el, ...updates } : el))
    );
  };

  // Delete element
  const deleteElement = () => {
    if (selectedElement) {
      setElements((prev) => prev.filter((el) => el.id !== selectedElement));
      setSelectedElement(null);
      saveToHistory();
    }
  };

  // Duplicate element
  const duplicateElement = () => {
    if (selectedElement) {
      const element = elements.find((el) => el.id === selectedElement);
      if (element) {
        const newElement = {
          ...element,
          id: `${element.type}-${Date.now()}`,
          x: element.x + 20,
          y: element.y + 20,
          zIndex: elements.length,
        };
        setElements([...elements, newElement]);
        setSelectedElement(newElement.id);
        saveToHistory();
      }
    }
  };

  // Undo/Redo
  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setElements(history[historyIndex - 1]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setElements(history[historyIndex + 1]);
    }
  };

  // Mouse handlers for dragging
  const handleMouseDown = (e: React.MouseEvent, elementId: string) => {
    const element = elements.find((el) => el.id === elementId);
    if (element?.locked) return;

    setSelectedElement(elementId);
    setIsDragging(true);

    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      setDragStart({
        x: e.clientX - rect.left - element!.x * (zoom / 100),
        y: e.clientY - rect.top - element!.y * (zoom / 100),
      });
    }
  };

  // Mouse handler for resize
  const handleResizeMouseDown = (
    e: React.MouseEvent,
    elementId: string,
    handle: string
  ) => {
    e.stopPropagation();
    const element = elements.find((el) => el.id === elementId);
    if (element?.locked) return;

    setSelectedElement(elementId);
    setIsResizing(true);
    setResizeHandle(handle);

    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      setResizeStart({
        x: e.clientX,
        y: e.clientY,
        width: element!.width,
        height: element!.height,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isResizing && selectedElement && resizeHandle) {
      const element = elements.find((el) => el.id === selectedElement);
      if (element?.locked) return;

      const deltaX = (e.clientX - resizeStart.x) / (zoom / 100);
      const deltaY = (e.clientY - resizeStart.y) / (zoom / 100);

      let newWidth = resizeStart.width;
      let newHeight = resizeStart.height;
      let newX = element!.x;
      let newY = element!.y;

      // Handle different resize corners/edges
      if (resizeHandle.includes("right")) {
        newWidth = Math.max(20, resizeStart.width + deltaX);
      }
      if (resizeHandle.includes("left")) {
        newWidth = Math.max(20, resizeStart.width - deltaX);
        newX = element!.x + (resizeStart.width - newWidth);
      }
      if (resizeHandle.includes("bottom")) {
        newHeight = Math.max(20, resizeStart.height + deltaY);
      }
      if (resizeHandle.includes("top")) {
        newHeight = Math.max(20, resizeStart.height - deltaY);
        newY = element!.y + (resizeStart.height - newHeight);
      }

      updateElement(selectedElement, {
        x: newX,
        y: newY,
        width: newWidth,
        height: newHeight,
      });
    } else if (isDragging && selectedElement) {
      const element = elements.find((el) => el.id === selectedElement);
      if (element?.locked) return;

      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        const newX = (e.clientX - rect.left - dragStart.x) / (zoom / 100);
        const newY = (e.clientY - rect.top - dragStart.y) / (zoom / 100);

        updateElement(selectedElement, {
          x: Math.max(0, Math.min(newX, canvasSize.width - element!.width)),
          y: Math.max(0, Math.min(newY, canvasSize.height - element!.height)),
        });
      }
    }
  };

  const handleMouseUp = () => {
    if (isDragging || isResizing) {
      setIsDragging(false);
      setIsResizing(false);
      setResizeHandle(null);
      saveToHistory();
    }
  };

  const selectedElementData = elements.find((el) => el.id === selectedElement);

  // Render element on canvas
  const renderElement = (element: CanvasElement) => {
    const isSelected = selectedElement === element.id;

    const baseStyle: React.CSSProperties = {
      position: "absolute",
      left: element.x,
      top: element.y,
      width: element.width,
      height: element.height,
      transform: `rotate(${element.rotation}deg)`,
      opacity: element.opacity,
      zIndex: element.zIndex,
      cursor: element.locked ? "not-allowed" : "move",
      display: element.visible ? "block" : "none",
    };

    if (element.type === "background") {
      return (
        <div
          key={element.id}
          style={{
            ...baseStyle,
            backgroundColor: element.backgroundColor,
            width: canvasSize.width,
            height: canvasSize.height,
          }}
        />
      );
    }

    if (element.type === "text") {
      return (
        <div
          key={element.id}
          onMouseDown={(e) => handleMouseDown(e, element.id)}
          style={{
            ...baseStyle,
            fontSize: element.fontSize,
            fontFamily: element.fontFamily,
            fontWeight: element.fontWeight,
            fontStyle: element.fontStyle,
            textDecoration: element.textDecoration,
            color: element.color,
            textAlign: element.textAlign,
            backgroundColor: element.backgroundColor,
            border: isSelected
              ? "2px dashed #6366f1"
              : "2px dashed transparent",
            padding: "8px",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            userSelect: "none",
          }}
        >
          {element.content}
          {isSelected && !element.locked && (
            <>
              <div
                className="absolute -top-3 -right-3 w-6 h-6 bg-indigo-600 rounded-full border-2 border-white shadow-lg cursor-ne-resize"
                onMouseDown={(e) =>
                  handleResizeMouseDown(e, element.id, "top-right")
                }
              />
              <div
                className="absolute -top-3 -left-3 w-6 h-6 bg-indigo-600 rounded-full border-2 border-white shadow-lg cursor-nw-resize"
                onMouseDown={(e) =>
                  handleResizeMouseDown(e, element.id, "top-left")
                }
              />
              <div
                className="absolute -bottom-3 -right-3 w-6 h-6 bg-indigo-600 rounded-full border-2 border-white shadow-lg cursor-se-resize"
                onMouseDown={(e) =>
                  handleResizeMouseDown(e, element.id, "bottom-right")
                }
              />
              <div
                className="absolute -bottom-3 -left-3 w-6 h-6 bg-indigo-600 rounded-full border-2 border-white shadow-lg cursor-sw-resize"
                onMouseDown={(e) =>
                  handleResizeMouseDown(e, element.id, "bottom-left")
                }
              />
            </>
          )}
        </div>
      );
    }

    if (element.type === "shape") {
      let shapeElement;

      if (element.shapeType === "rectangle") {
        shapeElement = (
          <div
            style={{
              width: "100%",
              height: "100%",
              backgroundColor: element.backgroundColor,
              borderRadius: element.borderRadius,
              border: element.borderWidth
                ? `${element.borderWidth}px solid ${element.borderColor}`
                : "none",
            }}
          />
        );
      } else if (element.shapeType === "circle") {
        shapeElement = (
          <div
            style={{
              width: "100%",
              height: "100%",
              backgroundColor: element.backgroundColor,
              borderRadius: "50%",
              border: element.borderWidth
                ? `${element.borderWidth}px solid ${element.borderColor}`
                : "none",
            }}
          />
        );
      } else if (element.shapeType === "star") {
        shapeElement = (
          <Star
            style={{
              width: "100%",
              height: "100%",
              fill: element.backgroundColor,
              stroke: element.borderColor,
              strokeWidth: element.borderWidth || 0,
            }}
          />
        );
      }

      return (
        <div
          key={element.id}
          onMouseDown={(e) => handleMouseDown(e, element.id)}
          style={{
            ...baseStyle,
            border: isSelected
              ? "2px dashed #6366f1"
              : "2px dashed transparent",
          }}
        >
          {shapeElement}
          {isSelected && !element.locked && (
            <>
              <div
                className="absolute -top-3 -right-3 w-6 h-6 bg-indigo-600 rounded-full border-2 border-white shadow-lg cursor-ne-resize"
                onMouseDown={(e) =>
                  handleResizeMouseDown(e, element.id, "top-right")
                }
              />
              <div
                className="absolute -top-3 -left-3 w-6 h-6 bg-indigo-600 rounded-full border-2 border-white shadow-lg cursor-nw-resize"
                onMouseDown={(e) =>
                  handleResizeMouseDown(e, element.id, "top-left")
                }
              />
              <div
                className="absolute -bottom-3 -right-3 w-6 h-6 bg-indigo-600 rounded-full border-2 border-white shadow-lg cursor-se-resize"
                onMouseDown={(e) =>
                  handleResizeMouseDown(e, element.id, "bottom-right")
                }
              />
              <div
                className="absolute -bottom-3 -left-3 w-6 h-6 bg-indigo-600 rounded-full border-2 border-white shadow-lg cursor-sw-resize"
                onMouseDown={(e) =>
                  handleResizeMouseDown(e, element.id, "bottom-left")
                }
              />
            </>
          )}
        </div>
      );
    }

    if (element.type === "image" && element.imageUrl) {
      return (
        <div
          key={element.id}
          onMouseDown={(e) => handleMouseDown(e, element.id)}
          style={{
            ...baseStyle,
            border: isSelected
              ? "2px dashed #6366f1"
              : "2px dashed transparent",
            overflow: "hidden",
          }}
        >
          <img
            src={element.imageUrl}
            alt="Uploaded"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              pointerEvents: "none",
            }}
          />
          {isSelected && !element.locked && (
            <>
              <div
                className="absolute -top-3 -right-3 w-6 h-6 bg-indigo-600 rounded-full border-2 border-white shadow-lg cursor-ne-resize"
                onMouseDown={(e) =>
                  handleResizeMouseDown(e, element.id, "top-right")
                }
              />
              <div
                className="absolute -top-3 -left-3 w-6 h-6 bg-indigo-600 rounded-full border-2 border-white shadow-lg cursor-nw-resize"
                onMouseDown={(e) =>
                  handleResizeMouseDown(e, element.id, "top-left")
                }
              />
              <div
                className="absolute -bottom-3 -right-3 w-6 h-6 bg-indigo-600 rounded-full border-2 border-white shadow-lg cursor-se-resize"
                onMouseDown={(e) =>
                  handleResizeMouseDown(e, element.id, "bottom-right")
                }
              />
              <div
                className="absolute -bottom-3 -left-3 w-6 h-6 bg-indigo-600 rounded-full border-2 border-white shadow-lg cursor-sw-resize"
                onMouseDown={(e) =>
                  handleResizeMouseDown(e, element.id, "bottom-left")
                }
              />
            </>
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-[90vw] max-w-[95vw] max-h-[98vh] p-0 gap-0">
        <div className="flex max-w-[95vw] flex-col h-[90vh] overflow-x-auto ">
          {/* Top Toolbar */}
          <div className="flex items-center justify-between px-8 py-2 border-b bg-white">
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="w-5 h-5 text-primary" />
              Certificate Designer
            </DialogTitle>

            <div className="flex items-center gap-2 mr-4">
              {/* Undo/Redo */}
              <Button
                size="sm"
                variant="ghost"
                onClick={undo}
                disabled={historyIndex <= 0}
              >
                <Undo className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={redo}
                disabled={historyIndex >= history.length - 1}
              >
                <Redo className="w-4 h-4" />
              </Button>

              <div className="w-px h-6 bg-gray-300" />

              {/* Zoom Controls */}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setZoom(Math.max(25, zoom - 25))}
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <span className="text-sm font-medium w-12 text-center">
                {zoom}%
              </span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setZoom(Math.min(200, zoom + 25))}
              >
                <ZoomIn className="w-4 h-4" />
              </Button>

              <div className="w-px h-6 bg-gray-300" />

              {/* Actions */}
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowSaveDialog(true)}
              >
                <Save className="w-4 h-4 mr-2" />
                Save Template
              </Button>
              <Button size="sm" onClick={exportCertificate}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          <div className="flex flex-1 overflow-hidden">
            {/* Left Sidebar - Elements Panel */}
            <div className="w-64 border-r bg-gray-50 overflow-y-auto">
              <Tabs defaultValue="elements" className="w-full">
                <TabsList className="w-full grid grid-cols-3">
                  <TabsTrigger value="elements">Elements</TabsTrigger>
                  <TabsTrigger value="templates">Templates</TabsTrigger>
                  <TabsTrigger value="uploads">Uploads</TabsTrigger>
                </TabsList>

                <TabsContent value="elements" className="p-3 space-y-3">
                  {/* Add Text */}
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={addTextElement}
                  >
                    <Type className="w-4 h-4 mr-2" />
                    Add Text
                  </Button>

                  {/* Add Shapes */}
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold">
                      Basic Shapes
                    </Label>
                    <div className="grid grid-cols-4 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-10"
                        onClick={() => addShapeElement("rectangle")}
                        title="Rectangle"
                      >
                        <Square className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-10"
                        onClick={() => addShapeElement("circle")}
                        title="Circle"
                      >
                        <Circle className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-10"
                        onClick={() => addShapeElement("star")}
                        title="Star"
                      >
                        <Star className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-10"
                        onClick={() => addShapeElement("circle")}
                        title="Hexagon"
                      >
                        <Hexagon className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-10"
                        onClick={() => addShapeElement("star")}
                        title="Triangle"
                      >
                        <Triangle className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-10"
                        onClick={() => addShapeElement("circle")}
                        title="Pentagon"
                      >
                        <Pentagon className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-10"
                        onClick={() => addShapeElement("circle")}
                        title="Octagon"
                      >
                        <Octagon className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-10"
                        onClick={() => addShapeElement("star")}
                        title="Diamond"
                      >
                        <Diamond className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Awards & Achievements */}
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold">
                      Awards & Achievements
                    </Label>
                    <div className="grid grid-cols-4 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-10"
                        title="Award"
                      >
                        <Award className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-10"
                        title="Trophy"
                      >
                        <Trophy className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-10"
                        title="Medal"
                      >
                        <Medal className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-10"
                        title="Crown"
                      >
                        <Crown className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-10"
                        title="Badge"
                      >
                        <BadgeCheck className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-10"
                        title="Star"
                      >
                        <Star className="w-4 h-4 fill-current" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-10"
                        title="Shield"
                      >
                        <Shield className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-10"
                        title="Target"
                      >
                        <Target className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Decorative Icons */}
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold">Decorative</Label>
                    <div className="grid grid-cols-4 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-10"
                        title="Sparkles"
                      >
                        <Sparkles className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-10"
                        title="Heart"
                      >
                        <Heart className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-10"
                        title="Flame"
                      >
                        <Flame className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-10"
                        title="Zap"
                      >
                        <Zap className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-10"
                        title="Sun"
                      >
                        <Sun className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-10"
                        title="Moon"
                      >
                        <Moon className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-10"
                        title="Cloud"
                      >
                        <Cloud className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-10"
                        title="Mountain"
                      >
                        <Mountain className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-10"
                        title="Gem"
                      >
                        <Gem className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-10"
                        title="Ribbon"
                      >
                        <Ribbon className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-10"
                        title="Flag"
                      >
                        <Flag className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Layers */}
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold flex items-center gap-1">
                      <Layers className="w-3 h-3" />
                      Layers
                    </Label>
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                      {[...elements].reverse().map((element) => (
                        <div
                          key={element.id}
                          onClick={() => setSelectedElement(element.id)}
                          className={`flex items-center justify-between p-2 rounded text-xs cursor-pointer ${
                            selectedElement === element.id
                              ? "bg-indigo-100 border border-indigo-400"
                              : "bg-white border hover:border-gray-300"
                          }`}
                        >
                          <span className="flex items-center gap-2 truncate">
                            {element.type === "text" && (
                              <Type className="w-3 h-3" />
                            )}
                            {element.type === "shape" && (
                              <Square className="w-3 h-3" />
                            )}
                            {element.type === "background" && (
                              <Palette className="w-3 h-3" />
                            )}
                            {element.content || element.type}
                          </span>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-5 w-5 p-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                updateElement(element.id, {
                                  visible: !element.visible,
                                });
                              }}
                            >
                              {element.visible ? (
                                <Eye className="w-3 h-3" />
                              ) : (
                                <EyeOff className="w-3 h-3" />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-5 w-5 p-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                updateElement(element.id, {
                                  locked: !element.locked,
                                });
                              }}
                            >
                              {element.locked ? (
                                <Lock className="w-3 h-3" />
                              ) : (
                                <Unlock className="w-3 h-3" />
                              )}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="templates" className="p-3">
                  {savedTemplates.length === 0 ? (
                    <div className="text-center py-8 text-sm text-gray-500">
                      <FileText className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                      <p>No saved templates yet</p>
                      <p className="text-xs mt-1">
                        Click "Save Template" to save your design
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-3">
                      {savedTemplates.map((template) => (
                        <div
                          key={template.id}
                          className="border rounded overflow-hidden bg-white hover:border-indigo-400 transition-colors"
                        >
                          <div
                            className="aspect-4/3 bg-gray-100 cursor-pointer"
                            onClick={() => loadTemplate(template.id)}
                          >
                            <img
                              src={template.thumbnail}
                              alt={template.name}
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <div className="p-2 flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium truncate">
                                {template.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {new Date(
                                  template.createdAt
                                ).toLocaleDateString()}
                              </p>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => deleteTemplate(template.id)}
                              className="h-6 w-6 p-0"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="uploads" className="p-3 space-y-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,.jpg,.jpeg,.png,.gif,.webp,.svg,.bmp,.tiff"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <ImageIcon className="w-4 h-4 mr-2" />
                    Upload Image
                  </Button>

                  <div className="space-y-2">
                    <Label className="text-xs font-semibold">
                      Supported Formats
                    </Label>
                    <p className="text-xs text-gray-500">
                      JPG, PNG, GIF, WebP, SVG, BMP, TIFF (Max 10MB)
                    </p>
                  </div>

                  {uploadedImages.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold">
                        Uploaded Images
                      </Label>
                      <div className="grid grid-cols-2 gap-2 max-h-80 overflow-y-auto">
                        {uploadedImages.map((imageUrl, index) => (
                          <div
                            key={index}
                            className="aspect-square bg-white border rounded cursor-pointer hover:border-indigo-400 overflow-hidden"
                            onClick={() => addImageElement(imageUrl)}
                          >
                            <img
                              src={imageUrl}
                              alt={`Upload ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 text-center">
                        Click an image to add it to canvas
                      </p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>

            {/* Canvas Area */}
            <div className="flex-1 bg-gray-200 overflow-auto flex items-center justify-center p-8">
              <div
                ref={canvasRef}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                className="bg-white shadow-2xl relative"
                style={{
                  width: canvasSize.width,
                  height: canvasSize.height,
                  transform: `scale(${zoom / 100})`,
                  transformOrigin: "center center",
                }}
              >
                {elements.map((element) => renderElement(element))}
              </div>
            </div>

            {/* Right Sidebar - Properties Panel */}
            <div className="w-64 border-l bg-gray-50 overflow-y-auto p-4 space-y-4">
              {selectedElementData ? (
                <>
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold">Element</Label>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={duplicateElement}
                        className="flex-1"
                      >
                        <Copy className="w-3 h-3 mr-1" />
                        Duplicate
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={deleteElement}
                        className="flex-1"
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>

                  {selectedElementData.type === "text" && (
                    <>
                      <div className="space-y-2">
                        <Label className="text-xs">Text Content</Label>
                        <Input
                          value={selectedElementData.content}
                          onChange={(e) =>
                            updateElement(selectedElementData.id, {
                              content: e.target.value,
                            })
                          }
                          className="text-sm"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs">
                          Font Size: {selectedElementData.fontSize}px
                        </Label>
                        <Slider
                          value={[selectedElementData.fontSize || 16]}
                          onValueChange={(value) =>
                            updateElement(selectedElementData.id, {
                              fontSize: value[0],
                            })
                          }
                          min={8}
                          max={120}
                          step={1}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs">Font Family</Label>
                        <Select
                          value={selectedElementData.fontFamily}
                          onValueChange={(value) =>
                            updateElement(selectedElementData.id, {
                              fontFamily: value,
                            })
                          }
                        >
                          <SelectTrigger className="text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="max-h-60">
                            {/* System Fonts */}
                            <SelectItem
                              value="Arial, sans-serif"
                              style={{ fontFamily: "Arial, sans-serif" }}
                            >
                              Arial
                            </SelectItem>
                            <SelectItem
                              value="'Arial Black', sans-serif"
                              style={{
                                fontFamily: "'Arial Black', sans-serif",
                              }}
                            >
                              Arial Black
                            </SelectItem>
                            <SelectItem
                              value="'Comic Sans MS', cursive"
                              style={{ fontFamily: "'Comic Sans MS', cursive" }}
                            >
                              Comic Sans MS
                            </SelectItem>
                            <SelectItem
                              value="'Courier New', monospace"
                              style={{ fontFamily: "'Courier New', monospace" }}
                            >
                              Courier New
                            </SelectItem>
                            <SelectItem
                              value="Georgia, serif"
                              style={{ fontFamily: "Georgia, serif" }}
                            >
                              Georgia
                            </SelectItem>
                            <SelectItem
                              value="Impact, sans-serif"
                              style={{ fontFamily: "Impact, sans-serif" }}
                            >
                              Impact
                            </SelectItem>
                            <SelectItem
                              value="'Lucida Console', monospace"
                              style={{
                                fontFamily: "'Lucida Console', monospace",
                              }}
                            >
                              Lucida Console
                            </SelectItem>
                            <SelectItem
                              value="'Lucida Sans Unicode', sans-serif"
                              style={{
                                fontFamily: "'Lucida Sans Unicode', sans-serif",
                              }}
                            >
                              Lucida Sans
                            </SelectItem>
                            <SelectItem
                              value="'Palatino Linotype', serif"
                              style={{
                                fontFamily: "'Palatino Linotype', serif",
                              }}
                            >
                              Palatino
                            </SelectItem>
                            <SelectItem
                              value="Tahoma, sans-serif"
                              style={{ fontFamily: "Tahoma, sans-serif" }}
                            >
                              Tahoma
                            </SelectItem>
                            <SelectItem
                              value="'Times New Roman', serif"
                              style={{ fontFamily: "'Times New Roman', serif" }}
                            >
                              Times New Roman
                            </SelectItem>
                            <SelectItem
                              value="'Trebuchet MS', sans-serif"
                              style={{
                                fontFamily: "'Trebuchet MS', sans-serif",
                              }}
                            >
                              Trebuchet MS
                            </SelectItem>
                            <SelectItem
                              value="Verdana, sans-serif"
                              style={{ fontFamily: "Verdana, sans-serif" }}
                            >
                              Verdana
                            </SelectItem>

                            {/* Generic Families */}
                            <SelectItem
                              value="serif"
                              style={{ fontFamily: "serif" }}
                            >
                              Serif (Generic)
                            </SelectItem>
                            <SelectItem
                              value="sans-serif"
                              style={{ fontFamily: "sans-serif" }}
                            >
                              Sans Serif (Generic)
                            </SelectItem>
                            <SelectItem
                              value="monospace"
                              style={{ fontFamily: "monospace" }}
                            >
                              Monospace (Generic)
                            </SelectItem>
                            <SelectItem
                              value="cursive"
                              style={{ fontFamily: "cursive" }}
                            >
                              Cursive (Generic)
                            </SelectItem>
                            <SelectItem
                              value="fantasy"
                              style={{ fontFamily: "fantasy" }}
                            >
                              Fantasy (Generic)
                            </SelectItem>

                            {/* Modern System Fonts */}
                            <SelectItem
                              value="system-ui, sans-serif"
                              style={{ fontFamily: "system-ui, sans-serif" }}
                            >
                              System UI
                            </SelectItem>
                            <SelectItem
                              value="-apple-system, BlinkMacSystemFont, sans-serif"
                              style={{
                                fontFamily:
                                  "-apple-system, BlinkMacSystemFont, sans-serif",
                              }}
                            >
                              Apple System
                            </SelectItem>
                            <SelectItem
                              value="'Segoe UI', sans-serif"
                              style={{ fontFamily: "'Segoe UI', sans-serif" }}
                            >
                              Segoe UI
                            </SelectItem>
                            <SelectItem
                              value="Roboto, sans-serif"
                              style={{ fontFamily: "Roboto, sans-serif" }}
                            >
                              Roboto
                            </SelectItem>
                            <SelectItem
                              value="'Helvetica Neue', sans-serif"
                              style={{
                                fontFamily: "'Helvetica Neue', sans-serif",
                              }}
                            >
                              Helvetica Neue
                            </SelectItem>
                            <SelectItem
                              value="Helvetica, sans-serif"
                              style={{ fontFamily: "Helvetica, sans-serif" }}
                            >
                              Helvetica
                            </SelectItem>

                            {/* Elegant/Formal Fonts */}
                            <SelectItem
                              value="Garamond, serif"
                              style={{ fontFamily: "Garamond, serif" }}
                            >
                              Garamond
                            </SelectItem>
                            <SelectItem
                              value="'Book Antiqua', serif"
                              style={{ fontFamily: "'Book Antiqua', serif" }}
                            >
                              Book Antiqua
                            </SelectItem>
                            <SelectItem
                              value="Baskerville, serif"
                              style={{ fontFamily: "Baskerville, serif" }}
                            >
                              Baskerville
                            </SelectItem>
                            <SelectItem
                              value="'Bookman Old Style', serif"
                              style={{
                                fontFamily: "'Bookman Old Style', serif",
                              }}
                            >
                              Bookman
                            </SelectItem>
                            <SelectItem
                              value="Cambria, serif"
                              style={{ fontFamily: "Cambria, serif" }}
                            >
                              Cambria
                            </SelectItem>
                            <SelectItem
                              value="Didot, serif"
                              style={{ fontFamily: "Didot, serif" }}
                            >
                              Didot
                            </SelectItem>

                            {/* Modern/Clean Fonts */}
                            <SelectItem
                              value="Calibri, sans-serif"
                              style={{ fontFamily: "Calibri, sans-serif" }}
                            >
                              Calibri
                            </SelectItem>
                            <SelectItem
                              value="Candara, sans-serif"
                              style={{ fontFamily: "Candara, sans-serif" }}
                            >
                              Candara
                            </SelectItem>
                            <SelectItem
                              value="'Century Gothic', sans-serif"
                              style={{
                                fontFamily: "'Century Gothic', sans-serif",
                              }}
                            >
                              Century Gothic
                            </SelectItem>
                            <SelectItem
                              value="'Franklin Gothic Medium', sans-serif"
                              style={{
                                fontFamily:
                                  "'Franklin Gothic Medium', sans-serif",
                              }}
                            >
                              Franklin Gothic
                            </SelectItem>
                            <SelectItem
                              value="'Gill Sans', sans-serif"
                              style={{ fontFamily: "'Gill Sans', sans-serif" }}
                            >
                              Gill Sans
                            </SelectItem>
                            <SelectItem
                              value="Optima, sans-serif"
                              style={{ fontFamily: "Optima, sans-serif" }}
                            >
                              Optima
                            </SelectItem>

                            {/* Decorative/Script Fonts */}
                            <SelectItem
                              value="'Brush Script MT', cursive"
                              style={{
                                fontFamily: "'Brush Script MT', cursive",
                              }}
                            >
                              Brush Script
                            </SelectItem>
                            <SelectItem
                              value="'Lucida Handwriting', cursive"
                              style={{
                                fontFamily: "'Lucida Handwriting', cursive",
                              }}
                            >
                              Lucida Handwriting
                            </SelectItem>
                            <SelectItem
                              value="'Monotype Corsiva', cursive"
                              style={{
                                fontFamily: "'Monotype Corsiva', cursive",
                              }}
                            >
                              Monotype Corsiva
                            </SelectItem>
                            <SelectItem
                              value="Papyrus, fantasy"
                              style={{ fontFamily: "Papyrus, fantasy" }}
                            >
                              Papyrus
                            </SelectItem>

                            {/* Monospace Fonts */}
                            <SelectItem
                              value="Consolas, monospace"
                              style={{ fontFamily: "Consolas, monospace" }}
                            >
                              Consolas
                            </SelectItem>
                            <SelectItem
                              value="Monaco, monospace"
                              style={{ fontFamily: "Monaco, monospace" }}
                            >
                              Monaco
                            </SelectItem>
                            <SelectItem
                              value="'Andale Mono', monospace"
                              style={{ fontFamily: "'Andale Mono', monospace" }}
                            >
                              Andale Mono
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs">Font Style</Label>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant={
                              selectedElementData.fontWeight === "bold"
                                ? "default"
                                : "outline"
                            }
                            onClick={() =>
                              updateElement(selectedElementData.id, {
                                fontWeight:
                                  selectedElementData.fontWeight === "bold"
                                    ? "normal"
                                    : "bold",
                              })
                            }
                          >
                            <Bold className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant={
                              selectedElementData.fontStyle === "italic"
                                ? "default"
                                : "outline"
                            }
                            onClick={() =>
                              updateElement(selectedElementData.id, {
                                fontStyle:
                                  selectedElementData.fontStyle === "italic"
                                    ? "normal"
                                    : "italic",
                              })
                            }
                          >
                            <Italic className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant={
                              selectedElementData.textDecoration === "underline"
                                ? "default"
                                : "outline"
                            }
                            onClick={() =>
                              updateElement(selectedElementData.id, {
                                textDecoration:
                                  selectedElementData.textDecoration ===
                                  "underline"
                                    ? "none"
                                    : "underline",
                              })
                            }
                          >
                            <Underline className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs">Text Align</Label>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant={
                              selectedElementData.textAlign === "left"
                                ? "default"
                                : "outline"
                            }
                            onClick={() =>
                              updateElement(selectedElementData.id, {
                                textAlign: "left",
                              })
                            }
                          >
                            <AlignLeft className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant={
                              selectedElementData.textAlign === "center"
                                ? "default"
                                : "outline"
                            }
                            onClick={() =>
                              updateElement(selectedElementData.id, {
                                textAlign: "center",
                              })
                            }
                          >
                            <AlignCenter className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant={
                              selectedElementData.textAlign === "right"
                                ? "default"
                                : "outline"
                            }
                            onClick={() =>
                              updateElement(selectedElementData.id, {
                                textAlign: "right",
                              })
                            }
                          >
                            <AlignRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs">Text Color</Label>
                        <Input
                          type="color"
                          value={selectedElementData.color}
                          onChange={(e) =>
                            updateElement(selectedElementData.id, {
                              color: e.target.value,
                            })
                          }
                          className="h-10"
                        />
                      </div>
                    </>
                  )}

                  {selectedElementData.type === "image" && (
                    <>
                      <div className="space-y-2">
                        <Label className="text-xs">Image Preview</Label>
                        <div className="w-full aspect-square bg-gray-100 border rounded overflow-hidden">
                          <img
                            src={selectedElementData.imageUrl}
                            alt="Preview"
                            className="w-full h-full object-contain"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs">Replace Image</Label>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <ImageIcon className="w-4 h-4 mr-2" />
                          Upload New
                        </Button>
                      </div>
                    </>
                  )}

                  {(selectedElementData.type === "shape" ||
                    selectedElementData.type === "background") && (
                    <>
                      <div className="space-y-2">
                        <Label className="text-xs">Fill Color</Label>
                        <Input
                          type="color"
                          value={selectedElementData.backgroundColor}
                          onChange={(e) =>
                            updateElement(selectedElementData.id, {
                              backgroundColor: e.target.value,
                            })
                          }
                          className="h-10"
                        />
                      </div>

                      {selectedElementData.type === "shape" && (
                        <>
                          <div className="space-y-2">
                            <Label className="text-xs">
                              Border Width:{" "}
                              {selectedElementData.borderWidth || 0}px
                            </Label>
                            <Slider
                              value={[selectedElementData.borderWidth || 0]}
                              onValueChange={(value) =>
                                updateElement(selectedElementData.id, {
                                  borderWidth: value[0],
                                })
                              }
                              min={0}
                              max={20}
                              step={1}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label className="text-xs">Border Color</Label>
                            <Input
                              type="color"
                              value={
                                selectedElementData.borderColor || "#000000"
                              }
                              onChange={(e) =>
                                updateElement(selectedElementData.id, {
                                  borderColor: e.target.value,
                                })
                              }
                              className="h-10"
                            />
                          </div>
                        </>
                      )}
                    </>
                  )}

                  <div className="space-y-2">
                    <Label className="text-xs">
                      Opacity:{" "}
                      {Math.round((selectedElementData.opacity || 1) * 100)}%
                    </Label>
                    <Slider
                      value={[(selectedElementData.opacity || 1) * 100]}
                      onValueChange={(value) =>
                        updateElement(selectedElementData.id, {
                          opacity: value[0] / 100,
                        })
                      }
                      min={0}
                      max={100}
                      step={1}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">
                      Rotation: {selectedElementData.rotation}°
                    </Label>
                    <Slider
                      value={[selectedElementData.rotation || 0]}
                      onValueChange={(value) =>
                        updateElement(selectedElementData.id, {
                          rotation: value[0],
                        })
                      }
                      min={0}
                      max={360}
                      step={1}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Position</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs text-gray-500">X</Label>
                        <Input
                          type="number"
                          value={Math.round(selectedElementData.x)}
                          onChange={(e) =>
                            updateElement(selectedElementData.id, {
                              x: parseInt(e.target.value) || 0,
                            })
                          }
                          className="text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">Y</Label>
                        <Input
                          type="number"
                          value={Math.round(selectedElementData.y)}
                          onChange={(e) =>
                            updateElement(selectedElementData.id, {
                              y: parseInt(e.target.value) || 0,
                            })
                          }
                          className="text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Size</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs text-gray-500">Width</Label>
                        <Input
                          type="number"
                          value={Math.round(selectedElementData.width)}
                          onChange={(e) =>
                            updateElement(selectedElementData.id, {
                              width: parseInt(e.target.value) || 10,
                            })
                          }
                          className="text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">Height</Label>
                        <Input
                          type="number"
                          value={Math.round(selectedElementData.height)}
                          onChange={(e) =>
                            updateElement(selectedElementData.id, {
                              height: parseInt(e.target.value) || 10,
                            })
                          }
                          className="text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center text-sm text-gray-500 py-8">
                  <MousePointer2 className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  Select an element to edit its properties
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>

      {/* Save Template Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Save Template</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="template-name">Template Name</Label>
              <Input
                id="template-name"
                placeholder="My Certificate Template"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    saveTemplate();
                  }
                }}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Dynamic Fields</Label>
              <p className="text-xs text-gray-600">
                Use{" "}
                <code className="bg-gray-100 px-1 rounded">
                  {"{{fieldName}}"}
                </code>{" "}
                in text to create reusable templates. Example:{" "}
                <code className="bg-gray-100 px-1 rounded">
                  {"{{studentName}}"}
                </code>
                ,{" "}
                <code className="bg-gray-100 px-1 rounded">
                  {"{{courseName}}"}
                </code>
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowSaveDialog(false);
                  setTemplateName("");
                }}
              >
                Cancel
              </Button>
              <Button onClick={saveTemplate} disabled={isSaving}>
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}
