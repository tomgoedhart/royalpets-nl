"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Head from "next/head";
import { ProgressAnimation } from "@/components/create/generate/progress-anim";
import { useGeneration } from "@/hooks/use-generation";
import { toast } from "sonner";
import { useCreationStore } from "@/lib/store";

export default function GeneratePage() {
  const router = useRouter();
  const [hasStarted, setHasStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const {
    selectedCostume,
    uploadedImages,
    selectedImageId,
    portraitId,
    generationStatus,
    setPortraitId,
    setGenerationStatus,
    setGeneratedImages,
    setCurrentStep,
  } = useCreationStore();

  // Get the selected image URL
  const selectedImage = uploadedImages.find((img) => img.id === selectedImageId);

  // Check prerequisites and recover session
  useEffect(() => {
    // Check if user has completed previous steps
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

    // Check for existing generation
    if (portraitId && generationStatus) {
      if (generationStatus === "completed") {
        // Generation already done, redirect to preview
        router.replace("/create/preview");
        return;
      } else if (generationStatus === "generating" || generationStatus === "pending") {
        // Resume existing generation
        setHasStarted(true);
      }
    }

    setIsLoading(false);
  }, [uploadedImages, selectedImageId, selectedCostume, portraitId, generationStatus, router]);

  // Handle generation start
  const handleStartGeneration = useCallback(async () => {
    if (!selectedCostume || !selectedImage) {
      throw new Error("Ontbrekende gegevens voor generatie");
    }

    setHasStarted(true);
    setGenerationStatus("generating");

    try {
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
        throw new Error(data.message || "Generatie mislukt");
      }

      setPortraitId(data.portraitId);

      return data.portraitId;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Generatie mislukt";
      setGenerationStatus("failed");
      toast.error(message);
      throw error;
    }
  }, [selectedCostume, selectedImage, setPortraitId, setGenerationStatus]);

  // Handle generation complete
  const handleComplete = useCallback((images: string[]) => {
    setGenerationStatus("completed");
    setGeneratedImages(images);
    setCurrentStep("preview");
    // Redirect to preview page
    router.push("/create/preview");
  }, [setGenerationStatus, setGeneratedImages, setCurrentStep, router]);

  // Handle generation error
  const handleError = useCallback((error: Error) => {
    setGenerationStatus("failed");
    toast.error(error.message || "Er is iets misgegaan");
  }, [setGenerationStatus]);

  // Handle cancel
  const handleCancel = useCallback(() => {
    // Clear generation state but keep upload and costume selection
    setPortraitId(null);
    setGenerationStatus(null);
    setCurrentStep("select");
    router.push("/create/select");
  }, [setPortraitId, setGenerationStatus, setCurrentStep, router]);

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

  if (!selectedCostume || !selectedImage) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Genereren - RoyalPets</title>
        <meta name="description" content="Uw royal pet portrait wordt gegenereerd" />
      </Head>

      <div className="mx-auto max-w-2xl">
        {/* Info Banner */}
        <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-xl">
              👑
            </div>
            <div>
              <p className="font-medium text-blue-900">
                Kostuum: {selectedCostume.name}
              </p>
              <p className="text-sm text-blue-700">
                {selectedCostume.description}
              </p>
            </div>
          </div>
        </div>

        {/* Progress Animation */}
        <ProgressAnimation
          costumeName={selectedCostume.name}
          hasStarted={hasStarted}
          portraitId={portraitId}
          onStartGeneration={handleStartGeneration}
          onComplete={handleComplete}
          onError={handleError}
          onCancel={handleCancel}
        />

        {/* Generation Info */}
        <div className="mt-6 rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
          <h3 className="mb-2 font-medium text-gray-900">Wat gebeurt er nu?</h3>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-blue-500">1.</span>
              <span>Onze AI analyseert de foto van je huisdier</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500">2.</span>
              <span>Het geselecteerde kostuum wordt aangepast aan je huisdier</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500">3.</span>
              <span>We genereren 4 unieke variaties voor je om uit te kiezen</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500">4.</span>
              <span>Dit duurt meestal 30-60 seconden</span>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
}
