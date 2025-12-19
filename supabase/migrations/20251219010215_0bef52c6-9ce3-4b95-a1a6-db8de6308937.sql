-- Optimizacija RLS politika - zamjena auth.uid() s (select auth.uid())

-- ============================================
-- COMPANY_PROFILES
-- ============================================
DROP POLICY IF EXISTS "Users can create their own company profile" ON public.company_profiles;
DROP POLICY IF EXISTS "Users can update their own company profile" ON public.company_profiles;
DROP POLICY IF EXISTS "Users can view their own tenant company profile" ON public.company_profiles;

CREATE POLICY "Users can create their own company profile" ON public.company_profiles
FOR INSERT WITH CHECK (((select auth.uid()) = user_id) AND (tenant_id = get_user_tenant_id((select auth.uid()))));

CREATE POLICY "Users can update their own company profile" ON public.company_profiles
FOR UPDATE USING (((select auth.uid()) = user_id) AND (tenant_id = get_user_tenant_id((select auth.uid()))));

CREATE POLICY "Users can view their own tenant company profile" ON public.company_profiles
FOR SELECT USING ((user_id = (select auth.uid())) AND (tenant_id = get_user_tenant_id((select auth.uid()))));

-- ============================================
-- INVITATIONS
-- ============================================
DROP POLICY IF EXISTS "Admins can create invitations" ON public.invitations;
DROP POLICY IF EXISTS "Admins can delete invitations" ON public.invitations;
DROP POLICY IF EXISTS "Admins can update invitations" ON public.invitations;
DROP POLICY IF EXISTS "Admins can view all invitations" ON public.invitations;
DROP POLICY IF EXISTS "Users can accept their own invitation" ON public.invitations;

CREATE POLICY "Admins can create invitations" ON public.invitations
FOR INSERT WITH CHECK (has_role((select auth.uid()), 'admin'::app_role));

CREATE POLICY "Admins can delete invitations" ON public.invitations
FOR DELETE USING (has_role((select auth.uid()), 'admin'::app_role));

CREATE POLICY "Admins can update invitations" ON public.invitations
FOR UPDATE USING (has_role((select auth.uid()), 'admin'::app_role));

CREATE POLICY "Admins can view all invitations" ON public.invitations
FOR SELECT USING (has_role((select auth.uid()), 'admin'::app_role));

CREATE POLICY "Users can accept their own invitation" ON public.invitations
FOR UPDATE USING (lower(email) = lower(((select auth.jwt()) ->> 'email'::text)))
WITH CHECK ((lower(email) = lower(((select auth.jwt()) ->> 'email'::text))) AND (status = 'accepted'::text) AND (accepted_at IS NOT NULL));

-- ============================================
-- OFFER_ITEM_GROUPS
-- ============================================
DROP POLICY IF EXISTS "Users can create their own offer groups" ON public.offer_item_groups;
DROP POLICY IF EXISTS "Users can delete their own offer groups" ON public.offer_item_groups;
DROP POLICY IF EXISTS "Users can update their own offer groups" ON public.offer_item_groups;
DROP POLICY IF EXISTS "Users can view their own offer groups" ON public.offer_item_groups;

CREATE POLICY "Users can create their own offer groups" ON public.offer_item_groups
FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM offers WHERE offers.id = offer_item_groups.offer_id AND offers.user_id = (select auth.uid())));

CREATE POLICY "Users can delete their own offer groups" ON public.offer_item_groups
FOR DELETE USING (EXISTS (SELECT 1 FROM offers WHERE offers.id = offer_item_groups.offer_id AND offers.user_id = (select auth.uid())));

CREATE POLICY "Users can update their own offer groups" ON public.offer_item_groups
FOR UPDATE USING (EXISTS (SELECT 1 FROM offers WHERE offers.id = offer_item_groups.offer_id AND offers.user_id = (select auth.uid())));

CREATE POLICY "Users can view their own offer groups" ON public.offer_item_groups
FOR SELECT USING (EXISTS (SELECT 1 FROM offers WHERE offers.id = offer_item_groups.offer_id AND offers.user_id = (select auth.uid())));

-- ============================================
-- OFFER_ITEMS
-- ============================================
DROP POLICY IF EXISTS "Users can create their own offer items" ON public.offer_items;
DROP POLICY IF EXISTS "Users can delete their own offer items" ON public.offer_items;
DROP POLICY IF EXISTS "Users can update their own offer items" ON public.offer_items;
DROP POLICY IF EXISTS "Users can view their own offer items" ON public.offer_items;

