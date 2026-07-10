/**
 * RegisterPage – New user sign-up for the LifeDrop blood donor app.
 * 
 * Everyone is both a blood donor AND a seeker — no role selection needed.
 * All users provide blood group, district, and area during registration.
 * On success the account is created via AuthContext.register() and the user
 * is redirected to /dashboard.
 */
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { BLOOD_GROUPS, DISTRICTS, AREAS } from "../../data/constants";
import { Heart, Loader2, Eye, EyeOff } from "lucide-react";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "", phone: "", bloodGroup: "", district: "", area: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Derive area options from the selected district (empty until a district is chosen)
  const areas = form.district ? (AREAS[form.district] || []) : [];

  // Validate passwords match, strip confirmPassword, then call AuthContext.register()
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirmPassword) { setError("Passwords don't match"); return; }
    setLoading(true);
    try {
      const { confirmPassword, ...data } = form;
      await register(data);
      navigate("/dashboard");
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  // Shorthand to update a single field in the form state
  const set = (k, v) => setForm({ ...form, [k]: v });

  return (
    <div style={{ minHeight: "calc(100vh - 64px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div className="card animate-fadeIn" style={{ maxWidth: 520, width: "100%" }}>
        <div className="card-body">
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(239,68,68,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto" }}>
              <Heart size={24} color="#DC2626" fill="#DC2626" />
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginTop: 12 }}>Create Account</h2>
            <p style={{ fontSize: 14, color: "var(--text-secondary)", marginTop: 4 }}>Join LifeDrop — donate blood and request when needed</p>
          </div>

          <form onSubmit={handleSubmit}>
            {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}

            <div className="grid grid-2" style={{ marginBottom: 16 }}>
              <div className="input-group"><label>Full Name</label><input className="input" placeholder="John Doe" value={form.name} onChange={(e) => set("name", e.target.value)} required /></div>
              <div className="input-group"><label>Phone</label><input className="input" placeholder="01XXXXXXXXX" value={form.phone} onChange={(e) => set("phone", e.target.value)} required /></div>
            </div>

            <div className="input-group" style={{ marginBottom: 16 }}>
              <label>Email</label>
              <input className="input" type="email" placeholder="you@example.com" value={form.email} onChange={(e) => set("email", e.target.value)} required />
            </div>

            <div className="grid grid-2" style={{ marginBottom: 16 }}>
              <div className="input-group"><label>Password</label>
                <div style={{ position: "relative" }}>
                  <input className="input" type={showPass ? "text" : "password"} placeholder="••••••••" value={form.password} onChange={(e) => set("password", e.target.value)} required style={{ paddingRight: 40 }} />
                  <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", padding: 4, background: "none", border: "none", cursor: "pointer" }}>
                    {showPass ? <EyeOff size={16} color="var(--text-muted)" /> : <Eye size={16} color="var(--text-muted)" />}
                  </button>
                </div>
              </div>
              <div className="input-group"><label>Confirm</label>
                <div style={{ position: "relative" }}>
                  <input className="input" type={showConfirm ? "text" : "password"} placeholder="••••••••" value={form.confirmPassword} onChange={(e) => set("confirmPassword", e.target.value)} required style={{ paddingRight: 40 }} />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", padding: 4, background: "none", border: "none", cursor: "pointer" }}>
                    {showConfirm ? <EyeOff size={16} color="var(--text-muted)" /> : <Eye size={16} color="var(--text-muted)" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Blood group, district, and area — shown for all users */}
            <div className="input-group" style={{ marginBottom: 16 }}>
              <label>Blood Group</label>
              <select className="input" value={form.bloodGroup} onChange={(e) => set("bloodGroup", e.target.value)}>
                <option value="">Select blood group</option>
                {BLOOD_GROUPS.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div className="grid grid-2" style={{ marginBottom: 20 }}>
              <div className="input-group">
                {/* Selecting a district resets the area field */}
                <label>District</label>
                <select className="input" value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value, area: "" })}>
                  <option value="">Select district</option>
                  {DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="input-group">
                <label>Area</label>
                <select className="input" value={form.area} onChange={(e) => set("area", e.target.value)} disabled={!form.district}>
                  <option value="">{form.district ? "Select area" : "Select district first"}</option>
                  {areas.map((a) => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
            </div>

            <button className="btn btn-primary btn-lg" type="submit" disabled={loading} style={{ width: "100%" }}>
              {loading && <Loader2 size={18} className="animate-pulse" />} Create Account
            </button>

            <p style={{ textAlign: "center", fontSize: 14, marginTop: 20, color: "var(--text-secondary)" }}>
              Already have an account? <Link to="/login" style={{ color: "var(--red)", fontWeight: 600 }}>Sign In</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
