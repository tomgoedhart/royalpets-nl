import { render, screen, fireEvent } from "@testing-library/react";
import { Lightbox } from "@/components/create/preview/lightbox";

const mockImages = [
  "https://example.com/portrait-1.jpg",
  "https://example.com/portrait-2.jpg",
  "https://example.com/portrait-3.jpg",
  "https://example.com/portrait-4.jpg",
];

describe("Lightbox", () => {
  const mockOnClose = jest.fn();
  const mockOnNavigate = jest.fn();
  const mockOnSelect = jest.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
    mockOnNavigate.mockClear();
    mockOnSelect.mockClear();
  });

  it("should render when isOpen is true", () => {
    render(
      <Lightbox
        images={mockImages}
        currentIndex={0}
        isOpen={true}
        selectedIndex={null}
        onClose={mockOnClose}
        onNavigate={mockOnNavigate}
        onSelect={mockOnSelect}
      />
    );

    expect(screen.getByTestId("lightbox")).toBeInTheDocument();
  });

  it("should not render when isOpen is false", () => {
    const { container } = render(
      <Lightbox
        images={mockImages}
        currentIndex={0}
        isOpen={false}
        selectedIndex={null}
        onClose={mockOnClose}
        onNavigate={mockOnNavigate}
        onSelect={mockOnSelect}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it("should display current image", () => {
    render(
      <Lightbox
        images={mockImages}
        currentIndex={1}
        isOpen={true}
        selectedIndex={null}
        onClose={mockOnClose}
        onNavigate={mockOnNavigate}
        onSelect={mockOnSelect}
      />
    );

    const image = screen.getByTestId("lightbox-image");
    expect(image).toHaveAttribute("src", mockImages[1]);
  });

  it("should display image counter", () => {
    render(
      <Lightbox
        images={mockImages}
        currentIndex={2}
        isOpen={true}
        selectedIndex={null}
        onClose={mockOnClose}
        onNavigate={mockOnNavigate}
        onSelect={mockOnSelect}
      />
    );

    expect(screen.getByText("3 / 4")).toBeInTheDocument();
  });

  it("should call onClose when close button clicked", () => {
    render(
      <Lightbox
        images={mockImages}
        currentIndex={0}
        isOpen={true}
        selectedIndex={null}
        onClose={mockOnClose}
        onNavigate={mockOnNavigate}
        onSelect={mockOnSelect}
      />
    );

    fireEvent.click(screen.getByLabelText("Sluiten"));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it("should call onNavigate with previous index when left arrow clicked", () => {
    render(
      <Lightbox
        images={mockImages}
        currentIndex={2}
        isOpen={true}
        selectedIndex={null}
        onClose={mockOnClose}
        onNavigate={mockOnNavigate}
        onSelect={mockOnSelect}
      />
    );

    fireEvent.click(screen.getByLabelText("Vorige afbeelding"));
    expect(mockOnNavigate).toHaveBeenCalledWith(1);
  });

  it("should call onNavigate with next index when right arrow clicked", () => {
    render(
      <Lightbox
        images={mockImages}
        currentIndex={1}
        isOpen={true}
        selectedIndex={null}
        onClose={mockOnClose}
        onNavigate={mockOnNavigate}
        onSelect={mockOnSelect}
      />
    );

    fireEvent.click(screen.getByLabelText("Volgende afbeelding"));
    expect(mockOnNavigate).toHaveBeenCalledWith(2);
  });

  it("should not show previous button when on first image", () => {
    render(
      <Lightbox
        images={mockImages}
        currentIndex={0}
        isOpen={true}
        selectedIndex={null}
        onClose={mockOnClose}
        onNavigate={mockOnNavigate}
        onSelect={mockOnSelect}
      />
    );

    expect(screen.queryByLabelText("Vorige afbeelding")).not.toBeInTheDocument();
  });

  it("should not show next button when on last image", () => {
    render(
      <Lightbox
        images={mockImages}
        currentIndex={3}
        isOpen={true}
        selectedIndex={null}
        onClose={mockOnClose}
        onNavigate={mockOnNavigate}
        onSelect={mockOnSelect}
      />
    );

    expect(screen.queryByLabelText("Volgende afbeelding")).not.toBeInTheDocument();
  });

  it("should call onSelect when select button clicked", () => {
    render(
      <Lightbox
        images={mockImages}
        currentIndex={1}
        isOpen={true}
        selectedIndex={null}
        onClose={mockOnClose}
        onNavigate={mockOnNavigate}
        onSelect={mockOnSelect}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Selecteer deze" }));
    expect(mockOnSelect).toHaveBeenCalledWith(1);
  });

  it("should show selected state when current image is selected", () => {
    render(
      <Lightbox
        images={mockImages}
        currentIndex={2}
        isOpen={true}
        selectedIndex={2}
        onClose={mockOnClose}
        onNavigate={mockOnNavigate}
        onSelect={mockOnSelect}
      />
    );

    expect(screen.getByRole("button", { name: /Geselecteerd/i })).toBeInTheDocument();
  });

  it("should render thumbnail navigation", () => {
    render(
      <Lightbox
        images={mockImages}
        currentIndex={0}
        isOpen={true}
        selectedIndex={null}
        onClose={mockOnClose}
        onNavigate={mockOnNavigate}
        onSelect={mockOnSelect}
      />
    );

    // Should have 4 thumbnail buttons (filter out navigation buttons that also contain "afbeelding")
    const thumbnails = screen.getAllByRole("button").filter(
      button => {
        const label = button.getAttribute("aria-label") || "";
        return label.startsWith("Ga naar");
      }
    );
    expect(thumbnails).toHaveLength(4);
  });

  it("should call onNavigate when thumbnail clicked", () => {
    render(
      <Lightbox
        images={mockImages}
        currentIndex={0}
        isOpen={true}
        selectedIndex={null}
        onClose={mockOnClose}
        onNavigate={mockOnNavigate}
        onSelect={mockOnSelect}
      />
    );

    const thumbnails = screen.getAllByRole("button").filter(
      button => {
        const label = button.getAttribute("aria-label") || "";
        return label.startsWith("Ga naar");
      }
    );
    
    fireEvent.click(thumbnails[2]);
    expect(mockOnNavigate).toHaveBeenCalledWith(2);
  });

  it("should have dialog role", () => {
    render(
      <Lightbox
        images={mockImages}
        currentIndex={0}
        isOpen={true}
        selectedIndex={null}
        onClose={mockOnClose}
        onNavigate={mockOnNavigate}
        onSelect={mockOnSelect}
      />
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("should have aria-modal attribute", () => {
    render(
      <Lightbox
        images={mockImages}
        currentIndex={0}
        isOpen={true}
        selectedIndex={null}
        onClose={mockOnClose}
        onNavigate={mockOnNavigate}
        onSelect={mockOnSelect}
      />
    );

    expect(screen.getByRole("dialog")).toHaveAttribute("aria-modal", "true");
  });
});
