-- Add is_optional column to offer_items for optional line items
ALTER TABLE public.offer_items 
ADD COLUMN is_optional boolean DEFAULT false NOT NULL;