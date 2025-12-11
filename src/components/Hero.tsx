import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import heroCar from "@/assets/hero-car.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-screen">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={heroCar}
          alt="Luxury car hire service"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-charcoal/80 via-charcoal/50 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 pt-48 pb-32">
        <div className="max-w-xl">
          {/* Badge */}
          <p className="text-primary font-medium text-sm uppercase tracking-wider mb-4 opacity-0 animate-fade-up">
            We Are Most Trusted Service
          </p>

          {/* Headline */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-background leading-tight mb-6 opacity-0 animate-fade-up animation-delay-200">
            Enjoy Your
            <span className="block text-primary">Comfortable Trip</span>
          </h1>

          {/* Subtitle */}
          <p className="text-background/80 text-base md:text-lg mb-8 opacity-0 animate-fade-up animation-delay-400">
            Premium car hire, exquisite jewellery, and elegant wedding accessories.
            Where luxury meets exceptional service.
          </p>

          {/* CTA Button */}
          <div className="opacity-0 animate-fade-up animation-delay-600">
            <Button variant="outline" size="lg" className="rounded-full border-background text-background hover:bg-background hover:text-foreground">
              Getting Started
            </Button>
          </div>
        </div>
      </div>

      {/* Floating Booking Form */}
      <div className="relative z-20 container mx-auto px-4 -mt-16">
        <div className="bg-card rounded-xl shadow-elevated p-6 md:p-8 max-w-5xl mx-auto">
          <div className="grid md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Name</label>
              <Input placeholder="Your name" className="h-12" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <Input type="email" placeholder="Email address" className="h-12" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Phone</label>
              <Input type="tel" placeholder="Phone number" className="h-12" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Service</label>
              <Select>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Select Service" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="car-hire">Car Hire</SelectItem>
                  <SelectItem value="jewellery">Jewellery</SelectItem>
                  <SelectItem value="wedding">Wedding Accessories</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-4 mt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Pick Up Address</label>
              <Input placeholder="Enter location" className="h-12" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Drop Off Address</label>
              <Input placeholder="Enter destination" className="h-12" />
            </div>
            <div className="flex items-end">
              <Button size="lg" className="w-full h-12 rounded-lg">
                Submit
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
