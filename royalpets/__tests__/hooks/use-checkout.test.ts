import { renderHook, act, waitFor } from "@testing-library/react";
import { useCheckout, useCheckoutRedirect, validateCheckoutPrerequisites } from "@/hooks/use-checkout";
import type { TierId } from "@/lib/pricing";

// Mock fetch
global.fetch = jest.fn();

describe("useCheckout hook", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("initial state", () => {
    it("returns initial state", () => {
      const { result } = renderHook(() => useCheckout());

      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.checkoutUrl).toBeNull();
      expect(result.current.sessionId).toBeNull();
    });
  });

  describe("initiateCheckout", () => {
    it("sets loading state while processing", async () => {
      (fetch as jest.Mock).mockImplementation(() => 
        new Promise(() => {}) // Never resolves
      );

      const { result } = renderHook(() => useCheckout());

      act(() => {
        result.current.initiateCheckout({
          tierId: "digital-basic" as TierId,
          portraitId: "test-portrait-id",
          customerEmail: "test@example.com",
        });
      });

      expect(result.current.isLoading).toBe(true);
    });

    it("returns success with checkout URL on successful API call", async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          sessionId: "cs_test_123",
          checkoutUrl: "https://checkout.stripe.com/test",
        }),
      });

      const { result } = renderHook(() => useCheckout());

      let response: { success: boolean; sessionId?: string; checkoutUrl?: string; error?: string } | undefined;

      await act(async () => {
        response = await result.current.initiateCheckout({
          tierId: "digital-basic" as TierId,
          portraitId: "test-portrait-id",
          customerEmail: "test@example.com",
        });
      });

      expect(response?.success).toBe(true);
      expect(response?.sessionId).toBe("cs_test_123");
      expect(response?.checkoutUrl).toBe("https://checkout.stripe.com/test");
      expect(result.current.isLoading).toBe(false);
      expect(result.current.checkoutUrl).toBe("https://checkout.stripe.com/test");
      expect(result.current.sessionId).toBe("cs_test_123");
    });

    it("returns error when tierId is missing", async () => {
      const { result } = renderHook(() => useCheckout());

      let response: { success: boolean; error?: string } | undefined;

      await act(async () => {
        response = await result.current.initiateCheckout({
          tierId: "" as TierId,
          portraitId: "test-portrait-id",
          customerEmail: "test@example.com",
        });
      });

      expect(response?.success).toBe(false);
      expect(response?.error).toBe("Selecteer een pakket om door te gaan");
      expect(result.current.error).toBe("Selecteer een pakket om door te gaan");
    });

    it("returns error when portraitId is missing", async () => {
      const { result } = renderHook(() => useCheckout());

      let response: { success: boolean; error?: string } | undefined;

      await act(async () => {
        response = await result.current.initiateCheckout({
          tierId: "digital-basic" as TierId,
          portraitId: "",
          customerEmail: "test@example.com",
        });
      });

      expect(response?.success).toBe(false);
      expect(response?.error).toBe("Portret ID ontbreekt");
    });

    it("returns error when customerEmail is missing", async () => {
      const { result } = renderHook(() => useCheckout());

      let response: { success: boolean; error?: string } | undefined;

      await act(async () => {
        response = await result.current.initiateCheckout({
          tierId: "digital-basic" as TierId,
          portraitId: "test-portrait-id",
          customerEmail: "",
        });
      });

      expect(response?.success).toBe(false);
      expect(response?.error).toBe("Voer je e-mailadres in");
    });

    it("returns error for invalid email format", async () => {
      const { result } = renderHook(() => useCheckout());

      let response: { success: boolean; error?: string } | undefined;

      await act(async () => {
        response = await result.current.initiateCheckout({
          tierId: "digital-basic" as TierId,
          portraitId: "test-portrait-id",
          customerEmail: "invalid-email",
        });
      });

      expect(response?.success).toBe(false);
      expect(response?.error).toBe("Voer een geldig e-mailadres in");
    });

    it("handles API error response", async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          success: false,
          message: "Portrait not found",
        }),
      });

      const { result } = renderHook(() => useCheckout());

      let response: { success: boolean; error?: string } | undefined;

      await act(async () => {
        response = await result.current.initiateCheckout({
          tierId: "digital-basic" as TierId,
          portraitId: "invalid-id",
          customerEmail: "test@example.com",
        });
      });

      expect(response?.success).toBe(false);
      expect(response?.error).toBe("Portrait not found");
      expect(result.current.error).toBe("Portrait not found");
    });

    it("handles network error", async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error("Network error"));

      const { result } = renderHook(() => useCheckout());

      let response: { success: boolean; error?: string } | undefined;

      await act(async () => {
        response = await result.current.initiateCheckout({
          tierId: "digital-basic" as TierId,
          portraitId: "test-portrait-id",
          customerEmail: "test@example.com",
        });
      });

      expect(response?.success).toBe(false);
      expect(response?.error).toBe("Network error");
    });

    it("handles missing checkout URL in response", async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          sessionId: "cs_test_123",
          // checkoutUrl is missing
        }),
      });

      const { result } = renderHook(() => useCheckout());

      let response: { success: boolean; error?: string } | undefined;

      await act(async () => {
        response = await result.current.initiateCheckout({
          tierId: "digital-basic" as TierId,
          portraitId: "test-portrait-id",
          customerEmail: "test@example.com",
        });
      });

      expect(response?.success).toBe(false);
      expect(response?.error).toBe("Ontbrekende checkout URL");
    });

    it("sends correct request body to API", async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          sessionId: "cs_test_123",
          checkoutUrl: "https://checkout.stripe.com/test",
        }),
      });

      const { result } = renderHook(() => useCheckout());

      await act(async () => {
        await result.current.initiateCheckout({
          tierId: "digital-premium" as TierId,
          portraitId: "portrait-456",
          customerEmail: "customer@test.nl",
        });
      });

      expect(fetch).toHaveBeenCalledWith("/api/checkout/session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tierId: "digital-premium",
          portraitId: "portrait-456",
          customerEmail: "customer@test.nl",
        }),
      });
    });
  });

  describe("clearError", () => {
    it("clears the error state", async () => {
      const { result } = renderHook(() => useCheckout());

      // First set an error
      await act(async () => {
        await result.current.initiateCheckout({
          tierId: "" as TierId,
          portraitId: "test",
          customerEmail: "test@test.com",
        });
      });

      expect(result.current.error).not.toBeNull();

      // Then clear it
      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe("reset", () => {
    it("resets all state to initial values", async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          sessionId: "cs_test_123",
          checkoutUrl: "https://checkout.stripe.com/test",
        }),
      });

      const { result } = renderHook(() => useCheckout());

      await act(async () => {
        await result.current.initiateCheckout({
          tierId: "digital-basic" as TierId,
          portraitId: "test-portrait-id",
          customerEmail: "test@example.com",
        });
      });

      // State should have values
      expect(result.current.checkoutUrl).not.toBeNull();
      expect(result.current.sessionId).not.toBeNull();

      // Reset
      act(() => {
        result.current.reset();
      });

      // State should be reset
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.checkoutUrl).toBeNull();
      expect(result.current.sessionId).toBeNull();
    });
  });
});

