import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Check,
  LayoutTemplate,
  Link2,
  Download,
  Users,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import AccessRequestDialog from '@/components/AccessRequestDialog';

const STEPS = [
  {
    number: '01',
    title: 'Izradite ponudu',
    body: 'Unesite stavke, cijene i uvjete plaćanja izravno u predlošku.',
  },
  {
    number: '02',
    title: 'Pošaljite link',
    body: 'Klijent dobiva jedinstveni link, bez potrebe za prijavom.',
  },
  {
    number: '03',
    title: 'Pratite status',
    body: 'Vidite kad je ponuda otvorena, potpisana ili odbijena, u stvarnom vremenu.',
  },
];

const FEATURES = [
  {
    icon: Sparkles,
    title: 'Izrada ponude',
    body: 'Sastavite ponudu iz predloška ili od nule, s automatskim izračunom cijena i PDV-a.',
  },
  {
    icon: LayoutTemplate,
    title: 'Predlošci',
    body: 'Spremite strukturu i stavke koje najčešće koristite i ponovno ih iskoristite za nove klijente.',
  },
  {
    icon: Link2,
    title: 'Link za pregled',
    body: 'Klijent otvara ponudu na jedinstvenom linku, bez prijave i bez slanja privitaka.',
  },
  {
    icon: Download,
    title: 'PDF izvoz',
    body: 'Svaka ponuda se generira i kao PDF, spreman za preuzimanje ili slanje mailom.',
  },
];

const STATS = [
  { value: '128', label: 'Poslano', className: 'text-background' },
  { value: '74', label: 'Prihvaćeno', className: 'text-primary-foreground' },
  { value: '39', label: 'Na čekanju', className: 'text-background' },
  { value: '15', label: 'Odbijeno', className: 'text-background/50' },
];

