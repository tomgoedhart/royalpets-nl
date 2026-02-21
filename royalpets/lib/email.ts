/**
 * Email Service for RoyalPets.nl
 * 
 * This module handles sending transactional emails.
 * Currently implements a stub that logs to console.
 * In production, this should be replaced with a real email provider like:
 * - Resend
 * - SendGrid
 * - Mailgun
 * - AWS SES
 */

import type { Database } from "@/types/supabase";

type Order = Database["public"]["Tables"]["orders"]["Row"];

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

export interface OrderConfirmationData {
  orderId: string;
  customerEmail: string;
  customerName?: string;
  tierName: string;
  amountTotal: number;
  portraitUrl?: string;
  petName?: string;
  isDigital: boolean;
  isPrint: boolean;
}

// Default from address
const DEFAULT_FROM = "RoyalPets <bestellingen@royalpets.nl>";

// App URL for links
const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://royalpets.nl";

/**
 * Check if email service is configured
 */
export function isEmailConfigured(): boolean {
  // For now, we just log to console
  // In production, check for email provider API key
  return true;
}

/**
 * Send an email
 * Stub implementation - logs to console
 * Replace with actual email provider integration
 */
export async function sendEmail(options: EmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    // Log email for development/testing
    console.log("=".repeat(60));
    console.log("📧 EMAIL SENT");
    console.log("=".repeat(60));
    console.log(`To: ${options.to}`);
    console.log(`From: ${options.from || DEFAULT_FROM}`);
    console.log(`Subject: ${options.subject}`);
    console.log("-".repeat(60));
    console.log(options.text || options.html);
    console.log("=".repeat(60));

    // TODO: Integrate with email provider
    // Example with Resend:
    // const resend = new Resend(process.env.RESEND_API_KEY);
    // const result = await resend.emails.send({
    //   from: options.from || DEFAULT_FROM,
    //   to: options.to,
    //   subject: options.subject,
    //   html: options.html,
    //   text: options.text,
    // });

    return {
      success: true,
      messageId: `mock-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Failed to send email:", errorMessage);
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Send order confirmation email
 */
export async function sendOrderConfirmation(data: OrderConfirmationData): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const subject = `Bevestiging bestelling ${data.orderId.substring(0, 8)} - RoyalPets`;
  
  const greeting = data.customerName 
    ? `Hallo ${data.customerName},` 
    : "Hallo,";
  
  const petText = data.petName 
    ? ` voor ${data.petName}` 
    : "";

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Bestelling bevestigd</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #D4AF37; color: white; padding: 20px; text-align: center; }
    .content { background: #f9f9f9; padding: 20px; margin: 20px 0; }
    .order-details { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #D4AF37; }
    .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
    .button { display: inline-block; background: #D4AF37; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 10px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🐾 RoyalPets</h1>
      <p>Uw koninklijke bestelling is bevestigd!</p>
    </div>
    
    <div class="content">
      <p>${greeting}</p>
      
      <p>Bedankt voor uw bestelling${petText}! We gaan direct aan de slag met het verwerken van uw koninklijke portret.</p>
      
      <div class="order-details">
        <h3>Bestelgegevens</h3>
        <p><strong>Bestelnummer:</strong> #${data.orderId.substring(0, 8)}</p>
        <p><strong>Pakket:</strong> ${data.tierName}</p>
        <p><strong>Bedrag:</strong> €${data.amountTotal.toFixed(2).replace(".", ",")}</p>
      </div>
      
      ${data.isDigital ? `
      <h3>📥 Download</h3>
      <p>Uw digitale bestanden zijn beschikbaar via uw account of via de onderstaande link:</p>
      <a href="${appUrl}/dashboard/orders/${data.orderId}" class="button">Bekijk bestelling</a>
      ` : ""}
      
      ${data.isPrint ? `
      <h3>🚚 Verzending</h3>
      <p>Uw print wordt met zorg verpakt en binnen 3-5 werkdagen verzonden. U ontvangt een track & trace code zodra het pakket onderweg is.</p>
      ` : ""}
      
      <h3>🎨 Wat gebeurt er nu?</h3>
      <ol>
        <li>We maken uw portret gereed voor levering</li>
        ${data.isPrint ? `<li>We printen uw portret op hoogwaardig materiaal</li>` : ""}
        <li>U ontvangt een e-mail zodra alles klaar is</li>
      </ol>
      
      <p>Hebt u vragen? Reageer op deze e-mail of contacteer ons via <a href="mailto:hallo@royalpets.nl">hallo@royalpets.nl</a>.</p>
    </div>
    
    <div class="footer">
      <p>RoyalPets.nl | Koninklijke huisdierportretten</p>
      <p>Dit is een automatisch bericht. Gelieve niet te antwoorden op deze e-mail.</p>
    </div>
  </div>
</body>
</html>
  `;

  const text = `
Bestelling bevestigd - RoyalPets

${greeting}

Bedankt voor uw bestelling${petText}! We gaan direct aan de slag met het verwerken van uw koninklijke portret.

BESTELGEGEVENS
Bestelnummer: #${data.orderId.substring(0, 8)}
Pakket: ${data.tierName}
Bedrag: €${data.amountTotal.toFixed(2).replace(".", ",")}

${data.isDigital ? `DOWNLOAD
Uw digitale bestanden zijn beschikbaar via: ${appUrl}/dashboard/orders/${data.orderId}\n` : ""}

${data.isPrint ? `VERZENDING
Uw print wordt binnen 3-5 werkdagen verzonden. U ontvangt een track & trace code.\n` : ""}

WAT GEBEURT ER NU?
1. We maken uw portret gereed voor levering
${data.isPrint ? `2. We printen uw portret op hoogwaardig materiaal\n` : ""}
${data.isPrint ? `3` : `2`}. U ontvangt een e-mail zodra alles klaar is

Vragen? Contacteer ons via hallo@royalpets.nl

RoyalPets.nl | Koninklijke huisdierportretten
  `;

  return sendEmail({
    to: data.customerEmail,
    subject,
    html,
    text,
    from: DEFAULT_FROM,
  });
}

/**
 * Send digital delivery email with download links
 */
export async function sendDigitalDeliveryEmail(
  orderId: string,
  customerEmail: string,
  downloadUrls: string[]
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const subject = `Uw digitale portretten zijn klaar! - RoyalPets`;

  const downloadLinks = downloadUrls
    .map((url, index) => `<li><a href="${url}" class="button">Portret ${index + 1} downloaden</a></li>`)
    .join("\n");

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Uw portretten zijn klaar</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #D4AF37; color: white; padding: 20px; text-align: center; }
    .content { background: #f9f9f9; padding: 20px; margin: 20px 0; }
    .downloads { background: white; padding: 15px; margin: 15px 0; }
    .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
    .button { display: inline-block; background: #D4AF37; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 10px 0; }
    .note { font-size: 12px; color: #666; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🐾 RoyalPets</h1>
      <p>Uw koninklijke portretten zijn klaar!</p>
    </div>
    
    <div class="content">
      <p>Hallo,</p>
      
      <p>Geweldig nieuws! Uw koninklijke huisdierportretten zijn gereed en klaar om gedownload te worden.</p>
      
      <div class="downloads">
        <h3>📥 Downloads</h3>
        <ul>
          ${downloadLinks}
        </ul>
        <p class="note">De downloadlinks zijn 30 dagen geldig.</p>
      </div>
      
      <p>Bedankt voor uw bestelling!</p>
      
      <p>Hebt u vragen? Contacteer ons via <a href="mailto:hallo@royalpets.nl">hallo@royalpets.nl</a>.</p>
    </div>
    
    <div class="footer">
      <p>RoyalPets.nl | Koninklijke huisdierportretten</p>
    </div>
  </div>
</body>
</html>
  `;

  const text = `
Uw digitale portretten zijn klaar! - RoyalPets

Hallo,

Geweldig nieuws! Uw koninklijke huisdierportretten zijn gereed en klaar om gedownload te worden.

DOWNLOADS
${downloadUrls.map((url, index) => `${index + 1}. ${url}`).join("\n")}

De downloadlinks zijn 30 dagen geldig.

Bedankt voor uw bestelling!

RoyalPets.nl
  `;

  return sendEmail({
    to: customerEmail,
    subject,
    html,
    text,
    from: DEFAULT_FROM,
  });
}

/**
 * Send print order confirmation to print partner
 */
export async function sendPrintPartnerNotification(
  orderId: string,
  printPartnerEmail: string,
  orderDetails: {
    tierName: string;
    portraitUrl: string;
    shippingAddress: Record<string, string>;
    customerName: string;
  }
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const subject = `Nieuwe print bestelling ${orderId.substring(0, 8)} - RoyalPets`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Nieuwe print bestelling</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #333; color: white; padding: 20px; text-align: center; }
    .content { background: #f9f9f9; padding: 20px; margin: 20px 0; }
    .details { background: white; padding: 15px; margin: 15px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>RoyalPets Print Partner</h1>
      <p>Nieuwe bestelling binnengekomen</p>
    </div>
    
    <div class="content">
      <div class="details">
        <h3>Bestelgegevens</h3>
        <p><strong>Bestelnummer:</strong> #${orderId.substring(0, 8)}</p>
        <p><strong>Product:</strong> ${orderDetails.tierName}</p>
        <p><strong>Klant:</strong> ${orderDetails.customerName}</p>
      </div>
      
      <div class="details">
        <h3>Verzendadres</h3>
        <pre>${JSON.stringify(orderDetails.shippingAddress, null, 2)}</pre>
      </div>
      
      <p>Portret afbeelding: <a href="${orderDetails.portraitUrl}">${orderDetails.portraitUrl}</a></p>
    </div>
  </div>
</body>
</html>
  `;

  return sendEmail({
    to: printPartnerEmail,
    subject,
    html,
    from: DEFAULT_FROM,
  });
}
