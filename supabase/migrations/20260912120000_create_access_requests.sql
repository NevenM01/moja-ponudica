CREATE TABLE public.access_requests (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  ime text NOT NULL,
  email text NOT NULL,
  tvrtka text,
  telefon text,
  poruka text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT access_requests_status_check CHECK (status IN ('pending', 'invited', 'rejected'))
);

CREATE UNIQUE INDEX access_requests_pending_email_idx
  ON public.access_requests (lower(email))
  WHERE status = 'pending';

ALTER TABLE public.access_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit access request"
ON public.access_requests
FOR INSERT
TO anon, authenticated
WITH CHECK (
  length(trim(ime)) > 1
  AND length(trim(email)) > 3
);

CREATE POLICY "Admins can view access requests"
ON public.access_requests
FOR SELECT
TO authenticated
USING (has_role((select auth.uid()), 'admin'::app_role));

CREATE POLICY "Admins can update access requests"
ON public.access_requests
FOR UPDATE
TO authenticated
USING (has_role((select auth.uid()), 'admin'::app_role));

CREATE POLICY "Admins can delete access requests"
ON public.access_requests
FOR DELETE
TO authenticated
USING (has_role((select auth.uid()), 'admin'::app_role));

GRANT SELECT, INSERT, UPDATE, DELETE ON public.access_requests TO authenticated;
GRANT INSERT ON public.access_requests TO anon;
