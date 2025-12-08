import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { FileText, User, Plus, List, Menu, X, LogOut } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const { signOut } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const navItems = [
    { path: '/', label: 'Ponude', icon: List },
    { path: '/nova-ponuda', label: 'Nova ponuda', icon: Plus },
    { path: '/profil', label: 'Profil', icon: User },
  ];

  const NavLinks = ({ mobile = false }: { mobile?: boolean }) => (
    <>
      {navItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          onClick={() => mobile && setOpen(false)}
          className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
            location.pathname === item.path
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          } ${mobile ? 'w-full' : ''}`}
        >
          <item.icon className="h-4 w-4" />
          {item.label}
        </Link>
      ))}
    </>
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border sticky top-0 bg-background z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="text-lg md:text-xl font-bold text-foreground flex items-center gap-2">
            <FileText className="h-5 w-5 md:h-6 md:w-6" />
            <span className="hidden sm:inline">MojaPonudica</span>
            <span className="sm:hidden">Ponudica</span>
          </Link>

          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center gap-2">
            <NavLinks />
            <Button variant="outline" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Odjava
            </Button>
          </nav>

          {/* Mobile navigation */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <div className="flex flex-col gap-4 mt-8">
                <NavLinks mobile />
                <Button variant="outline" onClick={() => { signOut(); setOpen(false); }} className="w-full mt-4">
                  <LogOut className="h-4 w-4 mr-2" />
                  Odjava
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>
      <main className="container mx-auto px-4 py-4 md:py-6">{children}</main>
    </div>
  );
};

export default AppLayout;