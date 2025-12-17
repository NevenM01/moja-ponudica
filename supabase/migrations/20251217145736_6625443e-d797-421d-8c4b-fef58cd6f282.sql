-- Add description field to offer_item_groups
ALTER TABLE public.offer_item_groups
ADD COLUMN opis text;

-- Add description field to offer_template_groups for templates
ALTER TABLE public.offer_template_groups
ADD COLUMN opis text;