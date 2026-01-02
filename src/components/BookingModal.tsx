import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { siteConfig } from "@/config/siteConfig";
import { bookingSchema } from "@/lib/validation";
import { getSafeErrorMessage } from "@/lib/error-handler";
import { z } from "zod";
import type { User } from "@supabase/supabase-js";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName?: string;
  productId?: string;
  category?: string;
}

interface ClientProfile {
  full_name: string | null;
  email: string | null;
  phone: string | null;
  default_pickup_location: string | null;
  default_dropoff_location: string | null;
}

const BookingModal = ({ isOpen, onClose, productName, productId, category }: BookingModalProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    pickupLocation: "",
    dropoffLocation: "",
  });

  // Load user profile data when modal opens
  useEffect(() => {
    if (isOpen) {
      loadUserProfile();
    }
  }, [isOpen]);

  const loadUserProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setUser(session.user);
      
      // Fetch profile data
      const { data: profile } = await supabase
        .from("client_profiles")
        .select("full_name, email, phone, default_pickup_location, default_dropoff_location")
        .eq("user_id", session.user.id)
        .single();

      if (profile) {
        setFormData({
          name: profile.full_name || "",
          email: profile.email || session.user.email || "",
          phone: profile.phone || "",
          pickupLocation: profile.default_pickup_location || "",
          dropoffLocation: profile.default_dropoff_location || "",
        });
      } else {
        setFormData(prev => ({
          ...prev,
          email: session.user.email || "",
        }));
      }
    }
  };

  const sendWhatsAppNotification = (bookingDetails: {
    name: string;
    email: string;
    phone: string;
    product: string;
    category: string;
  }) => {
    const message = `🔔 New Booking Alert!

Customer: ${bookingDetails.name}
Email: ${bookingDetails.email}
Phone: ${bookingDetails.phone}
Product: ${bookingDetails.product}
Category: ${bookingDetails.category}

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
      notes: `Product: ${productName || "Not specified"}, Category: ${category || "Not specified"}`,
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
        product_id: productId || null,
        pickup_location: formData.pickupLocation.trim() || null,
        dropoff_location: formData.dropoffLocation.trim() || null,
        notes: `Product: ${productName || "Not specified"}, Category: ${category || "Not specified"}`,
        user_id: user?.id || null, // Link booking to logged-in user
      });

      if (error) throw error;

      toast({
        title: "Booking Submitted!",
        description: "We'll get back to you within 24 hours.",
      });

      // Send WhatsApp notification to admin
      sendWhatsAppNotification({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        product: productName || "Not specified",
        category: category || "Not specified",
      });

      setFormData({
        name: "",
        email: "",
        phone: "",
        pickupLocation: "",
        dropoffLocation: "",
      });
      onClose();
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-display">
            Book {productName || "Now"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Name *</label>
            <Input
              placeholder="Your name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Email *</label>
            <Input
              type="email"
              placeholder="Email address"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Phone *</label>
            <Input
              type="tel"
              placeholder="Phone number"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
            />
          </div>
          {category === "car" && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Pick Up Location</label>
                <Input
                  placeholder="Enter location"
                  value={formData.pickupLocation}
                  onChange={(e) => setFormData({ ...formData, pickupLocation: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Drop Off Location</label>
                <Input
                  placeholder="Enter destination"
                  value={formData.dropoffLocation}
                  onChange={(e) => setFormData({ ...formData, dropoffLocation: e.target.value })}
                />
              </div>
            </>
          )}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit Booking
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BookingModal;