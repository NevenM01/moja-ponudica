-- Update old rejected offers to set rejected_at from updated_at
UPDATE public.offers 
SET rejected_at = updated_at 
WHERE status = 'rejected' AND rejected_at IS NULL;