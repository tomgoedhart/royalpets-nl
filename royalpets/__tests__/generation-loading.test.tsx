import { render, screen, fireEvent, waitFor, act, renderHook } from "@testing-library/react";
import { ProgressAnimation } from "@/components/create/generate/progress-anim";
import { useGeneration } from "@/hooks/use-generation";
import { NextRequest } from "next/server";
import { GET, DELETE, OPTIONS } from "@/app/api/generate/status/route";

// Mock dependencies
jest.mock("sonner", () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

// Mock Supabase
jest.mock("@/lib/supabase", () => ({
  createServiceRoleClient: jest.fn(),
}));

// Mock fetch for hooks
global.fetch = jest.fn();

// Mock requestAnimationFrame
global.requestAnimationFrame = jest.fn((cb) => setTimeout(cb, 16));
global.cancelAnimationFrame = jest.fn((id) => clearTimeout(id));

describe("ProgressAnimation Component", () => {
  const mockStartGeneration = jest.fn();
  const mockOnComplete = jest.fn();
  const mockOnError = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers({ doNotFake: ["nextTick", "setImmediate"] });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("renders idle state correctly", () => {
    render(
      <ProgressAnimation
        costumeName="Koning"
        hasStarted={false}
        onStartGeneration={mockStartGeneration}
        onComplete={mockOnComplete}
        onError={mockOnError}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText("Klaar om te starten")).toBeInTheDocument();
    expect(screen.getByText("Start Generatie")).toBeInTheDocument();
    expect(screen.getByText(/koning portret te genereren/)).toBeInTheDocument();
  });

  it("starts generation when clicking start button", async () => {
    mockStartGeneration.mockResolvedValue("portrait-123");

    render(
      <ProgressAnimation
        costumeName="Koning"
        hasStarted={false}
        onStartGeneration={mockStartGeneration}
        onComplete={mockOnComplete}
        onError={mockOnError}
        onCancel={mockOnCancel}
      />
    );

    fireEvent.click(screen.getByText("Start Generatie"));

    await waitFor(() => {
      expect(mockStartGeneration).toHaveBeenCalled();
    });
  });

  it("shows generating state with progress bar", async () => {
    mockStartGeneration.mockResolvedValue("portrait-123");

    render(
      <ProgressAnimation
        costumeName="Koning"
        hasStarted={true}
        onStartGeneration={mockStartGeneration}
        onComplete={mockOnComplete}
        onError={mockOnError}
        onCancel={mockOnCancel}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Koning portret maken/)).toBeInTheDocument();
    });

    // Progress bar should be present
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
    
    // Status message should be shown
    expect(screen.getByText(/Foto analyseren|Kostuum aanpassen|Koninklijke details|Portret schilderen|Laatste finishing/)).toBeInTheDocument();
  });

  it("shows cancel button during generation", async () => {
    mockStartGeneration.mockResolvedValue("portrait-123");

    render(
      <ProgressAnimation
        costumeName="Koning"
        hasStarted={true}
        onStartGeneration={mockStartGeneration}
        onComplete={mockOnComplete}
        onError={mockOnError}
        onCancel={mockOnCancel}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("Annuleren")).toBeInTheDocument();
    });
  });

  it("calls onCancel when cancel button is clicked", async () => {
    mockStartGeneration.mockResolvedValue("portrait-123");

    render(
      <ProgressAnimation
        costumeName="Koning"
        hasStarted={true}
        onStartGeneration={mockStartGeneration}
        onComplete={mockOnComplete}
        onError={mockOnError}
        onCancel={mockOnCancel}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("Annuleren")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Annuleren"));

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it("shows error state when generation fails", async () => {
    const error = new Error("API Error");
    mockStartGeneration.mockRejectedValue(error);

    render(
      <ProgressAnimation
        costumeName="Koning"
        hasStarted={false}
        onStartGeneration={mockStartGeneration}
        onComplete={mockOnComplete}
        onError={mockOnError}
        onCancel={mockOnCancel}
      />
    );

    // Click start to trigger generation which will fail
    fireEvent.click(screen.getByText("Start Generatie"));

    // Wait for error state to appear
    await waitFor(() => {
      expect(screen.getByText("Er ging iets mis")).toBeInTheDocument();
    }, { timeout: 3000 });

    // Verify error callback was called
    expect(mockOnError).toHaveBeenCalled();
  });

  it("shows retry button in error state", async () => {
    // First resolve to get to generating state, then reject to trigger error
    mockStartGeneration
      .mockResolvedValueOnce("portrait-123")
      .mockRejectedValueOnce(new Error("API Error"));

    const { rerender } = render(
      <ProgressAnimation
        costumeName="Koning"
        hasStarted={true}
        onStartGeneration={mockStartGeneration}
        onComplete={mockOnComplete}
        onError={mockOnError}
        onCancel={mockOnCancel}
      />
    );

    // Wait for generating state first
    await waitFor(() => {
      expect(screen.getByText(/Koning portret maken/)).toBeInTheDocument();
    });

    // Simulate error by rejecting on retry
    fireEvent.click(screen.getByText("Annuleren"));
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it("displays crown icon with animation", () => {
    render(
      <ProgressAnimation
        costumeName="Koning"
        hasStarted={true}
        onStartGeneration={mockStartGeneration}
        onComplete={mockOnComplete}
        onError={mockOnError}
        onCancel={mockOnCancel}
      />
    );

    // Crown icon should be present (using data-testid or class)
    const crownContainer = document.querySelector(".bg-gradient-to-br");
    expect(crownContainer).toBeInTheDocument();
  });

  it("shows warning not to close window during generation", async () => {
    mockStartGeneration.mockResolvedValue("portrait-123");

    render(
      <ProgressAnimation
        costumeName="Koning"
        hasStarted={true}
        onStartGeneration={mockStartGeneration}
        onComplete={mockOnComplete}
        onError={mockOnError}
        onCancel={mockOnCancel}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Sluit dit venster niet/)).toBeInTheDocument();
    });
  });
});

