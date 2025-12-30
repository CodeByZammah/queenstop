import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { siteConfig, getWhatsAppLink } from "@/config/siteConfig";
import heroCar from "@/assets/hero-car.jpg";
import { Loader2 } from "lucide-react";
import { bookingSchema } from "@/lib/validation";
import { getSafeErrorMessage } from "@/lib/error-handler";
import { z } from "zod";

const Hero = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    service: "",
    pickupLocation: "",
    dropoffLocation: "",
  });

  const sendWhatsAppNotification = (bookingDetails: {
    name: string;
    email: string;
    phone: string;
    service: string;
  }) => {
    const message = `🔔 New Booking from Homepage!

Customer: ${bookingDetails.name}
Email: ${bookingDetails.email}
Phone: ${bookingDetails.phone}
Service: ${bookingDetails.service}

Please check the admin panel for full details.`;

    const whatsappUrl = `https://api.whatsapp.com/send?phone=${siteConfig.admin.whatsappRaw}&text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
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

      // Send WhatsApp notification
      sendWhatsAppNotification({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        service: formData.service || "Not specified",
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

  return (
    <section className="relative min-h-screen">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={heroCar}
          alt="Luxury car hire service"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-charcoal/80 via-charcoal/50 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 pt-36 sm:pt-48 pb-24 sm:pb-32">
        <div className="max-w-xl">
          {/* Badge */}
          <p className="text-primary font-medium text-xs sm:text-sm uppercase tracking-wider mb-4 opacity-0 animate-fade-up">
            We Are Most Trusted Service
          </p>

          {/* Headline */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-background leading-tight mb-6 opacity-0 animate-fade-up animation-delay-200">
            Enjoy Your
            <span className="block text-primary">Comfortable Trip</span>
          </h1>

          {/* Subtitle */}
          <p className="text-background/80 text-sm sm:text-base md:text-lg mb-8 opacity-0 animate-fade-up animation-delay-400">
            {siteConfig.tagline}. Premium car hire, exquisite jewellery, and elegant wedding accessories.
          </p>

          {/* CTA Button */}
          <div className="opacity-0 animate-fade-up animation-delay-600">
            <a href={getWhatsAppLink()} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="lg" className="rounded-full border-background text-background hover:bg-background hover:text-foreground">
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
              <Select value={formData.service} onValueChange={(value) => setFormData({ ...formData, service: value })}>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mt-3 sm:mt-4">
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-medium text-muted-foreground">Pick Up Address</label>
              <Input
                placeholder="Enter location"
                className="h-10 sm:h-12"
                value={formData.pickupLocation}
                onChange={(e) => setFormData({ ...formData, pickupLocation: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-medium text-muted-foreground">Drop Off Address</label>
              <Input
                placeholder="Enter destination"
                className="h-10 sm:h-12"
                value={formData.dropoffLocation}
                onChange={(e) => setFormData({ ...formData, dropoffLocation: e.target.value })}
              />
            </div>
            <div className="flex items-end sm:col-span-2 md:col-span-1">
              <Button type="submit" size="lg" className="w-full h-10 sm:h-12 rounded-lg" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Booking
              </Button>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
};

export default Hero;