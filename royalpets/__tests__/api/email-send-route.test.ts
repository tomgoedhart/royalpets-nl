import { NextRequest } from "next/server";
import { POST } from "@/app/api/email/send/route";
import { sendTemplateEmail } from "@/lib/email";

jest.mock("@/lib/email", () => ({
  ...jest.requireActual("@/lib/email"),
  sendTemplateEmail: jest.fn(),
}));

describe("POST /api/email/send", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should validate required fields", async () => {
    const request = new NextRequest("http://localhost:3000/api/email/send", {
      method: "POST",
      body: JSON.stringify({ template: "welcome" }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.success).toBe(false);
  });

  it("should send an email for valid payload", async () => {
    (sendTemplateEmail as jest.Mock).mockResolvedValue({ id: "email_123" });

    const request = new NextRequest("http://localhost:3000/api/email/send", {
      method: "POST",
      body: JSON.stringify({
        to: "klant@voorbeeld.nl",
        template: "welcome",
        klantNaam: "Pieter",
      }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(sendTemplateEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "klant@voorbeeld.nl",
        template: "welcome",
      })
    );
  });
});
