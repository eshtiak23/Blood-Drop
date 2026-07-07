import { useNavigate } from "react-router-dom";
import { Home } from "lucide-react";

export default function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight: "calc(100vh - 64px)", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", padding: 20 }}>
      <div className="animate-fadeIn">
        <div style={{ fontSize: 80, fontWeight: 900, color: "var(--red)", lineHeight: 1 }}>404</div>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginTop: 12 }}>Page Not Found</h1>
        <p style={{ color: "var(--text-secondary)", marginTop: 8 }}>The page you're looking for doesn't exist.</p>
        <button className="btn btn-primary" style={{ marginTop: 24 }} onClick={() => navigate("/")}><Home size={16} /> Go Home</button>
      </div>
    </div>
  );
}
