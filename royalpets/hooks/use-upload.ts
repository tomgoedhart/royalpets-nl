"use client";

import { useState, useCallback, useEffect, useRef } from "react";

export interface UploadFile {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  progress: number;
  status: "pending" | "uploading" | "success" | "error" | "cancelled";
  url?: string;
  key?: string;
  error?: string;
  previewUrl?: string;
}

export interface UploadSession {
  files: UploadFile[];
  sessionId: string;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = "royalpets-upload-session";

export interface UseUploadOptions {
  maxFileSize?: number; // in bytes
  acceptedTypes?: string[];
  maxFiles?: number;
  onUploadComplete?: (files: UploadFile[]) => void;
  onUploadError?: (error: Error) => void;
}

export interface UseUploadReturn {
  files: UploadFile[];
  isUploading: boolean;
  totalProgress: number;
  addFiles: (newFiles: File[]) => void;
  removeFile: (id: string) => void;
  uploadFiles: () => Promise<void>;
  clearFiles: () => void;
  retryFile: (id: string) => void;
  cancelUpload: (id: string) => void;
  validateFile: (file: File) => { valid: boolean; error?: string };
}

export function useUpload(options: UseUploadOptions = {}): UseUploadReturn {
  const {
    maxFileSize = 10 * 1024 * 1024, // 10MB default
    acceptedTypes = ["image/jpeg", "image/png", "image/webp", "image/heic"],
    maxFiles = 10,
    onUploadComplete,
    onUploadError,
  } = options;

  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const abortControllers = useRef<Map<string, AbortController>>(new Map());

  // Load session from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const session: UploadSession = JSON.parse(saved);
        // Restore files without the actual File objects (can't serialize those)
        // Just restore metadata so user knows what was there
        if (session.files.length > 0) {
          console.log("Restored upload session:", session.sessionId);
        }
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  // Save session to localStorage whenever files change
  useEffect(() => {
    if (files.length > 0) {
      const session: UploadSession = {
        files: files.map((f) => ({
          ...f,
          file: undefined as unknown as File, // Can't serialize File
        })),
        sessionId: generateSessionId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [files]);

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      files.forEach((file) => {
        if (file.previewUrl) {
          URL.revokeObjectURL(file.previewUrl);
        }
      });
    };
  }, []);

  const generateId = () =>
    `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const generateSessionId = () =>
    `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const validateFile = useCallback(
    (file: File): { valid: boolean; error?: string } => {
      // Check file type
      if (!acceptedTypes.includes(file.type)) {
        return {
          valid: false,
          error: `File type not supported. Accepted: ${acceptedTypes.join(", ")}`,
        };
      }

      // Check file size
      if (file.size > maxFileSize) {
        return {
          valid: false,
          error: `File too large. Maximum size: ${formatFileSize(maxFileSize)}`,
        };
      }

      return { valid: true };
    },
    [acceptedTypes, maxFileSize]
  );

  const addFiles = useCallback(
    (newFiles: File[]) => {
      setFiles((prev) => {
        const remainingSlots = maxFiles - prev.length;
        if (remainingSlots <= 0) {
          return prev;
        }

        const filesToAdd = newFiles.slice(0, remainingSlots);
        const newUploadFiles: UploadFile[] = [];

        filesToAdd.forEach((file) => {
          const validation = validateFile(file);
          const id = generateId();

          const uploadFile: UploadFile = {
            id,
            file,
            name: file.name,
            size: file.size,
            type: file.type,
            progress: 0,
            status: validation.valid ? "pending" : "error",
            error: validation.valid ? undefined : validation.error,
            previewUrl: file.type.startsWith("image/")
              ? URL.createObjectURL(file)
              : undefined,
          };

          newUploadFiles.push(uploadFile);
        });

        return [...prev, ...newUploadFiles];
      });
    },
    [maxFiles, validateFile]
  );

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => {
      const file = prev.find((f) => f.id === id);
      if (file?.previewUrl) {
        URL.revokeObjectURL(file.previewUrl);
      }
      return prev.filter((f) => f.id !== id);
    });
  }, []);

  const clearFiles = useCallback(() => {
    files.forEach((file) => {
      if (file.previewUrl) {
        URL.revokeObjectURL(file.previewUrl);
      }
    });
    setFiles([]);
    localStorage.removeItem(STORAGE_KEY);
  }, [files]);

  const uploadFiles = useCallback(async () => {
    const pendingFiles = files.filter((f) => f.status === "pending");
    if (pendingFiles.length === 0) return;

    setIsUploading(true);

    try {
      await Promise.all(
        pendingFiles.map(async (file) => {
          const controller = new AbortController();
          abortControllers.current.set(file.id, controller);

          try {
            // Update status to uploading
            setFiles((prev) =>
              prev.map((f) =>
                f.id === file.id ? { ...f, status: "uploading" } : f
              )
            );

            // Simulate progress updates
            const progressInterval = setInterval(() => {
              setFiles((prev) =>
                prev.map((f) =>
                  f.id === file.id
                    ? { ...f, progress: Math.min(f.progress + 10, 90) }
                    : f
                )
              );
            }, 200);

            // Create form data
            const formData = new FormData();
            formData.append("file", file.file);
            formData.append("filename", file.name);
            formData.append("contentType", file.type);

            // Upload to API
            const response = await fetch("/api/upload", {
              method: "POST",
              body: formData,
              signal: controller.signal,
            });

            clearInterval(progressInterval);

            if (!response.ok) {
              const error = await response.json();
              throw new Error(error.message || "Upload failed");
            }

            const result = await response.json();

            // Update file with success
            setFiles((prev) =>
              prev.map((f) =>
                f.id === file.id
                  ? {
                      ...f,
                      status: "success",
                      progress: 100,
                      url: result.url,
                      key: result.key,
                    }
                  : f
              )
            );
          } catch (error) {
            if (error instanceof Error && error.name === "AbortError") {
              setFiles((prev) =>
                prev.map((f) =>
                  f.id === file.id
                    ? { ...f, status: "cancelled", progress: 0 }
                    : f
                )
              );
            } else {
              setFiles((prev) =>
                prev.map((f) =>
                  f.id === file.id
                    ? {
                        ...f,
                        status: "error",
                        error:
                          error instanceof Error
                            ? error.message
                            : "Upload failed",
                      }
                    : f
                )
              );
            }
          } finally {
            abortControllers.current.delete(file.id);
          }
        })
      );

      const successfulFiles = files.filter((f) => f.status === "success");
      if (successfulFiles.length > 0) {
        onUploadComplete?.(successfulFiles);
      }
    } catch (error) {
      onUploadError?.(
        error instanceof Error ? error : new Error("Upload failed")
      );
    } finally {
      setIsUploading(false);
    }
  }, [files, onUploadComplete, onUploadError]);

  const retryFile = useCallback((id: string) => {
    setFiles((prev) =>
      prev.map((f) =>
        f.id === id
          ? { ...f, status: "pending", progress: 0, error: undefined }
          : f
      )
    );
  }, []);

  const cancelUpload = useCallback((id: string) => {
    const controller = abortControllers.current.get(id);
    if (controller) {
      controller.abort();
      abortControllers.current.delete(id);
    }
    setFiles((prev) =>
      prev.map((f) =>
        f.id === id ? { ...f, status: "cancelled", progress: 0 } : f
      )
    );
  }, []);

  // Calculate total progress
  const totalProgress =
    files.length > 0
      ? Math.round(files.reduce((acc, f) => acc + f.progress, 0) / files.length)
      : 0;

  return {
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
  };
}

// Utility function to format file size
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

// Utility function to validate image dimensions
export function validateImageDimensions(
  file: File,
  minWidth: number = 800,
  minHeight: number = 800
): Promise<{ valid: boolean; width?: number; height?: number; error?: string }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(img.src);
      if (img.width < minWidth || img.height < minHeight) {
        resolve({
          valid: false,
          width: img.width,
          height: img.height,
          error: `Image too small. Minimum: ${minWidth}x${minHeight}px`,
        });
      } else {
        resolve({
          valid: true,
          width: img.width,
          height: img.height,
        });
      }
    };
    img.onerror = () => {
      resolve({
        valid: false,
        error: "Could not load image for validation",
      });
    };
    img.src = URL.createObjectURL(file);
  });
}
