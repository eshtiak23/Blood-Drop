/**
 * SettingsPage - User settings page with theme toggle (light/dark/system) and logout.
 */
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { Moon, Sun, Lock, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <div className="container" style={{ padding: "32px 20px", maxWidth: 640 }}>
      <h1 style={{ fontSize: 24, fontWeight: 800 }}>Settings</h1>
      <p style={{ color: "var(--text-secondary)", marginTop: 4 }}>Manage your account settings</p>

      <div className="card animate-fadeIn" style={{ marginTop: 20 }}>
        <div className="card-body">
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}><Moon size={16} /> Appearance</h3>
          {/* Theme selector - toggles between light, dark, and system mode */}
          <div style={{ display: "flex", gap: 8 }}>
            {["light", "dark", "system"].map((t) => (
              <button key={t} className={`btn ${theme === t ? "btn-primary" : "btn-secondary"} btn-sm`} onClick={() => setTheme(t)} style={{ textTransform: "capitalize" }}>{t}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="card animate-fadeIn" style={{ marginTop: 16 }}>
        <div className="card-body">
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}><Lock size={16} /> Account</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 14 }}>
            <div style={{ padding: 16, borderRadius: "var(--radius-sm)", border: "1px solid var(--border-light)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div><div style={{ fontWeight: 600 }}>Logout</div><div style={{ fontSize: 13, color: "var(--text-secondary)" }}>Sign out of your account</div></div>
              {/* Logout clears auth state and redirects to home */}
              <button className="btn btn-secondary btn-sm" onClick={() => { logout(); navigate("/"); }}><LogOut size={14} /> Logout</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
