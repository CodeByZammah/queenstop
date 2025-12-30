import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ServiceCards from "@/components/ServiceCards";
import WhyChooseUs from "@/components/WhyChooseUs";
import Testimonials from "@/components/Testimonials";
import TestimonialSubmit from "@/components/TestimonialSubmit";
import ContactCTA from "@/components/ContactCTA";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <ServiceCards />
        <WhyChooseUs />
        <Testimonials />
        <TestimonialSubmit />
        <ContactCTA />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
