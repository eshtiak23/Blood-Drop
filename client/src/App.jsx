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
 *   /chat          → Chat page (logged in)
 *   /login         → Login page (only logged-out users)
 *   /register      → Register page (only logged-out users)
 *   /dashboard     → User dashboard (must be logged in)
 *   /admin         → Admin panel (must be logged in as admin)
 *   *              → 404 Not Found page (any unmatched URL)
 */

import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { ChatProvider } from "./context/ChatContext";
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
import ChatPage from "./pages/chat/ChatPage";
import NotFoundPage from "./pages/NotFoundPage";
import DevelopersPage from "./pages/DevelopersPage";
import LeaderboardPage from "./pages/leaderboard/LeaderboardPage";
import LoadingAnimation from "./components/ui/LoadingAnimation";

// React Query client — manages data caching. staleTime=300000 means data is "fresh" for 5 minutes
const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 300000, retry: 1 } } });

/**
 * Protected — Only lets logged-in users see the page.
 * If not logged in, redirects to /login.
 * Shows a loading spinner while checking login status.
 */
function Protected({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <LoadingAnimation text="Checking your session" />;
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
 * Each page gets a fade-in transition when navigating.
 */
function PageTransition({ children }) {
  const location = useLocation();
  return (
    <div key={location.pathname} className="page-enter">
      {children}
    </div>
  );
}

function ScrollReveal() {
  const { pathname } = useLocation();
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    const timer = setTimeout(() => {
      document.querySelectorAll(".reveal:not(.revealed)").forEach((el) => observer.observe(el));
    }, 100);
    return () => { clearTimeout(timer); observer.disconnect(); };
  }, [pathname]);
  return null;
}

function AppContent() {
  const location = useLocation();
  const isChatPage = location.pathname.startsWith("/chat");

  return (
    <div style={{ height: isChatPage ? "100vh" : "auto", minHeight: "100vh", display: "flex", flexDirection: "column", overflow: isChatPage ? "hidden" : "visible" }}>
      {!isChatPage && <Navbar />}
      <ScrollReveal />
      <main style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minHeight: 0 }}>
        {isChatPage ? (
          <Routes>
            <Route path="/chat" element={<Protected><ChatPage /></Protected>} />
            <Route path="/chat/:userId" element={<Protected><ChatPage /></Protected>} />
          </Routes>
        ) : (
          <PageTransition>
            <Routes>
            {/* Public pages — anyone can visit */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/donors" element={<DonorSearchPage />} />
            <Route path="/donors/:id" element={<DonorProfilePage />} />
            <Route path="/developers" element={<DevelopersPage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />

            {/* Protected pages — must be logged in */}
            <Route path="/dashboard" element={<Protected><DashboardPage /></Protected>} />
            <Route path="/notifications" element={<Protected><NotificationsPage /></Protected>} />
            <Route path="/profile" element={<Protected><ProfilePage /></Protected>} />
            <Route path="/settings" element={<Protected><SettingsPage /></Protected>} />
            <Route path="/requests" element={<Protected><RequestListPage /></Protected>} />
            <Route path="/requests/:id" element={<Protected><RequestDetailPage /></Protected>} />
            <Route path="/requests/create" element={<Protected><CreateRequestPage /></Protected>} />
            <Route path="/bookmarks" element={<Protected><BookmarksPage /></Protected>} />

            {/* Public-only pages — redirect to dashboard if already logged in */}
            <Route path="/login" element={<Public><LoginPage /></Public>} />
            <Route path="/register" element={<Public><RegisterPage /></Public>} />

            {/* Admin-only page — must be logged in as admin */}
            <Route path="/admin" element={<AdminOnly><AdminDashboardPage /></AdminOnly>} />

            {/* Catch-all — shows 404 for any URL not listed above */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
          </PageTransition>
        )}
      </main>
      {!isChatPage && <Footer />}
    </div>
  );
}

/**
 * App — The outermost wrapper.
 * Provides routing (BrowserRouter), data fetching (QueryClientProvider),
 * theme control (ThemeProvider), authentication (AuthProvider),
 * and chat (ChatProvider) to all pages.
 */
export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Toaster position="top-right" toastOptions={{ duration: 3000, style: { fontSize: 14, fontWeight: 600, borderRadius: 12, padding: "12px 16px" }, success: { iconTheme: { primary: "#22C55E", secondary: "#fff" } }, error: { iconTheme: { primary: "#EF4444", secondary: "#fff" } } }} />
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <ChatProvider>
              <AppContent />
            </ChatProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}
