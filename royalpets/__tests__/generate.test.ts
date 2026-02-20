import { NextRequest } from "next/server";
import { POST, OPTIONS } from "@/app/api/generate/route";
import { isOpenAIConfigured, generateImageVariations, downloadImage } from "@/lib/openai";
import { uploadFile } from "@/lib/r2";
import { createServiceRoleClient } from "@/lib/supabase";
import { checkRateLimit, getClientIP, getRateLimitHeaders, resetRateLimit } from "@/lib/rate-limit";
import { isValidCostumeId, generateCostumePrompt } from "@/lib/prompts";

// Mock dependencies
jest.mock("@/lib/openai");
jest.mock("@/lib/r2");
jest.mock("@/lib/supabase");
jest.mock("@/lib/rate-limit", () => ({
  ...jest.requireActual("@/lib/rate-limit"),
  checkRateLimit: jest.fn(),
  getClientIP: jest.fn(),
  getRateLimitHeaders: jest.fn(),
  resetRateLimit: jest.fn(),
}));
jest.mock("@/lib/prompts", () => ({
  ...jest.requireActual("@/lib/prompts"),
  isValidCostumeId: jest.fn(),
  generateCostumePrompt: jest.fn(),
}));

// Mock global fetch
global.fetch = jest.fn();

// Store original Date for restoration
const OriginalDate = global.Date;

// Mock Date.now for consistent testing - use a simpler approach
const MOCK_TIMESTAMP = 1704067200000; // 2024-01-01T00:00:00.000Z
beforeAll(() => {
  jest.spyOn(Date, 'now').mockReturnValue(MOCK_TIMESTAMP);
});

afterAll(() => {
  jest.restoreAllMocks();
});

describe("Generate API - Configuration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 503 when OpenAI is not configured", async () => {
    (isOpenAIConfigured as jest.Mock).mockReturnValue(false);

    const request = new NextRequest("http://localhost:3000/api/generate", {
      method: "POST",
      body: JSON.stringify({
        imageUrl: "https://example.com/image.jpg",
        costumeId: "koning",
      }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body.success).toBe(false);
    expect(body.message).toContain("not configured");
  });
});

describe("Generate API - Rate Limiting", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (isOpenAIConfigured as jest.Mock).mockReturnValue(true);
    (generateCostumePrompt as jest.Mock).mockReturnValue("A majestic royal portrait prompt");
  });

  it("should apply rate limiting based on IP", async () => {
    (getClientIP as jest.Mock).mockReturnValue("192.168.1.1");
    (checkRateLimit as jest.Mock).mockReturnValue({
      allowed: false,
      limit: 5,
      remaining: 0,
      resetAt: Date.now() + 3600000,
      retryAfter: 3600,
    });

    const request = new NextRequest("http://localhost:3000/api/generate", {
      method: "POST",
      body: JSON.stringify({
        imageUrl: "https://example.com/image.jpg",
        costumeId: "koning",
      }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(429);
    expect(body.success).toBe(false);
    expect(body.message).toContain("Rate limit exceeded");
    expect(response.headers.get("Retry-After")).toBe("3600");
  });

  it("should include rate limit headers on successful requests", async () => {
    (getClientIP as jest.Mock).mockReturnValue("192.168.1.1");
    (checkRateLimit as jest.Mock).mockReturnValue({
      allowed: true,
      limit: 5,
      remaining: 4,
      resetAt: Date.now() + 3600000,
    });
    (getRateLimitHeaders as jest.Mock).mockReturnValue({
      "X-RateLimit-Limit": "5",
      "X-RateLimit-Remaining": "4",
      "X-RateLimit-Reset": String(Math.ceil((Date.now() + 3600000) / 1000)),
    });
    (isValidCostumeId as jest.Mock).mockReturnValue(true);

    const mockSupabase = {
      from: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: { id: "test-id" }, error: null }),
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValue({ error: null }),
    };
    (createServiceRoleClient as jest.Mock).mockReturnValue(mockSupabase);

    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      headers: new Headers({ "content-type": "image/jpeg" }),
      arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(100)),
    });

    (generateImageVariations as jest.Mock).mockResolvedValue([
      { url: "https://openai.com/img1.png" },
      { url: "https://openai.com/img2.png" },
      { url: "https://openai.com/img3.png" },
      { url: "https://openai.com/img4.png" },
    ]);

    (downloadImage as jest.Mock).mockResolvedValue(Buffer.from("fake-image"));
    (uploadFile as jest.Mock).mockResolvedValue({
      key: "portraits/test.png",
      publicUrl: "https://r2.com/portraits/test.png",
    });

    const request = new NextRequest("http://localhost:3000/api/generate", {
      method: "POST",
      body: JSON.stringify({
        imageUrl: "https://example.com/image.jpg",
        costumeId: "koning",
      }),
    });

    const response = await POST(request);

    expect(response.headers.get("X-RateLimit-Limit")).toBe("5");
    expect(response.headers.get("X-RateLimit-Remaining")).toBe("4");
  });
});

