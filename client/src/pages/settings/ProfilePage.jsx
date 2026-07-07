import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { BLOOD_GROUP_COLORS } from "../../data/constants";
import { Mail, Phone, MapPin, Calendar, Droplets, Heart, Shield, Edit, Clock } from "lucide-react";

export default function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  if (!user) return null;
  const c = BLOOD_GROUP_COLORS[user.bloodGroup] || {};

  return (
    <div className="container" style={{ padding: "32px 20px", maxWidth: 800 }}>
      <h1 style={{ fontSize: 24, fontWeight: 800 }}>My Profile</h1>

      <div className="card animate-fadeIn" style={{ marginTop: 20 }}>
        <div className="card-body">
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "start" }}>
            <div className="avatar avatar-xl" style={{ background: c.bg || "var(--purple-light)", color: c.text || "var(--purple)" }}>{user.name?.charAt(0)?.toUpperCase()}</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <h2 style={{ fontSize: 22, fontWeight: 700 }}>{user.name}</h2>
                {user.isVerified && <span className="badge badge-green"><Shield size={12} /> Verified</span>}
              </div>
              <div style={{ fontSize: 14, color: "var(--text-secondary)", textTransform: "capitalize" }}>{user.role}</div>
              {user.bloodGroup && <span className="badge" style={{ background: c.bg, color: c.text, marginTop: 8, fontSize: 14, padding: "6px 16px" }}>{user.bloodGroup}</span>}
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate("/settings")}><Edit size={14} /> Edit</button>
          </div>

          <div className="separator" style={{ margin: "24px 0" }} />

          <div className="grid grid-2">
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Personal Info</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 14, color: "var(--text-secondary)" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}><Mail size={14} /> {user.email}</span>
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}><Phone size={14} /> {user.phone}</span>
                {user.district && <span style={{ display: "flex", alignItems: "center", gap: 8 }}><MapPin size={14} /> {user.area}, {user.district}</span>}
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}><Calendar size={14} /> Since {new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Donation Info</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 14, color: "var(--text-secondary)" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}><Droplets size={14} /> {user.totalDonations || 0} total donations</span>
                <span style={{ display: "flex", alignItems: "center", gap: 8, color: user.isAvailable ? "#059669" : "var(--text-muted)" }}><Heart size={14} /> {user.isAvailable ? "Available" : "Unavailable"}</span>
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}><Clock size={14} /> Last: {user.lastDonationDate ? new Date(user.lastDonationDate).toLocaleDateString() : "Never"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
