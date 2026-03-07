import { useState, useEffect, useMemo } from 'react';
import { useTenant } from '@/hooks/useTenant';
import { supabase } from '@/integrations/supabase/client';
import { TENANT_FEATURES_TABLE, type TenantFeatureKey } from '@/lib/tenantFeatures';

export type TenantFeaturesMap = Partial<Record<TenantFeatureKey, boolean>>;

/**
 * Dohvaća uključene/isključene opcije za tenant trenutnog korisnika.
 * Koristi u komponentama: if (isFeatureEnabled('pdf_export')) { ... }
 */
export function useTenantFeatures() {
  const { tenant, loading: tenantLoading } = useTenant();
  const [rows, setRows] = useState<{ feature_key: string; enabled: boolean }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tenant?.id) {
      setRows([]);
      setLoading(false);
      return;
    }

    const fetchFeatures = async () => {
      const { data, error } = await supabase
        .from(TENANT_FEATURES_TABLE)
        .select('feature_key, enabled')
        .eq('tenant_id', tenant.id);

      if (error) {
        console.error('Error fetching tenant features:', error);
        setRows([]);
      } else {
        setRows(data ?? []);
      }
      setLoading(false);
    };

    fetchFeatures();
  }, [tenant?.id]);

  const features: TenantFeaturesMap = useMemo(() => {
    const map: TenantFeaturesMap = {};
    for (const r of rows) {
      map[r.feature_key as TenantFeatureKey] = r.enabled;
    }
    return map;
  }, [rows]);

  const isFeatureEnabled = (key: TenantFeatureKey): boolean => {
    // Ako nema zapisa, smatramo da je isključeno (default off)
    const v = features[key];
    return v === true;
  };

  return {
    features,
    isFeatureEnabled,
    loading: tenantLoading || loading,
  };
}
