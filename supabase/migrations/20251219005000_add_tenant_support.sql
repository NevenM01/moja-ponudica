-- Multi-tenant support: tenants table, get_user_tenant_id(), and tenant_id columns
-- Must run after profiles.tenant_id exists (20251219004717) and before RLS policies (20251219010215)

-- 1. Tenants table (referenced by RLS policies in 20251219010215)
CREATE TABLE IF NOT EXISTS public.tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Default tenant used by existing data
INSERT INTO public.tenants (id) VALUES ('f22d794a-1379-402e-b56b-1d88afd265bf'::uuid)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

-- 2. Function: return tenant_id for a user (from profiles), fallback to default tenant
CREATE OR REPLACE FUNCTION public.get_user_tenant_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT tenant_id FROM public.profiles WHERE id = _user_id LIMIT 1),
    'f22d794a-1379-402e-b56b-1d88afd265bf'::uuid
  );
$$;

-- 2b. Add FK on profiles.tenant_id (column added in 20251219004717)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_schema = 'public' AND table_name = 'profiles'
      AND constraint_name = 'profiles_tenant_id_fkey'
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_tenant_id_fkey
      FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);
  END IF;
END $$;

-- 3. Add tenant_id to company_profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'company_profiles' AND column_name = 'tenant_id'
  ) THEN
    ALTER TABLE public.company_profiles ADD COLUMN tenant_id uuid REFERENCES public.tenants(id);
  END IF;
END $$;

-- 4. Add tenant_id to offers
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'offers' AND column_name = 'tenant_id'
  ) THEN
    ALTER TABLE public.offers ADD COLUMN tenant_id uuid REFERENCES public.tenants(id);
  END IF;
END $$;

-- 5. Add tenant_id to offer_templates
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'offer_templates' AND column_name = 'tenant_id'
  ) THEN
    ALTER TABLE public.offer_templates ADD COLUMN tenant_id uuid REFERENCES public.tenants(id);
  END IF;
END $$;

-- Backfill existing rows with default tenant so RLS works
UPDATE public.company_profiles SET tenant_id = 'f22d794a-1379-402e-b56b-1d88afd265bf'::uuid WHERE tenant_id IS NULL;
UPDATE public.offers SET tenant_id = 'f22d794a-1379-402e-b56b-1d88afd265bf'::uuid WHERE tenant_id IS NULL;
UPDATE public.offer_templates SET tenant_id = 'f22d794a-1379-402e-b56b-1d88afd265bf'::uuid WHERE tenant_id IS NULL;
