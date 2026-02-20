"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, PawPrint, Crown, Calendar, User } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/services", label: "Services", icon: PawPrint },
  { href: "/booking", label: "Book Now", icon: Calendar },
  { href: "/about", label: "About", icon: Crown },
  { href: "/account", label: "Account", icon: User },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#D4AF37]/20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2 transition-opacity hover:opacity-90">
          <Logo size="md" />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-2 text-sm font-medium transition-colors",
                "text-muted-foreground hover:text-[#D4AF37]"
              )}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-4">
          <Button
            variant="outline"
            className="border-[#4A148C] text-[#4A148C] hover:bg-[#4A148C] hover:text-white"
            asChild
          >
            <Link href="/login">Sign In</Link>
          </Button>
          <Button
            className="bg-gradient-royal text-white hover:opacity-90"
            asChild
          >
            <Link href="/booking">Book Appointment</Link>
          </Button>
        </div>

        {/* Mobile Navigation */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] sm:w-[400px]">
            <div className="flex flex-col gap-6 mt-8">
              <Logo size="lg" />
              <nav className="flex flex-col gap-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center gap-3 text-lg font-medium transition-colors",
                      "text-muted-foreground hover:text-[#D4AF37]"
                    )}
                  >
                    <link.icon className="h-5 w-5" />
                    {link.label}
                  </Link>
                ))}
              </nav>
              <div className="flex flex-col gap-3 mt-4">
                <Button
                  variant="outline"
                  className="w-full border-[#4A148C] text-[#4A148C] hover:bg-[#4A148C] hover:text-white"
                  asChild
                >
                  <Link href="/login" onClick={() => setIsOpen(false)}>
                    Sign In
                  </Link>
                </Button>
                <Button
                  className="w-full bg-gradient-royal text-white hover:opacity-90"
                  asChild
                >
                  <Link href="/booking" onClick={() => setIsOpen(false)}>
                    Book Appointment
                  </Link>
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
