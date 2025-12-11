import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Heart, Crown, Sparkles, Gift, ShoppingBag, MessageCircle, ArrowRight } from "lucide-react";
import weddingImg from "@/assets/wedding-accessories.jpg";

const products = [
  {
    name: "Crystal Bridal Crown",
    category: "Crowns & Tiaras",
    price: "$320",
    description: "Swarovski crystals with pearl accents",
    image: weddingImg,
  },
  {
    name: "Cathedral Veil",
    category: "Veils",
    price: "$450",
    description: "French lace trim, 3 meters long",
    image: weddingImg,
  },
  {
    name: "Pearl Hair Vine",
    category: "Hair Accessories",
    price: "$180",
    description: "Freshwater pearls on gold wire",
    image: weddingImg,
  },
  {
    name: "Satin Bridal Gloves",
    category: "Gloves",
    price: "$95",
    description: "Elbow length with lace details",
    image: weddingImg,
  },
  {
    name: "Crystal Drop Earrings",
    category: "Jewellery",
    price: "$145",
    description: "Austrian crystals in silver setting",
    image: weddingImg,
  },
  {
    name: "Bridal Garter Set",
    category: "Accessories",
    price: "$65",
    description: "Lace with blue ribbon detail",
    image: weddingImg,
  },
];

const categories = [
  { icon: Crown, name: "Crowns & Tiaras", count: "24 items" },
  { icon: Sparkles, name: "Veils", count: "18 items" },
  { icon: Heart, name: "Hair Accessories", count: "36 items" },
  { icon: Gift, name: "Gloves & More", count: "15 items" },
];

const Wedding = () => {
  const whatsappNumber = "+1234567890";
  const whatsappMessage = encodeURIComponent("Hello! I'm interested in your wedding accessories.");
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  return (
    <div className="min-h-screen">
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0">
            <img src={weddingImg} alt="Wedding accessories" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/40 to-charcoal/60" />
          </div>
          
          <div className="relative z-10 container mx-auto px-4 pt-32 pb-20 text-center">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 backdrop-blur-sm border border-primary/30 mb-6">
              <Heart size={16} className="text-gold-light" />
              <span className="text-cream text-sm font-medium">Wedding Accessories</span>
            </span>
            <h1 className="text-4xl md:text-6xl font-display font-bold text-cream mb-6">
              Your Perfect <span className="text-gold-light">Day</span>
            </h1>
            <p className="text-lg text-cream/80 max-w-2xl mx-auto mb-8">
              Complete your bridal look with our stunning collection of wedding accessories. 
              From elegant veils to sparkling tiaras, every detail matters.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="gold" size="xl">
                <ShoppingBag size={20} className="mr-2" />
                Shop Bridal
              </Button>
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                <Button variant="hero-outline" size="xl">
                  <MessageCircle size={20} className="mr-2" />
                  Get Advice
                </Button>
              </a>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-16 bg-gradient-champagne">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {categories.map((category) => (
                <div key={category.name} className="text-center p-6 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-card transition-elegant cursor-pointer group">
                  <div className="w-16 h-16 rounded-full bg-primary/10 mx-auto mb-4 flex items-center justify-center group-hover:bg-primary group-hover:scale-110 transition-elegant">
                    <category.icon className="text-primary group-hover:text-primary-foreground transition-elegant" size={28} />
                  </div>
                  <h3 className="font-display font-semibold text-foreground mb-1">{category.name}</h3>
                  <p className="text-muted-foreground text-sm">{category.count}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Products Section */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <span className="text-primary font-medium text-sm uppercase tracking-widest mb-4 block">Featured</span>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
                Bridal <span className="text-primary">Essentials</span>
              </h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product) => (
                <div key={product.name} className="bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-elevated transition-elegant group">
                  <div className="relative h-64 overflow-hidden">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-elegant group-hover:scale-110" />
                    <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-gold/90 text-charcoal text-xs font-medium">
                      {product.category}
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-display font-semibold text-foreground mb-2">{product.name}</h3>
                    <p className="text-muted-foreground text-sm mb-3">{product.description}</p>
                    <div className="flex items-center justify-between">
                      <p className="text-primary font-bold text-xl">{product.price}</p>
                      <Button variant="outline" size="sm" className="group">
                        Add to Cart
                        <ShoppingBag className="ml-2" size={14} />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-12">
              <Button variant="gold" size="lg">
                View Full Collection
                <ArrowRight className="ml-2" size={18} />
              </Button>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-charcoal text-cream">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-6">
              Make Your Day <span className="text-gold-light">Unforgettable</span>
            </h2>
            <p className="text-cream/70 max-w-xl mx-auto mb-8">
              Need help choosing the perfect accessories? Our bridal consultants are here to assist you.
            </p>
            <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
              <Button variant="gold" size="xl">
                <MessageCircle size={20} className="mr-2" />
                Book a Consultation
              </Button>
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Wedding;
