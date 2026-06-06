import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) throw error;

      // Auto-accept pending invitation and assign tenant to profile
      if (data.user?.email && data.user?.id) {
        const { data: pendingInvitation } = await supabase
          .from('invitations')
          .select('id, tenant_id')
          .eq('email', data.user.email)
          .eq('status', 'pending')
          .maybeSingle();

        await supabase.from('invitations').update({
          status: 'accepted',
          accepted_at: new Date().toISOString()
        }).eq('email', data.user.email).eq('status', 'pending');

        if (pendingInvitation?.tenant_id) {
          await supabase
            .from('profiles')
            .update({ tenant_id: pendingInvitation.tenant_id })
            .eq('id', data.user.id);
        }
      }
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
    if (!email) {
      toast({
        title: 'Greška',
        description: 'Unesite email adresu',
        variant: 'destructive'
      });
      return;
    }
    setResetLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/postavi-lozinku`
      });
      if (error) throw error;
      toast({
        title: 'Uspjeh',
        description: 'Ako postoji račun s tom email adresom, poslan je link za resetiranje lozinke'
      });
      setResetMode(false);
    } catch (error: any) {
      toast({
        title: 'Greška',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">MojaPonudica</CardTitle>
          <CardDescription>
            {resetMode ? 'Resetirajte svoju lozinku' : 'Prijavite se u svoj račun'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {resetMode ? (
            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="Email"
                />
              </div>
              <Button type="submit" className="w-full" disabled={resetLoading}>
                {resetLoading ? 'Slanje...' : 'Pošalji link za reset'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setResetMode(false)}
              >
                Natrag na prijavu
              </Button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="Email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Lozinka</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="Lozinka"
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Učitavanje...' : 'Prijavi se'}
              </Button>
              <Button
                type="button"
                variant="link"
                className="w-full"
                onClick={() => setResetMode(true)}
              >
                Zaboravili ste lozinku?
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;