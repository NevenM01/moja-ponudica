-- Set offer.tenant_id automatically on INSERT/UPDATE so RLS passes without app sending it.
-- Runs after 20251219005000 (get_user_tenant_id, tenant_id columns).

CREATE OR REPLACE FUNCTION public.set_offer_tenant_id()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.tenant_id IS NULL THEN
    NEW.tenant_id := get_user_tenant_id(auth.uid());
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_offer_tenant_id_trigger ON public.offers;
CREATE TRIGGER set_offer_tenant_id_trigger
  BEFORE INSERT OR UPDATE ON public.offers
  FOR EACH ROW
  EXECUTE FUNCTION public.set_offer_tenant_id();
