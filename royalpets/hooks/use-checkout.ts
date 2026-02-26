"use client";

import { useState, useCallback } from "react";
import type { TierId } from "@/lib/pricing";

interface CheckoutData {
  tierId: TierId;
  portraitId: string;
  customerEmail: string;
}

interface CheckoutResult {
  success: boolean;
  sessionId?: string;
  checkoutUrl?: string;
  error?: string;
}

interface UseCheckoutReturn {
  isLoading: boolean;
  error: string | null;
  checkoutUrl: string | null;
  sessionId: string | null;
  initiateCheckout: (data: CheckoutData) => Promise<CheckoutResult>;
  clearError: () => void;
  reset: () => void;
}

/**
 * Hook for managing Stripe checkout flow
 */
export function useCheckout(): UseCheckoutReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setCheckoutUrl(null);
    setSessionId(null);
  }, []);

  const initiateCheckout = useCallback(async (data: CheckoutData): Promise<CheckoutResult> => {
    setIsLoading(true);
    setError(null);
    setCheckoutUrl(null);
    setSessionId(null);

    try {
      // Validate inputs
      if (!data.tierId) {
        throw new Error("Selecteer een pakket om door te gaan");
      }

      if (!data.portraitId) {
        throw new Error("Portret ID ontbreekt");
      }

      if (!data.customerEmail) {
        throw new Error("Voer je e-mailadres in");
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.customerEmail)) {
        throw new Error("Voer een geldig e-mailadres in");
      }

      const response = await fetch("/api/checkout/session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tierId: data.tierId,
          portraitId: data.portraitId,
          customerEmail: data.customerEmail,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Er is iets misgegaan bij het starten van de betaling");
      }

      if (!result.success || !result.checkoutUrl) {
        throw new Error("Ontbrekende checkout URL");
      }

      setCheckoutUrl(result.checkoutUrl);
      setSessionId(result.sessionId);
      setIsLoading(false);

      return {
        success: true,
        sessionId: result.sessionId,
        checkoutUrl: result.checkoutUrl,
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Er is iets misgegaan bij het starten van de betaling";
      setError(errorMessage);
      setIsLoading(false);

      return {
        success: false,
        error: errorMessage,
      };
    }
  }, []);

  return {
    isLoading,
    error,
    checkoutUrl,
    sessionId,
    initiateCheckout,
    clearError,
    reset,
  };
}

/**
 * Hook for redirecting to Stripe checkout
 * Automatically redirects when checkoutUrl is available
 */
export function useCheckoutRedirect(): {
  redirectToCheckout: (checkoutUrl: string) => void;
  isRedirecting: boolean;
} {
  const [isRedirecting, setIsRedirecting] = useState(false);

  const redirectToCheckout = useCallback((url: string) => {
    setIsRedirecting(true);
    
    // Small delay to allow UI to update before redirect
    setTimeout(() => {
      window.location.href = url;
    }, 100);
  }, []);

  return {
    redirectToCheckout,
    isRedirecting,
  };
}

/**
 * Validates checkout prerequisites
 */
export function validateCheckoutPrerequisites(
  tierId: TierId | null,
  portraitId: string | null,
  customerEmail: string
): { valid: boolean; error?: string } {
  if (!tierId) {
    return { valid: false, error: "Selecteer eerst een pakket" };
  }

  if (!portraitId) {
    return { valid: false, error: "Portret ID ontbreekt" };
  }

  if (!customerEmail.trim()) {
    return { valid: false, error: "Voer je e-mailadres in" };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(customerEmail)) {
    return { valid: false, error: "Voer een geldig e-mailadres in" };
  }

  return { valid: true };
}
