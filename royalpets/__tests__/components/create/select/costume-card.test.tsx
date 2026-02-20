import { render, screen, fireEvent } from "@testing-library/react";
import { CostumeCard } from "@/components/create/select/costume-card";
import { type Costume } from "@/lib/costumes";

const mockCostume: Costume = {
  id: "koning",
  name: "Koning",
  category: "Koninklijk",
  description: "Een majestueuze koning met gouden kroon",
  prompt: "Royal king portrait",
  icon: "Crown",
};

describe("CostumeCard", () => {
  const mockOnSelect = jest.fn();

  beforeEach(() => {
    mockOnSelect.mockClear();
  });

  it("should render costume name and description", () => {
    render(
      <CostumeCard
        costume={mockCostume}
        isSelected={false}
        onSelect={mockOnSelect}
      />
    );

    expect(screen.getByText("Koning")).toBeInTheDocument();
    expect(screen.getByText("Een majestueuze koning met gouden kroon")).toBeInTheDocument();
  });

  it("should render category badge", () => {
    render(
      <CostumeCard
        costume={mockCostume}
        isSelected={false}
        onSelect={mockOnSelect}
      />
    );

    expect(screen.getByText("Koninklijk")).toBeInTheDocument();
  });

  it("should call onSelect when clicked", () => {
    render(
      <CostumeCard
        costume={mockCostume}
        isSelected={false}
        onSelect={mockOnSelect}
      />
    );

    fireEvent.click(screen.getByRole("button"));
    expect(mockOnSelect).toHaveBeenCalledWith(mockCostume);
  });

  it("should have aria-pressed true when selected", () => {
    render(
      <CostumeCard
        costume={mockCostume}
        isSelected={true}
        onSelect={mockOnSelect}
      />
    );

    expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "true");
  });

  it("should have aria-pressed false when not selected", () => {
    render(
      <CostumeCard
        costume={mockCostume}
        isSelected={false}
        onSelect={mockOnSelect}
      />
    );

    expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "false");
  });

  it("should show check indicator when selected", () => {
    render(
      <CostumeCard
        costume={mockCostume}
        isSelected={true}
        onSelect={mockOnSelect}
      />
    );

    // The check icon should be present when selected
    expect(document.querySelector("svg")).toBeInTheDocument();
  });
});
