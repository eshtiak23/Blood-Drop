/**
 * DashboardPage — Main user dashboard after login.
 * 
 * Everyone is both a blood donor AND a seeker — no role separation.
 * Shows: profile card, stats, donation logging, feedback/reviews,
 * recent requests, quick actions, and cooldown reminder.
 * 
 * All data is fetched from the MongoDB Atlas backend via API.
 */

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { searchRequests, addDonationLog, getDonationLogs, addFeedback, getAllFeedback, getMyFeedback, deleteFeedback, getDonationCooldown } from "../../services/localStore";
import { BLOOD_GROUPS, BLOOD_GROUP_COLORS } from "../../data/constants";
import {
  Droplets, Heart, AlertCircle, Search, Plus, Users, MapPin, Phone, Mail,
  Shield, Clock, TrendingUp, Activity, ArrowRight, Calendar, Star,
  Building2, MessageSquare, Trash2, CheckCircle, Loader2, X, Bell
} from "lucide-react";
import toast from "react-hot-toast";

/** Returns theme-aware blood group badge colors */
function getBloodGroupColor(bloodGroup) {
  const c = BLOOD_GROUP_COLORS[bloodGroup];
  if (!c) return {};
  const isDark = document.documentElement.classList.contains("dark");
  return { bg: isDark ? c.darkBg : c.bg, text: isDark ? c.darkText : c.text };
}

