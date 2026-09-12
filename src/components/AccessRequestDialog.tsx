import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

interface AccessRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const emptyForm = {
  ime: '',
  email: '',
  tvrtka: '',
  telefon: '',
  poruka: '',
  website: '',
};

const encode = (data: Record<string, string>) =>
  Object.keys(data)
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`)
    .join('&');

const AccessRequestDialog = ({ open, onOpenChange }: AccessRequestDialogProps) => {
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleOpenChange = (next: boolean) => {
    onOpenChange(next);
    if (!next) {
      setTimeout(() => {
        setForm(emptyForm);
        setSubmitted(false);
        setLoading(false);
      }, 200);
    }
  };

  const handleChange = (field: keyof typeof emptyForm) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.website) {
      setSubmitted(true);
      return;
    }

    setLoading(true);
    try {
      await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: encode({
          'form-name': 'access-request',
          'bot-field': '',
          ime: form.ime.trim(),
          email: form.email.trim().toLowerCase(),
          tvrtka: form.tvrtka.trim(),
          telefon: form.telefon.trim(),
          poruka: form.poruka.trim(),
        }),
      });
      setSubmitted(true);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Greška pri slanju zahtjeva';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-md gap-5 overflow-y-auto rounded-md border-border bg-card p-6 sm:rounded-md">
        <DialogHeader className="space-y-2 text-left">
          <DialogTitle className="font-serif text-2xl font-semibold tracking-tight">
            Zatraži pristup
          </DialogTitle>
          <DialogDescription className="text-[14.5px] leading-relaxed">
            Moja Ponudica je trenutno u ranoj fazi. Ispunite formu i javit ćemo vam se kad vam
            otvorimo račun.
          </DialogDescription>
        </DialogHeader>

        {submitted ? (
          <div className="rounded-md bg-background px-4 py-5">
            <p className="font-serif text-lg font-semibold">Hvala, zahtjev je zaprimljen.</p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Javit ćemo vam se na email čim odobrimo pristup.
            </p>
            <Button
              type="button"
              className="mt-5 rounded-full px-6"
              onClick={() => handleOpenChange(false)}
            >
              Zatvori
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="hidden" aria-hidden="true">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                value={form.website}
                onChange={handleChange('website')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ime">Ime i prezime</Label>
              <Input
                id="ime"
                value={form.ime}
                onChange={handleChange('ime')}
                required
                placeholder="Ana Horvat"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="access-email">Email</Label>
              <Input
                id="access-email"
                type="email"
                value={form.email}
                onChange={handleChange('email')}
                required
                placeholder="ana@tvrtka.hr"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tvrtka">Tvrtka / obrt</Label>
              <Input
                id="tvrtka"
                value={form.tvrtka}
                onChange={handleChange('tvrtka')}
                placeholder="Naziv tvrtke ili obrta"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefon">Telefon <span className="text-muted-foreground">(opcionalno)</span></Label>
              <Input
                id="telefon"
                type="tel"
                value={form.telefon}
                onChange={handleChange('telefon')}
                placeholder="+385 …"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="poruka">Poruka <span className="text-muted-foreground">(opcionalno)</span></Label>
              <Textarea
                id="poruka"
                value={form.poruka}
                onChange={handleChange('poruka')}
                placeholder="Kratko nam recite čemu vam treba Moja Ponudica"
                rows={3}
              />
            </div>

            <Button type="submit" size="lg" className="w-full rounded-full" disabled={loading}>
              {loading ? 'Slanje...' : 'Pošalji zahtjev'}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AccessRequestDialog;
