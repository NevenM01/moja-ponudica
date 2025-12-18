import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface Tenant {
  id: string;
  slug: string;
  naziv: string;
  primary_color: string;
  accent_color: string;
  logo_url: string | null;
  background_style: string;
}

interface TenantContextType {
  tenant: Tenant | null;
  isLoading: boolean;
  error: string | null;
}

const TenantContext = createContext<TenantContextType>({
  tenant: null,
  isLoading: true,
  error: null,
});

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};

interface TenantProviderProps {
  children: ReactNode;
}

export const TenantProvider = ({ children }: TenantProviderProps) => {
  const { user } = useAuth();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTenant = async () => {
      if (!user) {
        setTenant(null);
        setIsLoading(false);
        return;
      }

      try {
        // First get user's tenant_id from profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('tenant_id')
          .eq('id', user.id)
          .maybeSingle();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
          setError('Greška pri dohvaćanju profila');
          setIsLoading(false);
          return;
        }

        if (!profile?.tenant_id) {
          // User has no tenant assigned yet
          setTenant(null);
          setIsLoading(false);
          return;
        }

        // Now fetch the tenant details
        const { data: tenantData, error: tenantError } = await supabase
          .from('tenants')
          .select('*')
          .eq('id', profile.tenant_id)
          .single();

        if (tenantError) {
          console.error('Error fetching tenant:', tenantError);
          setError('Greška pri dohvaćanju tenanta');
          setIsLoading(false);
          return;
        }

        setTenant(tenantData as Tenant);
        
        // Apply tenant theme to CSS variables
        if (tenantData) {
          applyTenantTheme(tenantData as Tenant);
        }
      } catch (err) {
        console.error('Unexpected error:', err);
        setError('Neočekivana greška');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTenant();
  }, [user]);

  return (
    <TenantContext.Provider value={{ tenant, isLoading, error }}>
      {children}
    </TenantContext.Provider>
  );
};

// Apply tenant-specific CSS variables
function applyTenantTheme(tenant: Tenant) {
  const root = document.documentElement;
  
  // Set data-tenant attribute for CSS selectors
  root.setAttribute('data-tenant', tenant.slug);
  
  // Apply dynamic colors
  if (tenant.primary_color) {
    root.style.setProperty('--primary', tenant.primary_color);
  }
  if (tenant.accent_color) {
    root.style.setProperty('--accent', tenant.accent_color);
  }
}
