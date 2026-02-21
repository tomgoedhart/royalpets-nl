"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Head from "next/head";
import { ProgressAnimation } from "@/components/create/generate/progress-anim";
import { useGeneration } from "@/hooks/use-generation";
import { toast } from "sonner";

const GENERATION_CONFIG = {
  storageKeys: {
    selectedCostume: "royalpets-selected-costume",
    uploadedImage: "royalpets-uploaded-image",
    generationJob: "royalpets-generation-job",
  },
};

interface CostumeData {
  id: string;
  name: string;
}

interface UploadedImageData {
  url: string;
  key: string;
}

interface GenerationJob {
  portraitId: string;
  status: "pending" | "generating" | "completed" | "failed";
  startedAt: string;
}

export default function GeneratePage() {
  const router = useRouter();
  const [costume, setCostume] = useState<CostumeData | null>(null);
  const [uploadedImage, setUploadedImage] = useState<UploadedImageData | null>(null);
  const [hasStarted, setHasStarted] = useState(false);

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const savedCostume = localStorage.getItem(GENERATION_CONFIG.storageKeys.selectedCostume);
      const savedImage = localStorage.getItem(GENERATION_CONFIG.storageKeys.uploadedImage);
      const savedJob = localStorage.getItem(GENERATION_CONFIG.storageKeys.generationJob);

      if (savedCostume) {
        setCostume(JSON.parse(savedCostume));
      }

      if (savedImage) {
        setUploadedImage(JSON.parse(savedImage));
      }

      // Check for existing job
      if (savedJob) {
        const job: GenerationJob = JSON.parse(savedJob);
        // If job is recent (within last hour), use it
        const jobAge = Date.now() - new Date(job.startedAt).getTime();
        if (jobAge < 60 * 60 * 1000) {
          setHasStarted(true);
        } else {
          // Clear old job
          localStorage.removeItem(GENERATION_CONFIG.storageKeys.generationJob);
        }
      }
    } catch (error) {
      console.error("Failed to load generation data:", error);
    }
  }, []);

  // Redirect if missing required data
  useEffect(() => {
    if (!costume || !uploadedImage) {
      const timer = setTimeout(() => {
        if (!costume) {
          toast.error("Selecteer eerst een kostuum");
          router.push("/create/select");
        } else if (!uploadedImage) {
          toast.error("Upload eerst een foto");
          router.push("/create/upload");
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [costume, uploadedImage, router]);

  // Handle generation start
  const handleStartGeneration = useCallback(async () => {
    if (!costume || !uploadedImage) return;

    setHasStarted(true);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: uploadedImage.url,
          costumeId: costume.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Generatie mislukt");
      }

      // Save job to localStorage
      const job: GenerationJob = {
        portraitId: data.portraitId,
        status: "generating",
        startedAt: new Date().toISOString(),
      };
      localStorage.setItem(GENERATION_CONFIG.storageKeys.generationJob, JSON.stringify(job));

      return data.portraitId;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Generatie mislukt";
      toast.error(message);
      throw error;
    }
  }, [costume, uploadedImage]);

  // Handle generation complete
  const handleComplete = useCallback((portraitId: string) => {
    // Clear generation job from localStorage
    localStorage.removeItem(GENERATION_CONFIG.storageKeys.generationJob);
    // Redirect to preview page
    router.push(`/create/preview?id=${portraitId}`);
  }, [router]);

  // Handle generation error
  const handleError = useCallback((error: Error) => {
    toast.error(error.message || "Er is iets misgegaan");
  }, []);

  // Handle cancel
  const handleCancel = useCallback(() => {
    localStorage.removeItem(GENERATION_CONFIG.storageKeys.generationJob);
    localStorage.removeItem(GENERATION_CONFIG.storageKeys.selectedCostume);
    router.push("/create/select");
  }, [router]);

  if (!costume || !uploadedImage) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Genereren - RoyalPets</title>
        <meta name="description" content="Uw royal pet portrait wordt gegenereerd" />
      </Head>

      <div className="container mx-auto max-w-6xl px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Uw Portret Wordt Gemaakt
          </h1>
          <p className="mt-2 text-gray-600">
            Even geduld terwijl onze AI uw {costume.name.toLowerCase()} portret creëert
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-center">
            {[1, 2, 3, 4].map((step, index) => (
              <div key={step} className="flex items-center">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full font-semibold ${
                    step === 3
                      ? "bg-blue-600 text-white"
                      : step < 3
                      ? "bg-green-500 text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {step < 3 ? (
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
                      step < 3 ? "bg-green-500" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-center gap-8 sm:gap-16 md:gap-24 text-sm text-gray-500">
            <span className="text-green-600 font-medium">Upload</span>
            <span className="text-green-600 font-medium">Stijl</span>
            <span className="text-blue-600 font-medium">Genereren</span>
            <span>Preview</span>
          </div>
        </div>

        {/* Main Content - Progress Animation */}
        <div className="mx-auto max-w-2xl">
          <ProgressAnimation
            costumeName={costume.name}
            hasStarted={hasStarted}
            onStartGeneration={handleStartGeneration}
            onComplete={handleComplete}
            onError={handleError}
            onCancel={handleCancel}
          />
        </div>
      </div>
    </>
  );
}
