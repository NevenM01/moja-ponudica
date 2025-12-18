import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Plus, TrendingUp } from 'lucide-react';
import AppLayout from '@/components/AppLayout';

const Dashboard = () => {
  const { user } = useAuth();
  const [offerCount, setOfferCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    const { count, error } = await supabase
      .from('offers')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user?.id);

    if (!error) {
      setOfferCount(count || 0);
    }
    setLoading(false);
  };

  return (
    <AppLayout>
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground text-sm">Pregled vaše aktivnosti</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Ukupno ponuda
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {loading ? '...' : offerCount}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Kreiranih ponuda
              </p>
            </CardContent>
          </Card>

          {/* Placeholder za buduće analitike */}
          <Card className="opacity-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Ukupna vrijednost
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">—</div>
              <p className="text-xs text-muted-foreground mt-1">
                Uskoro dostupno
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Brze akcije</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Link to="/nova-ponuda">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nova ponuda
              </Button>
            </Link>
            <Link to="/ponude">
              <Button variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Pregledaj ponude
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Dashboard;