-- FIX: Allow authenticated users (like Admin) to create notifications for others
CREATE POLICY "Enable insert for authenticated users only"
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Ensure Realtime is enabled (idempotent-ish)
-- ALTER PUBLICATION supabase_realtime ADD TABLE notifications; 
-- (Commented out because it's already enabled and causing errors)