describe("Generate API - Input Validation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (isOpenAIConfigured as jest.Mock).mockReturnValue(true);
    (getClientIP as jest.Mock).mockReturnValue("192.168.1.1");
    (checkRateLimit as jest.Mock).mockReturnValue({
      allowed: true,
      limit: 5,
      remaining: 4,
      resetAt: Date.now() + 3600000,
    });
  });

  it("should reject invalid JSON", async () => {
    const request = new NextRequest("http://localhost:3000/api/generate", {
      method: "POST",
      body: "not valid json",
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.success).toBe(false);
    expect(body.message).toContain("Invalid JSON");
  });

  it("should require imageUrl", async () => {
    const request = new NextRequest("http://localhost:3000/api/generate", {
      method: "POST",
      body: JSON.stringify({ costumeId: "koning" }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.errors).toContain("imageUrl is required and must be a string");
  });

  it("should require valid URL for imageUrl", async () => {
    const request = new NextRequest("http://localhost:3000/api/generate", {
      method: "POST",
      body: JSON.stringify({
        imageUrl: "not-a-valid-url",
        costumeId: "koning",
      }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.errors).toContain("imageUrl must be a valid URL");
  });

  it("should require costumeId", async () => {
    const request = new NextRequest("http://localhost:3000/api/generate", {
      method: "POST",
      body: JSON.stringify({
        imageUrl: "https://example.com/image.jpg",
      }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.errors).toContain("costumeId is required and must be a string");
  });

  it("should validate costumeId exists", async () => {
    (isValidCostumeId as jest.Mock).mockReturnValue(false);

    const request = new NextRequest("http://localhost:3000/api/generate", {
      method: "POST",
      body: JSON.stringify({
        imageUrl: "https://example.com/image.jpg",
        costumeId: "invalid-costume",
      }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.errors).toContain("Invalid costumeId: invalid-costume");
  });

  it("should validate petType if provided", async () => {
    const request = new NextRequest("http://localhost:3000/api/generate", {
      method: "POST",
      body: JSON.stringify({
        imageUrl: "https://example.com/image.jpg",
        costumeId: "koning",
        petType: "bird",
      }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.errors).toContain("petType must be one of: dog, cat, other");
  });

  it("should accept valid dog petType", async () => {
    (isValidCostumeId as jest.Mock).mockReturnValue(true);

    const mockSupabase = {
      from: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: { id: "test-id" }, error: null }),
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValue({ error: null }),
    };
    (createServiceRoleClient as jest.Mock).mockReturnValue(mockSupabase);

    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      headers: new Headers({ "content-type": "image/jpeg" }),
      arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(100)),
    });

    (generateImageVariations as jest.Mock).mockResolvedValue([
      { url: "https://openai.com/img1.png" },
      { url: "https://openai.com/img2.png" },
      { url: "https://openai.com/img3.png" },
      { url: "https://openai.com/img4.png" },
    ]);

    (downloadImage as jest.Mock).mockResolvedValue(Buffer.from("fake-image"));
    (uploadFile as jest.Mock).mockResolvedValue({
      key: "portraits/test.png",
      publicUrl: "https://r2.com/portraits/test.png",
    });

    const request = new NextRequest("http://localhost:3000/api/generate", {
      method: "POST",
      body: JSON.stringify({
        imageUrl: "https://example.com/image.jpg",
        costumeId: "koning",
        petType: "dog",
      }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(body.success).toBe(true);
  });
});

describe("Generate API - Image Generation Flow", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (isOpenAIConfigured as jest.Mock).mockReturnValue(true);
    (getClientIP as jest.Mock).mockReturnValue("192.168.1.1");
    (checkRateLimit as jest.Mock).mockReturnValue({
      allowed: true,
      limit: 5,
      remaining: 4,
      resetAt: Date.now() + 3600000,
    });
    (isValidCostumeId as jest.Mock).mockReturnValue(true);
    (generateCostumePrompt as jest.Mock).mockReturnValue("A majestic royal portrait prompt");
  });

  it("should create portrait record with pending status", async () => {
    const mockSupabase = {
      from: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: { id: "portrait-123" }, error: null }),
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValue({ error: null }),
    };
    (createServiceRoleClient as jest.Mock).mockReturnValue(mockSupabase);

    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      headers: new Headers({ "content-type": "image/jpeg" }),
      arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(100)),
    });

    (generateImageVariations as jest.Mock).mockResolvedValue([
      { url: "https://openai.com/img1.png" },
      { url: "https://openai.com/img2.png" },
      { url: "https://openai.com/img3.png" },
      { url: "https://openai.com/img4.png" },
    ]);

    (downloadImage as jest.Mock).mockResolvedValue(Buffer.from("fake-image"));
    (uploadFile as jest.Mock).mockResolvedValue({
      key: "portraits/test.png",
      publicUrl: "https://r2.com/portraits/test.png",
    });

    const request = new NextRequest("http://localhost:3000/api/generate", {
      method: "POST",
      body: JSON.stringify({
        imageUrl: "https://r2.com/uploads/image.jpg",
        costumeId: "koning",
        petName: "Buddy",
        sessionId: "session-123",
      }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(mockSupabase.from).toHaveBeenCalledWith("portraits");
    expect(mockSupabase.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        original_image_url: "https://r2.com/uploads/image.jpg",
        costume_id: "koning",
        pet_name: "Buddy",
        session_id: "session-123",
        status: "generating",
      })
    );
    expect(body.success).toBe(true);
    expect(body.portraitId).toBe("portrait-123");
  });

  it("should generate 4 image variations", async () => {
    const mockSupabase = {
      from: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: { id: "portrait-123" }, error: null }),
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValue({ error: null }),
    };
    (createServiceRoleClient as jest.Mock).mockReturnValue(mockSupabase);

    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      headers: new Headers({ "content-type": "image/jpeg" }),
      arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(100)),
    });

    (generateImageVariations as jest.Mock).mockResolvedValue([
      { url: "https://openai.com/img1.png" },
      { url: "https://openai.com/img2.png" },
      { url: "https://openai.com/img3.png" },
      { url: "https://openai.com/img4.png" },
    ]);

    (downloadImage as jest.Mock).mockResolvedValue(Buffer.from("fake-image"));
    (uploadFile as jest.Mock).mockResolvedValue({
      key: "portraits/test.png",
      publicUrl: "https://r2.com/portraits/test.png",
    });

    const request = new NextRequest("http://localhost:3000/api/generate", {
      method: "POST",
      body: JSON.stringify({
        imageUrl: "https://r2.com/uploads/image.jpg",
        costumeId: "koning",
      }),
    });

    await POST(request);

    expect(generateImageVariations).toHaveBeenCalledWith(expect.any(String), 4);
    expect(uploadFile).toHaveBeenCalledTimes(4);
  });

  it("should return generated image URLs", async () => {
    const mockSupabase = {
      from: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: { id: "portrait-123" }, error: null }),
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValue({ error: null }),
    };
    (createServiceRoleClient as jest.Mock).mockReturnValue(mockSupabase);

    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      headers: new Headers({ "content-type": "image/jpeg" }),
      arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(100)),
    });

    (generateImageVariations as jest.Mock).mockResolvedValue([
      { url: "https://openai.com/img1.png" },
      { url: "https://openai.com/img2.png" },
      { url: "https://openai.com/img3.png" },
      { url: "https://openai.com/img4.png" },
    ]);

    (downloadImage as jest.Mock).mockResolvedValue(Buffer.from("fake-image"));
    (uploadFile as jest.Mock).mockResolvedValue({
      key: "portraits/test.png",
      publicUrl: "https://r2.com/portraits/test.png",
    });

    const request = new NextRequest("http://localhost:3000/api/generate", {
      method: "POST",
      body: JSON.stringify({
        imageUrl: "https://r2.com/uploads/image.jpg",
        costumeId: "koning",
      }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(body.success).toBe(true);
    expect(body.images).toHaveLength(4);
    expect(body.images![0]).toBe("https://r2.com/portraits/test.png");
  });

  it("should handle OpenAI generation errors", async () => {
    const mockSupabase = {
      from: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: { id: "portrait-123" }, error: null }),
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValue({ error: null }),
    };
    (createServiceRoleClient as jest.Mock).mockReturnValue(mockSupabase);

    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      headers: new Headers({ "content-type": "image/jpeg" }),
      arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(100)),
    });

    (generateImageVariations as jest.Mock).mockRejectedValue(
      new Error("OpenAI API error: Rate limit exceeded")
    );

    const request = new NextRequest("http://localhost:3000/api/generate", {
      method: "POST",
      body: JSON.stringify({
        imageUrl: "https://r2.com/uploads/image.jpg",
        costumeId: "koning",
      }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.success).toBe(false);
    expect(body.message).toContain("OpenAI API error");
  });

  it("should handle image download failures", async () => {
    const mockSupabase = {
      from: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: { id: "portrait-123" }, error: null }),
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValue({ error: null }),
    };
    (createServiceRoleClient as jest.Mock).mockReturnValue(mockSupabase);

    (fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 404,
      statusText: "Not Found",
    });

    const request = new NextRequest("http://localhost:3000/api/generate", {
      method: "POST",
      body: JSON.stringify({
        imageUrl: "https://r2.com/uploads/nonexistent.jpg",
        costumeId: "koning",
      }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.success).toBe(false);
  });

  it("should update portrait record with completed status", async () => {
    const mockSupabase = {
      from: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: { id: "portrait-123" }, error: null }),
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValue({ error: null }),
    };
    (createServiceRoleClient as jest.Mock).mockReturnValue(mockSupabase);

    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      headers: new Headers({ "content-type": "image/jpeg" }),
      arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(100)),
    });

    (generateImageVariations as jest.Mock).mockResolvedValue([
      { url: "https://openai.com/img1.png" },
      { url: "https://openai.com/img2.png" },
      { url: "https://openai.com/img3.png" },
      { url: "https://openai.com/img4.png" },
    ]);

    (downloadImage as jest.Mock).mockResolvedValue(Buffer.from("fake-image"));
    (uploadFile as jest.Mock).mockResolvedValue({
      key: "portraits/test.png",
      publicUrl: "https://r2.com/portraits/test.png",
    });

    const request = new NextRequest("http://localhost:3000/api/generate", {
      method: "POST",
      body: JSON.stringify({
        imageUrl: "https://r2.com/uploads/image.jpg",
        costumeId: "koning",
      }),
    });

    await POST(request);

    expect(mockSupabase.update).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "completed",
        generated_images: expect.arrayContaining([
          expect.objectContaining({
            index: expect.any(Number),
            url: expect.any(String),
            path: expect.any(String),
          }),
        ]),
      })
    );
  });

  it("should update portrait record with error status on failure", async () => {
    const mockSupabase = {
      from: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: { id: "portrait-123" }, error: null }),
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValue({ error: null }),
    };
    (createServiceRoleClient as jest.Mock).mockReturnValue(mockSupabase);

    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      headers: new Headers({ "content-type": "image/jpeg" }),
      arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(100)),
    });

    (generateImageVariations as jest.Mock).mockRejectedValue(new Error("Generation failed"));

    const request = new NextRequest("http://localhost:3000/api/generate", {
      method: "POST",
      body: JSON.stringify({
        imageUrl: "https://r2.com/uploads/image.jpg",
        costumeId: "koning",
      }),
    });

    await POST(request);

    expect(mockSupabase.update).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "failed",
        generation_error: "Generation failed",
      })
    );
  });
});

