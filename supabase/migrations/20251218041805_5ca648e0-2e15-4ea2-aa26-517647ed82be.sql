-- Add rejected_at column to offers table
ALTER TABLE public.offers ADD COLUMN rejected_at timestamp with time zone;