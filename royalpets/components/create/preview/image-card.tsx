"use client";

import { Check, ZoomIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WatermarkOverlay } from "./watermark-overlay";
import { cn } from "@/lib/utils";

interface ImageCardProps {
  imageUrl: string;
  index: number;
  isSelected: boolean;
  onSelect: (index: number) => void;
  onView: (index: number) => void;
}

export function ImageCard({
  imageUrl,
  index,
  isSelected,
  onSelect,
  onView,
}: ImageCardProps) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border-2 transition-all duration-200",
        isSelected
          ? "border-blue-500 shadow-lg shadow-blue-500/20"
          : "border-gray-200 hover:border-gray-300 hover:shadow-md"
      )}
      data-testid={`image-card-${index}`}
    >
      {/* Image container with aspect ratio */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <img
          src={imageUrl}
          alt={`Portret variant ${index + 1}`}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        
        {/* Watermark overlay */}
        <WatermarkOverlay />

        {/* Hover overlay with actions */}
        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onView(index)}
            className="gap-1.5"
          >
            <ZoomIn className="h-4 w-4" />
            Vergroot
          </Button>
        </div>

        {/* Selected indicator */}
        {isSelected && (
          <div className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-white shadow-md">
            <Check className="h-5 w-5" />
          </div>
        )}
      </div>

      {/* Card footer with select button */}
      <div className="border-t border-gray-100 bg-white p-3">
        <Button
          variant={isSelected ? "default" : "outline"}
          size="sm"
          onClick={() => onSelect(index)}
          className={cn(
            "w-full gap-2",
            isSelected && "bg-blue-600 hover:bg-blue-700"
          )}
          aria-pressed={isSelected}
        >
          {isSelected ? (
            <>
              <Check className="h-4 w-4" />
              Geselecteerd
            </>
          ) : (
            "Selecteer"
          )}
        </Button>
      </div>
    </div>
  );
}
