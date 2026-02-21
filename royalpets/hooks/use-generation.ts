"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export type GenerationStatus = "pending" | "generating" | "completed" | "failed";

export interface GenerationState {
  portraitId: string | null;
  status: GenerationStatus;
  progress: number;
  error: string | null;
  images: string[] | null;
}

export interface UseGenerationOptions {
  portraitId?: string;
  pollInterval?: number;
  onComplete?: (images: string[]) => void;
  onError?: (error: Error) => void;
}

export interface UseGenerationReturn {
  state: GenerationState;
  isLoading: boolean;
  isPolling: boolean;
  startGeneration: (imageUrl: string, costumeId: string, options?: { petType?: string; petName?: string }) => Promise<string>;
  checkStatus: (id: string) => Promise<void>;
  cancelGeneration: () => void;
  retryGeneration: () => Promise<void>;
}

const DEFAULT_POLL_INTERVAL = 2000; // 2 seconds

/**
 * Hook for managing portrait generation status with polling
 */
export function useGeneration(options: UseGenerationOptions = {}): UseGenerationReturn {
  const { portraitId: initialPortraitId, pollInterval = DEFAULT_POLL_INTERVAL, onComplete, onError } = options;

  const [state, setState] = useState<GenerationState>({
    portraitId: initialPortraitId || null,
    status: initialPortraitId ? "generating" : "pending",
    progress: 0,
    error: null,
    images: null,
  });

  const [isPolling, setIsPolling] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const pollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastImageUrlRef = useRef<string | null>(null);
  const lastCostumeIdRef = useRef<string | null>(null);
  const lastOptionsRef = useRef<{ petType?: string; petName?: string } | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollTimeoutRef.current) {
        clearTimeout(pollTimeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  /**
   * Start a new generation
   */
  const startGeneration = useCallback(async (
    imageUrl: string,
    costumeId: string,
    generationOptions: { petType?: string; petName?: string } = {}
  ): Promise<string> => {
    // Store for potential retry
    lastImageUrlRef.current = imageUrl;
    lastCostumeIdRef.current = costumeId;
    lastOptionsRef.current = generationOptions;

    // Reset state
    setState({
      portraitId: null,
      status: "generating",
      progress: 0,
      error: null,
      images: null,
    });

    // Cancel any existing requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl,
          costumeId,
          petType: generationOptions.petType,
          petName: generationOptions.petName,
        }),
        signal: abortControllerRef.current.signal,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Generatie mislukt");
      }

      setState(prev => ({
        ...prev,
        portraitId: data.portraitId,
        status: "generating",
      }));

      return data.portraitId;
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        throw error;
      }

      const err = error instanceof Error ? error : new Error("Generatie mislukt");
      setState(prev => ({
        ...prev,
        status: "failed",
        error: err.message,
      }));
      onError?.(err);
      throw err;
    }
  }, [onError]);

  /**
   * Check the status of a generation
   */
  const checkStatus = useCallback(async (id: string): Promise<void> => {
    try {
      const response = await fetch(`/api/generate/status?id=${id}`, {
        signal: abortControllerRef.current?.signal,
      });

      if (!response.ok) {
        throw new Error("Failed to check status");
      }

      const data = await response.json();

      setState(prev => ({
        ...prev,
        status: data.status,
        progress: data.progress || prev.progress,
        images: data.images || null,
        error: data.error || null,
      }));

      if (data.status === "completed" && data.images) {
        onComplete?.(data.images);
      } else if (data.status === "failed") {
        const error = new Error(data.error || "Generatie mislukt");
        onError?.(error);
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return;
      
      const err = error instanceof Error ? error : new Error("Status check failed");
      setState(prev => ({
        ...prev,
        status: "failed",
        error: err.message,
      }));
      onError?.(err);
    }
  }, [onComplete, onError]);

  /**
   * Poll for status updates
   */
  useEffect(() => {
    if (!state.portraitId || state.status === "completed" || state.status === "failed") {
      setIsPolling(false);
      return;
    }

    setIsPolling(true);

    const poll = async () => {
      try {
        await checkStatus(state.portraitId!);

        // Continue polling if still generating
        if (state.status === "generating" || state.status === "pending") {
          pollTimeoutRef.current = setTimeout(poll, pollInterval);
        }
      } catch {
        // Stop polling on error
        setIsPolling(false);
      }
    };

    // Start polling
    pollTimeoutRef.current = setTimeout(poll, pollInterval);

    return () => {
      if (pollTimeoutRef.current) {
        clearTimeout(pollTimeoutRef.current);
      }
    };
  }, [state.portraitId, state.status, pollInterval, checkStatus]);

  /**
   * Cancel the current generation
   */
  const cancelGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (pollTimeoutRef.current) {
      clearTimeout(pollTimeoutRef.current);
    }
    setIsPolling(false);
    setState(prev => ({
      ...prev,
      status: "failed",
      error: "Geannuleerd door gebruiker",
    }));
  }, []);

  /**
   * Retry the last generation
   */
  const retryGeneration = useCallback(async (): Promise<void> => {
    if (!lastImageUrlRef.current || !lastCostumeIdRef.current) {
      throw new Error("No previous generation to retry");
    }

    await startGeneration(
      lastImageUrlRef.current,
      lastCostumeIdRef.current,
      lastOptionsRef.current || undefined
    );
  }, [startGeneration]);

  const isLoading = state.status === "generating" || state.status === "pending";

  return {
    state,
    isLoading,
    isPolling,
    startGeneration,
    checkStatus,
    cancelGeneration,
    retryGeneration,
  };
}

export default useGeneration;
