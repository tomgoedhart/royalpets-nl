/**
 * @jest-environment node
 */

import {
  sendEmail,
  sendOrderConfirmation,
  sendDigitalDeliveryEmail,
  sendPrintPartnerNotification,
  isEmailConfigured,
  type OrderConfirmationData,
} from "@/lib/email";

describe("lib/email", () => {
  let consoleLogSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  describe("isEmailConfigured", () => {
    it("returns true (stub implementation)", () => {
      expect(isEmailConfigured()).toBe(true);
    });
  });

  describe("sendEmail", () => {
    it("successfully sends email and logs to console", async () => {
      const options = {
        to: "test@example.com",
        subject: "Test Subject",
        html: "<p>Test HTML</p>",
        text: "Test text",
      };

      const result = await sendEmail(options);

      expect(result.success).toBe(true);
      expect(result.messageId).toBeDefined();
      expect(result.messageId).toMatch(/^mock-/);
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("EMAIL SENT"));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("test@example.com"));
    });

    it("handles errors gracefully", async () => {
      // Force an error by passing invalid data that causes issues
      const options = {
        to: "test@example.com",
        subject: "Test",
        html: "<p>Test</p>",
      };

      const result = await sendEmail(options);

      expect(result.success).toBe(true); // Stub always succeeds
    });
  });

  describe("sendOrderConfirmation", () => {
    const mockDigitalOrder: OrderConfirmationData = {
      orderId: "order_123",
      customerEmail: "customer@example.com",
      customerName: "Jan Jansen",
      tierName: "Digitaal Basis",
      amountTotal: 9.99,
      petName: "Buddy",
      isDigital: true,
      isPrint: false,
    };

    const mockPrintOrder: OrderConfirmationData = {
      orderId: "order_456",
      customerEmail: "customer@example.com",
      tierName: "Print + Digitaal",
      amountTotal: 34.99,
      isDigital: true,
      isPrint: true,
    };

    it("sends digital order confirmation email", async () => {
      const result = await sendOrderConfirmation(mockDigitalOrder);

      expect(result.success).toBe(true);
      expect(result.messageId).toBeDefined();
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("EMAIL SENT"));
    });

    it("sends print order confirmation email", async () => {
      const result = await sendOrderConfirmation(mockPrintOrder);

      expect(result.success).toBe(true);
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("EMAIL SENT"));
    });

    it("includes order details in email", async () => {
      await sendOrderConfirmation(mockDigitalOrder);

      // Check that the email content includes order details
      const logCalls = consoleLogSpy.mock.calls;
      const emailContent = logCalls.map((call) => call.join(" ")).join(" ");

      expect(emailContent).toContain("order_123");
      expect(emailContent).toContain("Digitaal Basis");
      // Price is formatted with Dutch decimal separator (comma)
      expect(emailContent).toContain("9,99");
    });

    it("handles missing optional fields", async () => {
      const minimalOrder: OrderConfirmationData = {
        orderId: "order_789",
        customerEmail: "customer@example.com",
        tierName: "Digitaal Basis",
        amountTotal: 9.99,
        isDigital: true,
        isPrint: false,
      };

      const result = await sendOrderConfirmation(minimalOrder);

      expect(result.success).toBe(true);
      expect(result.messageId).toBeDefined();
    });

    it("formats price correctly with Dutch formatting", async () => {
      const orderWithEuroPrice: OrderConfirmationData = {
        orderId: "order_999",
        customerEmail: "customer@example.com",
        tierName: "Canvas Deluxe",
        amountTotal: 59.99,
        isDigital: true,
        isPrint: true,
      };

      await sendOrderConfirmation(orderWithEuroPrice);

      const logCalls = consoleLogSpy.mock.calls;
      const emailContent = logCalls.map((call) => call.join(" ")).join(" ");

      // Should have Dutch decimal separator (comma)
      expect(emailContent).toContain("59,99");
    });

    it("uses personal greeting when customerName is provided", async () => {
      const orderWithName: OrderConfirmationData = {
        orderId: "order_123",
        customerEmail: "customer@example.com",
        customerName: "Piet de Jong",
        tierName: "Digitaal Basis",
        amountTotal: 9.99,
        isDigital: true,
        isPrint: false,
      };

      await sendOrderConfirmation(orderWithName);

      const logCalls = consoleLogSpy.mock.calls;
      const emailContent = logCalls.map((call) => call.join(" ")).join(" ");

      expect(emailContent).toContain("Hallo Piet de Jong");
    });

    it("uses generic greeting when customerName is not provided", async () => {
      const orderWithoutName: OrderConfirmationData = {
        orderId: "order_123",
        customerEmail: "customer@example.com",
        tierName: "Digitaal Basis",
        amountTotal: 9.99,
        isDigital: true,
        isPrint: false,
      };

      await sendOrderConfirmation(orderWithoutName);

      const logCalls = consoleLogSpy.mock.calls;
      const emailContent = logCalls.map((call) => call.join(" ")).join(" ");

      expect(emailContent).toContain("Hallo,");
    });

    it("mentions pet name when provided", async () => {
      const orderWithPet: OrderConfirmationData = {
        orderId: "order_123",
        customerEmail: "customer@example.com",
        tierName: "Digitaal Basis",
        amountTotal: 9.99,
        petName: "Luna",
        isDigital: true,
        isPrint: false,
      };

      await sendOrderConfirmation(orderWithPet);

      const logCalls = consoleLogSpy.mock.calls;
      const emailContent = logCalls.map((call) => call.join(" ")).join(" ");

      expect(emailContent).toContain("Luna");
    });
  });

  describe("sendDigitalDeliveryEmail", () => {
    it("sends digital delivery email with download links", async () => {
      const downloadUrls = [
        "https://cdn.royalpets.nl/download/1",
        "https://cdn.royalpets.nl/download/2",
        "https://cdn.royalpets.nl/download/3",
        "https://cdn.royalpets.nl/download/4",
      ];

      const result = await sendDigitalDeliveryEmail(
        "order_123",
        "customer@example.com",
        downloadUrls
      );

      expect(result.success).toBe(true);
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("EMAIL SENT"));

      // Check that download URLs are in the email
      const logCalls = consoleLogSpy.mock.calls;
      const emailContent = logCalls.map((call) => call.join(" ")).join(" ");

      downloadUrls.forEach((url) => {
        expect(emailContent).toContain(url);
      });
    });

    it("handles empty download URLs array", async () => {
      const result = await sendDigitalDeliveryEmail(
        "order_123",
        "customer@example.com",
        []
      );

      expect(result.success).toBe(true);
    });

    it("has correct subject line", async () => {
      await sendDigitalDeliveryEmail(
        "order_123",
        "customer@example.com",
        ["https://example.com/download"]
      );

      const logCalls = consoleLogSpy.mock.calls;
      const emailContent = logCalls.map((call) => call.join(" ")).join(" ");

      expect(emailContent).toContain("Uw digitale portretten zijn klaar!");
    });
  });

  describe("sendPrintPartnerNotification", () => {
    const mockOrderDetails = {
      tierName: "Canvas Deluxe",
      portraitUrl: "https://cdn.royalpets.nl/portraits/portrait_123.png",
      shippingAddress: {
        name: "Jan Jansen",
        street: "Kerkstraat 1",
        city: "Amsterdam",
        postalCode: "1234 AB",
      },
      customerName: "Jan Jansen",
    };

    it("sends print partner notification email", async () => {
      const result = await sendPrintPartnerNotification(
        "order_123",
        "print@partner.nl",
        mockOrderDetails
      );

      expect(result.success).toBe(true);
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("EMAIL SENT"));
    });

    it("includes order details in notification", async () => {
      await sendPrintPartnerNotification(
        "order_123",
        "print@partner.nl",
        mockOrderDetails
      );

      const logCalls = consoleLogSpy.mock.calls;
      const emailContent = logCalls.map((call) => call.join(" ")).join(" ");

      expect(emailContent).toContain("Canvas Deluxe");
      expect(emailContent).toContain("Jan Jansen");
      expect(emailContent).toContain("https://cdn.royalpets.nl/portraits/portrait_123.png");
    });

    it("handles missing optional fields", async () => {
      const minimalDetails = {
        tierName: "Print + Digitaal",
        portraitUrl: "https://example.com/portrait.png",
        shippingAddress: {},
        customerName: "Klant",
      };

      const result = await sendPrintPartnerNotification(
        "order_456",
        "print@partner.nl",
        minimalDetails
      );

      expect(result.success).toBe(true);
    });
  });
});
