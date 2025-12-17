import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Download, Pencil, Link2, Check } from 'lucide-react';
import AppLayout from '@/components/AppLayout';
import { format } from 'date-fns';
import { generatePDF } from '@/lib/pdfGenerator';
import { toast } from 'sonner';

interface Offer {
  id: string;
  offer_number: string;
  client_naziv: string;
  client_oib: string;
  client_adresa: string;
  napomena: string;
  ukupno: number;
  created_at: string;
  share_token: string;
  status: string | null;
}

interface OfferItem {
  id: string;
  opis: string;
  jedinica: string;
  kolicina: number;
  cijena: number;
  ukupno: number;
  is_optional: boolean;
  group_id: string | null;
}

interface OfferGroup {
  id: string;
  naziv: string;
  redni_broj: number;
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
  const [offer, setOffer] = useState<Offer | null>(null);
  const [items, setItems] = useState<OfferItem[]>([]);
  const [groups, setGroups] = useState<OfferGroup[]>([]);
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [linkCopied, setLinkCopied] = useState(false);

  useEffect(() => {
    if (user && id) {
      fetchData();
    }
  }, [user, id]);

  const fetchData = async () => {
    const [offerResult, itemsResult, groupsResult, profileResult] = await Promise.all([
      supabase.from('offers').select('*').eq('id', id).single(),
      supabase.from('offer_items').select('*').eq('offer_id', id),
      supabase.from('offer_item_groups').select('*').eq('offer_id', id).order('redni_broj'),
      supabase.from('company_profiles').select('*').eq('user_id', user?.id).maybeSingle(),
    ]);

    if (offerResult.error) {
      toast.error(offerResult.error.message);
    } else {
      setOffer(offerResult.data);
    }

    setItems(itemsResult.data || []);
    setGroups(groupsResult.data || []);
    setCompanyProfile(profileResult.data);
    setLoading(false);
  };

  const handleDownloadPDF = () => {
    if (offer && companyProfile) {
      generatePDF(offer, items, companyProfile, groups);
    }
  };

