import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { XCircle, ArrowLeft, RefreshCw } from "lucide-react";

export const metadata = {
  title: "Betaling geannuleerd | RoyalPets",
  description: "Je betaling is geannuleerd. Je kunt het opnieuw proberen.",
};

export default function CheckoutCancelPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100">
            <XCircle className="h-8 w-8 text-yellow-600" />
          </div>
          <CardTitle className="text-xl">Betaling geannuleerd</CardTitle>
          <CardDescription>
            Je betaling is niet voltooid. Geen zorgen — je portret is bewaard en je kunt het opnieuw proberen.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted p-4 text-sm">
            <p className="font-medium mb-2">Wat kun je doen?</p>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="mt-1 block h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                Probeer het opnieuw met een andere betaalmethode
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 block h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                Controleer of je betaalgegevens correct zijn
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 block h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                Neem contact op als je problemen blijft houden
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-2">
            <Link href="/checkout?cancelled=true">
              <Button className="w-full">
                <RefreshCw className="mr-2 h-4 w-4" />
                Opnieuw proberen
              </Button>
            </Link>
            
            <Link href="/create/pricing">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Terug naar pakketten
              </Button>
            </Link>
          </div>

          <p className="text-center text-xs text-muted-foreground">
            Vragen? Neem contact op via{" "}
            <a href="mailto:support@royalpets.nl" className="underline">
              support@royalpets.nl
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