describe("useCheckoutRedirect hook", () => {
  const originalHref = window.location.href;

  beforeEach(() => {
    // @ts-expect-error - allow modifying href for test
    window.location.href = "";
  });

  afterEach(() => {
    // @ts-expect-error - allow modifying href for test
    window.location.href = originalHref;
  });

  it("sets isRedirecting state when redirect is called", () => {
    jest.useFakeTimers();
    
    const { result } = renderHook(() => useCheckoutRedirect());

    expect(result.current.isRedirecting).toBe(false);

    act(() => {
      result.current.redirectToCheckout("https://checkout.stripe.com/test");
    });

    expect(result.current.isRedirecting).toBe(true);

    // Clean up timer
    act(() => {
      jest.runAllTimers();
    });
    
    jest.useRealTimers();
  });
});

describe("validateCheckoutPrerequisites", () => {
  it("returns valid for complete data", () => {
    const result = validateCheckoutPrerequisites(
      "digital-basic" as TierId,
      "portrait-123",
      "test@example.com"
    );

    expect(result.valid).toBe(true);
  });

  it("returns error when tierId is null", () => {
    const result = validateCheckoutPrerequisites(
      null,
      "portrait-123",
      "test@example.com"
    );

    expect(result.valid).toBe(false);
    expect(result.error).toBe("Selecteer eerst een pakket");
  });

  it("returns error when portraitId is null", () => {
    const result = validateCheckoutPrerequisites(
      "digital-basic" as TierId,
      null,
      "test@example.com"
    );

    expect(result.valid).toBe(false);
    expect(result.error).toBe("Portret ID ontbreekt");
  });

  it("returns error when email is empty", () => {
    const result = validateCheckoutPrerequisites(
      "digital-basic" as TierId,
      "portrait-123",
      ""
    );

    expect(result.valid).toBe(false);
    expect(result.error).toBe("Voer je e-mailadres in");
  });

  it("returns error for invalid email format", () => {
    const result = validateCheckoutPrerequisites(
      "digital-basic" as TierId,
      "portrait-123",
      "invalid-email"
    );

    expect(result.valid).toBe(false);
    expect(result.error).toBe("Voer een geldig e-mailadres in");
  });

  it("handles all valid tier IDs", () => {
    const tiers: TierId[] = ["digital-basic", "digital-premium", "print-digital", "canvas-deluxe"];
    
    for (const tierId of tiers) {
      const result = validateCheckoutPrerequisites(
        tierId,
        "portrait-123",
        "test@example.com"
      );
      expect(result.valid).toBe(true);
    }
  });
});