const Index = () => {
  const [requestOpen, setRequestOpen] = useState(false);

  useEffect(() => {
    document.body.classList.add('landing');
    return () => document.body.classList.remove('landing');
  }, []);

  return (
    <div className="relative min-h-screen overflow-x-hidden font-sans text-foreground">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_90%_70%_at_92%_-8%,hsl(var(--primary)/0.42),hsl(var(--background))_62%),radial-gradient(ellipse_70%_55%_at_-8%_8%,hsl(250_95%_93%),hsl(var(--background))_58%),radial-gradient(ellipse_50%_40%_at_50%_100%,hsl(var(--primary)/0.16),hsl(var(--background))_70%),linear-gradient(165deg,hsl(243_58%_95%)_0%,hsl(225_42%_96%)_40%,hsl(var(--background))_100%)]"
      />
      <AccessRequestDialog open={requestOpen} onOpenChange={setRequestOpen} />
      {/* NAV */}
      <header className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-baseline gap-2.5">
          <span className="font-serif text-xl font-semibold tracking-tight">Moja Ponudica</span>
          <span className="border-l border-border pl-2.5 text-sm text-muted-foreground">
            za obrtnike, agencije i tvrtke
          </span>
        </div>
        <nav className="flex gap-6 text-sm font-bold">
          <a href="#znacajke" className="hover:text-primary">Značajke</a>
          <a href="#kako-radi" className="hover:text-primary">Kako radi</a>
          <a href="#kontakt" className="hover:text-primary">Kontakt</a>
        </nav>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm font-bold hover:text-primary">
            Log in
          </Link>
          <Button size="sm" className="rounded-full px-5" onClick={() => setRequestOpen(true)}>
            Zatraži pristup
          </Button>
        </div>
      </header>

      {/* HERO */}
      <section className="mx-auto flex max-w-6xl flex-wrap items-center gap-10 px-4 pb-16 pt-4 sm:px-6 lg:px-8">
        <div className="min-w-[280px] flex-1 basis-[420px]">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card py-1.5 pl-2 pr-3.5 text-sm font-bold text-primary">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary">
              <Check className="h-2.5 w-2.5 text-primary-foreground" strokeWidth={3} />
            </span>
            Za obrtnike, agencije i tvrtke
          </div>

          <h1 className="mb-6 font-serif text-[clamp(2.75rem,7.5vw,6rem)] font-semibold leading-[0.98] tracking-tight">
            Ponude koje
            <br />
            izgledaju ozbiljno.
          </h1>

          <p className="mb-8 max-w-[28rem] text-lg leading-snug text-muted-foreground">
            Izradite, pošaljite i pratite poslovne ponude — klijent dobiva link za pregled, vi status u
            stvarnom vremenu.
          </p>

          <div className="flex flex-wrap items-center gap-6">
            <Button size="lg" className="rounded-full px-8" onClick={() => setRequestOpen(true)}>
              Zatraži pristup
            </Button>
            <Link to="/login" className="border-b border-foreground text-sm font-bold">
              Već imam račun — prijava
            </Link>
          </div>
        </div>

        {/* Right: visual composition */}
        <div className="relative min-w-[280px] flex-1 sm:w-[560px] sm:flex-none sm:flex sm:h-[560px] sm:items-center sm:justify-center">
          <div className="pointer-events-none absolute inset-0 -z-10 hidden bg-[radial-gradient(circle,hsl(var(--primary)/0.08),transparent_70%)] blur-md sm:block" />

          <div className="relative mx-auto flex w-full max-w-sm flex-col gap-2.5 rounded-md border border-border bg-card p-6 pb-5 shadow-xl sm:-rotate-[3.5deg]">
            <span className="absolute -top-3 right-4 rounded-full bg-accent px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-accent-foreground shadow-md">
              Prihvaćeno
            </span>

            <div className="flex items-baseline justify-between">
              <span className="font-mono text-[13px] text-muted-foreground">#2026-0143</span>
              <span className="text-[11px] text-muted-foreground/70">11.09.2026.</span>
            </div>
            <div className="mb-1 font-serif text-xl font-semibold">Adria Nekretnine d.o.o.</div>

            <div className="flex flex-col gap-2.5 border-t border-border pt-3.5 text-[13px] text-muted-foreground">
              <div className="flex justify-between gap-2.5">
                <span>Fasaderski radovi — 150 m² × 24,00 €</span>
                <span className="whitespace-nowrap font-mono">3.600,00 €</span>
              </div>
              <div className="flex justify-between gap-2.5">
                <span>Izolacija (XPS 10 cm) — 40 m² × 11,00 €</span>
                <span className="whitespace-nowrap font-mono">440,00 €</span>
              </div>
              <div className="flex justify-between gap-2.5">
                <span>Transport i montaža</span>
                <span className="whitespace-nowrap font-mono">128,00 €</span>
              </div>
              <div className="flex justify-between gap-2.5 text-primary">
                <span>Popust</span>
                <span className="whitespace-nowrap font-mono">−200,00 €</span>
              </div>
            </div>

            <div className="mt-1 border-t border-border pt-3">
              <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                <span>Osnovica</span>
                <span className="font-mono">3.968,00 €</span>
              </div>
              <div className="mb-2.5 flex justify-between text-xs text-muted-foreground">
                <span>PDV 25%</span>
                <span className="font-mono">992,00 €</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-bold">UKUPNO s PDV-om</span>
                <span className="font-mono text-xl font-bold text-primary">4.960,00 €</span>
              </div>
            </div>

            <div className="mt-1 font-mono text-[11px] text-muted-foreground/70">
              mojaponudica.hr/p/2026-0143
            </div>
          </div>

          {/* floating chips — hidden on mobile to avoid overflow */}
          <div className="pointer-events-none absolute inset-0 hidden sm:block">
            <div className="absolute left-1 top-[26px] flex items-center gap-2 rounded-full border border-border bg-card py-2 pl-2 pr-4 text-[13px] font-bold shadow-lg">
              <span className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-primary">
                <Check className="h-2.5 w-2.5 text-primary-foreground" strokeWidth={3} />
              </span>
              Ponuda otvorena
            </div>

            <div className="absolute left-[34px] top-[84px] flex items-center gap-2 rounded-full bg-primary py-2 pl-2 pr-4 text-[13px] font-bold text-primary-foreground shadow-lg">
              <span className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-primary-foreground">
                <Check className="h-2.5 w-2.5 text-primary" strokeWidth={3} />
              </span>
              Klijent potpisao
            </div>

            <div className="absolute -right-1.5 top-1 w-36 rounded-md border border-border bg-card p-4 shadow-lg">
              <div className="mb-1 text-[10px] uppercase tracking-wide text-muted-foreground/70">— brže do</div>
              <div className="font-mono text-3xl font-semibold leading-none text-primary">+45%</div>
              <div className="mt-1 text-xs text-muted-foreground">brže do potpisa</div>
            </div>

            <div className="absolute -right-[18px] bottom-2 flex items-center gap-2.5 rounded-md border border-border bg-card p-3 shadow-lg">
              <span className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded bg-background">
                <Download className="h-4 w-4 text-foreground" strokeWidth={1.6} />
              </span>
              <div>
                <div className="font-mono text-xs font-medium">Ponuda_2026-0143.pdf</div>
                <div className="text-[11px] text-muted-foreground/70">248 KB · preuzmi</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* feature icon strip */}
      <div className="mx-auto max-w-6xl px-4 pb-14 sm:px-6 lg:px-8">
        <div className="flex flex-wrap justify-center gap-10 border-t border-border pt-7 sm:gap-14">
          <div className="flex items-center gap-2.5 text-sm font-bold text-muted-foreground">
            <Download className="h-[18px] w-[18px]" strokeWidth={1.5} />
            PDF izvoz
          </div>
          <div className="flex items-center gap-2.5 text-sm font-bold text-muted-foreground">
            <LayoutTemplate className="h-[18px] w-[18px]" strokeWidth={1.5} />
            Predlošci
          </div>
          <div className="flex items-center gap-2.5 text-sm font-bold text-muted-foreground">
            <Users className="h-[18px] w-[18px]" strokeWidth={1.5} />
            Tim
          </div>
        </div>
      </div>

      {/* FEATURES */}
      <section id="znacajke" className="mx-auto max-w-6xl px-4 pb-20 pt-10 sm:px-6 lg:px-8">
        <div className="mb-12 max-w-xl">
          <div className="mb-3 text-sm font-bold uppercase tracking-wide text-primary">Značajke</div>
          <h2 className="font-serif text-[clamp(2rem,4vw,2.75rem)] font-semibold leading-tight">
            Sve što treba za ozbiljnu ponudu, na jednom mjestu.
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="flex flex-col gap-3.5 rounded-md border border-border bg-card p-6 shadow-md"
            >
              <Icon className="h-5 w-5 text-primary" strokeWidth={1.5} />
              <div className="font-serif text-lg font-semibold">{title}</div>
              <div className="text-[14.5px] leading-relaxed text-muted-foreground">{body}</div>
            </div>
          ))}

          <div className="flex flex-col items-start justify-between gap-6 rounded-md bg-foreground p-7 shadow-lg sm:col-span-2 sm:flex-row sm:items-center">
            <p className="max-w-lg font-serif text-lg italic leading-relaxed text-background">
              "Podaci ostaju u EU-u, a svaka ponuda dostupna je samo putem jedinstvenog, neindeksiranog
              linka."
            </p>
            <span className="whitespace-nowrap text-xs font-bold uppercase tracking-wide text-background/60">
              GDPR usklađeno
            </span>
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <div className="bg-foreground px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 text-center sm:grid-cols-4">
          {STATS.map(({ value, label, className }) => (
            <div key={label}>
              <div className={`font-mono text-[clamp(2.1rem,4.5vw,3rem)] font-semibold ${className}`}>
                {value}
              </div>
              <div className="mt-1.5 text-sm font-bold text-background/60">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* HOW IT WORKS */}
      <section id="kako-radi" className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <h2 className="mb-14 font-serif text-[clamp(1.625rem,3vw,2rem)] font-semibold leading-tight">
          Tri koraka do potpisane ponude.
        </h2>

        <div className="relative">
          <div className="absolute inset-x-0 top-[23px] hidden h-px bg-border sm:block" />
          <div className="relative grid grid-cols-1 gap-10 sm:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.number} className="flex flex-col gap-4">
                <div className="flex h-[46px] w-[46px] items-center justify-center rounded-full border-[1.5px] border-primary bg-background font-mono text-sm font-semibold text-primary">
                  {s.number}
                </div>
                <div className="font-serif text-xl font-semibold">{s.title}</div>
                <div className="text-[14.5px] leading-relaxed text-muted-foreground">{s.body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA + FOOTER */}
      <section id="kontakt">
        <div className="relative mx-auto flex max-w-2xl flex-col items-center gap-6 px-4 pb-14 pt-20 text-center sm:px-6">
          <div className="pointer-events-none absolute left-1/2 top-[-40px] -z-10 h-[340px] w-[520px] max-w-full -translate-x-1/2 bg-[radial-gradient(circle,hsl(var(--primary)/0.1),transparent_70%)] blur-md" />

          <div className="inline-flex -rotate-3 items-center gap-2 rounded-full border border-border bg-card py-1.5 pl-2 pr-3.5 text-sm font-bold">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary">
              <Check className="h-2.5 w-2.5 text-primary-foreground" strokeWidth={3} />
            </span>
            Rana faza — pridružite se prvima
          </div>

          <h2 className="font-serif text-[clamp(1.875rem,4.2vw,2.875rem)] font-semibold leading-tight">
            Spremni prestati slati ponude kao Word dokument?
          </h2>
          <p className="max-w-md text-base text-muted-foreground">
            Pridružite se ranom pristupu za Moja Ponudica i izradite prvu ponudu za manje od pet minuta.
          </p>
          <Button size="lg" className="rounded-full px-9" onClick={() => setRequestOpen(true)}>
            Zatraži pristup
          </Button>
        </div>

        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-8 text-sm text-muted-foreground sm:px-6 lg:px-8">
          <span className="font-serif font-semibold text-foreground">Moja Ponudica</span>
          <a href="mailto:info@mojaponudica.hr" className="hover:text-primary">
            info@mojaponudica.hr
          </a>
          <span>© 2026 Moja Ponudica. Hrvatska.</span>
        </div>
      </section>
    </div>
  );
};

export default Index;
