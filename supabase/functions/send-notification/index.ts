import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");

// Allowed origins for CORS
const ALLOWED_ORIGINS = [
  "https://queenstop.lovable.app",
  "https://lovable.dev",
  "http://localhost:5173",
  "http://localhost:3000",
];

// Rate limiting map (in-memory, resets on cold starts)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_MAX = 10; // max requests per window
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute

const getCorsHeaders = (origin: string | null) => {
  const allowedOrigin = origin && ALLOWED_ORIGINS.some(allowed => origin.includes(allowed.replace("https://", "").replace("http://", "")))
    ? origin
    : ALLOWED_ORIGINS[0];

  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
};

// HTML sanitization to prevent XSS
const sanitizeHtml = (input: unknown): string => {
  if (input === null || input === undefined) return "";
  return String(input)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
};

// Rate limiting function
const checkRateLimit = (identifier: string): boolean => {
  const now = Date.now();
  const entry = rateLimitMap.get(identifier);
  
  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }
  
  if (entry.count >= RATE_LIMIT_MAX) {
    return false;
  }
  
  entry.count++;
  return true;
};

// Admin config
const ADMIN_EMAIL = "admin@queenstop.com";
const BUSINESS_NAME = "Queenstop";

interface NotificationRequest {
  type: "booking" | "contact" | "testimonial";
  data: Record<string, unknown>;
}

const generateBookingEmail = (data: Record<string, unknown>) => {
  return {
    subject: `🚗 New Booking Request - ${BUSINESS_NAME}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #c9a962; border-bottom: 2px solid #c9a962; padding-bottom: 10px;">New Booking Request</h1>
        <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Customer Name:</strong> ${sanitizeHtml(data.customer_name)}</p>
          <p><strong>Email:</strong> ${sanitizeHtml(data.customer_email)}</p>
          <p><strong>Phone:</strong> ${sanitizeHtml(data.customer_phone)}</p>
          ${data.service ? `<p><strong>Service:</strong> ${sanitizeHtml(data.service)}</p>` : ""}
          ${data.pickup_location ? `<p><strong>Pickup Location:</strong> ${sanitizeHtml(data.pickup_location)}</p>` : ""}
          ${data.dropoff_location ? `<p><strong>Dropoff Location:</strong> ${sanitizeHtml(data.dropoff_location)}</p>` : ""}
          ${data.notes ? `<p><strong>Notes:</strong> ${sanitizeHtml(data.notes)}</p>` : ""}
        </div>
        <p style="color: #666;">Please respond to this booking request as soon as possible.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #999; font-size: 12px;">${BUSINESS_NAME} - Automated Notification</p>
      </div>
    `,
  };
};

const generateContactEmail = (data: Record<string, unknown>) => {
  return {
    subject: `📩 New Contact Message - ${BUSINESS_NAME}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #c9a962; border-bottom: 2px solid #c9a962; padding-bottom: 10px;">New Contact Message</h1>
        <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>From:</strong> ${sanitizeHtml(data.name)}</p>
          <p><strong>Email:</strong> ${sanitizeHtml(data.email)}</p>
          ${data.phone ? `<p><strong>Phone:</strong> ${sanitizeHtml(data.phone)}</p>` : ""}
          ${data.subject ? `<p><strong>Service Interest:</strong> ${sanitizeHtml(data.subject)}</p>` : ""}
          <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #ddd;">
            <p><strong>Message:</strong></p>
            <p style="white-space: pre-wrap;">${sanitizeHtml(data.message)}</p>
          </div>
        </div>
        <p style="color: #666;">Please respond to this inquiry within 24 hours.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #999; font-size: 12px;">${BUSINESS_NAME} - Automated Notification</p>
      </div>
    `,
  };
};

