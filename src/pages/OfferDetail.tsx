import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Download, Pencil } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AppLayout from '@/components/AppLayout';
import { format } from 'date-fns';
import { generatePDF } from '@/lib/pdfGenerator';

interface Offer {
  id: string;
  offer_number: string;
  client_naziv: string;
  client_oib: string;
  client_adresa: string;
  napomena: string;
  ukupno: number;
  created_at: string;
}

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
  logo_url: string;
}

const OfferDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const [offer, setOffer] = useState<Offer | null>(null);
  const [items, setItems] = useState<OfferItem[]>([]);
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && id) {
      fetchData();
    }
  }, [user, id]);

  const fetchData = async () => {
    const [offerResult, itemsResult, profileResult] = await Promise.all([
      supabase.from('offers').select('*').eq('id', id).single(),
      supabase.from('offer_items').select('*').eq('offer_id', id),
      supabase.from('company_profiles').select('*').eq('user_id', user?.id).maybeSingle(),
    ]);

    if (offerResult.error) {
      toast({ title: 'Greška', description: offerResult.error.message, variant: 'destructive' });
    } else {
      setOffer(offerResult.data);
    }

    setItems(itemsResult.data || []);
    setCompanyProfile(profileResult.data);
    setLoading(false);
  };

  const handleDownloadPDF = () => {
    if (offer && companyProfile) {
      generatePDF(offer, items, companyProfile);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <p className="text-muted-foreground">Učitavanje...</p>
      </AppLayout>
    );
  }

  if (!offer) {
    return (
      <AppLayout>
        <p className="text-muted-foreground">Ponuda nije pronađena.</p>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Link to="/">
            <Button variant="ghost">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Natrag
            </Button>
          </Link>
          <div className="flex gap-2">
            <Link to={`/ponuda/${id}/uredi`}>
              <Button variant="outline">
                <Pencil className="h-4 w-4 mr-2" />
                Uredi
              </Button>
            </Link>
            <Button onClick={handleDownloadPDF}>
              <Download className="h-4 w-4 mr-2" />
              Preuzmi PDF
            </Button>
          </div>
        </div>

        {companyProfile && (
          <div className="bg-muted rounded-lg p-4 border border-border">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Tvrtka:</span>
                <p className="font-medium">{companyProfile.naziv_firme}</p>
              </div>
              <div>
                <span className="text-muted-foreground">OIB:</span>
                <p className="font-medium">{companyProfile.oib}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Adresa:</span>
                <p className="font-medium">{companyProfile.adresa}</p>
              </div>
              <div>
                <span className="text-muted-foreground">IBAN:</span>
                <p className="font-medium">{companyProfile.iban || '-'}</p>
              </div>
            </div>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Ponuda {offer.offer_number}</span>
              <span className="text-sm font-normal text-muted-foreground">
                {format(new Date(offer.created_at), 'dd.MM.yyyy.')}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
              <div>
                <span className="text-muted-foreground text-sm">Klijent:</span>
                <p className="font-medium">{offer.client_naziv}</p>
              </div>
              {offer.client_oib && (
                <div>
                  <span className="text-muted-foreground text-sm">OIB:</span>
                  <p className="font-medium">{offer.client_oib}</p>
                </div>
              )}
              {offer.client_adresa && (
                <div>
                  <span className="text-muted-foreground text-sm">Adresa:</span>
                  <p className="font-medium">{offer.client_adresa}</p>
                </div>
              )}
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Opis</TableHead>
                  <TableHead className="text-right">Količina</TableHead>
                  <TableHead className="text-right">Cijena (€)</TableHead>
                  <TableHead className="text-right">Ukupno (€)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.opis}</TableCell>
                    <TableCell className="text-right">{Number(item.kolicina).toFixed(2)}</TableCell>
                    <TableCell className="text-right">{Number(item.cijena).toFixed(2)}</TableCell>
                    <TableCell className="text-right font-medium">{Number(item.ukupno).toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="flex justify-end">
              <div className="text-xl font-bold">Ukupno: {Number(offer.ukupno).toFixed(2)} €</div>
            </div>

            {offer.napomena && (
              <div className="border-t border-border pt-4">
                <span className="text-muted-foreground text-sm">Napomena:</span>
                <p className="mt-1">{offer.napomena}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default OfferDetail;
