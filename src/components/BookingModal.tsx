import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, MapPin, Route } from "lucide-react";
import { siteConfig } from "@/config/siteConfig";
import { bookingSchema } from "@/lib/validation";
import { getSafeErrorMessage } from "@/lib/error-handler";
import { generateWhatsAppLink } from "@/hooks/useSiteConfig";
import { z } from "zod";
import { cn } from "@/lib/utils";
import type { User } from "@supabase/supabase-js";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName?: string;
  productId?: string;
  category?: string;
}

// Common country codes
const countryCodes = [
  { code: "+260", country: "Zambia" },
  { code: "+27", country: "South Africa" },
  { code: "+254", country: "Kenya" },
  { code: "+255", country: "Tanzania" },
  { code: "+256", country: "Uganda" },
  { code: "+263", country: "Zimbabwe" },
  { code: "+265", country: "Malawi" },
  { code: "+267", country: "Botswana" },
  { code: "+1", country: "USA/Canada" },
  { code: "+44", country: "UK" },
  { code: "+91", country: "India" },
];

const BookingModal = ({ isOpen, onClose, productName, productId, category }: BookingModalProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    countryCode: "+260",
    routeType: "local" as "local" | "outside",
    bookingDate: "",
    bookingTime: "",
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
        .select("full_name, email, phone")
        .eq("user_id", session.user.id)
        .single();

      if (profile) {
        setFormData(prev => ({
          ...prev,
          name: profile.full_name || "",
          email: profile.email || session.user.email || "",
          phone: profile.phone || "",
        }));
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
    countryCode: string;
    product: string;
    category: string;
    routeType?: string;
    bookingDate?: string;
    bookingTime?: string;
  }) => {
    const message = `🔔 New Booking Alert!

Customer: ${bookingDetails.name}
Email: ${bookingDetails.email}
Phone: ${bookingDetails.countryCode} ${bookingDetails.phone}
Product: ${bookingDetails.product}
Category: ${bookingDetails.category}
${bookingDetails.routeType ? `Route: ${bookingDetails.routeType === "local" ? "Local Routes" : "Outside Lusaka"}` : ""}
${bookingDetails.bookingDate ? `Date: ${bookingDetails.bookingDate}` : ""}
${bookingDetails.bookingTime ? `Time: ${bookingDetails.bookingTime}` : ""}

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
        country_code: formData.countryCode,
        product_id: productId || null,
        route_type: category === "car" ? formData.routeType : null,
        pickup_date: formData.bookingDate || null,
        booking_time: formData.bookingTime || null,
        notes: `Product: ${productName || "Not specified"}, Category: ${category || "Not specified"}`,
        user_id: user?.id || null,
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
        countryCode: formData.countryCode,
        product: productName || "Not specified",
        category: category || "Not specified",
        routeType: category === "car" ? formData.routeType : undefined,
        bookingDate: formData.bookingDate || undefined,
        bookingTime: formData.bookingTime || undefined,
      });

      setFormData({
        name: "",
        email: "",
        phone: "",
        countryCode: "+260",
        routeType: "local",
        bookingDate: "",
        bookingTime: "",
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
            {category === "car" ? "Book" : "Enquire About"} {productName || "Now"}
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
            <div className="flex gap-2">
              <select
                value={formData.countryCode}
                onChange={(e) => setFormData({ ...formData, countryCode: e.target.value })}
                className="w-28 p-2 border border-border rounded-lg bg-background text-foreground text-sm"
              >
                {countryCodes.map((cc) => (
                  <option key={cc.code} value={cc.code}>
                    {cc.code} {cc.country}
                  </option>
                ))}
              </select>
              <Input
                type="tel"
                placeholder="Phone number"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
                className="flex-1"
              />
            </div>
          </div>
          
          {category === "car" && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Route Type</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, routeType: "local" })}
                    className={cn(
                      "flex-1 p-3 border rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2",
                      formData.routeType === "local"
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background border-border text-foreground hover:border-primary/50"
                    )}
                  >
                    <MapPin size={16} />
                    Local
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, routeType: "outside" })}
                    className={cn(
                      "flex-1 p-3 border rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2",
                      formData.routeType === "outside"
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background border-border text-foreground hover:border-primary/50"
                    )}
                  >
                    <Route size={16} />
                    Outside Lusaka
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Date</label>
                  <Input
                    type="date"
                    value={formData.bookingDate}
                    onChange={(e) => setFormData({ ...formData, bookingDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Time</label>
                  <Input
                    type="time"
                    value={formData.bookingTime}
                    onChange={(e) => setFormData({ ...formData, bookingTime: e.target.value })}
                  />
                </div>
              </div>
            </>
          )}
          
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {category === "car" ? "Submit Booking" : "Submit Enquiry"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BookingModal;
