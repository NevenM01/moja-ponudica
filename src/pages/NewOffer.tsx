import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, FileText, FolderOpen, Trash2, Pencil } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AppLayout from '@/components/AppLayout';
import CompanyInfoBox from '@/components/CompanyInfoBox';
import OfferItemsEditor, { OfferGroup, OfferItem } from '@/components/OfferItemsEditor';

interface CompanyProfile {
  naziv_firme: string;
  oib: string;
  adresa: string;
  iban: string;
  email: string;
  telefon: string;
}

interface Template {
  id: string;
  naziv: string;
  napomena: string | null;
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

const NewOffer = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(null);

  const [offerNumber, setOfferNumber] = useState('');
  const [clientNaziv, setClientNaziv] = useState('');
  const [clientOib, setClientOib] = useState('');
  const [clientAdresa, setClientAdresa] = useState('');
  const [objekatNaziv, setObjekatNaziv] = useState('');
  const [objekatOpis, setObjekatOpis] = useState('');
  const [napomena, setNapomena] = useState('');
  const [groups, setGroups] = useState<OfferGroup[]>([createNewGroup(1)]);

  // Template states
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [newTemplateName, setNewTemplateName] = useState('');
  const [saveTemplateOpen, setSaveTemplateOpen] = useState(false);
  const [loadTemplateOpen, setLoadTemplateOpen] = useState(false);
  const [savingTemplate, setSavingTemplate] = useState(false);

  useEffect(() => {
    if (user) {
      fetchCompanyProfile();
      generateOfferNumber();
      fetchTemplates();
    }
  }, [user]);

  const fetchCompanyProfile = async () => {
    const { data } = await supabase
      .from('company_profiles')
      .select('naziv_firme, oib, adresa, iban, email, telefon')
      .eq('user_id', user?.id)
      .maybeSingle();

    if (data) {
      setCompanyProfile(data);
    }
  };

