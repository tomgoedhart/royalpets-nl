"use client";

import { Dropzone } from "@/components/create/upload/dropzone";
import { UploadFile } from "@/hooks/use-upload";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import Head from "next/head";

export default function UploadPage() {
  const handleUploadComplete = (files: UploadFile[]) => {
    console.log("Upload complete:", files);
    // TODO: Navigate to next step with uploaded files
  };

  const handleUploadError = (error: Error) => {
    console.error("Upload error:", error);
  };

  return (
    <>
      <Head>
        <title>Upload Photos - RoyalPets</title>
        <meta name="description" content="Upload your pet photos to create a royal portrait" />
      </Head>
    <div className="container mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/"
          className="mb-4 inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to home
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">
          Create Your Royal Portrait
        </h1>
        <p className="mt-2 text-gray-600">
          Step 1: Upload photos of your pet for the best results
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {[1, 2, 3, 4].map((step, index) => (
            <div key={step} className="flex items-center">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full font-semibold ${
                  step === 1
                    ? "bg-blue-600 text-white"
                    : step < 1
                    ? "bg-green-500 text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {step < 1 ? (
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
                    step < 1 ? "bg-green-500" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="mt-2 flex justify-between text-sm text-gray-500">
          <span className="text-blue-600 font-medium">Upload</span>
          <span>Style</span>
          <span>Review</span>
          <span>Order</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <Dropzone
          maxFileSize={10 * 1024 * 1024} // 10MB
          maxFiles={10}
          onUploadComplete={handleUploadComplete}
          onUploadError={handleUploadError}
          showPhotoGuide={true}
        />
      </div>

      {/* Navigation */}
      <div className="mt-8 flex items-center justify-between">
        <Link href="/">
          <Button variant="outline">Cancel</Button>
        </Link>
        <Button disabled>
          Continue
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      {/* Help Text */}
      <div className="mt-8 rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
        <h3 className="mb-2 font-medium text-gray-900">Need help?</h3>
        <ul className="space-y-1">
          <li>
            • Photos are stored securely and only used to create your portrait
          </li>
          <li>
            • Upload at least 3-5 photos from different angles for best results
          </li>
          <li>• Supported formats: JPEG, PNG, WebP, HEIC</li>
          <li>• Maximum file size: 10MB per photo</li>
        </ul>
      </div>
    </div>
    </>
  );
}
