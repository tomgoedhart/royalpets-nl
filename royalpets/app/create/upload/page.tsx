"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { Dropzone } from "@/components/create/upload/dropzone";
import { UploadFile } from "@/hooks/use-upload";
import { Button } from "@/components/ui/button";
import { ArrowRight, ImageIcon } from "lucide-react";
import { useCreationStore } from "@/lib/store";
import { toast } from "sonner";
import Head from "next/head";

export default function UploadPage() {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  
  const {
    uploadedImages,
    selectedImageId,
    setUploadedImages,
    addUploadedImage,
    setSelectedImageId,
    setPetType,
    setPetName,
    setCurrentStep,
  } = useCreationStore();

  const handleUploadComplete = useCallback((files: UploadFile[]) => {
    // Convert UploadFile to UploadedImage and add to store
    const newImages = files
      .filter((file) => file.key && file.url) // Only include successfully uploaded files
      .map((file) => ({
        id: file.key!,
        url: file.url!,
        fileName: file.file.name,
        fileSize: file.file.size,
        uploadedAt: new Date().toISOString(),
      }));

    // Add to existing images
    const currentImages = useCreationStore.getState().uploadedImages;
    const updatedImages = [...currentImages, ...newImages];
    setUploadedImages(updatedImages);

    // Select the first image if none selected
    if (!useCreationStore.getState().selectedImageId && newImages.length > 0) {
      setSelectedImageId(newImages[0].id);
    }

    setIsUploading(false);
    toast.success(`${newImages.length} foto("s) succesvol geüpload`);
  }, [setUploadedImages, setSelectedImageId]);

  const handleUploadError = useCallback((error: Error) => {
    setIsUploading(false);
    toast.error(`Upload mislukt: ${error.message}`);
  }, []);

  const handleContinue = () => {
    if (!selectedImageId) {
      toast.error("Selecteer eerst een foto om door te gaan");
      return;
    }

    setCurrentStep("select");
    router.push("/create/select");
  };

  const handleRemoveImage = (imageId: string) => {
    const updatedImages = uploadedImages.filter((img) => img.id !== imageId);
    setUploadedImages(updatedImages);
    
    if (selectedImageId === imageId) {
      setSelectedImageId(updatedImages.length > 0 ? updatedImages[0].id : null);
    }
  };

  const handleImageSelect = (imageId: string) => {
    setSelectedImageId(imageId);
  };

  return (
    <>
      <Head>
        <title>Upload Foto&apos;s - RoyalPets</title>
        <meta name="description" content="Upload foto's van je huisdier voor het koninklijke portret" />
      </Head>

      <div className="space-y-6">
        {/* Dropzone */}
        <Dropzone
          maxFileSize={10 * 1024 * 1024} // 10MB
          maxFiles={10}
          onUploadComplete={handleUploadComplete}
          onUploadError={handleUploadError}
          showPhotoGuide={true}
        />

        {/* Uploaded Images Preview */}
        {uploadedImages.length > 0 && (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <h3 className="mb-3 font-medium text-gray-900">
              Geüploade foto&apos;s ({uploadedImages.length})
            </h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {uploadedImages.map((image) => (
                <div
                  key={image.id}
                  onClick={() => handleImageSelect(image.id)}
                  className={`
                    group relative aspect-square cursor-pointer overflow-hidden rounded-lg border-2 transition-all
                    ${
                      selectedImageId === image.id
                        ? "border-blue-600 ring-2 ring-blue-100"
                        : "border-gray-200 hover:border-gray-300"
                    }
                  `}
                >
                  <img
                    src={image.url}
                    alt={image.fileName}
                    className="h-full w-full object-cover"
                  />
                  {selectedImageId === image.id && (
                    <div className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white">
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveImage(image.id);
                    }}
                    className="absolute left-2 top-2 rounded-full bg-red-500 p-1 text-white opacity-0 transition-opacity hover:bg-red-600 group-hover:opacity-100"
                    aria-label="Verwijder foto"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
            {selectedImageId && (
              <p className="mt-3 text-sm text-blue-600">
                ✓ Geselecteerde foto wordt gebruikt voor het portret
              </p>
            )}
          </div>
        )}

        {/* Pet Information Form */}
        {uploadedImages.length > 0 && (
          <div className="rounded-lg border border-gray-200 p-4">
            <h3 className="mb-4 font-medium text-gray-900">Huisdier informatie (optioneel)</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="petType" className="mb-1 block text-sm font-medium text-gray-700">
                  Soort huisdier
                </label>
                <select
                  id="petType"
                  onChange={(e) => setPetType(e.target.value as "dog" | "cat" | "other" | null)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  defaultValue=""
                >
                  <option value="">Selecteer...</option>
                  <option value="dog">Hond</option>
                  <option value="cat">Kat</option>
                  <option value="other">Anders</option>
                </select>
              </div>
              <div>
                <label htmlFor="petName" className="mb-1 block text-sm font-medium text-gray-700">
                  Naam huisdier
                </label>
                <input
                  id="petName"
                  type="text"
                  placeholder="Bijv. Max"
                  onChange={(e) => setPetName(e.target.value || null)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between pt-4">
          <Button variant="outline" onClick={() => router.push("/")}>
            Annuleren
          </Button>
          <Button
            onClick={handleContinue}
            disabled={!selectedImageId || isUploading}
            className="min-w-[140px]"
          >
            {isUploading ? (
              <>
                <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Bezig...
              </>
            ) : (
              <>
                Volgende
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>

        {/* Help Text */}
        <div className="rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
          <h3 className="mb-2 flex items-center gap-2 font-medium text-gray-900">
            <ImageIcon className="h-4 w-4" />
            Tips voor de beste resultaten
          </h3>
          <ul className="space-y-1">
            <li>• Upload 3-5 foto&apos;s vanuit verschillende hoeken voor het beste resultaat</li>
            <li>• Zorg voor goede belichting en een duidelijk zichtbaar gezicht</li>
            <li>• Ondersteunde formaten: JPEG, PNG, WebP</li>
            <li>• Maximale bestandsgrootte: 10MB per foto</li>
            <li>• Foto&apos;s worden veilig opgeslagen en alleen gebruikt voor je portret</li>
          </ul>
        </div>
      </div>
    </>
  );
}
