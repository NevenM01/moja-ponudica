-- Ažuriraj RLS pravila za offer_templates - omogući dijeljenje unutar tenanta

-- Obriši stara pravila
DROP POLICY IF EXISTS "Users can view their own tenant templates" ON public.offer_templates;

-- Kreiraj novo pravilo koje omogućuje pregled svih predložaka unutar tenanta
CREATE POLICY "Users can view their own tenant templates" 
ON public.offer_templates 
FOR SELECT 
USING (tenant_id = get_user_tenant_id(auth.uid()));

-- Ažuriraj RLS pravila za offer_template_groups - omogući čitanje svih grupa predložaka u tenantu
DROP POLICY IF EXISTS "Users can view their own template groups" ON public.offer_template_groups;

CREATE POLICY "Users can view their own template groups" 
ON public.offer_template_groups 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM offer_templates 
  WHERE offer_templates.id = offer_template_groups.template_id 
  AND offer_templates.tenant_id = get_user_tenant_id(auth.uid())
));

-- Ažuriraj RLS pravila za offer_template_items - omogući čitanje svih stavki predložaka u tenantu
DROP POLICY IF EXISTS "Users can view their own template items" ON public.offer_template_items;

CREATE POLICY "Users can view their own template items" 
ON public.offer_template_items 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM offer_templates 
  WHERE offer_templates.id = offer_template_items.template_id 
  AND offer_templates.tenant_id = get_user_tenant_id(auth.uid())
));