import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Phone, Mail, MapPin, MessageCircle, Send, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { siteConfig, getWhatsAppLink } from "@/config/siteConfig";
import { Loader2 } from "lucide-react";

const Contact = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    service: "",
    message: "",
  });

  const sendWhatsAppNotification = (details: {
    name: string;
    email: string;
    message: string;
  }) => {
    const msg = `📩 New Contact Message!

From: ${details.name}
Email: ${details.email}
Message: ${details.message.substring(0, 200)}${details.message.length > 200 ? "..." : ""}

Please check the admin panel for full details.`;

    const whatsappUrl = `https://api.whatsapp.com/send?phone=${siteConfig.admin.whatsappRaw}&text=${encodeURIComponent(msg)}`;
    window.open(whatsappUrl, "_blank");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("contact_submissions").insert({
        name: formData.name,
        email: formData.email,
        phone: formData.phone || null,
        subject: formData.service || null,
        message: formData.message,
      });

      if (error) throw error;

      toast({
        title: "Message Sent!",
        description: "We'll get back to you within 24 hours.",
      });

      // Send WhatsApp notification
      sendWhatsAppNotification({
        name: formData.name,
        email: formData.email,
        message: formData.message,
      });

      setFormData({ name: "", email: "", phone: "", service: "", message: "" });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen">
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="pt-28 sm:pt-32 pb-12 sm:pb-20 bg-gradient-champagne">
          <div className="container mx-auto px-4 text-center">
            <span className="text-primary font-medium text-xs sm:text-sm uppercase tracking-widest mb-4 block">Contact Us</span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-foreground mb-4 sm:mb-6">
              Get in <span className="text-primary">Touch</span>
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              Have questions or ready to experience {siteConfig.businessName}? We'd love to hear from you. 
            </p>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-12 sm:py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-8 sm:gap-12">
              {/* Contact Info */}
              <div>
                <h2 className="text-xl sm:text-2xl font-display font-bold text-foreground mb-6 sm:mb-8">Contact Information</h2>
                
                <div className="space-y-4 sm:space-y-6 mb-8 sm:mb-10">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
                      <Phone className="text-primary-foreground" size={18} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1 text-sm sm:text-base">Phone</h3>
                      <a href={`tel:${siteConfig.phoneRaw}`} className="text-muted-foreground hover:text-primary transition-smooth text-sm sm:text-base">
                        {siteConfig.phone}
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
                      <Mail className="text-primary-foreground" size={18} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1 text-sm sm:text-base">Email</h3>
                      <a href={`mailto:${siteConfig.email}`} className="text-muted-foreground hover:text-primary transition-smooth text-sm sm:text-base break-all">
                        {siteConfig.email}
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
                      <MapPin className="text-primary-foreground" size={18} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1 text-sm sm:text-base">Address</h3>
                      <p className="text-muted-foreground text-sm sm:text-base">
                        {siteConfig.address.street}<br />
                        {siteConfig.address.city}, {siteConfig.address.state} {siteConfig.address.zip}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
                      <Clock className="text-primary-foreground" size={18} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1 text-sm sm:text-base">Business Hours</h3>
                      <p className="text-muted-foreground text-sm sm:text-base">
                        {siteConfig.businessHours.weekdays}<br />
                        {siteConfig.businessHours.weekend}
                      </p>
                    </div>
                  </div>
                </div>

                {/* WhatsApp CTA */}
                <div className="p-4 sm:p-6 rounded-2xl bg-charcoal text-background">
                  <h3 className="font-semibold text-base sm:text-lg mb-2">Quick Response?</h3>
                  <p className="text-background/70 mb-4 text-sm sm:text-base">Chat with us on WhatsApp!</p>
                  <a href={getWhatsAppLink()} target="_blank" rel="noopener noreferrer">
                    <Button className="w-full">
                      <MessageCircle size={18} className="mr-2" />
                      Chat on WhatsApp
                    </Button>
                  </a>
                </div>
              </div>

              {/* Contact Form */}
              <div>
                <div className="bg-card rounded-2xl shadow-card p-5 sm:p-8">
                  <h2 className="text-xl sm:text-2xl font-display font-bold text-foreground mb-4 sm:mb-6">Send a Message</h2>
                  <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs sm:text-sm font-medium text-foreground">Full Name *</label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          placeholder="John Doe"
                          className="w-full p-3 border border-border rounded-lg bg-background text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-smooth text-sm sm:text-base"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs sm:text-sm font-medium text-foreground">Email *</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          placeholder="john@example.com"
                          className="w-full p-3 border border-border rounded-lg bg-background text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-smooth text-sm sm:text-base"
                        />
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs sm:text-sm font-medium text-foreground">Phone</label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder={siteConfig.phone}
                          className="w-full p-3 border border-border rounded-lg bg-background text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-smooth text-sm sm:text-base"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs sm:text-sm font-medium text-foreground">Service Interest</label>
                        <select
                          name="service"
                          value={formData.service}
                          onChange={handleChange}
                          className="w-full p-3 border border-border rounded-lg bg-background text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-smooth text-sm sm:text-base"
                        >
                          <option value="">Select a service</option>
                          <option value="car-hire">Car Hire</option>
                          <option value="jewellery">Jewellery</option>
                          <option value="wedding">Wedding Accessories</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs sm:text-sm font-medium text-foreground">Message *</label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={5}
                        placeholder="Tell us about your needs..."
                        className="w-full p-3 border border-border rounded-lg bg-background text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-smooth resize-none text-sm sm:text-base"
                      />
                    </div>
                    <Button size="lg" className="w-full" disabled={loading}>
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      <Send size={18} className="mr-2" />
                      Send Message
                    </Button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;