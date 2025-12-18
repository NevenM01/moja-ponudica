import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Eye, Trash2, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import AppLayout from '@/components/AppLayout';
import { format } from 'date-fns';

interface Offer {
  id: string;
  offer_number: string;
  client_naziv: string;
  ukupno: number;
  created_at: string;
  status: string | null;
}

const getStatusBadge = (status: string | null) => {
  switch (status) {
    case 'accepted':
      return <Badge className="bg-green-500/20 text-green-500 border-green-500/30"><CheckCircle className="h-3 w-3 mr-1" />Prihvaćeno</Badge>;
    case 'rejected':
      return <Badge className="bg-red-500/20 text-red-500 border-red-500/30"><XCircle className="h-3 w-3 mr-1" />Odbijeno</Badge>;
    default:
      return <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30"><Clock className="h-3 w-3 mr-1" />Na čekanju</Badge>;
  }
};

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
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <CardTitle className="text-lg md:text-xl">Lista ponuda</CardTitle>
          <Link to="/nova-ponuda">
            <Button size="sm" className="w-full sm:w-auto">
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
            <>
              {/* Desktop table */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Broj ponude</TableHead>
                      <TableHead>Klijent</TableHead>
                      <TableHead>Datum</TableHead>
                      <TableHead>Status</TableHead>
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
                        <TableCell>{getStatusBadge(offer.status)}</TableCell>
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
              </div>

              {/* Mobile cards */}
              <div className="md:hidden space-y-3">
                {offers.map((offer) => (
                  <div
                    key={offer.id}
                    className="border border-border rounded-lg p-4 bg-card"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium text-sm">{offer.offer_number}</p>
                        <p className="text-foreground">{offer.client_naziv}</p>
                      </div>
                      <p className="font-bold text-primary">{Number(offer.ukupno).toFixed(2)} €</p>
                    </div>
                    <div className="mt-2">
                      {getStatusBadge(offer.status)}
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(offer.created_at), 'dd.MM.yyyy.')}
                      </p>
                      <div className="flex gap-2">
                        <Link to={`/ponuda/${offer.id}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            Pogledaj
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
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </AppLayout>
  );
};

export default OfferList;