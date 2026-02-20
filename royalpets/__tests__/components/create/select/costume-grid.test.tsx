import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { CostumeGrid } from "@/components/create/select/costume-grid";
import { costumes } from "@/lib/costumes";

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};
Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

describe("CostumeGrid", () => {
  const mockOnCostumeSelect = jest.fn();
  const mockOnContinue = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  it("should render all costumes by default", async () => {
    render(<CostumeGrid />);

    await waitFor(() => {
      costumes.forEach((costume) => {
        expect(screen.getByText(costume.name)).toBeInTheDocument();
      });
    });
  });

  it("should render category tabs", async () => {
    render(<CostumeGrid />);

    await waitFor(() => {
      // Check that category tabs exist as buttons (filtering out badges in cards)
      const getTabButton = (text: string) => {
        return screen.getAllByText(text).find(el => el.tagName.toLowerCase() === "button");
      };
      expect(getTabButton("All")).toBeDefined();
      expect(getTabButton("Koninklijk")).toBeDefined();
      expect(getTabButton("Militair")).toBeDefined();
      expect(getTabButton("Renaissance")).toBeDefined();
    });
  });

  it("should filter costumes when category is selected", async () => {
    render(<CostumeGrid />);

    await waitFor(() => {
      expect(screen.getByText("Koning")).toBeInTheDocument();
    });

    // Find the Militair tab button (first occurrence in tabs section)
    const militairTab = screen.getAllByText("Militair").find(
      el => el.tagName.toLowerCase() === "button"
    );
    expect(militairTab).toBeDefined();
    fireEvent.click(militairTab!);

    // Should still show Militair costumes
    await waitFor(() => {
      expect(screen.getByText("Ridder")).toBeInTheDocument();
    });
  });

  it("should call onCostumeSelect when costume is selected", async () => {
    render(<CostumeGrid onCostumeSelect={mockOnCostumeSelect} showContinueButton={false} />);

    await waitFor(() => {
      expect(screen.getByText("Koning")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Koning"));
    expect(mockOnCostumeSelect).toHaveBeenCalled();
  });

  it("should save selection to localStorage", async () => {
    render(<CostumeGrid showContinueButton={false} />);

    await waitFor(() => {
      expect(screen.getByText("Koning")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Koning"));

    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "royalpets-selected-costume",
        expect.stringContaining("koning")
      );
    });
  });

  it("should load saved selection from localStorage", async () => {
    localStorageMock.getItem.mockReturnValue(JSON.stringify({ id: "ridder" }));

    render(<CostumeGrid showContinueButton={false} />);

    await waitFor(() => {
      // The ridder card should have aria-pressed="true"
      const buttons = screen.getAllByRole("button");
      const ridderButton = buttons.find((b) => b.textContent?.includes("Ridder"));
      expect(ridderButton).toHaveAttribute("aria-pressed", "true");
    });
  });

  it("should render continue button by default", async () => {
    render(<CostumeGrid onContinue={mockOnContinue} />);

    await waitFor(() => {
      expect(screen.getByText("Continue")).toBeInTheDocument();
    });
  });

  it("should call onContinue when continue button is clicked", async () => {
    render(<CostumeGrid onContinue={mockOnContinue} />);

    await waitFor(() => {
      expect(screen.getByText("Koning")).toBeInTheDocument();
    });

    // First select a costume
    fireEvent.click(screen.getByText("Koning"));

    // Then click continue
    fireEvent.click(screen.getByText("Continue"));
    expect(mockOnContinue).toHaveBeenCalled();
  });
});
