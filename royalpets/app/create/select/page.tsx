"use client";

import { CostumeGrid } from "@/components/create/select/costume-grid";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import Head from "next/head";
import { useRouter } from "next/navigation";
import { type Costume } from "@/lib/costumes";
import { useState } from "react";
import { toast } from "sonner";

export default function SelectPage() {
  const router = useRouter();
  const [selectedCostume, setSelectedCostume] = useState<Costume | null>(null);

  const handleCostumeSelect = (costume: Costume) => {
    setSelectedCostume(costume);
  };

  const handleContinue = () => {
    if (!selectedCostume) {
      toast.error("Please select a costume to continue");
      return;
    }
    // Navigate to next step (review/generate page)
    router.push("/create/review");
  };

  return (
    <>
      <Head>
        <title>Select Costume - RoyalPets</title>
        <meta
          name="description"
          content="Choose a royal costume for your pet portrait"
        />
      </Head>
      <div className="container mx-auto max-w-6xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/create/upload"
            className="mb-4 inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to upload
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            Choose Your Costume
          </h1>
          <p className="mt-2 text-gray-600">
            Step 2: Select a royal costume for your pet portrait
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((step, index) => (
              <div key={step} className="flex items-center">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full font-semibold ${
                    step === 2
                      ? "bg-blue-600 text-white"
                      : step < 2
                      ? "bg-green-500 text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {step < 2 ? (
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
                      step < 2 ? "bg-green-500" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-between text-sm text-gray-500">
            <span className="text-green-600 font-medium">Upload</span>
            <span className="text-blue-600 font-medium">Style</span>
            <span>Review</span>
            <span>Order</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <CostumeGrid
            onCostumeSelect={handleCostumeSelect}
            showContinueButton={false}
          />
        </div>

        {/* Navigation */}
        <div className="mt-8 flex items-center justify-between">
          <Link href="/create/upload">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <Button onClick={handleContinue} disabled={!selectedCostume}>
            Continue
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        {/* Help Text */}
        <div className="mt-8 rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
          <h3 className="mb-2 font-medium text-gray-900">Need help choosing?</h3>
          <ul className="space-y-1">
            <li>• Each costume is carefully designed to create a stunning royal portrait</li>
            <li>• Koninklijk costumes feature crowns, tiaras, and elegant robes</li>
            <li>• Militair costumes include armor and decorated uniforms</li>
            <li>• Renaissance costumes showcase historical fashion from the 16th century</li>
          </ul>
        </div>
      </div>
    </>
  );
}
