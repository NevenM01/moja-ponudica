-- Allow admins to view all offers
CREATE POLICY "Admins can view all offers"
ON public.offers
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));