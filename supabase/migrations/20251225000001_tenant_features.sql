-- Tenant features: per-tenant toggles for options (admin turns on/off per client)
CREATE TABLE public.tenant_features (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  feature_key text NOT NULL,
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, feature_key)
);

CREATE INDEX idx_tenant_features_tenant_id ON public.tenant_features(tenant_id);

ALTER TABLE public.tenant_features ENABLE ROW LEVEL SECURITY;

-- Admins can do everything
CREATE POLICY "Admins manage tenant_features"
ON public.tenant_features
FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Users can read only their own tenant's features (for app to show/hide UI)
CREATE POLICY "Users view own tenant features"
ON public.tenant_features
FOR SELECT
USING (tenant_id = public.get_user_tenant_id(auth.uid()));
