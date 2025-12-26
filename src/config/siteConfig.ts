// ============================================
// SITE CONFIGURATION FILE
// Update all your contact info and business details here
// The entire app fetches from this file automatically
// ============================================

export const siteConfig = {
  // Business Info
  businessName: "Queenstop",
  tagline: "Where Luxury Meets Exceptional Service",
  
  // Contact Information
  phone: "+1 234 567 890",
  phoneRaw: "+1234567890", // For links (no spaces)
  email: "hello@queenstop.com",
  
  // WhatsApp
  whatsappNumber: "+1234567890",
  whatsappMessage: "Hello! I'd like to get in touch with Queenstop.",
  
  // Address
  address: {
    street: "123 Luxury Avenue",
    city: "New York",
    state: "NY",
    zip: "10001",
    country: "USA",
    full: "123 Luxury Avenue, New York, NY 10001",
  },
  
  // Business Hours
  businessHours: {
    weekdays: "Monday - Saturday: 9:00 AM - 8:00 PM",
    weekend: "Sunday: 10:00 AM - 6:00 PM",
  },
  
  // Social Media Links
  social: {
    facebook: "https://facebook.com/queenstop",
    instagram: "https://instagram.com/queenstop",
    twitter: "https://twitter.com/queenstop",
    youtube: "https://youtube.com/queenstop",
  },
  
  // SEO
  seo: {
    title: "Queenstop - Premium Car Hire, Jewellery & Wedding Accessories",
    description: "Queenstop offers premium car hire services, exquisite jewellery, and elegant wedding accessories. Experience luxury like never before.",
    keywords: "car hire, luxury cars, jewellery, wedding accessories, premium services",
  },
};

// Generate WhatsApp link
export const getWhatsAppLink = (customMessage?: string) => {
  const message = encodeURIComponent(customMessage || siteConfig.whatsappMessage);
  return `https://wa.me/${siteConfig.whatsappNumber}?text=${message}`;
};
