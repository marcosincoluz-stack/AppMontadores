-- Enable RLS on core tables
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 
-- POLICIES FOR USERS TABLE
--
-- Users can see their own profile
CREATE POLICY "Users can see own profile" ON public.users FOR SELECT USING (auth.uid() = id);
-- Admins can see all users
CREATE POLICY "Admins can see all users" ON public.users FOR SELECT USING (is_admin());
-- Admins can update users (roles, names)
CREATE POLICY "Admins can update users" ON public.users FOR UPDATE USING (is_admin());
-- Users can update basic info of their own profile (optional, mostly phone)
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);


-- 
-- POLICIES FOR JOBS TABLE
--
-- Installers can view jobs assigned to them
CREATE POLICY "Installers view assigned jobs" ON public.jobs FOR SELECT USING (auth.uid() = assigned_to);
-- Admins can view all jobs
CREATE POLICY "Admins view all jobs" ON public.jobs FOR SELECT USING (is_admin());
-- Only admins can insert/update/delete jobs
CREATE POLICY "Admins manage jobs" ON public.jobs FOR ALL USING (is_admin());

-- Allow installers to update status of their assigned jobs (e.g. implicitly via application logic or specific columns if we wanted to be stricter)
-- For now, application uses server actions with admin privileges often, but for direct client access we need this.
-- However, since we use Server Actions, most updates happen with Service Role or the user session. 
-- If we rely on RLS, we need to allow installers to update SPECIFIC columns or just UPDATE if assigned.
-- Let's allow UPDATE if assigned_to = user, but maybe restricts via Application Logic. 
-- Safe approach: Allow UPDATE on own jobs.
CREATE POLICY "Installers update own jobs" ON public.jobs FOR UPDATE USING (auth.uid() = assigned_to);


-- 
-- POLICIES FOR EVIDENCE TABLE
--
-- Installers can insert evidence for their jobs
CREATE POLICY "Installers insert evidence" ON public.evidence FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.jobs 
        WHERE id = job_id 
        AND assigned_to = auth.uid()
    )
);

-- Installers can view evidence for their jobs
CREATE POLICY "Installers view evidence" ON public.evidence FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.jobs 
        WHERE id = job_id 
        AND assigned_to = auth.uid()
    )
);

-- Admins can view all evidence
CREATE POLICY "Admins view all evidence" ON public.evidence FOR SELECT USING (is_admin());

-- Admins can delete evidence
CREATE POLICY "Admins delete evidence" ON public.evidence FOR DELETE USING (is_admin());
