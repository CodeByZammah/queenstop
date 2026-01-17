import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useSiteConfig } from "@/hooks/useSiteConfig";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import Index from "./pages/Index";
import CarHire from "./pages/CarHire";
import Jewellery from "./pages/Jewellery";
import Wedding from "./pages/Wedding";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Auth from "./pages/Auth";
import ClientAuth from "./pages/ClientAuth";
import Account from "./pages/Account";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppContent = () => {
  const { config } = useSiteConfig();

  return (
    <>
      <GoogleAnalytics measurementId={config.analytics?.ga_measurement_id} />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/car-hire" element={<CarHire />} />
        <Route path="/jewellery" element={<Jewellery />} />
        <Route path="/wedding" element={<Wedding />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<ClientAuth />} />
        <Route path="/account" element={<Account />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/admin" element={<Admin />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
