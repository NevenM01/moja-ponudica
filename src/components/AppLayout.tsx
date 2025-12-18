import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAdmin } from '@/hooks/useAdmin';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { FileText, User, Plus, Menu, LogOut, LayoutDashboard, Sun, Moon, Settings, ChevronDown, Shield, Building2 } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { supabase } from '@/integrations/supabase/client';
interface AppLayoutProps {
  children: React.ReactNode;
}
const AppLayout = ({
  children
}: AppLayoutProps) => {
  const {
    user,
    signOut
  } = useAuth();
  const {
    isAdmin
  } = useAdmin();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const {
    theme,
    setTheme
  } = useTheme();
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  useEffect(() => {
    const fetchCompanyProfile = async () => {
      if (!user) return;
      const {
        data
      } = await supabase.from('company_profiles').select('logo_url').eq('user_id', user.id).maybeSingle();
      if (data?.logo_url) {
        setLogoUrl(data.logo_url);
      }
    };
    fetchCompanyProfile();
  }, [user]);
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };
  const navItems = [{
    path: '/',
    label: 'Dashboard',
    icon: LayoutDashboard
  }, {
    path: '/ponude',
    label: 'Ponude',
    icon: FileText
  }, {
    path: '/nova-ponuda',
    label: 'Nova ponuda',
    icon: Plus
  }, ...(isAdmin ? [{
    path: '/admin',
    label: 'Admin',
    icon: Shield
  }] : [])];
  const NavLinks = ({
    mobile = false
  }: {
    mobile?: boolean;
  }) => <>
      {navItems.map(item => <Link key={item.path} to={item.path} onClick={() => mobile && setOpen(false)} className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${location.pathname === item.path ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'} ${mobile ? 'w-full' : ''}`}>
          <item.icon className="h-4 w-4" />
          {item.label}
        </Link>)}
    </>;
  return <div className="min-h-screen bg-transparent">
      <header className="border-b border-border sticky top-0 bg-background/80 backdrop-blur-sm z-50">
        <div className="max-w-[1900px] mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            {logoUrl ? <img src={logoUrl} alt="Logo" className="h-20 md:h-20 w-20 object-contain" /> : <div className="h-10 md:h-12 w-10 md:w-12 rounded bg-muted flex items-center justify-center">
                <Building2 className="h-5 md:h-6 w-5 md:w-6 text-muted-foreground" />
              </div>}
            <div className="flex flex-col">
              <span className="text-[8px] text-muted-foreground leading-tight">powered by</span>
              <span className="text-xs font-medium text-foreground leading-tight">MojaPonudica</span>
            </div>
          </Link>

          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center gap-2">
            <NavLinks />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <User className="h-4 w-4 mr-2" />
                  Moj račun
                  <ChevronDown className="h-4 w-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={toggleTheme}>
                  {theme === 'dark' ? <Sun className="h-4 w-4 mr-2" /> : <Moon className="h-4 w-4 mr-2" />}
                  {theme === 'dark' ? 'Svijetla tema' : 'Tamna tema'}
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/profil" className="flex items-center">
                    <Settings className="h-4 w-4 mr-2" />
                    Postavke
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut} className="text-destructive">
                  <LogOut className="h-4 w-4 mr-2" />
                  Odjava
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
                <Button variant="outline" onClick={toggleTheme} className="w-full mt-4">
                  {theme === 'dark' ? <Sun className="h-4 w-4 mr-2" /> : <Moon className="h-4 w-4 mr-2" />}
                  {theme === 'dark' ? 'Svijetla tema' : 'Tamna tema'}
                </Button>
                <Link to="/profil" onClick={() => setOpen(false)} className="flex items-center gap-2 w-full px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted">
                  <Settings className="h-4 w-4" />
                  Postavke
                </Link>
                <Button variant="outline" onClick={() => {
                signOut();
                setOpen(false);
              }} className="w-full">
                  <LogOut className="h-4 w-4 mr-2" />
                  Odjava
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>
      <main className="max-w-[1900px] mx-auto px-4 py-4 md:py-6">{children}</main>
    </div>;
};
export default AppLayout;