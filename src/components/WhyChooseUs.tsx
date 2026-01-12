import { DollarSign, Shield, Smartphone, Check } from "lucide-react";

const features = [
  {
    icon: DollarSign,
    title: "Performant & Powerful",
    description: "Premium quality services at competitive prices with flexible packages.",
    variant: "yellow" as const,
  },
  {
    icon: Shield,
    title: "Safety First",
    description: "Your safety and security is our top priority with insured services.",
    variant: "orange" as const,
    guarantees: ["Guarantee", "Guarantee"],
  },
  {
    icon: Smartphone,
    title: "100% Digital",
    description: "Easy online booking and management from any device, anywhere.",
    variant: "white" as const,
    platforms: ["Apple", "Android", "Online"],
  },
];

const WhyChooseUs = () => {
  return (
    <section className="py-20 bg-muted">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-primary font-semibold text-sm uppercase tracking-wider mb-3 block">
            What We Offer
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            We Offer The Best <span className="text-primary">For You</span>
          </h2>
          <p className="text-muted-foreground">
            Premium services designed to exceed your expectations with quality,
            safety, and convenience at every step.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {features.map((feature) => (
            <div
              key={feature.title}
              className={`relative p-6 rounded-2xl transition-elegant hover:scale-[1.02] ${
                feature.variant === "yellow"
                  ? "bg-primary text-primary-foreground"
                  : feature.variant === "orange"
                  ? "bg-accent text-accent-foreground"
                  : "bg-card border border-border shadow-card"
              }`}
            >
              {/* Icon */}
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-5 ${
                feature.variant === "white" 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-background/20"
              }`}>
                <feature.icon size={28} />
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold mb-3">
                {feature.title}
              </h3>
              <p className={`text-sm leading-relaxed mb-4 ${
                feature.variant === "white" ? "text-muted-foreground" : "opacity-90"
              }`}>
                {feature.description}
              </p>


              {/* Guarantees */}
              {feature.guarantees && (
                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-current/20">
                  {feature.guarantees.map((g, i) => (
                    <span key={i} className="flex items-center gap-1 text-sm">
                      <Check size={14} className="text-green-400" />
                      {g}
                    </span>
                  ))}
                </div>
              )}

              {/* Platforms */}
              {feature.platforms && (
                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border">
                  {feature.platforms.map((p) => (
                    <span key={p} className="flex items-center gap-1 text-sm text-primary">
                      <span className="w-2 h-2 rounded-full bg-primary" />
                      {p}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
