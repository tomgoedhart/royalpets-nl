import { render, screen } from "@testing-library/react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

// Mock next/link
jest.mock("next/link", () => {
  return function Link({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>;
  };
});

describe("Navbar Component", () => {
  it("renders logo", () => {
    render(<Navbar />);
    expect(screen.getByLabelText("Royal Pets Logo")).toBeInTheDocument();
    expect(screen.getByText("Royal Pets")).toBeInTheDocument();
  });

  it("renders navigation links", () => {
    render(<Navbar />);
    expect(screen.getByText("Services")).toBeInTheDocument();
    expect(screen.getByText("Book Now")).toBeInTheDocument();
    expect(screen.getByText("About")).toBeInTheDocument();
    expect(screen.getByText("Account")).toBeInTheDocument();
  });

  it("renders sign in and book appointment buttons", () => {
    render(<Navbar />);
    expect(screen.getByText("Sign In")).toBeInTheDocument();
    expect(screen.getByText("Book Appointment")).toBeInTheDocument();
  });

  it("renders mobile menu button", () => {
    render(<Navbar />);
    expect(screen.getByRole("button", { name: /toggle menu/i })).toBeInTheDocument();
  });
});

describe("Footer Component", () => {
  it("renders logo", () => {
    render(<Footer />);
    expect(screen.getByLabelText("Royal Pets Logo")).toBeInTheDocument();
  });

  it("renders tagline", () => {
    render(<Footer />);
    expect(screen.getByText(/premium pet care services/i)).toBeInTheDocument();
  });

  it("renders contact information", () => {
    render(<Footer />);
    expect(screen.getByText(/123 royal avenue/i)).toBeInTheDocument();
    expect(screen.getByText(/\(555\) 123-PETS/)).toBeInTheDocument();
    expect(screen.getByText(/royalty@royalpets.com/)).toBeInTheDocument();
  });

  it("renders services links", () => {
    render(<Footer />);
    expect(screen.getByText("Pet Boarding")).toBeInTheDocument();
    expect(screen.getByText("Dog Daycare")).toBeInTheDocument();
    expect(screen.getByText("Grooming")).toBeInTheDocument();
    expect(screen.getByText("Training")).toBeInTheDocument();
  });

  it("renders company links", () => {
    render(<Footer />);
    expect(screen.getByText("About Us")).toBeInTheDocument();
    expect(screen.getByText("Our Team")).toBeInTheDocument();
    expect(screen.getByText("Careers")).toBeInTheDocument();
    expect(screen.getByText("Contact")).toBeInTheDocument();
  });

  it("renders support links", () => {
    render(<Footer />);
    expect(screen.getByText("FAQs")).toBeInTheDocument();
    expect(screen.getByText("Policies")).toBeInTheDocument();
    expect(screen.getByText("Privacy")).toBeInTheDocument();
    expect(screen.getByText("Terms")).toBeInTheDocument();
  });

  it("renders social media links", () => {
    render(<Footer />);
    expect(screen.getByLabelText("Facebook")).toBeInTheDocument();
    expect(screen.getByLabelText("Instagram")).toBeInTheDocument();
    expect(screen.getByLabelText("Twitter")).toBeInTheDocument();
  });

  it("renders copyright notice", () => {
    render(<Footer />);
    const currentYear = new Date().getFullYear();
    expect(screen.getByText(new RegExp(`© ${currentYear} Royal Pets`))).toBeInTheDocument();
  });
});
