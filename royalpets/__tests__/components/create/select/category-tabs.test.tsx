import { render, screen, fireEvent } from "@testing-library/react";
import { CategoryTabs } from "@/components/create/select/category-tabs";
import { type CostumeCategory } from "@/lib/costumes";

describe("CategoryTabs", () => {
  const mockOnCategoryChange = jest.fn();

  beforeEach(() => {
    mockOnCategoryChange.mockClear();
  });

  it("should render all category buttons including All", () => {
    render(
      <CategoryTabs
        selectedCategory="All"
        onCategoryChange={mockOnCategoryChange}
      />
    );

    expect(screen.getByText("All")).toBeInTheDocument();
    expect(screen.getByText("Koninklijk")).toBeInTheDocument();
    expect(screen.getByText("Militair")).toBeInTheDocument();
    expect(screen.getByText("Renaissance")).toBeInTheDocument();
  });

  it("should call onCategoryChange when a category is clicked", () => {
    render(
      <CategoryTabs
        selectedCategory="All"
        onCategoryChange={mockOnCategoryChange}
      />
    );

    fireEvent.click(screen.getByText("Koninklijk"));
    expect(mockOnCategoryChange).toHaveBeenCalledWith("Koninklijk");
  });

  it("should have aria-pressed true for selected category", () => {
    render(
      <CategoryTabs
        selectedCategory="Militair"
        onCategoryChange={mockOnCategoryChange}
      />
    );

    const militairButton = screen.getByText("Militair");
    expect(militairButton).toHaveAttribute("aria-pressed", "true");
  });

  it("should have aria-pressed false for non-selected categories", () => {
    render(
      <CategoryTabs
        selectedCategory="Koninklijk"
        onCategoryChange={mockOnCategoryChange}
      />
    );

    const allButton = screen.getByText("All");
    expect(allButton).toHaveAttribute("aria-pressed", "false");
  });
});
