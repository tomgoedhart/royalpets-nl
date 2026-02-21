"use client";

import { TierCard } from "./tier-card";
import { pricingTiers, type PricingTier } from "@/lib/pricing";

interface TierSelectorProps {
  selectedTierId: string | null;
  onSelectTier: (tier: PricingTier) => void;
  disabled?: boolean;
}

export function TierSelector({ selectedTierId, onSelectTier, disabled }: TierSelectorProps) {
  return (
    <div className="space-y-6">
      {/* Tier Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {pricingTiers.map((tier) => (
          <TierCard
            key={tier.id}
            tier={tier}
            isSelected={selectedTierId === tier.id}
            onSelect={onSelectTier}
            disabled={disabled}
          />
        ))}
      </div>

      {/* Comparison Summary */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <h4 className="mb-3 text-sm font-semibold text-gray-900">
          Wat krijgt u bij elk pakket?
        </h4>
        <div className="grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
          {pricingTiers.map((tier) => (
            <div
              key={tier.id}
              className={`rounded-md p-3 ${
                selectedTierId === tier.id
                  ? "bg-amber-100 border border-amber-300"
                  : "bg-white border border-gray-200"
              }`}
            >
              <p className="font-medium text-gray-900">{tier.name}</p>
              <ul className="mt-2 space-y-1 text-gray-600">
                <li className="flex items-center gap-1">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      tier.includesHighRes ? "bg-green-500" : "bg-gray-300"
                    }`}
                  />
                  High-res bestanden
                </li>
                <li className="flex items-center gap-1">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      tier.includesSourceFile ? "bg-green-500" : "bg-gray-300"
                    }`}
                  />
                  Bronbestanden
                </li>
                <li className="flex items-center gap-1">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      tier.includesPrint ? "bg-green-500" : "bg-gray-300"
                    }`}
                  />
                  Fysieke print
                </li>
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
