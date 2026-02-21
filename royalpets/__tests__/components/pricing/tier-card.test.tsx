import { render, screen, fireEvent } from "@testing-library/react";
import { TierCard } from "@/components/pricing/tier-card";
import type { PricingTier } from "@/lib/pricing";

const mockTier: PricingTier = {
  id: "digital-basic",
  name: "Digitaal Basis",
  price: 9.99,
  priceFormatted: "€9.99",
  description: "Perfect voor sociale media",
  features: ["Feature 1", "Feature 2", "Feature 3"],
  isPopular: false,
  deliveryMethod: "digital",
  includesPrint: false,
  includesHighRes: true,
  includesSourceFile: false,
};

const mockPopularTier: PricingTier = {
  id: "digital-premium",
  name: "Digitaal Premium",
  price: 19.99,
  priceFormatted: "€19.99",
  description: "Alle digitale bestanden",
  features: ["Feature 1", "Feature 2", "Feature 3", "Feature 4"],
  isPopular: true,
  deliveryMethod: "digital",
  includesPrint: false,
  includesHighRes: true,
  includesSourceFile: true,
};

describe("TierCard", () => {
  const mockOnSelect = jest.fn();

  beforeEach(() => {
    mockOnSelect.mockClear();
  });

  it("should render tier name", () => {
    render(
      <TierCard
        tier={mockTier}
        isSelected={false}
        onSelect={mockOnSelect}
      />
    );

    expect(screen.getByText("Digitaal Basis")).toBeInTheDocument();
  });

  it("should render tier description", () => {
    render(
      <TierCard
        tier={mockTier}
        isSelected={false}
        onSelect={mockOnSelect}
      />
    );

    expect(screen.getByText("Perfect voor sociale media")).toBeInTheDocument();
  });

  it("should render formatted price", () => {
    render(
      <TierCard
        tier={mockTier}
        isSelected={false}
        onSelect={mockOnSelect}
      />
    );

    expect(screen.getByText("€9.99")).toBeInTheDocument();
  });

  it("should render all features", () => {
    render(
      <TierCard
        tier={mockTier}
        isSelected={false}
        onSelect={mockOnSelect}
      />
    );

    expect(screen.getByText("Feature 1")).toBeInTheDocument();
    expect(screen.getByText("Feature 2")).toBeInTheDocument();
    expect(screen.getByText("Feature 3")).toBeInTheDocument();
  });

  it("should call onSelect when button is clicked", () => {
    render(
      <TierCard
        tier={mockTier}
        isSelected={false}
        onSelect={mockOnSelect}
      />
    );

    const button = screen.getByRole("button");
    fireEvent.click(button);
    expect(mockOnSelect).toHaveBeenCalledWith(mockTier);
  });

  it("should show 'Kies dit pakket' when not selected", () => {
    render(
      <TierCard
        tier={mockTier}
        isSelected={false}
        onSelect={mockOnSelect}
      />
    );

    expect(screen.getByText("Kies dit pakket")).toBeInTheDocument();
  });

  it("should show 'Geselecteerd' when selected", () => {
    render(
      <TierCard
        tier={mockTier}
        isSelected={true}
        onSelect={mockOnSelect}
      />
    );

    expect(screen.getByText("Geselecteerd")).toBeInTheDocument();
  });

  it("should have aria-pressed true when selected", () => {
    render(
      <TierCard
        tier={mockTier}
        isSelected={true}
        onSelect={mockOnSelect}
      />
    );

    expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "true");
  });

  it("should have aria-pressed false when not selected", () => {
    render(
      <TierCard
        tier={mockTier}
        isSelected={false}
        onSelect={mockOnSelect}
      />
    );

    expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "false");
  });

  it("should have aria-label with tier name and price", () => {
    render(
      <TierCard
        tier={mockTier}
        isSelected={false}
        onSelect={mockOnSelect}
      />
    );

    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-label", "Selecteer Digitaal Basis voor €9.99");
  });

  it("should show popular badge for popular tier", () => {
    render(
      <TierCard
        tier={mockPopularTier}
        isSelected={false}
        onSelect={mockOnSelect}
      />
    );

    expect(screen.getByText("Meest gekozen")).toBeInTheDocument();
  });

  it("should not show popular badge for non-popular tier", () => {
    render(
      <TierCard
        tier={mockTier}
        isSelected={false}
        onSelect={mockOnSelect}
      />
    );

    expect(screen.queryByText("Meest gekozen")).not.toBeInTheDocument();
  });

  it("should be disabled when disabled prop is true", () => {
    render(
      <TierCard
        tier={mockTier}
        isSelected={false}
        onSelect={mockOnSelect}
        disabled={true}
      />
    );

    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("should not be disabled when disabled prop is false", () => {
    render(
      <TierCard
        tier={mockTier}
        isSelected={false}
        onSelect={mockOnSelect}
        disabled={false}
      />
    );

    expect(screen.getByRole("button")).not.toBeDisabled();
  });

  it("should apply selected styling when selected", () => {
    render(
      <TierCard
        tier={mockTier}
        isSelected={true}
        onSelect={mockOnSelect}
      />
    );

    const card = screen.getByText("Digitaal Basis").closest("[data-slot='card']");
    expect(card).toHaveClass("border-amber-500");
  });
});
