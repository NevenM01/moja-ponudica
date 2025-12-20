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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Users, Trash2, Building2, AlertCircle, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { hr } from 'date-fns/locale';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

interface Tenant {
  id: string;
  naziv: string;
  slug: string;
}

interface UserProfile {
  id: string;
  email: string | null;
  created_at: string;
  last_sign_in_at: string | null;
  tenant_id: string | null;
  offer_count: number;
}

const AdminUsers = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  
  // New tenant dialog state
  const [isNewTenantOpen, setIsNewTenantOpen] = useState(false);
  const [newTenantName, setNewTenantName] = useState('');
  const [newTenantSlug, setNewTenantSlug] = useState('');
  const [creatingTenant, setCreatingTenant] = useState(false);

  const fetchTenants = async () => {
    const { data, error } = await supabase
      .from('tenants')
      .select('id, naziv, slug')
      .order('naziv');

    if (!error && data) {
      setTenants(data);
    }
  };

  const fetchUsers = async () => {
    // Fetch profiles with tenant_id
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching profiles:', error);
      setLoading(false);
      return;
    }

    // Fetch offer counts per user
    const { data: offers } = await supabase
      .from('offers')
      .select('user_id');

    const offerCounts = offers?.reduce((acc, offer) => {
      acc[offer.user_id] = (acc[offer.user_id] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    const usersWithCounts = profiles?.map(profile => ({
      ...profile,
      offer_count: offerCounts[profile.id] || 0
    })) || [];

    setUsers(usersWithCounts);
    setLoading(false);
  };

  useEffect(() => {
    fetchTenants();
    fetchUsers();
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
    if (!newTenantName.trim()) {
      toast.error('Unesite naziv tenanta');
      return;
    }

    const slug = newTenantSlug.trim() || generateSlug(newTenantName);

    setCreatingTenant(true);
    try {
      const { error } = await supabase
        .from('tenants')
        .insert({
          naziv: newTenantName.trim(),
          slug: slug
        });

      if (error) throw error;

      toast.success('Tenant uspješno kreiran');
      setNewTenantName('');
      setNewTenantSlug('');
      setIsNewTenantOpen(false);
      fetchTenants();
    } catch (error: any) {
      console.error('Error creating tenant:', error);
      toast.error(error.message || 'Greška pri kreiranju tenanta');
    } finally {
      setCreatingTenant(false);
    }
  };

  const handleAssignTenant = async (userId: string, tenantId: string | null) => {
    setUpdatingUserId(userId);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ tenant_id: tenantId })
        .eq('id', userId);

      if (error) throw error;

      toast.success('Tenant uspješno dodijeljen');
      fetchUsers();
    } catch (error: any) {
      console.error('Error assigning tenant:', error);
      toast.error(error.message || 'Greška pri dodjeli tenanta');
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleDeleteUser = async (userId: string, userEmail: string | null) => {
    setDeletingUserId(userId);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(
        `https://nicblfsldnpprtnclijt.supabase.co/functions/v1/delete-user`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({ userId }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Greška pri brisanju korisnika');
      }

      toast.success(`Korisnik ${userEmail || userId} je uspješno obrisan`);
      fetchUsers();
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast.error(error.message || 'Greška pri brisanju korisnika');
    } finally {
      setDeletingUserId(null);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return format(new Date(dateString), 'dd.MM.yyyy. HH:mm', { locale: hr });
  };

  const getTenantName = (tenantId: string | null) => {
    if (!tenantId) return null;
    const tenant = tenants.find(t => t.id === tenantId);
    return tenant?.naziv || 'Nepoznat';
  };

  const usersWithoutTenant = users.filter(u => !u.tenant_id);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/admin">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <Users className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold">Korisnici</h1>
            </div>
          </div>
          
          <Dialog open={isNewTenantOpen} onOpenChange={setIsNewTenantOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novi tenant
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Kreiraj novi tenant</DialogTitle>
                <DialogDescription>
                  Unesite podatke za novi tenant (organizaciju/tvrtku).
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
                    Jedinstveni identifikator za URL-ove. Ako ostavite prazno, automatski će se generirati iz naziva.
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsNewTenantOpen(false)}>
                  Odustani
                </Button>
                <Button onClick={handleCreateTenant} disabled={creatingTenant}>
                  {creatingTenant ? 'Kreiranje...' : 'Kreiraj tenant'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {usersWithoutTenant.length > 0 && (
          <Card className="border-warning bg-warning/10">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-warning-foreground">
                <AlertCircle className="h-5 w-5" />
                Korisnici bez tenanta ({usersWithoutTenant.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                Ovi korisnici nemaju dodijeljen tenant i ne mogu kreirati profil tvrtke.
              </p>
              <div className="space-y-2">
                {usersWithoutTenant.map(user => (
                  <div key={user.id} className="flex items-center justify-between p-2 bg-background rounded border">
                    <span className="font-medium">{user.email || user.id}</span>
                    <Select
                      value={user.tenant_id || "none"}
                      onValueChange={(value) => handleAssignTenant(user.id, value === "none" ? null : value)}
                      disabled={updatingUserId === user.id}
                    >
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Odaberi tenant" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Bez tenanta</SelectItem>
                        {tenants.map(tenant => (
                          <SelectItem key={tenant.id} value={tenant.id}>
                            {tenant.naziv}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Svi korisnici ({users.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-muted-foreground">Učitavanje...</div>
            ) : (
              <>
                {/* Desktop table */}
                <div className="hidden md:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Tenant</TableHead>
                        <TableHead>Registriran</TableHead>
                        <TableHead>Zadnja prijava</TableHead>
                        <TableHead className="text-right">Ponude</TableHead>
                        <TableHead className="w-[80px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.email || '-'}</TableCell>
                          <TableCell>
                            <Select
                              value={user.tenant_id || "none"}
                              onValueChange={(value) => handleAssignTenant(user.id, value === "none" ? null : value)}
                              disabled={updatingUserId === user.id}
                            >
                              <SelectTrigger className="w-[180px]">
                                <SelectValue>
                                  {user.tenant_id ? (
                                    <span className="flex items-center gap-2">
                                      <Building2 className="h-3 w-3" />
                                      {getTenantName(user.tenant_id)}
                                    </span>
                                  ) : (
                                    <Badge variant="outline" className="text-muted-foreground">
                                      Bez tenanta
                                    </Badge>
                                  )}
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">Bez tenanta</SelectItem>
                                {tenants.map(tenant => (
                                  <SelectItem key={tenant.id} value={tenant.id}>
                                    {tenant.naziv}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>{formatDate(user.created_at)}</TableCell>
                          <TableCell>{formatDate(user.last_sign_in_at)}</TableCell>
                          <TableCell className="text-right">{user.offer_count}</TableCell>
                          <TableCell>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                  disabled={deletingUserId === user.id}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Obrisati korisnika?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Jeste li sigurni da želite obrisati korisnika <strong>{user.email}</strong>?
                                    Ova akcija će trajno obrisati korisnika i sve njegove podatke.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Odustani</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteUser(user.id, user.email)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Obriši
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile cards */}
                <div className="md:hidden space-y-3">
                  {users.map((user) => (
                    <Card key={user.id}>
                      <CardContent className="pt-4">
                        <div className="flex justify-between items-start">
                          <div className="space-y-2 flex-1">
                            <div className="font-medium">{user.email || '-'}</div>
                            <div className="text-sm text-muted-foreground">
                              Registriran: {formatDate(user.created_at)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Zadnja prijava: {formatDate(user.last_sign_in_at)}
                            </div>
                            <div className="text-sm">
                              Ponude: <span className="font-medium">{user.offer_count}</span>
                            </div>
                            <div className="pt-2">
                              <Select
                                value={user.tenant_id || "none"}
                                onValueChange={(value) => handleAssignTenant(user.id, value === "none" ? null : value)}
                                disabled={updatingUserId === user.id}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue>
                                    {user.tenant_id ? (
                                      <span className="flex items-center gap-2">
                                        <Building2 className="h-3 w-3" />
                                        {getTenantName(user.tenant_id)}
                                      </span>
                                    ) : (
                                      <Badge variant="outline" className="text-muted-foreground">
                                        Bez tenanta
                                      </Badge>
                                    )}
                                  </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="none">Bez tenanta</SelectItem>
                                  {tenants.map(tenant => (
                                    <SelectItem key={tenant.id} value={tenant.id}>
                                      {tenant.naziv}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                disabled={deletingUserId === user.id}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Obrisati korisnika?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Jeste li sigurni da želite obrisati korisnika <strong>{user.email}</strong>?
                                  Ova akcija će trajno obrisati korisnika i sve njegove podatke.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Odustani</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteUser(user.id, user.email)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Obriši
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {users.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    Nema registriranih korisnika
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default AdminUsers;
