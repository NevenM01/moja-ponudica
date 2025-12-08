import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import AppLayout from '@/components/AppLayout';

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
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<CompanyProfile>({
    naziv_firme: '',
    oib: '',
    adresa: '',
    iban: '',
    email: '',
    telefon: '',
    logo_url: '',
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    const { data, error } = await supabase
      .from('company_profiles')
      .select('*')
      .eq('user_id', user?.id)
      .maybeSingle();

    if (data) {
      setProfile(data);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (profile.id) {
        const { error } = await supabase
          .from('company_profiles')
          .update({
            naziv_firme: profile.naziv_firme,
            oib: profile.oib,
            adresa: profile.adresa,
            iban: profile.iban,
            email: profile.email,
            telefon: profile.telefon,
            logo_url: profile.logo_url,
          })
          .eq('id', profile.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('company_profiles').insert({
          user_id: user?.id,
          naziv_firme: profile.naziv_firme,
          oib: profile.oib,
          adresa: profile.adresa,
          iban: profile.iban,
          email: profile.email,
          telefon: profile.telefon,
          logo_url: profile.logo_url,
        });
        if (error) throw error;
      }

      toast({ title: 'Profil spremljen!' });
      navigate('/');
    } catch (error: any) {
      toast({ title: 'Greška', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Profil tvrtke</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="naziv_firme">Naziv firme *</Label>
                  <Input
                    id="naziv_firme"
                    value={profile.naziv_firme}
                    onChange={(e) => setProfile({ ...profile, naziv_firme: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="oib">OIB *</Label>
                  <Input
                    id="oib"
                    value={profile.oib}
                    onChange={(e) => setProfile({ ...profile, oib: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="adresa">Adresa *</Label>
                  <Input
                    id="adresa"
                    value={profile.adresa}
                    onChange={(e) => setProfile({ ...profile, adresa: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="iban">IBAN</Label>
                  <Input
                    id="iban"
                    value={profile.iban}
                    onChange={(e) => setProfile({ ...profile, iban: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefon">Telefon</Label>
                  <Input
                    id="telefon"
                    value={profile.telefon}
                    onChange={(e) => setProfile({ ...profile, telefon: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="logo_url">Logo URL</Label>
                  <Input
                    id="logo_url"
                    value={profile.logo_url}
                    onChange={(e) => setProfile({ ...profile, logo_url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
              </div>
              <Button type="submit" disabled={loading}>
                {loading ? 'Spremanje...' : 'Spremi profil'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Profile;
