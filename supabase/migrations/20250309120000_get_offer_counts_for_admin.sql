-- Admin-only function to get offer counts per user (bypasses RLS for admin)
CREATE OR REPLACE FUNCTION public.get_offer_counts_for_admin()
RETURNS TABLE (user_id uuid, offer_count bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT o.user_id, count(*)::bigint
  FROM public.offers o
  WHERE public.has_role(auth.uid(), 'admin'::app_role)
  GROUP BY o.user_id;
$$;
