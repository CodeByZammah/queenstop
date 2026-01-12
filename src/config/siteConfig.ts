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
  phone: "+260 97 6700776",
  phoneSecondary: "+260 974366406",
  phoneRaw: "+260976700776", // For links (no spaces)
  email: "queenstopdrive@gmail.com",
  
  // WhatsApp
  whatsappNumber: "+260976700776",
  whatsappMessage: "Hello! I'd like to get in touch with Queenstop.",
  
  // Address
  address: {
    street: "A/35/2, Makeni Bonaventure, plot 50a",
    city: "Lusaka",
    state: "",
    zip: "10101",
    country: "Zambia",
    full: "A/35/2, Makeni Bonaventure, plot 50a, Lusaka 10101, Zambia",
    mapUrl: "https://share.google/JFo59tJ7goMUxCO9b",
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

  // Admin Configuration (for notifications)
  admin: {
    email: "queenstopdrive@gmail.com",
    whatsappNumber: "+260976700776",
    whatsappRaw: "260976700776",
  },
};

// Generate WhatsApp link
export const getWhatsAppLink = (customMessage?: string) => {
  const message = encodeURIComponent(customMessage || siteConfig.whatsappMessage);
  return `https://wa.me/${siteConfig.whatsappNumber}?text=${message}`;
};

// Generate Admin WhatsApp notification link
export const getAdminWhatsAppLink = (message: string) => {
  const encodedMessage = encodeURIComponent(message);
  return `https://api.whatsapp.com/send?phone=${siteConfig.admin.whatsappRaw}&text=${encodedMessage}`;
};
