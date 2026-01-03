-- Fix PUBLIC_DATA_EXPOSURE: Remove the OR user_id IS NULL condition from SELECT policy
-- This prevents unauthenticated users from accessing bookings with NULL user_id

DROP POLICY IF EXISTS "Users can view own bookings" ON public.bookings;

-- Create a new policy that only allows authenticated users to view their own bookings
-- Anonymous bookings (user_id IS NULL) can only be viewed by admins
CREATE POLICY "Users can view own bookings"
ON public.bookings FOR SELECT
USING (auth.uid() = user_id);