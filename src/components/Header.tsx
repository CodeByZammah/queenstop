import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, Phone, Mail, MapPin, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/siteConfig";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/logo.png";
import type { User as SupabaseUser } from "@supabase/supabase-js";

const Header = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);

    // Check auth state
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      subscription.unsubscribe();
    };
  }, []);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Car Hire", href: "/car-hire" },
    { name: "Jewellery", href: "/jewellery" },
    { name: "Wedding", href: "/wedding" },
    { name: "About Us", href: "/about" },
    { name: "Contact Us", href: "/contact" },
  ];

  const handleBookingClick = () => {
    navigate("/contact");
    setIsMobileMenuOpen(false);
  };

  const handleAccountClick = () => {
    if (user) {
      navigate("/account");
    } else {
      navigate("/login");
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* Top Contact Bar */}
      <div className="bg-charcoal text-background">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <div className="flex items-center gap-3 sm:gap-6">
              <a href={`tel:${siteConfig.phoneRaw}`} className="flex items-center gap-1 sm:gap-2 hover:text-primary transition-smooth">
                <Phone size={12} className="text-primary sm:w-[14px] sm:h-[14px]" />
                <span className="hidden xs:inline">{siteConfig.phone}</span>
              </a>
              <a href={`mailto:${siteConfig.email}`} className="hidden sm:flex items-center gap-2 hover:text-primary transition-smooth">
                <Mail size={14} className="text-primary" />
                <span>{siteConfig.email}</span>
              </a>
              <div className="hidden md:flex items-center gap-2">
                <MapPin size={14} className="text-primary" />
                <span>{siteConfig.address.city}, {siteConfig.address.state}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Social Icons */}
              <a href={siteConfig.social.facebook} target="_blank" rel="noopener noreferrer" className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#3b5998] flex items-center justify-center hover:opacity-80 transition-smooth">
                <span className="text-[10px] sm:text-xs font-bold">f</span>
              </a>
              <a href={siteConfig.social.twitter} target="_blank" rel="noopener noreferrer" className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-foreground flex items-center justify-center hover:opacity-80 transition-smooth">
                <span className="text-[10px] sm:text-xs font-bold">X</span>
              </a>
              <a href={siteConfig.social.instagram} target="_blank" rel="noopener noreferrer" className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gradient-to-br from-[#f09433] via-[#e6683c] to-[#bc1888] flex items-center justify-center hover:opacity-80 transition-smooth">
                <span className="text-[10px] sm:text-xs font-bold">ig</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className={`transition-smooth ${isScrolled ? "bg-background shadow-card" : "bg-background/95 backdrop-blur-sm"}`}>
        <div className="container mx-auto px-4">
          <nav className="flex items-center justify-between h-14 sm:h-16 md:h-20">
            {/* Logo */}
            <Link to="/" className="flex-shrink-0">
              <img
                src={logo}
                alt={siteConfig.businessName}
                className="h-10 sm:h-12 md:h-14 w-auto"
              />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-4 xl:gap-6">
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

            {/* CTA Buttons */}
            <div className="hidden lg:flex items-center gap-3">
              <Button 
                variant="outline" 
                size="sm" 
                className="rounded-full"
                onClick={handleAccountClick}
              >
                <User className="mr-2 h-4 w-4" />
                {user ? "Account" : "Login"}
              </Button>
              <Button variant="default" size="lg" className="rounded-full px-6 xl:px-8" onClick={handleBookingClick}>
                Book Now
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
        className={`lg:hidden fixed inset-x-0 top-[88px] sm:top-[104px] bg-background z-40 transition-all duration-300 ${
          isMobileMenuOpen
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-4 pointer-events-none"
        }`}
      >
        <div className="container mx-auto px-4 py-4 sm:py-6 shadow-card">
          <div className="flex flex-col gap-1 sm:gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className="text-foreground font-medium py-2.5 sm:py-3 px-4 rounded-lg hover:bg-muted hover:text-primary transition-smooth"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <Button 
              variant="outline" 
              size="lg" 
              className="mt-2 rounded-full" 
              onClick={handleAccountClick}
            >
              <User className="mr-2 h-4 w-4" />
              {user ? "My Account" : "Login / Sign Up"}
            </Button>
            <Button variant="default" size="lg" className="mt-3 sm:mt-4 rounded-full" onClick={handleBookingClick}>
              Book Now
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;