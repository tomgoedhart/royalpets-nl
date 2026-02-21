import { NextRequest, NextResponse } from "next/server";
import { sendTemplateEmail, type EmailTemplateType } from "@/lib/email";

interface SendEmailBody {
  to: string;
  template: EmailTemplateType;
  klantNaam?: string;
  orderNummer?: string;
  downloadUrl?: string;
  trackingUrl?: string;
  pakketNaam?: string;
  bedrag?: string;
}

export async function POST(req: NextRequest) {
  const internalApiKey = process.env.INTERNAL_API_KEY;
  const requestKey = req.headers.get("x-internal-api-key");

  if (process.env.NODE_ENV !== "test" && internalApiKey && requestKey !== internalApiKey) {
    return NextResponse.json({ success: false, message: "Niet geautoriseerd" }, { status: 401 });
  }

  let body: SendEmailBody;
  try {
    body = (await req.json()) as SendEmailBody;
  } catch {
    return NextResponse.json({ success: false, message: "Ongeldige JSON" }, { status: 400 });
  }

  if (!body.to || !body.template) {
    return NextResponse.json({ success: false, message: "Velden 'to' en 'template' zijn verplicht" }, { status: 400 });
  }

  const result = await sendTemplateEmail(body);

  return NextResponse.json({ success: true, result });
}
