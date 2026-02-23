import * as React from "react";
import { Body, Container, Head, Heading, Hr, Html, Preview, Section, Text } from "@react-email/components";

interface OrderConfirmationEmailProps {
  klantNaam?: string;
  orderNummer: string;
  pakketNaam: string;
  bedrag: string;
}

export function OrderConfirmationEmail({
  klantNaam,
  orderNummer,
  pakketNaam,
  bedrag,
}: OrderConfirmationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Bestelbevestiging RoyalPets.nl - bestelling {orderNummer}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Bedankt voor je bestelling! 👑</Heading>
          <Text style={text}>Hallo {klantNaam || "dierenvriend"},</Text>
          <Text style={text}>
            We hebben je bestelling goed ontvangen. Ons systeem gaat direct aan de slag met jouw koninklijke portret.
          </Text>

          <Section style={card}>
            <Text style={label}>Bestelnummer</Text>
            <Text style={value}>{orderNummer}</Text>

            <Text style={label}>Gekozen pakket</Text>
            <Text style={value}>{pakketNaam}</Text>

            <Text style={label}>Totaalbedrag</Text>
            <Text style={value}>{bedrag}</Text>
          </Section>

          <Hr style={hr} />

          <Text style={text}>Je ontvangt van ons automatisch een e-mail zodra je portret klaarstaat.</Text>
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
const card = { backgroundColor: "#faf7ff", border: "1px solid #e9ddff", borderRadius: "8px", padding: "16px" };
const label = { color: "#6b7280", fontSize: "12px", marginBottom: "4px" };
const value = { color: "#111827", fontSize: "16px", fontWeight: "bold", marginTop: "0", marginBottom: "12px" };
const hr = { borderColor: "#e5e7eb", margin: "20px 0" };
const footer = { color: "#6b7280", fontSize: "14px" };