export default function DashboardPage() {
  const { user, updateUser } = useAuth();
  const [stats, setStats] = useState(null);
  const [nearbyRequests, setNearbyRequests] = useState([]);

  // Donation logging state
  const [donationForm, setDonationForm] = useState({ donationDate: "", hospital: "" });
  const [donationLogs, setDonationLogs] = useState([]);
  const [donationSaving, setDonationSaving] = useState(false);
  const [donationSaved, setDonationSaved] = useState(false);

  // Feedback state
  const [feedbackForm, setFeedbackForm] = useState({ rating: 5, comment: "" });
  const [feedbackList, setFeedbackList] = useState([]);
  const [myFeedback, setMyFeedback] = useState([]);
  const [feedbackSaving, setFeedbackSaving] = useState(false);
  const [feedbackSaved, setFeedbackSaved] = useState(false);
  const [feedbackError, setFeedbackError] = useState("");

  // Cooldown reminder
  const [cooldown, setCooldown] = useState(null);

  useEffect(() => {
    if (!user) return;

    // Load all data from API
    Promise.all([
      searchRequests(),
      getDonationLogs(),
      getAllFeedback(),
      user._id ? getMyFeedback() : Promise.resolve([]),
    ]).then(([allRequests, logs, allFeedback, myFb]) => {
      // Count open requests per blood group
      const stock = {};
      BLOOD_GROUPS.forEach((g) => { stock[g] = 0; });
      allRequests.filter((r) => r.status === "open").forEach((r) => { stock[r.patientBloodGroup] = (stock[r.patientBloodGroup] || 0) + 1; });
      setStats(stock);

      // Show requests relevant to the user's district
      if (user.district) {
        setNearbyRequests(allRequests.filter((r) => r.district === user.district && r.status === "open").slice(0, 3));
      }

      setDonationLogs(logs);
      setFeedbackList(allFeedback.slice(0, 10));
      setMyFeedback(myFb);
      setCooldown(getDonationCooldown(user));
    }).catch((err) => { console.error(err); toast.error("Failed to load dashboard data"); });
  }, [user]);

  /** Log a blood donation — updates user stats and saves the log */
  const handleDonationLog = async (e) => {
    e.preventDefault();
    if (!donationForm.donationDate || !donationForm.hospital) return;
    setDonationSaving(true);
    try {
      await addDonationLog(donationForm);
      const newTotal = (user.totalDonations || 0) + 1;
      await updateUser({ totalDonations: newTotal, lastDonationDate: donationForm.donationDate });
      const logs = await getDonationLogs();
      setDonationLogs(logs);
      setDonationForm({ donationDate: "", hospital: "" });
      setDonationSaved(true);
      toast.success("Donation logged!");
      setTimeout(() => setDonationSaved(false), 2000);
    } catch (err) {
      toast.error("Failed to log donation");
    }
    setDonationSaving(false);
  };

  /** Submit feedback / review */
  const handleFeedback = async (e) => {
    e.preventDefault();
    if (!feedbackForm.comment.trim()) return;
    setFeedbackSaving(true);
    setFeedbackError("");
    try {
      await addFeedback(feedbackForm);
      const allFb = await getAllFeedback();
      const myFb = await getMyFeedback();
      setFeedbackList(allFb.slice(0, 10));
      setMyFeedback(myFb);
      setFeedbackForm({ rating: 5, comment: "" });
      setFeedbackSaved(true);
      toast.success("Feedback submitted!");
      setTimeout(() => setFeedbackSaved(false), 2000);
    } catch (err) {
      setFeedbackError(err.response?.data?.error || err.message);
    }
    setFeedbackSaving(false);
  };

  /** Delete own feedback */
  const handleDeleteFeedback = async (fbId) => {
    try {
      await deleteFeedback(fbId);
      toast.success("Feedback removed");
      const allFb = await getAllFeedback();
      const myFb = await getMyFeedback();
      setFeedbackList(allFb.slice(0, 10));
      setMyFeedback(myFb);
    } catch (err) {
      toast.error("Failed to delete feedback");
    }
  };

  /** Toggle donor availability on/off */
  const handleToggleAvailability = async () => {
    try {
      await updateUser({ isAvailable: !user.isAvailable });
      toast.success("Status updated");
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const c = getBloodGroupColor(user?.bloodGroup);

  return (
    <div className="container" style={{ padding: "32px 20px", maxWidth: 1100 }}>

      {/* ── Profile Card + Welcome ── */}
      <div className="card animate-fadeIn">
        <div className="card-body">
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "center" }}>
            {/* Profile Photo or Initials Avatar */}
            <div style={{ width: 72, height: 72, borderRadius: "50%", overflow: "hidden", background: user?.photo ? "none" : (c.bg || "var(--red-light)"), display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 800, color: c.text || "var(--red)", flexShrink: 0, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
              {user?.photo ? (
                <img src={user.photo} alt={user.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                user?.name?.charAt(0)?.toUpperCase()
              )}
            </div>

            {/* Name, Blood Group, Verified */}
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <h1 style={{ fontSize: 22, fontWeight: 800 }}>Hi, {user?.name} 👋</h1>
                {user?.isVerified && <span className="badge badge-green"><Shield size={10} /> Verified</span>}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4, flexWrap: "wrap" }}>
                {user?.bloodGroup && (
                  <span className="badge" style={{ background: c.bg, color: c.text, fontSize: 12, padding: "2px 10px" }}>{user?.bloodGroup}</span>
                )}
              </div>
            </div>

            {/* Edit Profile Button */}
            <Link to="/settings" className="btn btn-secondary btn-sm">
              Edit Profile
            </Link>

            {/* Donor Availability Toggle */}
            <button
              onClick={handleToggleAvailability}
              className="dash-toggle"
              style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: user?.isAvailable ? "4px 16px 4px 4px" : "4px 14px 4px 4px",
                borderRadius: 50,
                border: "none", cursor: "pointer",
                background: user?.isAvailable ? "linear-gradient(135deg, #10B981, #059669)" : "var(--bg-secondary)",
                boxShadow: user?.isAvailable ? "0 4px 15px rgba(16,185,129,0.35)" : "0 2px 8px rgba(0,0,0,0.08)",
                transition: "all 0.3s ease",
                flexShrink: 0,
              }}
            >
              <div style={{
                width: 30, height: 30, borderRadius: "50%",
                background: "#fff",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              }}>
                <div style={{
                  width: 10, height: 10, borderRadius: "50%",
                  background: user?.isAvailable ? "#10B981" : "#9CA3AF",
                  transition: "background 0.3s ease",
                }} />
              </div>
              <span style={{
                fontSize: 13, fontWeight: 600,
                color: user?.isAvailable ? "#fff" : "var(--text-muted)",
                transition: "color 0.3s ease",
              }}>
                {user?.isAvailable ? "Active" : "Inactive"}
              </span>
            </button>
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
            {user?.age && (
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Calendar size={12} /> Age: {user.age}</span>
            )}
            {user?.district && (
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}><MapPin size={12} /> {user?.area ? `${user.area}, ` : ""}{user.district}</span>
            )}
            {user?.lastDonationDate && (
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Droplets size={12} /> Last donated: {new Date(user.lastDonationDate).toLocaleDateString()}</span>
            )}
            {user?.createdAt && (
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Calendar size={12} /> Member since {new Date(user.createdAt).toLocaleDateString()}</span>
            )}
          </div>
        </div>
      </div>

      {/* ── Cooldown Reminder Banner ── */}
      {cooldown && !cooldown.cooledDown && cooldown.nextAvailable && (
        <div
          style={{
            marginTop: 16,
            padding: "14px 20px",
            borderRadius: "var(--radius)",
            background: "linear-gradient(135deg, #FDE68A 0%, #FCD34D 100%)",
            color: "#92400E",
            display: "flex",
            alignItems: "center",
            gap: 12,
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          <Bell size={20} color="#92400E" />
          <div>
            Donation cooldown active — you can donate again in <strong>{cooldown.daysRemaining} days</strong> ({cooldown.nextAvailable.toLocaleDateString()}).
          </div>
        </div>
      )}

      {/* ── Stats Grid ── */}
      <div className="grid dash-stats" style={{ gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginTop: 24 }}>
        <StatCard icon={<Heart size={20} color="var(--red)" />} label="Donations" value={user?.totalDonations || 0} />
        <StatCard
          icon={<Activity size={20} color={user?.isAvailable ? "var(--green)" : "var(--text-muted)"} />}
          label="Status"
          value={user?.isAvailable ? "Active" : "Inactive"}
          valueColor={user?.isAvailable ? "var(--green)" : "var(--text-muted)"}
        />
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
        <div className="dash-quick-actions" style={{ display: "flex", flexWrap: "wrap", gap: 16, justifyContent: "center" }}>
          {[
            { to: "/requests/create", icon: Plus, shortLabel: "Create", gradient: "linear-gradient(135deg, #EF4444, #EC4899)" },
            { to: "/donors", icon: Search, shortLabel: "Donors", gradient: "linear-gradient(135deg, #3B82F6, #06B6D4)" },
            { to: "/requests", icon: AlertCircle, shortLabel: "Requests", gradient: "linear-gradient(135deg, #F97316, #EAB308)" },
            { action: "scroll-donation", icon: Droplets, shortLabel: "Log", gradient: "linear-gradient(135deg, #8B5CF6, #EC4899)" },
            { to: "/bookmarks", icon: Heart, shortLabel: "Saved", gradient: "linear-gradient(135deg, #10B981, #14B8A6)" },
            { to: "/notifications", icon: Bell, shortLabel: "Alerts", gradient: "linear-gradient(135deg, #6366F1, #8B5CF6)" },
          ].map((item, index) => {
            const inner = (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, cursor: "pointer", transition: "transform 0.2s ease" }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
              >
                <div style={{ position: "relative", width: 56, height: 56 }}>
                  <div style={{ width: 56, height: 56, borderRadius: "50%", background: item.gradient, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}>
                    <item.icon size={22} />
                  </div>
                  <div className="orbit-drop" style={{ position: "absolute", top: "50%", left: "50%", width: 0, height: 0, animation: `orbit 3s linear infinite`, animationDelay: `${index * 0.5}s` }}>
                    <div style={{ width: 8, height: 10, borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%", background: "#EF4444", boxShadow: "0 1px 4px rgba(239,68,68,0.5)", transform: "translate(-50%, -50%)" }} />
                  </div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text)", textAlign: "center", lineHeight: 1.2, maxWidth: 70 }}>
                  {item.shortLabel}
                </span>
              </div>
            );
            if (item.action === "scroll-donation") {
              return (
                <button key={item.shortLabel} onClick={() => document.getElementById("log-donation")?.scrollIntoView({ behavior: "smooth" })} style={{ background: "none", border: "none", padding: 0 }}>
                  {inner}
                </button>
              );
            }
            return (
              <Link key={item.shortLabel} to={item.to} style={{ textDecoration: "none" }}>
                {inner}
              </Link>
            );
          })}
        </div>
      </div>

      {/* ── Log Donation + Feedback Side by Side ── */}
      <div className="dash-two-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginTop: 24 }}>

        {/* Log Donation */}
        <div className="card" id="log-donation">
          <div className="card-body">
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <Droplets size={18} color="var(--red)" />
              <h2 style={{ fontSize: 16, fontWeight: 700 }}>Log Donation</h2>
            </div>
            <form onSubmit={handleDonationLog}>
              <div className="input-group" style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 13 }}>Donation Date</label>
                <input className="input" type="date" value={donationForm.donationDate} onChange={(e) => setDonationForm({ ...donationForm, donationDate: e.target.value })} required />
              </div>
              <div className="input-group" style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 13 }}>Hospital Name</label>
                <input className="input" placeholder="e.g. Dhaka Medical College" value={donationForm.hospital} onChange={(e) => setDonationForm({ ...donationForm, hospital: e.target.value })} required />
              </div>
              <button className="btn btn-primary btn-sm" type="submit" disabled={donationSaving} style={{ width: "100%" }}>
                {donationSaving ? <Loader2 size={14} className="animate-pulse" /> : <CheckCircle size={14} />}
                {donationSaved ? "Saved!" : "Log Donation"}
              </button>
            </form>

            {/* Recent donation logs */}
            {donationLogs.length > 0 && (
              <div style={{ marginTop: 16, borderTop: "1px solid var(--border-light)", paddingTop: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", marginBottom: 8 }}>Recent Logs</div>
                {donationLogs.slice(0, 3).map((log) => (
                  <div key={log._id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", fontSize: 13 }}>
                    <Building2 size={12} color="var(--text-muted)" />
                    <span style={{ flex: 1 }}>{log.hospital}</span>
                    <span style={{ color: "var(--text-muted)", fontSize: 12 }}>{new Date(log.donationDate).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Feedback / Reviews */}
        <div className="card">
          <div className="card-body">
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <MessageSquare size={18} color="var(--red)" />
              <h2 style={{ fontSize: 16, fontWeight: 700 }}>Feedback & Reviews</h2>
            </div>

            {/* Feedback form */}
            <form onSubmit={handleFeedback}>
              {feedbackError && <div className="alert alert-error" style={{ marginBottom: 12, fontSize: 13 }}>{feedbackError}</div>}
              <div className="input-group" style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 13 }}>Your Rating</label>
                <div style={{ display: "flex", gap: 4 }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} type="button" onClick={() => setFeedbackForm({ ...feedbackForm, rating: star })} style={{ background: "none", border: "none", cursor: "pointer", padding: 2 }}>
                      <Star size={20} fill={star <= feedbackForm.rating ? "#F59E0B" : "none"} color={star <= feedbackForm.rating ? "#F59E0B" : "var(--text-muted)"} />
                    </button>
                  ))}
                </div>
              </div>
              <div className="input-group" style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 13 }}>Your Review</label>
                <textarea className="input" rows={2} placeholder="Share your experience with LifeDrop..." value={feedbackForm.comment} onChange={(e) => setFeedbackForm({ ...feedbackForm, comment: e.target.value })} required />
              </div>
              <button className="btn btn-primary btn-sm" type="submit" disabled={feedbackSaving} style={{ width: "100%" }}>
                {feedbackSaving ? <Loader2 size={14} className="animate-pulse" /> : <MessageSquare size={14} />}
                {feedbackSaved ? "Submitted!" : "Submit Feedback"}
              </button>
            </form>

            {/* Recent feedback list */}
            {feedbackList.length > 0 && (
              <div style={{ marginTop: 16, borderTop: "1px solid var(--border-light)", paddingTop: 12, maxHeight: 220, overflowY: "auto" }}>
                {feedbackList.map((fb) => (
                  <div key={fb._id} style={{ padding: "8px 0", borderBottom: "1px solid var(--border-light)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--red-light)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "var(--red)", flexShrink: 0 }}>
                        {fb.userPhoto ? <img src={fb.userPhoto} alt="" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} /> : fb.userName?.charAt(0)?.toUpperCase()}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 600 }}>{fb.userName}</div>
                        <div style={{ display: "flex", gap: 2 }}>
                          {[1, 2, 3, 4, 5].map((s) => <Star key={s} size={10} fill={s <= fb.rating ? "#F59E0B" : "none"} color={s <= fb.rating ? "#F59E0B" : "var(--text-muted)"} />)}
                        </div>
                      </div>
                      <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{new Date(fb.createdAt).toLocaleDateString()}</span>
                      {fb.userId === user?._id && (
                        <button onClick={() => handleDeleteFeedback(fb._id)} style={{ background: "none", border: "none", cursor: "pointer", padding: 2, color: "var(--text-muted)" }}><Trash2 size={12} /></button>
                      )}
                    </div>
                    <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 4, marginLeft: 36 }}>{fb.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Nearby Requests ── */}
      <div className="card" style={{ marginTop: 24 }}>
          <div className="card-body">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Clock size={18} color="var(--red)" />
                <h2 style={{ fontSize: 16, fontWeight: 700 }}>Nearby Requests</h2>
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

      {/* Responsive: stack on mobile */}
      <style>{`
        @keyframes orbit {
          0%   { transform: rotate(0deg)   translateX(36px) rotate(0deg); }
          100% { transform: rotate(360deg) translateX(36px) rotate(-360deg); }
        }
        @media(max-width:768px){
          .dash-stats{grid-template-columns:repeat(2,1fr) !important;}
          .dash-two-col{grid-template-columns:1fr !important;}
          .dash-quick-actions{display:grid !important; grid-template-columns:repeat(3,1fr) !important; justify-items:center;}
          .orbit-drop{display:none !important;}
        }
        @media(max-width:480px){
          .dash-stats{grid-template-columns:1fr !important;}
          .dash-quick-actions{grid-template-columns:repeat(3,1fr) !important;}
          .dash-toggle{width:100% !important; justify-content:center; padding:8px 16px 8px 8px !important;}
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
