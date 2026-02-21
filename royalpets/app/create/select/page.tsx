"use client";

import { CostumeGrid } from "@/components/create/select/costume-grid";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { type Costume } from "@/lib/costumes";
import { useCreationStore } from "@/lib/store";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import Head from "next/head";

export default function SelectPage() {
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);
  
  const {
    selectedCostume,
    setSelectedCostume,
    setCurrentStep,
    uploadedImages,
    selectedImageId,
  } = useCreationStore();

  // Check if user has completed upload step
  useEffect(() => {
    if (uploadedImages.length === 0 || !selectedImageId) {
      setIsRedirecting(true);
      toast.error("Upload eerst foto's van je huisdier");
      router.replace("/create/upload");
    }
  }, [uploadedImages, selectedImageId, router]);

  const handleCostumeSelect = (costume: Costume) => {
    setSelectedCostume(costume);
  };

  const handleContinue = () => {
    if (!selectedCostume) {
      toast.error("Selecteer eerst een kostuum om door te gaan");
      return;
    }

    setCurrentStep("generate");
    router.push("/create/generate");
  };

  const handleBack = () => {
    setCurrentStep("upload");
    router.push("/create/upload");
  };

  if (isRedirecting) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <svg className="mx-auto h-8 w-8 animate-spin text-blue-600" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="mt-4 text-gray-600">Doorverwijzen...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Kies Kostuum - RoyalPets</title>
        <meta name="description" content="Kies een koninklijk kostuum voor je huisdierportret" />
      </Head>

      <div className="space-y-6">
        {/* Selected Costume Info */}
        {selectedCostume && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-2xl">
                👑
              </div>
              <div>
                <p className="font-medium text-blue-900">
                  Geselecteerd: {selectedCostume.name}
                </p>
                <p className="text-sm text-blue-700">
                  {selectedCostume.description}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Costume Grid */}
        <CostumeGrid
          selectedCostumeId={selectedCostume?.id}
          onCostumeSelect={handleCostumeSelect}
          showContinueButton={false}
        />

        {/* Navigation */}
        <div className="flex items-center justify-between pt-4">
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Terug
          </Button>
          <Button
            onClick={handleContinue}
            disabled={!selectedCostume}
            className="min-w-[140px]"
          >
            Volgende
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        {/* Help Text */}
        <div className="rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
          <h3 className="mb-2 font-medium text-gray-900">Hulp bij het kiezen?</h3>
          <ul className="space-y-1">
            <li>• Elk kostuum is zorgvuldig ontworpen voor een verbluffend koninklijk portret</li>
            <li>• Koninklijke kostuums met kronen, tiara&apos;s en elegante gewaden</li>
            <li>• Militaire kostuums met harnas en versierde uniformen</li>
            <li>• Renaissance kostuums met historische mode uit de 16e eeuw</li>
          </ul>
        </div>
      </div>
    </>
  );
}
