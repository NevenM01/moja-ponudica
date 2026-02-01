

## Plan: Kreiranje "keep-alive" Edge Function

### Svrha
Edge funkcija koja održava Supabase projekt aktivnim na Free planu izvršavanjem jednostavnog SELECT upita nad `profiles` tablicom.

### Tehnički detalji

**Nova datoteka:** `supabase/functions/keep-alive/index.ts`

Funkcija će:
1. Koristiti CORS headers za podršku web pozivima
2. Kreirati Supabase admin klijent sa `SUPABASE_URL` i `SUPABASE_SERVICE_ROLE_KEY`
3. Izvršiti `SELECT count(*) FROM profiles LIMIT 1` upit
4. Vratiti JSON: `{ "status": "ok", "keepAlive": true, "timestamp": "..." }`
5. Logirati uspjeh/grešku za debugging

**Ažuriranje:** `supabase/config.toml`

Dodati konfiguraciju:
```toml
[functions.keep-alive]
verify_jwt = false
```

`verify_jwt = false` jer je ovo javna health-check ruta koja ne treba autentikaciju.

### Struktura koda

```text
supabase/functions/keep-alive/
└── index.ts
    ├── CORS headers
    ├── OPTIONS handler (preflight)
    ├── Supabase admin client init
    ├── SELECT query na profiles
    └── JSON response
```

### Korištenje

Funkcija se može pozvati:
- Ručno: `GET/POST https://nicblfsldnpprtnclijt.supabase.co/functions/v1/keep-alive`
- Automatski: Konfiguriraj cron job (pg_cron) da poziva funkciju svaka 24h ili tjedno