CREATE POLICY "Users can create their own offer items" ON public.offer_items
FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM offers WHERE offers.id = offer_items.offer_id AND offers.user_id = (select auth.uid())));

CREATE POLICY "Users can delete their own offer items" ON public.offer_items
FOR DELETE USING (EXISTS (SELECT 1 FROM offers WHERE offers.id = offer_items.offer_id AND offers.user_id = (select auth.uid())));

CREATE POLICY "Users can update their own offer items" ON public.offer_items
FOR UPDATE USING (EXISTS (SELECT 1 FROM offers WHERE offers.id = offer_items.offer_id AND offers.user_id = (select auth.uid())));

CREATE POLICY "Users can view their own offer items" ON public.offer_items
FOR SELECT USING (EXISTS (SELECT 1 FROM offers WHERE offers.id = offer_items.offer_id AND offers.user_id = (select auth.uid())));

-- ============================================
-- OFFER_TEMPLATE_GROUPS
-- ============================================
DROP POLICY IF EXISTS "Users can create their own template groups" ON public.offer_template_groups;
DROP POLICY IF EXISTS "Users can delete their own template groups" ON public.offer_template_groups;
DROP POLICY IF EXISTS "Users can update their own template groups" ON public.offer_template_groups;
DROP POLICY IF EXISTS "Users can view their own template groups" ON public.offer_template_groups;

CREATE POLICY "Users can create their own template groups" ON public.offer_template_groups
FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM offer_templates WHERE offer_templates.id = offer_template_groups.template_id AND offer_templates.user_id = (select auth.uid())));

CREATE POLICY "Users can delete their own template groups" ON public.offer_template_groups
FOR DELETE USING (EXISTS (SELECT 1 FROM offer_templates WHERE offer_templates.id = offer_template_groups.template_id AND offer_templates.user_id = (select auth.uid())));

CREATE POLICY "Users can update their own template groups" ON public.offer_template_groups
FOR UPDATE USING (EXISTS (SELECT 1 FROM offer_templates WHERE offer_templates.id = offer_template_groups.template_id AND offer_templates.user_id = (select auth.uid())));

CREATE POLICY "Users can view their own template groups" ON public.offer_template_groups
FOR SELECT USING (EXISTS (SELECT 1 FROM offer_templates WHERE offer_templates.id = offer_template_groups.template_id AND offer_templates.user_id = (select auth.uid())));

-- ============================================
-- OFFER_TEMPLATE_ITEMS
-- ============================================
DROP POLICY IF EXISTS "Users can create their own template items" ON public.offer_template_items;
DROP POLICY IF EXISTS "Users can delete their own template items" ON public.offer_template_items;
DROP POLICY IF EXISTS "Users can update their own template items" ON public.offer_template_items;
DROP POLICY IF EXISTS "Users can view their own template items" ON public.offer_template_items;

CREATE POLICY "Users can create their own template items" ON public.offer_template_items
FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM offer_templates WHERE offer_templates.id = offer_template_items.template_id AND offer_templates.user_id = (select auth.uid())));

CREATE POLICY "Users can delete their own template items" ON public.offer_template_items
FOR DELETE USING (EXISTS (SELECT 1 FROM offer_templates WHERE offer_templates.id = offer_template_items.template_id AND offer_templates.user_id = (select auth.uid())));

CREATE POLICY "Users can update their own template items" ON public.offer_template_items
FOR UPDATE USING (EXISTS (SELECT 1 FROM offer_templates WHERE offer_templates.id = offer_template_items.template_id AND offer_templates.user_id = (select auth.uid())));

CREATE POLICY "Users can view their own template items" ON public.offer_template_items
FOR SELECT USING (EXISTS (SELECT 1 FROM offer_templates WHERE offer_templates.id = offer_template_items.template_id AND offer_templates.user_id = (select auth.uid())));

-- ============================================
-- OFFER_TEMPLATES
-- ============================================
DROP POLICY IF EXISTS "Users can create their own templates" ON public.offer_templates;
DROP POLICY IF EXISTS "Users can delete their own templates" ON public.offer_templates;
DROP POLICY IF EXISTS "Users can update their own templates" ON public.offer_templates;
DROP POLICY IF EXISTS "Users can view their own tenant templates" ON public.offer_templates;

