import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import heroCar from "@/assets/hero-car.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={heroCar}
          alt="Luxury car hire service"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-hero" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-32 pt-40">
        <div className="max-w-3xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 backdrop-blur-sm border border-primary/30 mb-8 opacity-0 animate-fade-up">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-primary-foreground text-sm font-medium tracking-wide">
              Premium Multi-Service Brand
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-primary-foreground leading-tight mb-6 opacity-0 animate-fade-up animation-delay-200">
            Experience
            <span className="block text-gold-light">Elegance in Motion</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-primary-foreground/80 font-light max-w-xl mb-10 opacity-0 animate-fade-up animation-delay-400">
            Discover premium car hire, exquisite jewellery, and elegant wedding 
            accessories. Where luxury meets exceptional service.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 opacity-0 animate-fade-up animation-delay-600">
            <Button variant="gold" size="xl" className="group">
              Explore Our Services
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
            </Button>
            <Button variant="hero-outline" size="xl" className="group">
              <Play size={20} className="mr-2" />
              Watch Our Story
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-16 pt-8 border-t border-primary-foreground/20 opacity-0 animate-fade-up animation-delay-600">
            <div>
              <p className="text-3xl md:text-4xl font-display font-bold text-gold-light">500+</p>
              <p className="text-primary-foreground/70 text-sm mt-1">Happy Clients</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-display font-bold text-gold-light">50+</p>
              <p className="text-primary-foreground/70 text-sm mt-1">Luxury Vehicles</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-display font-bold text-gold-light">10+</p>
              <p className="text-primary-foreground/70 text-sm mt-1">Years Experience</p>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-0 animate-fade-in animation-delay-600">
        <span className="text-primary-foreground/60 text-xs uppercase tracking-widest">Scroll</span>
        <div className="w-px h-12 bg-gradient-to-b from-primary-foreground/60 to-transparent" />
      </div>
    </section>
  );
};

export default Hero;