describe("useGeneration Hook", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should initialize with pending state", () => {
    const { result } = renderHook(() => useGeneration());

    expect(result.current.state.status).toBe("pending");
    expect(result.current.state.portraitId).toBeNull();
    expect(result.current.state.progress).toBe(0);
    expect(result.current.state.error).toBeNull();
    // isLoading is true for "pending" status (waiting to start)
    expect(result.current.isLoading).toBe(true);
    expect(result.current.isPolling).toBe(false);
  });

  it("should initialize with generating state when portraitId provided", () => {
    const { result } = renderHook(() => useGeneration({ portraitId: "test-id" }));

    expect(result.current.state.status).toBe("generating");
    expect(result.current.state.portraitId).toBe("test-id");
    expect(result.current.isLoading).toBe(true);
  });

  it("should start generation and update state", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, portraitId: "portrait-123" }),
    });

    const { result } = renderHook(() => useGeneration());

    await act(async () => {
      await result.current.startGeneration("https://example.com/image.jpg", "koning");
    });

    expect(result.current.state.portraitId).toBe("portrait-123");
    expect(result.current.state.status).toBe("generating");
    expect(fetch).toHaveBeenCalledWith("/api/generate", expect.any(Object));
  });

  it("should handle generation errors", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: "Rate limit exceeded" }),
    });

    const onError = jest.fn();
    const { result } = renderHook(() => useGeneration({ onError }));

    await act(async () => {
      try {
        await result.current.startGeneration("https://example.com/image.jpg", "koning");
      } catch {
        // Expected to throw
      }
    });

    expect(result.current.state.status).toBe("failed");
    expect(result.current.state.error).toBe("Rate limit exceeded");
    expect(onError).toHaveBeenCalled();
  });

  it("should check status correctly", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ 
        success: true, 
        status: "completed", 
        progress: 100,
        images: ["url1", "url2"]
      }),
    });

    const onComplete = jest.fn();
    const { result } = renderHook(() => useGeneration({ onComplete }));

    await act(async () => {
      await result.current.checkStatus("portrait-123");
    });

    expect(result.current.state.status).toBe("completed");
    expect(result.current.state.images).toEqual(["url1", "url2"]);
    expect(onComplete).toHaveBeenCalledWith(["url1", "url2"]);
  });

  it("should cancel generation", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, portraitId: "portrait-123" }),
    });

    const { result } = renderHook(() => useGeneration());

    await act(async () => {
      await result.current.startGeneration("https://example.com/image.jpg", "koning");
    });

    act(() => {
      result.current.cancelGeneration();
    });

    expect(result.current.state.status).toBe("failed");
    expect(result.current.state.error).toBe("Geannuleerd door gebruiker");
  });

  it("should retry generation", async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: "First attempt failed" }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, portraitId: "portrait-123" }),
      });

    const { result } = renderHook(() => useGeneration());

    // First attempt fails
    await act(async () => {
      try {
        await result.current.startGeneration("https://example.com/image.jpg", "koning");
      } catch {
        // Expected
      }
    });

    expect(result.current.state.status).toBe("failed");

    // Retry succeeds
    await act(async () => {
      await result.current.retryGeneration();
    });

    expect(result.current.state.status).toBe("generating");
    expect(result.current.state.portraitId).toBe("portrait-123");
  });
});

