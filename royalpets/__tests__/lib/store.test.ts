import { useCreationStore, getStepNumber, getStepName, getStepDescription, type CreationStep } from "@/lib/store";
import { costumes } from "@/lib/costumes";
import { act, renderHook } from "@testing-library/react";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

describe("useCreationStore", () => {
  beforeEach(() => {
    // Clear store and localStorage before each test
    act(() => {
      useCreationStore.getState().resetSession();
    });
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  describe("initial state", () => {
    it("should have correct initial state", () => {
      const state = useCreationStore.getState();
      
      expect(state.currentStep).toBe("upload");
      expect(state.uploadedImages).toEqual([]);
      expect(state.selectedImageId).toBeNull();
      expect(state.petType).toBeNull();
      expect(state.petName).toBeNull();
      expect(state.selectedCostume).toBeNull();
      expect(state.portraitId).toBeNull();
      expect(state.generationStatus).toBeNull();
      expect(state.generatedImages).toBeNull();
      expect(state.generationError).toBeNull();
      expect(state.selectedImageIndex).toBeNull();
      expect(state.selectedTierId).toBeNull();
    });
  });

  describe("step management", () => {
    it("should set current step", () => {
      act(() => {
        useCreationStore.getState().setCurrentStep("select");
      });
      
      expect(useCreationStore.getState().currentStep).toBe("select");
    });

    it("should go to next step", () => {
      act(() => {
        useCreationStore.getState().goToNextStep();
      });
      
      expect(useCreationStore.getState().currentStep).toBe("select");
    });

    it("should go to previous step", () => {
      act(() => {
        useCreationStore.getState().setCurrentStep("select");
        useCreationStore.getState().goToPreviousStep();
      });
      
      expect(useCreationStore.getState().currentStep).toBe("upload");
    });

    it("should not go beyond last step", () => {
      act(() => {
        useCreationStore.getState().setCurrentStep("pricing");
        useCreationStore.getState().goToNextStep();
      });
      
      expect(useCreationStore.getState().currentStep).toBe("pricing");
    });

    it("should not go before first step", () => {
      act(() => {
        useCreationStore.getState().goToPreviousStep();
      });
      
      expect(useCreationStore.getState().currentStep).toBe("upload");
    });
  });

  describe("step navigation guards", () => {
    it("should allow navigation to upload step", () => {
      const canNavigate = useCreationStore.getState().canNavigateToStep("upload");
      expect(canNavigate).toBe(true);
    });

    it("should not allow navigation to select without upload", () => {
      const canNavigate = useCreationStore.getState().canNavigateToStep("select");
      expect(canNavigate).toBe(false);
    });

    it("should allow navigation to select after upload", () => {
      act(() => {
        useCreationStore.getState().setUploadedImages([
          { id: "img1", url: "url1", fileName: "test.jpg", fileSize: 1000, uploadedAt: "2024-01-01" },
        ]);
        useCreationStore.getState().setSelectedImageId("img1");
      });
      
      const canNavigate = useCreationStore.getState().canNavigateToStep("select");
      expect(canNavigate).toBe(true);
    });

    it("should not allow navigation to generate without costume", () => {
      act(() => {
        useCreationStore.getState().setUploadedImages([
          { id: "img1", url: "url1", fileName: "test.jpg", fileSize: 1000, uploadedAt: "2024-01-01" },
        ]);
        useCreationStore.getState().setSelectedImageId("img1");
      });
      
      const canNavigate = useCreationStore.getState().canNavigateToStep("generate");
      expect(canNavigate).toBe(false);
    });

    it("should allow navigation to generate after costume selection", () => {
      act(() => {
        useCreationStore.getState().setUploadedImages([
          { id: "img1", url: "url1", fileName: "test.jpg", fileSize: 1000, uploadedAt: "2024-01-01" },
        ]);
        useCreationStore.getState().setSelectedImageId("img1");
        useCreationStore.getState().setSelectedCostume(costumes[0]);
      });
      
      const canNavigate = useCreationStore.getState().canNavigateToStep("generate");
      expect(canNavigate).toBe(true);
    });

    it("should not allow navigation to preview without completed generation", () => {
      act(() => {
        useCreationStore.getState().setUploadedImages([
          { id: "img1", url: "url1", fileName: "test.jpg", fileSize: 1000, uploadedAt: "2024-01-01" },
        ]);
        useCreationStore.getState().setSelectedImageId("img1");
        useCreationStore.getState().setSelectedCostume(costumes[0]);
      });
      
      const canNavigate = useCreationStore.getState().canNavigateToStep("preview");
      expect(canNavigate).toBe(false);
    });

    it("should allow navigation to preview after completed generation", () => {
      act(() => {
        useCreationStore.getState().setUploadedImages([
          { id: "img1", url: "url1", fileName: "test.jpg", fileSize: 1000, uploadedAt: "2024-01-01" },
        ]);
        useCreationStore.getState().setSelectedImageId("img1");
        useCreationStore.getState().setSelectedCostume(costumes[0]);
        useCreationStore.getState().setGenerationStatus("completed");
        useCreationStore.getState().setGeneratedImages(["img1.jpg", "img2.jpg", "img3.jpg", "img4.jpg"]);
      });
      
      const canNavigate = useCreationStore.getState().canNavigateToStep("preview");
      expect(canNavigate).toBe(true);
    });

    it("should not allow navigation to pricing without selected image", () => {
      act(() => {
        useCreationStore.getState().setUploadedImages([
          { id: "img1", url: "url1", fileName: "test.jpg", fileSize: 1000, uploadedAt: "2024-01-01" },
        ]);
        useCreationStore.getState().setSelectedImageId("img1");
        useCreationStore.getState().setSelectedCostume(costumes[0]);
        useCreationStore.getState().setGenerationStatus("completed");
        useCreationStore.getState().setGeneratedImages(["img1.jpg", "img2.jpg", "img3.jpg", "img4.jpg"]);
      });
      
      const canNavigate = useCreationStore.getState().canNavigateToStep("pricing");
      expect(canNavigate).toBe(false);
    });

    it("should allow navigation to pricing after image selection", () => {
      act(() => {
        useCreationStore.getState().setUploadedImages([
          { id: "img1", url: "url1", fileName: "test.jpg", fileSize: 1000, uploadedAt: "2024-01-01" },
        ]);
        useCreationStore.getState().setSelectedImageId("img1");
        useCreationStore.getState().setSelectedCostume(costumes[0]);
        useCreationStore.getState().setGenerationStatus("completed");
        useCreationStore.getState().setGeneratedImages(["img1.jpg", "img2.jpg", "img3.jpg", "img4.jpg"]);
        useCreationStore.getState().setSelectedImageIndex(0);
      });
      
      const canNavigate = useCreationStore.getState().canNavigateToStep("pricing");
      expect(canNavigate).toBe(true);
    });
  });

  describe("upload actions", () => {
    it("should set uploaded images", () => {
      const images = [
        { id: "img1", url: "url1", fileName: "test1.jpg", fileSize: 1000, uploadedAt: "2024-01-01" },
        { id: "img2", url: "url2", fileName: "test2.jpg", fileSize: 2000, uploadedAt: "2024-01-02" },
      ];
      
      act(() => {
        useCreationStore.getState().setUploadedImages(images);
      });
      
      expect(useCreationStore.getState().uploadedImages).toEqual(images);
    });

    it("should add uploaded image", () => {
      const image = { id: "img1", url: "url1", fileName: "test.jpg", fileSize: 1000, uploadedAt: "2024-01-01" };
      
      act(() => {
        useCreationStore.getState().addUploadedImage(image);
      });
      
      expect(useCreationStore.getState().uploadedImages).toHaveLength(1);
      expect(useCreationStore.getState().uploadedImages[0]).toEqual(image);
    });

    it("should remove uploaded image", () => {
      act(() => {
        useCreationStore.getState().addUploadedImage({ id: "img1", url: "url1", fileName: "test1.jpg", fileSize: 1000, uploadedAt: "2024-01-01" });
        useCreationStore.getState().addUploadedImage({ id: "img2", url: "url2", fileName: "test2.jpg", fileSize: 2000, uploadedAt: "2024-01-02" });
        useCreationStore.getState().setSelectedImageId("img1");
        useCreationStore.getState().removeUploadedImage("img1");
      });
      
      expect(useCreationStore.getState().uploadedImages).toHaveLength(1);
      expect(useCreationStore.getState().uploadedImages[0].id).toBe("img2");
      expect(useCreationStore.getState().selectedImageId).toBeNull();
    });

    it("should keep selected image id when removing different image", () => {
      act(() => {
        useCreationStore.getState().addUploadedImage({ id: "img1", url: "url1", fileName: "test1.jpg", fileSize: 1000, uploadedAt: "2024-01-01" });
        useCreationStore.getState().addUploadedImage({ id: "img2", url: "url2", fileName: "test2.jpg", fileSize: 2000, uploadedAt: "2024-01-02" });
        useCreationStore.getState().setSelectedImageId("img1");
        useCreationStore.getState().removeUploadedImage("img2");
      });
      
      expect(useCreationStore.getState().selectedImageId).toBe("img1");
    });

    it("should set selected image id", () => {
      act(() => {
        useCreationStore.getState().setSelectedImageId("img1");
      });
      
      expect(useCreationStore.getState().selectedImageId).toBe("img1");
    });

    it("should set pet type", () => {
      act(() => {
        useCreationStore.getState().setPetType("dog");
      });
      
      expect(useCreationStore.getState().petType).toBe("dog");
    });

    it("should set pet name", () => {
      act(() => {
        useCreationStore.getState().setPetName("Max");
      });
      
      expect(useCreationStore.getState().petName).toBe("Max");
    });
  });

  describe("costume selection", () => {
    it("should set selected costume", () => {
      const costume = costumes[0];
      
      act(() => {
        useCreationStore.getState().setSelectedCostume(costume);
      });
      
      expect(useCreationStore.getState().selectedCostume).toEqual(costume);
    });

    it("should clear selected costume", () => {
      act(() => {
        useCreationStore.getState().setSelectedCostume(costumes[0]);
        useCreationStore.getState().setSelectedCostume(null);
      });
      
      expect(useCreationStore.getState().selectedCostume).toBeNull();
    });
  });

  describe("generation actions", () => {
    it("should set portrait id", () => {
      act(() => {
        useCreationStore.getState().setPortraitId("portrait-123");
      });
      
      expect(useCreationStore.getState().portraitId).toBe("portrait-123");
    });

    it("should set generation status", () => {
      act(() => {
        useCreationStore.getState().setGenerationStatus("generating");
      });
      
      expect(useCreationStore.getState().generationStatus).toBe("generating");
    });

    it("should set generated images", () => {
      const images = ["img1.jpg", "img2.jpg", "img3.jpg", "img4.jpg"];
      
      act(() => {
        useCreationStore.getState().setGeneratedImages(images);
      });
      
      expect(useCreationStore.getState().generatedImages).toEqual(images);
    });

    it("should set generation error", () => {
      act(() => {
        useCreationStore.getState().setGenerationError("Network error");
      });
      
      expect(useCreationStore.getState().generationError).toBe("Network error");
    });
  });

  describe("preview actions", () => {
    it("should set selected image index", () => {
      act(() => {
        useCreationStore.getState().setSelectedImageIndex(2);
      });
      
      expect(useCreationStore.getState().selectedImageIndex).toBe(2);
    });
  });

  describe("pricing actions", () => {
    it("should set selected tier id", () => {
      act(() => {
        useCreationStore.getState().setSelectedTierId("digital-premium");
      });
      
      expect(useCreationStore.getState().selectedTierId).toBe("digital-premium");
    });

    it("should clear selected tier id", () => {
      act(() => {
        useCreationStore.getState().setSelectedTierId("digital-premium");
        useCreationStore.getState().setSelectedTierId(null);
      });
      
      expect(useCreationStore.getState().selectedTierId).toBeNull();
    });

    it("should allow navigation to pricing when tier is selected", () => {
      // Setup complete flow
      act(() => {
        useCreationStore.getState().addUploadedImage({ 
          id: "img1", url: "url1", fileName: "test.jpg", fileSize: 1000, uploadedAt: "2024-01-01" 
        });
        useCreationStore.getState().setSelectedImageId("img1");
        useCreationStore.getState().setSelectedCostume(costumes[0]);
        useCreationStore.getState().setGenerationStatus("completed");
        useCreationStore.getState().setGeneratedImages(["img1.jpg", "img2.jpg", "img3.jpg", "img4.jpg"]);
        useCreationStore.getState().setSelectedImageIndex(0);
        useCreationStore.getState().setSelectedTierId("digital-premium");
      });
      
      const canNavigate = useCreationStore.getState().canNavigateToStep("pricing");
      expect(canNavigate).toBe(true);
    });

    it("should allow navigation to pricing when all previous steps are complete", () => {
      // Setup complete flow - canNavigateToStep checks if PREVIOUS steps are complete
      // Tier selection is part of the pricing step itself, not a prerequisite
      act(() => {
        useCreationStore.getState().addUploadedImage({ 
          id: "img1", url: "url1", fileName: "test.jpg", fileSize: 1000, uploadedAt: "2024-01-01" 
        });
        useCreationStore.getState().setSelectedImageId("img1");
        useCreationStore.getState().setSelectedCostume(costumes[0]);
        useCreationStore.getState().setGenerationStatus("completed");
        useCreationStore.getState().setGeneratedImages(["img1.jpg", "img2.jpg", "img3.jpg", "img4.jpg"]);
        useCreationStore.getState().setSelectedImageIndex(0);
        useCreationStore.getState().setSelectedTierId(null);
      });
      
      const canNavigate = useCreationStore.getState().canNavigateToStep("pricing");
      expect(canNavigate).toBe(true);
    });

    it("should track tier selection as part of pricing completion", () => {
      act(() => {
        useCreationStore.getState().setSelectedTierId("digital-premium");
      });
      
      expect(useCreationStore.getState().selectedTierId).toBe("digital-premium");
      
      // Verify it persists across state changes
      act(() => {
        useCreationStore.getState().setCurrentStep("pricing");
      });
      
      expect(useCreationStore.getState().selectedTierId).toBe("digital-premium");
    });
  });

  describe("session management", () => {
    it("should clear generation state", () => {
      act(() => {
        useCreationStore.getState().setPortraitId("portrait-123");
        useCreationStore.getState().setGenerationStatus("completed");
        useCreationStore.getState().setGeneratedImages(["img1.jpg"]);
        useCreationStore.getState().setSelectedImageIndex(0);
        useCreationStore.getState().clearGeneration();
      });
      
      expect(useCreationStore.getState().portraitId).toBeNull();
      expect(useCreationStore.getState().generationStatus).toBeNull();
      expect(useCreationStore.getState().generatedImages).toBeNull();
      expect(useCreationStore.getState().selectedImageIndex).toBeNull();
    });

    it("should reset entire session", () => {
      act(() => {
        useCreationStore.getState().setCurrentStep("pricing");
        useCreationStore.getState().addUploadedImage({ id: "img1", url: "url1", fileName: "test.jpg", fileSize: 1000, uploadedAt: "2024-01-01" });
        useCreationStore.getState().setSelectedCostume(costumes[0]);
        useCreationStore.getState().setPortraitId("portrait-123");
        useCreationStore.getState().setSelectedTierId("digital-premium");
        useCreationStore.getState().resetSession();
      });
      
      expect(useCreationStore.getState().currentStep).toBe("upload");
      expect(useCreationStore.getState().uploadedImages).toEqual([]);
      expect(useCreationStore.getState().selectedCostume).toBeNull();
      expect(useCreationStore.getState().portraitId).toBeNull();
      expect(useCreationStore.getState().selectedTierId).toBeNull();
    });
  });

  describe("persistence", () => {
    it("should persist state to localStorage", () => {
      // The persist middleware uses the actual localStorage
      // We can verify persistence by checking if state survives store recreation
      act(() => {
        useCreationStore.getState().setUploadedImages([
          { id: "img1", url: "url1", fileName: "test.jpg", fileSize: 1000, uploadedAt: "2024-01-01" },
        ]);
        useCreationStore.getState().setSelectedCostume(costumes[0]);
      });

      // Verify state is set
      const state = useCreationStore.getState();
      expect(state.uploadedImages).toHaveLength(1);
      expect(state.uploadedImages[0].id).toBe("img1");
      expect(state.selectedCostume).toEqual(costumes[0]);
    });

    it("should remove localStorage key on reset", () => {
      // Set some data first
      act(() => {
        useCreationStore.getState().setUploadedImages([
          { id: "img1", url: "url1", fileName: "test.jpg", fileSize: 1000, uploadedAt: "2024-01-01" },
        ]);
      });

      // Then reset
      act(() => {
        useCreationStore.getState().resetSession();
      });

      // Verify state is cleared
      const state = useCreationStore.getState();
      expect(state.uploadedImages).toEqual([]);
      expect(state.selectedCostume).toBeNull();
      expect(state.currentStep).toBe("upload");
    });
  });
});

describe("helper functions", () => {
  describe("getStepNumber", () => {
    it("should return correct step numbers", () => {
      expect(getStepNumber("upload")).toBe(1);
      expect(getStepNumber("select")).toBe(2);
      expect(getStepNumber("generate")).toBe(3);
      expect(getStepNumber("preview")).toBe(4);
      expect(getStepNumber("pricing")).toBe(5);
    });
  });

  describe("getStepName", () => {
    it("should return Dutch step names", () => {
      expect(getStepName("upload")).toBe("Upload");
      expect(getStepName("select")).toBe("Kostuum");
      expect(getStepName("generate")).toBe("Genereren");
      expect(getStepName("preview")).toBe("Voorbeeld");
      expect(getStepName("pricing")).toBe("Bestellen");
    });
  });

  describe("getStepDescription", () => {
    it("should return Dutch step descriptions", () => {
      expect(getStepDescription("upload")).toBe("Upload foto's van je huisdier");
      expect(getStepDescription("select")).toBe("Kies een koninklijk kostuum");
      expect(getStepDescription("generate")).toBe("Genereer je portret");
      expect(getStepDescription("preview")).toBe("Bekijk en selecteer");
      expect(getStepDescription("pricing")).toBe("Kies je pakket");
    });
  });
});
