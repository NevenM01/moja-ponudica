/**
 * Dodaje admin ulogu korisniku po emailu na test DB.
 * Uporaba: node --env-file=.env.test scripts/set-admin-role.mjs
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const USER_EMAIL = process.env.SET_ADMIN_EMAIL || 'neven@test.ai';

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Greška: Postavite VITE_SUPABASE_URL i SUPABASE_SERVICE_ROLE_KEY u .env.test');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function main() {
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

  const { error } = await supabase
    .from('user_roles')
    .upsert({ user_id: user.id, role: 'admin' }, { onConflict: 'user_id,role' });

  if (error) {
    console.error('Greška pri dodjeli admin uloge:', error.message);
    process.exit(1);
  }

  console.log('Admin uloga dodijeljena:');
  console.log('  Korisnik:', USER_EMAIL, '(id:', user.id + ')');
}

main();
