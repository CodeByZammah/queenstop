-- Add read status to contact_submissions
ALTER TABLE public.contact_submissions 
ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS admin_reply TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS replied_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Allow admins to update contact submissions (for marking as read/replied)
CREATE POLICY "Admins can update contact submissions" 
ON public.contact_submissions 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to delete contact submissions
CREATE POLICY "Admins can delete contact submissions" 
ON public.contact_submissions 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to delete bookings
CREATE POLICY "Admins can delete bookings" 
ON public.bookings 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));