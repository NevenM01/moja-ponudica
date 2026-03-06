import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import AppLayout from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import { ArrowLeft, Building2, Plus, Calendar, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { hr } from 'date-fns/locale';

interface Tenant {
  id: string;
  naziv: string | null;
  slug: string | null;
  created_at?: string | null;
  trial_ends_at: string | null;
}

function getTrialStatus(trialEndsAt: string | null): { label: string; expired: boolean } {
  if (!trialEndsAt) return { label: 'Nema triala', expired: false };
  const date = new Date(trialEndsAt);
  if (date.getTime() < Date.now()) return { label: 'Isteklo', expired: true };
  return { label: format(date, 'dd.MM.yyyy.', { locale: hr }), expired: false };
}

const AdminTenants = () => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTenantName, setNewTenantName] = useState('');
  const [newTenantSlug, setNewTenantSlug] = useState('');
  const [addTrialDays, setAddTrialDays] = useState(false);
  const [creating, setCreating] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [editTrialEndsAt, setEditTrialEndsAt] = useState('');
  const [updatingTrial, setUpdatingTrial] = useState(false);
  const [tenantToDelete, setTenantToDelete] = useState<Tenant | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchTenants = async () => {
    const { data, error } = await supabase
      .from('tenants')
      .select('id, naziv, slug, created_at, trial_ends_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching tenants:', error);
      toast.error(error.message);
      setTenants([]);
    } else {
      setTenants(data ?? []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/č/g, 'c')
      .replace(/ć/g, 'c')
      .replace(/đ/g, 'd')
      .replace(/š/g, 's')
      .replace(/ž/g, 'z')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleCreateTenant = async () => {
    const name = newTenantName.trim();
    if (!name) {
      toast.error('Unesite naziv tenanta');
      return;
    }

    const slug = newTenantSlug.trim() || generateSlug(name);
    const trialEndsAt = addTrialDays
      ? new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
      : null;
    const insertPayload: { naziv: string; slug: string; trial_ends_at?: string } = {
      naziv: name,
      slug: slug || generateSlug(name),
    };
    if (trialEndsAt) {
      insertPayload.trial_ends_at = new Date(trialEndsAt + 'T23:59:59.999Z').toISOString();
    }

    setCreating(true);
    try {
      const { error } = await supabase.from('tenants').insert(insertPayload);

      if (error) throw error;

      toast.success('Tenant uspješno kreiran');
      setNewTenantName('');
      setNewTenantSlug('');
      setAddTrialDays(false);
      setIsCreateOpen(false);
      fetchTenants();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Greška pri kreiranju tenanta';
      toast.error(message);
    } finally {
      setCreating(false);
    }
  };

  const openEditTrial = (t: Tenant) => {
    setEditingTenant(t);
    setEditTrialEndsAt(t.trial_ends_at ? t.trial_ends_at.slice(0, 10) : '');
  };

  const closeEditTrial = () => {
    setEditingTenant(null);
    setEditTrialEndsAt('');
  };

  const handleExtendTrial = async (days: number) => {
    if (!editingTenant) return;
    const base = editingTenant.trial_ends_at
      ? Math.max(new Date(editingTenant.trial_ends_at).getTime(), Date.now())
      : Date.now();
    const newEnd = new Date(base + days * 24 * 60 * 60 * 1000).toISOString();
    await updateTrialEndsAt(editingTenant.id, newEnd);
  };

  const updateTrialEndsAt = async (tenantId: string, value: string | null) => {
    setUpdatingTrial(true);
    try {
      const { error } = await supabase
        .from('tenants')
        .update({ trial_ends_at: value })
        .eq('id', tenantId);
      if (error) throw error;
      toast.success(value ? 'Trial ažuriran' : 'Trial uklonjen');
      closeEditTrial();
      fetchTenants();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Greška');
    } finally {
      setUpdatingTrial(false);
    }
  };

  const handleSaveTrial = () => {
    if (!editingTenant) return;
    if (!editTrialEndsAt.trim()) {
      updateTrialEndsAt(editingTenant.id, null);
      return;
    }
    const iso = new Date(editTrialEndsAt + 'T23:59:59.999Z').toISOString();
    updateTrialEndsAt(editingTenant.id, iso);
  };

  const handleDeleteTenant = async () => {
    if (!tenantToDelete) return;
    setDeleting(true);
    try {
      const { error } = await supabase.from('tenants').delete().eq('id', tenantToDelete.id);
      if (error) throw error;
      toast.success('Tenant obrisan');
      setTenantToDelete(null);
      fetchTenants();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Greška pri brisanju');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link to="/admin">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Building2 className="h-6 w-6" />
                Tenanti
              </h1>
              <p className="text-sm text-muted-foreground">
                Upravljanje tenantima (organizacijama). Kreirajte novi tenant da biste mogli dodijeliti korisnike.
              </p>
            </div>
          </div>

          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Kreiraj tenant
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Kreiraj novi tenant</DialogTitle>
                <DialogDescription>
                  Unesite podatke za novi tenant (organizaciju/tvrtku). Korisnicima možete dodijeliti tenant u
                  Upravljanje korisnicima.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="tenant-name">Naziv *</Label>
                  <Input
                    id="tenant-name"
                    value={newTenantName}
                    onChange={(e) => setNewTenantName(e.target.value)}
                    placeholder="npr. Moja Tvrtka d.o.o."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tenant-slug">Slug (opciono)</Label>
                  <Input
                    id="tenant-slug"
                    value={newTenantSlug}
                    onChange={(e) => setNewTenantSlug(e.target.value)}
                    placeholder={newTenantName ? generateSlug(newTenantName) : 'automatski iz naziva'}
                  />
                  <p className="text-xs text-muted-foreground">
                    Jedinstveni identifikator. Ako ostavite prazno, generirat će se iz naziva.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="add-trial"
                    checked={addTrialDays}
                    onChange={(e) => setAddTrialDays(e.target.checked)}
                    className="rounded border-input"
                  />
                  <Label htmlFor="add-trial" className="cursor-pointer text-sm font-normal">
                    Dodaj 14-dnevni trial
                  </Label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Odustani
                </Button>
                <Button onClick={handleCreateTenant} disabled={creating}>
                  {creating ? 'Kreiranje...' : 'Kreiraj tenant'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={!!editingTenant} onOpenChange={(open) => !open && closeEditTrial()}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Uredi trial</DialogTitle>
                <DialogDescription>
                  Postavite datum završetka probnog perioda ili uklonite trial (označi kao plaćeno).
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="trial-ends-at">Trial do (prazno = nema triala)</Label>
                  <Input
                    id="trial-ends-at"
                    type="date"
                    value={editTrialEndsAt}
                    onChange={(e) => setEditTrialEndsAt(e.target.value)}
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleExtendTrial(14)}
                    disabled={updatingTrial}
                  >
                    Produži za 14 dana
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleExtendTrial(30)}
                    disabled={updatingTrial}
                  >
                    Produži za 30 dana
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => editingTenant && updateTrialEndsAt(editingTenant.id, null)}
                    disabled={updatingTrial}
                  >
                    Ukloni trial
                  </Button>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={closeEditTrial}>
                  Odustani
                </Button>
                <Button onClick={handleSaveTrial} disabled={updatingTrial}>
                  {updatingTrial ? 'Spremanje...' : 'Spremi'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <AlertDialog open={!!tenantToDelete} onOpenChange={(open) => !open && setTenantToDelete(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Obriši tenanta?</AlertDialogTitle>
                <AlertDialogDescription>
                  Tenant &quot;{tenantToDelete?.naziv ?? tenantToDelete?.slug ?? 'ovaj tenant'}&quot; bit će trajno obrisan.
                  Korisnici i podaci povezani s tim tenantom mogu postati nedostupni. Nastaviti?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={deleting}>Odustani</AlertDialogCancel>
                <AlertDialogAction
                  onClick={(e) => {
                    e.preventDefault();
                    handleDeleteTenant();
                  }}
                  disabled={deleting}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {deleting ? 'Brisanje...' : 'Obriši'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista tenanata</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground">Učitavanje...</p>
            ) : tenants.length === 0 ? (
              <p className="text-muted-foreground">
                Nema tenanata. Kliknite &quot;Kreiraj tenant&quot; za dodavanje prvog.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Naziv</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Trial do</TableHead>
                    <TableHead className="w-32">ID</TableHead>
                    <TableHead className="w-28 text-right">Akcije</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tenants.map((t) => {
                    const { label, expired } = getTrialStatus(t.trial_ends_at);
                    return (
                      <TableRow key={t.id}>
                        <TableCell className="font-medium">{t.naziv ?? '—'}</TableCell>
                        <TableCell className="text-muted-foreground">{t.slug ?? '—'}</TableCell>
                        <TableCell>
                          <span className={expired ? 'text-destructive' : ''}>{label}</span>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground font-mono truncate max-w-32" title={t.id}>
                          {t.id.slice(0, 8)}…
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditTrial(t)}
                              title="Uredi trial"
                            >
                              <Calendar className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setTenantToDelete(t)}
                              title="Obriši tenanta"
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default AdminTenants;
