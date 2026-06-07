CREATE TABLE public.notes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id uuid REFERENCES public.tenants(id) NOT NULL,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  text text NOT NULL,
  color text NOT NULL DEFAULT 'bg-blue-500/20',
  updated_by_email text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant members can view notes" ON public.notes
FOR SELECT USING (tenant_id = get_user_tenant_id((select auth.uid())));

CREATE POLICY "Tenant members can insert notes" ON public.notes
FOR INSERT WITH CHECK (tenant_id = get_user_tenant_id((select auth.uid())));

CREATE POLICY "Tenant members can update notes" ON public.notes
FOR UPDATE USING (tenant_id = get_user_tenant_id((select auth.uid())));

CREATE POLICY "Tenant members can delete notes" ON public.notes
FOR DELETE USING (tenant_id = get_user_tenant_id((select auth.uid())));

GRANT SELECT, INSERT, UPDATE, DELETE ON public.notes TO authenticated;
