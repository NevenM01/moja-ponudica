import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Dashboard from "./pages/Dashboard";
import OfferList from "./pages/OfferList";
import NewOffer from "./pages/NewOffer";
import OfferDetail from "./pages/OfferDetail";
import EditOffer from "./pages/EditOffer";
import EditTemplate from "./pages/EditTemplate";
import OfferPreview from "./pages/OfferPreview";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminInvitations from "./pages/admin/AdminInvitations";
import SetPassword from "./pages/SetPassword";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Učitavanje...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();
  
  if (authLoading || adminLoading) {
    return <div className="min-h-screen flex items-center justify-center">Učitavanje...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

const AppRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Učitavanje...</div>;
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/postavi-lozinku" element={<SetPassword />} />
      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/ponude" element={<ProtectedRoute><OfferList /></ProtectedRoute>} />
      <Route path="/profil" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/nova-ponuda" element={<ProtectedRoute><NewOffer /></ProtectedRoute>} />
      <Route path="/ponuda/:id" element={<ProtectedRoute><OfferDetail /></ProtectedRoute>} />
      <Route path="/ponuda/:id/uredi" element={<ProtectedRoute><EditOffer /></ProtectedRoute>} />
      <Route path="/predlozak/:id/uredi" element={<ProtectedRoute><EditTemplate /></ProtectedRoute>} />
      <Route path="/p/:token" element={<OfferPreview />} />
      
      {/* Admin routes */}
      <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      <Route path="/admin/korisnici" element={<AdminRoute><AdminUsers /></AdminRoute>} />
      <Route path="/admin/pozivnice" element={<AdminRoute><AdminInvitations /></AdminRoute>} />
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
