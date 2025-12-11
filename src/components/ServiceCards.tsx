import { Link } from "react-router-dom";
import { Car, Gem, Heart, ArrowRight } from "lucide-react";
import heroCar from "@/assets/hero-car.jpg";
import jewellery from "@/assets/jewellery.jpg";
import wedding from "@/assets/wedding-accessories.jpg";

const services = [
  {
    icon: Car,
    title: "Car Hire",
    description: "Premium luxury vehicles for every occasion. Experience comfort, style, and reliability with our elite fleet.",
    image: heroCar,
    href: "/car-hire",
    accent: "from-gold/20 to-gold/5",
  },
  {
    icon: Gem,
    title: "Luxury Jewellery",
    description: "Exquisite handcrafted pieces that tell your story. Timeless elegance for the modern woman.",
    image: jewellery,
    href: "/jewellery",
    accent: "from-charcoal/20 to-charcoal/5",
  },
  {
    icon: Heart,
    title: "Wedding Accessories",
    description: "Complete your perfect day with our stunning bridal collection. From veils to crowns, every detail matters.",
    image: wedding,
    href: "/wedding",
    accent: "from-champagne to-cream",
  },
];

const ServiceCards = () => {
  return (
    <section className="py-24 bg-gradient-champagne">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-primary font-medium text-sm uppercase tracking-widest mb-4 block">
            Our Services
          </span>
          <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-6">
            Discover the <span className="text-primary">Queenstop</span> Experience
          </h2>
          <p className="text-muted-foreground text-lg">
            Three exceptional services united by one commitment — delivering luxury 
            and elegance in everything we do.
          </p>
        </div>

        {/* Service Cards Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <Link
              key={service.title}
              to={service.href}
              className="group relative bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-elevated transition-elegant"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              {/* Image */}
              <div className="relative h-64 overflow-hidden">
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-full object-cover transition-elegant group-hover:scale-110"
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${service.accent} opacity-60`} />
                
                {/* Icon Badge */}
                <div className="absolute top-4 left-4 w-12 h-12 rounded-full bg-primary/90 backdrop-blur-sm flex items-center justify-center shadow-gold">
                  <service.icon className="text-primary-foreground" size={24} />
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl font-display font-semibold text-foreground mb-3 group-hover:text-primary transition-smooth">
                  {service.title}
                </h3>
                <p className="text-muted-foreground mb-4 line-clamp-2">
                  {service.description}
                </p>
                <div className="flex items-center text-primary font-medium text-sm">
                  <span>Explore</span>
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-2 transition-transform" />
                </div>
              </div>

              {/* Hover Border Effect */}
              <div className="absolute inset-0 border-2 border-transparent group-hover:border-primary/30 rounded-2xl transition-elegant pointer-events-none" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServiceCards;
