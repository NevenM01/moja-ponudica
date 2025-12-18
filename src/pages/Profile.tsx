import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import AppLayout from '@/components/AppLayout';
import { Upload, X, Key } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
interface CompanyProfile {
  id?: string;
  naziv_firme: string;
  oib: string;
  adresa: string;
  iban: string;
  email: string;
  telefon: string;
  logo_url: string;
}
const Profile = () => {
  const {
    user
  } = useAuth();
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState<CompanyProfile>({
    naziv_firme: '',
    oib: '',
    adresa: '',
    iban: '',
    email: '',
    telefon: '',
    logo_url: ''
  });
  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);
  const fetchProfile = async () => {
    const {
      data,
      error
    } = await supabase.from('company_profiles').select('*').eq('user_id', user?.id).maybeSingle();
    if (data) {
      setProfile(data);
    }
  };
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Greška',
        description: 'Molimo odaberite sliku',
        variant: 'destructive'
      });
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: 'Greška',
        description: 'Slika mora biti manja od 2MB',
        variant: 'destructive'
      });
      return;
    }
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/logo.${fileExt}`;

      // Delete old logo if exists
      if (profile.logo_url) {
        const oldPath = profile.logo_url.split('/company-logos/')[1];
        if (oldPath) {
          await supabase.storage.from('company-logos').remove([oldPath]);
        }
      }
      const {
        error: uploadError
      } = await supabase.storage.from('company-logos').upload(fileName, file, {
        upsert: true
      });
      if (uploadError) throw uploadError;
      const {
        data: {
          publicUrl
        }
      } = supabase.storage.from('company-logos').getPublicUrl(fileName);
      setProfile({
        ...profile,
        logo_url: publicUrl
      });
      toast({
        title: 'Logo uploadan!'
      });
    } catch (error: any) {
      toast({
        title: 'Greška',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
    }
  };
  const handleRemoveLogo = async () => {
    if (!profile.logo_url || !user) return;
    setUploading(true);
    try {
      const path = profile.logo_url.split('/company-logos/')[1];
      if (path) {
        await supabase.storage.from('company-logos').remove([path]);
      }
      setProfile({
        ...profile,
        logo_url: ''
      });
      toast({
        title: 'Logo uklonjen'
      });
    } catch (error: any) {
      toast({
        title: 'Greška',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (profile.id) {
        const {
          error
        } = await supabase.from('company_profiles').update({
          naziv_firme: profile.naziv_firme,
          oib: profile.oib,
          adresa: profile.adresa,
          iban: profile.iban,
          email: profile.email,
          telefon: profile.telefon,
          logo_url: profile.logo_url
        }).eq('id', profile.id);
        if (error) throw error;
      } else {
        const {
          error
        } = await supabase.from('company_profiles').insert({
          user_id: user?.id,
          naziv_firme: profile.naziv_firme,
          oib: profile.oib,
          adresa: profile.adresa,
          iban: profile.iban,
          email: profile.email,
          telefon: profile.telefon,
          logo_url: profile.logo_url
        });
        if (error) throw error;
      }
      toast({
        title: 'Profil spremljen!'
      });
      navigate('/');
    } catch (error: any) {
      toast({
        title: 'Greška',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      toast({
        title: 'Greška',
        description: 'Unesite trenutnu lozinku',
        variant: 'destructive'
      });
      return;
    }
    if (newPassword.length < 6) {
      toast({
        title: 'Greška',
        description: 'Nova lozinka mora imati najmanje 6 znakova',
        variant: 'destructive'
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({
        title: 'Greška',
        description: 'Lozinke se ne podudaraju',
        variant: 'destructive'
      });
      return;
    }
    setPasswordLoading(true);
    try {
      // Verify current password by re-authenticating
      const {
        error: signInError
      } = await supabase.auth.signInWithPassword({
        email: user?.email || '',
        password: currentPassword
      });
      if (signInError) {
        toast({
          title: 'Greška',
          description: 'Trenutna lozinka nije ispravna',
          variant: 'destructive'
        });
        return;
      }

      // Update to new password
      const {
        error
      } = await supabase.auth.updateUser({
        password: newPassword
      });
      if (error) throw error;
      toast({
        title: 'Lozinka uspješno promijenjena!'
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast({
        title: 'Greška',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setPasswordLoading(false);
    }
  };
  return <AppLayout>
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Profil tvrtke</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="naziv_firme">Naziv firme *</Label>
                  <Input id="naziv_firme" value={profile.naziv_firme} onChange={e => setProfile({
                  ...profile,
                  naziv_firme: e.target.value
                })} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="oib">OIB *</Label>
                  <Input id="oib" value={profile.oib} onChange={e => setProfile({
                  ...profile,
                  oib: e.target.value
                })} required />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="adresa">Adresa *</Label>
                  <Input id="adresa" value={profile.adresa} onChange={e => setProfile({
                  ...profile,
                  adresa: e.target.value
                })} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="iban">IBAN</Label>
                  <Input id="iban" value={profile.iban} onChange={e => setProfile({
                  ...profile,
                  iban: e.target.value
                })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={profile.email} onChange={e => setProfile({
                  ...profile,
                  email: e.target.value
                })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefon">Telefon</Label>
                  <Input id="telefon" value={profile.telefon} onChange={e => setProfile({
                  ...profile,
                  telefon: e.target.value
                })} />
                </div>
                <div className="space-y-2">
                  <Label>Logo tvrtke</Label>
                  <div className="flex items-center gap-4">
                    {profile.logo_url ? <div className="relative">
                        <img src={profile.logo_url} alt="Logo" className="w-20 h-20 object-contain rounded border border-border" />
                        <button type="button" onClick={handleRemoveLogo} disabled={uploading} className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:opacity-80">
                          <X className="w-3 h-3" />
                        </button>
                      </div> : <div onClick={() => fileInputRef.current?.click()} className="w-20 h-20 border-2 border-dashed border-border rounded flex items-center justify-center cursor-pointer hover:border-primary transition-colors">
                        <Upload className="w-6 h-6 text-muted-foreground" />
                      </div>}
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                    {!profile.logo_url && <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                        {uploading ? 'Uploadanje...' : 'Odaberi sliku'}
                      </Button>}
                  </div>
                </div>
              </div>
              <Button type="submit" disabled={loading}>
                {loading ? 'Spremanje...' : 'Spremi profil'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Promjena lozinke
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="current_password">Trenutna lozinka</Label>
                  <Input id="current_password" type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required placeholder="Vaša trenutna lozinka" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new_password">Nova lozinka</Label>
                  <Input id="new_password" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required placeholder="Minimalno 8 znakova" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm_password">Potvrdi lozinku</Label>
                  <Input id="confirm_password" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Ponovi lozinku" required />
                </div>
              </div>
              <Button type="submit" variant="outline" disabled={passwordLoading}>
                {passwordLoading ? 'Spremanje...' : 'Promijeni lozinku'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>;
};
export default Profile;