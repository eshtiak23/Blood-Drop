import { Link } from "react-router-dom";
import { Droplet, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer style={{ borderTop: "1px solid var(--border)", background: "var(--bg-card)", padding: "48px 0 24px" }}>
      <div className="container">
        <div className="grid grid-4" style={{ gap: 32 }}>
          <div>
            <Link to="/" style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <img src="/Logo.png" alt="LifeDrop" style={{ height: 32, width: 32, objectFit: "contain", borderRadius: 6 }} />
              <span style={{ fontSize: 18, fontWeight: 800 }}>Life<span style={{ color: "#DC2626" }}>Drop</span></span>
            </Link>
            <p style={{ fontSize: 14, color: "var(--text-secondary)", marginTop: 12 }}>Connecting blood donors with people in need. Together, we save lives.</p>
          </div>
          <div>
            <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Quick Links</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <Link to="/donors" style={{ fontSize: 14, color: "var(--text-secondary)" }}>Find Donors</Link>
              <Link to="/requests" style={{ fontSize: 14, color: "var(--text-secondary)" }}>Blood Requests</Link>
              <Link to="/register" style={{ fontSize: 14, color: "var(--text-secondary)" }}>Become a Donor</Link>
            </div>
          </div>
          <div>
            <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Support</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <a href="#" style={{ fontSize: 14, color: "var(--text-secondary)" }}>Help Center</a>
              <a href="#" style={{ fontSize: 14, color: "var(--text-secondary)" }}>Privacy Policy</a>
              <a href="#" style={{ fontSize: 14, color: "var(--text-secondary)" }}>Terms of Service</a>
            </div>
          </div>
          <div>
            <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Contact</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <span style={{ fontSize: 14, color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 6 }}><Mail size={14} /> info@lifedrop.com</span>
              <span style={{ fontSize: 14, color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 6 }}><Phone size={14} /> +880 1700-000000</span>
              <span style={{ fontSize: 14, color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 6 }}><MapPin size={14} /> Dhaka, Bangladesh</span>
            </div>
          </div>
        </div>
        <div className="separator" style={{ margin: "24px 0" }} />
        <p style={{ textAlign: "center", fontSize: 13, color: "var(--text-muted)" }}>© {new Date().getFullYear()} LifeDrop. All rights reserved.</p>
      </div>
    </footer>
  );
}
