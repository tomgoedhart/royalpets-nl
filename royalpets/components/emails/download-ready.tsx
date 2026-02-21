import * as React from "react";
import { Body, Button, Container, Head, Heading, Html, Preview, Text } from "@react-email/components";

interface DownloadReadyEmailProps {
  klantNaam?: string;
  downloadUrl: string;
  orderNummer: string;
}

export function DownloadReadyEmail({ klantNaam, downloadUrl, orderNummer }: DownloadReadyEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Je digitale portret staat klaar om te downloaden</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Je portret is klaar! 🎉</Heading>
          <Text style={text}>Hallo {klantNaam || "dierenvriend"},</Text>
          <Text style={text}>Goed nieuws: jouw digitale portret voor bestelling {orderNummer} staat klaar.</Text>
          <Button href={downloadUrl} style={button}>
            Download je portret
          </Button>
          <Text style={text}>Deze link is tijdelijk geldig. Sla je bestand dus meteen veilig op.</Text>
          <Text style={footer}>Met koninklijke groet, team RoyalPets.nl</Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = { backgroundColor: "#f6f2ff", fontFamily: "Arial, sans-serif" };
const container = { margin: "0 auto", padding: "24px", backgroundColor: "#ffffff" };
const heading = { color: "#4b2e83", fontSize: "24px" };
const text = { color: "#1f2937", fontSize: "16px", lineHeight: "24px" };
const button = { backgroundColor: "#4b2e83", color: "#ffffff", padding: "12px 18px", borderRadius: "8px", textDecoration: "none", display: "inline-block" };
const footer = { color: "#6b7280", fontSize: "14px", marginTop: "24px" };