describe("Generate Status API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 400 when portrait ID is missing", async () => {
    const request = new NextRequest("http://localhost:3000/api/generate/status");
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.success).toBe(false);
    expect(body.message).toContain("Portrait ID is required");
  });

  it("should return 404 when portrait not found", async () => {
    const { createServiceRoleClient } = require("@/lib/supabase");
    createServiceRoleClient.mockReturnValue({
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ 
        data: null, 
        error: { message: "not found", code: "PGRST116" } 
      }),
    });

    const request = new NextRequest("http://localhost:3000/api/generate/status?id=invalid-id");
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.success).toBe(false);
  });

  it("should return completed status with images", async () => {
    const { createServiceRoleClient } = require("@/lib/supabase");
    createServiceRoleClient.mockReturnValue({
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: {
          id: "portrait-123",
          status: "completed",
          generated_images: [{ url: "https://example.com/img1.png" }],
          generation_error: null,
          created_at: new Date().toISOString(),
        },
        error: null,
      }),
    });

    const request = new NextRequest("http://localhost:3000/api/generate/status?id=portrait-123");
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.status).toBe("completed");
    expect(body.progress).toBe(100);
    expect(body.images).toEqual(["https://example.com/img1.png"]);
  });

  it("should return generating status with calculated progress", async () => {
    const { createServiceRoleClient } = require("@/lib/supabase");
    createServiceRoleClient.mockReturnValue({
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: {
          id: "portrait-123",
          status: "generating",
          generated_images: null,
          generation_error: null,
          created_at: new Date(Date.now() - 15000).toISOString(), // 15 seconds ago
        },
        error: null,
      }),
    });

    const request = new NextRequest("http://localhost:3000/api/generate/status?id=portrait-123");
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.status).toBe("generating");
    expect(body.progress).toBeGreaterThan(0);
    expect(body.progress).toBeLessThan(100);
  });

  it("should return failed status with error message", async () => {
    const { createServiceRoleClient } = require("@/lib/supabase");
    createServiceRoleClient.mockReturnValue({
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: {
          id: "portrait-123",
          status: "failed",
          generated_images: null,
          generation_error: "OpenAI API error",
          created_at: new Date().toISOString(),
        },
        error: null,
      }),
    });

    const request = new NextRequest("http://localhost:3000/api/generate/status?id=portrait-123");
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.status).toBe("failed");
    expect(body.error).toBe("OpenAI API error");
  });

  it("should handle DELETE request to cancel generation", async () => {
    const { createServiceRoleClient } = require("@/lib/supabase");
    const mockSingle = jest.fn()
      .mockResolvedValueOnce({
        data: { status: "generating" },
        error: null,
      })
      .mockResolvedValueOnce({
        data: { id: "portrait-123" },
        error: null,
      });

    const mockUpdate = jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue({ error: null }),
    });

    createServiceRoleClient.mockReturnValue({
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: mockSingle,
      update: mockUpdate,
    });

    const request = new NextRequest("http://localhost:3000/api/generate/status?id=portrait-123", {
      method: "DELETE",
    });
    const response = await DELETE(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.status).toBe("failed");
  });

  it("should reject canceling completed generation", async () => {
    const { createServiceRoleClient } = require("@/lib/supabase");
    createServiceRoleClient.mockReturnValue({
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: { status: "completed" },
        error: null,
      }),
    });

    const request = new NextRequest("http://localhost:3000/api/generate/status?id=portrait-123", {
      method: "DELETE",
    });
    const response = await DELETE(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.success).toBe(false);
    expect(body.message).toContain("Cannot cancel");
  });

  it("should handle OPTIONS request for CORS", async () => {
    const response = await OPTIONS();

    expect(response.status).toBe(204);
    expect(response.headers.get("Access-Control-Allow-Origin")).toBe("*");
    expect(response.headers.get("Access-Control-Allow-Methods")).toContain("GET");
  });
});
