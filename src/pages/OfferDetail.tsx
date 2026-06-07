import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useTenantFeatures } from '@/hooks/useTenantFeatures';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Download, Pencil, Link2, Check, FileText, Building2, User, Calendar, CheckCircle, XCircle, Clock, Globe } from 'lucide-react';
import AppLayout from '@/components/AppLayout';
import { generatePDF } from '@/lib/pdfGenerator';
import { getDisplayDomain, getFacebookDisplayLine, getInstagramDisplayLine } from '@/lib/companyProfileDisplay';
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
  opis?: string;
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
  web_link?: string | null;
  instagram_link?: string | null;
  social_display_label?: string | null;
}

const OfferDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { isFeatureEnabled } = useTenantFeatures();
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
    const [offerResult, itemsResult, groupsResult] = await Promise.all([
      supabase.from('offers').select('*').eq('id', id).single(),
      supabase.from('offer_items').select('*').eq('offer_id', id),
      supabase.from('offer_item_groups').select('*').eq('offer_id', id).order('redni_broj'),
    ]);

    if (offerResult.error) {
      toast.error(offerResult.error.message);
      setItems(itemsResult.data || []);
      setGroups(groupsResult.data || []);
      setLoading(false);
      return;
    }

    setOffer(offerResult.data);
    setItems(itemsResult.data || []);
    setGroups(groupsResult.data || []);

    const { data: profileData } = await supabase
      .from('company_profiles')
      .select('*')
      .eq('user_id', offerResult.data.user_id)
      .maybeSingle();

    setCompanyProfile(profileData);
    setLoading(false);
  };

  const handleDownloadPDF = () => {
    if (offer && companyProfile) {
      generatePDF(offer, items, companyProfile, groups);
    }
  };

  const handleCopyLink = async () => {
    if (!offer?.share_token) return;
    const url = `${window.location.origin}${window.location.pathname.replace(/\/$/, '')}#/p/${offer.share_token}`;
    await navigator.clipboard.writeText(url);
    setLinkCopied(true);
    toast.success('Link kopiran u međuspremnik');
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const handleStatusChange = async (newStatus: 'accepted' | 'rejected' | 'pending') => {
    if (!offer) return;
    
    const updateData: { status: string; accepted_at?: string | null; rejected_at?: string | null } = {
      status: newStatus,
    };
    
    if (newStatus === 'accepted') {
      updateData.accepted_at = new Date().toISOString();
      updateData.rejected_at = null;
    } else if (newStatus === 'rejected') {
      updateData.rejected_at = new Date().toISOString();
      updateData.accepted_at = null;
    } else {
      updateData.accepted_at = null;
      updateData.rejected_at = null;
    }

    const { error } = await supabase
      .from('offers')
      .update(updateData)
      .eq('id', offer.id);

    if (error) {
      toast.error('Greška pri promjeni statusa');
    } else {
      setOffer({ ...offer, status: newStatus });
      toast.success(`Status promijenjen u: ${newStatus === 'accepted' ? 'Prihvaćeno' : newStatus === 'rejected' ? 'Odbijeno' : 'Na čekanju'}`);
    }
  };

  const getStatusBadge = () => {
    if (!offer?.status || offer.status === 'pending') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-700 dark:text-amber-400">
          <Clock className="h-3 w-3" />
          Na čekanju
        </span>
      );
    }
    if (offer.status === 'accepted') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-700 dark:text-green-400">
          <CheckCircle className="h-3 w-3" />
          Prihvaćeno
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-700 dark:text-red-400">
        <XCircle className="h-3 w-3" />
        Odbijeno
      </span>
    );
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString('hr-HR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('hr-HR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const renderGroupedItems = () => {
    if (groups.length === 0) {
      return items.map((item, index) => (
        <tr key={item.id} className={`${index % 2 === 0 ? 'bg-background' : 'bg-muted/20'} ${item.is_optional ? 'opacity-70' : ''}`}>
          <td className="p-3 text-center text-muted-foreground">{index + 1}.</td>
          <td className="p-3">
            {item.opis}
            {item.is_optional && (
              <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                opcijski
              </span>
            )}
          </td>
          <td className="p-3 text-center">{item.jedinica || 'kom'}</td>
          <td className="p-3 text-center">{Number(item.kolicina)}</td>
          <td className="p-3 text-right">{formatNumber(Number(item.cijena))} €</td>
          <td className="p-3 text-right font-medium">{formatNumber(Number(item.ukupno))} €</td>
        </tr>
      ));
    }

    return groups.map((group) => {
      const groupItems = items.filter(item => item.group_id === group.id);
      return (
        <>
          <tr key={`group-${group.id}`} className="bg-muted/50">
            <td colSpan={6} className="p-3">
              <div className="font-bold">{group.redni_broj}. {group.naziv}</div>
              {group.opis && <div className="text-sm text-muted-foreground mt-1">{group.opis}</div>}
            </td>
          </tr>
          {groupItems.map((item, itemIndex) => (
            <tr key={item.id} className={`${itemIndex % 2 === 0 ? 'bg-background' : 'bg-muted/20'} ${item.is_optional ? 'opacity-70' : ''}`}>
              <td className="p-3 text-center text-muted-foreground">{group.redni_broj}.{itemIndex + 1}.</td>
              <td className="p-3">
                {item.opis}
                {item.is_optional && (
                  <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                    opcijski
                  </span>
                )}
              </td>
              <td className="p-3 text-center">{item.jedinica || 'kom'}</td>
              <td className="p-3 text-center">{Number(item.kolicina)}</td>
              <td className="p-3 text-right">{formatNumber(Number(item.cijena))} €</td>
              <td className="p-3 text-right font-medium">{formatNumber(Number(item.ukupno))} €</td>
            </tr>
          ))}
        </>
      );
    });
  };

  const renderMobileItems = () => {
    if (groups.length === 0) {
      return items.map((item, index) => (
        <div key={item.id} className={`border rounded-lg p-4 ${item.is_optional ? 'opacity-70' : ''}`}>
          <div className="flex items-start justify-between gap-2 mb-2">
            <p className="font-medium">{item.opis}</p>
            {item.is_optional && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground shrink-0">
                opcijski
              </span>
            )}
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{item.kolicina} {item.jedinica || 'kom'} × {formatNumber(item.cijena)} €</span>
            <span className="font-medium text-foreground">{formatNumber(item.ukupno)} €</span>
          </div>
        </div>
      ));
    }

    return groups.map((group) => {
      const groupItems = items.filter(item => item.group_id === group.id);
      return (
        <div key={group.id}>
          <div className="bg-muted/50 rounded-lg p-3 mb-2">
            <div className="font-bold">{group.redni_broj}. {group.naziv}</div>
            {group.opis && <div className="text-sm text-muted-foreground mt-1">{group.opis}</div>}
          </div>
          {groupItems.map((item, itemIndex) => (
            <div key={item.id} className={`border rounded-lg p-4 mb-2 ${item.is_optional ? 'opacity-70' : ''}`}>
              <div className="flex items-start justify-between gap-2 mb-2">
                <p className="font-medium">{group.redni_broj}.{itemIndex + 1}. {item.opis}</p>
                {item.is_optional && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground shrink-0">
                    opcijski
                  </span>
                )}
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{item.kolicina} {item.jedinica || 'kom'} × {formatNumber(item.cijena)} €</span>
                <span className="font-medium text-foreground">{formatNumber(item.ukupno)} €</span>
              </div>
            </div>
          ))}
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
      <div className="max-w-5xl mx-auto space-y-4">
        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 print:hidden">
          <Link to="/ponude">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Natrag
            </Button>
          </Link>
          <div className="flex gap-2 w-full sm:w-auto flex-wrap items-center">
            {getStatusBadge()}
            
            {/* Status change buttons */}
            <div className="flex gap-1 border rounded-lg p-1 bg-muted/30">
              <Button 
                variant={offer.status === 'accepted' ? 'default' : 'ghost'} 
                size="sm" 
                className={`h-7 px-2 ${offer.status === 'accepted' ? 'bg-green-600 hover:bg-green-700' : ''}`}
                onClick={() => handleStatusChange('accepted')}
              >
                <CheckCircle className="h-3.5 w-3.5 mr-1" />
                Prihvati
              </Button>
              <Button 
                variant={offer.status === 'rejected' ? 'default' : 'ghost'} 
                size="sm" 
                className={`h-7 px-2 ${offer.status === 'rejected' ? 'bg-red-600 hover:bg-red-700' : ''}`}
                onClick={() => handleStatusChange('rejected')}
              >
                <XCircle className="h-3.5 w-3.5 mr-1" />
                Odbij
              </Button>
              <Button 
                variant={(!offer.status || offer.status === 'pending') ? 'default' : 'ghost'} 
                size="sm" 
                className={`h-7 px-2 ${(!offer.status || offer.status === 'pending') ? 'bg-amber-600 hover:bg-amber-700' : ''}`}
                onClick={() => handleStatusChange('pending')}
              >
                <Clock className="h-3.5 w-3.5 mr-1" />
                Čekaj
              </Button>
            </div>

            {isFeatureEnabled('offer_preview_link') && (
              <Button variant="outline" size="sm" onClick={handleCopyLink} className="flex-1 sm:flex-none">
                {linkCopied ? <Check className="h-4 w-4 mr-1 sm:mr-2" /> : <Link2 className="h-4 w-4 mr-1 sm:mr-2" />}
                {linkCopied ? 'Kopirano' : 'Link'}
              </Button>
            )}
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

        {/* Document Card */}
        <Card className="overflow-hidden shadow-lg">
          {/* Header */}
          <div className="bg-primary/5 p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              {/* Company Info */}
              <div className="flex items-start gap-4">
                {companyProfile?.logo_url ? (
                  <img 
                    src={companyProfile.logo_url} 
                    alt={companyProfile.naziv_firme}
                    className="h-20 w-auto object-contain rounded-lg bg-background p-1"
                  />
                ) : (
                  <div className="h-20 w-20 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Building2 className="h-10 w-10 text-primary" />
                  </div>
                )}
                <div>
                  <h2 className="font-semibold text-lg">{companyProfile?.naziv_firme || 'Nepoznata tvrtka'}</h2>
                  {companyProfile?.adresa && <p className="text-sm text-muted-foreground">{companyProfile.adresa}</p>}
                  {companyProfile?.oib && <p className="text-sm text-muted-foreground">OIB: {companyProfile.oib}</p>}
                  <div className="flex flex-wrap gap-3 mt-1">
                    {companyProfile?.web_link && (
                      <a href={companyProfile.web_link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
                        <Globe className="h-3.5 w-3.5" />
                        {getDisplayDomain(companyProfile.web_link)}
                      </a>
                    )}
                    {getInstagramDisplayLine(companyProfile?.instagram_link) && (
                      <span className="text-sm text-muted-foreground">
                        {getInstagramDisplayLine(companyProfile?.instagram_link)}
                      </span>
                    )}
                    {getFacebookDisplayLine(companyProfile) && (
                      <span className="text-sm text-muted-foreground">
                        {getFacebookDisplayLine(companyProfile)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Offer Number & Date */}
              <div className="text-left sm:text-right">
                <div className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg">
                  <FileText className="h-4 w-4" />
                  <span className="font-semibold">Ponuda {offer.offer_number}</span>
                </div>
                <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground sm:justify-end">
                  <Calendar className="h-4 w-4" />
                  {formatDate(offer.created_at)}
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            {/* Client Info */}
            <div className="mb-8">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <User className="h-4 w-4" />
                Klijent
              </div>
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="font-medium">{offer.client_naziv}</p>
                {offer.client_oib && <p className="text-sm text-muted-foreground">OIB: {offer.client_oib}</p>}
                {offer.client_adresa && <p className="text-sm text-muted-foreground">{offer.client_adresa}</p>}
              </div>
            </div>

            {/* PREDMET section */}
            <div className="mb-6 space-y-1 text-sm">
              <div className="flex gap-2">
                <span className="font-bold w-20">PREDMET:</span>
                <span className="font-bold">PONUDA {offer.offer_number}</span>
              </div>
              <div className="flex gap-2">
                <span className="font-bold w-20">KLIJENT:</span>
                <span>{offer.client_naziv}</span>
              </div>
            </div>

            {/* Notes - above items */}
            {offer.napomena && (
              <div className="mb-6 bg-muted/30 rounded-lg p-4">
                <p className="text-sm font-medium mb-1">Napomena</p>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{offer.napomena}</p>
              </div>
            )}

            {/* Items Table - Desktop */}
            <div className="mb-8">
              <h3 className="font-medium mb-4">Stavke ponude</h3>
              
              <div className="hidden sm:block border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-center p-3 text-sm font-medium w-12">Br.</th>
                      <th className="text-left p-3 text-sm font-medium">Naziv</th>
                      <th className="text-center p-3 text-sm font-medium w-16">Jed</th>
                      <th className="text-center p-3 text-sm font-medium w-16">Kol</th>
                      <th className="text-right p-3 text-sm font-medium w-24">Jed cijena</th>
                      <th className="text-right p-3 text-sm font-medium w-24">Ukupno</th>
                    </tr>
                  </thead>
                  <tbody>
                    {renderGroupedItems()}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="sm:hidden space-y-3">
                {renderMobileItems()}
              </div>
            </div>

            {/* Total */}
            <div className="flex justify-end mb-8">
              <div className="bg-primary/10 rounded-lg px-6 py-4 text-right">
                <span className="text-sm text-muted-foreground">Ukupno za platiti</span>
                <p className="text-2xl font-bold text-primary">{formatNumber(Number(offer.ukupno))} €</p>
              </div>
            </div>

            {/* Footer with bank info */}
            {companyProfile?.iban && (
              <div className="pt-4 border-t border-border text-sm text-muted-foreground space-y-1">
                <p><span className="font-medium">Način plaćanja:</span> transakcijski račun</p>
                <p>IBAN: {companyProfile.iban}</p>
                <p>Poziv na broj: {offer.offer_number}</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </AppLayout>
  );
};

export default OfferDetail;