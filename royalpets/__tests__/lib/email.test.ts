jest.mock("@react-email/render", () => ({
  render: jest.fn(async () => "<html><body>RoyalPets</body></html>"),
}));

import { getEmailTemplate, sendTemplateEmail, type EmailTemplateType } from "@/lib/email";

describe("Email templates", () => {
  const allTemplates: EmailTemplateType[] = [
    "order-confirmation",
    "digital-ready",
    "print-received",
    "shipped",
    "delivered",
    "welcome",
  ];

  it("should generate all required Dutch templates", async () => {
    for (const template of allTemplates) {
      const result = await getEmailTemplate({
        to: "klant@voorbeeld.nl",
        template,
        klantNaam: "Jan",
        orderNummer: "abc12345xyz",
        downloadUrl: "https://royalpets.nl/download/abc",
        trackingUrl: "https://postnl.nl/track/123",
        pakketNaam: "Digitaal Basis",
        bedrag: "€9,99",
      });

      expect(result.subject).toBeTruthy();
      expect(result.html).toContain("RoyalPets");
      expect(result.text).toBeTruthy();
    }
  });

  it("should format order reference in subject", async () => {
    const result = await getEmailTemplate({
      to: "klant@voorbeeld.nl",
      template: "order-confirmation",
      orderNummer: "abcdef123456",
    });

    expect(result.subject).toContain("#ABCDEF12");
  });

  it("should return mocked response in test environment", async () => {
    const result = await sendTemplateEmail({
      to: "klant@voorbeeld.nl",
      template: "welcome",
      klantNaam: "Sanne",
    });

    expect(result).toMatchObject({
      mocked: true,
      to: "klant@voorbeeld.nl",
    });
  });
});
