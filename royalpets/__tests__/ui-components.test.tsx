import { render, screen } from "@testing-library/react";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

describe("Logo Component", () => {
  it("renders with default props", () => {
    render(<Logo />);
    expect(screen.getByLabelText("Royal Pets Logo")).toBeInTheDocument();
    expect(screen.getByText("Royal Pets")).toBeInTheDocument();
  });

  it("renders without text when showText is false", () => {
    render(<Logo showText={false} />);
    expect(screen.getByLabelText("Royal Pets Logo")).toBeInTheDocument();
    expect(screen.queryByText("Royal Pets")).not.toBeInTheDocument();
  });

  it("renders different sizes correctly", () => {
    const { rerender } = render(<Logo size="sm" />);
    expect(screen.getByLabelText("Royal Pets Logo")).toBeInTheDocument();
    
    rerender(<Logo size="lg" />);
    expect(screen.getByLabelText("Royal Pets Logo")).toBeInTheDocument();
    
    rerender(<Logo size="xl" />);
    expect(screen.getByLabelText("Royal Pets Logo")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    render(<Logo className="custom-class" />);
    expect(screen.getByLabelText("Royal Pets Logo").closest("div")).toHaveClass("custom-class");
  });
});

describe("Button Component", () => {
  it("renders button with text", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole("button", { name: "Click me" })).toBeInTheDocument();
  });

  it("renders disabled button", () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("renders button with different variants", () => {
    const { rerender } = render(<Button variant="default">Default</Button>);
    expect(screen.getByRole("button")).toBeInTheDocument();
    
    rerender(<Button variant="outline">Outline</Button>);
    expect(screen.getByRole("button")).toBeInTheDocument();
    
    rerender(<Button variant="ghost">Ghost</Button>);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });
});

describe("Card Component", () => {
  it("renders card with all sections", () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
          <CardDescription>Card Description</CardDescription>
        </CardHeader>
        <CardContent>Card Content</CardContent>
        <CardFooter>Card Footer</CardFooter>
      </Card>
    );
    
    expect(screen.getByText("Card Title")).toBeInTheDocument();
    expect(screen.getByText("Card Description")).toBeInTheDocument();
    expect(screen.getByText("Card Content")).toBeInTheDocument();
    expect(screen.getByText("Card Footer")).toBeInTheDocument();
  });

  it("renders card without optional sections", () => {
    render(
      <Card>
        <CardContent>Content Only</CardContent>
      </Card>
    );
    
    expect(screen.getByText("Content Only")).toBeInTheDocument();
  });
});

describe("Input Component", () => {
  it("renders input with placeholder", () => {
    render(<Input placeholder="Enter text" />);
    expect(screen.getByPlaceholderText("Enter text")).toBeInTheDocument();
  });

  it("renders disabled input", () => {
    render(<Input disabled placeholder="Disabled" />);
    expect(screen.getByPlaceholderText("Disabled")).toBeDisabled();
  });

  it("renders input with different types", () => {
    const { rerender } = render(<Input type="text" placeholder="Text" />);
    expect(screen.getByPlaceholderText("Text")).toHaveAttribute("type", "text");
    
    rerender(<Input type="email" placeholder="Email" />);
    expect(screen.getByPlaceholderText("Email")).toHaveAttribute("type", "email");
    
    rerender(<Input type="password" placeholder="Password" />);
    expect(screen.getByPlaceholderText("Password")).toHaveAttribute("type", "password");
  });
});

describe("Progress Component", () => {
  it("renders progress bar", () => {
    render(<Progress value={50} />);
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("renders progress with 0 value", () => {
    render(<Progress value={0} />);
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("renders progress with 100 value", () => {
    render(<Progress value={100} />);
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });
});

describe("Separator Component", () => {
  it("renders horizontal separator by default", () => {
    render(<Separator />);
    const separator = document.querySelector('[data-slot="separator"]');
    expect(separator).toBeInTheDocument();
    expect(separator).toHaveAttribute("data-orientation", "horizontal");
  });

  it("renders vertical separator", () => {
    render(<Separator orientation="vertical" />);
    const separator = document.querySelector('[data-slot="separator"]');
    expect(separator).toBeInTheDocument();
    expect(separator).toHaveAttribute("data-orientation", "vertical");
  });
});
