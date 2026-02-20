"use client";

import { cn } from "@/lib/utils";
import { type Costume } from "@/lib/costumes";
import { Crown, Gem, Sparkles, Shield, Anchor, Sword, Scroll, Flower2, Check } from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Crown,
  Gem,
  Sparkles,
  Shield,
  Anchor,
  Sword,
  Scroll,
  Flower2,
};

interface CostumeCardProps {
  costume: Costume;
  isSelected: boolean;
  onSelect: (costume: Costume) => void;
}

export function CostumeCard({ costume, isSelected, onSelect }: CostumeCardProps) {
  const IconComponent = iconMap[costume.icon] || Crown;

  return (
    <button
      onClick={() => onSelect(costume)}
      className={cn(
        "group relative w-full text-left rounded-xl border-2 p-5 transition-all duration-300",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500",
        "hover:shadow-lg hover:-translate-y-1",
        isSelected
          ? "border-blue-600 bg-blue-50/50 shadow-md"
          : "border-gray-200 bg-white hover:border-blue-300"
      )}
      aria-pressed={isSelected}
    >
      {/* Selection Indicator */}
      {isSelected && (
        <div className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white shadow-sm">
          <Check className="h-4 w-4" />
        </div>
      )}

      {/* Icon */}
      <div
        className={cn(
          "mb-4 flex h-14 w-14 items-center justify-center rounded-xl transition-colors duration-300",
          isSelected
            ? "bg-blue-600 text-white"
            : "bg-gray-100 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600"
        )}
      >
        <IconComponent className="h-7 w-7" />
      </div>

      {/* Category Badge */}
      <span
        className={cn(
          "inline-block rounded-full px-2.5 py-0.5 text-xs font-medium mb-2",
          isSelected
            ? "bg-blue-200 text-blue-800"
            : "bg-gray-100 text-gray-600"
        )}
      >
        {costume.category}
      </span>

      {/* Name */}
      <h3
        className={cn(
          "text-lg font-semibold mb-1 transition-colors duration-200",
          isSelected ? "text-blue-900" : "text-gray-900"
        )}
      >
        {costume.name}
      </h3>

      {/* Description */}
      <p className="text-sm text-gray-600 line-clamp-2">{costume.description}</p>
    </button>
  );
}
