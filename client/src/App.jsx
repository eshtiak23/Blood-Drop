/**
 * App.jsx — Root Application Component
 * 
 * This is the main "brain" of the app. It does three things:
 * 1. Sets up page routing (which page shows for which URL)
 * 2. Wraps everything in "providers" that give all pages access to theme, auth, and data
 * 3. Defines three security wrappers that control who can see which pages
 * 
 * URL Routing:
 *   /              → Home page (anyone)
 *   /donors        → Find blood donors (anyone)
 *   /requests      → Blood request list (anyone)
 *   /login         → Login page (only logged-out users)
 *   /register      → Register page (only logged-out users)
 *   /dashboard     → User dashboard (must be logged in)
 *   /admin         → Admin panel (must be logged in as admin)
 *   *              → 404 Not Found page (any unmatched URL)
 */

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

// React Query client — manages data caching. staleTime=300000 means data is "fresh" for 5 minutes
const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 300000, retry: 1 } } });

/**
 * Protected — Only lets logged-in users see the page.
 * If not logged in, redirects to /login.
 * Shows a loading spinner while checking login status.
 */
function Protected({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div style={{display:'flex',justifyContent:'center',alignItems:'center',height:'60vh'}}><div className="animate-pulse" style={{width:40,height:40,borderRadius:'50%',background:'var(--purple)'}}/></div>;
  return isAuthenticated ? children : <Navigate to="/login" />;
}

/**
 * Public — Only lets logged-out users see the page (like Login/Register).
 * If already logged in, redirects to /dashboard.
 */
function Public({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  return isAuthenticated ? <Navigate to="/dashboard" /> : children;
}

/**
 * AdminOnly — Only lets users with the "admin" role see the page.
 * If not admin, redirects to /dashboard.
 */
function AdminOnly({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user?.role === "admin" ? children : <Navigate to="/dashboard" />;
}

/**
 * AppContent — The actual page layout.
 * Navbar stays at the top, Footer at the bottom, and pages load in the middle.
 */
function AppContent() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar />
      <main style={{ flex: 1 }}>
        <Routes>
          {/* Public pages — anyone can visit */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/donors" element={<DonorSearchPage />} />
          <Route path="/donors/:id" element={<DonorProfilePage />} />
          <Route path="/requests" element={<RequestListPage />} />
          <Route path="/requests/:id" element={<RequestDetailPage />} />

          {/* Public-only pages — redirect to dashboard if already logged in */}
          <Route path="/login" element={<Public><LoginPage /></Public>} />
          <Route path="/register" element={<Public><RegisterPage /></Public>} />

          {/* Protected pages — must be logged in */}
          <Route path="/dashboard" element={<Protected><DashboardPage /></Protected>} />
          <Route path="/notifications" element={<Protected><NotificationsPage /></Protected>} />
          <Route path="/profile" element={<Protected><ProfilePage /></Protected>} />
          <Route path="/settings" element={<Protected><SettingsPage /></Protected>} />
          <Route path="/requests/create" element={<Protected><CreateRequestPage /></Protected>} />
          <Route path="/bookmarks" element={<Protected><BookmarksPage /></Protected>} />

          {/* Admin-only page — must be logged in as admin */}
          <Route path="/admin" element={<AdminOnly><AdminDashboardPage /></AdminOnly>} />

          {/* Catch-all — shows 404 for any URL not listed above */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

/**
 * App — The outermost wrapper.
 * Provides routing (BrowserRouter), data fetching (QueryClientProvider),
 * theme control (ThemeProvider), and authentication (AuthProvider) to all pages.
 */
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
