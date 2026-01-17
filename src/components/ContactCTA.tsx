import { Button } from "@/components/ui/button";
import { MessageCircle, Phone, ArrowRight } from "lucide-react";
import { siteConfig, getWhatsAppLink } from "@/config/siteConfig";

const ContactCTA = () => {
  const whatsappLink = getWhatsAppLink();
  return (
    <section className="py-20 bg-muted">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6">
            <MessageCircle size={16} />
            Get in Touch
          </span>

          {/* Headline */}
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            Ready to Experience <br />
            <span className="text-primary">True Elegance?</span>
          </h2>

          {/* Description */}
          <p className="text-muted-foreground max-w-2xl mx-auto mb-10">
            Whether you're looking for the perfect vehicle, stunning jewellery, or 
            wedding accessories, we're here to help. Reach out today and let's make 
            your dream a reality.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="group w-full sm:w-auto rounded-full">
                <MessageCircle size={18} className="mr-2" />
                Chat on WhatsApp
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={16} />
              </Button>
            </a>
            <a href={`tel:${siteConfig.phoneRaw}`}>
              <Button variant="outline" size="lg" className="w-full sm:w-auto rounded-full">
                <Phone size={18} className="mr-2" />
                Call Us Now
              </Button>
            </a>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap justify-center gap-8 mt-14 pt-8 border-t border-border">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">100%</p>
              <p className="text-sm text-muted-foreground">Satisfaction</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">24/7</p>
              <p className="text-sm text-muted-foreground">Support</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">Fast</p>
              <p className="text-sm text-muted-foreground">Response</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">Premium</p>
              <p className="text-sm text-muted-foreground">Quality</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactCTA;
