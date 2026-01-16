import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface SiteContacts {
  phone: string;
  phoneSecondary: string;
  email: string;
  whatsappNumber: string;
  whatsappRaw: string;
}

export interface SiteAddress {
  street: string;
  city: string;
  zip: string;
  country: string;
  mapUrl: string;
}

export interface SiteSocial {
  facebook: string;
  instagram: string;
  twitter: string;
  youtube: string;
}

export interface HeroImage {
  url: string;
  alt: string;
  headline: string;
  highlightText: string;
  subtitle: string;
}

export interface SiteContent {
  mission: string;
  vision: string;
  about_title: string;
  about_description: string;
  about_extended: string;
}

export interface SiteConfigData {
  contacts: SiteContacts;
  address: SiteAddress;
  social: SiteSocial;
  hero_images: HeroImage[];
  site_content: SiteContent;
}

const defaultConfig: SiteConfigData = {
  contacts: {
    phone: "+260 97 6700776",
    phoneSecondary: "+260 974366406",
    email: "queenstopdrive@gmail.com",
    whatsappNumber: "+260976700776",
    whatsappRaw: "260976700776",
  },
  address: {
    street: "A/35/2, Makeni Bonaventure, plot 50a",
    city: "Lusaka",
    zip: "10101",
    country: "Zambia",
    mapUrl: "https://share.google/JFo59tJ7goMUxCO9b",
  },
  social: {
    facebook: "https://facebook.com/queenstop",
    instagram: "https://instagram.com/queenstop",
    twitter: "https://twitter.com/queenstop",
    youtube: "https://youtube.com/queenstop",
  },
  hero_images: [],
  site_content: {
    mission: "To provide exceptional luxury services that exceed expectations, making elegance accessible to everyone while maintaining the highest standards of quality and customer satisfaction.",
    vision: "To be the premier destination for luxury lifestyle services, recognized for our commitment to excellence, innovation, and creating unforgettable experiences for every client we serve.",
    about_title: "The Queenstop Story",
    about_description: "Founded with a passion for excellence, Queenstop has grown from a humble car hire service to a comprehensive luxury brand offering premium vehicles, exquisite jewellery, and elegant wedding accessories.",
    about_extended: "Our journey has been defined by one simple principle: delivering elegance in motion. Whether it's the perfect vehicle for your special occasion, a stunning piece of jewellery that tells your story, or wedding accessories that complete your perfect day — we're committed to making every moment memorable.",
  },
};

export const useSiteConfig = () => {
  const [config, setConfig] = useState<SiteConfigData>(defaultConfig);
  const [loading, setLoading] = useState(true);

  const fetchConfig = async () => {
    try {
      const { data, error } = await supabase
        .from("site_config")
        .select("config_key, config_value");

      if (error) throw error;

      const newConfig = { ...defaultConfig };
      data?.forEach((item) => {
        if (item.config_key === "contacts") {
          newConfig.contacts = item.config_value as unknown as SiteContacts;
        } else if (item.config_key === "address") {
          newConfig.address = item.config_value as unknown as SiteAddress;
        } else if (item.config_key === "social") {
          newConfig.social = item.config_value as unknown as SiteSocial;
        } else if (item.config_key === "hero_images") {
          newConfig.hero_images = item.config_value as unknown as HeroImage[];
        } else if (item.config_key === "site_content") {
          newConfig.site_content = item.config_value as unknown as SiteContent;
        }
      });

      setConfig(newConfig);
    } catch (error) {
      console.error("Error fetching site config:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const updateConfig = async (key: string, value: unknown) => {
    // First try to update
    const { error: updateError, count } = await supabase
      .from("site_config")
      .update({ config_value: value as any })
      .eq("config_key", key);

    // If no rows were updated, insert instead
    if (updateError || count === 0) {
      const { error: insertError } = await supabase
        .from("site_config")
        .insert({ config_key: key, config_value: value as any });
      
      if (insertError) throw insertError;
    }

    await fetchConfig();
  };

  return { config, loading, updateConfig, refetch: fetchConfig };
};

// Helper to format currency in Zambian Kwacha
export const formatKwacha = (amount: number): string => {
  return new Intl.NumberFormat("en-ZM", {
    style: "currency",
    currency: "ZMW",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount).replace("ZMW", "K");
};

// Helper to generate WhatsApp link with country code
export const generateWhatsAppLink = (phone: string, countryCode: string, message?: string): string => {
  // Remove any spaces or special chars from phone
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, "");
  // Remove leading + from country code if present
  const cleanCode = countryCode.replace(/^\+/, "");
  // If phone starts with 0, remove it
  const phoneWithoutLeadingZero = cleanPhone.startsWith("0") ? cleanPhone.slice(1) : cleanPhone;
  const fullNumber = `${cleanCode}${phoneWithoutLeadingZero}`;
  
  const baseUrl = `https://wa.me/${fullNumber}`;
  return message ? `${baseUrl}?text=${encodeURIComponent(message)}` : baseUrl;
};
