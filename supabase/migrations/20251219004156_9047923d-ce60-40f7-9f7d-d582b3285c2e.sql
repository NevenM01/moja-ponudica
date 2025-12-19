-- Kreiranje funkcije za automatsko postavljanje tenant_id
CREATE OR REPLACE FUNCTION public.set_tenant_id_from_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_tenant_id uuid;
BEGIN
  -- Dohvati tenant_id iz profila korisnika
  SELECT tenant_id INTO user_tenant_id 
  FROM public.profiles 
  WHERE id = NEW.user_id;
  
  -- Postavi tenant_id ako nije već postavljen
  IF NEW.tenant_id IS NULL AND user_tenant_id IS NOT NULL THEN
    NEW.tenant_id := user_tenant_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger za offers
DROP TRIGGER IF EXISTS set_offer_tenant_id ON public.offers;
CREATE TRIGGER set_offer_tenant_id
  BEFORE INSERT ON public.offers
  FOR EACH ROW
  EXECUTE FUNCTION public.set_tenant_id_from_user();

-- Trigger za offer_templates
DROP TRIGGER IF EXISTS set_offer_template_tenant_id ON public.offer_templates;
CREATE TRIGGER set_offer_template_tenant_id
  BEFORE INSERT ON public.offer_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.set_tenant_id_from_user();

-- Trigger za company_profiles
DROP TRIGGER IF EXISTS set_company_profile_tenant_id ON public.company_profiles;
CREATE TRIGGER set_company_profile_tenant_id
  BEFORE INSERT ON public.company_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_tenant_id_from_user();

-- Funkcija za postavljanje tenant_id na child tablice (offer_items, offer_item_groups)
CREATE OR REPLACE FUNCTION public.set_tenant_id_from_offer()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  offer_tenant_id uuid;
BEGIN
  -- Dohvati tenant_id iz ponude
  SELECT tenant_id INTO offer_tenant_id 
  FROM public.offers 
  WHERE id = NEW.offer_id;
  
  -- Postavi tenant_id ako nije već postavljen
  IF NEW.tenant_id IS NULL AND offer_tenant_id IS NOT NULL THEN
    NEW.tenant_id := offer_tenant_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger za offer_items
DROP TRIGGER IF EXISTS set_offer_item_tenant_id ON public.offer_items;
CREATE TRIGGER set_offer_item_tenant_id
  BEFORE INSERT ON public.offer_items
  FOR EACH ROW
  EXECUTE FUNCTION public.set_tenant_id_from_offer();

-- Trigger za offer_item_groups
DROP TRIGGER IF EXISTS set_offer_item_group_tenant_id ON public.offer_item_groups;
CREATE TRIGGER set_offer_item_group_tenant_id
  BEFORE INSERT ON public.offer_item_groups
  FOR EACH ROW
  EXECUTE FUNCTION public.set_tenant_id_from_offer();