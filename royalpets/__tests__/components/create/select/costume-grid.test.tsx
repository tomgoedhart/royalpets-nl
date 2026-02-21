import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CostumeGrid } from "@/components/create/select/costume-grid";
import { costumes } from "@/lib/costumes";

describe("CostumeGrid", () => {
  const mockOnCostumeSelect = jest.fn();
  const mockOnContinue = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
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

  it("should render costume as selected when selectedCostumeId prop is provided", async () => {
    render(
      <CostumeGrid 
        selectedCostumeId="ridder" 
        onCostumeSelect={mockOnCostumeSelect} 
        showContinueButton={false} 
      />
    );

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

  it("should update selection when selectedCostumeId prop changes", async () => {
    const { rerender } = render(
      <CostumeGrid 
        selectedCostumeId="koning" 
        onCostumeSelect={mockOnCostumeSelect} 
        showContinueButton={false} 
      />
    );

    await waitFor(() => {
      const buttons = screen.getAllByRole("button");
      const koningButton = buttons.find((b) => b.textContent?.includes("Koning"));
      expect(koningButton).toHaveAttribute("aria-pressed", "true");
    });

    // Change prop
    rerender(
      <CostumeGrid 
        selectedCostumeId="ridder" 
        onCostumeSelect={mockOnCostumeSelect} 
        showContinueButton={false} 
      />
    );

    await waitFor(() => {
      const buttons = screen.getAllByRole("button");
      const ridderButton = buttons.find((b) => b.textContent?.includes("Ridder"));
      expect(ridderButton).toHaveAttribute("aria-pressed", "true");
    });
  });
});
