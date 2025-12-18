import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import AppLayout from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import { ArrowLeft, Users, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { hr } from 'date-fns/locale';
import { toast } from 'sonner';

interface UserProfile {
  id: string;
  email: string | null;
  created_at: string;
  last_sign_in_at: string | null;
  offer_count: number;
}

const AdminUsers = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  const fetchUsers = async () => {
    // Fetch profiles
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
    fetchUsers();
  }, []);

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
            <Users className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Korisnici</h1>
          </div>
        </div>

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
                          <div className="space-y-2">
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
