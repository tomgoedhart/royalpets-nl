import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Costume } from "@/lib/costumes";
import type { Database } from "@/types/supabase";

type PetType = Database["public"]["Enums"]["pet_type"];

export type CreationStep = "upload" | "select" | "generate" | "preview" | "pricing";

export interface UploadedImage {
  id: string;
  url: string;
  fileName: string;
  fileSize: number;
  uploadedAt: string;
}

export interface CreationState {
  // Current step in the creation flow
  currentStep: CreationStep;
  
  // Step 1: Upload
  uploadedImages: UploadedImage[];
  selectedImageId: string | null;
  petType: PetType | null;
  petName: string | null;
  
  // Step 2: Costume Selection
  selectedCostume: Costume | null;
  
  // Step 3: Generation
  portraitId: string | null;
  generationStatus: "pending" | "generating" | "completed" | "failed" | null;
  generatedImages: string[] | null;
  generationError: string | null;
  
  // Step 4: Preview
  selectedImageIndex: number | null;
}

export interface CreationActions {
  // Step management
  setCurrentStep: (step: CreationStep) => void;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  canNavigateToStep: (step: CreationStep) => boolean;
  
  // Step 1: Upload actions
  setUploadedImages: (images: UploadedImage[]) => void;
  addUploadedImage: (image: UploadedImage) => void;
  removeUploadedImage: (imageId: string) => void;
  setSelectedImageId: (imageId: string | null) => void;
  setPetType: (petType: PetType | null) => void;
  setPetName: (petName: string | null) => void;
  
  // Step 2: Costume selection actions
  setSelectedCostume: (costume: Costume | null) => void;
  
  // Step 3: Generation actions
  setPortraitId: (portraitId: string | null) => void;
  setGenerationStatus: (status: "pending" | "generating" | "completed" | "failed" | null) => void;
  setGeneratedImages: (images: string[] | null) => void;
  setGenerationError: (error: string | null) => void;
  
  // Step 4: Preview actions
  setSelectedImageIndex: (index: number | null) => void;
  
  // Session management
  resetSession: () => void;
  clearGeneration: () => void;
}

export type CreationStore = CreationState & CreationActions;

const initialState: CreationState = {
  currentStep: "upload",
  uploadedImages: [],
  selectedImageId: null,
  petType: null,
  petName: null,
  selectedCostume: null,
  portraitId: null,
  generationStatus: null,
  generatedImages: null,
  generationError: null,
  selectedImageIndex: null,
};

const stepOrder: CreationStep[] = ["upload", "select", "generate", "preview", "pricing"];

export const useCreationStore = create<CreationStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Step management
      setCurrentStep: (step) => set({ currentStep: step }),
      
      goToNextStep: () => {
        const { currentStep } = get();
        const currentIndex = stepOrder.indexOf(currentStep);
        if (currentIndex < stepOrder.length - 1) {
          set({ currentStep: stepOrder[currentIndex + 1] });
        }
      },
      
      goToPreviousStep: () => {
        const { currentStep } = get();
        const currentIndex = stepOrder.indexOf(currentStep);
        if (currentIndex > 0) {
          set({ currentStep: stepOrder[currentIndex - 1] });
        }
      },
      
      canNavigateToStep: (targetStep) => {
        const state = get();
        const targetIndex = stepOrder.indexOf(targetStep);
        
        // Check if all previous steps are complete
        for (let i = 0; i < targetIndex; i++) {
          const step = stepOrder[i];
          
          switch (step) {
            case "upload":
              if (state.uploadedImages.length === 0 || !state.selectedImageId) {
                return false;
              }
              break;
            case "select":
              if (!state.selectedCostume) {
                return false;
              }
              break;
            case "generate":
              if (state.generationStatus !== "completed" || !state.generatedImages) {
                return false;
              }
              break;
            case "preview":
              if (state.selectedImageIndex === null) {
                return false;
              }
              break;
          }
        }
        
        return true;
      },

      // Step 1: Upload actions
      setUploadedImages: (images) => set({ uploadedImages: images }),
      
      addUploadedImage: (image) =>
        set((state) => ({
          uploadedImages: [...state.uploadedImages, image],
        })),
      
      removeUploadedImage: (imageId) =>
        set((state) => ({
          uploadedImages: state.uploadedImages.filter((img) => img.id !== imageId),
          selectedImageId:
            state.selectedImageId === imageId ? null : state.selectedImageId,
        })),
      
      setSelectedImageId: (imageId) => set({ selectedImageId: imageId }),
      setPetType: (petType) => set({ petType }),
      setPetName: (petName) => set({ petName }),

      // Step 2: Costume selection actions
      setSelectedCostume: (costume) => set({ selectedCostume: costume }),

      // Step 3: Generation actions
      setPortraitId: (portraitId) => set({ portraitId }),
      setGenerationStatus: (status) => set({ generationStatus: status }),
      setGeneratedImages: (images) => set({ generatedImages: images }),
      setGenerationError: (error) => set({ generationError: error }),

      // Step 4: Preview actions
      setSelectedImageIndex: (index) => set({ selectedImageIndex: index }),

      // Session management
      resetSession: () => {
        set(initialState);
        // Clear localStorage
        if (typeof window !== "undefined") {
          localStorage.removeItem("creation-storage");
        }
      },
      
      clearGeneration: () =>
        set({
          portraitId: null,
          generationStatus: null,
          generatedImages: null,
          generationError: null,
          selectedImageIndex: null,
        }),
    }),
    {
      name: "creation-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        currentStep: state.currentStep,
        uploadedImages: state.uploadedImages,
        selectedImageId: state.selectedImageId,
        petType: state.petType,
        petName: state.petName,
        selectedCostume: state.selectedCostume,
        portraitId: state.portraitId,
        generationStatus: state.generationStatus,
        generatedImages: state.generatedImages,
        generationError: state.generationError,
        selectedImageIndex: state.selectedImageIndex,
      }),
    }
  )
);

// Helper hook for step validation
export function useStepValidation() {
  const store = useCreationStore();
  
  return {
    isUploadComplete: store.uploadedImages.length > 0 && !!store.selectedImageId,
    isSelectionComplete: !!store.selectedCostume,
    isGenerationComplete: store.generationStatus === "completed" && !!store.generatedImages,
    isPreviewComplete: store.selectedImageIndex !== null,
  };
}

// Helper to get step number
export function getStepNumber(step: CreationStep): number {
  return stepOrder.indexOf(step) + 1;
}

// Helper to get step name in Dutch
export function getStepName(step: CreationStep): string {
  const names: Record<CreationStep, string> = {
    upload: "Upload",
    select: "Kostuum",
    generate: "Genereren",
    preview: "Voorbeeld",
    pricing: "Bestellen",
  };
  return names[step];
}

// Helper to get step description
export function getStepDescription(step: CreationStep): string {
  const descriptions: Record<CreationStep, string> = {
    upload: "Upload foto's van je huisdier",
    select: "Kies een koninklijk kostuum",
    generate: "Genereer je portret",
    preview: "Bekijk en selecteer",
    pricing: "Kies je pakket",
  };
  return descriptions[step];
}
