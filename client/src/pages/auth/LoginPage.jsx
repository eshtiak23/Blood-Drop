import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Heart, Eye, EyeOff, Loader2 } from "lucide-react";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError("");
    try { await login(form.email, form.password); navigate("/dashboard"); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: "calc(100vh - 64px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div className="card animate-fadeIn" style={{ maxWidth: 420, width: "100%" }}>
        <div className="card-body">
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(239,68,68,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto" }}>
              <Heart size={24} color="#DC2626" fill="#DC2626" />
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginTop: 12 }}>Welcome Back</h2>
            <p style={{ fontSize: 14, color: "var(--text-secondary)", marginTop: 4 }}>Sign in to your LifeDrop account</p>
          </div>

          <form onSubmit={handleSubmit}>
            {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}

            <div className="input-group" style={{ marginBottom: 16 }}>
              <label>Email</label>
              <input className="input" type="email" placeholder="you@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>

            <div className="input-group" style={{ marginBottom: 20 }}>
              <label>Password</label>
              <div style={{ position: "relative" }}>
                <input className="input" type={show ? "text" : "password"} placeholder="••••••••" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required style={{ paddingRight: 40 }} />
                <button type="button" onClick={() => setShow(!show)} style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", padding: 4 }}>
                  {show ? <EyeOff size={18} color="var(--text-muted)" /> : <Eye size={18} color="var(--text-muted)" />}
                </button>
              </div>
            </div>

            <button className="btn btn-primary btn-lg" type="submit" disabled={loading} style={{ width: "100%" }}>
              {loading && <Loader2 size={18} className="animate-pulse" />} Sign In
            </button>

            <p style={{ textAlign: "center", fontSize: 14, marginTop: 20, color: "var(--text-secondary)" }}>
              Don't have an account? <Link to="/register" style={{ color: "var(--red)", fontWeight: 600 }}>Register</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
