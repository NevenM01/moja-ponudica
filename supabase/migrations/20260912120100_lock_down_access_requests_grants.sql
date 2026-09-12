REVOKE ALL ON public.access_requests FROM anon;
REVOKE ALL ON public.access_requests FROM authenticated;
GRANT INSERT ON public.access_requests TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.access_requests TO authenticated;
