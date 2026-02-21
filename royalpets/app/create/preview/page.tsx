"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Head from "next/head";
import { RefreshCw, ArrowRight, Loader2, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { GalleryGrid } from "@/components/create/preview/gallery-grid";
import type { Database } from "@/types/supabase";

type Portrait = Database["public"]["Tables"]["portraits"]["Row"];

const STORAGE_KEYS = {
  selectedCostume: "royalpets-selected-costume",
  uploadedImage: "royalpets-uploaded-image",
};

interface CostumeData {
  id: string;
  name: string;
}

function PreviewPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const portraitId = searchParams.get("id");

  const [portrait, setPortrait] = useState<Portrait | null>(null);
  const [costume, setCostume] = useState<CostumeData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Load costume from localStorage
  useEffect(() => {
    try {
      const savedCostume = localStorage.getItem(STORAGE_KEYS.selectedCostume);
      if (savedCostume) {
        setCostume(JSON.parse(savedCostume));
      }
    } catch (error) {
      console.error("Failed to load costume:", error);
    }
  }, []);

  // Fetch portrait data
  const fetchPortrait = useCallback(async () => {
    if (!portraitId) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/portraits/${portraitId}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch portrait");
      }

      const data = await response.json();
      setPortrait(data.portrait);
      
      // Restore selected index from portrait data
      if (data.portrait.selected_image_index !== null) {
        setSelectedIndex(data.portrait.selected_image_index);
      }
    } catch (error) {
      toast.error("Kon portretgegevens niet laden");
      console.error("Failed to fetch portrait:", error);
    } finally {
      setIsLoading(false);
    }
  }, [portraitId]);

  useEffect(() => {
    fetchPortrait();
  }, [fetchPortrait]);

  // Extract image URLs from portrait data
  const images: string[] = portrait?.generated_images 
    ? (portrait.generated_images as { url: string }[]).map(img => img.url)
    : [];

  // Handle image selection
  const handleSelectImage = useCallback(async (index: number) => {
    setSelectedIndex(index);
    
    // Save selection to database
    if (portraitId) {
      setIsSaving(true);
      try {
        const response = await fetch(`/api/portraits/${portraitId}/select`, {
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
  }, [portraitId]);

  // Handle regeneration
  const handleRegenerate = useCallback(async () => {
    if (!portrait || isRegenerating) return;

    setIsRegenerating(true);
    
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: portrait.original_image_url,
          costumeId: portrait.costume_id,
          petType: portrait.pet_type || undefined,
          petName: portrait.pet_name || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Regeneratie mislukt");
      }

      toast.success("Nieuwe portretten worden gegenereerd!");
      
      // Redirect to generate page to track progress
      router.push(`/create/generate?id=${data.portraitId}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Regeneratie mislukt";
      toast.error(message);
      setIsRegenerating(false);
    }
  }, [portrait, isRegenerating, router]);

  // Handle proceed to pricing
  const handleProceed = useCallback(() => {
    if (selectedIndex === null) {
      toast.error("Selecteer eerst een portret");
      return;
    }

    router.push(`/create/pricing?id=${portraitId}`);
  }, [selectedIndex, portraitId, router]);

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

  // Redirect if no portrait ID
  useEffect(() => {
    if (!isLoading && !portraitId) {
      toast.error("Geen portret ID gevonden");
      router.push("/create/upload");
    }
  }, [isLoading, portraitId, router]);

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      </div>
    );
  }

  if (!portrait || images.length === 0) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-col items-center justify-center py-20">
          <Crown className="mb-4 h-12 w-12 text-gray-300" />
          <h2 className="mb-2 text-xl font-semibold text-gray-900">
            Geen portretten gevonden
          </h2>
          <p className="mb-6 text-gray-600">
            Er zijn nog geen portretten gegenereerd
          </p>
          <Button onClick={() => router.push("/create/select")}>
            Begin opnieuw
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Preview - RoyalPets</title>
        <meta name="description" content="Bekijk en selecteer uw royal pet portrait" />
      </Head>

      <div className="container mx-auto max-w-6xl px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Uw {costume?.name || "Koninklijke"} Portretten
          </h1>
          <p className="mt-2 text-gray-600">
            Kies uw favoriete portret uit de 4 varianten hieronder
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-center">
            {[1, 2, 3, 4].map((step, index) => (
              <div key={step} className="flex items-center">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full font-semibold ${
                    step === 4
                      ? "bg-blue-600 text-white"
                      : step < 4
                      ? "bg-green-500 text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {step < 4 ? (
                    <svg
                      className="h-5 w-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    step
                  )}
                </div>
                {index < 3 && (
                  <div
                    className={`h-1 w-16 sm:w-24 md:w-32 ${
                      step < 4 ? "bg-green-500" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-center gap-8 sm:gap-16 md:gap-24 text-sm text-gray-500">
            <span className="text-green-600 font-medium">Upload</span>
            <span className="text-green-600 font-medium">Stijl</span>
            <span className="text-green-600 font-medium">Genereren</span>
            <span className="text-blue-600 font-medium">Preview</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="mx-auto max-w-4xl">
          {/* Gallery Grid */}
          <GalleryGrid
            images={images}
            selectedIndex={selectedIndex}
            lightboxOpen={lightboxOpen}
            lightboxIndex={lightboxIndex}
            onSelectImage={handleSelectImage}
            onOpenLightbox={handleOpenLightbox}
            onCloseLightbox={handleCloseLightbox}
            onNavigateLightbox={handleNavigateLightbox}
          />

          {/* Info Banner */}
          <div className="mt-6 rounded-lg bg-amber-50 border border-amber-200 p-4">
            <div className="flex items-start gap-3">
              <Crown className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
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
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-between">
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
              disabled={selectedIndex === null || isSaving}
              size="lg"
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
          {selectedIndex === null && (
            <p className="mt-4 text-center text-sm text-gray-500">
              Selecteer een portret om verder te gaan
            </p>
          )}
        </div>
      </div>
    </>
  );
}

// Loading fallback for Suspense
function PreviewLoading() {
  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
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
