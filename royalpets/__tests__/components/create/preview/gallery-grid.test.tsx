import { render, screen, fireEvent } from "@testing-library/react";
import { GalleryGrid } from "@/components/create/preview/gallery-grid";

const mockImages = [
  "https://example.com/portrait-1.jpg",
  "https://example.com/portrait-2.jpg",
  "https://example.com/portrait-3.jpg",
  "https://example.com/portrait-4.jpg",
];

describe("GalleryGrid", () => {
  const mockOnSelectImage = jest.fn();
  const mockOnOpenLightbox = jest.fn();
  const mockOnCloseLightbox = jest.fn();
  const mockOnNavigateLightbox = jest.fn();

  beforeEach(() => {
    mockOnSelectImage.mockClear();
    mockOnOpenLightbox.mockClear();
    mockOnCloseLightbox.mockClear();
    mockOnNavigateLightbox.mockClear();
  });

  it("should render 2x2 grid with 4 images", () => {
    render(
      <GalleryGrid
        images={mockImages}
        selectedIndex={null}
        lightboxOpen={false}
        lightboxIndex={0}
        onSelectImage={mockOnSelectImage}
        onOpenLightbox={mockOnOpenLightbox}
        onCloseLightbox={mockOnCloseLightbox}
        onNavigateLightbox={mockOnNavigateLightbox}
      />
    );

    expect(screen.getByTestId("gallery-grid")).toBeInTheDocument();
    expect(screen.getByAltText("Portret variant 1")).toBeInTheDocument();
    expect(screen.getByAltText("Portret variant 2")).toBeInTheDocument();
    expect(screen.getByAltText("Portret variant 3")).toBeInTheDocument();
    expect(screen.getByAltText("Portret variant 4")).toBeInTheDocument();
  });

  it("should render empty state when no images", () => {
    render(
      <GalleryGrid
        images={[]}
        selectedIndex={null}
        lightboxOpen={false}
        lightboxIndex={0}
        onSelectImage={mockOnSelectImage}
        onOpenLightbox={mockOnOpenLightbox}
        onCloseLightbox={mockOnCloseLightbox}
        onNavigateLightbox={mockOnNavigateLightbox}
      />
    );

    expect(screen.getByText("Geen afbeeldingen beschikbaar")).toBeInTheDocument();
  });

  it("should call onSelectImage when image is selected", () => {
    render(
      <GalleryGrid
        images={mockImages}
        selectedIndex={null}
        lightboxOpen={false}
        lightboxIndex={0}
        onSelectImage={mockOnSelectImage}
        onOpenLightbox={mockOnOpenLightbox}
        onCloseLightbox={mockOnCloseLightbox}
        onNavigateLightbox={mockOnNavigateLightbox}
      />
    );

    const buttons = screen.getAllByRole("button", { name: "Selecteer" });
    fireEvent.click(buttons[1]);
    expect(mockOnSelectImage).toHaveBeenCalledWith(1);
  });

  it("should call onOpenLightbox when vergroot is clicked", () => {
    render(
      <GalleryGrid
        images={mockImages}
        selectedIndex={null}
        lightboxOpen={false}
        lightboxIndex={0}
        onSelectImage={mockOnSelectImage}
        onOpenLightbox={mockOnOpenLightbox}
        onCloseLightbox={mockOnCloseLightbox}
        onNavigateLightbox={mockOnNavigateLightbox}
      />
    );

    const zoomButtons = screen.getAllByRole("button", { name: /Vergroot/i });
    fireEvent.click(zoomButtons[2]);
    expect(mockOnOpenLightbox).toHaveBeenCalledWith(2);
  });

  it("should show lightbox when lightboxOpen is true", () => {
    render(
      <GalleryGrid
        images={mockImages}
        selectedIndex={1}
        lightboxOpen={true}
        lightboxIndex={0}
        onSelectImage={mockOnSelectImage}
        onOpenLightbox={mockOnOpenLightbox}
        onCloseLightbox={mockOnCloseLightbox}
        onNavigateLightbox={mockOnNavigateLightbox}
      />
    );

    expect(screen.getByTestId("lightbox")).toBeInTheDocument();
  });

  it("should not show lightbox when lightboxOpen is false", () => {
    render(
      <GalleryGrid
        images={mockImages}
        selectedIndex={null}
        lightboxOpen={false}
        lightboxIndex={0}
        onSelectImage={mockOnSelectImage}
        onOpenLightbox={mockOnOpenLightbox}
        onCloseLightbox={mockOnCloseLightbox}
        onNavigateLightbox={mockOnNavigateLightbox}
      />
    );

    expect(screen.queryByTestId("lightbox")).not.toBeInTheDocument();
  });

  it("should have grid layout with 2 columns", () => {
    render(
      <GalleryGrid
        images={mockImages}
        selectedIndex={null}
        lightboxOpen={false}
        lightboxIndex={0}
        onSelectImage={mockOnSelectImage}
        onOpenLightbox={mockOnOpenLightbox}
        onCloseLightbox={mockOnCloseLightbox}
        onNavigateLightbox={mockOnNavigateLightbox}
      />
    );

    const grid = screen.getByTestId("gallery-grid");
    expect(grid).toHaveClass("grid-cols-2");
  });
});
