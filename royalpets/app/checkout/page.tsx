import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import CheckoutForm from "./checkout-form";

export const metadata = {
  title: "Afronden bestelling | RoyalPets",
  description: "Voltooi je bestelling en ontvang je koninklijke huisdierportret",
};

function CheckoutLoading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Laden...</p>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<CheckoutLoading />}>
      <CheckoutForm />
    </Suspense>
  );
}
