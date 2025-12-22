-- Ažuriraj RLS pravila za offer_item_groups - omogući adminima pristup svim grupama u tenantu

-- SELECT pravilo
DROP POLICY IF EXISTS "Users can view their own offer groups" ON public.offer_item_groups;
CREATE POLICY "Users can view their own offer groups" 
ON public.offer_item_groups 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM offers 
  WHERE offers.id = offer_item_groups.offer_id 
  AND (
    offers.user_id = auth.uid() 
    OR (offers.tenant_id = get_user_tenant_id(auth.uid()) AND has_role(auth.uid(), 'admin'))
  )
));

-- UPDATE pravilo
DROP POLICY IF EXISTS "Users can update their own offer groups" ON public.offer_item_groups;
CREATE POLICY "Users can update their own offer groups" 
ON public.offer_item_groups 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM offers 
  WHERE offers.id = offer_item_groups.offer_id 
  AND (
    offers.user_id = auth.uid() 
    OR (offers.tenant_id = get_user_tenant_id(auth.uid()) AND has_role(auth.uid(), 'admin'))
  )
));

-- DELETE pravilo
DROP POLICY IF EXISTS "Users can delete their own offer groups" ON public.offer_item_groups;
CREATE POLICY "Users can delete their own offer groups" 
ON public.offer_item_groups 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM offers 
  WHERE offers.id = offer_item_groups.offer_id 
  AND (
    offers.user_id = auth.uid() 
    OR (offers.tenant_id = get_user_tenant_id(auth.uid()) AND has_role(auth.uid(), 'admin'))
  )
));

-- Ažuriraj RLS pravila za offer_items - omogući adminima pristup svim stavkama u tenantu

-- SELECT pravilo
DROP POLICY IF EXISTS "Users can view their own offer items" ON public.offer_items;
CREATE POLICY "Users can view their own offer items" 
ON public.offer_items 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM offers 
  WHERE offers.id = offer_items.offer_id 
  AND (
    offers.user_id = auth.uid() 
    OR (offers.tenant_id = get_user_tenant_id(auth.uid()) AND has_role(auth.uid(), 'admin'))
  )
));

-- UPDATE pravilo
DROP POLICY IF EXISTS "Users can update their own offer items" ON public.offer_items;
CREATE POLICY "Users can update their own offer items" 
ON public.offer_items 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM offers 
  WHERE offers.id = offer_items.offer_id 
  AND (
    offers.user_id = auth.uid() 
    OR (offers.tenant_id = get_user_tenant_id(auth.uid()) AND has_role(auth.uid(), 'admin'))
  )
));

-- DELETE pravilo
DROP POLICY IF EXISTS "Users can delete their own offer items" ON public.offer_items;
CREATE POLICY "Users can delete their own offer items" 
ON public.offer_items 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM offers 
  WHERE offers.id = offer_items.offer_id 
  AND (
    offers.user_id = auth.uid() 
    OR (offers.tenant_id = get_user_tenant_id(auth.uid()) AND has_role(auth.uid(), 'admin'))
  )
));