describe("Generate API - CORS", () => {
  it("should handle OPTIONS request for CORS preflight", async () => {
    const response = await OPTIONS();

    expect(response.status).toBe(204);
    expect(response.headers.get("Access-Control-Allow-Origin")).toBe("*");
    expect(response.headers.get("Access-Control-Allow-Methods")).toContain("POST");
  });
});

describe("Prompts Library", () => {
  beforeEach(() => {
    jest.unmock("@/lib/prompts");
  });

  it("should export COSTUME_TEMPLATES", async () => {
    const { COSTUME_TEMPLATES } = await import("@/lib/prompts");
    expect(COSTUME_TEMPLATES).toBeDefined();
    expect(COSTUME_TEMPLATES["koning"]).toBeDefined();
    expect(COSTUME_TEMPLATES["koningin"]).toBeDefined();
  });

  it("should export generateCostumePrompt function", async () => {
    const { generateCostumePrompt } = await import("@/lib/prompts");
    expect(typeof generateCostumePrompt).toBe("function");
  });

  it("should export isValidCostumeId function", async () => {
    const { isValidCostumeId } = await import("@/lib/prompts");
    expect(typeof isValidCostumeId).toBe("function");
    expect(isValidCostumeId("koning")).toBe(true);
    expect(isValidCostumeId("invalid")).toBe(false);
  });
});
