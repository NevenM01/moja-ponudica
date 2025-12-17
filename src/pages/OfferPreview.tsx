import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle, XCircle, Loader2, FileText, Building2, User, Calendar, CreditCard } from "lucide-react";
import { toast } from "sonner";

interface Offer {
  id: string;
  offer_number: string;
  client_naziv: string;
  client_oib: string | null;
  client_adresa: string | null;
  napomena: string | null;
  ukupno: number;
  created_at: string;
  status: string | null;
  accepted_at: string | null;
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
  email: string | null;
  telefon: string | null;
  iban: string | null;
  logo_url: string | null;
}

const OfferPreview = () => {
  const { token } = useParams<{ token: string }>();
  const [offer, setOffer] = useState<Offer | null>(null);
  const [items, setItems] = useState<OfferItem[]>([]);
  const [groups, setGroups] = useState<OfferGroup[]>([]);
  const [company, setCompany] = useState<CompanyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedOptionalItems, setSelectedOptionalItems] = useState<Set<string>>(new Set());

  const fetchOffer = async (action?: 'accept' | 'reject') => {
    if (!token) return;

    try {
      if (action) setActionLoading(true);
      
      const { data, error: fetchError } = await supabase.functions.invoke('get-public-offer', {
        body: { token, action }
      });

      if (fetchError) throw fetchError;
      if (data.error) throw new Error(data.error);

      setOffer(data.offer);
      setItems(data.items);
      setGroups(data.groups || []);
      setCompany(data.company);

      if (action === 'accept') {
        toast.success('Ponuda je prihvaćena!');
      } else if (action === 'reject') {
        toast.success('Ponuda je odbijena.');
      }
    } catch (err: any) {
      console.error('Error fetching offer:', err);
      setError(err.message || 'Ponuda nije pronađena');
    } finally {
      setLoading(false);
      setActionLoading(false);
    }
  };

  useEffect(() => {
    fetchOffer();
  }, [token]);

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

  const toggleOptionalItem = (itemId: string) => {
    const newSelected = new Set(selectedOptionalItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedOptionalItems(newSelected);
  };

  // Calculate total: non-optional items + selected optional items
  const calculatedTotal = items.reduce((sum, item) => {
    if (!item.is_optional) return sum + item.ukupno;
    if (selectedOptionalItems.has(item.id)) return sum + item.ukupno;
    return sum;
  }, 0);

  const hasOptionalItems = items.some(item => item.is_optional);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !offer) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <Card className="p-8 text-center max-w-md">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-xl font-semibold mb-2">Ponuda nije pronađena</h1>
          <p className="text-muted-foreground">
            Link koji ste otvorili nije valjan ili je ponuda uklonjena.
          </p>
        </Card>
      </div>
    );
  }

  const isAccepted = offer.status === 'accepted';
  const isRejected = offer.status === 'rejected';
  const isPending = !offer.status || offer.status === 'pending';

  return (
    <div className="min-h-screen bg-muted/30 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Status Banner */}
        {isAccepted && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-6 flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div>
              <p className="font-medium text-green-700 dark:text-green-400">Ponuda prihvaćena</p>
              {offer.accepted_at && (
                <p className="text-sm text-green-600/80">{formatDate(offer.accepted_at)}</p>
              )}
            </div>
          </div>
        )}
        {isRejected && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6 flex items-center gap-3">
            <XCircle className="h-5 w-5 text-red-600" />
            <p className="font-medium text-red-700 dark:text-red-400">Ponuda odbijena</p>
          </div>
        )}

        {/* Document Card */}
        <Card className="overflow-hidden shadow-lg">
          {/* Header */}
          <div className="bg-primary/5 p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              {/* Company Info */}
              <div className="flex items-start gap-4">
                {company?.logo_url ? (
                  <img 
                    src={company.logo_url} 
                    alt={company.naziv_firme}
                    className="h-20 w-auto object-contain rounded-lg bg-background p-1"
                  />
                ) : (
                  <div className="h-20 w-20 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Building2 className="h-10 w-10 text-primary" />
                  </div>
                )}
                <div>
                  <h2 className="font-semibold text-lg">{company?.naziv_firme || 'Nepoznata tvrtka'}</h2>
                  {company?.adresa && <p className="text-sm text-muted-foreground">{company.adresa}</p>}
                  {company?.oib && <p className="text-sm text-muted-foreground">OIB: {company.oib}</p>}
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

            {/* Items Table */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">Stavke ponude</h3>
                {hasOptionalItems && isPending && (
                  <span className="text-xs text-muted-foreground">Označite opcijske stavke koje želite</span>
                )}
              </div>
              
              {/* Desktop Table */}
              <div className="hidden sm:block border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      {hasOptionalItems && <th className="w-12 p-3"></th>}
                      <th className="text-center p-3 text-sm font-medium w-12">Br.</th>
                      <th className="text-left p-3 text-sm font-medium">Naziv</th>
                      <th className="text-center p-3 text-sm font-medium w-16">Jed</th>
                      <th className="text-center p-3 text-sm font-medium w-16">Kol</th>
                      <th className="text-right p-3 text-sm font-medium w-24">Jed cijena</th>
                      <th className="text-right p-3 text-sm font-medium w-24">Ukupno</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groups.length > 0 ? (
                      (() => {
                        let itemCounter = 1;
                        return groups.map((group) => {
                          const groupItems = items.filter(item => item.group_id === group.id);
                          return (
                            <React.Fragment key={`group-${group.id}`}>
                              <tr className="bg-muted/50">
                                <td colSpan={hasOptionalItems ? 7 : 6} className="p-3">
                                  <div className="font-bold">{group.redni_broj}. {group.naziv}</div>
                                  {group.opis && <div className="text-sm text-muted-foreground mt-1">{group.opis}</div>}
                                </td>
                              </tr>
                              {groupItems.map((item) => {
                                const currentIndex = itemCounter++;
                                const isSelected = !item.is_optional || selectedOptionalItems.has(item.id);
                                return (
                                  <tr 
                                    key={item.id} 
                                    className={`${currentIndex % 2 === 0 ? 'bg-background' : 'bg-muted/20'} ${item.is_optional && !isSelected ? 'opacity-50' : ''}`}
                                  >
                                    {hasOptionalItems && (
                                      <td className="p-3 text-center">
                                        {item.is_optional ? (
                                          <Checkbox
                                            checked={selectedOptionalItems.has(item.id)}
                                            onCheckedChange={() => isPending && toggleOptionalItem(item.id)}
                                            disabled={!isPending}
                                          />
                                        ) : null}
                                      </td>
                                    )}
                                    <td className="p-3 text-center text-muted-foreground">{currentIndex}.</td>
                                    <td className="p-3">
                                      {item.opis}
                                      {item.is_optional && (
                                        <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                                          opcijski
                                        </span>
                                      )}
                                    </td>
                                    <td className="p-3 text-center">{item.jedinica || 'kom'}</td>
                                    <td className="p-3 text-center">{item.kolicina}</td>
                                    <td className="p-3 text-right">{formatNumber(item.cijena)} €</td>
                                    <td className="p-3 text-right font-medium">{formatNumber(item.ukupno)} €</td>
                                  </tr>
                                );
                              })}
                            </React.Fragment>
                          );
                        });
                      })()
                    ) : (
                      items.map((item, index) => {
                        const isSelected = !item.is_optional || selectedOptionalItems.has(item.id);
                        return (
                          <tr 
                            key={item.id} 
                            className={`${index % 2 === 0 ? 'bg-background' : 'bg-muted/20'} ${item.is_optional && !isSelected ? 'opacity-50' : ''}`}
                          >
                            {hasOptionalItems && (
                              <td className="p-3 text-center">
                                {item.is_optional ? (
                                  <Checkbox
                                    checked={selectedOptionalItems.has(item.id)}
                                    onCheckedChange={() => isPending && toggleOptionalItem(item.id)}
                                    disabled={!isPending}
                                  />
                                ) : null}
                              </td>
                            )}
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
                            <td className="p-3 text-center">{item.kolicina}</td>
                            <td className="p-3 text-right">{formatNumber(item.cijena)} €</td>
                            <td className="p-3 text-right font-medium">{formatNumber(item.ukupno)} €</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="sm:hidden space-y-3">
                {groups.length > 0 ? (
                  (() => {
                    let itemCounter = 1;
                    return groups.map((group) => {
                      const groupItems = items.filter(item => item.group_id === group.id);
                      return (
                        <div key={`group-${group.id}`}>
                          <div className="bg-muted/50 rounded-lg p-3 mb-2">
                            <div className="font-bold">{group.redni_broj}. {group.naziv}</div>
                            {group.opis && <div className="text-sm text-muted-foreground mt-1">{group.opis}</div>}
                          </div>
                          {groupItems.map((item) => {
                            itemCounter++;
                            const isSelected = !item.is_optional || selectedOptionalItems.has(item.id);
                            return (
                              <div 
                                key={item.id} 
                                className={`border rounded-lg p-4 mb-2 ${item.is_optional && !isSelected ? 'opacity-50' : ''}`}
                              >
                                <div className="flex items-start justify-between gap-2 mb-2">
                                  <div className="flex items-center gap-2">
                                    {item.is_optional && isPending && (
                                      <Checkbox
                                        checked={selectedOptionalItems.has(item.id)}
                                        onCheckedChange={() => toggleOptionalItem(item.id)}
                                      />
                                    )}
                                    <p className="font-medium">{item.opis}</p>
                                  </div>
                                  {item.is_optional && (
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground shrink-0">
                                      opcijski
                                    </span>
                                  )}
                                </div>
                                <div className="grid grid-cols-3 gap-2 text-sm">
                                  <div>
                                    <span className="text-muted-foreground">Količina:</span>
                                    <p className="font-medium">{item.kolicina}</p>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Cijena:</span>
                                    <p className="font-medium">{formatNumber(item.cijena)} €</p>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Ukupno:</span>
                                    <p className="font-medium">{formatNumber(item.ukupno)} €</p>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    });
                  })()
                ) : (
                  items.map((item) => {
                    const isSelected = !item.is_optional || selectedOptionalItems.has(item.id);
                    return (
                      <div 
                        key={item.id} 
                        className={`border rounded-lg p-4 ${item.is_optional && !isSelected ? 'opacity-50' : ''}`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            {item.is_optional && isPending && (
                              <Checkbox
                                checked={selectedOptionalItems.has(item.id)}
                                onCheckedChange={() => toggleOptionalItem(item.id)}
                              />
                            )}
                            <p className="font-medium">{item.opis}</p>
                          </div>
                          {item.is_optional && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground shrink-0">
                              opcijski
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Količina:</span>
                            <p className="font-medium">{item.kolicina}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Cijena:</span>
                            <p className="font-medium">{formatNumber(item.cijena)} €</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Ukupno:</span>
                            <p className="font-medium">{formatNumber(item.ukupno)} €</p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <Separator className="my-6" />

            {/* Total */}
            <div>
              <div className="flex justify-end">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between w-56 py-2 bg-primary/5 rounded px-2">
                    <span className="font-bold">SVEUKUPNO:</span>
                    <span className="font-bold text-primary">{formatNumber(calculatedTotal)} €</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Info */}
            {company?.iban && (
              <div className="mt-8 flex items-start gap-3 text-sm">
                <CreditCard className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="text-muted-foreground">Za plaćanje koristite sljedeće podatke:</p>
                  <p className="font-mono mt-1">{company.iban}</p>
                  <p className="text-muted-foreground mt-1">Model: HR00, Poziv na broj: {offer.offer_number}</p>
                </div>
              </div>
            )}
          </div>

          {/* Action Footer */}
          {isPending && (
            <>
              <Separator />
              <div className="p-6 sm:p-8 bg-muted/30">
                <p className="text-center text-muted-foreground mb-4">
                  Prihvaćate li ovu ponudu?
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    size="lg"
                    onClick={() => fetchOffer('accept')}
                    disabled={actionLoading}
                    className="gap-2"
                  >
                    {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                    Prihvaćam ponudu
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => fetchOffer('reject')}
                    disabled={actionLoading}
                    className="gap-2"
                  >
                    <XCircle className="h-4 w-4" />
                    Odbij ponudu
                  </Button>
                </div>
              </div>
            </>
          )}
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          Ovaj dokument je generiran putem MojaPonudica
        </p>
      </div>
    </div>
  );
};

export default OfferPreview;
