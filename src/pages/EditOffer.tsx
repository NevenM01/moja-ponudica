import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, ArrowLeft } from 'lucide-react';
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
  isNew?: boolean;
}

interface CompanyProfile {
  naziv_firme: string;
  oib: string;
  adresa: string;
  iban: string;
  email: string;
  telefon: string;
}

const EditOffer = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(null);

  const [offerNumber, setOfferNumber] = useState('');
  const [clientNaziv, setClientNaziv] = useState('');
  const [clientOib, setClientOib] = useState('');
  const [clientAdresa, setClientAdresa] = useState('');
  const [napomena, setNapomena] = useState('');
  const [items, setItems] = useState<OfferItem[]>([]);
  const [deletedItemIds, setDeletedItemIds] = useState<string[]>([]);

  useEffect(() => {
    if (user && id) {
      fetchData();
    }
  }, [user, id]);

  const fetchData = async () => {
    const [offerResult, itemsResult, profileResult] = await Promise.all([
      supabase.from('offers').select('*').eq('id', id).single(),
      supabase.from('offer_items').select('*').eq('offer_id', id),
      supabase.from('company_profiles').select('naziv_firme, oib, adresa, iban, email, telefon').eq('user_id', user?.id).maybeSingle(),
    ]);

    if (offerResult.error) {
      toast({ title: 'Greška', description: offerResult.error.message, variant: 'destructive' });
      navigate('/');
      return;
    }

    const offer = offerResult.data;

    // Block editing if offer is accepted
    if (offer.status === 'accepted') {
      toast({ title: 'Nije moguće uređivati', description: 'Prihvaćene ponude se ne mogu uređivati.', variant: 'destructive' });
      navigate(`/ponuda/${id}`);
      return;
    }

    setOfferNumber(offer.offer_number);
    setClientNaziv(offer.client_naziv);
    setClientOib(offer.client_oib || '');
    setClientAdresa(offer.client_adresa || '');
    setNapomena(offer.napomena || '');

    const existingItems = (itemsResult.data || []).map((item) => ({
      id: item.id,
      opis: item.opis,
      kolicina: Number(item.kolicina),
      cijena: Number(item.cijena),
      ukupno: Number(item.ukupno),
    }));

    setItems(existingItems.length > 0 ? existingItems : [{ id: crypto.randomUUID(), opis: '', kolicina: 1, cijena: 0, ukupno: 0, isNew: true }]);
    setCompanyProfile(profileResult.data);
    setFetching(false);
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
    setItems([...items, { id: crypto.randomUUID(), opis: '', kolicina: 1, cijena: 0, ukupno: 0, isNew: true }]);
  };

  const removeItem = (itemId: string) => {
    const item = items.find((i) => i.id === itemId);
    if (item && !item.isNew) {
      setDeletedItemIds([...deletedItemIds, itemId]);
    }
    if (items.length > 1) {
      setItems(items.filter((i) => i.id !== itemId));
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
      // Update offer
      const { error: offerError } = await supabase
        .from('offers')
        .update({
          client_naziv: clientNaziv,
          client_oib: clientOib,
          client_adresa: clientAdresa,
          napomena,
          ukupno: total,
        })
        .eq('id', id);

      if (offerError) throw offerError;

      // Delete removed items
      if (deletedItemIds.length > 0) {
        const { error: deleteError } = await supabase
          .from('offer_items')
          .delete()
          .in('id', deletedItemIds);
        if (deleteError) throw deleteError;
      }

      // Update existing items and insert new ones
      const existingItems = items.filter((item) => !item.isNew);
      const newItems = items.filter((item) => item.isNew);

      for (const item of existingItems) {
        const { error } = await supabase
          .from('offer_items')
          .update({
            opis: item.opis,
            kolicina: item.kolicina,
            cijena: item.cijena,
            ukupno: item.ukupno,
          })
          .eq('id', item.id);
        if (error) throw error;
      }

      if (newItems.length > 0) {
        const itemsToInsert = newItems.map((item) => ({
          offer_id: id,
          opis: item.opis,
          kolicina: item.kolicina,
          cijena: item.cijena,
          ukupno: item.ukupno,
        }));

        const { error: insertError } = await supabase.from('offer_items').insert(itemsToInsert);
        if (insertError) throw insertError;
      }

      toast({ title: 'Ponuda ažurirana!' });
      navigate(`/ponuda/${id}`);
    } catch (error: any) {
      toast({ title: 'Greška', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <AppLayout>
        <p className="text-muted-foreground">Učitavanje...</p>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-4">
          <Link to={`/ponuda/${id}`}>
            <Button type="button" variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Natrag
            </Button>
          </Link>
        </div>

        <CompanyInfoBox profile={companyProfile} />

        <Card>
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="text-base md:text-lg">Uredi ponudu - {offerNumber}</CardTitle>
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
              {loading ? 'Spremanje...' : 'Spremi izmjene'}
            </Button>
          </CardContent>
        </Card>
      </form>
    </AppLayout>
  );
};

export default EditOffer;