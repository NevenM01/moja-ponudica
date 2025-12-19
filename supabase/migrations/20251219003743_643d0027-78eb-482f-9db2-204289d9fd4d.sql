-- Migracija starih podataka - dodjela tenant_id svim postojećim zapisima
-- Korisnik neven@test.ai (bf598a36-4348-4db8-98ce-011bf6f47848) pripada Aqua Bili tenantu (f22d794a-1379-402e-b56b-1d88afd265bf)

-- 1. Ažuriraj sve offers bez tenant_id - dodijeli tenant iz korisnikovog profila
UPDATE offers o
SET tenant_id = p.tenant_id
FROM profiles p
WHERE o.user_id = p.id 
  AND o.tenant_id IS NULL 
  AND p.tenant_id IS NOT NULL;

-- 2. Ažuriraj offer_items bez tenant_id - naslijedi tenant od ponude
UPDATE offer_items oi
SET tenant_id = o.tenant_id
FROM offers o
WHERE oi.offer_id = o.id 
  AND oi.tenant_id IS NULL 
  AND o.tenant_id IS NOT NULL;

-- 3. Ažuriraj offer_item_groups bez tenant_id - naslijedi tenant od ponude
UPDATE offer_item_groups oig
SET tenant_id = o.tenant_id
FROM offers o
WHERE oig.offer_id = o.id 
  AND oig.tenant_id IS NULL 
  AND o.tenant_id IS NOT NULL;

-- 4. Ažuriraj offer_templates bez tenant_id - dodijeli tenant iz korisnikovog profila
UPDATE offer_templates ot
SET tenant_id = p.tenant_id
FROM profiles p
WHERE ot.user_id = p.id 
  AND ot.tenant_id IS NULL 
  AND p.tenant_id IS NOT NULL;

-- 5. Ažuriraj company_profiles bez tenant_id - dodijeli tenant iz korisnikovog profila
UPDATE company_profiles cp
SET tenant_id = p.tenant_id
FROM profiles p
WHERE cp.user_id = p.id 
  AND cp.tenant_id IS NULL 
  AND p.tenant_id IS NOT NULL;