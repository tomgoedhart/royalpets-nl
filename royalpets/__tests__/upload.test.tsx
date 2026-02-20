import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Dropzone } from "@/components/create/upload/dropzone";
import { PhotoGuide } from "@/components/create/upload/photo-guide";
import { useUpload, formatFileSize, validateImageDimensions } from "@/hooks/use-upload";
import { isR2Configured, generateFileKey, TEMP_FILE_EXPIRY_SECONDS } from "@/lib/r2";

// Mock fetch for API calls
global.fetch = jest.fn();

// Mock URL.createObjectURL and URL.revokeObjectURL
Object.defineProperty(global, "URL", {
  value: {
    createObjectURL: jest.fn(() => "blob:test-url"),
    revokeObjectURL: jest.fn(),
  },
});

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};
Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

describe("Upload - useUpload Hook", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should initialize with empty files", () => {
    const TestComponent = () => {
      const { files } = useUpload();
      return <div data-testid="file-count">{files.length}</div>;
    };

    render(<TestComponent />);
    expect(screen.getByTestId("file-count").textContent).toBe("0");
  });

  it("should validate file type", () => {
    const TestComponent = () => {
      const { validateFile } = useUpload();
      const result = validateFile(new File([""], "test.jpg", { type: "image/jpeg" }));
      return <div data-testid="valid">{result.valid ? "yes" : "no"}</div>;
    };

    render(<TestComponent />);
    expect(screen.getByTestId("valid").textContent).toBe("yes");
  });

  it("should reject invalid file types", () => {
    const TestComponent = () => {
      const { validateFile } = useUpload();
      const result = validateFile(new File([""], "test.txt", { type: "text/plain" }));
      return <div data-testid="error">{result.error || "none"}</div>;
    };

    render(<TestComponent />);
    expect(screen.getByTestId("error").textContent).toContain("not supported");
  });

  it("should reject files exceeding max size", () => {
    const TestComponent = () => {
      const { validateFile } = useUpload({ maxFileSize: 1000 });
      const largeFile = new File([new ArrayBuffer(2000)], "test.jpg", {
        type: "image/jpeg",
      });
      const result = validateFile(largeFile);
      return <div data-testid="error">{result.error || "none"}</div>;
    };

    render(<TestComponent />);
    expect(screen.getByTestId("error").textContent).toContain("too large");
  });

  it("should add files correctly", async () => {
    const TestComponent = () => {
      const { files, addFiles } = useUpload();
      return (
        <div>
          <div data-testid="file-count">{files.length}</div>
          <button
            data-testid="add-btn"
            onClick={() =>
              addFiles([new File([""], "test.jpg", { type: "image/jpeg" })])
            }
          >
            Add
          </button>
        </div>
      );
    };

    render(<TestComponent />);
    expect(screen.getByTestId("file-count").textContent).toBe("0");

    await act(async () => {
      fireEvent.click(screen.getByTestId("add-btn"));
    });

    expect(screen.getByTestId("file-count").textContent).toBe("1");
  });

  it("should remove files correctly", async () => {
    const TestComponent = () => {
      const { files, addFiles, removeFile } = useUpload();
      return (
        <div>
          <div data-testid="file-count">{files.length}</div>
          <button
            data-testid="add-btn"
            onClick={() =>
              addFiles([new File([""], "test.jpg", { type: "image/jpeg" })])
            }
          >
            Add
          </button>
          <button
            data-testid="remove-btn"
            onClick={() => files[0] && removeFile(files[0].id)}
          >
            Remove
          </button>
        </div>
      );
    };

    render(<TestComponent />);

    await act(async () => {
      fireEvent.click(screen.getByTestId("add-btn"));
    });

    expect(screen.getByTestId("file-count").textContent).toBe("1");

    await act(async () => {
      fireEvent.click(screen.getByTestId("remove-btn"));
    });

    expect(screen.getByTestId("file-count").textContent).toBe("0");
  });

  it("should persist to localStorage", async () => {
    const TestComponent = () => {
      const { addFiles } = useUpload();
      return (
        <button
          data-testid="add-btn"
          onClick={() =>
            addFiles([new File([""], "test.jpg", { type: "image/jpeg" })])
          }
        >
          Add
        </button>
      );
    };

    render(<TestComponent />);

    await act(async () => {
      fireEvent.click(screen.getByTestId("add-btn"));
    });

    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });
  });
});

