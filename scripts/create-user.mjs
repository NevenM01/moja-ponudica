/**
 * Kreira novog Supabase Auth korisnika.
 *
 * ZA TEST BAZU (preporučeno):
 *   1. Kopiraj .env.test.example u .env.test i popuni s test Supabase URL i service_role key.
 *   2. node --env-file=.env.test scripts/create-user.mjs
 *
 * Service role key: Supabase Dashboard (test projekt) → Project Settings → API → service_role (secret)
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Greška: Postavite VITE_SUPABASE_URL i SUPABASE_SERVICE_ROLE_KEY u .env');
  console.error('Service role key: Supabase Dashboard → Project Settings → API → service_role');
  process.exit(1);
}

const email = process.env.CREATE_USER_EMAIL || 'neven@example.com';
const password = process.env.CREATE_USER_PASSWORD || '123456';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const { data, error } = await supabase.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
  user_metadata: { full_name: 'Neven' }
});

if (error) {
  console.error('Greška pri kreiranju korisnika:', error.message);
  process.exit(1);
}

console.log('Korisnik uspješno kreiran:');
console.log('  Email:', data.user?.email);
console.log('  ID:', data.user?.id);
console.log('  Prijava: email =', email, ', lozinka =', password.replace(/./g, '*'));
