"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Crown, Sparkles, RefreshCw, XCircle, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

// Dutch status messages for the generation process
const STATUS_MESSAGES = [
  { text: "Foto analyseren...", duration: 3000 },
  { text: "Kostuum aanpassen...", duration: 4000 },
  { text: "Koninklijke details toevoegen...", duration: 5000 },
  { text: "Portret schilderen...", duration: 6000 },
  { text: "Laatste finishing touches...", duration: 4000 },
];

// Calculate total expected duration (in ms)
const TOTAL_DURATION = STATUS_MESSAGES.reduce((acc, msg) => acc + msg.duration, 0);

interface ProgressAnimationProps {
  costumeName: string;
  hasStarted: boolean;
  onStartGeneration: () => Promise<string>;
  onComplete: (portraitId: string) => void;
  onError: (error: Error) => void;
  onCancel: () => void;
}

type GenerationState = "idle" | "generating" | "completed" | "error";

export function ProgressAnimation({
  costumeName,
  hasStarted,
  onStartGeneration,
  onComplete,
  onError,
  onCancel,
}: ProgressAnimationProps) {
  const [state, setState] = useState<GenerationState>(hasStarted ? "generating" : "idle");
  const [progress, setProgress] = useState(0);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [portraitId, setPortraitId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const startTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Progress animation
  useEffect(() => {
    if (state !== "generating") return;

    startTimeRef.current = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTimeRef.current;
      
      // Calculate progress based on expected duration (cap at 95% until confirmed complete)
      const calculatedProgress = Math.min((elapsed / TOTAL_DURATION) * 100, 95);
      setProgress(calculatedProgress);

      // Update message index based on elapsed time
      let timeAccumulator = 0;
      let messageIndex = 0;
      for (let i = 0; i < STATUS_MESSAGES.length; i++) {
        timeAccumulator += STATUS_MESSAGES[i].duration;
        if (elapsed < timeAccumulator) {
          messageIndex = i;
          break;
        }
        messageIndex = i + 1;
      }
      setCurrentMessageIndex(Math.min(messageIndex, STATUS_MESSAGES.length - 1));

      if (state === "generating" && calculatedProgress < 95) {
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [state]);

  // Poll for completion when we have a portraitId
  useEffect(() => {
    if (!portraitId || state !== "generating") return;

    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/generate/status?id=${portraitId}`, {
          signal: abortControllerRef.current?.signal,
        });

        if (!response.ok) {
          throw new Error("Failed to check status");
        }

        const data = await response.json();

        if (data.status === "completed") {
          setProgress(100);
          setState("completed");
          clearInterval(pollInterval);
          // Small delay to show 100% completion
          setTimeout(() => onComplete(portraitId), 500);
        } else if (data.status === "failed") {
          throw new Error(data.error || "Generatie mislukt");
        }
        // If still generating, continue polling
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") return;
        
        setState("error");
        setErrorMessage(error instanceof Error ? error.message : "Generatie mislukt");
        clearInterval(pollInterval);
        onError(error instanceof Error ? error : new Error("Generatie mislukt"));
      }
    }, 2000); // Poll every 2 seconds

    return () => clearInterval(pollInterval);
  }, [portraitId, state, onComplete, onError]);

  // Start generation
  const startGeneration = useCallback(async () => {
    setState("generating");
    setProgress(0);
    setCurrentMessageIndex(0);
    setErrorMessage(null);
    
    abortControllerRef.current = new AbortController();

    try {
      const id = await onStartGeneration();
      setPortraitId(id);
    } catch (error) {
      setState("error");
      setErrorMessage(error instanceof Error ? error.message : "Generatie mislukt");
      onError(error instanceof Error ? error : new Error("Generatie mislukt"));
    }
  }, [onStartGeneration, onError]);

  // Auto-start if hasStarted is true (restored from localStorage)
  useEffect(() => {
    if (hasStarted && state === "idle") {
      startGeneration();
    }
  }, [hasStarted, state, startGeneration]);

  // Retry generation
  const handleRetry = useCallback(async () => {
    setIsRetrying(true);
    setState("generating");
    setProgress(0);
    setCurrentMessageIndex(0);
    setErrorMessage(null);

    try {
      const id = await onStartGeneration();
      setPortraitId(id);
    } catch (error) {
      setState("error");
      setErrorMessage(error instanceof Error ? error.message : "Generatie mislukt");
      onError(error instanceof Error ? error : new Error("Generatie mislukt"));
    } finally {
      setIsRetrying(false);
    }
  }, [onStartGeneration, onError]);

  // Cancel generation
  const handleCancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    onCancel();
  }, [onCancel]);

  // Get current status message
  const currentMessage = STATUS_MESSAGES[currentMessageIndex]?.text || STATUS_MESSAGES[0].text;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
      {/* Crown Animation */}
      <div className="mb-8 flex justify-center">
        <div className="relative">
          {/* Animated rings */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-24 w-24 animate-ping rounded-full bg-amber-100 opacity-20" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div 
              className="h-20 w-20 animate-pulse rounded-full bg-amber-50 opacity-40"
              style={{ animationDuration: "2s" }}
            />
          </div>
          
          {/* Crown icon */}
          <div 
            className={`relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600 shadow-lg ${
              state === "generating" ? "animate-bounce" : ""
            }`}
            style={{ animationDuration: "1.5s" }}
          >
            <Crown className="h-8 w-8 text-white" />
          </div>

          {/* Sparkles */}
          {state === "generating" && (
            <>
              <Sparkles 
                className="absolute -right-2 -top-2 h-5 w-5 text-amber-400 animate-pulse" 
                style={{ animationDelay: "0.2s" }}
              />
              <Sparkles 
                className="absolute -left-2 top-0 h-4 w-4 text-amber-300 animate-pulse" 
                style={{ animationDelay: "0.5s" }}
              />
            </>
          )}
        </div>
      </div>

      {/* Title and Status */}
      <div className="mb-6 text-center">
        <h2 className="text-xl font-semibold text-gray-900">
          {state === "idle" && "Klaar om te starten"}
          {state === "generating" && `${costumeName} portret maken`}
          {state === "completed" && "Portret klaar!"}
          {state === "error" && "Er ging iets mis"}
        </h2>
        
        {state === "generating" && (
          <p className="mt-2 text-gray-600 transition-all duration-500">
            {currentMessage}
          </p>
        )}
        
        {state === "error" && errorMessage && (
          <p className="mt-2 text-red-600">{errorMessage}</p>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <Progress value={progress} className="h-3" />
        <div className="mt-2 flex justify-between text-sm text-gray-500">
          <span>{Math.round(progress)}%</span>
          <span>
            {state === "generating" && "Bezig..."}
            {state === "completed" && "Voltooid!"}
            {state === "error" && "Mislukt"}
            {state === "idle" && "Wachten..."}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        {state === "idle" && (
          <Button onClick={startGeneration} size="lg" className="w-full sm:w-auto">
            <Sparkles className="mr-2 h-4 w-4" />
            Start Generatie
          </Button>
        )}

        {state === "generating" && (
          <Button 
            variant="outline" 
            onClick={handleCancel}
            disabled={isRetrying}
            className="w-full sm:w-auto"
          >
            <XCircle className="mr-2 h-4 w-4" />
            Annuleren
          </Button>
        )}

        {state === "error" && (
          <>
            <Button 
              onClick={handleRetry} 
              disabled={isRetrying}
              className="w-full sm:w-auto"
            >
              {isRetrying ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              Opnieuw proberen
            </Button>
            <Button 
              variant="outline" 
              onClick={handleCancel}
              disabled={isRetrying}
              className="w-full sm:w-auto"
            >
              Terug
            </Button>
          </>
        )}

        {state === "completed" && (
          <Button disabled className="w-full sm:w-auto">
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Voltooid
          </Button>
        )}
      </div>

      {/* Info Text */}
      <div className="mt-6 text-center text-sm text-gray-500">
        {state === "generating" && (
          <p>Dit duurt ongeveer 20-30 seconden. Sluit dit venster niet.</p>
        )}
        {state === "idle" && (
          <p>Klik op start om uw {costumeName.toLowerCase()} portret te genereren.</p>
        )}
        {state === "error" && (
          <p>Controleer uw internetverbinding en probeer het opnieuw.</p>
        )}
      </div>
    </div>
  );
}
