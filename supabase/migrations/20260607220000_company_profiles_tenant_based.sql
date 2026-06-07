-- Drop legacy user-scoped policies (superseded by tenant-only policies below)
DROP POLICY IF EXISTS "Users can create their own company profile" ON public.company_profiles;
DROP POLICY IF EXISTS "Users can update their own company profile" ON public.company_profiles;
DROP POLICY IF EXISTS "Users can view their own tenant company profile" ON public.company_profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.company_profiles;
DROP POLICY IF EXISTS "Users can create their own profile" ON public.company_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.company_profiles;

-- Dodaj tenant_id kolonu
ALTER TABLE public.company_profiles ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.tenants(id);

-- Migiraj postojeće podatke: tenant_id = tenant od tog usera
UPDATE public.company_profiles cp
SET tenant_id = p.tenant_id
FROM public.profiles p
WHERE cp.user_id = p.id;

-- Dodaj RLS policy za tenant
DROP POLICY IF EXISTS "Users can view company profile" ON public.company_profiles;
CREATE POLICY "Users can view company profile" ON public.company_profiles
FOR SELECT
USING (tenant_id = get_user_tenant_id((select auth.uid())));

DROP POLICY IF EXISTS "Users can update company profile" ON public.company_profiles;
CREATE POLICY "Users can update company profile" ON public.company_profiles
FOR UPDATE
USING (tenant_id = get_user_tenant_id((select auth.uid())));

DROP POLICY IF EXISTS "Users can insert company profile" ON public.company_profiles;
CREATE POLICY "Users can insert company profile" ON public.company_profiles
FOR INSERT
WITH CHECK (tenant_id = get_user_tenant_id((select auth.uid())));
