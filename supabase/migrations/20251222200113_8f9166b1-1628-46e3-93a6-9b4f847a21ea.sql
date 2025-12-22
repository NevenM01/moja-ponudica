-- Dodaj polja za objekat u offers tablicu
ALTER TABLE public.offers 
ADD COLUMN objekat_naziv TEXT,
ADD COLUMN objekat_opis TEXT;