CREATE OR REPLACE FUNCTION public.get_offer_counts_for_admin()
RETURNS TABLE (user_id uuid, offer_count bigint)
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RETURN;
  END IF;
  SET LOCAL row_security = off;
  RETURN QUERY
  SELECT o.user_id, count(*)::bigint
  FROM public.offers o
  GROUP BY o.user_id;
END;
$$;
