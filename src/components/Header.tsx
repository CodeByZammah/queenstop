import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.png";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Car Hire", href: "/car-hire" },
    { name: "Jewellery", href: "/jewellery" },
    { name: "Wedding", href: "/wedding" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-elegant ${
        isScrolled
          ? "bg-background/95 backdrop-blur-md shadow-soft"
          : "bg-transparent"
      }`}
    >
      {/* Top Bar */}
      <div className={`border-b transition-elegant ${isScrolled ? 'border-border/50 opacity-0 h-0 overflow-hidden' : 'border-cream/20 opacity-100 h-auto'}`}>
        <div className="container mx-auto px-4 py-2 flex items-center justify-between text-sm">
          <div className="flex items-center gap-6">
            <a href="tel:+1234567890" className={`flex items-center gap-2 transition-smooth ${isScrolled ? 'text-muted-foreground hover:text-primary' : 'text-cream/80 hover:text-gold-light'}`}>
              <Phone size={14} />
              <span>+1 234 567 890</span>
            </a>
          </div>
          <p className={`hidden md:block ${isScrolled ? 'text-muted-foreground' : 'text-cream/70'}`}>Elegance in Motion</p>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <img
              src={logo}
              alt="Queenstop - Elegance in Motion"
              className={`h-14 w-auto transition-elegant ${isScrolled ? '' : 'brightness-0 invert'}`}
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className={`font-medium text-sm uppercase tracking-wider transition-smooth relative group ${
                  isScrolled 
                    ? 'text-foreground/80 hover:text-primary' 
                    : 'text-cream/90 hover:text-gold-light'
                }`}
              >
                {link.name}
                <span className={`absolute -bottom-1 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full ${isScrolled ? 'bg-primary' : 'bg-gold-light'}`} />
              </Link>
            ))}
          </div>

          {/* CTA Button */}
          <div className="hidden lg:flex items-center gap-4">
            <Button variant="gold" size="lg">
              Book Now
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className={`lg:hidden p-2 transition-smooth ${isScrolled ? 'text-foreground' : 'text-cream'}`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </nav>
      </div>

      {/* Mobile Menu */}
      <div
        className={`lg:hidden fixed inset-0 top-[80px] bg-background z-40 transition-elegant ${
          isMobileMenuOpen
            ? "opacity-100 translate-x-0"
            : "opacity-0 translate-x-full pointer-events-none"
        }`}
      >
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className="text-foreground text-lg font-medium py-3 border-b border-border hover:text-primary transition-smooth"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <Button variant="gold" size="xl" className="mt-6">
              Book Now
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
