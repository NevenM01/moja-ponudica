import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import OfferList from "./pages/OfferList";
import NewOffer from "./pages/NewOffer";
import OfferDetail from "./pages/OfferDetail";
import EditOffer from "./pages/EditOffer";
import NotFound from "./pages/NotFound";

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

const AppRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Učitavanje...</div>;
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/" element={<ProtectedRoute><OfferList /></ProtectedRoute>} />
      <Route path="/profil" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/nova-ponuda" element={<ProtectedRoute><NewOffer /></ProtectedRoute>} />
      <Route path="/ponuda/:id" element={<ProtectedRoute><OfferDetail /></ProtectedRoute>} />
      <Route path="/ponuda/:id/uredi" element={<ProtectedRoute><EditOffer /></ProtectedRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
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
);

export default App;
