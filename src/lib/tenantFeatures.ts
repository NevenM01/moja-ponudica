/** Ime tablice u Supabase – koristi donju crticu (tenant_features), ne razmak. */
export const TENANT_FEATURES_TABLE = 'tenant_features';

/** Stupci za upsert onConflict (donje crtice). */
export const TENANT_FEATURES_CONFLICT = 'tenant_id,feature_key';

/**
 * Definirani ključevi opcija po tenantu. Dodaj novi key kad klijent traži novu opciju.
 * Admin uključuje/isključuje po tenantu u Admin → Tenanti → Opcije.
 */
export const TENANT_FEATURE_KEYS = [
  { key: 'pdf_export', label: 'Export u PDF' },
  { key: 'custom_branding', label: 'Prilagođeni branding (boje, logo)' },
  { key: 'api_access', label: 'API pristup' },
  { key: 'offer_preview_link', label: 'Live pregled ponude (link)' },
] as const;

export type TenantFeatureKey = (typeof TENANT_FEATURE_KEYS)[number]['key'];
