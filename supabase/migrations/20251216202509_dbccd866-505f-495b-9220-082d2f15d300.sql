-- Create offer_templates table
CREATE TABLE public.offer_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  naziv TEXT NOT NULL,
  napomena TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create offer_template_groups table
CREATE TABLE public.offer_template_groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID NOT NULL REFERENCES public.offer_templates(id) ON DELETE CASCADE,
  naziv TEXT NOT NULL,
  redni_broj INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create offer_template_items table
CREATE TABLE public.offer_template_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID NOT NULL REFERENCES public.offer_templates(id) ON DELETE CASCADE,
  group_id UUID REFERENCES public.offer_template_groups(id) ON DELETE CASCADE,
  opis TEXT NOT NULL,
  jedinica TEXT NOT NULL DEFAULT 'kom',
  kolicina NUMERIC NOT NULL DEFAULT 1,
  cijena NUMERIC NOT NULL DEFAULT 0,
  is_optional BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.offer_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offer_template_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offer_template_items ENABLE ROW LEVEL SECURITY;

-- RLS policies for offer_templates
CREATE POLICY "Users can view their own templates"
ON public.offer_templates FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own templates"
ON public.offer_templates FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own templates"
ON public.offer_templates FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own templates"
ON public.offer_templates FOR DELETE
USING (auth.uid() = user_id);

-- RLS policies for offer_template_groups
CREATE POLICY "Users can view their own template groups"
ON public.offer_template_groups FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.offer_templates
  WHERE offer_templates.id = offer_template_groups.template_id
  AND offer_templates.user_id = auth.uid()
));

CREATE POLICY "Users can create their own template groups"
ON public.offer_template_groups FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.offer_templates
  WHERE offer_templates.id = offer_template_groups.template_id
  AND offer_templates.user_id = auth.uid()
));

CREATE POLICY "Users can update their own template groups"
ON public.offer_template_groups FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.offer_templates
  WHERE offer_templates.id = offer_template_groups.template_id
  AND offer_templates.user_id = auth.uid()
));

CREATE POLICY "Users can delete their own template groups"
ON public.offer_template_groups FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.offer_templates
  WHERE offer_templates.id = offer_template_groups.template_id
  AND offer_templates.user_id = auth.uid()
));

-- RLS policies for offer_template_items
CREATE POLICY "Users can view their own template items"
ON public.offer_template_items FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.offer_templates
  WHERE offer_templates.id = offer_template_items.template_id
  AND offer_templates.user_id = auth.uid()
));

CREATE POLICY "Users can create their own template items"
ON public.offer_template_items FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.offer_templates
  WHERE offer_templates.id = offer_template_items.template_id
  AND offer_templates.user_id = auth.uid()
));

CREATE POLICY "Users can update their own template items"
ON public.offer_template_items FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.offer_templates
  WHERE offer_templates.id = offer_template_items.template_id
  AND offer_templates.user_id = auth.uid()
));

CREATE POLICY "Users can delete their own template items"
ON public.offer_template_items FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.offer_templates
  WHERE offer_templates.id = offer_template_items.template_id
  AND offer_templates.user_id = auth.uid()
));