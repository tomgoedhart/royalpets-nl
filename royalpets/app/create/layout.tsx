"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Crown } from "lucide-react";
import {
  useCreationStore,
  getStepNumber,
  getStepName,
  type CreationStep,
} from "@/lib/store";

interface CreateLayoutProps {
  children: ReactNode;
}

// Map pathnames to steps
const pathToStep: Record<string, CreationStep> = {
  "/create/upload": "upload",
  "/create/select": "select",
  "/create/generate": "generate",
  "/create/preview": "preview",
  "/create/pricing": "pricing",
};

// Map steps to paths
const stepToPath: Record<CreationStep, string> = {
  upload: "/create/upload",
  select: "/create/select",
  generate: "/create/generate",
  preview: "/create/preview",
  pricing: "/create/pricing",
};

const steps: CreationStep[] = ["upload", "select", "preview", "pricing"];

export default function CreateLayout({ children }: CreateLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isHydrated, setIsHydrated] = useState(false);
  
  const {
    currentStep,
    setCurrentStep,
    canNavigateToStep,
    uploadedImages,
    selectedImageId,
    selectedCostume,
    generationStatus,
    generatedImages,
    selectedImageIndex,
  } = useCreationStore();

  // Handle hydration
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Sync URL with store state
  useEffect(() => {
    if (!isHydrated) return;
    
    const pathStep = pathToStep[pathname];
    if (pathStep && pathStep !== currentStep) {
      // Check if we can navigate to this step
      if (canNavigateToStep(pathStep)) {
        setCurrentStep(pathStep);
      } else {
        // Redirect to the furthest accessible step
        const accessibleStep = findAccessibleStep();
        if (accessibleStep && accessibleStep !== pathStep) {
          router.replace(stepToPath[accessibleStep]);
        }
      }
    }
  }, [pathname, currentStep, isHydrated, canNavigateToStep, setCurrentStep, router]);

  // Find the furthest step the user can access
  const findAccessibleStep = (): CreationStep => {
    for (let i = steps.length - 1; i >= 0; i--) {
      if (canNavigateToStep(steps[i])) {
        return steps[i];
      }
    }
    return "upload";
  };

  const currentStepNumber = getStepNumber(currentStep);
  const currentStepIndex = steps.indexOf(currentStep);

  // Determine step status for progress bar
  const getStepStatus = (step: CreationStep): "completed" | "current" | "upcoming" => {
    const stepNum = getStepNumber(step);
    const currentNum = getStepNumber(currentStep);
    
    if (stepNum < currentNum) return "completed";
    if (stepNum === currentNum) return "current";
    return "upcoming";
  };

  // Check if a step is clickable
  const isStepClickable = (step: CreationStep): boolean => {
    return canNavigateToStep(step);
  };

  // Handle step click
  const handleStepClick = (step: CreationStep) => {
    if (isStepClickable(step)) {
      router.push(stepToPath[step]);
    }
  };

  // Get step completion data for tooltips
  const getStepCompletionInfo = (step: CreationStep) => {
    switch (step) {
      case "upload":
        return uploadedImages.length > 0 && selectedImageId
          ? `${uploadedImages.length} foto("s) geüpload`
          : "Nog geen foto's geüpload";
      case "select":
        return selectedCostume
          ? `Kostuum: ${selectedCostume.name}`
          : "Geen kostuum geselecteerd";
      case "preview":
        if (generationStatus === "completed" && generatedImages) {
          return selectedImageIndex !== null
            ? "Afbeelding geselecteerd"
            : `${generatedImages.length} voorbeelden beschikbaar`;
        }
        return generationStatus === "generating"
          ? "Bezig met genereren..."
          : "Nog niet gegenereerd";
      case "pricing":
        return selectedImageIndex !== null
          ? "Klaar om te bestellen"
          : "Selecteer eerst een afbeelding";
      default:
        return "";
    }
  };

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto max-w-6xl px-4 py-8">
          <div className="animate-pulse">
            <div className="mb-8 h-8 w-48 rounded bg-gray-200" />
            <div className="mb-8 h-20 rounded bg-gray-200" />
            <div className="h-96 rounded bg-gray-200" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto max-w-6xl px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2 text-gray-600 transition-colors hover:text-gray-900"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="hidden sm:inline">Terug naar home</span>
            </Link>
            <div className="flex items-center gap-2">
              <Crown className="h-6 w-6 text-amber-500" />
              <span className="font-semibold text-gray-900">RoyalPets</span>
            </div>
            <div className="w-24" /> {/* Spacer for alignment */}
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-6xl px-4 py-8">
        {/* Title Section */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Creëer Je Koninklijke Portret
          </h1>
          <p className="mt-2 text-gray-600">
            Stap {Math.min(currentStepNumber, 4)} van 4: {getStepName(currentStep)}
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="relative">
            {/* Progress Bar Background */}
            <div className="absolute left-0 top-1/2 h-1 w-full -translate-y-1/2 rounded-full bg-gray-200" />
            
            {/* Active Progress Bar */}
            <div
              className="absolute left-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-blue-600 transition-all duration-500"
              style={{
                width: `${
                  currentStepIndex >= 0
                    ? (currentStepIndex / (steps.length - 1)) * 100
                    : 0
                }%`,
              }}
            />

            {/* Step Indicators */}
            <div className="relative flex justify-between">
              {steps.map((step, index) => {
                const status = getStepStatus(step);
                const clickable = isStepClickable(step);
                const stepNum = index + 1;

                return (
                  <div
                    key={step}
                    className="flex flex-col items-center"
                    title={getStepCompletionInfo(step)}
                  >
                    <button
                      onClick={() => handleStepClick(step)}
                      disabled={!clickable}
                      className={`
                        flex h-10 w-10 items-center justify-center rounded-full border-2 font-semibold transition-all duration-300
                        ${
                          status === "completed"
                            ? "border-blue-600 bg-blue-600 text-white"
                            : status === "current"
                            ? "border-blue-600 bg-white text-blue-600 ring-4 ring-blue-100"
                            : clickable
                            ? "border-gray-300 bg-white text-gray-500 hover:border-blue-400 hover:text-blue-500"
                            : "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
                        }
                      `}
                      aria-current={status === "current" ? "step" : undefined}
                      aria-label={`Stap ${stepNum}: ${getStepName(step)}`}
                    >
                      {status === "completed" ? (
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
                        stepNum
                      )}
                    </button>
                    <span
                      className={`
                        mt-2 text-sm font-medium transition-colors
                        ${
                          status === "current"
                            ? "text-blue-600"
                            : status === "completed"
                            ? "text-gray-700"
                            : "text-gray-400"
                        }
                      `}
                    >
                      {getStepName(step)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          {children}
        </div>

        {/* Session Recovery Notice */}
        {uploadedImages.length > 0 && (
          <div className="mt-6 rounded-lg bg-blue-50 p-4 text-sm text-blue-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Sessie hersteld</p>
                <p className="text-blue-600">
                  Je voortgang is automatisch opgeslagen. Je kunt deze pagina verlaten en later terugkomen.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  useCreationStore.getState().resetSession();
                  router.push("/create/upload");
                }}
                className="shrink-0"
              >
                Nieuwe sessie starten
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
