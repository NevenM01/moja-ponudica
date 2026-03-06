-- Add tenant_id to invitations so admin can assign tenant when sending invite.
-- When user accepts, profile.tenant_id is set from invitation.tenant_id (app + optional trigger).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'invitations' AND column_name = 'tenant_id'
  ) THEN
    ALTER TABLE public.invitations
      ADD COLUMN tenant_id uuid REFERENCES public.tenants(id);
  END IF;
END $$;
