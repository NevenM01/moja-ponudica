
-- Create company_profiles table
CREATE TABLE public.company_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  naziv_firme TEXT NOT NULL,
  oib TEXT NOT NULL,
  adresa TEXT NOT NULL,
  iban TEXT,
  email TEXT,
  telefon TEXT,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create offers table
CREATE TABLE public.offers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  offer_number TEXT NOT NULL,
  client_naziv TEXT NOT NULL,
  client_oib TEXT,
  client_adresa TEXT,
  napomena TEXT,
  ukupno DECIMAL(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create offer_items table
CREATE TABLE public.offer_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  offer_id UUID NOT NULL REFERENCES public.offers(id) ON DELETE CASCADE,
  opis TEXT NOT NULL,
  kolicina DECIMAL(10,2) NOT NULL DEFAULT 1,
  cijena DECIMAL(12,2) NOT NULL DEFAULT 0,
  ukupno DECIMAL(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.company_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offer_items ENABLE ROW LEVEL SECURITY;

-- RLS policies for company_profiles
CREATE POLICY "Users can view their own profile" ON public.company_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own profile" ON public.company_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.company_profiles FOR UPDATE USING (auth.uid() = user_id);

-- RLS policies for offers
CREATE POLICY "Users can view their own offers" ON public.offers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own offers" ON public.offers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own offers" ON public.offers FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own offers" ON public.offers FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for offer_items
CREATE POLICY "Users can view their own offer items" ON public.offer_items FOR SELECT USING (EXISTS (SELECT 1 FROM public.offers WHERE offers.id = offer_items.offer_id AND offers.user_id = auth.uid()));
CREATE POLICY "Users can create their own offer items" ON public.offer_items FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.offers WHERE offers.id = offer_items.offer_id AND offers.user_id = auth.uid()));
CREATE POLICY "Users can update their own offer items" ON public.offer_items FOR UPDATE USING (EXISTS (SELECT 1 FROM public.offers WHERE offers.id = offer_items.offer_id AND offers.user_id = auth.uid()));
CREATE POLICY "Users can delete their own offer items" ON public.offer_items FOR DELETE USING (EXISTS (SELECT 1 FROM public.offers WHERE offers.id = offer_items.offer_id AND offers.user_id = auth.uid()));

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers
CREATE TRIGGER update_company_profiles_updated_at BEFORE UPDATE ON public.company_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_offers_updated_at BEFORE UPDATE ON public.offers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
