import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link, useBlocker } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useTenant } from '@/hooks/useTenant';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Save, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AppLayout from '@/components/AppLayout';
import CompanyInfoBox from '@/components/CompanyInfoBox';
import OfferItemsEditor, { OfferGroup, OfferItem } from '@/components/OfferItemsEditor';

function normalizeFormState(
  offerNumber: string,
  clientNaziv: string,
  clientOib: string,
  clientAdresa: string,
  objekatNaziv: string,
  objekatOpis: string,
  napomena: string,
  groups: OfferGroup[]
): string {
  const payload = {
    offerNumber,
    clientNaziv,
    clientOib,
    clientAdresa,
    objekatNaziv,
    objekatOpis,
    napomena,
    groups: groups.map((g) => ({
      naziv: g.naziv,
      opis: g.opis ?? '',
      redni_broj: g.redni_broj,
      items: g.items.map((i) => ({
        opis: i.opis,
        jedinica: i.jedinica,
        kolicina: i.kolicina,
        cijena: i.cijena,
        is_optional: i.is_optional ?? false,
      })),
    })),
  };
  return JSON.stringify(payload);
}

interface CompanyProfile {
  naziv_firme: string;
  oib: string;
  adresa: string;
  iban: string;
  email: string;
  telefon: string;
  web_link?: string | null;
  instagram_link?: string | null;
  social_display_label?: string | null;
}

const createNewItem = (groupId: string): OfferItem => ({
  id: crypto.randomUUID(),
  opis: '',
  jedinica: 'kom',
  kolicina: 1,
  cijena: 0,
  ukupno: 0,
  is_optional: false,
  group_id: groupId,
});

const createNewGroup = (redni_broj: number): OfferGroup => {
  const groupId = crypto.randomUUID();
  return {
    id: groupId,
    naziv: '',
    redni_broj,
    items: [createNewItem(groupId)],
  };
};