  const fetchTemplates = async () => {
    const { data } = await supabase
      .from('offer_templates')
      .select('id, naziv, napomena')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });

    if (data) {
      setTemplates(data);
    }
  };

  const generateOfferNumber = async () => {
    const year = new Date().getFullYear();
    const { count } = await supabase
      .from('offers')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user?.id);

    const nextNumber = (count || 0) + 1;
    setOfferNumber(`PON-${year}-${String(nextNumber).padStart(4, '0')}`);
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

  // Save current offer as template
  const handleSaveTemplate = async () => {
    if (!newTemplateName.trim()) {
      toast({ title: 'Greška', description: 'Unesite naziv predloška.', variant: 'destructive' });
      return;
    }

    setSavingTemplate(true);

    try {
      // Create template
      const { data: template, error: templateError } = await supabase
        .from('offer_templates')
        .insert({
          user_id: user?.id,
          naziv: newTemplateName,
          napomena: napomena,
        })
        .select()
        .single();

      if (templateError) throw templateError;

      // Create template groups and items
      for (const group of groups) {
        const { data: savedGroup, error: groupError } = await supabase
          .from('offer_template_groups')
          .insert({
            template_id: template.id,
            naziv: group.naziv,
            opis: group.opis || null,
            redni_broj: group.redni_broj,
          })
          .select()
          .single();

        if (groupError) throw groupError;

        const itemsToInsert = group.items.map((item) => ({
          template_id: template.id,
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
      setSaveTemplateOpen(false);
      setNewTemplateName('');
      fetchTemplates();
    } catch (error: any) {
      toast({ title: 'Greška', description: error.message, variant: 'destructive' });
    } finally {
      setSavingTemplate(false);
    }
  };

  // Load template
  const handleLoadTemplate = async () => {
    if (!selectedTemplateId) {
      toast({ title: 'Greška', description: 'Odaberite predložak.', variant: 'destructive' });
      return;
    }

    try {
      // Fetch template data
      const [templateResult, groupsResult, itemsResult] = await Promise.all([
        supabase.from('offer_templates').select('*').eq('id', selectedTemplateId).single(),
        supabase.from('offer_template_groups').select('*').eq('template_id', selectedTemplateId).order('redni_broj'),
        supabase.from('offer_template_items').select('*').eq('template_id', selectedTemplateId),
      ]);

      if (templateResult.error) throw templateResult.error;

      const templateGroups = groupsResult.data || [];
      const templateItems = itemsResult.data || [];

      // Set napomena from template
      if (templateResult.data.napomena) {
        setNapomena(templateResult.data.napomena);
      }

      // Map template data to groups structure
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

      toast({ title: 'Predložak učitan!' });
      setLoadTemplateOpen(false);
      setSelectedTemplateId('');
    } catch (error: any) {
      toast({ title: 'Greška', description: error.message, variant: 'destructive' });
    }
  };

  // Delete template
  const handleDeleteTemplate = async (templateId: string) => {
    try {
      const { error } = await supabase
        .from('offer_templates')
        .delete()
        .eq('id', templateId);

      if (error) throw error;

      toast({ title: 'Predložak obrisan!' });
      fetchTemplates();
      if (selectedTemplateId === templateId) {
        setSelectedTemplateId('');
      }
    } catch (error: any) {
      toast({ title: 'Greška', description: error.message, variant: 'destructive' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyProfile) {
      toast({ title: 'Greška', description: 'Morate prvo popuniti profil tvrtke.', variant: 'destructive' });
      navigate('/profil');
      return;
    }

    setLoading(true);

    try {
      const { data: offer, error: offerError } = await supabase
        .from('offers')
        .insert({
          user_id: user?.id,
          offer_number: offerNumber,
          client_naziv: clientNaziv,
          client_oib: clientOib,
          client_adresa: clientAdresa,
          objekat_naziv: objekatNaziv || null,
          objekat_opis: objekatOpis || null,
          napomena,
          ukupno: total,
        })
        .select()
        .single();

      if (offerError) throw offerError;

      for (const group of groups) {
        const { data: savedGroup, error: groupError } = await supabase
          .from('offer_item_groups')
          .insert({
            offer_id: offer.id,
            naziv: group.naziv,
            opis: group.opis || null,
            redni_broj: group.redni_broj,
          })
          .select()
          .single();

        if (groupError) throw groupError;

        const itemsToInsert = group.items.map((item) => ({
          offer_id: offer.id,
          group_id: savedGroup.id,
          opis: item.opis,
          jedinica: item.jedinica,
          kolicina: item.kolicina,
          cijena: item.cijena,
          ukupno: item.ukupno,
          is_optional: item.is_optional,
        }));

        const { error: itemsError } = await supabase.from('offer_items').insert(itemsToInsert);
        if (itemsError) throw itemsError;
      }

      toast({ title: 'Ponuda spremljena!' });
      navigate(`/ponuda/${offer.id}`);
    } catch (error: any) {
      toast({ title: 'Greška', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6 max-w-6xl mx-auto">
        <CompanyInfoBox profile={companyProfile} />

        <Card>
          <CardHeader className="p-4 md:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <CardTitle className="text-base md:text-lg">Nova ponuda - {offerNumber}</CardTitle>
              <div className="flex gap-2">
                {/* Load Template Dialog */}
                <Dialog open={loadTemplateOpen} onOpenChange={setLoadTemplateOpen}>
                  <DialogTrigger asChild>
                    <Button type="button" variant="outline" size="sm">
                      <FolderOpen className="h-4 w-4 mr-2" />
                      Učitaj predložak
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Učitaj predložak</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      {templates.length === 0 ? (
                        <p className="text-muted-foreground text-sm">Nemate spremljenih predložaka.</p>
                      ) : (
                        <div className="space-y-2">
                          {templates.map((template) => (
                            <div key={template.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                              <button
                                type="button"
                                className={`flex-1 text-left ${selectedTemplateId === template.id ? 'font-bold text-primary' : ''}`}
                                onClick={() => setSelectedTemplateId(template.id)}
                              >
                                {template.naziv}
                              </button>
                              <div className="flex gap-1">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => navigate(`/predlozak/${template.id}/uredi`)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteTemplate(template.id)}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button type="button" variant="outline">Odustani</Button>
                      </DialogClose>
                      <Button type="button" onClick={handleLoadTemplate} disabled={!selectedTemplateId}>
                        Učitaj
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                {/* Save Template Dialog */}
                <Dialog open={saveTemplateOpen} onOpenChange={setSaveTemplateOpen}>
                  <DialogTrigger asChild>
                    <Button type="button" variant="outline" size="sm">
                      <FileText className="h-4 w-4 mr-2" />
                      Spremi kao predložak
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Spremi kao predložak</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="template_name">Naziv predloška *</Label>
                        <Input
                          id="template_name"
                          value={newTemplateName}
                          onChange={(e) => setNewTemplateName(e.target.value)}
                          placeholder="npr. Ponuda za bazen - standard"
                        />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Trenutne grupe i stavke će biti spremljene kao predložak za buduće ponude.
                      </p>
                    </div>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button type="button" variant="outline">Odustani</Button>
                      </DialogClose>
                      <Button type="button" onClick={handleSaveTemplate} disabled={savingTemplate}>
                        {savingTemplate ? 'Spremanje...' : 'Spremi'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
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
              {loading ? 'Spremanje...' : 'Spremi ponudu'}
            </Button>
          </CardContent>
        </Card>
      </form>
    </AppLayout>
  );
};

export default NewOffer;
