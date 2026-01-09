"use client";

import * as React from "react";
import { Upload, X, FileText, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/context/ToastContext";

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  status: "uploading" | "success" | "error";
  progress: number;
  error?: string;
}

interface FileUploadProps {
  onFilesChange: (files: UploadedFile[]) => void;
  accept?: string;
  maxSize?: number; // in bytes
  maxFiles?: number;
  multiple?: boolean;
  className?: string;
}

export function FileUpload({
  onFilesChange,
  accept = ".pdf,.txt,.doc,.docx,.md",
  maxSize = 10 * 1024 * 1024, // 10MB default
  maxFiles = 5,
  multiple = true,
  className = "",
}: FileUploadProps) {
  const [files, setFiles] = React.useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { push } = useToast();

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  const simulateUpload = (file: File): Promise<{ url: string }> => {
    return new Promise((resolve, reject) => {
      // Simulate upload delay
      const uploadTime = Math.random() * 2000 + 1000; // 1-3 seconds
      const shouldFail = Math.random() > 0.9; // 10% failure rate for demo

      setTimeout(() => {
        if (shouldFail) {
          reject(new Error("Upload failed. Please try again."));
        } else {
          resolve({
            url: `https://storage.example.com/knowledge-base/${Date.now()}-${file.name}`,
          });
        }
      }, uploadTime);
    });
  };

  const uploadFile = async (file: File) => {
    const fileId = `${Date.now()}-${file.name}`;
    const newFile: UploadedFile = {
      id: fileId,
      name: file.name,
      size: file.size,
      type: file.type,
      status: "uploading",
      progress: 0,
    };

    setFiles((prev) => {
      const updated = [...prev, newFile];
      onFilesChange(updated);
      return updated;
    });

    // Simulate progress
    const progressInterval = setInterval(() => {
      setFiles((prev) => {
        const updated = prev.map((f) => {
          if (f.id === fileId && f.progress < 90) {
            return { ...f, progress: f.progress + 10 };
          }
          return f;
        });
        onFilesChange(updated);
        return updated;
      });
    }, 200);

    try {
      const result = await simulateUpload(file);
      
      clearInterval(progressInterval);
      
      setFiles((prev) => {
        const updated = prev.map((f) =>
          f.id === fileId
            ? { ...f, status: "success" as const, progress: 100, url: result.url }
            : f
        );
        onFilesChange(updated);
        return updated;
      });

      push({
        message: `${file.name} uploaded successfully`,
        type: "success",
      });
    } catch (error: any) {
      clearInterval(progressInterval);
      
      setFiles((prev) => {
        const updated = prev.map((f) =>
          f.id === fileId
            ? {
                ...f,
                status: "error" as const,
                progress: 0,
                error: error.message,
              }
            : f
        );
        onFilesChange(updated);
        return updated;
      });

      push({
        message: `Failed to upload ${file.name}: ${error.message}`,
        type: "error",
      });
    }
  };

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList) return;

    const selectedFiles = Array.from(fileList);

    // Validate file count
    if (files.length + selectedFiles.length > maxFiles) {
      push({
        message: `You can only upload up to ${maxFiles} files`,
        type: "error",
      });
      return;
    }

    // Validate and upload each file
    selectedFiles.forEach((file) => {
      // Check file size
      if (file.size > maxSize) {
        push({
          message: `${file.name} is too large. Max size: ${formatFileSize(maxSize)}`,
          type: "error",
        });
        return;
      }

      uploadFile(file);
    });
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
    handleFiles(e.dataTransfer.files);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    // Reset input to allow re-uploading the same file
    e.target.value = "";
  };

  const removeFile = (fileId: string) => {
    setFiles((prev) => {
      const updated = prev.filter((f) => f.id !== fileId);
      onFilesChange(updated);
      return updated;
    });
  };

  const retryUpload = (fileId: string) => {
    const file = files.find((f) => f.id === fileId);
    if (file) {
      // Create a new File object from the stored data
      const blob = new Blob([], { type: file.type });
      const newFile = new File([blob], file.name, { type: file.type });
      removeFile(fileId);
      uploadFile(newFile);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Drop Zone */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging
            ? "border-primary bg-primary/5"
            : "border-gray-300 hover:border-primary hover:bg-gray-50"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileInputChange}
          className="hidden"
        />

        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Upload className="w-8 h-8 text-primary" />
          </div>
          <div>
            <p className="text-lg font-semibold text-gray-700 mb-1">
              Drop your files here
            </p>
            <p className="text-sm text-gray-500 mb-3">
              or click to browse from your computer
            </p>
            <p className="text-xs text-gray-400">
              Supported formats: {accept} • Max size: {formatFileSize(maxSize)} •
              Max files: {maxFiles}
            </p>
          </div>
          <Button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
          >
            <Upload className="w-4 h-4 mr-2" />
            Browse Files
          </Button>
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-sm">
              Uploaded Files ({files.length}/{maxFiles})
            </h4>
            {files.some((f) => f.status === "success") && (
              <Badge variant="outline" className="text-xs">
                {files.filter((f) => f.status === "success").length} successful
              </Badge>
            )}
          </div>

          <div className="space-y-2">
            {files.map((file) => (
              <div
                key={file.id}
                className="border rounded-lg p-3 bg-white hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="shrink-0 mt-1">
                    {file.status === "uploading" && (
                      <Loader2 className="w-5 h-5 text-primary animate-spin" />
                    )}
                    {file.status === "success" && (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    )}
                    {file.status === "error" && (
                      <AlertCircle className="w-5 h-5 text-red-600" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {file.name}
                      </p>
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        {formatFileSize(file.size)}
                      </span>
                    </div>

                    {file.status === "uploading" && (
                      <div className="space-y-1">
                        <Progress value={file.progress} className="h-1" />
                        <p className="text-xs text-gray-500">
                          Uploading... {file.progress}%
                        </p>
                      </div>
                    )}

                    {file.status === "success" && (
                      <p className="text-xs text-green-600">Upload complete</p>
                    )}

                    {file.status === "error" && (
                      <div className="space-y-2">
                        <p className="text-xs text-red-600">{file.error}</p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => retryUpload(file.id)}
                          className="h-6 text-xs"
                        >
                          Retry Upload
                        </Button>
                      </div>
                    )}
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 shrink-0"
                    onClick={() => removeFile(file.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}



