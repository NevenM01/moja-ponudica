-- Fix PON-2025-0006 rejected_at
UPDATE public.offers 
SET rejected_at = updated_at 
WHERE status = 'rejected' AND rejected_at IS NULL;