describe("Upload - formatFileSize", () => {
  it("should format bytes correctly", () => {
    expect(formatFileSize(0)).toBe("0 B");
    expect(formatFileSize(1024)).toBe("1 KB");
    expect(formatFileSize(1024 * 1024)).toBe("1 MB");
    expect(formatFileSize(1024 * 1024 * 1024)).toBe("1 GB");
    expect(formatFileSize(1536)).toBe("1.5 KB");
  });
});

describe("Upload - validateImageDimensions", () => {
  it("should validate image dimensions", async () => {
    // Mock Image constructor
    const mockImage = {
      onload: null as (() => void) | null,
      onerror: null as (() => void) | null,
      src: "",
      width: 1000,
      height: 1000,
    };

    jest.spyOn(global, "Image").mockImplementation(() => {
      setTimeout(() => {
        mockImage.onload?.();
      }, 0);
      return mockImage as unknown as HTMLImageElement;
    });

    const file = new File([""], "test.jpg", { type: "image/jpeg" });
    const result = await validateImageDimensions(file, 800, 800);

    expect(result.valid).toBe(true);
  });

  it("should reject images that are too small", async () => {
    const mockImage = {
      onload: null as (() => void) | null,
      onerror: null as (() => void) | null,
      src: "",
      width: 400,
      height: 400,
    };

    jest.spyOn(global, "Image").mockImplementation(() => {
      setTimeout(() => {
        mockImage.onload?.();
      }, 0);
      return mockImage as unknown as HTMLImageElement;
    });

    const file = new File([""], "test.jpg", { type: "image/jpeg" });
    const result = await validateImageDimensions(file, 800, 800);

    expect(result.valid).toBe(false);
    expect(result.error).toContain("too small");
  });
});

describe("Upload - PhotoGuide Component", () => {
  it("should render when open is true", () => {
    render(<PhotoGuide open={true} onClose={jest.fn()} />);
    expect(screen.getByText("Photo Guide")).toBeInTheDocument();
  });

  it("should not render content when closed", () => {
    render(<PhotoGuide open={false} onClose={jest.fn()} />);
    expect(screen.queryByText("Photo Guide")).not.toBeInTheDocument();
  });

  it("should display photo tips sections", () => {
    render(<PhotoGuide open={true} onClose={jest.fn()} />);
    expect(screen.getByText("What Works Well")).toBeInTheDocument();
    expect(screen.getByText("Common Mistakes to Avoid")).toBeInTheDocument();
    expect(screen.getByText("Pro Tips")).toBeInTheDocument();
  });

  it("should show good example tips", () => {
    render(<PhotoGuide open={true} onClose={jest.fn()} />);
    expect(screen.getByText("Front View")).toBeInTheDocument();
    expect(screen.getByText("Side Profile")).toBeInTheDocument();
    expect(screen.getByText("Close-up Portrait")).toBeInTheDocument();
    expect(screen.getByText("Good Lighting")).toBeInTheDocument();
  });
});

describe("Upload - R2 Configuration", () => {
  it("isR2Configured should be a function", () => {
    expect(typeof isR2Configured).toBe("function");
  });
});

describe("Upload - generateFileKey", () => {
  it("should generate unique keys", () => {
    const key1 = generateFileKey("photo.jpg", "uploads");
    const key2 = generateFileKey("photo.jpg", "uploads");

    expect(key1).not.toBe(key2);
    expect(key1).toContain("uploads/");
    expect(key1).toContain(".jpg");
  });

  it("should handle filenames with special characters", () => {
    const key = generateFileKey("my photo (1).jpg", "uploads");
    expect(key).toContain("uploads/");
    expect(key).toContain(".jpg");
  });

  it("should default to jpg extension", () => {
    const key = generateFileKey("photo", "uploads");
    expect(key).toContain(".jpg");
  });
});

describe("Upload - TEMP_FILE_EXPIRY", () => {
  it("should be set to 24 hours", () => {
    expect(TEMP_FILE_EXPIRY_SECONDS).toBe(24 * 60 * 60);
    expect(TEMP_FILE_EXPIRY_SECONDS).toBe(86400);
  });
});
