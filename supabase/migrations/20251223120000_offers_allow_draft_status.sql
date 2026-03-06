-- Allow status = 'draft' for offer drafts (persisted in DB)
ALTER TABLE public.offers
  DROP CONSTRAINT IF EXISTS offers_status_check;

ALTER TABLE public.offers
  ADD CONSTRAINT offers_status_check
  CHECK (status IN ('pending', 'accepted', 'rejected', 'draft'));
