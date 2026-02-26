"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCheckout, useCheckoutRedirect, validateCheckoutPrerequisites } from "@/hooks/use-checkout";
import { useCreationStore } from "@/lib/store";

export default function CheckoutForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const { selectedTierId, portraitId, canNavigateToStep } = useCreationStore();
  const { isLoading, error, checkoutUrl, initiateCheckout, clearError } = useCheckout();
  const { redirectToCheckout, isRedirecting } = useCheckoutRedirect();

  // Check if returning from cancelled payment
  const cancelled = searchParams.get("cancelled") === "true";

  // Validate prerequisites on mount
  useEffect(() => {
    if (!canNavigateToStep("pricing")) {
      // Redirect to pricing if prerequisites not met
      router.push("/create/pricing");
      return;
    }
  }, [canNavigateToStep, router]);

  // Auto-redirect when checkoutUrl is available
  useEffect(() => {
    if (checkoutUrl && !isRedirecting) {
      redirectToCheckout(checkoutUrl);
    }
  }, [checkoutUrl, isRedirecting, redirectToCheckout]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setValidationError(null);

    // Validate prerequisites
    const validation = validateCheckoutPrerequisites(selectedTierId, portraitId, email);
    if (!validation.valid) {
      setValidationError(validation.error!);
      return;
    }

    // Initiate checkout
    const result = await initiateCheckout({
      tierId: selectedTierId!,
      portraitId: portraitId!,
      customerEmail: email,
    });

    if (!result.success && result.error) {
      // Error is already set in the hook
      console.error("Checkout failed:", result.error);
    }
  };

  // Show loading state while redirecting
  if (isRedirecting || checkoutUrl) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Doorsturen naar Stripe...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Afronden bestelling</CardTitle>
          <CardDescription>
            Voer je e-mailadres in om de betaling te voltooien
          </CardDescription>
        </CardHeader>
        <CardContent>
          {cancelled && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-800">
              Je betaling is geannuleerd. Je kunt het opnieuw proberen.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium mb-1"
              >
                E-mailadres
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jouw@email.nl"
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={isLoading}
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                We sturen je bestelbevestiging en downloadlink naar dit adres
              </p>
            </div>

            {(validationError || error) && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-600">
                {validationError || error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Even geduld...
                </>
              ) : (
                "Doorgaan naar betaling"
              )}
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t text-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/create/pricing")}
              disabled={isLoading}
            >
              Terug naar pakketten
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
