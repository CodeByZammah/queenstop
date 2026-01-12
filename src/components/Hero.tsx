import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { siteConfig, getWhatsAppLink } from "@/config/siteConfig";
import HeroCarousel, { MediaItem, defaultMediaItems } from "@/components/HeroCarousel";
import { Loader2 } from "lucide-react";
import { bookingSchema } from "@/lib/validation";
import { getSafeErrorMessage } from "@/lib/error-handler";
import { z } from "zod";

const Hero = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [currentSlide, setCurrentSlide] = useState<MediaItem>(defaultMediaItems[0]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    service: "",
    pickupLocation: "",
    dropoffLocation: "",
  });

  const sendNotifications = async (bookingDetails: {
    name: string;
    email: string;
    phone: string;
    service: string;
    pickupLocation?: string;
    dropoffLocation?: string;
  }) => {
    // Send WhatsApp notification
    const message = `🔔 New Booking from Homepage!

Customer: ${bookingDetails.name}
Email: ${bookingDetails.email}
Phone: ${bookingDetails.phone}
Service: ${bookingDetails.service}

Please check the admin panel for full details.`;

    const whatsappUrl = `https://api.whatsapp.com/send?phone=${siteConfig.admin.whatsappRaw}&text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");

    // Send email notification
    try {
      await supabase.functions.invoke("send-notification", {
        body: {
          type: "booking",
          data: {
            customer_name: bookingDetails.name,
            customer_email: bookingDetails.email,
            customer_phone: bookingDetails.phone,
            service: bookingDetails.service,
            pickup_location: bookingDetails.pickupLocation,
            dropoff_location: bookingDetails.dropoffLocation,
          },
        },
      });
    } catch (error) {
      console.error("Failed to send email notification:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate input using Zod schema
    const bookingData = {
      customer_name: formData.name,
      customer_email: formData.email,
      customer_phone: formData.phone,
      pickup_location: formData.pickupLocation || undefined,
      dropoff_location: formData.dropoffLocation || undefined,
      notes: `Service: ${formData.service || "Not specified"}`,
    };

    try {
      bookingSchema.parse(bookingData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation Error",
          description: error.errors[0].message,
          variant: "destructive",
        });
        return;
      }
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("bookings").insert({
        customer_name: formData.name.trim(),
        customer_email: formData.email.trim(),
        customer_phone: formData.phone.trim(),
        pickup_location: formData.pickupLocation.trim() || null,
        dropoff_location: formData.dropoffLocation.trim() || null,
        notes: `Service: ${formData.service || "Not specified"}`,
      });

      if (error) throw error;

      toast({
        title: "Booking Submitted!",
        description: "We'll get back to you within 24 hours.",
      });

      // Send WhatsApp and email notifications
      sendNotifications({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        service: formData.service || "Not specified",
        pickupLocation: formData.pickupLocation.trim(),
        dropoffLocation: formData.dropoffLocation.trim(),
      });

      setFormData({
        name: "",
        email: "",
        phone: "",
        service: "",
        pickupLocation: "",
        dropoffLocation: "",
      });
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: getSafeErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSlideChange = (_index: number, item: MediaItem) => {
    setCurrentSlide(item);
  };

  return (
    <section className="relative min-h-screen">
      {/* Background Media Carousel */}
      <HeroCarousel onSlideChange={handleSlideChange} />

      {/* Content */}
      <div className="relative z-30 container mx-auto px-4 pt-36 sm:pt-48 pb-24 sm:pb-32">
        <div className="max-w-xl">
          {/* Badge */}
          <p className="text-primary font-semibold text-xs sm:text-sm uppercase tracking-wider mb-4 drop-shadow-lg">
            We Are Most Trusted Service
          </p>

          {/* Dynamic Headline */}
          <h1 
            key={currentSlide.headline} 
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6 drop-shadow-xl animate-fade-in"
          >
            {currentSlide.headline}
            <span className="block text-primary drop-shadow-lg">{currentSlide.highlightText}</span>
          </h1>

          {/* Dynamic Subtitle */}
          <p 
            key={currentSlide.subtitle}
            className="text-white text-sm sm:text-base md:text-lg mb-8 drop-shadow-lg animate-fade-in"
          >
            {currentSlide.subtitle}
          </p>

          {/* CTA Button */}
          <div>
            <a href={getWhatsAppLink()} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="lg" className="rounded-full border-white text-white hover:bg-white hover:text-foreground font-semibold shadow-lg">
                Get Started
              </Button>
            </a>
          </div>
        </div>
      </div>

      {/* Floating Booking Form */}
      <div className="relative z-20 container mx-auto px-4 -mt-8 sm:-mt-16">
        <form onSubmit={handleSubmit} className="bg-card rounded-xl shadow-elevated p-4 sm:p-6 md:p-8 max-w-5xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-medium text-muted-foreground">Name *</label>
              <Input
                placeholder="Your name"
                className="h-10 sm:h-12"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-medium text-muted-foreground">Email *</label>
              <Input
                type="email"
                placeholder="Email address"
                className="h-10 sm:h-12"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-medium text-muted-foreground">Phone *</label>
              <Input
                type="tel"
                placeholder="Phone number"
                className="h-10 sm:h-12"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-medium text-muted-foreground">Service</label>
              <Select value={formData.service} onValueChange={(value) => setFormData({ ...formData, service: value, pickupLocation: "", dropoffLocation: "" })}>
                <SelectTrigger className="h-10 sm:h-12">
                  <SelectValue placeholder="Select Service" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="car-hire">Car Hire</SelectItem>
                  <SelectItem value="jewellery">Jewellery</SelectItem>
                  <SelectItem value="wedding">Wedding Accessories</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Car Hire specific fields - only show for car-hire */}
          {formData.service === "car-hire" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-3 sm:mt-4">
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-medium text-muted-foreground">Pick Up Address</label>
                <Input
                  placeholder="Enter pickup location"
                  className="h-10 sm:h-12"
                  value={formData.pickupLocation}
                  onChange={(e) => setFormData({ ...formData, pickupLocation: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-medium text-muted-foreground">Drop Off Address</label>
                <Input
                  placeholder="Enter drop off location"
                  className="h-10 sm:h-12"
                  value={formData.dropoffLocation}
                  onChange={(e) => setFormData({ ...formData, dropoffLocation: e.target.value })}
                />
              </div>
            </div>
          )}
          
          <div className="mt-3 sm:mt-4">
            <Button type="submit" size="lg" className="w-full sm:w-auto h-10 sm:h-12 rounded-lg px-8" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {formData.service === "car-hire" ? "Book Now" : formData.service ? "Submit Enquiry" : "Get Started"}
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default Hero;