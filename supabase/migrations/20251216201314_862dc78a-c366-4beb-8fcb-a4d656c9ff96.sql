-- Add jedinica (unit) column to offer_items table
ALTER TABLE public.offer_items 
ADD COLUMN jedinica text NOT NULL DEFAULT 'kom';