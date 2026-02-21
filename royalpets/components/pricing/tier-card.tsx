"use client";

import { Check, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { PricingTier } from "@/lib/pricing";

interface TierCardProps {
  tier: PricingTier;
  isSelected: boolean;
  onSelect: (tier: PricingTier) => void;
  disabled?: boolean;
}

export function TierCard({ tier, isSelected, onSelect, disabled }: TierCardProps) {
  return (
    <Card
      className={cn(
        "relative flex flex-col transition-all duration-200",
        isSelected
          ? "border-2 border-amber-500 ring-2 ring-amber-200"
          : "border border-gray-200 hover:border-amber-300",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      {/* Popular Badge */}
      {tier.isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 px-3 py-1 text-xs font-semibold text-white shadow-sm">
            <Sparkles className="h-3 w-3" />
            Meest gekozen
          </span>
        </div>
      )}

      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-bold text-gray-900">
          {tier.name}
        </CardTitle>
        <CardDescription className="text-sm text-gray-600">
          {tier.description}
        </CardDescription>
        <div className="mt-2">
          <span className="text-3xl font-bold text-amber-600">
            {tier.priceFormatted}
          </span>
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col">
        <ul className="flex-1 space-y-3">
          {tier.features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2">
              <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-500" />
              <span className="text-sm text-gray-700">{feature}</span>
            </li>
          ))}
        </ul>

        <Button
          onClick={() => onSelect(tier)}
          disabled={disabled}
          variant={isSelected ? "default" : "outline"}
          className={cn(
            "mt-6 w-full",
            isSelected
              ? "bg-amber-600 hover:bg-amber-700 text-white"
              : "border-amber-600 text-amber-600 hover:bg-amber-50"
          )}
          aria-pressed={isSelected}
          aria-label={`Selecteer ${tier.name} voor ${tier.priceFormatted}`}
        >
          {isSelected ? "Geselecteerd" : "Kies dit pakket"}
        </Button>
      </CardContent>
    </Card>
  );
}
