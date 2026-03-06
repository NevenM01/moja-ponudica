import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export interface TenantRow {
  id: string;
  naziv: string | null;
  slug: string | null;
  trial_ends_at: string | null;
}

export function useTenant() {
  const { user } = useAuth();
  const [tenant, setTenant] = useState<TenantRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTenant = async () => {
      if (!user?.id) {
        setTenant(null);
        setLoading(false);
        return;
      }
      setLoading(true);

      const { data: profile } = await supabase
        .from('profiles')
        .select('tenant_id')
        .eq('id', user.id)
        .maybeSingle();

      const tenantId = profile?.tenant_id ?? null;
      if (!tenantId) {
        setTenant(null);
        setLoading(false);
        return;
      }

      const { data: tenantData, error } = await supabase
        .from('tenants')
        .select('id, naziv, slug, trial_ends_at')
        .eq('id', tenantId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching tenant:', error);
        setTenant(null);
      } else {
        setTenant(tenantData as TenantRow | null);
      }
      setLoading(false);
    };

    fetchTenant();
  }, [user?.id]);

  const trialEndsAt = tenant?.trial_ends_at
    ? new Date(tenant.trial_ends_at)
    : null;
  const isTrialExpired =
    trialEndsAt !== null && trialEndsAt.getTime() < Date.now();

  return {
    tenant,
    trialEndsAt,
    isTrialExpired,
    loading,
  };
}
