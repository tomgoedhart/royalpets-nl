"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Head from "next/head";
import { RefreshCw, ArrowRight, Loader2, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { GalleryGrid } from "@/components/create/preview/gallery-grid";
import { useCreationStore } from "@/lib/store";

function PreviewPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlPortraitId = searchParams.get("id");

  const [isLoading, setIsLoading] = useState(true);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const {
    selectedCostume,
    uploadedImages,
    selectedImageId,
    portraitId,
    generatedImages,
    selectedImageIndex,
    setPortraitId,
    setGeneratedImages,
    setSelectedImageIndex,
    setGenerationStatus,
    setCurrentStep,
  } = useCreationStore();

  // Get the selected image
  const selectedImage = uploadedImages.find((img) => img.id === selectedImageId);

  // Fetch portrait data if needed
  useEffect(() => {
    const loadPortrait = async () => {
      // Check prerequisites
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

      // If we have a portraitId from URL or store, fetch the data
      const effectivePortraitId = urlPortraitId || portraitId;
      
      if (effectivePortraitId) {
        try {
          const response = await fetch(`/api/portraits/${effectivePortraitId}`);
          
          if (!response.ok) {
            throw new Error("Failed to fetch portrait");
          }

          const data = await response.json();
          
          // Update store with portrait data
          setPortraitId(effectivePortraitId);
          if (data.portrait.generated_images) {
            const images = (data.portrait.generated_images as { url: string }[]).map((img) => img.url);
            setGeneratedImages(images);
          }
          if (data.portrait.selected_image_index !== null && data.portrait.selected_image_index !== undefined) {
            setSelectedImageIndex(data.portrait.selected_image_index);
          }
        } catch (error) {
          console.error("Failed to fetch portrait:", error);
          // If we already have images in store, use those
          if (!generatedImages || generatedImages.length === 0) {
            toast.error("Kon portretgegevens niet laden");
          }
        }
      } else if (!generatedImages || generatedImages.length === 0) {
        // No portrait data and no stored images
        toast.error("Genereer eerst een portret");
        router.replace("/create/generate");
        return;
      }

      setIsLoading(false);
    };

    loadPortrait();
  }, [uploadedImages, selectedImageId, selectedCostume, urlPortraitId, portraitId, generatedImages, router, setPortraitId, setGeneratedImages, setSelectedImageIndex]);

  // Get images to display
  const images = generatedImages || [];

  // Handle image selection
  const handleSelectImage = useCallback(async (index: number) => {
    setSelectedImageIndex(index);
    
    // Save selection to database
    const effectivePortraitId = urlPortraitId || portraitId;
    if (effectivePortraitId) {
      setIsSaving(true);
      try {
        const response = await fetch(`/api/portraits/${effectivePortraitId}/select`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ selectedImageIndex: index }),
        });

        if (!response.ok) {
          throw new Error("Failed to save selection");
        }

        toast.success("Selectie opgeslagen");
      } catch (error) {
        toast.error("Kon selectie niet opslaan");
        console.error("Failed to save selection:", error);
      } finally {
        setIsSaving(false);
      }
    }
  }, [urlPortraitId, portraitId, setSelectedImageIndex]);

  // Handle regeneration
  const handleRegenerate = useCallback(async () => {
    if (!selectedCostume || !selectedImage || isRegenerating) return;

    setIsRegenerating(true);
    
    try {
      // Clear current generation state
      setPortraitId(null);
      setGeneratedImages(null);
      setSelectedImageIndex(null);
      setGenerationStatus(null);

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: selectedImage.url,
          costumeId: selectedCostume.id,
          petType: useCreationStore.getState().petType || undefined,
          petName: useCreationStore.getState().petName || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Regeneratie mislukt");
      }

      toast.success("Nieuwe portretten worden gegenereerd!");
      
      // Redirect to generate page to track progress
      setCurrentStep("generate");
      router.push("/create/generate");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Regeneratie mislukt";
      toast.error(message);
      setIsRegenerating(false);
    }
  }, [selectedCostume, selectedImage, isRegenerating, setPortraitId, setGeneratedImages, setSelectedImageIndex, setGenerationStatus, setCurrentStep, router]);

  // Handle proceed to pricing
  const handleProceed = useCallback(() => {
    if (selectedImageIndex === null) {
      toast.error("Selecteer eerst een portret");
      return;
    }

    setCurrentStep("pricing");
    router.push(`/create/pricing?id=${portraitId || urlPortraitId}`);
  }, [selectedImageIndex, portraitId, urlPortraitId, setCurrentStep, router]);

  // Lightbox handlers
  const handleOpenLightbox = useCallback((index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  }, []);

  const handleCloseLightbox = useCallback(() => {
    setLightboxOpen(false);
  }, []);

  const handleNavigateLightbox = useCallback((index: number) => {
    setLightboxIndex(index);
  }, []);

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

  if (images.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Crown className="mb-4 h-12 w-12 text-gray-300" />
        <h2 className="mb-2 text-xl font-semibold text-gray-900">
          Geen portretten gevonden
        </h2>
        <p className="mb-6 text-gray-600">
          Er zijn nog geen portretten gegenereerd
        </p>
        <Button onClick={() => router.push("/create/generate")}>
          Genereer portretten
        </Button>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Voorbeeld - RoyalPets</title>
        <meta name="description" content="Bekijk en selecteer uw royal pet portrait" />
      </Head>

      <div className="space-y-6">
        {/* Costume Info */}
        {selectedCostume && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-center gap-3">
              <Crown className="h-6 w-6 text-amber-600" />
              <div>
                <p className="font-medium text-amber-900">
                  Kostuum: {selectedCostume.name}
                </p>
                <p className="text-sm text-amber-700">
                  {selectedCostume.description}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Gallery Grid */}
        <GalleryGrid
          images={images}
          selectedIndex={selectedImageIndex}
          lightboxOpen={lightboxOpen}
          lightboxIndex={lightboxIndex}
          onSelectImage={handleSelectImage}
          onOpenLightbox={handleOpenLightbox}
          onCloseLightbox={handleCloseLightbox}
          onNavigateLightbox={handleNavigateLightbox}
        />

        {/* Info Banner */}
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-amber-600 text-xs font-bold text-white">
              i
            </div>
            <div className="text-sm text-amber-800">
              <p className="font-medium">Gratis voorbeelden met watermerk</p>
              <p className="mt-1">
                Deze voorbeelden bevatten een watermerk. Na aankoop ontvangt u de 
                hoge resolutie versies zonder watermerk. Niet tevreden? Genereer 
                onbeperkt nieuwe varianten!
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-4 pt-4 sm:flex-row sm:justify-between">
          <Button
            variant="outline"
            onClick={handleRegenerate}
            disabled={isRegenerating}
            className="gap-2"
          >
            {isRegenerating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Genereer 4 Nieuwe
          </Button>

          <Button
            onClick={handleProceed}
            disabled={selectedImageIndex === null || isSaving}
            className="gap-2"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowRight className="h-4 w-4" />
            )}
            Doorgaan naar Prijzen
          </Button>
        </div>

        {/* Selection hint */}
        {selectedImageIndex === null && (
          <p className="text-center text-sm text-gray-500">
            Klik op een portret om het te selecteren
          </p>
        )}
      </div>
    </>
  );
}

// Loading fallback for Suspense
function PreviewLoading() {
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
export default function PreviewPage() {
  return (
    <Suspense fallback={<PreviewLoading />}>
      <PreviewPageContent />
    </Suspense>
  );
}
