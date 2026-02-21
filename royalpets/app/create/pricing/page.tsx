"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Head from "next/head";
import { ArrowRight, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { TierSelector } from "@/components/pricing/tier-selector";
import { useCreationStore } from "@/lib/store";
import { getTierById, type PricingTier } from "@/lib/pricing";

function PricingPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlPortraitId = searchParams.get("id");

  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const {
    selectedCostume,
    uploadedImages,
    selectedImageId,
    portraitId,
    selectedImageIndex,
    selectedTierId,
    setSelectedTierId,
    setCurrentStep,
  } = useCreationStore();

  // Check prerequisites
  useEffect(() => {
    const checkPrerequisites = () => {
      if (uploadedImages.length === 0 || !selectedImageId) {
        toast.error("Upload eerst foto's van je huisdier");
        router.replace("/create/upload");
        return;
      }

      if (!selectedCostume) {
        toast.error("Selecteer eerst een kostuum");
        router.replace("/create/select");
        return;
      }

      if (selectedImageIndex === null) {
        toast.error("Selecteer eerst een portret");
        router.replace("/create/preview");
        return;
      }

      setIsLoading(false);
    };

    checkPrerequisites();
  }, [uploadedImages, selectedImageId, selectedCostume, selectedImageIndex, router]);

  // Handle tier selection
  const handleSelectTier = (tier: PricingTier) => {
    setSelectedTierId(tier.id);
    toast.success(`${tier.name} geselecteerd`);
  };

  // Handle proceed to checkout
  const handleProceed = async () => {
    if (!selectedTierId) {
      toast.error("Selecteer eerst een pakket");
      return;
    }

    setIsProcessing(true);

    try {
      // Here we would typically create a checkout session
      // For now, we'll just show a success message
      const tier = getTierById(selectedTierId);
      toast.success(`Door naar afrekenen met ${tier?.name}`);
      
      // TODO: Redirect to Stripe checkout
      // router.push(`/api/checkout?portraitId=${portraitId || urlPortraitId}&tierId=${selectedTierId}`);
    } catch (error) {
      toast.error("Er ging iets mis. Probeer het opnieuw.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle go back
  const handleGoBack = () => {
    setCurrentStep("preview");
    router.push(`/create/preview?id=${portraitId || urlPortraitId}`);
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <svg className="mx-auto h-8 w-8 animate-spin text-blue-600" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="mt-4 text-gray-600">Laden...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Kies uw pakket - RoyalPets</title>
        <meta name="description" content="Kies het perfecte pakket voor uw royal pet portrait" />
      </Head>

      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Kies uw pakket
          </h1>
          <p className="mt-2 text-gray-600">
            Selecteer het pakket dat het beste bij uw wensen past
          </p>
        </div>

        {/* Selected Costume Info */}
        {selectedCostume && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-amber-700">Geselecteerd kostuum</p>
                <p className="font-medium text-amber-900">{selectedCostume.name}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-amber-700">Geselecteerd portret</p>
                <p className="font-medium text-amber-900">#{selectedImageIndex !== null ? selectedImageIndex + 1 : "-"}</p>
              </div>
            </div>
          </div>
        )}

        {/* Tier Selector */}
        <TierSelector
          selectedTierId={selectedTierId}
          onSelectTier={handleSelectTier}
          disabled={isProcessing}
        />

        {/* Action Buttons */}
        <div className="flex flex-col gap-4 pt-4 sm:flex-row sm:justify-between">
          <Button
            variant="outline"
            onClick={handleGoBack}
            disabled={isProcessing}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Terug naar Voorbeeld
          </Button>

          <Button
            onClick={handleProceed}
            disabled={!selectedTierId || isProcessing}
            className="gap-2"
          >
            {isProcessing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowRight className="h-4 w-4" />
            )}
            Doorgaan naar Afrekenen
          </Button>
        </div>

        {/* Selection hint */}
        {!selectedTierId && (
          <p className="text-center text-sm text-gray-500">
            Kies een pakket om verder te gaan
          </p>
        )}

        {/* Trust badges */}
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <div className="grid gap-4 text-center text-sm sm:grid-cols-3">
            <div>
              <p className="font-medium text-gray-900">Veilig betalen</p>
              <p className="text-gray-600">iDEAL & creditcard</p>
            </div>
            <div>
              <p className="font-medium text-gray-900">Snelle levering</p>
              <p className="text-gray-600">Digitale bestanden direct</p>
            </div>
            <div>
              <p className="font-medium text-gray-900">Tevredenheidsgarantie</p>
              <p className="text-gray-600">Niet goed, geld terug</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Loading fallback for Suspense
function PricingLoading() {
  return (
    <div className="flex h-64 items-center justify-center">
      <div className="text-center">
        <svg className="mx-auto h-8 w-8 animate-spin text-blue-600" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <p className="mt-4 text-gray-600">Laden...</p>
      </div>
    </div>
  );
}

// Export wrapped in Suspense
export default function PricingPage() {
  return (
    <Suspense fallback={<PricingLoading />}>
      <PricingPageContent />
    </Suspense>
  );
}
