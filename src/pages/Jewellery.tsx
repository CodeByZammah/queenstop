import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Gem, Shield, Heart, Star, ShoppingBag, MessageCircle, ArrowRight, Check } from "lucide-react";
import jewelleryImg from "@/assets/jewellery.jpg";

const products = [
  {
    name: "Diamond Cascade Necklace",
    category: "Necklaces",
    price: "$2,450",
    description: "18K gold with brilliant cut diamonds",
    image: jewelleryImg,
  },
  {
    name: "Pearl Drop Earrings",
    category: "Earrings",
    price: "$890",
    description: "South Sea pearls with gold accents",
    image: jewelleryImg,
  },
  {
    name: "Eternity Band Ring",
    category: "Rings",
    price: "$1,650",
    description: "Platinum with channel-set diamonds",
    image: jewelleryImg,
  },
  {
    name: "Sapphire Pendant",
    category: "Pendants",
    price: "$3,200",
    description: "Natural sapphire with diamond halo",
    image: jewelleryImg,
  },
  {
    name: "Gold Tennis Bracelet",
    category: "Bracelets",
    price: "$4,100",
    description: "14K gold with 3ct total diamond weight",
    image: jewelleryImg,
  },
  {
    name: "Emerald Statement Ring",
    category: "Rings",
    price: "$5,800",
    description: "Colombian emerald in art deco setting",
    image: jewelleryImg,
  },
];

const features = [
  { icon: Shield, title: "Certified Authentic", description: "Every piece comes with certificate of authenticity" },
  { icon: Gem, title: "Premium Materials", description: "Only the finest gold, platinum, and gemstones" },
  { icon: Heart, title: "Hypoallergenic", description: "Safe for all skin types and sensitivities" },
  { icon: Star, title: "Lifetime Warranty", description: "Free repairs and maintenance for life" },
];

const Jewellery = () => {
  const whatsappNumber = "+1234567890";
  const whatsappMessage = encodeURIComponent("Hello! I'm interested in your jewellery collection.");
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  return (
    <div className="min-h-screen">
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0">
            <img src={jewelleryImg} alt="Luxury jewellery" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-charcoal/90 via-charcoal/70 to-transparent" />
          </div>
          
          <div className="relative z-10 container mx-auto px-4 pt-32 pb-20">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 backdrop-blur-sm border border-primary/30 mb-6">
                <Gem size={16} className="text-gold-light" />
                <span className="text-cream text-sm font-medium">Luxury Jewellery</span>
              </span>
              <h1 className="text-4xl md:text-6xl font-display font-bold text-cream mb-6">
                Timeless <span className="text-gold-light">Elegance</span>
              </h1>
              <p className="text-lg text-cream/80 mb-8">
                Discover our exquisite collection of handcrafted jewellery. Each piece tells a story 
                of artistry, passion, and uncompromising quality.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button variant="gold" size="xl">
                  <ShoppingBag size={20} className="mr-2" />
                  Shop Collection
                </Button>
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                  <Button variant="hero-outline" size="xl">
                    <MessageCircle size={20} className="mr-2" />
                    Enquire Now
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-gradient-champagne">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature) => (
                <div key={feature.title} className="text-center p-6 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-card transition-elegant group">
                  <div className="w-14 h-14 rounded-xl bg-charcoal mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-elegant">
                    <feature.icon className="text-gold-light" size={24} />
                  </div>
                  <h3 className="font-display font-semibold text-lg text-foreground mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Products Section */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <span className="text-primary font-medium text-sm uppercase tracking-widest mb-4 block">Our Collection</span>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
                Exquisite <span className="text-primary">Pieces</span>
              </h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product) => (
                <div key={product.name} className="bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-elevated transition-elegant group">
                  <div className="relative h-64 overflow-hidden bg-charcoal">
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
                View All Products
                <ArrowRight className="ml-2" size={18} />
              </Button>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-charcoal text-cream">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-6">
              Find Your <span className="text-gold-light">Perfect Piece</span>
            </h2>
            <p className="text-cream/70 max-w-xl mx-auto mb-8">
              Not finding what you're looking for? Contact us for custom designs or special requests.
            </p>
            <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
              <Button variant="gold" size="xl">
                <MessageCircle size={20} className="mr-2" />
                Chat on WhatsApp
              </Button>
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Jewellery;
