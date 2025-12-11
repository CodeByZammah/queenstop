import { Shield, Clock, Award, Headphones, Sparkles, Heart } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Premium Quality",
    description: "Every product and service meets our highest standards of excellence and craftsmanship.",
    color: "bg-primary",
  },
  {
    icon: Clock,
    title: "24/7 Availability",
    description: "Round-the-clock service and support for all your luxury needs, whenever you need us.",
    color: "bg-charcoal",
  },
  {
    icon: Award,
    title: "Award Winning",
    description: "Recognized for exceptional service and unmatched customer satisfaction.",
    color: "bg-gold-dark",
  },
  {
    icon: Headphones,
    title: "Dedicated Support",
    description: "Personal concierge service to ensure your experience exceeds expectations.",
    color: "bg-primary",
  },
  {
    icon: Sparkles,
    title: "Authentic & Genuine",
    description: "100% authentic products with certificates of authenticity and quality guarantees.",
    color: "bg-charcoal",
  },
  {
    icon: Heart,
    title: "Customer First",
    description: "Your satisfaction is our priority. We go above and beyond for every client.",
    color: "bg-gold-dark",
  },
];

const WhyChooseUs = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-primary font-medium text-sm uppercase tracking-widest mb-4 block">
            Why Choose Us
          </span>
          <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-6">
            The Best for <span className="text-primary">You</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            At Queenstop, we don't just offer services — we deliver experiences that 
            exceed expectations and create lasting memories.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group relative p-8 rounded-2xl bg-card border border-border hover:border-primary/30 shadow-soft hover:shadow-card transition-elegant"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Icon */}
              <div className={`w-14 h-14 rounded-xl ${feature.color} flex items-center justify-center mb-6 shadow-soft group-hover:scale-110 transition-elegant`}>
                <feature.icon className="text-primary-foreground" size={24} />
              </div>

              {/* Content */}
              <h3 className="text-xl font-display font-semibold text-foreground mb-3">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>

              {/* Decorative Element */}
              <div className="absolute top-4 right-4 w-20 h-20 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-elegant" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
