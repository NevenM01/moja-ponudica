import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import AppLayout from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ArrowLeft, Mail, Send, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { hr } from 'date-fns/locale';
import { toast } from 'sonner';

interface Invitation {
  id: string;
  email: string;
  status: string;
  created_at: string;
  accepted_at: string | null;
}

const AdminInvitations = () => {
  const { user } = useAuth();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);

  const fetchInvitations = async () => {
    const { data, error } = await supabase
      .from('invitations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching invitations:', error);
    } else {
      setInvitations(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchInvitations();
  }, []);

  const handleSendInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error('Unesite email adresu');
      return;
    }

    // Check if already invited
    const existing = invitations.find(i => i.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      toast.error('Korisnik s tom email adresom je već pozvan');
      return;
    }

    setSending(true);

    const { error } = await supabase
      .from('invitations')
      .insert({
        email: email.toLowerCase().trim(),
        invited_by: user?.id
      });

    if (error) {
      console.error('Error creating invitation:', error);
      toast.error('Greška pri slanju pozivnice');
    } else {
      toast.success('Pozivnica je spremljena');
      setEmail('');
      fetchInvitations();
    }

    setSending(false);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return format(new Date(dateString), 'dd.MM.yyyy. HH:mm', { locale: hr });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Čeka</Badge>;
      case 'accepted':
        return <Badge variant="default">Prihvaćeno</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/admin">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <Mail className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Pozivnice</h1>
          </div>
        </div>

        {/* Info banner */}
        <Card className="border-amber-500/50 bg-amber-500/10">
          <CardContent className="pt-4">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-amber-700 dark:text-amber-400">
                  Email slanje nije konfigurirano
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Pozivnice se trenutno samo spremaju u bazu. Email će biti poslan nakon konfiguracije Resend API ključa.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Send invitation form */}
        <Card>
          <CardHeader>
            <CardTitle>Nova pozivnica</CardTitle>
            <CardDescription>
              Unesite email adresu korisnika kojeg želite pozvati
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSendInvitation} className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="email" className="sr-only">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@primjer.hr"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <Button type="submit" disabled={sending}>
                <Send className="h-4 w-4 mr-2" />
                {sending ? 'Slanje...' : 'Pošalji pozivnicu'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Invitations list */}
        <Card>
          <CardHeader>
            <CardTitle>Sve pozivnice ({invitations.length})</CardTitle>
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
                        <TableHead>Status</TableHead>
                        <TableHead>Poslano</TableHead>
                        <TableHead>Prihvaćeno</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invitations.map((invitation) => (
                        <TableRow key={invitation.id}>
                          <TableCell className="font-medium">{invitation.email}</TableCell>
                          <TableCell>{getStatusBadge(invitation.status)}</TableCell>
                          <TableCell>{formatDate(invitation.created_at)}</TableCell>
                          <TableCell>{formatDate(invitation.accepted_at)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile cards */}
                <div className="md:hidden space-y-3">
                  {invitations.map((invitation) => (
                    <Card key={invitation.id}>
                      <CardContent className="pt-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{invitation.email}</span>
                            {getStatusBadge(invitation.status)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Poslano: {formatDate(invitation.created_at)}
                          </div>
                          {invitation.accepted_at && (
                            <div className="text-sm text-muted-foreground">
                              Prihvaćeno: {formatDate(invitation.accepted_at)}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {invitations.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    Nema poslanih pozivnica
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

export default AdminInvitations;
