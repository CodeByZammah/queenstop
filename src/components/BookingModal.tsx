import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { siteConfig } from "@/config/siteConfig";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName?: string;
  productId?: string;
  category?: string;
}

const BookingModal = ({ isOpen, onClose, productName, productId, category }: BookingModalProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    pickupLocation: "",
    dropoffLocation: "",
  });

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
    if (!formData.name || !formData.email || !formData.phone) {
      toast({
        title: "Missing Information",
        description: "Please fill in name, email, and phone.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("bookings").insert({
        customer_name: formData.name,
        customer_email: formData.email,
        customer_phone: formData.phone,
        product_id: productId || null,
        pickup_location: formData.pickupLocation || null,
        dropoff_location: formData.dropoffLocation || null,
        notes: `Product: ${productName || "Not specified"}, Category: ${category || "Not specified"}`,
      });

      if (error) throw error;

      toast({
        title: "Booking Submitted!",
        description: "We'll get back to you within 24 hours.",
      });

      // Send WhatsApp notification to admin
      sendWhatsAppNotification({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
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
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong. Please try again.",
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