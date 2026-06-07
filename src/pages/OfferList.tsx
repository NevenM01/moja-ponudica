import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Eye, Trash2, CheckCircle, XCircle, Clock, Search, FileEdit } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import AppLayout from '@/components/AppLayout';
import { format } from 'date-fns';

interface DraftOffer {
  id: string;
  offer_number: string;
  client_naziv: string;
  ukupno: number;
  updated_at: string;
}

function formatDraftSavedAt(iso: string): string {
  try {
    return format(new Date(iso), 'dd.MM.yyyy. HH:mm');
  } catch {
    return iso;
  }
}

interface Offer {
  id: string;
  offer_number: string;
  client_naziv: string;
  ukupno: number;
  created_at: string;
  status: string | null;
  accepted_at: string | null;
  rejected_at: string | null;
}

const getStatusBadge = (status: string | null, accepted_at: string | null, rejected_at: string | null) => {
  const formatStatusDate = (date: string | null) => {
    if (!date) return null;
    return format(new Date(date), 'dd.MM.yyyy.');
  };

  switch (status) {
    case 'accepted':
      return (
        <div className="flex items-center gap-2">
          <Badge className="bg-green-500/20 text-green-500 border-green-500/30"><CheckCircle className="h-3 w-3 mr-1" />Prihvaćeno</Badge>
          {accepted_at && <span className="text-xs text-muted-foreground">{formatStatusDate(accepted_at)}</span>}
        </div>
      );
    case 'rejected':
      return (
        <div className="flex items-center gap-2">
          <Badge className="bg-red-500/20 text-red-500 border-red-500/30"><XCircle className="h-3 w-3 mr-1" />Odbijeno</Badge>
          {rejected_at && <span className="text-xs text-muted-foreground">{formatStatusDate(rejected_at)}</span>}
        </div>
      );
    default:
      return <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30"><Clock className="h-3 w-3 mr-1" />Na čekanju</Badge>;
  }
};

const OfferList = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [drafts, setDrafts] = useState<DraftOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOffers = offers.filter((offer) => {
    const query = searchQuery.toLowerCase();
    return (
      offer.client_naziv.toLowerCase().includes(query) ||
      offer.offer_number.toLowerCase().includes(query)
    );
  });

  useEffect(() => {
    if (user) {
      fetchOffers();
      fetchDrafts();
    }
  }, [user]);

  const fetchOffers = async () => {
    const { data, error } = await supabase
      .from('offers')
      .select('*')
      .neq('status', 'draft')
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: 'Greška', description: error.message, variant: 'destructive' });
    } else {
      setOffers(data || []);
    }
    setLoading(false);
  };

  const fetchDrafts = async () => {
    if (!user?.id) return;
    const { data, error } = await supabase
      .from('offers')
      .select('id, offer_number, client_naziv, ukupno, updated_at')
      .eq('status', 'draft')
      .order('updated_at', { ascending: false });
    if (!error) setDrafts(data ?? []);
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

  const handleDeleteDraft = async (draftId: string) => {
    const { error } = await supabase.from('offers').delete().eq('id', draftId).eq('status', 'draft');
    if (error) {
      toast({ title: 'Greška', description: error.message, variant: 'destructive' });
    } else {
      setDrafts((prev) => prev.filter((d) => d.id !== draftId));
      toast({ title: 'Draft obrisan' });
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
        <CardContent className="space-y-4">
          {drafts.length > 0 && (
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 space-y-3">
              <h3 className="text-sm font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-2">
                <FileEdit className="h-4 w-4" />
                Draft
              </h3>
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Broj ponude</TableHead>
                      <TableHead>Klijent</TableHead>
                      <TableHead>Spremljeno</TableHead>
                      <TableHead className="text-right">Ukupno (€)</TableHead>
                      <TableHead className="w-40"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {drafts.map((draft) => (
                      <TableRow key={draft.id}>
                        <TableCell className="font-medium">{draft.offer_number || '—'}</TableCell>
                        <TableCell>{draft.client_naziv || '—'}</TableCell>
                        <TableCell>{formatDraftSavedAt(draft.updated_at)}</TableCell>
                        <TableCell className="text-right">{Number(draft.ukupno).toFixed(2)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Link to="/nova-ponuda" state={{ loadDraftId: draft.id }}>
                              <Button variant="outline" size="sm">
                                Nastavi uređivanje
                              </Button>
                            </Link>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteDraft(draft.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="md:hidden space-y-3">
                {drafts.map((draft) => (
                  <div key={draft.id} className="space-y-2">
                    <div className="flex justify-between">
                      <p className="font-medium text-sm">{draft.offer_number || 'Draft'}</p>
                      <p className="font-bold text-primary">{Number(draft.ukupno).toFixed(2)} €</p>
                    </div>
                    <p className="text-muted-foreground text-sm">{draft.client_naziv || '—'}</p>
                    <p className="text-xs text-muted-foreground">{formatDraftSavedAt(draft.updated_at)}</p>
                    <div className="flex gap-2 pt-2">
                      <Link to="/nova-ponuda" state={{ loadDraftId: draft.id }} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                          Nastavi uređivanje
                        </Button>
                      </Link>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteDraft(draft.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tražilica: po broju ponude i imenu klijenta */}
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Pretraži po broju ponude ili imenu klijenta..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {loading ? (
            <p className="text-muted-foreground">Učitavanje...</p>
          ) : offers.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Nemate ponuda. Kreirajte prvu ponudu!
            </p>
          ) : filteredOffers.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Nema rezultata za "{searchQuery}"
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
                    {filteredOffers.map((offer) => (
                      <TableRow key={offer.id}>
                        <TableCell className="font-medium">{offer.offer_number}</TableCell>
                        <TableCell>{offer.client_naziv}</TableCell>
                        <TableCell>{format(new Date(offer.created_at), 'dd.MM.yyyy.')}</TableCell>
                        <TableCell>{getStatusBadge(offer.status, offer.accepted_at, offer.rejected_at)}</TableCell>
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
                {filteredOffers.map((offer) => (
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
                      {getStatusBadge(offer.status, offer.accepted_at, offer.rejected_at)}
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