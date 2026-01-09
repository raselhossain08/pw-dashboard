"use client";

import * as React from "react";
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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Type,
  Barcode,
  Save,
  RotateCcw,
  Eye,
  Download,
  Settings2,
  EyeOff,
  FileText,
  CheckCircle,
} from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { certificatesService } from "@/services/certificates.service";
import JsBarcode from "jsbarcode";

// Cache for performance optimization
let cachedSvg: string | null = null;
let cachedFonts: { regular: string | null; bold: string | null } = {
  regular: null,
  bold: null,
};

// Add Google Font styles - Playfair Display (elegant serif font for certificates)
const fontStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&display=swap');
`;

interface Position {
  x: number;
  y: number;
}

interface TextStyle {
  fontSize: number;
  color: string;
  fontWeight: string;
}

interface BarcodeStyle {
  fontSize: number;
  color: string;
  width: number;
  height: number;
  displayWidth: number;
  displayHeight: number;
}

interface CertificateConfig {
  namePosition: Position;
  barcodePosition: Position;
  nameStyle: TextStyle;
  barcodeStyle: BarcodeStyle;
}

interface CertificateEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentName?: string;
  certificateId?: string;
}

export default function CertificateEditor({
  open,
  onOpenChange,
  studentName,
  certificateId,
}: CertificateEditorProps) {
  const { push } = useToast();
  const containerRef = React.useRef<HTMLDivElement>(null);
  const barcodeCanvasRef = React.useRef<HTMLCanvasElement>(null);
  const [dragging, setDragging] = React.useState<"name" | "barcode" | null>(
    null
  );
  const [previewMode, setPreviewMode] = React.useState(false);
  const [barcodeImage, setBarcodeImage] = React.useState<string>("");
  const [isSaving, setIsSaving] = React.useState(false);
  const [lastSavedAt, setLastSavedAt] = React.useState<Date | null>(null);

  // Position state (percentage-based for responsiveness)
  const [namePosition, setNamePosition] = React.useState<Position>({
    x: 50,
    y: 45,
  });
  const [barcodePosition, setBarcodePosition] = React.useState<Position>({
    x: 15,
    y: 75,
  });

  // Style state
  const [nameStyle, setNameStyle] = React.useState<TextStyle>({
    fontSize: 32,
    color: "#dc2626",
    fontWeight: "600",
  });

  const [barcodeStyle, setBarcodeStyle] = React.useState({
    fontSize: 14,
    color: "#000000",
    width: 2,
    height: 50,
    displayWidth: 200,
    displayHeight: 80,
  });

  // Preview values - use props or defaults
  const [previewName, setPreviewName] = React.useState(
    studentName || "Student Name"
  );
  const [previewBarcode, setPreviewBarcode] = React.useState(
    certificateId || "CERT-2024-001"
  );

  // Update preview values when props change
  React.useEffect(() => {
    if (studentName) setPreviewName(studentName);
    if (certificateId) setPreviewBarcode(certificateId);
  }, [studentName, certificateId]);

  // Handle mouse down on draggable elements
  const handleMouseDown = (
    e: React.MouseEvent,
    element: "name" | "barcode"
  ) => {
    e.preventDefault();
    setDragging(element);
  };

  // Handle mouse move for dragging
  const handleMouseMove = React.useCallback(
    (e: MouseEvent) => {
      if (!dragging || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      // Clamp values between 0 and 100
      const clampedX = Math.max(0, Math.min(100, x));
      const clampedY = Math.max(0, Math.min(100, y));

      if (dragging === "name") {
        setNamePosition({ x: clampedX, y: clampedY });
      } else if (dragging === "barcode") {
        setBarcodePosition({ x: clampedX, y: clampedY });
      }
    },
    [dragging]
  );

  // Handle mouse up to stop dragging
  const handleMouseUp = React.useCallback(() => {
    setDragging(null);
  }, []);

  // Add/remove mouse event listeners
  React.useEffect(() => {
    if (dragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [dragging, handleMouseMove, handleMouseUp]);

  // Load saved configuration on mount
  React.useEffect(() => {
    const loadConfig = async () => {
      try {
        const savedConfig =
          (await certificatesService.getCertificateTemplate()) as CertificateConfig;
        if (savedConfig) {
          setNamePosition(savedConfig.namePosition || { x: 50, y: 45 });
          setBarcodePosition(savedConfig.barcodePosition || { x: 15, y: 75 });
          setNameStyle(
            savedConfig.nameStyle || {
              fontSize: 32,
              color: "#dc2626",
              fontWeight: "600",
            }
          );
          setBarcodeStyle(
            savedConfig.barcodeStyle || {
              fontSize: 14,
              color: "#000000",
              width: 2,
              height: 50,
              displayWidth: 200,
              displayHeight: 80,
            }
          );
          setLastSavedAt(new Date());
        }
      } catch (error) {
      }
    };
    loadConfig();
  }, []);

  // Generate barcode whenever barcode value changes
  React.useEffect(() => {
    if (barcodeCanvasRef.current && previewBarcode) {
      try {
        JsBarcode(barcodeCanvasRef.current, previewBarcode, {
          format: "CODE128",
          width: barcodeStyle.width,
          height: barcodeStyle.height,
          displayValue: true,
          fontSize: barcodeStyle.fontSize,
          textMargin: 2,
          margin: 5,
        });
        // Convert canvas to image for display and PDF
        const imageData = barcodeCanvasRef.current.toDataURL("image/png");
        setBarcodeImage(imageData);
      } catch (error) {
        console.error("Error generating barcode:", error);
      }
    }
  }, [previewBarcode, barcodeStyle]);

  const handleReset = () => {
    setNamePosition({ x: 50, y: 45 });
    setBarcodePosition({ x: 15, y: 75 });
    setNameStyle({
      fontSize: 32,
      color: "#dc2626",
      fontWeight: "600",
    });
    setBarcodeStyle({
      fontSize: 14,
      color: "#000000",
      width: 2,
      height: 50,
      displayWidth: 200,
      displayHeight: 80,
    });
    push({ type: "success", message: "Positions reset to default" });
  };

  const handleSave = async () => {
    const config = {
      namePosition,
      barcodePosition,
      nameStyle,
      barcodeStyle,
    };

    setIsSaving(true);
    try {
      const response = await certificatesService.saveCertificateTemplate(
        config
      );
      setLastSavedAt(new Date());
      push({
        type: "success",
        message: "✓ Template saved to database successfully!",
      });
    } catch (error) {
      console.error("Failed to save to database:", error);
      // Fallback to localStorage
      localStorage.setItem("certificateConfig", JSON.stringify(config));
      push({
        type: "error",
        message: "Database unavailable - saved locally instead",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleExport = () => {
    const config = {
      namePosition,
      barcodePosition,
      nameStyle,
      barcodeStyle,
    };
    const blob = new Blob([JSON.stringify(config, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "certificate-template-config.json";
    a.click();
    URL.revokeObjectURL(url);
    push({ type: "success", message: "Configuration exported!" });
  };

  const handleExportPDF = async () => {
    try {
      push({ type: "loading", message: "Generating PDF..." });

      // Dynamic import
      const { jsPDF } = await import("jspdf");

      // Create PDF in landscape A4 format
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // Load SVG (use cache if available)
      if (!cachedSvg) {
        const svgResponse = await fetch("/certificate-template.svg");
        cachedSvg = await svgResponse.text();
      }
      const svgText = cachedSvg;

      // Create a temporary canvas to convert SVG to image
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      // Set canvas size to match A4 landscape (optimized for smaller file size)
      const scale = 1.5; // Balanced quality and file size
      canvas.width = pageWidth * scale * 3.78; // Convert mm to pixels (1mm = 3.78px at 96 DPI)
      canvas.height = pageHeight * scale * 3.78;

      // Create SVG blob and image
      const svgBlob = new Blob([svgText], {
        type: "image/svg+xml;charset=utf-8",
      });
      const svgUrl = URL.createObjectURL(svgBlob);

      const img = new Image();
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = svgUrl;
      });

      // Draw SVG to canvas
      ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(svgUrl);

      // Convert canvas to JPEG with compression for smaller file size
      const imgData = canvas.toDataURL("image/jpeg", 0.85);

      // Add image to PDF
      pdf.addImage(imgData, "JPEG", 0, 0, pageWidth, pageHeight);

      // Use built-in fonts for reliable text rendering
      // Google Fonts are used in the preview, but PDF uses built-in fonts
      pdf.setFont(
        "helvetica",
        nameStyle.fontWeight === "600" ? "bold" : "normal"
      );

      // Calculate text positions (convert percentage to mm)
      const nameX = (namePosition.x / 100) * pageWidth;
      const nameY = (namePosition.y / 100) * pageHeight;
      const barcodeX = (barcodePosition.x / 100) * pageWidth;
      const barcodeY = (barcodePosition.y / 100) * pageHeight;

      // Set font size and color for name
      pdf.setFontSize(nameStyle.fontSize * 0.75); // Convert px to pt
      pdf.setTextColor(nameStyle.color);

      // Add student name (centered on position)
      pdf.text(previewName, nameX, nameY, { align: "center" });

      // Add barcode image if available
      if (barcodeImage) {
        try {
          // Generate barcode on a temporary canvas for PDF
          const tempCanvas = document.createElement("canvas");
          JsBarcode(tempCanvas, previewBarcode, {
            format: "CODE128",
            width: barcodeStyle.width,
            height: barcodeStyle.height,
            displayValue: true,
            fontSize: barcodeStyle.fontSize,
            textMargin: 2,
            margin: 5,
          });

          const barcodeImgData = tempCanvas.toDataURL("image/png");

          // Calculate barcode dimensions in mm based on display size
          // Convert pixels to mm (approximate: 3.78 pixels per mm at 96 DPI)
          const barcodeWidth = barcodeStyle.displayWidth / 3.78;
          const barcodeHeight = barcodeStyle.displayHeight / 3.78;

          // Center barcode on position
          pdf.addImage(
            barcodeImgData,
            "PNG",
            barcodeX - barcodeWidth / 2,
            barcodeY - barcodeHeight / 2,
            barcodeWidth,
            barcodeHeight
          );
        } catch (barcodeError) {
          console.error("Barcode generation error:", barcodeError);
        }
      }

      // Save PDF
      pdf.save("certificate.pdf");
      push({ type: "success", message: "PDF exported successfully!" });
    } catch (error) {
      console.error("PDF export error:", error);
      push({ type: "error", message: "Failed to export PDF" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* Add custom font styles */}
      <style dangerouslySetInnerHTML={{ __html: fontStyles }} />

      <DialogContent className="w-[80vw] min-w-[80vw] max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Settings2 className="w-6 h-6 text-primary" />
            Certificate Template Editor
          </DialogTitle>
          <DialogDescription>
            Drag the elements to position them on your certificate template.
            Preview with sample data before saving.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Certificate Preview */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Certificate Preview</CardTitle>
                  <Button
                    variant={previewMode ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPreviewMode(!previewMode)}
                    className="transition-all"
                  >
                    {previewMode ? (
                      <>
                        <EyeOff className="w-4 h-4 mr-2" />
                        Exit Preview
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4 mr-2" />
                        Preview Mode
                      </>
                    )}
                  </Button>
                </div>
                <CardDescription>
                  {previewMode
                    ? "Live preview - this is how the certificate will appear to students"
                    : "Edit mode - drag the colored boxes to reposition elements"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  ref={containerRef}
                  className="relative w-full bg-white border-2 border-gray-300 rounded-lg overflow-hidden shadow-lg"
                  style={{
                    aspectRatio: "1.414/1", // A4 ratio
                    cursor: dragging ? "grabbing" : "default",
                  }}
                >
                  {/* Background Certificate Template SVG */}
                  <div
                    className="absolute inset-0  bg-center bg-no-repeat bg-contain"
                    style={{
                      backgroundImage: "url('/certificate-template.svg')",
                    }}
                  />

                  {/* Overlay for better visibility in edit mode */}
                  {!previewMode && (
                    <div className="absolute inset-0 bg-black/5 pointer-events-none" />
                  )}

                  {/* Student Name Element */}
                  <div
                    className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all ${
                      !previewMode
                        ? "border-2 border-red-500 bg-red-50/90 hover:bg-red-100/90 cursor-move shadow-md"
                        : "cursor-default"
                    } ${
                      dragging === "name" ? "shadow-2xl z-50 scale-105" : "z-10"
                    }`}
                    style={{
                      left: `${namePosition.x}%`,
                      top: `${namePosition.y}%`,
                      fontSize: `${nameStyle.fontSize}px`,
                      color: nameStyle.color,
                      fontWeight: nameStyle.fontWeight as any,
                      padding: previewMode ? "0" : "8px 16px",
                      borderRadius: previewMode ? "0" : "4px",
                    }}
                    onMouseDown={(e) =>
                      !previewMode && handleMouseDown(e, "name")
                    }
                  >
                    {!previewMode && (
                      <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-red-500 text-white px-2 py-1 rounded text-xs flex items-center gap-1 whitespace-nowrap">
                        <Type className="w-3 h-3" />
                        <span>Name</span>
                      </div>
                    )}
                    <div
                      className="whitespace-nowrap"
                      style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                      {previewName}
                    </div>
                  </div>

                  {/* Barcode Element */}
                  <div
                    className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all ${
                      !previewMode
                        ? "border-2 border-blue-500 bg-blue-50/90 hover:bg-blue-100/90 cursor-move shadow-md"
                        : "cursor-default"
                    } ${
                      dragging === "barcode"
                        ? "shadow-2xl z-50 scale-105"
                        : "z-10"
                    }`}
                    style={{
                      left: `${barcodePosition.x}%`,
                      top: `${barcodePosition.y}%`,
                      fontSize: `${barcodeStyle.fontSize}px`,
                      color: barcodeStyle.color,
                      padding: previewMode ? "0" : "8px 16px",
                      borderRadius: previewMode ? "0" : "4px",
                    }}
                    onMouseDown={(e) =>
                      !previewMode && handleMouseDown(e, "barcode")
                    }
                  >
                    {!previewMode && (
                      <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-blue-500 text-white px-2 py-1 rounded text-xs flex items-center gap-1 whitespace-nowrap">
                        <Barcode className="w-3 h-3" />
                        <span>Barcode</span>
                      </div>
                    )}
                    {barcodeImage ? (
                      <img
                        src={barcodeImage}
                        alt="Barcode"
                        style={{
                          width: `${barcodeStyle.displayWidth}px`,
                          height: `${barcodeStyle.displayHeight}px`,
                          objectFit: "contain",
                        }}
                      />
                    ) : (
                      <div className="whitespace-nowrap font-mono text-sm">
                        {previewBarcode}
                      </div>
                    )}
                  </div>
                </div>

                {/* Live Position Indicator */}
                <div className="mt-4 p-3 bg-gray-50 rounded-lg border">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded"></div>
                        <span className="font-medium">Name:</span>
                        <span className="text-muted-foreground">
                          X: {namePosition.x.toFixed(1)}% | Y:{" "}
                          {namePosition.y.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded"></div>
                        <span className="font-medium">Barcode:</span>
                        <span className="text-muted-foreground">
                          X: {barcodePosition.x.toFixed(1)}% | Y:{" "}
                          {barcodePosition.y.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    {dragging && (
                      <span className="text-primary font-medium animate-pulse">
                        Dragging...
                      </span>
                    )}
                  </div>
                </div>

                {/* Instructions */}
                {!previewMode && (
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-900">
                      <strong>💡 Tip:</strong> Click and drag the colored boxes
                      to position elements on your certificate. Use the controls
                      on the right to adjust styling.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Controls Panel */}
          <div className="space-y-4">
            {/* Preview Data */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Preview Data</CardTitle>
                <CardDescription>Test with sample values</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="preview-name">Student Name</Label>
                  <Input
                    id="preview-name"
                    value={previewName}
                    onChange={(e) => setPreviewName(e.target.value)}
                    placeholder="Enter name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="preview-barcode">Barcode</Label>
                  <Input
                    id="preview-barcode"
                    value={previewBarcode}
                    onChange={(e) => setPreviewBarcode(e.target.value)}
                    placeholder="Enter barcode"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Name Style */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Type className="w-4 h-4" />
                  Name Style
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name-size">
                    Font Size: {nameStyle.fontSize}px
                  </Label>
                  <Input
                    id="name-size"
                    type="range"
                    min="16"
                    max="72"
                    value={nameStyle.fontSize}
                    onChange={(e) =>
                      setNameStyle({
                        ...nameStyle,
                        fontSize: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name-color">Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="name-color"
                      type="color"
                      value={nameStyle.color}
                      onChange={(e) =>
                        setNameStyle({ ...nameStyle, color: e.target.value })
                      }
                      className="w-16 h-10"
                    />
                    <Input
                      type="text"
                      value={nameStyle.color}
                      onChange={(e) =>
                        setNameStyle({ ...nameStyle, color: e.target.value })
                      }
                      placeholder="#000000"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Position</Label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>X: {namePosition.x.toFixed(1)}%</div>
                    <div>Y: {namePosition.y.toFixed(1)}%</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Barcode Style */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Barcode className="w-4 h-4" />
                  Barcode Style
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="barcode-size">
                    Font Size: {barcodeStyle.fontSize}px
                  </Label>
                  <Input
                    id="barcode-size"
                    type="range"
                    min="10"
                    max="32"
                    value={barcodeStyle.fontSize}
                    onChange={(e) =>
                      setBarcodeStyle({
                        ...barcodeStyle,
                        fontSize: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="barcode-color">Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="barcode-color"
                      type="color"
                      value={barcodeStyle.color}
                      onChange={(e) =>
                        setBarcodeStyle({
                          ...barcodeStyle,
                          color: e.target.value,
                        })
                      }
                      className="w-16 h-10"
                    />
                    <Input
                      type="text"
                      value={barcodeStyle.color}
                      onChange={(e) =>
                        setBarcodeStyle({
                          ...barcodeStyle,
                          color: e.target.value,
                        })
                      }
                      placeholder="#000000"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="barcode-width">
                    Barcode Width: {barcodeStyle.width}
                  </Label>
                  <Input
                    id="barcode-width"
                    type="range"
                    min="1"
                    max="4"
                    step="0.5"
                    value={barcodeStyle.width}
                    onChange={(e) =>
                      setBarcodeStyle({
                        ...barcodeStyle,
                        width: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="barcode-height">
                    Barcode Height: {barcodeStyle.height}px
                  </Label>
                  <Input
                    id="barcode-height"
                    type="range"
                    min="30"
                    max="100"
                    value={barcodeStyle.height}
                    onChange={(e) =>
                      setBarcodeStyle({
                        ...barcodeStyle,
                        height: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Barcode Value</Label>
                  <Input
                    value={previewBarcode}
                    onChange={(e) => setPreviewBarcode(e.target.value)}
                    placeholder="CERT-2024-001"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="barcode-display-width">
                    Display Width: {barcodeStyle.displayWidth}px
                  </Label>
                  <Input
                    id="barcode-display-width"
                    type="range"
                    min="100"
                    max="400"
                    value={barcodeStyle.displayWidth}
                    onChange={(e) =>
                      setBarcodeStyle({
                        ...barcodeStyle,
                        displayWidth: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="barcode-display-height">
                    Display Height: {barcodeStyle.displayHeight}px
                  </Label>
                  <Input
                    id="barcode-display-height"
                    type="range"
                    min="40"
                    max="200"
                    value={barcodeStyle.displayHeight}
                    onChange={(e) =>
                      setBarcodeStyle({
                        ...barcodeStyle,
                        displayHeight: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Position</Label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>X: {barcodePosition.x.toFixed(1)}%</div>
                    <div>Y: {barcodePosition.y.toFixed(1)}%</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <div className="flex-1 flex items-center text-sm text-muted-foreground">
            {lastSavedAt && (
              <span className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-green-600" />
                Saved to database {new Date(lastSavedAt).toLocaleTimeString()}
              </span>
            )}
          </div>
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export Config
          </Button>
          <Button
            variant="default"
            onClick={handleExportPDF}
            className="bg-green-600 hover:bg-green-700"
          >
            <FileText className="w-4 h-4 mr-2" />
            Export as PDF
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? "Saving..." : "Save Template"}
          </Button>
        </DialogFooter>
      </DialogContent>
      {/* Hidden canvas for barcode generation */}
      <canvas ref={barcodeCanvasRef} style={{ display: "none" }} />
    </Dialog>
  );
}
