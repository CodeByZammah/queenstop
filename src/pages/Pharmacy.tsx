import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BookingModal from "@/components/BookingModal";
import ProductImageModal from "@/components/ProductImageModal";
import { Button } from "@/components/ui/button";
import { Pill, Shield, Heart, Clock, ShoppingBag, MessageCircle, ArrowRight, Loader2, Truck } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { formatKwacha, generateWhatsAppLink } from "@/hooks/useSiteConfig";
import { siteConfig } from "@/config/siteConfig";
import pharmacyImg from "@/assets/pharmacy.jpg";

const features = [
  { icon: Shield, title: "Licensed Pharmacy", description: "Fully licensed and regulated pharmaceutical services" },
  { icon: Pill, title: "Quality Medicines", description: "Genuine, certified medications from trusted suppliers" },
  { icon: Clock, title: "Quick Service", description: "Fast and efficient prescription processing" },
  { icon: Truck, title: "Delivery Available", description: "Convenient home delivery service available" },
];

const Pharmacy = () => {
  const { products, loading } = useProducts("pharmacy");
  const [selectedProduct, setSelectedProduct] = useState<{ id: string; name: string } | null>(null);
  
  // Image modal state
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [selectedProductName, setSelectedProductName] = useState("");
  
  const whatsappLink = generateWhatsAppLink(
    siteConfig.admin.whatsappRaw, 
    "+260", 
    "Hello! I'd like to enquire about pharmacy products."
  );

  const openImageModal = (product: { name: string; image_url: string | null; images?: string[] | null }) => {
    const allImages: string[] = [];
    if (product.image_url) allImages.push(product.image_url);
    if (product.images?.length) {
      product.images.forEach(img => {
        if (!allImages.includes(img)) allImages.push(img);
      });
    }
    if (allImages.length === 0) allImages.push(pharmacyImg);
    
    setSelectedImages(allImages);
    setSelectedProductName(product.name);
    setImageModalOpen(true);
  };

  return (
    <div className="min-h-screen">
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0">
            <img src={pharmacyImg} alt="Queenstop Pharmacy" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-charcoal/90 via-charcoal/70 to-transparent" />
          </div>
          
          <div className="relative z-10 container mx-auto px-4 pt-32 pb-20">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 backdrop-blur-sm border border-primary/30 mb-6">
                <Pill size={16} className="text-primary" />
                <span className="text-background text-sm font-medium">Pharmacy</span>
              </span>
              <h1 className="text-4xl md:text-5xl font-bold text-background mb-6">
                Your Health, <span className="text-primary">Our Priority</span>
              </h1>
              <p className="text-lg text-background/80 mb-8">
                Quality healthcare products and pharmaceutical services you can trust. 
                Professional advice and genuine medications for your wellbeing.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="rounded-full">
                  <ShoppingBag size={20} className="mr-2" />
                  Browse Products
                </Button>
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="lg" className="rounded-full border-background text-background hover:bg-background hover:text-foreground">
                    <MessageCircle size={20} className="mr-2" />
                    Get Advice
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
                    <feature.icon className="text-primary" size={24} />
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
              <span className="text-primary font-medium text-sm uppercase tracking-widest mb-4 block">Our Products</span>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
                Healthcare <span className="text-primary">Essentials</span>
              </h2>
            </div>
            
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <Pill className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No pharmacy products available yet.</p>
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="rounded-full">
                    <MessageCircle size={18} className="mr-2" />
                    Contact Us for Products
                  </Button>
                </a>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {products.map((product) => {
                  const images = (product as any).images as string[] | null;
                  
                  return (
                    <div key={product.id} className="bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-elevated transition-elegant group">
                      <div 
                        className="relative h-64 overflow-hidden bg-charcoal cursor-pointer"
                        onClick={() => openImageModal({ name: product.name, image_url: product.image_url, images })}
                      >
                        <img 
                          src={product.image_url || pharmacyImg} 
                          alt={product.name} 
                          className="w-full h-full object-cover aspect-square transition-elegant group-hover:scale-110" 
                        />
                        <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-green-600/90 text-white text-xs font-medium">
                          Pharmacy
                        </div>
                        {/* Multiple images indicator */}
                        {images && images.length > 0 && (
                          <div className="absolute bottom-4 right-4 px-2 py-1 rounded bg-background/80 text-foreground text-xs">
                            +{images.length} photos
                          </div>
                        )}
                      </div>
                      <div className="p-6">
                        <h3 className="text-xl font-display font-semibold text-foreground mb-2">{product.name}</h3>
                        <p className="text-muted-foreground text-sm mb-3">{product.description}</p>
                        <div className="flex items-center justify-between">
                          <p className="text-primary font-bold text-xl">{formatKwacha(product.price)}</p>
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
                  );
                })}
              </div>
            )}
            
            <div className="text-center mt-12">
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                <Button size="lg" className="rounded-full">
                  View All Products
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
              Need <span className="text-primary">Health Advice?</span>
            </h2>
            <p className="text-background/70 max-w-xl mx-auto mb-8">
              Our qualified pharmacists are ready to help. Get professional advice on medications and health products.
            </p>
            <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="rounded-full">
                <MessageCircle size={20} className="mr-2" />
                Chat on WhatsApp
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
        category="pharmacy"
      />
      
      <ProductImageModal
        images={selectedImages}
        productName={selectedProductName}
        isOpen={imageModalOpen}
        onClose={() => setImageModalOpen(false)}
      />
    </div>
  );
};

export default Pharmacy;
