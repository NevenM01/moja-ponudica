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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Building2, Plus, Edit, Users, Palette } from 'lucide-react';
import { toast } from 'sonner';

interface Tenant {
  id: string;
  slug: string;
  naziv: string;
  primary_color: string | null;
  accent_color: string | null;
  logo_url: string | null;
  background_style: string | null;
  created_at: string | null;
}

interface UserProfile {
  id: string;
  email: string | null;
  tenant_id: string | null;
}

const AdminTenants = () => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    naziv: '',
    slug: '',
    primary_color: '243 75% 58%',
    accent_color: '250 100% 97%',
    logo_url: '',
    background_style: 'bubbles'
  });

  const fetchData = async () => {
    const [tenantsRes, usersRes] = await Promise.all([
      supabase.from('tenants').select('*').order('naziv'),
      supabase.from('profiles').select('id, email, tenant_id')
    ]);

    if (tenantsRes.data) setTenants(tenantsRes.data);
    if (usersRes.data) setUsers(usersRes.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const resetForm = () => {
    setFormData({
      naziv: '',
      slug: '',
      primary_color: '243 75% 58%',
      accent_color: '250 100% 97%',
      logo_url: '',
      background_style: 'bubbles'
    });
  };

  const handleCreate = async () => {
    if (!formData.naziv || !formData.slug) {
      toast.error('Naziv i slug su obavezni');
      return;
    }

    const { error } = await supabase.from('tenants').insert({
      naziv: formData.naziv,
      slug: formData.slug.toLowerCase().replace(/\s+/g, '-'),
      primary_color: formData.primary_color,
      accent_color: formData.accent_color,
      logo_url: formData.logo_url || null,
      background_style: formData.background_style
    });

    if (error) {
      toast.error('Greška pri kreiranju tenanta: ' + error.message);
      return;
    }

    toast.success('Tenant uspješno kreiran');
    setIsCreateOpen(false);
    resetForm();
    fetchData();
  };

  const handleEdit = async () => {
    if (!editingTenant) return;

    const { error } = await supabase
      .from('tenants')
      .update({
        naziv: formData.naziv,
        slug: formData.slug,
        primary_color: formData.primary_color,
        accent_color: formData.accent_color,
        logo_url: formData.logo_url || null,
        background_style: formData.background_style
      })
      .eq('id', editingTenant.id);

    if (error) {
      toast.error('Greška pri ažuriranju tenanta: ' + error.message);
      return;
    }

    toast.success('Tenant uspješno ažuriran');
    setIsEditOpen(false);
    setEditingTenant(null);
    resetForm();
    fetchData();
  };

  const handleAssignUser = async (userId: string, tenantId: string | null) => {
    const { error } = await supabase
      .from('profiles')
      .update({ tenant_id: tenantId === 'none' ? null : tenantId })
      .eq('id', userId);

    if (error) {
      toast.error('Greška pri dodjeli tenanta: ' + error.message);
      return;
    }

    toast.success('Korisnik uspješno dodijeljen');
    fetchData();
  };

  const openEditDialog = (tenant: Tenant) => {
    setEditingTenant(tenant);
    setFormData({
      naziv: tenant.naziv,
      slug: tenant.slug,
      primary_color: tenant.primary_color || '243 75% 58%',
      accent_color: tenant.accent_color || '250 100% 97%',
      logo_url: tenant.logo_url || '',
      background_style: tenant.background_style || 'bubbles'
    });
    setIsEditOpen(true);
  };

  const getTenantName = (tenantId: string | null) => {
    if (!tenantId) return 'Nije dodijeljen';
    const tenant = tenants.find(t => t.id === tenantId);
    return tenant?.naziv || 'Nepoznat';
  };

  const getUserCount = (tenantId: string) => {
    return users.filter(u => u.tenant_id === tenantId).length;
  };

  // Convert HSL string to CSS color for preview
  const hslToColor = (hsl: string | null) => {
    if (!hsl) return '#6366f1';
    return `hsl(${hsl})`;
  };

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
              <Building2 className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold">Tenanti / Brandovi</h1>
            </div>
          </div>
          
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Novi tenant
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Kreiraj novi tenant</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="naziv">Naziv</Label>
                  <Input
                    id="naziv"
                    value={formData.naziv}
                    onChange={(e) => setFormData({ ...formData, naziv: e.target.value })}
                    placeholder="npr. Aqua Bili"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug (URL identifikator)</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="npr. aqua-bili"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="primary_color">Primarna boja (HSL)</Label>
                    <div className="flex gap-2">
                      <Input
                        id="primary_color"
                        value={formData.primary_color}
                        onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                        placeholder="243 75% 58%"
                      />
                      <div 
                        className="w-10 h-10 rounded border flex-shrink-0"
                        style={{ backgroundColor: hslToColor(formData.primary_color) }}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="accent_color">Akcentna boja (HSL)</Label>
                    <div className="flex gap-2">
                      <Input
                        id="accent_color"
                        value={formData.accent_color}
                        onChange={(e) => setFormData({ ...formData, accent_color: e.target.value })}
                        placeholder="250 100% 97%"
                      />
                      <div 
                        className="w-10 h-10 rounded border flex-shrink-0"
                        style={{ backgroundColor: hslToColor(formData.accent_color) }}
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="logo_url">Logo URL</Label>
                  <Input
                    id="logo_url"
                    value={formData.logo_url}
                    onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="background_style">Stil pozadine</Label>
                  <Select 
                    value={formData.background_style} 
                    onValueChange={(value) => setFormData({ ...formData, background_style: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bubbles">Mjehurići (Bubbles)</SelectItem>
                      <SelectItem value="geometric">Geometrijski</SelectItem>
                      <SelectItem value="minimal">Minimalan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Odustani</Button>
                </DialogClose>
                <Button onClick={handleCreate}>Kreiraj</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Tenants List */}
        <Card>
          <CardHeader>
            <CardTitle>Svi tenanti ({tenants.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-muted-foreground">Učitavanje...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Naziv</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Boje</TableHead>
                    <TableHead>Pozadina</TableHead>
                    <TableHead className="text-right">Korisnici</TableHead>
                    <TableHead className="w-[100px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tenants.map((tenant) => (
                    <TableRow key={tenant.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {tenant.logo_url && (
                            <img src={tenant.logo_url} alt="" className="h-6 w-6 object-contain" />
                          )}
                          {tenant.naziv}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{tenant.slug}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <div 
                            className="w-6 h-6 rounded border"
                            style={{ backgroundColor: hslToColor(tenant.primary_color) }}
                            title="Primarna"
                          />
                          <div 
                            className="w-6 h-6 rounded border"
                            style={{ backgroundColor: hslToColor(tenant.accent_color) }}
                            title="Akcentna"
                          />
                        </div>
                      </TableCell>
                      <TableCell className="capitalize">{tenant.background_style}</TableCell>
                      <TableCell className="text-right">{getUserCount(tenant.id)}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(tenant)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* User Assignment */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Dodjela korisnika tenantima
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Trenutni tenant</TableHead>
                  <TableHead className="w-[200px]">Promijeni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.email || '-'}</TableCell>
                    <TableCell>{getTenantName(user.tenant_id)}</TableCell>
                    <TableCell>
                      <Select
                        value={user.tenant_id || 'none'}
                        onValueChange={(value) => handleAssignUser(user.id, value)}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Nije dodijeljen</SelectItem>
                          {tenants.map((tenant) => (
                            <SelectItem key={tenant.id} value={tenant.id}>
                              {tenant.naziv}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Uredi tenant
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-naziv">Naziv</Label>
                <Input
                  id="edit-naziv"
                  value={formData.naziv}
                  onChange={(e) => setFormData({ ...formData, naziv: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-slug">Slug</Label>
                <Input
                  id="edit-slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-primary">Primarna boja (HSL)</Label>
                  <div className="flex gap-2">
                    <Input
                      id="edit-primary"
                      value={formData.primary_color}
                      onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                    />
                    <div 
                      className="w-10 h-10 rounded border flex-shrink-0"
                      style={{ backgroundColor: hslToColor(formData.primary_color) }}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-accent">Akcentna boja (HSL)</Label>
                  <div className="flex gap-2">
                    <Input
                      id="edit-accent"
                      value={formData.accent_color}
                      onChange={(e) => setFormData({ ...formData, accent_color: e.target.value })}
                    />
                    <div 
                      className="w-10 h-10 rounded border flex-shrink-0"
                      style={{ backgroundColor: hslToColor(formData.accent_color) }}
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-logo">Logo URL</Label>
                <Input
                  id="edit-logo"
                  value={formData.logo_url}
                  onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-bg">Stil pozadine</Label>
                <Select 
                  value={formData.background_style} 
                  onValueChange={(value) => setFormData({ ...formData, background_style: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bubbles">Mjehurići (Bubbles)</SelectItem>
                    <SelectItem value="geometric">Geometrijski</SelectItem>
                    <SelectItem value="minimal">Minimalan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Odustani</Button>
              </DialogClose>
              <Button onClick={handleEdit}>Spremi</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default AdminTenants;