const EditOffer = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { tenant } = useTenant();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(null);

  const [offerNumber, setOfferNumber] = useState('');
  const [clientNaziv, setClientNaziv] = useState('');
  const [clientOib, setClientOib] = useState('');
  const [clientAdresa, setClientAdresa] = useState('');
  const [objekatNaziv, setObjekatNaziv] = useState('');
  const [objekatOpis, setObjekatOpis] = useState('');
  const [napomena, setNapomena] = useState('');
  const [groups, setGroups] = useState<OfferGroup[]>([]);
  const [deletedGroupIds, setDeletedGroupIds] = useState<string[]>([]);
  const [deletedItemIds, setDeletedItemIds] = useState<string[]>([]);
  const [originalGroupIds, setOriginalGroupIds] = useState<Set<string>>(new Set());
  const [originalItemIds, setOriginalItemIds] = useState<Set<string>>(new Set());

  const initialSnapshotRef = useRef<string | null>(null);
  const submittedRef = useRef(false);

  useEffect(() => {
    if (user && id && tenant?.id) {
      fetchData();
    }
  }, [user, id, tenant?.id]);

  const fetchData = async () => {
    const [offerResult, groupsResult, itemsResult, profileResult] = await Promise.all([
      supabase.from('offers').select('*').eq('id', id).single(),
      supabase.from('offer_item_groups').select('*').eq('offer_id', id).order('redni_broj'),
      supabase.from('offer_items').select('*').eq('offer_id', id),
      supabase.from('company_profiles').select('naziv_firme, oib, adresa, iban, email, telefon, web_link, instagram_link, social_display_label').eq('tenant_id', tenant!.id).maybeSingle(),
    ]);

    if (offerResult.error) {
      console.error('EditOffer: Offer fetch error:', offerResult.error);
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
    setObjekatNaziv((offer as any).objekat_naziv || '');
    setObjekatOpis((offer as any).objekat_opis || '');
    setNapomena(offer.napomena || '');

    const existingGroups = groupsResult.data || [];
    const existingItems = itemsResult.data || [];

    // Store original IDs
    setOriginalGroupIds(new Set(existingGroups.map(g => g.id)));
    setOriginalItemIds(new Set(existingItems.map(i => i.id)));

    if (existingGroups.length > 0) {
      // Map items to groups
      const groupedData: OfferGroup[] = existingGroups.map(group => ({
        id: group.id,
        naziv: group.naziv,
        opis: (group as any).opis || '',
        redni_broj: group.redni_broj,
        items: existingItems
          .filter(item => item.group_id === group.id)
          .map(item => ({
            id: item.id,
            opis: item.opis,
            jedinica: item.jedinica || 'kom',
            kolicina: Number(item.kolicina),
            cijena: Number(item.cijena),
            ukupno: Number(item.ukupno),
            is_optional: item.is_optional || false,
            group_id: item.group_id,
          })),
      }));

      // Ensure each group has at least one item
      groupedData.forEach(group => {
        if (group.items.length === 0) {
          group.items = [createNewItem(group.id)];
        }
      });

      setGroups(groupedData);
    } else if (existingItems.length > 0) {
      // Legacy: items without groups - create a default group
      const defaultGroupId = crypto.randomUUID();
      const legacyGroup: OfferGroup = {
        id: defaultGroupId,
        naziv: 'Stavke',
        redni_broj: 1,
        items: existingItems.map(item => ({
          id: item.id,
          opis: item.opis,
          jedinica: item.jedinica || 'kom',
          kolicina: Number(item.kolicina),
          cijena: Number(item.cijena),
          ukupno: Number(item.ukupno),
          is_optional: item.is_optional || false,
          group_id: defaultGroupId,
        })),
      };
      setGroups([legacyGroup]);
    } else {
      setGroups([createNewGroup(1)]);
    }

    setCompanyProfile(profileResult.data);
    setFetching(false);
  };

  useEffect(() => {
    if (!fetching && offerNumber && initialSnapshotRef.current === null) {
      initialSnapshotRef.current = normalizeFormState(
        offerNumber,
        clientNaziv,
        clientOib,
        clientAdresa,
        objekatNaziv,
        objekatOpis,
        napomena,
        groups
      );
    }
  }, [fetching, offerNumber, clientNaziv, clientOib, clientAdresa, objekatNaziv, objekatOpis, napomena, groups]);

  const hasUnsavedChanges =
    !submittedRef.current &&
    initialSnapshotRef.current !== null &&
    initialSnapshotRef.current !==
      normalizeFormState(
        offerNumber,
        clientNaziv,
        clientOib,
        clientAdresa,
        objekatNaziv,
        objekatOpis,
        napomena,
        groups
      );

  const blocker = useBlocker(hasUnsavedChanges);

  useEffect(() => {
    if (!hasUnsavedChanges) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [hasUnsavedChanges]);

  const updateGroup = (groupId: string, field: 'naziv' | 'opis', value: string) => {
    setGroups(groups.map(g => g.id === groupId ? { ...g, [field]: value } : g));
  };

  const addGroup = () => {
    const newGroup = createNewGroup(groups.length + 1);
    setGroups([...groups, newGroup]);
  };

  const removeGroup = (groupId: string) => {
    const group = groups.find(g => g.id === groupId);
    if (group && originalGroupIds.has(groupId)) {
      setDeletedGroupIds([...deletedGroupIds, groupId]);
      // Also mark all items in this group as deleted
      group.items.forEach(item => {
        if (originalItemIds.has(item.id)) {
          setDeletedItemIds(prev => [...prev, item.id]);
        }
      });
    }
    if (groups.length > 1) {
      const filtered = groups.filter(g => g.id !== groupId);
      setGroups(filtered.map((g, idx) => ({ ...g, redni_broj: idx + 1 })));
    }
  };

  const updateItem = (groupId: string, itemId: string, field: keyof OfferItem, value: string | number | boolean) => {
    setGroups(groups.map(group => {
      if (group.id !== groupId) return group;
      return {
        ...group,
        items: group.items.map(item => {
          if (item.id !== itemId) return item;
          const updated = { ...item, [field]: value };
          if (field === 'kolicina' || field === 'cijena') {
            updated.ukupno = updated.kolicina * updated.cijena;
          }
          return updated;
        }),
      };
    }));
  };

  const addItem = (groupId: string) => {
    setGroups(groups.map(group => {
      if (group.id !== groupId) return group;
      return {
        ...group,
        items: [...group.items, createNewItem(groupId)],
      };
    }));
  };

  const removeItem = (groupId: string, itemId: string) => {
    if (originalItemIds.has(itemId)) {
      setDeletedItemIds([...deletedItemIds, itemId]);
    }
    setGroups(groups.map(group => {
      if (group.id !== groupId) return group;
      if (group.items.length <= 1) return group;
      return {
        ...group,
        items: group.items.filter(item => item.id !== itemId),
      };
    }));
  };

  const moveItem = (groupId: string, itemId: string, direction: 'up' | 'down') => {
    setGroups(groups.map(group => {
      if (group.id !== groupId) return group;
      const items = [...group.items];
      const currentIndex = items.findIndex(item => item.id === itemId);
      if (currentIndex === -1) return group;
      
      const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      if (newIndex < 0 || newIndex >= items.length) return group;
      
      [items[currentIndex], items[newIndex]] = [items[newIndex], items[currentIndex]];
      return { ...group, items };
    }));
  };

  const total = groups.reduce((sum, group) => {
    return sum + group.items
      .filter(item => !item.is_optional)
      .reduce((itemSum, item) => itemSum + item.ukupno, 0);
  }, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyProfile) {
      toast({ title: 'Greška', description: 'Morate prvo popuniti profil tvrtke.', variant: 'destructive' });
      navigate('/profil');
      return;
    }

    submittedRef.current = true;
    setLoading(true);

    try {
      // Update offer
      const { error: offerError } = await supabase
        .from('offers')
        .update({
          client_naziv: clientNaziv,
          client_oib: clientOib,
          client_adresa: clientAdresa,
          objekat_naziv: objekatNaziv || null,
          objekat_opis: objekatOpis || null,
          napomena,
          ukupno: total,
        })
        .eq('id', id);

      if (offerError) throw offerError;

      // Delete removed items first
      if (deletedItemIds.length > 0) {
        const { error: deleteItemsError } = await supabase
          .from('offer_items')
          .delete()
          .in('id', deletedItemIds);
        if (deleteItemsError) throw deleteItemsError;
      }

      // Delete removed groups
      if (deletedGroupIds.length > 0) {
        const { error: deleteGroupsError } = await supabase
          .from('offer_item_groups')
          .delete()
          .in('id', deletedGroupIds);
        if (deleteGroupsError) throw deleteGroupsError;
      }

      // Process each group
      for (const group of groups) {
        let savedGroupId = group.id;

        if (originalGroupIds.has(group.id)) {
          // Update existing group
          const { error: updateGroupError } = await supabase
            .from('offer_item_groups')
            .update({ naziv: group.naziv, opis: group.opis || null, redni_broj: group.redni_broj })
            .eq('id', group.id);
          if (updateGroupError) throw updateGroupError;
        } else {
          // Insert new group
          const { data: savedGroup, error: insertGroupError } = await supabase
            .from('offer_item_groups')
            .insert({ offer_id: id, naziv: group.naziv, opis: group.opis || null, redni_broj: group.redni_broj })
            .select()
            .single();
          if (insertGroupError) throw insertGroupError;
          savedGroupId = savedGroup.id;
        }

        // Process items
        for (const item of group.items) {
          if (originalItemIds.has(item.id)) {
            // Update existing item
            const { error: updateItemError } = await supabase
              .from('offer_items')
              .update({
                group_id: savedGroupId,
                opis: item.opis,
                jedinica: item.jedinica,
                kolicina: item.kolicina,
                cijena: item.cijena,
                ukupno: item.ukupno,
                is_optional: item.is_optional,
              })
              .eq('id', item.id);
            if (updateItemError) throw updateItemError;
          } else {
            // Insert new item
            const { error: insertItemError } = await supabase
              .from('offer_items')
              .insert({
                offer_id: id,
                group_id: savedGroupId,
                opis: item.opis,
                jedinica: item.jedinica,
                kolicina: item.kolicina,
                cijena: item.cijena,
                ukupno: item.ukupno,
                is_optional: item.is_optional,
              });
            if (insertItemError) throw insertItemError;
          }
        }
      }

      toast({ title: 'Ponuda ažurirana!' });
      submittedRef.current = true;
      navigate(`/ponuda/${id}`);
    } catch (error: any) {
      submittedRef.current = false;
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
      <AlertDialog open={blocker.state === 'blocked'}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Nespremljene promjene</AlertDialogTitle>
            <AlertDialogDescription>
              Nespremljene promjene će nestati. Jesi li siguran da želiš izaći?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                if (blocker.state === 'blocked') blocker.reset();
              }}
            >
              Ostani
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (blocker.state === 'blocked') blocker.proceed();
              }}
            >
              Izađi
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6 max-w-6xl mx-auto">
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

            <div className="grid grid-cols-1 gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="space-y-2">
                <Label htmlFor="objekat_naziv">Objekat (naziv)</Label>
                <Input
                  id="objekat_naziv"
                  value={objekatNaziv}
                  onChange={(e) => setObjekatNaziv(e.target.value)}
                  placeholder="npr. Vanjski bazen uz obiteljsku kuću 50m2"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="objekat_opis">Opis objekta</Label>
                <Textarea
                  id="objekat_opis"
                  value={objekatOpis}
                  onChange={(e) => setObjekatOpis(e.target.value)}
                  placeholder="Dodatni opis objekta..."
                  rows={2}
                />
              </div>
            </div>

            <OfferItemsEditor
              groups={groups}
              onUpdateGroup={updateGroup}
              onAddGroup={addGroup}
              onRemoveGroup={removeGroup}
              onUpdateItem={updateItem}
              onAddItem={addItem}
              onRemoveItem={removeItem}
              onMoveItem={moveItem}
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
