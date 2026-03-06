-- tenants table: add naziv and slug (app expects these for AdminUsers, AdminTenants, AdminInvitations)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'tenants' AND column_name = 'naziv') THEN
    ALTER TABLE public.tenants ADD COLUMN naziv text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'tenants' AND column_name = 'slug') THEN
    ALTER TABLE public.tenants ADD COLUMN slug text;
  END IF;
END $$;

-- Ensure default tenant has display values
UPDATE public.tenants SET naziv = COALESCE(naziv, 'Zadani tenant'), slug = COALESCE(slug, 'default') WHERE id = 'f22d794a-1379-402e-b56b-1d88afd265bf';
