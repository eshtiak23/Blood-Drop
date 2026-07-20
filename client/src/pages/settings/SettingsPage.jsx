/**
 * SettingsPage — User settings and profile editing.
 * 
 * Allows users to:
 * - Upload/change profile photo (stored as base64 in localStorage)
 * - Edit name, phone, address, and bio
 * - Change theme (light/dark/system)
 * - Logout
 * 
 * Photo is converted to base64 and stored in the user object.
 * No server is needed — everything stays in the browser.
 */

import { useState, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { DISTRICTS, AREAS } from "../../data/constants";
import { Moon, Lock, LogOut, Camera, User, Save, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { validateName, validatePhone, validateRequired } from "../../utils/validate";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const { user, updateUser, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Profile editing form — initialized with current user data
  const [form, setForm] = useState({
    name: user?.name || "",
    nickname: user?.nickname || "",
    phone: user?.phone || "",
    district: user?.district || "",
    area: user?.area || "",
    bio: user?.bio || "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const areas = form.district ? (AREAS[form.district] || []) : [];

  /** Update a single form field */
  const set = (k, v) => setForm({ ...form, [k]: v });

  /**
   * Handle photo upload — converts the image to base64 and saves it.
   * Resizes to max 200x200 to keep localStorage usage reasonable.
   */
  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      // Create an image to resize before saving
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxSize = 200;
        let w = img.width, h = img.height;
        if (w > maxSize || h > maxSize) {
          if (w > h) { h = (h / w) * maxSize; w = maxSize; }
          else { w = (w / h) * maxSize; h = maxSize; }
        }
        canvas.width = w;
        canvas.height = h;
        canvas.getContext("2d").drawImage(img, 0, 0, w, h);
        const base64 = canvas.toDataURL("image/jpeg", 0.8);
        updateUser({ photo: base64 });
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  };

  /** Remove profile photo */
  const removePhoto = () => {
    updateUser({ photo: null });
    toast.success("Photo removed");
  };

  /** Save profile changes */
  const handleSave = () => {
    setFieldErrors({});
    const errs = {};
    const nameErr = validateName(form.name);
    const phoneErr = validatePhone(form.phone);
    const districtErr = validateRequired(form.district, "District");
    const areaErr = validateRequired(form.area, "Area");
    if (nameErr) errs.name = nameErr;
    if (phoneErr) errs.phone = phoneErr;
    if (districtErr) errs.district = districtErr;
    if (areaErr) errs.area = areaErr;
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      const firstErr = Object.values(errs)[0];
      toast.error(firstErr);
      return;
    }

    setSaving(true);
    setTimeout(() => {
      updateUser(form);
      setSaving(false);
      setSaved(true);
      toast.success("Profile updated!");
      setTimeout(() => setSaved(false), 2000);
    }, 400);
  };

  return (
    <div className="container" style={{ padding: "32px 20px", maxWidth: 640 }}>
      <h1 style={{ fontSize: 24, fontWeight: 800 }}>Settings</h1>
      <p style={{ color: "var(--text-secondary)", marginTop: 4 }}>Manage your account and profile</p>

      {/* ── Profile Photo Section ── */}
      <div className="card animate-fadeIn" style={{ marginTop: 20 }}>
        <div className="card-body">
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}><Camera size={16} /> Profile Photo</h3>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            {/* Current photo or initials avatar */}
            <div style={{ width: 80, height: 80, borderRadius: "50%", overflow: "hidden", background: "var(--red-light)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, fontWeight: 800, color: "var(--red)", flexShrink: 0, border: "3px solid var(--border-light)" }}>
              {user?.photo ? (
                <img src={user.photo} alt={user.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                user?.name?.charAt(0)?.toUpperCase()
              )}
            </div>
            <div>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: "none" }} />
              <button className="btn btn-primary btn-sm" onClick={() => fileInputRef.current?.click()}>
                <Camera size={14} /> Upload Photo
              </button>
              {user?.photo && (
                <button className="btn btn-ghost btn-sm" onClick={removePhoto} style={{ marginLeft: 8, color: "var(--red)" }}>
                  Remove
                </button>
              )}
              <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6 }}>JPG or PNG. Max 200x200px. Stored locally in your browser.</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Profile Info Section ── */}
      <div className="card animate-fadeIn" style={{ marginTop: 16 }}>
        <div className="card-body">
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}><User size={16} /> Profile Information</h3>

          <div className="grid grid-2" style={{ marginBottom: 16 }}>
            <div className="input-group">
              <label style={{ fontSize: 13, fontWeight: 500 }}>Full Name <span style={{ color: "var(--red)" }}>*</span></label>
              <input className="input" value={form.name} onChange={(e) => set("name", e.target.value)} />
              {fieldErrors.name && <div style={{ color: "#EF4444", fontSize: 12, marginTop: 4 }}>{fieldErrors.name}</div>}
            </div>
            <div className="input-group">
              <label style={{ fontSize: 13, fontWeight: 500 }}>Nickname</label>
              <input className="input" value={form.nickname} onChange={(e) => set("nickname", e.target.value)} placeholder="What should we call you?" />
            </div>
          </div>

          <div className="grid grid-2" style={{ marginBottom: 16 }}>
            <div className="input-group">
              <label style={{ fontSize: 13, fontWeight: 500 }}>Phone <span style={{ color: "var(--red)" }}>*</span></label>
              <input className="input" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
              {fieldErrors.phone && <div style={{ color: "#EF4444", fontSize: 12, marginTop: 4 }}>{fieldErrors.phone}</div>}
            </div>
            <div className="input-group">
              <label style={{ fontSize: 13, fontWeight: 500 }}>District <span style={{ color: "var(--red)" }}>*</span></label>
              <select className="input" value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value, area: "" })}>
                <option value="">Select district</option>
                {DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
              {fieldErrors.district && <div style={{ color: "#EF4444", fontSize: 12, marginTop: 4 }}>{fieldErrors.district}</div>}
            </div>
          </div>

          <div className="grid grid-2" style={{ marginBottom: 16 }}>
            <div className="input-group">
              <label style={{ fontSize: 13, fontWeight: 500 }}>Area <span style={{ color: "var(--red)" }}>*</span></label>
              <select className="input" value={form.area} onChange={(e) => set("area", e.target.value)} disabled={!form.district}>
                <option value="">{form.district ? "Select area" : "Select district first"}</option>
                {areas.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
              {fieldErrors.area && <div style={{ color: "#EF4444", fontSize: 12, marginTop: 4 }}>{fieldErrors.area}</div>}
            </div>
            <div className="input-group">
              <label style={{ fontSize: 13, fontWeight: 500 }}>Bio (optional)</label>
              <textarea className="input" value={form.bio} onChange={(e) => set("bio", e.target.value)} rows={3} placeholder="Tell others about yourself..." />
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 size={16} className="animate-pulse" /> : <Save size={16} />}
              {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
            </button>
            {saved && <span style={{ color: "var(--green)", fontSize: 13, fontWeight: 600 }}>Profile updated successfully!</span>}
          </div>
        </div>
      </div>

      {/* ── Appearance Section ── */}
      <div className="card animate-fadeIn" style={{ marginTop: 16 }}>
        <div className="card-body">
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}><Moon size={16} /> Appearance</h3>
          <div style={{ display: "flex", gap: 8 }}>
            {["light", "dark", "system"].map((t) => (
              <button key={t} className={`btn ${theme === t ? "btn-primary" : "btn-secondary"} btn-sm`} onClick={() => setTheme(t)} style={{ textTransform: "capitalize" }}>{t}</button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Account Section ── */}
      <div className="card animate-fadeIn" style={{ marginTop: 16 }}>
        <div className="card-body">
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}><Lock size={16} /> Account</h3>
          <div style={{ padding: 16, borderRadius: "var(--radius-sm)", border: "1px solid var(--border-light)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>Logout</div>
              <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>Sign out of your account</div>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => { logout(); navigate("/"); toast.success("Logged out"); }}><LogOut size={14} /> Logout</button>
          </div>
        </div>
      </div>
    </div>
  );
}
