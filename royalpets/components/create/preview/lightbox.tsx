"use client";

import { useEffect, useCallback } from "react";
import { X, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WatermarkOverlay } from "./watermark-overlay";
import { cn } from "@/lib/utils";

interface LightboxProps {
  images: string[];
  currentIndex: number;
  isOpen: boolean;
  selectedIndex: number | null;
  onClose: () => void;
  onNavigate: (index: number) => void;
  onSelect: (index: number) => void;
}

export function Lightbox({
  images,
  currentIndex,
  isOpen,
  selectedIndex,
  onClose,
  onNavigate,
  onSelect,
}: LightboxProps) {
  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      switch (e.key) {
        case "Escape":
          onClose();
          break;
        case "ArrowLeft":
          if (currentIndex > 0) {
            onNavigate(currentIndex - 1);
          }
          break;
        case "ArrowRight":
          if (currentIndex < images.length - 1) {
            onNavigate(currentIndex + 1);
          }
          break;
      }
    },
    [isOpen, currentIndex, images.length, onClose, onNavigate]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const currentImage = images[currentIndex];
  const isSelected = selectedIndex === currentIndex;
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < images.length - 1;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm"
      data-testid="lightbox"
      role="dialog"
      aria-modal="true"
      aria-label="Afbeelding vergroting"
    >
      {/* Close button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 z-10 h-10 w-10 rounded-full bg-white/10 text-white hover:bg-white/20 hover:text-white"
        onClick={onClose}
        aria-label="Sluiten"
      >
        <X className="h-6 w-6" />
      </Button>

      {/* Image counter */}
      <div className="absolute top-4 left-4 z-10 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white">
        {currentIndex + 1} / {images.length}
      </div>

      {/* Navigation buttons */}
      {hasPrevious && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-4 top-1/2 z-10 h-12 w-12 -translate-y-1/2 rounded-full bg-white/10 text-white hover:bg-white/20 hover:text-white"
          onClick={() => onNavigate(currentIndex - 1)}
          aria-label="Vorige afbeelding"
        >
          <ChevronLeft className="h-8 w-8" />
        </Button>
      )}

      {hasNext && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-1/2 z-10 h-12 w-12 -translate-y-1/2 rounded-full bg-white/10 text-white hover:bg-white/20 hover:text-white"
          onClick={() => onNavigate(currentIndex + 1)}
          aria-label="Volgende afbeelding"
        >
          <ChevronRight className="h-8 w-8" />
        </Button>
      )}

      {/* Main image container */}
      <div className="relative mx-16 max-h-[80vh] max-w-4xl">
        <div className="relative overflow-hidden rounded-lg">
          <img
            src={currentImage}
            alt={`Portret variant ${currentIndex + 1}`}
            className="max-h-[80vh] max-w-full object-contain"
            data-testid="lightbox-image"
          />
          <WatermarkOverlay opacity={0.12} />
        </div>

        {/* Selection button */}
        <div className="absolute -bottom-16 left-1/2 -translate-x-1/2">
          <Button
            size="lg"
            onClick={() => onSelect(currentIndex)}
            className={cn(
              "gap-2",
              isSelected && "bg-green-600 hover:bg-green-700"
            )}
            aria-pressed={isSelected}
          >
            {isSelected ? (
              <>
                <Check className="h-5 w-5" />
                Geselecteerd
              </>
            ) : (
              <>
                <Check className="h-5 w-5" />
                Selecteer deze
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Thumbnail navigation */}
      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => onNavigate(index)}
            className={cn(
              "relative h-16 w-16 overflow-hidden rounded-lg border-2 transition-all",
              index === currentIndex
                ? "border-white"
                : "border-transparent hover:border-white/50",
              index === selectedIndex && "ring-2 ring-green-500 ring-offset-2 ring-offset-black"
            )}
            aria-label={`Ga naar afbeelding ${index + 1}`}
            aria-current={index === currentIndex ? "true" : undefined}
          >
            <img
              src={image}
              alt={`Thumbnail ${index + 1}`}
              className="h-full w-full object-cover"
            />
            {index === selectedIndex && (
              <div className="absolute inset-0 flex items-center justify-center bg-green-500/30">
                <Check className="h-6 w-6 text-white drop-shadow-md" />
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
