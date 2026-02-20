"use client";

import { cn } from "@/lib/utils";
import { categories, type CostumeCategory } from "@/lib/costumes";

interface CategoryTabsProps {
  selectedCategory: CostumeCategory | "All";
  onCategoryChange: (category: CostumeCategory | "All") => void;
}

export function CategoryTabs({ selectedCategory, onCategoryChange }: CategoryTabsProps) {
  const allCategories: (CostumeCategory | "All")[] = ["All", ...categories];

  return (
    <div className="flex flex-wrap gap-2">
      {allCategories.map((category) => (
        <button
          key={category}
          onClick={() => onCategoryChange(category)}
          className={cn(
            "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500",
            selectedCategory === category
              ? "bg-blue-600 text-white shadow-md"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          )}
          aria-pressed={selectedCategory === category}
        >
          {category}
        </button>
      ))}
    </div>
  );
}