const generateTestimonialEmail = (data: Record<string, unknown>) => {
  const rating = Number(data.rating) || 5;
  const stars = "⭐".repeat(rating);
  return {
    subject: `✨ New Testimonial Submitted - ${BUSINESS_NAME}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #c9a962; border-bottom: 2px solid #c9a962; padding-bottom: 10px;">New Testimonial Submitted</h1>
        <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>From:</strong> ${sanitizeHtml(data.name)}</p>
          ${data.role ? `<p><strong>Role:</strong> ${sanitizeHtml(data.role)}</p>` : ""}
          ${data.email ? `<p><strong>Email:</strong> ${sanitizeHtml(data.email)}</p>` : ""}
          <p><strong>Rating:</strong> ${stars} (${rating}/5)</p>
          <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #ddd;">
            <p><strong>Testimonial:</strong></p>
            <p style="font-style: italic; white-space: pre-wrap;">"${sanitizeHtml(data.content)}"</p>
          </div>
        </div>
        <p style="color: #666;">This testimonial is pending approval. Review it in the admin panel.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #999; font-size: 12px;">${BUSINESS_NAME} - Automated Notification</p>
      </div>
    `,
  };
};

const handler = async (req: Request): Promise<Response> => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Only allow POST requests
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  try {
    // Get client identifier for rate limiting (use IP or fallback)
    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || 
                     req.headers.get("cf-connecting-ip") || 
                     "unknown";
    
    // Check rate limit
    if (!checkRateLimit(clientIp)) {
      console.warn(`Rate limit exceeded for IP: ${clientIp}`);
      return new Response(JSON.stringify({ error: "Too many requests. Please try again later." }), {
        status: 429,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Verify request authentication
    const authHeader = req.headers.get("authorization");
    const apiKey = req.headers.get("apikey");
    
    if (!authHeader && !apiKey) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Validate the auth token or API key with Supabase
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      console.error("Missing Supabase configuration");
      return new Response(JSON.stringify({ error: "Server configuration error" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Create Supabase client to verify the token
    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: {
        headers: authHeader ? { Authorization: authHeader } : {},
      },
    });

    // For authenticated requests, verify the user
    // For anonymous requests with valid anon key, allow public submissions
    if (authHeader && authHeader !== `Bearer ${SUPABASE_ANON_KEY}`) {
      const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
      
      // If auth header is provided but invalid, reject
      if (authError && authHeader !== `Bearer ${apiKey}`) {
        console.warn("Invalid auth token provided");
        // Still allow if using valid API key (anon key for public forms)
        if (apiKey !== SUPABASE_ANON_KEY) {
          return new Response(JSON.stringify({ error: "Invalid authentication" }), {
            status: 401,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          });
        }
      }
    }

    const { type, data }: NotificationRequest = await req.json();
    
    // Validate notification type
    if (!["booking", "contact", "testimonial"].includes(type)) {
      return new Response(JSON.stringify({ error: "Invalid notification type" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Validate required fields based on type
    if (type === "booking" && (!data.customer_name || !data.customer_email)) {
      return new Response(JSON.stringify({ error: "Missing required booking fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
    
    if (type === "contact" && (!data.name || !data.email || !data.message)) {
      return new Response(JSON.stringify({ error: "Missing required contact fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
    
    if (type === "testimonial" && (!data.name || !data.content)) {
      return new Response(JSON.stringify({ error: "Missing required testimonial fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    console.log(`Processing ${type} notification from ${clientIp}`);

    let emailContent: { subject: string; html: string };

    switch (type) {
      case "booking":
        emailContent = generateBookingEmail(data);
        break;
      case "contact":
        emailContent = generateContactEmail(data);
        break;
      case "testimonial":
        emailContent = generateTestimonialEmail(data);
        break;
      default:
        throw new Error(`Unknown notification type: ${type}`);
    }

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: `${BUSINESS_NAME} <onboarding@resend.dev>`,
        to: [ADMIN_EMAIL],
        subject: emailContent.subject,
        html: emailContent.html,
      }),
    });

    const emailResult = await emailResponse.json();

    console.log("Email sent successfully:", emailResult);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in send-notification function:", errorMessage);
    return new Response(
      JSON.stringify({ error: "Failed to send notification" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
