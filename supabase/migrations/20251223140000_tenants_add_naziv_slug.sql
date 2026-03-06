-- Add naziv and slug to tenants for admin UI (create tenant, list tenants)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'tenants' AND column_name = 'naziv'
  ) THEN
    ALTER TABLE public.tenants ADD COLUMN naziv text;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'tenants' AND column_name = 'slug'
  ) THEN
    ALTER TABLE public.tenants ADD COLUMN slug text;
  END IF;
END $$;

-- Backfill existing rows so they have display values
UPDATE public.tenants
SET naziv = COALESCE(naziv, 'Zadani tenant'),
    slug = COALESCE(slug, 'default')
WHERE naziv IS NULL OR slug IS NULL;
