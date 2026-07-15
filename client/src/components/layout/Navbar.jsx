/**
 * Navbar.jsx — Top Navigation Bar
 * 
 * The navigation bar that stays at the top of every page. It's "sticky" —
 * it stays visible when you scroll down.
 * 
 * What it shows depends on whether you're logged in:
 * - NOT logged in: Shows "Home", "Find Donors" links + Login/Register buttons
 * - Logged in: Shows the same links + chat + notification bell + your avatar with a dropdown menu
 * 
 * Features:
 * - Active page glow effect (works in dark and light themes)
 * - Dark/Light theme toggle (moon/sun icon)
 * - Responsive: Desktop shows full nav, mobile shows a hamburger menu
 * - Glass effect: Semi-transparent background with blur
 * - Chat unread badge (red circle with count)
 */

import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { useChat } from "../../context/ChatContext";
import { X, Bell, Moon, Sun, ChevronDown, LayoutDashboard, Settings, LogOut, Bookmark, LogIn, UserPlus, MessageCircle, Home, Users, AlertCircle, Droplets } from "lucide-react";
import api from "../../services/api";
import toast from "react-hot-toast";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { unreadTotal } = useChat();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isClosing, setIsClosing] = useState(false);

  /** Close overlay with exit animation */
  const closeOverlay = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setOpen(false);
      setIsClosing(false);
    }, 250);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchCount = () => api.get("/notifications").then((res) => setUnreadCount(res.data.notifications.filter((n) => !n.isRead).length)).catch(() => {});
    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // Close overlay on Escape key
  useEffect(() => {
    if (!open) return;
    const handleEsc = (e) => { if (e.key === "Escape") closeOverlay(); };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [open, closeOverlay]);

  // Lock body scroll when overlay is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  /** Log out and redirect to home page */
  const handleLogout = () => { logout(); navigate("/"); closeOverlay(); setMenuOpen(false); toast.success("Logged out"); };

  /** Check if a nav link is active (matches current path) */
  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  /** Navigation links with their paths */
  const navLinks = [
    ["/", "Home"],
    ["/donors", "Find Donors"],
    ["/requests", "Requests"],
  ];

  return (
    <header className="glass" style={{ position: "sticky", top: 0, zIndex: 50, borderBottom: "1px solid var(--border)" }}>
      <div className="container" style={{ display: "flex", height: 64, alignItems: "center", justifyContent: "space-between" }}>
        
        {/* Logo + Brand Name */}
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <img src="/Logo.png" alt="LifeDrop" style={{ height: 36, width: 36, objectFit: "contain", borderRadius: 8 }} />
          <span style={{ fontSize: 20, fontWeight: 800 }}>Life<span style={{ color: "#DC2626" }}>Drop</span></span>
        </Link>

        {/* Desktop Navigation Links — hidden on mobile */}
        <nav style={{ display: "flex", gap: 4 }} className="desktop-nav">
          {navLinks.map(([path, label]) => {
            const active = isActive(path);
            return (
              <Link key={path} to={path} className={active ? "nav-link active" : "nav-link"}
                style={{
                  fontSize: 14, fontWeight: 500, padding: "8px 16px", borderRadius: 8,
                  transition: "all 0.3s ease", position: "relative",
                  color: active ? "var(--red)" : "var(--text-secondary)",
                  background: active ? "var(--red-light)" : "transparent",
                }}
              >{label}</Link>
            );
          })}
        </nav>

        {/* Right side: Theme toggle + User menu or Login/Register */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {/* Theme Toggle Button */}
          <button className="theme-toggle" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} style={{ padding: 8, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {isAuthenticated ? (
            <>
              {/* Chat Button — only shown on desktop */}
              <button className="hide-mobile" onClick={() => navigate("/chat")} style={{ position: "relative", padding: 8, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <MessageCircle size={18} />
                {unreadTotal > 0 && (
                  <span style={{ position: "absolute", top: 2, right: 2, width: 18, height: 18, borderRadius: "50%", background: "var(--red)", color: "#fff", fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid var(--bg-card)" }}>
                    {unreadTotal > 9 ? "9+" : unreadTotal}
                  </span>
                )}
              </button>

              {/* Notification Bell — only shown on desktop */}
              <button className="hide-mobile notif-btn" onClick={() => navigate("/notifications")} style={{ position: "relative", padding: 8, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span style={{ position: "absolute", top: 2, right: 2, width: 18, height: 18, borderRadius: "50%", background: "var(--red)", color: "#fff", fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid var(--bg-card)" }}>
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>
              
              {/* User Avatar Dropdown Menu */}
              <div className="dropdown">
                <button onClick={() => setMenuOpen(!menuOpen)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 8px", borderRadius: 8, transition: "background 0.2s" }}>
                  <div className="avatar avatar-sm" style={user?.photo ? { padding: 0, overflow: "hidden" } : {}}>
                    {user?.photo ? (
                      <img src={user.photo} alt={user.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      user?.name?.charAt(0)?.toUpperCase()
                    )}
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 500 }} className="desktop-nav">{user?.name?.split(" ")[0]}</span>
                  <ChevronDown size={14} className="desktop-nav" />
                </button>
                {menuOpen && (
                  <>
                    <div style={{ position: "fixed", inset: 0, zIndex: 99 }} onClick={() => setMenuOpen(false)} />
                    <div className="dropdown-menu" style={{ zIndex: 100, minWidth: 200 }}>
                      <button className="dropdown-item" onClick={() => { navigate("/dashboard"); setMenuOpen(false); }}><LayoutDashboard size={16} /> Dashboard</button>
                      <button className="dropdown-item" onClick={() => { navigate("/chat"); setMenuOpen(false); }}><MessageCircle size={16} /> Chat</button>
                      <button className="dropdown-item" onClick={() => { navigate("/notifications"); setMenuOpen(false); }}><Bell size={16} /> Notifications</button>
                      <button className="dropdown-item" onClick={() => { navigate("/bookmarks"); setMenuOpen(false); }}><Bookmark size={16} /> Bookmarks</button>
                      <button className="dropdown-item" onClick={() => { navigate("/settings"); setMenuOpen(false); }}><Settings size={16} /> Settings</button>
                      <div className="dropdown-sep" />
                      <button className="dropdown-item danger" onClick={handleLogout}><LogOut size={16} /> Logout</button>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <div className="desktop-nav" style={{ display: "flex", gap: 8 }}>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate("/login")}>Login</button>
              <button className="btn btn-primary btn-sm" onClick={() => navigate("/register")}>Register</button>
            </div>
          )}

          {/* Mobile Hamburger Menu Button */}
          <button className="mobile-menu-btn" onClick={() => setOpen(!open)} style={{ padding: 8, borderRadius: 8, display: "none", alignItems: "center", justifyContent: "center", color: "var(--text)" }}>
            <div className={`hamburger-morph ${open ? "open" : ""}`}>
              <span /><span /><span />
            </div>
          </button>
        </div>
      </div>

      {/* Full-Screen Mobile Overlay Menu */}
      {open && (
        <div className={`mobile-overlay ${isClosing ? "exit" : ""}`}>
          {/* Floating blood drops */}
          <div className="mobile-overlay-drop" />
          <div className="mobile-overlay-drop" />
          <div className="mobile-overlay-drop" />
          <div className="mobile-overlay-drop" />

          {/* Close button */}
          <button className="mobile-overlay-close" onClick={closeOverlay}>
            <X size={20} />
          </button>

          <div className="mobile-overlay-content">
            {/* User profile card (if authenticated) */}
            {isAuthenticated && user && (
              <div className="mobile-overlay-profile">
                <div className="mobile-overlay-avatar">
                  {user?.photo ? (
                    <img src={user.photo} alt={user.name} />
                  ) : (
                    user?.name?.charAt(0)?.toUpperCase()
                  )}
                </div>
                <div>
                  <div className="mobile-overlay-name">{user?.name}</div>
                  <div className="mobile-overlay-blood">
                    {user?.bloodGroup && (
                      <span style={{ color: "#EF4444", fontWeight: 600 }}>{user.bloodGroup}</span>
                    )}
                    {user?.bloodGroup && user?.district && " · "}
                    {user?.district}
                  </div>
                </div>
              </div>
            )}

            {/* Navigation links */}
            {navLinks.map(([path, label]) => {
              const active = isActive(path);
              const iconMap = { "/": Home, "/donors": Users, "/requests": AlertCircle };
              const Icon = iconMap[path] || Droplets;
              return (
                <Link
                  key={path}
                  to={path}
                  onClick={closeOverlay}
                  className={`mobile-overlay-link ${active ? "active" : ""}`}
                >
                  <Icon size={20} />
                  {label}
                </Link>
              );
            })}

            <div className="mobile-overlay-divider" />

            {/* Auth links */}
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" onClick={closeOverlay} className="mobile-overlay-link">
                  <LayoutDashboard size={20} />
                  Dashboard
                </Link>
                <Link to="/chat" onClick={closeOverlay} className="mobile-overlay-link">
                  <MessageCircle size={20} />
                  Chat
                  {unreadTotal > 0 && (
                    <span style={{ marginLeft: "auto", width: 22, height: 22, borderRadius: 11, background: "#EF4444", color: "#fff", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {unreadTotal > 9 ? "9+" : unreadTotal}
                    </span>
                  )}
                </Link>
                <Link to="/notifications" onClick={closeOverlay} className="mobile-overlay-link">
                  <Bell size={20} />
                  Notifications
                  {unreadCount > 0 && (
                    <span style={{ marginLeft: "auto", width: 22, height: 22, borderRadius: 11, background: "#EF4444", color: "#fff", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </Link>
                <Link to="/bookmarks" onClick={closeOverlay} className="mobile-overlay-link">
                  <Bookmark size={20} />
                  Bookmarks
                </Link>
                <Link to="/settings" onClick={closeOverlay} className="mobile-overlay-link">
                  <Settings size={20} />
                  Settings
                </Link>

                <div className="mobile-overlay-divider" />

                <button onClick={handleLogout} className="mobile-overlay-link" style={{ color: "#EF4444" }}>
                  <LogOut size={20} />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={closeOverlay} className="mobile-overlay-link">
                  <LogIn size={20} />
                  Login
                </Link>
                <Link to="/register" onClick={closeOverlay} className="mobile-overlay-link">
                  <UserPlus size={20} />
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
