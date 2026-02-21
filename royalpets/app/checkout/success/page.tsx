import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Download, Mail } from "lucide-react";

export const metadata = {
  title: "Bestelling voltooid | RoyalPets",
  description: "Je betaling is succesvol voltooid. Bedankt voor je bestelling!",
};

interface CheckoutSuccessPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default function CheckoutSuccessPage({ searchParams }: CheckoutSuccessPageProps) {
  const sessionId = searchParams.session_id as string | undefined;

  return (
    <div className="min-h-[60vh] flex items-center justify-center py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-xl">Bedankt voor je bestelling!</CardTitle>
          <CardDescription>
            Je betaling is succesvol voltooid. Je ontvangt binnen enkele minuten een e-mail met je bestelbevestiging.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted p-4 text-sm">
            <p className="font-medium mb-2">Wat gebeurt er nu?</p>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start gap-2">
                <Mail className="mt-0.5 h-4 w-4 flex-shrink-0" />
                Je ontvangt een e-mail met je bestelbevestiging
              </li>
              <li className="flex items-start gap-2">
                <Download className="mt-0.5 h-4 w-4 flex-shrink-0" />
                Digitale bestanden zijn direct beschikbaar in je account
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 block h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                Print bestellingen worden binnen 1-2 werkdagen verzonden
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-2">
            <Link href="/account/orders">
              <Button className="w-full">
                <Download className="mr-2 h-4 w-4" />
                Naar mijn bestellingen
              </Button>
            </Link>
            
            <Link href="/">
              <Button variant="outline" className="w-full">
                Terug naar home
              </Button>
            </Link>
          </div>

          {sessionId && (
            <p className="text-center text-xs text-muted-foreground">
              Bestelnummer: {sessionId.slice(-8)}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
