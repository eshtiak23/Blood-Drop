/**
 * Navbar.jsx — Top Navigation Bar
 * 
 * The navigation bar that stays at the top of every page. It's "sticky" —
 * it stays visible when you scroll down.
 * 
 * What it shows depends on whether you're logged in:
 * - NOT logged in: Shows "Home", "Find Donors" links + Login/Register buttons
 * - Logged in: Shows the same links + notification bell + your avatar with a dropdown menu
 * 
 * Features:
 * - Active page glow effect (works in dark and light themes)
 * - Dark/Light theme toggle (moon/sun icon)
 * - Responsive: Desktop shows full nav, mobile shows a hamburger menu
 * - Glass effect: Semi-transparent background with blur
 */

import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { Menu, X, Bell, Moon, Sun, ChevronDown, LayoutDashboard, User, Settings, LogOut, Bookmark, LogIn, UserPlus } from "lucide-react";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  /** Log out and redirect to home page */
  const handleLogout = () => { logout(); navigate("/"); setMenuOpen(false); setOpen(false); };

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
              {/* Notification Bell — only shown on desktop */}
              <button className="hide-mobile notif-btn" onClick={() => navigate("/notifications")} style={{ position: "relative", padding: 8, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Bell size={18} />
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
                      <button className="dropdown-item" onClick={() => { navigate("/notifications"); setMenuOpen(false); }}><Bell size={16} /> Notifications</button>
                      <button className="dropdown-item" onClick={() => { navigate("/profile"); setMenuOpen(false); }}><User size={16} /> Profile</button>
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
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu — slides down when hamburger is clicked */}
      {open && (
        <div className="mobile-menu" style={{ borderTop: "1px solid var(--border)", padding: "8px 16px 16px" }}>
          {navLinks.map(([path, label]) => {
            const active = isActive(path);
            return (
              <Link key={path} to={path} onClick={() => setOpen(false)}
                className={active ? "nav-link active" : "nav-link"}
                style={{
                  display: "block", padding: "12px 14px", fontSize: 15, fontWeight: 500, borderRadius: 8,
                  color: active ? "var(--red)" : "var(--text)",
                  background: active ? "var(--red-light)" : "transparent",
                  transition: "all 0.2s",
                }}
              >{label}</Link>
            );
          })}
          <div style={{ borderTop: "1px solid var(--border)", marginTop: 8, paddingTop: 8 }}>
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" onClick={() => setOpen(false)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", fontSize: 15, fontWeight: 500, borderRadius: 8 }}><LayoutDashboard size={16} /> Dashboard</Link>
                <Link to="/notifications" onClick={() => setOpen(false)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", fontSize: 15, fontWeight: 500, borderRadius: 8 }}><Bell size={16} /> Notifications</Link>
                <Link to="/profile" onClick={() => setOpen(false)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", fontSize: 15, fontWeight: 500, borderRadius: 8 }}><User size={16} /> Profile</Link>
                <Link to="/settings" onClick={() => setOpen(false)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", fontSize: 15, fontWeight: 500, borderRadius: 8 }}><Settings size={16} /> Settings</Link>
                <button onClick={handleLogout} style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", fontSize: 15, fontWeight: 500, borderRadius: 8, color: "var(--red)", width: "100%" }}><LogOut size={16} /> Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setOpen(false)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", fontSize: 15, fontWeight: 500, borderRadius: 8 }}><LogIn size={16} /> Login</Link>
                <Link to="/register" onClick={() => setOpen(false)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", fontSize: 15, fontWeight: 500, borderRadius: 8 }}><UserPlus size={16} /> Register</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
