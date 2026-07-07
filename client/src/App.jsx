import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import LandingPage from "./pages/home/LandingPage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import DonorSearchPage from "./pages/donor/DonorSearchPage";
import DonorProfilePage from "./pages/donor/DonorProfilePage";
import RequestListPage from "./pages/blood-request/RequestListPage";
import RequestDetailPage from "./pages/blood-request/RequestDetailPage";
import CreateRequestPage from "./pages/blood-request/CreateRequestPage";
import DashboardPage from "./pages/dashboard/DashboardPage";
import NotificationsPage from "./pages/notifications/NotificationsPage";
import BookmarksPage from "./pages/bookmarks/BookmarksPage";
import ProfilePage from "./pages/settings/ProfilePage";
import SettingsPage from "./pages/settings/SettingsPage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import NotFoundPage from "./pages/NotFoundPage";

const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 300000, retry: 1 } } });

function Protected({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div style={{display:'flex',justifyContent:'center',alignItems:'center',height:'60vh'}}><div className="animate-pulse" style={{width:40,height:40,borderRadius:'50%',background:'var(--purple)'}}/></div>;
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function Public({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  return isAuthenticated ? <Navigate to="/dashboard" /> : children;
}

function AdminOnly({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user?.role === "admin" ? children : <Navigate to="/dashboard" />;
}

function AppContent() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar />
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/donors" element={<DonorSearchPage />} />
          <Route path="/donors/:id" element={<DonorProfilePage />} />
          <Route path="/requests" element={<RequestListPage />} />
          <Route path="/requests/:id" element={<RequestDetailPage />} />
          <Route path="/login" element={<Public><LoginPage /></Public>} />
          <Route path="/register" element={<Public><RegisterPage /></Public>} />
          <Route path="/dashboard" element={<Protected><DashboardPage /></Protected>} />
          <Route path="/notifications" element={<Protected><NotificationsPage /></Protected>} />
          <Route path="/profile" element={<Protected><ProfilePage /></Protected>} />
          <Route path="/settings" element={<Protected><SettingsPage /></Protected>} />
          <Route path="/requests/create" element={<Protected><CreateRequestPage /></Protected>} />
          <Route path="/bookmarks" element={<Protected><BookmarksPage /></Protected>} />
          <Route path="/admin" element={<AdminOnly><AdminDashboardPage /></AdminOnly>} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}
