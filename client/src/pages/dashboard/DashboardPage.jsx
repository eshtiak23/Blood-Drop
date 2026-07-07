/**
 * DashboardPage — Main user dashboard after login.
 * 
 * Shows a personalized welcome with profile card, stats, quick actions,
 * blood stock overview, and recent requests. Content changes based on
 * whether the user is a donor, seeker, or admin.
 * 
 * Profile photo is stored as base64 in localStorage (no server needed).
 */

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { searchRequests, getMyRequests } from "../../services/localStore";
import { BLOOD_GROUPS, BLOOD_GROUP_COLORS } from "../../data/constants";
import { Droplets, Heart, AlertCircle, Search, Plus, Users, MapPin, Phone, Mail, Shield, Clock, TrendingUp, Activity, ArrowRight, Calendar } from "lucide-react";

/** Returns theme-aware blood group badge colors */
function getBloodGroupColor(bloodGroup) {
  const c = BLOOD_GROUP_COLORS[bloodGroup];
  if (!c) return {};
  const isDark = document.documentElement.classList.contains("dark");
  return { bg: isDark ? c.darkBg : c.bg, text: isDark ? c.darkText : c.text };
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [nearbyRequests, setNearbyRequests] = useState([]);

  useEffect(() => {
    const all = searchRequests();
    // Count open requests per blood group for stock overview
    const stock = {};
    BLOOD_GROUPS.forEach((g) => { stock[g] = 0; });
    all.filter((r) => r.status === "open").forEach((r) => { stock[r.patientBloodGroup] = (stock[r.patientBloodGroup] || 0) + 1; });
    setStats(stock);

    // Show requests relevant to the user's role
    if (user?.role === "donor" && user?.district) {
      setNearbyRequests(all.filter((r) => r.district === user.district && r.status === "open").slice(0, 3));
    }
    if (user?.role === "seeker") {
      setNearbyRequests(getMyRequests(user._id).slice(0, 3));
    }
  }, [user]);

  const c = getBloodGroupColor(user?.bloodGroup);
  const bloodColor = BLOOD_GROUP_COLORS[user?.bloodGroup];

  return (
    <div className="container" style={{ padding: "32px 20px", maxWidth: 1100 }}>

      {/* ── Profile Card + Welcome ── */}
      <div className="card animate-fadeIn" style={{ overflow: "hidden" }}>
        {/* Red gradient banner */}
        <div style={{ height: 100, background: "linear-gradient(135deg, var(--red), var(--red-dark))", position: "relative" }}>
          <div style={{ position: "absolute", top: 10, right: 20, width: 80, height: 80, borderRadius: "50%", background: "rgba(255,255,255,0.1)" }} />
          <div style={{ position: "absolute", bottom: -30, left: 30, width: 60, height: 60, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
        </div>

        <div className="card-body" style={{ paddingTop: 0, marginTop: -40 }}>
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "end" }}>
            {/* Profile Photo or Initials Avatar */}
            <div style={{ width: 80, height: 80, borderRadius: "50%", border: "4px solid var(--bg-card)", overflow: "hidden", background: user?.photo ? "none" : (c.bg || "var(--red-light)"), display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, fontWeight: 800, color: c.text || "var(--red)", flexShrink: 0, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
              {user?.photo ? (
                <img src={user.photo} alt={user.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                user?.name?.charAt(0)?.toUpperCase()
              )}
            </div>

            {/* Name, Role, Blood Group, Verified */}
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <h1 style={{ fontSize: 22, fontWeight: 800 }}>Welcome back, {user?.name?.split(" ")[0]} 👋</h1>
                {user?.isVerified && <span className="badge badge-green"><Shield size={10} /> Verified</span>}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4, flexWrap: "wrap" }}>
                <span style={{ fontSize: 13, color: "var(--text-secondary)", textTransform: "capitalize" }}>{user?.role}</span>
                {user?.bloodGroup && (
                  <span className="badge" style={{ background: c.bg, color: c.text, fontSize: 12, padding: "2px 10px" }}>{user?.bloodGroup}</span>
                )}
              </div>
            </div>

            {/* Edit Profile Button */}
            <Link to="/settings" className="btn btn-secondary btn-sm" style={{ alignSelf: "start" }}>
              Edit Profile
            </Link>
          </div>

          {/* Contact Info Row */}
          <div style={{ display: "flex", gap: 16, marginTop: 16, flexWrap: "wrap", fontSize: 13, color: "var(--text-secondary)" }}>
            {user?.phone && (
              <a href={`tel:${user.phone}`} style={{ display: "flex", alignItems: "center", gap: 4, textDecoration: "none", color: "var(--text-secondary)" }}>
                <Phone size={12} /> {user.phone}
              </a>
            )}
            {user?.email && (
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Mail size={12} /> {user.email}</span>
            )}
            {user?.district && (
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}><MapPin size={12} /> {user?.area ? `${user.area}, ` : ""}{user.district}</span>
            )}
            {user?.createdAt && (
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Calendar size={12} /> Member since {new Date(user.createdAt).toLocaleDateString()}</span>
            )}
          </div>
        </div>
      </div>

      {/* ── Stats Grid ── */}
      <div className="grid" style={{ gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginTop: 24 }}>
        {user?.role === "donor" && (
          <>
            <StatCard icon={<Heart size={20} color="var(--red)" />} label="Donations" value={user.totalDonations || 0} />
            <StatCard
              icon={<Activity size={20} color={user.isAvailable ? "var(--green)" : "var(--text-muted)"} />}
              label="Status"
              value={user.isAvailable ? "Active" : "Off"}
              valueColor={user.isAvailable ? "var(--green)" : "var(--text-muted)"}
            />
          </>
        )}
        {stats && (
          <>
            <StatCard icon={<AlertCircle size={20} color="var(--red)" />} label="Open Requests" value={Object.values(stats).reduce((a, b) => a + b, 0)} />
            <StatCard icon={<Users size={20} color="var(--blue)" />} label="Blood Groups" value={Object.values(stats).filter((v) => v > 0).length} />
          </>
        )}
      </div>

      {/* ── Quick Actions ── */}
      <div style={{ marginTop: 24 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Quick Actions</h2>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {user?.role === "seeker" && (
            <Link to="/requests/create" className="btn btn-primary" style={{ gap: 8 }}>
              <Plus size={16} /> Create Request
            </Link>
          )}
          <Link to="/donors" className="btn btn-secondary" style={{ gap: 8 }}>
            <Search size={16} /> Find Donors
          </Link>
          <Link to="/requests" className="btn btn-secondary" style={{ gap: 8 }}>
            <AlertCircle size={16} /> View Requests
          </Link>
          <Link to="/profile" className="btn btn-ghost" style={{ gap: 8 }}>
            My Profile <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* ── Blood Stock Overview + Requests Side by Side ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginTop: 24 }}>

        {/* Blood Stock */}
        {stats && (
          <div className="card">
            <div className="card-body">
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <TrendingUp size={18} color="var(--red)" />
                <h2 style={{ fontSize: 16, fontWeight: 700 }}>Blood Stock</h2>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {Object.entries(stats).map(([group, count]) => {
                  const maxCount = Math.max(...Object.values(stats), 1);
                  const pct = (count / maxCount) * 100;
                  const gc = BLOOD_GROUP_COLORS[group] || {};
                  const isDark = document.documentElement.classList.contains("dark");
                  return (
                    <div key={group} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ width: 36, fontSize: 12, fontWeight: 700, color: isDark ? gc.darkText : gc.text }}>{group}</span>
                      <div style={{ flex: 1, height: 8, borderRadius: 4, background: "var(--border-light)", overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${Math.max(pct, 4)}%`, borderRadius: 4, background: isDark ? gc.darkText : gc.text, transition: "width 0.5s ease" }} />
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 600, minWidth: 20, textAlign: "right" }}>{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Recent Requests */}
        <div className="card">
          <div className="card-body">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Clock size={18} color="var(--red)" />
                <h2 style={{ fontSize: 16, fontWeight: 700 }}>{user?.role === "donor" ? "Nearby Requests" : "My Requests"}</h2>
              </div>
              <Link to="/requests" style={{ fontSize: 13, color: "var(--red)", fontWeight: 600, textDecoration: "none" }}>View All</Link>
            </div>
            {nearbyRequests.length === 0 ? (
              <div style={{ textAlign: "center", padding: "32px 0", color: "var(--text-muted)", fontSize: 14 }}>
                No requests to show
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {nearbyRequests.map((r) => {
                  const rc = BLOOD_GROUP_COLORS[r.patientBloodGroup] || {};
                  const isDark = document.documentElement.classList.contains("dark");
                  return (
                    <Link key={r._id} to={`/requests/${r._id}`} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-light)", textDecoration: "none", transition: "all 0.2s" }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--red)"; e.currentTarget.style.background = "var(--red-light)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border-light)"; e.currentTarget.style.background = "transparent"; }}
                    >
                      <div style={{ width: 36, height: 36, borderRadius: 8, background: isDark ? rc.darkBg : rc.bg, color: isDark ? rc.darkText : rc.text, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                        {r.patientBloodGroup}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text)" }}>{r.patientName}</div>
                        <div style={{ fontSize: 12, color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.hospital}</div>
                      </div>
                      <span className={`badge ${r.status === "open" ? "badge-green" : r.status === "completed" ? "badge-gray" : "badge-blue"}`} style={{ fontSize: 11, flexShrink: 0 }}>{r.status}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Responsive: stack on mobile */}
      <style>{`
        @media(max-width:768px){
          .grid[style*="repeat(4"]{grid-template-columns:repeat(2,1fr) !important;}
        }
        @media(max-width:600px){
          .container > div[style*="grid-template-columns: 1fr 1fr"]{grid-template-columns:1fr !important;}
        }
      `}</style>
    </div>
  );
}

/** Reusable stat card component */
function StatCard({ icon, label, value, valueColor }) {
  return (
    <div className="card" style={{ padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
        <div>
          <div style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 500 }}>{label}</div>
          <div style={{ fontSize: 26, fontWeight: 800, marginTop: 4, color: valueColor || "var(--text)" }}>{value}</div>
        </div>
        <div style={{ padding: 8, borderRadius: 10, background: "var(--red-light)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {icon}
        </div>
      </div>
    </div>
  );
}
