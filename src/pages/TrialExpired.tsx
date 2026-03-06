import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogOut, Clock } from 'lucide-react';

const TrialExpired = () => {
  const { signOut } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <CardTitle>Probni period je istekao</CardTitle>
              <CardDescription>
                Vaš probni period za korištenje aplikacije je završio.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Za nastavak korištenja obratite se administratoru. Možete se odjaviti u nastavku.
          </p>
          <Button onClick={() => signOut()} variant="outline" className="w-full">
            <LogOut className="h-4 w-4 mr-2" />
            Odjava
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default TrialExpired;
