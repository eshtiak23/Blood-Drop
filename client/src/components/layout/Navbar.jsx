import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { Droplet, Menu, X, Bell, Moon, Sun, ChevronDown, LayoutDashboard, User, Settings, LogOut, Bookmark, LogIn, UserPlus } from "lucide-react";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => { logout(); navigate("/"); setMenuOpen(false); setOpen(false); };

  return (
    <header className="glass" style={{ position: "sticky", top: 0, zIndex: 50, borderBottom: "1px solid var(--border)" }}>
      <div className="container" style={{ display: "flex", height: 64, alignItems: "center", justifyContent: "space-between" }}>
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <img src="/Logo.png" alt="LifeDrop" style={{ height: 36, width: 36, objectFit: "contain", borderRadius: 8 }} />
          <span style={{ fontSize: 20, fontWeight: 800 }}>Life<span style={{ color: "#DC2626" }}>Drop</span></span>
        </Link>

        <nav style={{ display: "flex", gap: 28 }} className="desktop-nav">
          {[["/", "Home"], ["/donors", "Find Donors"], ["/requests", "Requests"]].map(([h, l]) => (
            <Link key={h} to={h} style={{ fontSize: 14, fontWeight: 500, color: "var(--text-secondary)", transition: "color 0.2s" }}
              onMouseEnter={(e) => e.target.style.color = "var(--red)"}
              onMouseLeave={(e) => e.target.style.color = "var(--text-secondary)"}
            >{l}</Link>
          ))}
        </nav>

        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} style={{ padding: 8, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {isAuthenticated ? (
            <>
              <button className="hide-mobile" onClick={() => navigate("/notifications")} style={{ position: "relative", padding: 8, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Bell size={18} />
              </button>
              <div className="dropdown">
                <button onClick={() => setMenuOpen(!menuOpen)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 8px", borderRadius: 8, transition: "background 0.2s" }}>
                  <div className="avatar avatar-sm">{user?.name?.charAt(0)?.toUpperCase()}</div>
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
                      {user?.role === "donor" && <button className="dropdown-item" onClick={() => { navigate("/bookmarks"); setMenuOpen(false); }}><Bookmark size={16} /> Bookmarks</button>}
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

          <button className="mobile-menu-btn" onClick={() => setOpen(!open)} style={{ padding: 8, borderRadius: 8, display: "none", alignItems: "center", justifyContent: "center" }}>
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="mobile-menu" style={{ borderTop: "1px solid var(--border)", padding: "8px 16px 16px" }}>
          {[["/", "Home"], ["/donors", "Find Donors"], ["/requests", "Requests"]].map(([h, l]) => (
            <Link key={h} to={h} onClick={() => setOpen(false)} style={{ display: "block", padding: "12px 14px", fontSize: 15, fontWeight: 500, borderRadius: 8 }}>{l}</Link>
          ))}
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