  const handleCopyLink = async () => {
    if (!offer?.share_token) return;
    const url = `${window.location.origin}/p/${offer.share_token}`;
    await navigator.clipboard.writeText(url);
    setLinkCopied(true);
    toast.success('Link kopiran u međuspremnik');
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const getStatusBadge = () => {
    if (!offer?.status || offer.status === 'pending') return null;
    if (offer.status === 'accepted') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-700 dark:text-green-400">
          <Check className="h-3 w-3" />
          Prihvaćeno
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-700 dark:text-red-400">
        Odbijeno
      </span>
    );
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString('hr-HR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const renderGroupedItems = () => {
    if (groups.length === 0) {
      // No groups - render flat items
      return items.map((item, index) => (
        <TableRow key={item.id} className={`border-b border-border ${item.is_optional ? 'bg-muted/30' : ''}`}>
          <TableCell className="text-center text-foreground">{index + 1}.</TableCell>
          <TableCell className="text-foreground">
            {item.opis}
            {item.is_optional && (
              <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                opcijski
              </span>
            )}
          </TableCell>
          <TableCell className="text-center text-foreground">{item.jedinica || 'kom'}</TableCell>
          <TableCell className="text-center text-foreground">{Number(item.kolicina)}</TableCell>
          <TableCell className="text-right text-foreground">{formatNumber(Number(item.cijena))}</TableCell>
          <TableCell className="text-right font-medium text-foreground">{formatNumber(Number(item.ukupno))}</TableCell>
        </TableRow>
      ));
    }

    // Grouped items
    let itemCounter = 1;
    return groups.map((group) => {
      const groupItems = items.filter(item => item.group_id === group.id);
      return (
        <>
          <TableRow key={`group-${group.id}`} className="bg-muted/50">
            <TableCell colSpan={6} className="font-bold text-foreground py-3">
              {group.redni_broj}. {group.naziv}
            </TableCell>
          </TableRow>
          {groupItems.map((item) => {
            const currentIndex = itemCounter++;
            return (
              <TableRow key={item.id} className={`border-b border-border ${item.is_optional ? 'bg-muted/30' : ''}`}>
                <TableCell className="text-center text-foreground pl-6">{currentIndex}.</TableCell>
                <TableCell className="text-foreground">
                  {item.opis}
                  {item.is_optional && (
                    <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                      opcijski
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-center text-foreground">{item.jedinica || 'kom'}</TableCell>
                <TableCell className="text-center text-foreground">{Number(item.kolicina)}</TableCell>
                <TableCell className="text-right text-foreground">{formatNumber(Number(item.cijena))}</TableCell>
                <TableCell className="text-right font-medium text-foreground">{formatNumber(Number(item.ukupno))}</TableCell>
              </TableRow>
            );
          })}
        </>
      );
    });
  };

  const renderMobileItems = () => {
    if (groups.length === 0) {
      return items.map((item, index) => (
        <div key={item.id} className={`grid grid-cols-5 gap-1 py-2 border-b border-border text-sm px-2 ${item.is_optional ? 'bg-muted/30 rounded' : ''}`}>
          <span className="text-center text-muted-foreground">{index + 1}.</span>
          <span className="col-span-2">
            {item.opis}
            {item.is_optional && <span className="text-xs text-muted-foreground block">(opcijski)</span>}
            <span className="text-muted-foreground block text-xs">Kol: {Number(item.kolicina)} {item.jedinica || 'kom'}</span>
          </span>
          <span className="text-right">{formatNumber(Number(item.cijena))}</span>
          <span className="text-right font-medium">{formatNumber(Number(item.ukupno))}</span>
        </div>
      ));
    }

    let itemCounter = 1;
    return groups.map((group) => {
      const groupItems = items.filter(item => item.group_id === group.id);
      return (
        <div key={group.id}>
          <div className="bg-muted/50 font-bold py-2 px-2 text-sm">
            {group.redni_broj}. {group.naziv}
          </div>
          {groupItems.map((item) => {
            const currentIndex = itemCounter++;
            return (
              <div key={item.id} className={`grid grid-cols-5 gap-1 py-2 border-b border-border text-sm px-2 ${item.is_optional ? 'bg-muted/30 rounded' : ''}`}>
                <span className="text-center text-muted-foreground">{currentIndex}.</span>
                <span className="col-span-2">
                  {item.opis}
                  {item.is_optional && <span className="text-xs text-muted-foreground block">(opcijski)</span>}
                  <span className="text-muted-foreground block text-xs">Kol: {Number(item.kolicina)} {item.jedinica || 'kom'}</span>
                </span>
                <span className="text-right">{formatNumber(Number(item.cijena))}</span>
                <span className="text-right font-medium">{formatNumber(Number(item.ukupno))}</span>
              </div>
            );
          })}
        </div>
      );
    });
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
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 print:hidden">
          <Link to="/ponude">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Natrag
            </Button>
          </Link>
          <div className="flex gap-2 w-full sm:w-auto flex-wrap">
            {getStatusBadge()}
            <Button variant="outline" size="sm" onClick={handleCopyLink} className="flex-1 sm:flex-none">
              {linkCopied ? <Check className="h-4 w-4 mr-1 sm:mr-2" /> : <Link2 className="h-4 w-4 mr-1 sm:mr-2" />}
              {linkCopied ? 'Kopirano' : 'Link'}
            </Button>
            {offer.status !== 'accepted' && (
              <Link to={`/ponuda/${id}/uredi`} className="flex-1 sm:flex-none">
                <Button variant="outline" size="sm" className="w-full">
                  <Pencil className="h-4 w-4 mr-1 sm:mr-2" />
                  Uredi
                </Button>
              </Link>
            )}
            <Button onClick={handleDownloadPDF} size="sm" className="flex-1 sm:flex-none">
              <Download className="h-4 w-4 mr-1 sm:mr-2" />
              PDF
            </Button>
          </div>
        </div>

        {/* Offer document */}
        <div className="bg-card border border-border rounded-lg p-6 md:p-8 space-y-6">
          {/* Header: Logo + Company info */}
          <div className="flex flex-col sm:flex-row justify-between gap-4 pb-4 border-b border-border">
            <div className="flex-shrink-0">
              {companyProfile?.logo_url ? (
                <img
                  src={companyProfile.logo_url}
                  alt="Logo"
                  className="h-20 md:h-24 w-auto object-contain"
                />
              ) : (
                <div className="h-20 md:h-24 w-40 bg-muted rounded flex items-center justify-center text-muted-foreground text-sm">
                  Logo
                </div>
              )}
            </div>
            {companyProfile && (
              <div className="text-right text-sm space-y-0.5">
                <p className="font-bold text-foreground">{companyProfile.naziv_firme}</p>
                <p className="text-muted-foreground">{companyProfile.adresa}</p>
                <p className="text-muted-foreground">OIB: {companyProfile.oib}</p>
                {companyProfile.telefon && (
                  <p className="text-muted-foreground">Tel: {companyProfile.telefon}</p>
                )}
                {companyProfile.email && (
                  <p className="text-muted-foreground">{companyProfile.email}</p>
                )}
              </div>
            )}
          </div>

          {/* Client info + Date info */}
          <div className="flex flex-col md:flex-row justify-between gap-4 py-4 border-b border-border">
            <div className="space-y-1 text-sm">
              <p className="text-muted-foreground">Kupac:</p>
              <p className="font-bold text-foreground">{offer.client_naziv}</p>
              {offer.client_adresa && (
                <p className="text-muted-foreground">{offer.client_adresa}</p>
              )}
              {offer.client_oib && (
                <p className="text-muted-foreground">OIB: {offer.client_oib}</p>
              )}
            </div>
            <div className="text-sm text-right space-y-0.5">
              <p className="text-muted-foreground">
                Datum ponude: {format(new Date(offer.created_at), 'dd.MM.yyyy.')}
              </p>
            </div>
          </div>

          {/* PREDMET section */}
          <div className="space-y-2 text-sm">
            <div className="flex gap-2">
              <span className="font-bold w-20">PREDMET:</span>
              <span className="font-bold">PONUDA {offer.offer_number}</span>
            </div>
            <div className="flex gap-2">
              <span className="font-bold w-20">KLIJENT:</span>
              <span>{offer.client_naziv}</span>
            </div>
          </div>

          {/* Note - above items */}
          {offer.napomena && (
            <div className="bg-muted/50 border border-border rounded-lg p-4">
              <p className="text-sm font-medium text-foreground mb-2">Napomena</p>
              <p className="text-sm text-foreground whitespace-pre-wrap">{offer.napomena}</p>
            </div>
          )}

          {/* Items table - Desktop */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow className="border-t-2 border-b-2 border-foreground/20 bg-muted/50">
                  <TableHead className="font-bold text-foreground w-12 text-center">Br.</TableHead>
                  <TableHead className="font-bold text-foreground">Naziv</TableHead>
                  <TableHead className="text-center font-bold text-foreground w-16">Jed</TableHead>
                  <TableHead className="text-center font-bold text-foreground w-16">Kol</TableHead>
                  <TableHead className="text-right font-bold text-foreground w-24">Jed cijena</TableHead>
                  <TableHead className="text-right font-bold text-foreground w-24">Ukupno</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {renderGroupedItems()}
              </TableBody>
            </Table>
          </div>

          {/* Items - Mobile */}
          <div className="md:hidden space-y-1">
            <div className="grid grid-cols-5 gap-1 py-2 border-t-2 border-b-2 border-foreground/20 text-xs font-bold bg-muted/50 px-2">
              <span className="text-center">Br.</span>
              <span className="col-span-2">Naziv</span>
              <span className="text-right">Cijena</span>
              <span className="text-right">Ukupno</span>
            </div>
            {renderMobileItems()}
          </div>

          {/* Total */}
          <div className="pt-4 border-t-2 border-foreground/20">
            <div className="flex flex-col items-end space-y-2 text-sm">
              <div className="flex justify-between w-56 py-2 border-t-2 border-b-2 border-foreground/20">
                <span className="font-bold text-foreground">SVEUKUPNO:</span>
                <span className="font-bold text-foreground">{formatNumber(Number(offer.ukupno))} €</span>
              </div>
            </div>
          </div>

          {/* Footer with bank info and signature */}
          <div className="pt-4 border-t border-border flex flex-col md:flex-row justify-between gap-6 text-sm">
            <div className="text-muted-foreground space-y-1">
              {companyProfile?.iban && (
                <>
                  <p><span className="font-medium">Način plaćanja:</span> transakcijski račun</p>
                  <p>IBAN: {companyProfile.iban}</p>
                  <p>Poziv na broj: {offer.offer_number}</p>
                </>
              )}
            </div>
            <div className="text-right space-y-2">
              <p className="text-muted-foreground">
                Datum: {format(new Date(offer.created_at), 'dd.MM.yyyy.')}
              </p>
              <div className="mt-8 pt-2 border-t border-foreground/30 w-48 ml-auto">
                <p className="text-xs text-muted-foreground">Za {companyProfile?.naziv_firme}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default OfferDetail;
