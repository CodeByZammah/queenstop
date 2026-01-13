import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSiteConfig, type HeroImage } from "@/hooks/useSiteConfig";

// Import media assets
import heroCar from "@/assets/hero-car.jpg";
import jewellery from "@/assets/jewellery.jpg";
import weddingAccessories from "@/assets/wedding-accessories.jpg";

export interface MediaItem {
  type: "image" | "video";
  src: string;
  alt?: string;
  poster?: string;
  headline: string;
  highlightText: string;
  subtitle: string;
}

// Default media items with dynamic content
const defaultMediaItems: MediaItem[] = [
  { 
    type: "image", 
    src: heroCar, 
    alt: "Luxury car hire service",
    headline: "Enjoy Your",
    highlightText: "Comfortable Trip",
    subtitle: "Premium car hire services for every occasion. Travel in style and luxury."
  },
  { 
    type: "image", 
    src: jewellery, 
    alt: "Exquisite jewellery collection",
    headline: "Discover",
    highlightText: "Timeless Elegance",
    subtitle: "Exquisite jewellery pieces that make every moment unforgettable."
  },
  { 
    type: "image", 
    src: weddingAccessories, 
    alt: "Elegant wedding accessories",
    headline: "Celebrate Your",
    highlightText: "Perfect Day",
    subtitle: "Beautiful wedding accessories for your most special moments."
  },
];

// Helper to convert admin hero images to MediaItems
const convertHeroImages = (heroImages: HeroImage[]): MediaItem[] => {
  if (!heroImages || heroImages.length === 0) return defaultMediaItems;
  
  return heroImages
    .filter(img => img.url)
    .map(img => ({
      type: "image" as const,
      src: img.url,
      alt: img.alt || "Hero image",
      headline: img.headline || "Welcome to",
      highlightText: img.highlightText || "Queenstop",
      subtitle: img.subtitle || "Premium services for every occasion.",
    }));
};

interface HeroCarouselProps {
  items?: MediaItem[];
  autoPlayInterval?: number;
  showControls?: boolean;
  showIndicators?: boolean;
  onSlideChange?: (index: number, item: MediaItem) => void;
}

const HeroCarousel = ({
  items: propItems,
  autoPlayInterval = 8000,
  showControls = true,
  showIndicators = true,
  onSlideChange,
}: HeroCarouselProps) => {
  const { config } = useSiteConfig();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Use admin-configured hero images if available, otherwise use props or defaults
  const items = propItems || (config.hero_images?.length > 0 ? convertHeroImages(config.hero_images) : defaultMediaItems);

  const goToNext = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    const nextIndex = (currentIndex + 1) % items.length;
    setCurrentIndex(nextIndex);
    onSlideChange?.(nextIndex, items[nextIndex]);
    setTimeout(() => setIsTransitioning(false), 700);
  }, [items, currentIndex, isTransitioning, onSlideChange]);

  const goToPrevious = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    const prevIndex = (currentIndex - 1 + items.length) % items.length;
    setCurrentIndex(prevIndex);
    onSlideChange?.(prevIndex, items[prevIndex]);
    setTimeout(() => setIsTransitioning(false), 700);
  }, [items, currentIndex, isTransitioning, onSlideChange]);

  const goToSlide = useCallback((index: number) => {
    if (isTransitioning || index === currentIndex) return;
    setIsTransitioning(true);
    setCurrentIndex(index);
    onSlideChange?.(index, items[index]);
    setTimeout(() => setIsTransitioning(false), 700);
  }, [items, currentIndex, isTransitioning, onSlideChange]);

  // Trigger initial slide content
  useEffect(() => {
    onSlideChange?.(0, items[0]);
  }, []);

  // Auto-play functionality
  useEffect(() => {
    if (autoPlayInterval <= 0) return;

    const interval = setInterval(goToNext, autoPlayInterval);
    return () => clearInterval(interval);
  }, [autoPlayInterval, goToNext]);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Media Slides */}
      {items.map((item, index) => (
        <div
          key={index}
          className={cn(
            "absolute inset-0 transition-all duration-[1500ms] ease-out",
            index === currentIndex 
              ? "opacity-100 z-10 scale-100" 
              : "opacity-0 z-0 scale-105"
          )}
          style={{
            transitionTimingFunction: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
          }}
        >
          {item.type === "video" ? (
            <video
              src={item.src}
              poster={item.poster}
              autoPlay
              loop
              muted
              playsInline
              className={cn(
                "w-full h-full object-cover transition-transform duration-[2000ms]",
                index === currentIndex ? "scale-100" : "scale-110"
              )}
              style={{
                transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            />
          ) : (
            <img
              src={item.src}
              alt={item.alt || `Slide ${index + 1}`}
              className={cn(
                "w-full h-full object-cover transition-transform duration-[2000ms]",
                index === currentIndex ? "scale-100" : "scale-110"
              )}
              style={{
                transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            />
          )}
        </div>
      ))}

      {/* Darker Gradient Overlay for better text visibility */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/30 z-20" />

      {/* Navigation Controls */}
      {showControls && items.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/40 transition-colors"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/40 transition-colors"
            aria-label="Next slide"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Slide Indicators */}
      {showIndicators && items.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-2">
          {items.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-300",
                index === currentIndex
                  ? "bg-primary w-6"
                  : "bg-white/50 hover:bg-white/80"
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export { defaultMediaItems };
export default HeroCarousel;
