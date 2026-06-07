-- Tenant-based RLS on offers: all users in a tenant can view/update/delete tenant offers.

DROP POLICY IF EXISTS "Users can view offers" ON public.offers;
CREATE POLICY "Users can view offers" ON public.offers
FOR SELECT
USING (
  tenant_id = get_user_tenant_id((select auth.uid()))
);

DROP POLICY IF EXISTS "Users can update their own offers" ON public.offers;
CREATE POLICY "Users can update their own offers" ON public.offers
FOR UPDATE
USING (
  tenant_id = get_user_tenant_id((select auth.uid()))
);

DROP POLICY IF EXISTS "Users can delete their own offers" ON public.offers;
CREATE POLICY "Users can delete their own offers" ON public.offers
FOR DELETE
USING (
  tenant_id = get_user_tenant_id((select auth.uid()))
);
