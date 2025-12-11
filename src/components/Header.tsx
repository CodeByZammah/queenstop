import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Phone, Mail, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.png";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Car Hire", href: "/car-hire" },
    { name: "Jewellery", href: "/jewellery" },
    { name: "Wedding", href: "/wedding" },
    { name: "About Us", href: "/about" },
    { name: "Contact Us", href: "/contact" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* Top Contact Bar */}
      <div className="bg-charcoal text-background">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-6">
              <a href="tel:+1234567890" className="flex items-center gap-2 hover:text-primary transition-smooth">
                <Phone size={14} className="text-primary" />
                <span>+1-234-567-890</span>
              </a>
              <a href="mailto:info@queenstop.com" className="hidden sm:flex items-center gap-2 hover:text-primary transition-smooth">
                <Mail size={14} className="text-primary" />
                <span>info@queenstop.com</span>
              </a>
              <div className="hidden md:flex items-center gap-2">
                <MapPin size={14} className="text-primary" />
                <span>123 Kings Way, New York</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Social Icons */}
              <a href="#" className="w-7 h-7 rounded-full bg-[#3b5998] flex items-center justify-center hover:opacity-80 transition-smooth">
                <span className="text-xs font-bold">f</span>
              </a>
              <a href="#" className="w-7 h-7 rounded-full bg-foreground flex items-center justify-center hover:opacity-80 transition-smooth">
                <span className="text-xs font-bold">X</span>
              </a>
              <a href="#" className="w-7 h-7 rounded-full bg-[#0077b5] flex items-center justify-center hover:opacity-80 transition-smooth">
                <span className="text-xs font-bold">in</span>
              </a>
              <a href="#" className="w-7 h-7 rounded-full bg-gradient-to-br from-[#f09433] via-[#e6683c] to-[#bc1888] flex items-center justify-center hover:opacity-80 transition-smooth">
                <span className="text-xs font-bold">ig</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className={`transition-smooth ${isScrolled ? "bg-background shadow-card" : "bg-background/95 backdrop-blur-sm"}`}>
        <div className="container mx-auto px-4">
          <nav className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link to="/" className="flex-shrink-0">
              <img
                src={logo}
                alt="Queenstop"
                className="h-12 md:h-14 w-auto"
              />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className="text-foreground font-medium text-sm hover:text-primary transition-smooth relative group"
                >
                  {link.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
                </Link>
              ))}
            </div>

            {/* CTA Button */}
            <div className="hidden lg:flex items-center">
              <Button variant="default" size="lg" className="rounded-full px-8">
                Booking Now
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2 text-foreground"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </nav>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`lg:hidden fixed inset-x-0 top-[104px] bg-background z-40 transition-all duration-300 ${
          isMobileMenuOpen
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-4 pointer-events-none"
        }`}
      >
        <div className="container mx-auto px-4 py-6 shadow-card">
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className="text-foreground font-medium py-3 px-4 rounded-lg hover:bg-muted hover:text-primary transition-smooth"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <Button variant="default" size="lg" className="mt-4 rounded-full">
              Booking Now
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
