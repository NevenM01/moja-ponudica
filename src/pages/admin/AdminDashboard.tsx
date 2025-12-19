import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import AppLayout from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Mail, FileText, Shield, Building2 } from 'lucide-react';

interface Stats {
  totalUsers: number;
  totalOffers: number;
  pendingInvitations: number;
  acceptedInvitations: number;
  totalTenants: number;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalOffers: 0,
    pendingInvitations: 0,
    acceptedInvitations: 0,
    totalTenants: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const [profilesRes, offersRes, invitationsRes, tenantsRes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('offers').select('id', { count: 'exact', head: true }),
        supabase.from('invitations').select('status'),
        supabase.from('tenants').select('id', { count: 'exact', head: true })
      ]);

      const pending = invitationsRes.data?.filter(i => i.status === 'pending').length || 0;
      const accepted = invitationsRes.data?.filter(i => i.status === 'accepted').length || 0;

      setStats({
        totalUsers: profilesRes.count || 0,
        totalOffers: offersRes.count || 0,
        pendingInvitations: pending,
        acceptedInvitations: accepted,
        totalTenants: tenantsRes.count || 0
      });
      setLoading(false);
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: 'Ukupno korisnika',
      value: stats.totalUsers,
      icon: Users,
      link: '/admin/korisnici'
    },
    {
      title: 'Tenanti / Brandovi',
      value: stats.totalTenants,
      icon: Building2,
      link: '/admin/tenanti'
    },
    {
      title: 'Ukupno ponuda',
      value: stats.totalOffers,
      icon: FileText,
      link: null
    },
    {
      title: 'Čekajuće pozivnice',
      value: stats.pendingInvitations,
      icon: Mail,
      link: '/admin/pozivnice'
    },
    {
      title: 'Prihvaćene pozivnice',
      value: stats.acceptedInvitations,
      icon: Mail,
      link: '/admin/pozivnice'
    }
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Shield className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Admin Panel</h1>
        </div>

        {loading ? (
          <div className="text-muted-foreground">Učitavanje...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((card) => (
              <Card key={card.title} className="hover:shadow-md transition-shadow">
                {card.link ? (
                  <Link to={card.link}>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        {card.title}
                      </CardTitle>
                      <card.icon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{card.value}</div>
                    </CardContent>
                  </Link>
                ) : (
                  <>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        {card.title}
                      </CardTitle>
                      <card.icon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{card.value}</div>
                    </CardContent>
                  </>
                )}
              </Card>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <Link to="/admin/korisnici">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Upravljanje korisnicima
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Pregledajte sve registrirane korisnike i njihovu aktivnost
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/admin/pozivnice">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Pozivnice
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Pošaljite pozivnice novim korisnicima i pratite status
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/admin/tenanti">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Tenanti / Brandovi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Upravljajte brandovima, bojama i dodjelom korisnika
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </AppLayout>
  );
};

export default AdminDashboard;
