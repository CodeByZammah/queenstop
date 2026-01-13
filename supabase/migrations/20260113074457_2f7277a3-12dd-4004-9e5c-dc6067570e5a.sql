-- Add route_tags to products for car local/outside Lusaka routes
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS route_tags TEXT[] DEFAULT NULL,
ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT NULL;

-- Add country_code to bookings for WhatsApp link generation
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS country_code TEXT DEFAULT '+260',
ADD COLUMN IF NOT EXISTS route_type TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS booking_time TIME DEFAULT NULL;

-- Create site_config table for admin-editable settings
CREATE TABLE IF NOT EXISTS public.site_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  config_key TEXT NOT NULL UNIQUE,
  config_value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on site_config
ALTER TABLE public.site_config ENABLE ROW LEVEL SECURITY;

-- Anyone can read site config (public settings)
CREATE POLICY "Site config is publicly readable" 
ON public.site_config 
FOR SELECT 
USING (true);

-- Only admins can modify site config
CREATE POLICY "Admins can insert site config" 
ON public.site_config 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update site config" 
ON public.site_config 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete site config" 
ON public.site_config 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for site_config updated_at
CREATE TRIGGER update_site_config_updated_at
BEFORE UPDATE ON public.site_config
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default site config values
INSERT INTO public.site_config (config_key, config_value) VALUES
('contacts', '{"phone": "+260 97 6700776", "phoneSecondary": "+260 974366406", "email": "queenstopdrive@gmail.com", "whatsappNumber": "+260976700776", "whatsappRaw": "260976700776"}'::jsonb),
('address', '{"street": "A/35/2, Makeni Bonaventure, plot 50a", "city": "Lusaka", "zip": "10101", "country": "Zambia", "mapUrl": "https://share.google/JFo59tJ7goMUxCO9b"}'::jsonb),
('social', '{"facebook": "https://facebook.com/queenstop", "instagram": "https://instagram.com/queenstop", "twitter": "https://twitter.com/queenstop", "youtube": "https://youtube.com/queenstop"}'::jsonb),
('hero_images', '[]'::jsonb)
ON CONFLICT (config_key) DO NOTHING;