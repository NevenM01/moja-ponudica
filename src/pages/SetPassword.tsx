import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Lock, Eye, EyeOff } from 'lucide-react';
const SetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  useEffect(() => {
    const checkSession = async () => {
      const {
        data: {
          session
        }
      } = await supabase.auth.getSession();
      if (session?.user) {
        setIsValidSession(true);
      } else {
        toast({
          title: 'Nevažeća sesija',
          description: 'Molimo koristite link iz pozivnice.',
          variant: 'destructive'
        });
        navigate('/login');
      }
      setCheckingSession(false);
    };
    checkSession();
  }, [navigate, toast]);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast({
        title: 'Greška',
        description: 'Lozinka mora imati najmanje 6 znakova.',
        variant: 'destructive'
      });
      return;
    }
    if (password !== confirmPassword) {
      toast({
        title: 'Greška',
        description: 'Lozinke se ne podudaraju.',
        variant: 'destructive'
      });
      return;
    }
    setLoading(true);
    try {
      const {
        error: updateError
      } = await supabase.auth.updateUser({
        password: password
      });
      if (updateError) throw updateError;

      // Get current user to update invitation status
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      if (user?.email && user?.id) {
        // Get pending invitation to read tenant_id before updating
        const { data: pendingInvitation } = await supabase
          .from('invitations')
          .select('id, tenant_id')
          .eq('email', user.email)
          .eq('status', 'pending')
          .maybeSingle();

        const {
          error: inviteError,
        } = await supabase.from('invitations').update({
          status: 'accepted',
          accepted_at: new Date().toISOString()
        }).eq('email', user.email).eq('status', 'pending');
        if (inviteError) {
          console.error('SetPassword - Error updating invitation:', inviteError);
        }

        // Automatically assign tenant to profile when invitation had tenant_id
        if (pendingInvitation?.tenant_id) {
          await supabase
            .from('profiles')
            .update({ tenant_id: pendingInvitation.tenant_id })
            .eq('id', user.id);
        }
      }
      toast({
        title: 'Uspješno!',
        description: 'Lozinka je postavljena. Molimo popunite profil vaše firme.'
      });
      navigate('/profil');
    } catch (error: any) {
      console.error('Error setting password:', error);
      toast({
        title: 'Greška',
        description: error.message || 'Došlo je do greške pri postavljanju lozinke.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  if (checkingSession) {
    return <div className="min-h-screen flex items-center justify-center bg-transparent">
        <p className="text-muted-foreground">Učitavanje...</p>
      </div>;
  }
  if (!isValidSession) {
    return null;
  }
  return <div className="min-h-screen flex items-center justify-center bg-transparent p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Postavi lozinku</CardTitle>
          <CardDescription>
            Dobrodošli! Postavite lozinku za vaš račun kako biste nastavili.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Nova lozinka</Label>
              <div className="relative">
                <Input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required minLength={6} placeholder="Unesite lozinku (min. 8 znakova)" />
                <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Potvrdi lozinku</Label>
              <div className="relative">
                <Input id="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Ponovite lozinku" required minLength={6} />
                <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                  {showConfirmPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                </Button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Postavljanje...' : 'Postavi lozinku'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>;
};
export default SetPassword;