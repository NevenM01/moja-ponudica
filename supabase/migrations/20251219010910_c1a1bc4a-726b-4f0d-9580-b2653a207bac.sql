-- ============================================
-- OPTIMIZACIJA: user_roles RLS politike
-- ============================================

-- Korak 1: Dropati sve postojeće politike
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;

-- Korak 2: Kreirati jednu kombiniranu SELECT politiku
CREATE POLICY "Users can view roles" ON public.user_roles
FOR SELECT
USING (
  (select auth.uid()) = user_id 
  OR has_role((select auth.uid()), 'admin'::app_role)
);

-- Korak 3: Kreirati zasebne politike za INSERT, UPDATE, DELETE (samo admini)
CREATE POLICY "Admins can insert roles" ON public.user_roles
FOR INSERT
WITH CHECK (has_role((select auth.uid()), 'admin'::app_role));

CREATE POLICY "Admins can update roles" ON public.user_roles
FOR UPDATE
USING (has_role((select auth.uid()), 'admin'::app_role));

CREATE POLICY "Admins can delete roles" ON public.user_roles
FOR DELETE
USING (has_role((select auth.uid()), 'admin'::app_role));