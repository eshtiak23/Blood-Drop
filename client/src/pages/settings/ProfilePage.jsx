/**
 * ProfilePage — Public-facing profile view for the logged-in user.
 * 
 * Displays the user's photo, name, blood group, verification status,
 * personal info (email, phone, location), donation stats, bio,
 * donation history timeline, and ratings received.
 * Includes an Edit button that navigates to Settings.
 */

import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { BLOOD_GROUP_COLORS } from "../../data/constants";
import { getDonationLogs, getUserRatings } from "../../services/localStore";
import { Mail, Phone, MapPin, Calendar, Droplets, Heart, Shield, Edit, Clock, User, Star, Building2, History } from "lucide-react";

/** Returns theme-aware blood group badge colors */
function getBloodGroupColor(bloodGroup) {
  const c = BLOOD_GROUP_COLORS[bloodGroup];
  if (!c) return {};
  const isDark = document.documentElement.classList.contains("dark");
  return { bg: isDark ? c.darkBg : c.bg, text: isDark ? c.darkText : c.text };
}

export default function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [donationLogs, setDonationLogs] = useState([]);
  const [ratings, setRatings] = useState([]);

  useEffect(() => {
    if (user?._id) {
      setDonationLogs(getDonationLogs(user._id));
      setRatings(getUserRatings(user._id));
    }
  }, [user]);

  if (!user) return null;
  const c = getBloodGroupColor(user.bloodGroup);

  /** Calculate average rating */
  const avgRating = ratings.length > 0 ? (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(1) : null;

  return (
    <div className="container" style={{ padding: "32px 20px", maxWidth: 800 }}>
      <h1 style={{ fontSize: 24, fontWeight: 800 }}>My Profile</h1>

      <div className="card animate-fadeIn" style={{ marginTop: 20 }}>
        <div className="card-body">
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "center" }}>
            {/* Profile Photo or Initials */}
            <div style={{ width: 72, height: 72, borderRadius: "50%", overflow: "hidden", background: user.photo ? "none" : (c.bg || "var(--red-light)"), display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 800, color: c.text || "var(--red)", flexShrink: 0, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
              {user.photo ? (
                <img src={user.photo} alt={user.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                user.name?.charAt(0)?.toUpperCase()
              )}
            </div>

            {/* Name, Role, Blood Group */}
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <h2 style={{ fontSize: 22, fontWeight: 700 }}>{user.name}</h2>
                {user.isVerified && <span className="badge badge-green"><Shield size={12} /> Verified</span>}
              </div>
              <div style={{ fontSize: 14, color: "var(--text-secondary)", textTransform: "capitalize", marginTop: 2 }}>{user.role}</div>
              {user.bloodGroup && (
                <span className="badge" style={{ background: c.bg, color: c.text, marginTop: 8, fontSize: 14, padding: "6px 16px" }}>{user.bloodGroup}</span>
              )}
            </div>

            <button className="btn btn-secondary btn-sm" onClick={() => navigate("/settings")}><Edit size={14} /> Edit</button>
          </div>

          {/* Bio */}
          {user.bio && (
            <div style={{ marginTop: 16, padding: 12, borderRadius: "var(--radius-sm)", background: "var(--bg-secondary)", fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6 }}>
              {user.bio}
            </div>
          )}

          <div className="separator" style={{ margin: "24px 0" }} />

          {/* Two-column info grid */}
          <div className="grid grid-2">
            {/* Personal Info */}
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}><User size={14} /> Personal Info</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 14, color: "var(--text-secondary)" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}><Mail size={14} /> {user.email}</span>
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}><Phone size={14} /> {user.phone}</span>
                {user.district && (
                  <span style={{ display: "flex", alignItems: "center", gap: 8 }}><MapPin size={14} /> {user.area ? `${user.area}, ` : ""}{user.district}</span>
                )}
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}><Calendar size={14} /> Since {new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Donation Info */}
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}><Droplets size={14} /> Donation Info</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 14, color: "var(--text-secondary)" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}><Droplets size={14} /> {user.totalDonations || 0} total donations</span>
                <span style={{ display: "flex", alignItems: "center", gap: 8, color: user.isAvailable ? "var(--green)" : "var(--text-muted)" }}>
                  <Heart size={14} /> {user.isAvailable ? "Available to donate" : "Currently unavailable"}
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}><Clock size={14} /> Last donation: {user.lastDonationDate ? new Date(user.lastDonationDate).toLocaleDateString() : "Never"}</span>
                {avgRating && (
                  <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Star size={14} fill="#F59E0B" color="#F59E0B" /> {avgRating} avg rating ({ratings.length} reviews)
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Donation History Timeline ── */}
      {donationLogs.length > 0 && (
        <div className="card animate-fadeIn" style={{ marginTop: 20 }}>
          <div className="card-body">
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <History size={18} color="var(--red)" />
              <h2 style={{ fontSize: 16, fontWeight: 700 }}>Donation History</h2>
            </div>

            <div style={{ position: "relative", paddingLeft: 28 }}>
              {/* Vertical timeline line */}
              <div style={{ position: "absolute", left: 8, top: 4, bottom: 4, width: 2, background: "var(--border-light)", borderRadius: 1 }} />

              {donationLogs.map((log, i) => (
                <div key={log._id} style={{ position: "relative", marginBottom: i < donationLogs.length - 1 ? 20 : 0 }}>
                  {/* Timeline dot */}
                  <div style={{
                    position: "absolute", left: -24, top: 4,
                    width: 14, height: 14, borderRadius: "50%",
                    background: "var(--red)", border: "2px solid var(--bg-primary)",
                    boxShadow: "0 0 0 3px var(--red-light)",
                    zIndex: 1,
                  }} />

                  <div style={{
                    padding: "12px 16px",
                    borderRadius: "var(--radius-sm)",
                    background: "var(--bg-secondary)",
                    border: "1px solid var(--border-light)",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <Building2 size={14} color="var(--text-muted)" />
                      <span style={{ fontWeight: 600, fontSize: 14 }}>{log.hospital}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 6, fontSize: 13, color: "var(--text-secondary)" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <Calendar size={12} /> {new Date(log.donationDate).toLocaleDateString()}
                      </span>
                      <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <Droplets size={12} /> {log.bloodGroup}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Ratings Received ── */}
      {ratings.length > 0 && (
        <div className="card animate-fadeIn" style={{ marginTop: 20 }}>
          <div className="card-body">
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <Star size={18} fill="#F59E0B" color="#F59E0B" />
              <h2 style={{ fontSize: 16, fontWeight: 700 }}>Ratings & Reviews</h2>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12, maxHeight: 300, overflowY: "auto" }}>
              {ratings.map((rt) => (
                <div key={rt._id} style={{
                  padding: "12px 16px",
                  borderRadius: "var(--radius-sm)",
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border-light)",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <div style={{ display: "flex", gap: 2 }}>
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} size={12} fill={s <= rt.rating ? "#F59E0B" : "none"} color={s <= rt.rating ? "#F59E0B" : "var(--text-muted)"} />
                      ))}
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)" }}>
                      by {rt.raterName}
                    </span>
                    <span style={{ fontSize: 11, color: "var(--text-muted)", marginLeft: "auto" }}>
                      {new Date(rt.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {rt.comment && <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0 }}>{rt.comment}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
