-- Fix overly permissive RLS on notifications table

-- 1. Drop the insecure policy identified by Supabase Security Advisor
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.notifications;

-- 2. Drop any other potential INSERT policies to be safe/clean
DROP POLICY IF EXISTS "Users can insert notifications" ON public.notifications;
DROP POLICY IF EXISTS "Anyone can insert" ON public.notifications;

-- 3. Create a strict INSERT policy: Only Admins can create notifications
-- (Note: Server-side code using Service Role key will still bypass this, which is good)
CREATE POLICY "Admins can insert notifications"
ON public.notifications
FOR INSERT
WITH CHECK (is_admin());

-- 4. Ensure SELECT policy is still correct (Users see their own)
-- (re-applying just in case only to be sure)
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
CREATE POLICY "Users can view their own notifications"
ON public.notifications
FOR SELECT
USING (auth.uid() = user_id);
