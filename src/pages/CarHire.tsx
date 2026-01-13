import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BookingModal from "@/components/BookingModal";
import ProductImageModal from "@/components/ProductImageModal";
import { Button } from "@/components/ui/button";
import { Car, Shield, Clock, Award, Users, Calendar, Phone, MessageCircle, ArrowRight, Check, Loader2, MapPin, Route } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { formatKwacha, generateWhatsAppLink } from "@/hooks/useSiteConfig";
import { siteConfig } from "@/config/siteConfig";
import heroCar from "@/assets/hero-car.jpg";
import { cn } from "@/lib/utils";

const features = [
  { icon: Shield, title: "Fully Insured", description: "Comprehensive coverage for peace of mind" },
  { icon: Clock, title: "24/7 Support", description: "Round-the-clock assistance whenever you need" },
  { icon: Award, title: "Premium Fleet", description: "Only the finest vehicles in our collection" },
  { icon: Users, title: "Professional Chauffeurs", description: "Trained, licensed, and courteous drivers" },
];

const CarHire = () => {
  const { products: cars, loading } = useProducts("car");
  const [selectedCar, setSelectedCar] = useState<{ id: string; name: string } | null>(null);
  const [routeType, setRouteType] = useState<"local" | "outside">("local");
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  
  // Image modal state
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [selectedProductName, setSelectedProductName] = useState("");
  
  const whatsappLink = generateWhatsAppLink(
    siteConfig.admin.whatsappRaw, 
    "+260", 
    "Hello! I'm interested in booking a car."
  );

  const openImageModal = (car: { name: string; image_url: string | null; images?: string[] | null }) => {
    const allImages: string[] = [];
    if (car.image_url) allImages.push(car.image_url);
    if (car.images?.length) {
      car.images.forEach(img => {
        if (!allImages.includes(img)) allImages.push(img);
      });
    }
    if (allImages.length === 0) allImages.push(heroCar);
    
    setSelectedImages(allImages);
    setSelectedProductName(car.name);
    setImageModalOpen(true);
  };

  return (
    <div className="min-h-screen">
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0">
            <img src={heroCar} alt="Luxury car hire" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-hero" />
          </div>
          
          <div className="relative z-10 container mx-auto px-4 pt-32 pb-20 text-center">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 backdrop-blur-sm border border-primary/30 mb-6">
              <Car size={16} className="text-primary" />
              <span className="text-background text-sm font-medium">Premium Car Hire</span>
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-background mb-6">
              Drive in <span className="text-primary">Style</span>
            </h1>
            <p className="text-lg text-background/80 max-w-2xl mx-auto mb-8">
              Experience luxury on the road with our premium fleet of vehicles. 
              Perfect for weddings, corporate events, or any special occasion.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                <Button size="lg" className="rounded-full">
                  <MessageCircle size={20} className="mr-2" />
                  Book via WhatsApp
                </Button>
              </a>
              <a href={`tel:${siteConfig.phoneRaw}`}>
                <Button variant="outline" size="lg" className="rounded-full border-background text-background hover:bg-background hover:text-foreground">
                  <Phone size={20} className="mr-2" />
                  Call Us
                </Button>
              </a>
            </div>
          </div>
        </section>

        {/* Booking Form Section - Simplified */}
        <section className="py-16 bg-gradient-champagne -mt-20 relative z-20">
          <div className="container mx-auto px-4">
            <div className="bg-card rounded-2xl shadow-elevated p-8 max-w-4xl mx-auto">
              <h2 className="text-2xl font-display font-bold text-foreground mb-6 text-center">Quick Booking</h2>
              <form className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Route Type</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setRouteType("local")}
                      className={cn(
                        "flex-1 p-3 border rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2",
                        routeType === "local"
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background border-border text-foreground hover:border-primary/50"
                      )}
                    >
                      <MapPin size={16} />
                      Local
                    </button>
                    <button
                      type="button"
                      onClick={() => setRouteType("outside")}
                      className={cn(
                        "flex-1 p-3 border rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2",
                        routeType === "outside"
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background border-border text-foreground hover:border-primary/50"
                      )}
                    >
                      <Route size={16} />
                      Outside Lusaka
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Date</label>
                  <div className="flex items-center gap-2 p-3 border border-border rounded-lg bg-background">
                    <Calendar size={18} className="text-primary" />
                    <input 
                      type="date" 
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      className="flex-1 bg-transparent outline-none text-foreground" 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Time</label>
                  <div className="flex items-center gap-2 p-3 border border-border rounded-lg bg-background">
                    <Clock size={18} className="text-primary" />
                    <input 
                      type="time" 
                      value={bookingTime}
                      onChange={(e) => setBookingTime(e.target.value)}
                      className="flex-1 bg-transparent outline-none text-foreground" 
                    />
                  </div>
                </div>
                <div className="flex items-end">
                  <Button className="w-full h-[50px]">
                    Search Vehicles
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <span className="text-primary font-medium text-sm uppercase tracking-widest mb-4 block">Why Choose Us</span>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
                The Best for <span className="text-primary">You</span>
              </h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature) => (
                <div key={feature.title} className="text-center p-6 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-card transition-elegant group">
                  <div className="w-14 h-14 rounded-xl bg-primary mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-elegant">
                    <feature.icon className="text-primary-foreground" size={24} />
                  </div>
                  <h3 className="font-display font-semibold text-lg text-foreground mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Fleet Section */}
        <section className="py-20 bg-gradient-champagne">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <span className="text-primary font-medium text-sm uppercase tracking-widest mb-4 block">Our Fleet</span>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
                Premium <span className="text-primary">Vehicles</span>
              </h2>
            </div>
            
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : cars.length === 0 ? (
              <p className="text-center text-muted-foreground">No vehicles available at the moment.</p>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {cars.map((car) => {
                  const routeTags = (car as any).route_tags as string[] | null;
                  const images = (car as any).images as string[] | null;
                  const hasMultipleImages = (images?.length || 0) > 0 || car.image_url;
                  
                  return (
                    <div key={car.id} className="bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-elevated transition-elegant group">
                      <div 
                        className="relative h-56 overflow-hidden cursor-pointer"
                        onClick={() => openImageModal({ name: car.name, image_url: car.image_url, images })}
                      >
                        <img 
                          src={car.image_url || heroCar} 
                          alt={car.name} 
                          className="w-full h-full object-cover aspect-square transition-elegant group-hover:scale-110" 
                        />
                        {/* Route tags */}
                        <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                          {routeTags?.includes("local") && (
                            <span className="px-3 py-1 rounded-full bg-green-600/90 text-white text-xs font-medium">
                              Local Routes
                            </span>
                          )}
                          {routeTags?.includes("outside") && (
                            <span className="px-3 py-1 rounded-full bg-blue-600/90 text-white text-xs font-medium">
                              Outside Lusaka
                            </span>
                          )}
                          {!routeTags?.length && (
                            <span className="px-3 py-1 rounded-full bg-primary/90 text-primary-foreground text-xs font-medium">
                              Car Hire
                            </span>
                          )}
                        </div>
                        {/* Multiple images indicator */}
                        {images && images.length > 0 && (
                          <div className="absolute bottom-4 right-4 px-2 py-1 rounded bg-background/80 text-foreground text-xs">
                            +{images.length} photos
                          </div>
                        )}
                      </div>
                      <div className="p-6">
                        <h3 className="text-xl font-display font-semibold text-foreground mb-2">{car.name}</h3>
                        <p className="text-primary font-bold text-lg mb-4">From {formatKwacha(car.price)}/day</p>
                        {car.features && car.features.length > 0 && (
                          <ul className="space-y-2 mb-6">
                            {car.features.slice(0, 4).map((feature, idx) => (
                              <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Check size={16} className="text-primary" />
                                {feature}
                              </li>
                            ))}
                          </ul>
                        )}
                        {car.description && !car.features?.length && (
                          <p className="text-muted-foreground text-sm mb-6">{car.description}</p>
                        )}
                        <Button 
                          variant="outline" 
                          className="w-full group"
                          onClick={() => setSelectedCar({ id: car.id, name: car.name })}
                        >
                          Book Now
                          <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={16} />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-charcoal text-background">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to <span className="text-primary">Experience Luxury?</span>
            </h2>
            <p className="text-background/70 max-w-xl mx-auto mb-8">
              Contact us today and let us help you find the perfect vehicle for your needs.
            </p>
            <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="rounded-full">
                <MessageCircle size={20} className="mr-2" />
                Chat on WhatsApp
              </Button>
            </a>
          </div>
        </section>
      </main>

      <Footer />
      
      <BookingModal
        isOpen={!!selectedCar}
        onClose={() => setSelectedCar(null)}
        productName={selectedCar?.name}
        productId={selectedCar?.id}
        category="car"
      />
      
      <ProductImageModal
        images={selectedImages}
        productName={selectedProductName}
        isOpen={imageModalOpen}
        onClose={() => setImageModalOpen(false)}
      />
    </div>
  );
};

export default CarHire;
