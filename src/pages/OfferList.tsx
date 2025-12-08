import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Eye, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AppLayout from '@/components/AppLayout';
import { format } from 'date-fns';

interface Offer {
  id: string;
  offer_number: string;
  client_naziv: string;
  ukupno: number;
  created_at: string;
}

const OfferList = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchOffers();
    }
  }, [user]);

  const fetchOffers = async () => {
    const { data, error } = await supabase
      .from('offers')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: 'Greška', description: error.message, variant: 'destructive' });
    } else {
      setOffers(data || []);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Jeste li sigurni da želite obrisati ovu ponudu?')) return;

    const { error } = await supabase.from('offers').delete().eq('id', id);
    if (error) {
      toast({ title: 'Greška', description: error.message, variant: 'destructive' });
    } else {
      setOffers(offers.filter((o) => o.id !== id));
      toast({ title: 'Ponuda obrisana' });
    }
  };

  return (
    <AppLayout>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Lista ponuda</CardTitle>
          <Link to="/nova-ponuda">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova ponuda
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">Učitavanje...</p>
          ) : offers.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Nemate ponuda. Kreirajte prvu ponudu!
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Broj ponude</TableHead>
                  <TableHead>Klijent</TableHead>
                  <TableHead>Datum</TableHead>
                  <TableHead className="text-right">Ukupno (€)</TableHead>
                  <TableHead className="w-24"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {offers.map((offer) => (
                  <TableRow key={offer.id}>
                    <TableCell className="font-medium">{offer.offer_number}</TableCell>
                    <TableCell>{offer.client_naziv}</TableCell>
                    <TableCell>{format(new Date(offer.created_at), 'dd.MM.yyyy.')}</TableCell>
                    <TableCell className="text-right">{Number(offer.ukupno).toFixed(2)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Link to={`/ponuda/${offer.id}`}>
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(offer.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </AppLayout>
  );
};

export default OfferList;
