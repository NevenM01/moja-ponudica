-- ============================================
-- OPTIMIZACIJA: Kombiniranje Multiple Permissive Policies
-- ============================================

-- ============================================
-- 1. PROFILES - SELECT politike
-- ============================================
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

CREATE POLICY "Users can view profiles" ON public.profiles
FOR SELECT
USING (
  (select auth.uid()) = id 
  OR has_role((select auth.uid()), 'admin'::app_role)
);

-- ============================================
-- 2. PROFILES - UPDATE politike
-- ============================================
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users can update profiles" ON public.profiles
FOR UPDATE
USING (
  (select auth.uid()) = id 
  OR has_role((select auth.uid()), 'admin'::app_role)
);

-- ============================================
-- 3. OFFERS - SELECT politike
-- ============================================
DROP POLICY IF EXISTS "Admins can view all tenant offers" ON public.offers;
DROP POLICY IF EXISTS "Users can view their own tenant offers" ON public.offers;

CREATE POLICY "Users can view offers" ON public.offers
FOR SELECT
USING (
  tenant_id = get_user_tenant_id((select auth.uid()))
  AND (
    user_id = (select auth.uid())
    OR has_role((select auth.uid()), 'admin'::app_role)
  )
);

-- ============================================
-- 4. INVITATIONS - UPDATE politike
-- ============================================
DROP POLICY IF EXISTS "Admins can update invitations" ON public.invitations;
DROP POLICY IF EXISTS "Users can accept their own invitation" ON public.invitations;

CREATE POLICY "Users can update invitations" ON public.invitations
FOR UPDATE
USING (
  has_role((select auth.uid()), 'admin'::app_role)
  OR lower(email) = lower(((select auth.jwt()) ->> 'email'::text))
)
WITH CHECK (
  has_role((select auth.uid()), 'admin'::app_role)
  OR (
    lower(email) = lower(((select auth.jwt()) ->> 'email'::text))
    AND status = 'accepted'::text 
    AND accepted_at IS NOT NULL
  )
);