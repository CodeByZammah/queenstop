import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Bride",
    content: "The wedding accessories were absolutely stunning! Every piece was carefully crafted and the service was impeccable. Made my special day even more magical.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
  },
  {
    name: "Michael Chen",
    role: "Business Executive",
    content: "Queenstop's car hire service is unmatched. The vehicles are immaculate, and the chauffeurs are professional. Perfect for corporate events.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop",
  },
  {
    name: "Emily Rodriguez",
    role: "Jewellery Collector",
    content: "The jewellery collection is breathtaking. Each piece tells a story. The quality and craftsmanship exceeded my expectations. Truly elegant!",
    rating: 5,
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop",
  },
];

const Testimonials = () => {
  return (
    <section className="py-24 bg-charcoal text-cream">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-gold-light font-medium text-sm uppercase tracking-widest mb-4 block">
            Testimonials
          </span>
          <h2 className="text-3xl md:text-5xl font-display font-bold mb-6">
            What Our <span className="text-gold-light">Clients</span> Say
          </h2>
          <p className="text-cream/70 text-lg">
            Don't just take our word for it — hear from our satisfied customers 
            who have experienced the Queenstop difference.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.name}
              className="relative p-8 rounded-2xl bg-charcoal-light/50 border border-cream/10 hover:border-gold/30 transition-elegant group"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              {/* Quote Icon */}
              <Quote className="absolute top-6 right-6 text-gold/20 w-10 h-10" />

              {/* Rating */}
              <div className="flex gap-1 mb-6">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-gold text-gold" />
                ))}
              </div>

              {/* Content */}
              <p className="text-cream/80 leading-relaxed mb-8 italic font-accent text-lg">
                "{testimonial.content}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-4">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-gold/30"
                />
                <div>
                  <p className="font-semibold text-cream">{testimonial.name}</p>
                  <p className="text-gold-light text-sm">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
