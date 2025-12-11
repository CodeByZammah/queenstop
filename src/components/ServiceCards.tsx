import { Link } from "react-router-dom";
import { Car, Gem, Heart, ArrowRight } from "lucide-react";
import heroCar from "@/assets/hero-car.jpg";
import jewellery from "@/assets/jewellery.jpg";
import wedding from "@/assets/wedding-accessories.jpg";

const services = [
  {
    icon: Car,
    title: "Car Hire",
    description: "Premium luxury vehicles for every occasion. Experience comfort, style, and reliability.",
    image: heroCar,
    href: "/car-hire",
  },
  {
    icon: Gem,
    title: "Luxury Jewellery",
    description: "Exquisite handcrafted pieces that tell your story. Timeless elegance for the modern woman.",
    image: jewellery,
    href: "/jewellery",
  },
  {
    icon: Heart,
    title: "Wedding Accessories",
    description: "Complete your perfect day with our stunning bridal collection. Every detail matters.",
    image: wedding,
    href: "/wedding",
  },
];

const ServiceCards = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-primary font-semibold text-sm uppercase tracking-wider mb-3 block">
            Our Services
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Discover the <span className="text-primary">Queenstop</span> Experience
          </h2>
          <p className="text-muted-foreground">
            Three exceptional services united by one commitment — delivering luxury 
            and elegance in everything we do.
          </p>
        </div>

        {/* Service Cards Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {services.map((service) => (
            <Link
              key={service.title}
              to={service.href}
              className="group relative bg-card rounded-xl overflow-hidden shadow-card hover:shadow-elevated transition-elegant"
            >
              {/* Image */}
              <div className="relative h-56 overflow-hidden">
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-full object-cover transition-elegant group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 to-transparent" />
                
                {/* Icon Badge */}
                <div className="absolute top-4 left-4 w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-yellow">
                  <service.icon className="text-primary-foreground" size={22} />
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-smooth">
                  {service.title}
                </h3>
                <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                  {service.description}
                </p>
                <div className="flex items-center text-primary font-semibold text-sm">
                  <span>Explore</span>
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-2 transition-transform" />
                </div>
              </div>

              {/* Hover Border Effect */}
              <div className="absolute inset-0 border-2 border-transparent group-hover:border-primary/40 rounded-xl transition-elegant pointer-events-none" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServiceCards;
