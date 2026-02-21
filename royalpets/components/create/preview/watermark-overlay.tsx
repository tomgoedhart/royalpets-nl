"use client";

import { useState } from "react";
import { Crown } from "lucide-react";
import { cn } from "@/lib/utils";

interface WatermarkOverlayProps {
  className?: string;
  opacity?: number;
  text?: string;
  showLogo?: boolean;
}

export function WatermarkOverlay({
  className,
  opacity = 0.15,
  text = "RoyalPets.nl",
  showLogo = true,
}: WatermarkOverlayProps) {
  return (
    <div
      className={cn(
        "absolute inset-0 pointer-events-none overflow-hidden select-none",
        className
      )}
      data-testid="watermark-overlay"
    >
      {/* Diagonal repeating watermark pattern */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{
          background: `repeating-linear-gradient(
            -45deg,
            transparent,
            transparent 60px,
            rgba(255, 255, 255, ${opacity}) 60px,
            rgba(255, 255, 255, ${opacity}) 120px
          )`,
        }}
      />
      
      {/* Center watermark with logo */}
      <div 
        className="absolute inset-0 flex items-center justify-center"
        style={{ opacity: opacity * 4 }}
      >
        <div className="flex flex-col items-center gap-2 transform -rotate-12">
          {showLogo && (
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-white/80 shadow-sm">
              <Crown className="w-8 h-8 text-amber-500" />
            </div>
          )}
          <span className="text-lg font-bold text-white drop-shadow-md whitespace-nowrap">
            {text}
          </span>
          <span className="text-xs text-white/90 drop-shadow-sm">
            Voorbeeld
          </span>
        </div>
      </div>

      {/* Corner watermarks */}
      <div 
        className="absolute top-4 left-4 text-white/60 text-xs font-medium drop-shadow-sm transform -rotate-12"
        style={{ opacity: opacity * 3 }}
      >
        {text}
      </div>
      <div 
        className="absolute top-4 right-4 text-white/60 text-xs font-medium drop-shadow-sm transform rotate-12"
        style={{ opacity: opacity * 3 }}
      >
        {text}
      </div>
      <div 
        className="absolute bottom-4 left-4 text-white/60 text-xs font-medium drop-shadow-sm transform rotate-12"
        style={{ opacity: opacity * 3 }}
      >
        {text}
      </div>
      <div 
        className="absolute bottom-4 right-4 text-white/60 text-xs font-medium drop-shadow-sm transform -rotate-12"
        style={{ opacity: opacity * 3 }}
      >
        {text}
      </div>
    </div>
  );
}
