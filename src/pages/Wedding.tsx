import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BookingModal from "@/components/BookingModal";
import { Button } from "@/components/ui/button";
import { Heart, Crown, Sparkles, Gift, ShoppingBag, MessageCircle, ArrowRight, Loader2 } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import weddingImg from "@/assets/wedding-accessories.jpg";

const categories = [
  { icon: Crown, name: "Crowns & Tiaras", count: "24 items" },
  { icon: Sparkles, name: "Veils", count: "18 items" },
  { icon: Heart, name: "Hair Accessories", count: "36 items" },
  { icon: Gift, name: "Gloves & More", count: "15 items" },
];

const Wedding = () => {
  const { products, loading } = useProducts("wedding");
  const [selectedProduct, setSelectedProduct] = useState<{ id: string; name: string } | null>(null);
  
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
              <Heart size={16} className="text-primary" />
              <span className="text-background text-sm font-medium">Wedding Accessories</span>
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-background mb-6">
              Your Perfect <span className="text-primary">Day</span>
            </h1>
            <p className="text-lg text-background/80 max-w-2xl mx-auto mb-8">
              Complete your bridal look with our stunning collection of wedding accessories. 
              From elegant veils to sparkling tiaras, every detail matters.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="rounded-full">
                <ShoppingBag size={20} className="mr-2" />
                Shop Bridal
              </Button>
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="lg" className="rounded-full border-background text-background hover:bg-background hover:text-foreground">
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
            
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : products.length === 0 ? (
              <p className="text-center text-muted-foreground">No wedding accessories available at the moment.</p>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {products.map((product) => (
                  <div key={product.id} className="bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-elevated transition-elegant group">
                    <div className="relative h-64 overflow-hidden">
                      <img 
                        src={product.image_url || weddingImg} 
                        alt={product.name} 
                        className="w-full h-full object-cover transition-elegant group-hover:scale-110" 
                      />
                      <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-gold/90 text-charcoal text-xs font-medium">
                        Wedding
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-display font-semibold text-foreground mb-2">{product.name}</h3>
                      <p className="text-muted-foreground text-sm mb-3">{product.description}</p>
                      <div className="flex items-center justify-between">
                        <p className="text-primary font-bold text-xl">${product.price}</p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="group"
                          onClick={() => setSelectedProduct({ id: product.id, name: product.name })}
                        >
                          Enquire
                          <ShoppingBag className="ml-2" size={14} />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="text-center mt-12">
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                <Button size="lg" className="rounded-full">
                  View Full Collection
                  <ArrowRight className="ml-2" size={18} />
                </Button>
              </a>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-charcoal text-background">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Make Your Day <span className="text-primary">Unforgettable</span>
            </h2>
            <p className="text-background/70 max-w-xl mx-auto mb-8">
              Need help choosing the perfect accessories? Our bridal consultants are here to assist you.
            </p>
            <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="rounded-full">
                <MessageCircle size={20} className="mr-2" />
                Book a Consultation
              </Button>
            </a>
          </div>
        </section>
      </main>

      <Footer />
      
      <BookingModal
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        productName={selectedProduct?.name}
        productId={selectedProduct?.id}
        category="wedding"
      />
    </div>
  );
};

export default Wedding;
