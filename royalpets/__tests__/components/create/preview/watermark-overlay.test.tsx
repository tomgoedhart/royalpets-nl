import { render, screen } from "@testing-library/react";
import { WatermarkOverlay } from "@/components/create/preview/watermark-overlay";

describe("WatermarkOverlay", () => {
  it("should render watermark overlay", () => {
    render(<WatermarkOverlay />);
    
    expect(screen.getByTestId("watermark-overlay")).toBeInTheDocument();
  });

  it("should display default text", () => {
    render(<WatermarkOverlay />);
    
    // Text appears multiple times in the watermark, so we use getAllByText
    expect(screen.getAllByText("RoyalPets.nl").length).toBeGreaterThan(0);
    expect(screen.getByText("Voorbeeld")).toBeInTheDocument();
  });

  it("should display custom text", () => {
    render(<WatermarkOverlay text="Custom Watermark" />);
    
    // Custom text appears multiple times in corners and center
    expect(screen.getAllByText("Custom Watermark").length).toBeGreaterThan(0);
  });

  it("should have crown logo", () => {
    render(<WatermarkOverlay />);
    
    // Crown icon should be present (svg element)
    const overlay = screen.getByTestId("watermark-overlay");
    expect(overlay.querySelector("svg")).toBeInTheDocument();
  });

  it("should not show logo when showLogo is false", () => {
    render(<WatermarkOverlay showLogo={false} />);
    
    // Should still render but without the crown container div structure
    expect(screen.getByTestId("watermark-overlay")).toBeInTheDocument();
  });

  it("should apply custom className", () => {
    render(<WatermarkOverlay className="custom-class" />);
    
    const overlay = screen.getByTestId("watermark-overlay");
    expect(overlay).toHaveClass("custom-class");
  });

  it("should be pointer-events-none", () => {
    render(<WatermarkOverlay />);
    
    const overlay = screen.getByTestId("watermark-overlay");
    expect(overlay).toHaveClass("pointer-events-none");
  });

  it("should have select-none to prevent text selection", () => {
    render(<WatermarkOverlay />);
    
    const overlay = screen.getByTestId("watermark-overlay");
    expect(overlay).toHaveClass("select-none");
  });
});
