"use client";

import { useState, useEffect, useCallback } from "react";
import { costumes, type Costume, type CostumeCategory } from "@/lib/costumes";
import { CategoryTabs } from "./category-tabs";
import { CostumeCard } from "./costume-card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2 } from "lucide-react";

interface CostumeGridProps {
  selectedCostumeId?: string | null;
  onCostumeSelect?: (costume: Costume) => void;
  onContinue?: () => void;
  showContinueButton?: boolean;
}

export function CostumeGrid({
  selectedCostumeId,
  onCostumeSelect,
  onContinue,
  showContinueButton = true,
}: CostumeGridProps) {
  const [selectedCategory, setSelectedCategory] = useState<CostumeCategory | "All">("All");
  const [selectedCostume, setSelectedCostume] = useState<Costume | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize from prop if provided
  useEffect(() => {
    if (selectedCostumeId) {
      const costume = costumes.find((c) => c.id === selectedCostumeId);
      if (costume) {
        setSelectedCostume(costume);
      }
    }
    setIsLoading(false);
  }, [selectedCostumeId]);

  // Sync with external prop changes
  useEffect(() => {
    if (selectedCostumeId !== undefined) {
      const costume = costumes.find((c) => c.id === selectedCostumeId);
      setSelectedCostume(costume || null);
    }
  }, [selectedCostumeId]);

  const handleCostumeSelect = useCallback(
    (costume: Costume) => {
      setSelectedCostume(costume);
      onCostumeSelect?.(costume);
    },
    [onCostumeSelect]
  );

  const filteredCostumes =
    selectedCategory === "All"
      ? costumes
      : costumes.filter((costume) => costume.category === selectedCategory);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Category Filter */}
      <CategoryTabs
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />

      {/* Costume Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredCostumes.map((costume) => (
          <CostumeCard
            key={costume.id}
            costume={costume}
            isSelected={selectedCostume?.id === costume.id}
            onSelect={handleCostumeSelect}
          />
        ))}
      </div>

      {/* Continue Button */}
      {showContinueButton && (
        <div className="flex justify-end pt-4 border-t">
          <Button
            onClick={onContinue}
            disabled={!selectedCostume}
            className="min-w-[140px]"
          >
            Continue
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Selected Costume Info */}
      {selectedCostume && (
        <div className="rounded-lg bg-blue-50 p-4 text-sm">
          <p className="font-medium text-blue-900">
            Selected: {selectedCostume.name}
          </p>
          <p className="text-blue-700 mt-1">{selectedCostume.description}</p>
        </div>
      )}
    </div>
  );
}
