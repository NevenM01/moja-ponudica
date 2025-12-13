-- Add share_token column to offers table for public sharing
ALTER TABLE public.offers 
ADD COLUMN share_token uuid DEFAULT gen_random_uuid() UNIQUE;

-- Create index for faster lookups by share_token
CREATE INDEX idx_offers_share_token ON public.offers(share_token);

-- Add status column for offer acceptance
ALTER TABLE public.offers 
ADD COLUMN status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected'));

-- Add accepted_at timestamp
ALTER TABLE public.offers 
ADD COLUMN accepted_at timestamp with time zone;