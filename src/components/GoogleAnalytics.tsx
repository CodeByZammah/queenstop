import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// Declare gtag on window
declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
    dataLayer: unknown[];
  }
}

interface GoogleAnalyticsProps {
  measurementId?: string;
}

const GoogleAnalytics = ({ measurementId }: GoogleAnalyticsProps) => {
  const location = useLocation();

  useEffect(() => {
    // Skip if no measurement ID provided
    if (!measurementId) return;

    // Load GA script dynamically
    const script = document.createElement("script");
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    script.async = true;
    document.head.appendChild(script);

    // Initialize gtag
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag(...args: unknown[]) {
      window.dataLayer.push(args);
    };
    window.gtag("js", new Date());
    window.gtag("config", measurementId, {
      page_path: location.pathname,
    });

    return () => {
      // Cleanup script on unmount
      const existingScript = document.querySelector(
        `script[src*="googletagmanager.com/gtag/js?id=${measurementId}"]`
      );
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, [measurementId]);

  // Track page views on route change
  useEffect(() => {
    if (!measurementId || typeof window.gtag !== "function") return;

    window.gtag("config", measurementId, {
      page_path: location.pathname,
    });
  }, [location.pathname, measurementId]);

  return null;
};

export default GoogleAnalytics;
