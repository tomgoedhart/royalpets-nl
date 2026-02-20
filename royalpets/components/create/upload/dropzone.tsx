"use client";

import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import {
  Upload,
  X,
  FileImage,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Camera,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useUpload, formatFileSize, UploadFile } from "@/hooks/use-upload";
import { PhotoGuide } from "./photo-guide";

interface DropzoneProps {
  maxFileSize?: number; // in bytes
  maxFiles?: number;
  acceptedTypes?: string[];
  onUploadComplete?: (files: UploadFile[]) => void;
  onUploadError?: (error: Error) => void;
  showPhotoGuide?: boolean;
  folder?: string;
}

const DEFAULT_ACCEPTED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
];

export function Dropzone({
  maxFileSize = 10 * 1024 * 1024, // 10MB
  maxFiles = 10,
  acceptedTypes = DEFAULT_ACCEPTED_TYPES,
  onUploadComplete,
  onUploadError,
  showPhotoGuide = true,
}: DropzoneProps) {
  const [showGuide, setShowGuide] = useState(false);
  const {
    files,
    isUploading,
    totalProgress,
    addFiles,
    removeFile,
    uploadFiles,
    clearFiles,
    retryFile,
    cancelUpload,
    validateFile,
  } = useUpload({
    maxFileSize,
    maxFiles,
    acceptedTypes,
    onUploadComplete,
    onUploadError,
  });

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      addFiles(acceptedFiles);
    },
    [addFiles]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject, fileRejections } =
    useDropzone({
      onDrop,
      accept: acceptedTypes.reduce((acc, type) => {
        acc[type] = [];
        return acc;
      }, {} as Record<string, string[]>),
      maxSize: maxFileSize,
      maxFiles: maxFiles - files.length,
      disabled: isUploading || files.length >= maxFiles,
    });

  const getStatusIcon = (status: UploadFile["status"]) => {
    switch (status) {
      case "uploading":
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case "success":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "cancelled":
        return <X className="h-4 w-4 text-gray-400" />;
      default:
        return <FileImage className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: UploadFile["status"]) => {
    switch (status) {
      case "uploading":
        return "border-blue-200 bg-blue-50/50";
      case "success":
        return "border-green-200 bg-green-50/50";
      case "error":
        return "border-red-200 bg-red-50/50";
      case "cancelled":
        return "border-gray-200 bg-gray-50";
      default:
        return "border-gray-200 bg-white";
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Photo Guide Button */}
      {showPhotoGuide && (
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Upload Pet Photos
            </h3>
            <p className="text-sm text-gray-500">
              Drag and drop or click to select files
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowGuide(true)}
            className="flex items-center gap-2"
          >
            <Camera className="h-4 w-4" />
            Photo Tips
          </Button>
        </div>
      )}

      {/* Dropzone Area */}
      <div
        {...getRootProps()}
        className={cn(
          "relative rounded-lg border-2 border-dashed p-8 transition-all duration-200",
          "cursor-pointer hover:border-gray-400 hover:bg-gray-50/50",
          isDragActive && "border-blue-400 bg-blue-50",
          isDragReject && "border-red-400 bg-red-50",
          (isUploading || files.length >= maxFiles) &&
            "cursor-not-allowed opacity-50",
          "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        )}
      >
        <input {...getInputProps()} />

        <div className="flex flex-col items-center justify-center gap-3 text-center">
          <div
            className={cn(
              "rounded-full p-4 transition-colors",
              isDragActive ? "bg-blue-100" : "bg-gray-100"
            )}
          >
            <Upload
              className={cn(
                "h-8 w-8",
                isDragActive ? "text-blue-600" : "text-gray-400"
              )}
            />
          </div>

          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-900">
              {isDragActive
                ? "Drop files here..."
                : files.length >= maxFiles
                ? `Maximum ${maxFiles} files reached`
                : "Drag & drop files here, or click to select"}
            </p>
            <p className="text-xs text-gray-500">
              Accepted: JPEG, PNG, WebP, HEIC up to {formatFileSize(maxFileSize)}
            </p>
          </div>
        </div>
      </div>

      {/* File Rejections */}
      {fileRejections.length > 0 && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3">
          <div className="flex items-center gap-2 text-sm text-red-600">
            <AlertCircle className="h-4 w-4" />
            <span className="font-medium">
              {fileRejections.length} file(s) rejected
            </span>
          </div>
          <ul className="mt-2 space-y-1 text-xs text-red-500">
            {fileRejections.map(({ file, errors }, index) => (
              <li key={index}>
                {file.name}: {errors.map((e) => e.message).join(", ")}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              {files.length} file{files.length !== 1 ? "s" : ""} selected
            </span>
            {!isUploading && (
              <Button variant="ghost" size="sm" onClick={clearFiles}>
                Clear all
              </Button>
            )}
          </div>

          <div className="max-h-80 space-y-2 overflow-y-auto rounded-lg border border-gray-200 p-2">
            {files.map((file) => (
              <div
                key={file.id}
                className={cn(
                  "flex items-center gap-3 rounded-lg border p-3 transition-colors",
                  getStatusColor(file.status)
                )}
              >
                {/* Preview */}
                {file.previewUrl ? (
                  <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-md">
                    <img
                      src={file.previewUrl}
                      alt={file.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-md bg-gray-100">
                    <FileImage className="h-6 w-6 text-gray-400" />
                  </div>
                )}

                {/* File Info */}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(file.size)}
                  </p>

                  {/* Progress Bar */}
                  {file.status === "uploading" && (
                    <div className="mt-1">
                      <Progress value={file.progress} className="h-1" />
                    </div>
                  )}

                  {/* Error Message */}
                  {file.status === "error" && file.error && (
                    <p className="mt-1 text-xs text-red-500">{file.error}</p>
                  )}
                </div>

                {/* Status & Actions */}
                <div className="flex items-center gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center">
                          {getStatusIcon(file.status)}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="capitalize">{file.status}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  {/* Action Buttons */}
                  {file.status === "uploading" ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => cancelUpload(file.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  ) : file.status === "error" ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => retryFile(file.id)}
                    >
                      Retry
                    </Button>
                  ) : file.status !== "success" ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => removeFile(file.id)}
                      disabled={isUploading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>

          {/* Upload Button */}
          {files.some((f) => f.status === "pending" || f.status === "error") && (
            <Button
              onClick={uploadFiles}
              disabled={isUploading || !files.some((f) => f.status === "pending")}
              className="w-full"
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading... {totalProgress}%
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload{" "}
                  {files.filter((f) => f.status === "pending").length} file
                  {files.filter((f) => f.status === "pending").length !== 1
                    ? "s"
                    : ""}
                </>
              )}
            </Button>
          )}

          {/* Success Message */}
          {files.every((f) => f.status === "success") && files.length > 0 && (
            <div className="flex items-center justify-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-600">
              <CheckCircle2 className="h-4 w-4" />
              All files uploaded successfully!
            </div>
          )}
        </div>
      )}

      {/* Photo Guide Modal */}
      <PhotoGuide open={showGuide} onClose={() => setShowGuide(false)} />
    </div>
  );
}
