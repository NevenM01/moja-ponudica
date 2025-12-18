import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, ArrowLeft, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AppLayout from '@/components/AppLayout';
import OfferItemsEditor, { OfferGroup, OfferItem } from '@/components/OfferItemsEditor';

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

const EditTemplate = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [templateName, setTemplateName] = useState('');
  const [napomena, setNapomena] = useState('');
  const [groups, setGroups] = useState<OfferGroup[]>([createNewGroup(1)]);

  useEffect(() => {
    if (user && id) {
      fetchTemplate();
    }
  }, [user, id]);

  const fetchTemplate = async () => {
    try {
      const [templateResult, groupsResult, itemsResult] = await Promise.all([
        supabase.from('offer_templates').select('*').eq('id', id).eq('user_id', user?.id).single(),
        supabase.from('offer_template_groups').select('*').eq('template_id', id).order('redni_broj'),
        supabase.from('offer_template_items').select('*').eq('template_id', id),
      ]);

      if (templateResult.error) throw templateResult.error;
      if (!templateResult.data) {
        toast({ title: 'Greška', description: 'Predložak nije pronađen.', variant: 'destructive' });
        navigate('/nova-ponuda');
        return;
      }

      setTemplateName(templateResult.data.naziv);
      setNapomena(templateResult.data.napomena || '');

      const templateGroups = groupsResult.data || [];
      const templateItems = itemsResult.data || [];

      if (templateGroups.length > 0) {
        const loadedGroups: OfferGroup[] = templateGroups.map(tGroup => {
          const newGroupId = crypto.randomUUID();
          const groupItems = templateItems
            .filter(item => item.group_id === tGroup.id)
            .map(item => ({
              id: crypto.randomUUID(),
              opis: item.opis,
              jedinica: item.jedinica || 'kom',
              kolicina: Number(item.kolicina),
              cijena: Number(item.cijena),
              ukupno: Number(item.kolicina) * Number(item.cijena),
              is_optional: item.is_optional || false,
              group_id: newGroupId,
            }));

          return {
            id: newGroupId,
            naziv: tGroup.naziv,
            opis: (tGroup as any).opis || '',
            redni_broj: tGroup.redni_broj,
            items: groupItems.length > 0 ? groupItems : [createNewItem(newGroupId)],
          };
        });

        setGroups(loadedGroups);
      }
    } catch (error: any) {
      toast({ title: 'Greška', description: error.message, variant: 'destructive' });
      navigate('/nova-ponuda');
    } finally {
      setLoading(false);
    }
  };

  const updateGroup = (groupId: string, field: 'naziv' | 'opis', value: string) => {
    setGroups(groups.map(g => g.id === groupId ? { ...g, [field]: value } : g));
  };

  const addGroup = () => {
    const newGroup = createNewGroup(groups.length + 1);
    setGroups([...groups, newGroup]);
  };

  const removeGroup = (groupId: string) => {
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
    if (!templateName.trim()) {
      toast({ title: 'Greška', description: 'Unesite naziv predloška.', variant: 'destructive' });
      return;
    }

    setSaving(true);

    try {
      // Update template
      const { error: templateError } = await supabase
        .from('offer_templates')
        .update({
          naziv: templateName,
          napomena: napomena || null,
        })
        .eq('id', id);

      if (templateError) throw templateError;

      // Delete existing groups and items
      await supabase.from('offer_template_items').delete().eq('template_id', id);
      await supabase.from('offer_template_groups').delete().eq('template_id', id);

      // Create new groups and items
      for (const group of groups) {
        const { data: savedGroup, error: groupError } = await supabase
          .from('offer_template_groups')
          .insert({
            template_id: id,
            naziv: group.naziv,
            opis: group.opis || null,
            redni_broj: group.redni_broj,
          })
          .select()
          .single();

        if (groupError) throw groupError;

        const itemsToInsert = group.items.map((item) => ({
          template_id: id,
          group_id: savedGroup.id,
          opis: item.opis,
          jedinica: item.jedinica,
          kolicina: item.kolicina,
          cijena: item.cijena,
          is_optional: item.is_optional,
        }));

        const { error: itemsError } = await supabase
          .from('offer_template_items')
          .insert(itemsToInsert);
        if (itemsError) throw itemsError;
      }

      toast({ title: 'Predložak spremljen!' });
      navigate('/nova-ponuda');
    } catch (error: any) {
      toast({ title: 'Greška', description: error.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6 max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-4">
          <Button type="button" variant="ghost" size="icon" onClick={() => navigate('/nova-ponuda')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl md:text-2xl font-bold">Uredi predložak</h1>
        </div>

        <Card>
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="text-base md:text-lg">Osnovni podaci</CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="templateName">Naziv predloška *</Label>
              <Input
                id="templateName"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="npr. Ponuda za bazen - standard"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="napomena">Napomena (opcijski)</Label>
              <Textarea
                id="napomena"
                value={napomena}
                onChange={(e) => setNapomena(e.target.value)}
                placeholder="Napomena koja će se prikazati na ponudama izrađenim iz ovog predloška..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 md:p-6">
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
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate('/nova-ponuda')}>
            Odustani
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Spremi promjene
          </Button>
        </div>
      </form>
    </AppLayout>
  );
};

export default EditTemplate;
