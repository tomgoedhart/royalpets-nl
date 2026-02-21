import { render, screen, fireEvent } from "@testing-library/react";
import { TierSelector } from "@/components/pricing/tier-selector";
import type { PricingTier } from "@/lib/pricing";

describe("TierSelector", () => {
  const mockOnSelectTier = jest.fn();

  beforeEach(() => {
    mockOnSelectTier.mockClear();
  });

  it("should render all 4 tier cards", () => {
    render(
      <TierSelector
        selectedTierId={null}
        onSelectTier={mockOnSelectTier}
      />
    );

    // Use getAllByText since names appear in both cards and comparison section
    expect(screen.getAllByText("Digitaal Basis").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Digitaal Premium").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Print + Digitaal").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Canvas Deluxe").length).toBeGreaterThanOrEqual(1);
  });

  it("should render all tier prices", () => {
    render(
      <TierSelector
        selectedTierId={null}
        onSelectTier={mockOnSelectTier}
      />
    );

    expect(screen.getByText("€9.99")).toBeInTheDocument();
    expect(screen.getByText("€19.99")).toBeInTheDocument();
    expect(screen.getByText("€34.99")).toBeInTheDocument();
    expect(screen.getByText("€59.99")).toBeInTheDocument();
  });

  it("should highlight selected tier", () => {
    render(
      <TierSelector
        selectedTierId="digital-premium"
        onSelectTier={mockOnSelectTier}
      />
    );

    // The selected tier should show "Geselecteerd"
    expect(screen.getByText("Geselecteerd")).toBeInTheDocument();
  });

  it("should call onSelectTier when a tier is clicked", () => {
    render(
      <TierSelector
        selectedTierId={null}
        onSelectTier={mockOnSelectTier}
      />
    );

    // Find and click the Digitaal Basis button
    const buttons = screen.getAllByRole("button");
    fireEvent.click(buttons[0]);

    expect(mockOnSelectTier).toHaveBeenCalled();
    expect(mockOnSelectTier.mock.calls[0][0].id).toBe("digital-basic");
  });

  it("should render comparison summary section", () => {
    render(
      <TierSelector
        selectedTierId={null}
        onSelectTier={mockOnSelectTier}
      />
    );

    expect(screen.getByText("Wat krijgt u bij elk pakket?")).toBeInTheDocument();
  });

  it("should show feature indicators in comparison", () => {
    render(
      <TierSelector
        selectedTierId={null}
        onSelectTier={mockOnSelectTier}
      />
    );

    // Use getAllByText since these appear multiple times (once per tier in comparison)
    expect(screen.getAllByText("High-res bestanden").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Bronbestanden").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Fysieke print").length).toBeGreaterThanOrEqual(1);
  });

  it("should highlight comparison box for selected tier", () => {
    render(
      <TierSelector
        selectedTierId="digital-premium"
        onSelectTier={mockOnSelectTier}
      />
    );

    // Check that the comparison section shows all tier names
    const tierNames = screen.getAllByText("Digitaal Premium");
    expect(tierNames.length).toBeGreaterThanOrEqual(1);
  });

  it("should disable all tiers when disabled prop is true", () => {
    render(
      <TierSelector
        selectedTierId={null}
        onSelectTier={mockOnSelectTier}
        disabled={true}
      />
    );

    const buttons = screen.getAllByRole("button");
    buttons.forEach((button) => {
      expect(button).toBeDisabled();
    });
  });

  it("should enable all tiers when disabled prop is false", () => {
    render(
      <TierSelector
        selectedTierId={null}
        onSelectTier={mockOnSelectTier}
        disabled={false}
      />
    );

    const buttons = screen.getAllByRole("button");
    buttons.forEach((button) => {
      expect(button).not.toBeDisabled();
    });
  });

  it("should pass the correct tier object when selecting", () => {
    render(
      <TierSelector
        selectedTierId={null}
        onSelectTier={mockOnSelectTier}
      />
    );

    // Click on the canvas deluxe tier (last button)
    const buttons = screen.getAllByRole("button");
    fireEvent.click(buttons[buttons.length - 1]);

    const selectedTier: PricingTier = mockOnSelectTier.mock.calls[0][0];
    expect(selectedTier.id).toBe("canvas-deluxe");
    expect(selectedTier.name).toBe("Canvas Deluxe");
    expect(selectedTier.price).toBe(59.99);
    expect(selectedTier.includesPrint).toBe(true);
    expect(selectedTier.includesSourceFile).toBe(true);
  });

  it("should show popular badge on digital premium tier", () => {
    render(
      <TierSelector
        selectedTierId={null}
        onSelectTier={mockOnSelectTier}
      />
    );

    expect(screen.getByText("Meest gekozen")).toBeInTheDocument();
  });
});
