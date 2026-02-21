import { render, screen, fireEvent } from "@testing-library/react";
import { ImageCard } from "@/components/create/preview/image-card";

const mockImageUrl = "https://example.com/portrait-1.jpg";

describe("ImageCard", () => {
  const mockOnSelect = jest.fn();
  const mockOnView = jest.fn();

  beforeEach(() => {
    mockOnSelect.mockClear();
    mockOnView.mockClear();
  });

  it("should render image with alt text", () => {
    render(
      <ImageCard
        imageUrl={mockImageUrl}
        index={0}
        isSelected={false}
        onSelect={mockOnSelect}
        onView={mockOnView}
      />
    );

    expect(screen.getByAltText("Portret variant 1")).toBeInTheDocument();
  });

  it("should render select button when not selected", () => {
    render(
      <ImageCard
        imageUrl={mockImageUrl}
        index={0}
        isSelected={false}
        onSelect={mockOnSelect}
        onView={mockOnView}
      />
    );

    expect(screen.getByRole("button", { name: "Selecteer" })).toBeInTheDocument();
  });

  it("should render selected button text when selected", () => {
    render(
      <ImageCard
        imageUrl={mockImageUrl}
        index={0}
        isSelected={true}
        onSelect={mockOnSelect}
        onView={mockOnView}
      />
    );

    expect(screen.getByRole("button", { name: /Geselecteerd/i })).toBeInTheDocument();
  });

  it("should call onSelect with index when select button clicked", () => {
    render(
      <ImageCard
        imageUrl={mockImageUrl}
        index={2}
        isSelected={false}
        onSelect={mockOnSelect}
        onView={mockOnView}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Selecteer" }));
    expect(mockOnSelect).toHaveBeenCalledWith(2);
  });

  it("should call onView with index when vergroot button clicked", () => {
    render(
      <ImageCard
        imageUrl={mockImageUrl}
        index={1}
        isSelected={false}
        onSelect={mockOnSelect}
        onView={mockOnView}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /Vergroot/i }));
    expect(mockOnView).toHaveBeenCalledWith(1);
  });

  it("should have aria-pressed false when not selected", () => {
    render(
      <ImageCard
        imageUrl={mockImageUrl}
        index={0}
        isSelected={false}
        onSelect={mockOnSelect}
        onView={mockOnView}
      />
    );

    expect(screen.getByRole("button", { name: "Selecteer" })).toHaveAttribute("aria-pressed", "false");
  });

  it("should have aria-pressed true when selected", () => {
    render(
      <ImageCard
        imageUrl={mockImageUrl}
        index={0}
        isSelected={true}
        onSelect={mockOnSelect}
        onView={mockOnView}
      />
    );

    expect(screen.getByRole("button", { name: /Geselecteerd/i })).toHaveAttribute("aria-pressed", "true");
  });

  it("should show check indicator when selected", () => {
    render(
      <ImageCard
        imageUrl={mockImageUrl}
        index={0}
        isSelected={true}
        onSelect={mockOnSelect}
        onView={mockOnView}
      />
    );

    const card = screen.getByTestId("image-card-0");
    expect(card.querySelector("svg")).toBeInTheDocument();
  });

  it("should have watermark overlay", () => {
    render(
      <ImageCard
        imageUrl={mockImageUrl}
        index={0}
        isSelected={false}
        onSelect={mockOnSelect}
        onView={mockOnView}
      />
    );

    expect(screen.getByTestId("watermark-overlay")).toBeInTheDocument();
  });

  it("should have correct border styling when selected", () => {
    render(
      <ImageCard
        imageUrl={mockImageUrl}
        index={0}
        isSelected={true}
        onSelect={mockOnSelect}
        onView={mockOnView}
      />
    );

    const card = screen.getByTestId("image-card-0");
    expect(card).toHaveClass("border-blue-500");
  });

  it("should have correct border styling when not selected", () => {
    render(
      <ImageCard
        imageUrl={mockImageUrl}
        index={0}
        isSelected={false}
        onSelect={mockOnSelect}
        onView={mockOnView}
      />
    );

    const card = screen.getByTestId("image-card-0");
    expect(card).toHaveClass("border-gray-200");
  });
});
