import * as React from "react";
import { render } from "@react-email/render";
import { DownloadReadyEmail } from "@/components/emails/download-ready";
import { OrderConfirmationEmail } from "@/components/emails/order-confirmation";

const fromEmail = process.env.EMAIL_FROM || "RoyalPets <bestellingen@royalpets.nl>";

export type EmailTemplateType =
  | "order-confirmation"
  | "digital-ready"
  | "print-received"
  | "shipped"
  | "delivered"
  | "welcome";

export interface SendTemplateEmailInput {
  to: string;
  template: EmailTemplateType;
  klantNaam?: string;
  orderNummer?: string;
  downloadUrl?: string;
  trackingUrl?: string;
  pakketNaam?: string;
  bedrag?: string;
}

function getOrderReference(orderNummer?: string): string {
  return orderNummer ? orderNummer.slice(0, 8).toUpperCase() : "ONBEKEND";
}

function renderSimpleTemplate(subject: string, body: string) {
  const html = `
    <html>
      <body style="font-family: Arial, sans-serif; background:#f6f2ff; padding:24px;">
        <div style="max-width:560px; margin:0 auto; background:#fff; padding:24px; border-radius:8px;">
          <h1 style="color:#4b2e83; font-size:22px;">${subject}</h1>
          <p style="font-size:16px; color:#1f2937; line-height:1.5;">${body}</p>
          <p style="font-size:14px; color:#6b7280;">Met koninklijke groet, team RoyalPets.nl</p>
        </div>
      </body>
    </html>
  `;
  return { html, text: body };
}

export async function getEmailTemplate(input: SendTemplateEmailInput): Promise<{
  subject: string;
  html: string;
  text: string;
}> {
  const naam = input.klantNaam || "dierenvriend";
  const referentie = getOrderReference(input.orderNummer);

  switch (input.template) {
    case "order-confirmation": {
      const subject = `Bestelbevestiging RoyalPets.nl #${referentie}`;
      const html = await render(
        React.createElement(OrderConfirmationEmail, {
          klantNaam: naam,
          orderNummer: input.orderNummer || "onbekend",
          pakketNaam: input.pakketNaam || "Digitaal Basis",
          bedrag: input.bedrag || "€0,00",
        })
      );
      const text = `Hallo ${naam}, we hebben je bestelling ${input.orderNummer || "onbekend"} ontvangen.`;
      return { subject, html, text };
    }

    case "digital-ready": {
      const subject = `Je digitale portret is klaar #${referentie}`;
      const html = await render(
        React.createElement(DownloadReadyEmail, {
          klantNaam: naam,
          downloadUrl: input.downloadUrl || "https://royalpets.nl",
          orderNummer: input.orderNummer || "onbekend",
        })
      );
      const text = `Hallo ${naam}, je digitale portret staat klaar. Download: ${input.downloadUrl || "https://royalpets.nl"}`;
      return { subject, html, text };
    }

    case "print-received":
      return {
        subject: `Je printbestelling is ontvangen #${referentie}`,
        ...renderSimpleTemplate(
          "We hebben je printbestelling ontvangen",
          `Hallo ${naam}, we hebben je printbestelling ontvangen en sturen deze door naar onze printpartner.`
        ),
      };

    case "shipped":
      return {
        subject: `Je bestelling is verzonden #${referentie}`,
        ...renderSimpleTemplate(
          "Je bestelling is onderweg",
          `Hallo ${naam}, je bestelling is verzonden. Volg je pakket via: ${input.trackingUrl || "tracking volgt per e-mail"}`
        ),
      };

    case "delivered":
      return {
        subject: `Je bestelling is bezorgd #${referentie}`,
        ...renderSimpleTemplate(
          "Veel plezier met je portret",
          `Hallo ${naam}, je bestelling is bezorgd. We hopen dat je geniet van je koninklijke portret!`
        ),
      };

    case "welcome":
      return {
        subject: "Welkom bij RoyalPets.nl 👑",
        ...renderSimpleTemplate(
          "Welkom bij RoyalPets.nl",
          `Hallo ${naam}, leuk dat je er bent! Upload je favoriete foto en maak een koninklijk portret van je huisdier.`
        ),
      };
  }
}

export async function sendTemplateEmail(input: SendTemplateEmailInput) {
  const { subject, html, text } = await getEmailTemplate(input);

  if (!process.env.RESEND_API_KEY || process.env.NODE_ENV === "test") {
    return {
      mocked: true,
      to: input.to,
      subject,
      html,
      text,
    };
  }

  const { Resend } = await import("resend");
  const resend = new Resend(process.env.RESEND_API_KEY);

  return resend.emails.send({
    from: fromEmail,
    to: input.to,
    subject,
    html,
    text,
  });
}