CREATE POLICY "Users can create their own templates" ON public.offer_templates
FOR INSERT WITH CHECK (((select auth.uid()) = user_id) AND (tenant_id = get_user_tenant_id((select auth.uid()))));

CREATE POLICY "Users can delete their own templates" ON public.offer_templates
FOR DELETE USING (((select auth.uid()) = user_id) AND (tenant_id = get_user_tenant_id((select auth.uid()))));

CREATE POLICY "Users can update their own templates" ON public.offer_templates
FOR UPDATE USING (((select auth.uid()) = user_id) AND (tenant_id = get_user_tenant_id((select auth.uid()))));

CREATE POLICY "Users can view their own tenant templates" ON public.offer_templates
FOR SELECT USING ((user_id = (select auth.uid())) AND (tenant_id = get_user_tenant_id((select auth.uid()))));

-- ============================================
-- OFFERS
-- ============================================
DROP POLICY IF EXISTS "Admins can view all tenant offers" ON public.offers;
DROP POLICY IF EXISTS "Users can create their own offers" ON public.offers;
DROP POLICY IF EXISTS "Users can delete their own offers" ON public.offers;
DROP POLICY IF EXISTS "Users can update their own offers" ON public.offers;
DROP POLICY IF EXISTS "Users can view their own tenant offers" ON public.offers;

CREATE POLICY "Admins can view all tenant offers" ON public.offers
FOR SELECT USING (has_role((select auth.uid()), 'admin'::app_role) AND (tenant_id = get_user_tenant_id((select auth.uid()))));

CREATE POLICY "Users can create their own offers" ON public.offers
FOR INSERT WITH CHECK (((select auth.uid()) = user_id) AND (tenant_id = get_user_tenant_id((select auth.uid()))));

CREATE POLICY "Users can delete their own offers" ON public.offers
FOR DELETE USING (((select auth.uid()) = user_id) AND (tenant_id = get_user_tenant_id((select auth.uid()))));

CREATE POLICY "Users can update their own offers" ON public.offers
FOR UPDATE USING (((select auth.uid()) = user_id) AND (tenant_id = get_user_tenant_id((select auth.uid()))));

CREATE POLICY "Users can view their own tenant offers" ON public.offers
FOR SELECT USING ((user_id = (select auth.uid())) AND (tenant_id = get_user_tenant_id((select auth.uid()))));

-- ============================================
-- PROFILES
-- ============================================
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

CREATE POLICY "Admins can update any profile" ON public.profiles
FOR UPDATE USING (has_role((select auth.uid()), 'admin'::app_role));

CREATE POLICY "Admins can view all profiles" ON public.profiles
FOR SELECT USING (has_role((select auth.uid()), 'admin'::app_role));

CREATE POLICY "Users can update their own profile" ON public.profiles
FOR UPDATE USING ((select auth.uid()) = id);

CREATE POLICY "Users can view their own profile" ON public.profiles
FOR SELECT USING ((select auth.uid()) = id);

-- ============================================
-- TENANTS
-- ============================================
DROP POLICY IF EXISTS "Admins can delete tenants" ON public.tenants;
DROP POLICY IF EXISTS "Admins can insert tenants" ON public.tenants;
DROP POLICY IF EXISTS "Admins can update tenants" ON public.tenants;
DROP POLICY IF EXISTS "Authenticated users can view tenants" ON public.tenants;

CREATE POLICY "Admins can delete tenants" ON public.tenants
FOR DELETE USING (has_role((select auth.uid()), 'admin'::app_role));

CREATE POLICY "Admins can insert tenants" ON public.tenants
FOR INSERT WITH CHECK (has_role((select auth.uid()), 'admin'::app_role));

CREATE POLICY "Admins can update tenants" ON public.tenants
FOR UPDATE USING (has_role((select auth.uid()), 'admin'::app_role));

CREATE POLICY "Authenticated users can view tenants" ON public.tenants
FOR SELECT USING (true);

-- ============================================
-- USER_ROLES
-- ============================================
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;

CREATE POLICY "Admins can manage roles" ON public.user_roles
FOR ALL USING (has_role((select auth.uid()), 'admin'::app_role));

CREATE POLICY "Admins can view all roles" ON public.user_roles
FOR SELECT USING (has_role((select auth.uid()), 'admin'::app_role));

CREATE POLICY "Users can view their own roles" ON public.user_roles
FOR SELECT USING ((select auth.uid()) = user_id);