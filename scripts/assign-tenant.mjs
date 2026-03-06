/**
 * Dodjeljuje test tenant korisniku neven@test.ai na lokalnoj test DB.
 * Uporaba: node --env-file=.env.test scripts/assign-tenant.mjs
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const USER_EMAIL = process.env.ASSIGN_TENANT_EMAIL || 'neven@test.ai';

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Greška: Postavite VITE_SUPABASE_URL i SUPABASE_SERVICE_ROLE_KEY u .env.test');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function main() {
  // 1. Nađi user id po emailu
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    console.error('Greška pri dohvatu korisnika:', listError.message);
    process.exit(1);
  }
  const user = users?.find(u => u.email?.toLowerCase() === USER_EMAIL.toLowerCase());
  if (!user) {
    console.error('Korisnik nije pronađen:', USER_EMAIL);
    process.exit(1);
  }

  // 2. Dohvati postojeći tenant (default iz migracije) ili kreiraj test tenant
  const DEFAULT_TENANT_ID = 'f22d794a-1379-402e-b56b-1d88afd265bf';
  const { data: tenants } = await supabase.from('tenants').select('id').limit(1);
  let tenantId = tenants?.[0]?.id || DEFAULT_TENANT_ID;

  if (!tenants?.length) {
    const { data: newTenant, error: insertErr } = await supabase
      .from('tenants')
      .insert({ naziv: 'Test tenant', slug: 'test' })
      .select('id')
      .single();
    if (!insertErr && newTenant) tenantId = newTenant.id;
  }

  // 3. Dodjeli tenant profilu
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ tenant_id: tenantId })
    .eq('id', user.id);

  if (updateError) {
    console.error('Greška pri dodjeli tenanta:', updateError.message);
    process.exit(1);
  }

  console.log('Tenant dodijeljen:');
  console.log('  Korisnik:', USER_EMAIL, '(id:', user.id + ')');
  console.log('  Tenant ID:', tenantId);
}

main();
