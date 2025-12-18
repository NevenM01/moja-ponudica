-- 1. Kreirati tablicu za tenante/brandove
CREATE TABLE public.tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  naziv text NOT NULL,
  primary_color text DEFAULT '243 75% 58%',
  accent_color text DEFAULT '250 100% 97%',
  logo_url text,
  background_style text DEFAULT 'bubbles',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

-- Svi authenticated korisnici mogu čitati tenante (za theming)
CREATE POLICY "Authenticated users can view tenants"
ON public.tenants
FOR SELECT
TO authenticated
USING (true);

-- 2. Dodati tenant_id kolone u postojeće tablice
ALTER TABLE public.profiles 
ADD COLUMN tenant_id uuid REFERENCES public.tenants(id);

ALTER TABLE public.offers 
ADD COLUMN tenant_id uuid REFERENCES public.tenants(id);

ALTER TABLE public.offer_templates 
ADD COLUMN tenant_id uuid REFERENCES public.tenants(id);

ALTER TABLE public.company_profiles 
ADD COLUMN tenant_id uuid REFERENCES public.tenants(id);

ALTER TABLE public.offer_items
ADD COLUMN tenant_id uuid REFERENCES public.tenants(id);

ALTER TABLE public.offer_item_groups
ADD COLUMN tenant_id uuid REFERENCES public.tenants(id);

-- 3. Inicijalni podaci za tenante
INSERT INTO public.tenants (slug, naziv, primary_color, accent_color, background_style) VALUES
  ('aqua-bili', 'Aqua Bili', '200 80% 50%', '190 90% 95%', 'bubbles'),
  ('arton', 'Arton', '35 90% 55%', '40 100% 95%', 'geometric');

-- 4. Kreirati helper funkciju za dohvat tenant_id korisnika
CREATE OR REPLACE FUNCTION public.get_user_tenant_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT tenant_id FROM public.profiles WHERE id = _user_id
$$;

-- 5. Ažurirati RLS politike za offers - dropati stare i kreirati nove
DROP POLICY IF EXISTS "Users can view their own offers" ON public.offers;
DROP POLICY IF EXISTS "Admins can view all offers" ON public.offers;

CREATE POLICY "Users can view their own tenant offers"
ON public.offers
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() 
  AND tenant_id = get_user_tenant_id(auth.uid())
);

CREATE POLICY "Admins can view all tenant offers"
ON public.offers
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
  AND tenant_id = get_user_tenant_id(auth.uid())
);

-- Update INSERT policy
DROP POLICY IF EXISTS "Users can create their own offers" ON public.offers;
CREATE POLICY "Users can create their own offers"
ON public.offers
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id 
  AND tenant_id = get_user_tenant_id(auth.uid())
);

-- Update UPDATE policy  
DROP POLICY IF EXISTS "Users can update their own offers" ON public.offers;
CREATE POLICY "Users can update their own offers"
ON public.offers
FOR UPDATE
TO authenticated
USING (
  auth.uid() = user_id 
  AND tenant_id = get_user_tenant_id(auth.uid())
);

-- Update DELETE policy
DROP POLICY IF EXISTS "Users can delete their own offers" ON public.offers;
CREATE POLICY "Users can delete their own offers"
ON public.offers
FOR DELETE
TO authenticated
USING (
  auth.uid() = user_id 
  AND tenant_id = get_user_tenant_id(auth.uid())
);

-- 6. Ažurirati RLS politike za offer_templates
DROP POLICY IF EXISTS "Users can view their own templates" ON public.offer_templates;
DROP POLICY IF EXISTS "Users can create their own templates" ON public.offer_templates;
DROP POLICY IF EXISTS "Users can update their own templates" ON public.offer_templates;
DROP POLICY IF EXISTS "Users can delete their own templates" ON public.offer_templates;

CREATE POLICY "Users can view their own tenant templates"
ON public.offer_templates
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() 
  AND tenant_id = get_user_tenant_id(auth.uid())
);

CREATE POLICY "Users can create their own templates"
ON public.offer_templates
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id 
  AND tenant_id = get_user_tenant_id(auth.uid())
);

CREATE POLICY "Users can update their own templates"
ON public.offer_templates
FOR UPDATE
TO authenticated
USING (
  auth.uid() = user_id 
  AND tenant_id = get_user_tenant_id(auth.uid())
);

CREATE POLICY "Users can delete their own templates"
ON public.offer_templates
FOR DELETE
TO authenticated
USING (
  auth.uid() = user_id 
  AND tenant_id = get_user_tenant_id(auth.uid())
);

-- 7. Ažurirati RLS politike za company_profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.company_profiles;
DROP POLICY IF EXISTS "Users can create their own profile" ON public.company_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.company_profiles;

CREATE POLICY "Users can view their own tenant company profile"
ON public.company_profiles
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() 
  AND tenant_id = get_user_tenant_id(auth.uid())
);

CREATE POLICY "Users can create their own company profile"
ON public.company_profiles
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id 
  AND tenant_id = get_user_tenant_id(auth.uid())
);

CREATE POLICY "Users can update their own company profile"
ON public.company_profiles
FOR UPDATE
TO authenticated
USING (
  auth.uid() = user_id 
  AND tenant_id = get_user_tenant_id(auth.uid())
);