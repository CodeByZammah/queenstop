-- Fix Security Issues

-- 1. DROP the overly permissive "Anyone can create bookings" policy (WITH CHECK (true))
DROP POLICY IF EXISTS "Anyone can create bookings" ON public.bookings;

-- 2. DROP the overly permissive "Anyone can submit testimonials" policy (WITH CHECK (true))
DROP POLICY IF EXISTS "Anyone can submit testimonials" ON public.testimonials;
-- Create a more specific policy for testimonial submission
CREATE POLICY "Public can submit testimonials"
ON public.testimonials
FOR INSERT
TO public
WITH CHECK (
  is_approved = false  -- New testimonials must be unapproved
);

-- 3. DROP the overly permissive "Anyone can submit contact forms" policy (WITH CHECK (true))
DROP POLICY IF EXISTS "Anyone can submit contact forms" ON public.contact_submissions;
-- Create a more specific policy for contact form submission
CREATE POLICY "Public can submit contact forms"
ON public.contact_submissions
FOR INSERT
TO public
WITH CHECK (
  is_read = false OR is_read IS NULL  -- New submissions must be unread
);

-- 4. Create a PUBLIC view for testimonials that hides PII
CREATE OR REPLACE VIEW public.testimonials_public
WITH (security_invoker = on)
AS SELECT 
  id,
  name,
  content,
  rating,
  role,
  image_url,
  created_at
FROM public.testimonials
WHERE is_approved = true;
-- Note: email and phone are excluded from this view

-- Grant access to the view
GRANT SELECT ON public.testimonials_public TO anon;
GRANT SELECT ON public.testimonials_public TO authenticated;