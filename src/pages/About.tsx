import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Award, Users, Target, Heart, ArrowRight, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useSiteConfig } from "@/hooks/useSiteConfig";
import logomark from "@/assets/logomark.png";

const values = [
  { icon: Award, title: "Excellence", description: "We strive for perfection in everything we do, delivering nothing but the best." },
  { icon: Users, title: "Customer First", description: "Your satisfaction is our priority. We listen, understand, and deliver." },
  { icon: Target, title: "Integrity", description: "Honest, transparent, and ethical in all our business practices." },
  { icon: Heart, title: "Passion", description: "We love what we do, and it shows in every service we provide." },
];

const milestones = [
  { year: "2014", title: "The Beginning", description: "Queenstop was founded with a vision to bring luxury to everyone." },
  { year: "2017", title: "Expansion", description: "Added jewellery and wedding accessories to our service portfolio." },
  { year: "2020", title: "Digital Transformation", description: "Launched online services and enhanced customer experience." },
  { year: "2024", title: "Today", description: "Serving over 500+ happy customers with premium services." },
];

const About = () => {
  const { config, loading } = useSiteConfig();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const { site_content } = config;

  return (
    <div className="min-h-screen">
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="pt-32 pb-20 bg-gradient-champagne">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <span className="text-primary font-medium text-sm uppercase tracking-widest mb-4 block">About Us</span>
                <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-6">
                  {site_content.about_title.includes("Queenstop") ? (
                    <>
                      The <span className="text-primary">Queenstop</span> Story
                    </>
                  ) : (
                    site_content.about_title
                  )}
                </h1>
                <p className="text-lg text-muted-foreground mb-6">
                  {site_content.about_description}
                </p>
                <p className="text-muted-foreground mb-8">
                  {site_content.about_extended}
                </p>
                <Link to="/contact">
                  <Button size="lg" className="rounded-full">
                    Get in Touch
                    <ArrowRight className="ml-2" size={18} />
                  </Button>
                </Link>
              </div>
              <div className="relative">
                <div className="aspect-square rounded-2xl bg-charcoal flex items-center justify-center p-12">
                  <img src={logomark} alt="Queenstop" className="w-full max-w-xs" />
                </div>
                <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-primary rounded-2xl -z-10" />
              </div>
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12">
              <div className="p-8 rounded-2xl bg-card border border-border">
                <h2 className="text-2xl font-display font-bold text-foreground mb-4">Our Mission</h2>
                <p className="text-muted-foreground">
                  {site_content.mission}
                </p>
              </div>
              <div className="p-8 rounded-2xl bg-charcoal text-background">
                <h2 className="text-2xl font-bold mb-4">Our Vision</h2>
                <p className="text-background/80">
                  {site_content.vision}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-20 bg-gradient-champagne">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <span className="text-primary font-medium text-sm uppercase tracking-widest mb-4 block">Our Values</span>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
                What We <span className="text-primary">Stand For</span>
              </h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value) => (
                <div key={value.title} className="text-center p-6 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-card transition-elegant group">
                  <div className="w-14 h-14 rounded-xl bg-primary mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-elegant">
                    <value.icon className="text-primary-foreground" size={24} />
                  </div>
                  <h3 className="font-display font-semibold text-lg text-foreground mb-2">{value.title}</h3>
                  <p className="text-muted-foreground text-sm">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <span className="text-primary font-medium text-sm uppercase tracking-widest mb-4 block">Our Journey</span>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
                Milestones & <span className="text-primary">Growth</span>
              </h2>
            </div>
            <div className="max-w-3xl mx-auto">
              {milestones.map((milestone, index) => (
                <div key={milestone.year} className="flex gap-6 mb-8 last:mb-0">
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                      {milestone.year.slice(2)}
                    </div>
                    {index < milestones.length - 1 && (
                      <div className="w-px h-full bg-border mt-2" />
                    )}
                  </div>
                  <div className="flex-1 pb-8">
                    <p className="text-primary font-medium text-sm mb-1">{milestone.year}</p>
                    <h3 className="font-display font-semibold text-lg text-foreground mb-2">{milestone.title}</h3>
                    <p className="text-muted-foreground">{milestone.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;