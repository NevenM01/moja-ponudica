-- Ensure profiles.tenant_id exists (for multi-tenant)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'tenant_id'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN tenant_id uuid;
  END IF;
END $$;

UPDATE profiles
SET tenant_id = 'f22d794a-1379-402e-b56b-1d88afd265bf'
WHERE id = 'bf598a36-4348-4db8-98ce-011bf6f47848';