-- Add trial_ends_at to tenants for free trial support
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'tenants' AND column_name = 'trial_ends_at'
  ) THEN
    ALTER TABLE public.tenants ADD COLUMN trial_ends_at timestamptz;
  END IF;
END $$;
