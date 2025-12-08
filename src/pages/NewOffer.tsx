import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AppLayout from '@/components/AppLayout';
import CompanyInfoBox from '@/components/CompanyInfoBox';
import OfferItemsEditor from '@/components/OfferItemsEditor';

interface OfferItem {
  id: string;
  opis: string;
  kolicina: number;
  cijena: number;
  ukupno: number;
}

interface CompanyProfile {
  naziv_firme: string;
  oib: string;
  adresa: string;
  iban: string;
  email: string;
  telefon: string;
}

const NewOffer = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(null);

  const [offerNumber, setOfferNumber] = useState('');
  const [clientNaziv, setClientNaziv] = useState('');
  const [clientOib, setClientOib] = useState('');
  const [clientAdresa, setClientAdresa] = useState('');
  const [napomena, setNapomena] = useState('');
  const [items, setItems] = useState<OfferItem[]>([
    { id: crypto.randomUUID(), opis: '', kolicina: 1, cijena: 0, ukupno: 0 },
  ]);

  useEffect(() => {
    if (user) {
      fetchCompanyProfile();
      generateOfferNumber();
    }
  }, [user]);

  const fetchCompanyProfile = async () => {
    const { data } = await supabase
      .from('company_profiles')
      .select('naziv_firme, oib, adresa, iban, email, telefon')
      .eq('user_id', user?.id)
      .maybeSingle();

    if (data) {
      setCompanyProfile(data);
    }
  };

  const generateOfferNumber = async () => {
    const year = new Date().getFullYear();
    const { count } = await supabase
      .from('offers')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user?.id);

    const nextNumber = (count || 0) + 1;
    setOfferNumber(`PON-${year}-${String(nextNumber).padStart(4, '0')}`);
  };

  const updateItem = (id: string, field: keyof OfferItem, value: string | number) => {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          if (field === 'kolicina' || field === 'cijena') {
            updated.ukupno = updated.kolicina * updated.cijena;
          }
          return updated;
        }
        return item;
      })
    );
  };

  const addItem = () => {
    setItems([...items, { id: crypto.randomUUID(), opis: '', kolicina: 1, cijena: 0, ukupno: 0 }]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id));
    }
  };

  const total = items.reduce((sum, item) => sum + item.ukupno, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyProfile) {
      toast({ title: 'Greška', description: 'Morate prvo popuniti profil tvrtke.', variant: 'destructive' });
      navigate('/profil');
      return;
    }

    setLoading(true);

    try {
      const { data: offer, error: offerError } = await supabase
        .from('offers')
        .insert({
          user_id: user?.id,
          offer_number: offerNumber,
          client_naziv: clientNaziv,
          client_oib: clientOib,
          client_adresa: clientAdresa,
          napomena,
          ukupno: total,
        })
        .select()
        .single();

      if (offerError) throw offerError;

      const itemsToInsert = items.map((item) => ({
        offer_id: offer.id,
        opis: item.opis,
        kolicina: item.kolicina,
        cijena: item.cijena,
        ukupno: item.ukupno,
      }));

      const { error: itemsError } = await supabase.from('offer_items').insert(itemsToInsert);
      if (itemsError) throw itemsError;

      toast({ title: 'Ponuda spremljena!' });
      navigate(`/ponuda/${offer.id}`);
    } catch (error: any) {
      toast({ title: 'Greška', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6 max-w-4xl mx-auto">
        <CompanyInfoBox profile={companyProfile} />

        <Card>
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="text-base md:text-lg">Nova ponuda - {offerNumber}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 md:space-y-6 p-4 md:p-6 pt-0 md:pt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="client_naziv">Naziv klijenta *</Label>
                <Input
                  id="client_naziv"
                  value={clientNaziv}
                  onChange={(e) => setClientNaziv(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="client_oib">OIB klijenta</Label>
                <Input
                  id="client_oib"
                  value={clientOib}
                  onChange={(e) => setClientOib(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="client_adresa">Adresa klijenta</Label>
                <Input
                  id="client_adresa"
                  value={clientAdresa}
                  onChange={(e) => setClientAdresa(e.target.value)}
                />
              </div>
            </div>

            <OfferItemsEditor
              items={items}
              onUpdateItem={updateItem}
              onAddItem={addItem}
              onRemoveItem={removeItem}
              total={total}
            />

            <div className="space-y-2">
              <Label htmlFor="napomena">Napomena</Label>
              <Textarea
                id="napomena"
                value={napomena}
                onChange={(e) => setNapomena(e.target.value)}
                placeholder="Dodatne napomene..."
                rows={3}
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Spremanje...' : 'Spremi ponudu'}
            </Button>
          </CardContent>
        </Card>
      </form>
    </AppLayout>
  );
};

export default NewOffer;
