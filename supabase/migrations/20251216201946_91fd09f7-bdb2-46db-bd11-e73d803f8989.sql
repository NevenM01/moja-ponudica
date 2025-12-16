-- Create offer_item_groups table for grouping items
CREATE TABLE public.offer_item_groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  offer_id UUID NOT NULL REFERENCES public.offers(id) ON DELETE CASCADE,
  naziv TEXT NOT NULL,
  redni_broj INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.offer_item_groups ENABLE ROW LEVEL SECURITY;

-- RLS policies for offer_item_groups
CREATE POLICY "Users can view their own offer groups"
ON public.offer_item_groups
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.offers
  WHERE offers.id = offer_item_groups.offer_id
  AND offers.user_id = auth.uid()
));

CREATE POLICY "Users can create their own offer groups"
ON public.offer_item_groups
FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.offers
  WHERE offers.id = offer_item_groups.offer_id
  AND offers.user_id = auth.uid()
));

CREATE POLICY "Users can update their own offer groups"
ON public.offer_item_groups
FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.offers
  WHERE offers.id = offer_item_groups.offer_id
  AND offers.user_id = auth.uid()
));

CREATE POLICY "Users can delete their own offer groups"
ON public.offer_item_groups
FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.offers
  WHERE offers.id = offer_item_groups.offer_id
  AND offers.user_id = auth.uid()
));

-- Add group_id to offer_items (nullable for backward compatibility)
ALTER TABLE public.offer_items 
ADD COLUMN group_id UUID REFERENCES public.offer_item_groups(id) ON DELETE CASCADE;