/**
 * RequestListPage - Displays a searchable/filterable list of blood requests.
 * Allows users to browse open requests by blood group, district, and urgency.
 * Each card links to the full detail view of that request.
 */
import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { searchRequests, deleteRequest } from "../../services/localStore";
import { BLOOD_GROUPS, BLOOD_GROUP_COLORS, DISTRICTS, URGENCY } from "../../data/constants";
import { MapPin, Clock, Plus, AlertCircle, Trash2, MessageCircle, Droplets, Loader2, X, Mail } from "lucide-react";
import toast from "react-hot-toast";

function getBloodGroupColor(bloodGroup) {
  const c = BLOOD_GROUP_COLORS[bloodGroup];
  if (!c) return {};
  const isDark = document.documentElement.classList.contains("dark");
  return { bg: isDark ? c.darkBg : c.bg, text: isDark ? c.darkText : c.text };
}

function getStatusStyle(status) {
  switch (status) {
    case "open": return { color: "#22C55E", label: "Open", dot: "#22C55E" };
    case "accepted": return { color: "#3B82F6", label: "Accepted", dot: "#3B82F6" };
    case "completed": return { color: "#10B981", label: "Completed", dot: "#10B981" };
    case "cancelled": return { color: "#9CA3AF", label: "Cancelled", dot: "#9CA3AF" };
    default: return { color: "var(--text-muted)", label: status, dot: "var(--text-muted)" };
  }
}

export default function RequestListPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [filters, setFilters] = useState({ bloodGroup: "", district: "", urgency: "" });
  const filtersRef = useRef(filters);
  filtersRef.current = filters;
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDelete, setShowDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setLoading(true);
    searchRequests(filters).then((data) => { setRequests(data); setLoading(false); }).catch(() => { setRequests([]); setLoading(false); });
  }, [filters]);

  const handleDelete = async (requestId) => {
    if (deleting) return;
    setDeleting(true);
    setShowDelete(null);
    setRequests((prev) => prev.filter((r) => r._id !== requestId));
    try {
      await deleteRequest(requestId);
      toast.success("Request deleted");
    } catch {
      toast.error("Failed to delete");
      searchRequests(filtersRef.current).then(setRequests).catch(() => {});
    } finally {
      setDeleting(false);
    }
  };

  const hasFilters = filters.bloodGroup || filters.district || filters.urgency;

  return (
    <div className="container" style={{ padding: "32px 20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800 }}>Blood Requests</h1>
          <p style={{ color: "var(--text-secondary)", marginTop: 4 }}>Find and respond to blood requests</p>
        </div>
        <Link to="/requests/create" className="btn btn-primary"><Plus size={16} /> Create Request</Link>
      </div>

      {/* Filter bar */}
      <div style={{ display: "flex", gap: 12, marginTop: 20, flexWrap: "wrap", alignItems: "center" }}>
        <select className="input" style={{ flex: 1, minWidth: 140 }} value={filters.bloodGroup} onChange={(e) => setFilters({ ...filters, bloodGroup: e.target.value })}>
          <option value="">All Groups</option>{BLOOD_GROUPS.map((g) => <option key={g} value={g}>{g}</option>)}
        </select>
        <select className="input" style={{ flex: 1, minWidth: 140 }} value={filters.district} onChange={(e) => setFilters({ ...filters, district: e.target.value })}>
          <option value="">All Districts</option>{DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
        <select className="input" style={{ flex: 1, minWidth: 140 }} value={filters.urgency} onChange={(e) => setFilters({ ...filters, urgency: e.target.value })}>
          <option value="">All Urgency</option>{URGENCY.map((u) => <option key={u.value} value={u.value}>{u.label}</option>)}
        </select>
        {hasFilters && (
          <button onClick={() => setFilters({ bloodGroup: "", district: "", urgency: "" })} className="filter-reset-btn" title="Clear all filters">
            <X size={16} /> Clear
          </button>
        )}
      </div>

      <div style={{ marginTop: 24 }}>
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
            <div className="loading-spinner" />
          </div>
        ) : requests.length === 0 ? (
          <div className="empty-state"><div className="empty-state-icon"><AlertCircle size={28} color="var(--red)" /></div><div className="empty-state-title">No blood requests</div><div className="empty-state-desc">{hasFilters ? "Try adjusting your filters" : "Be the first to create a request"}</div></div>
        ) : (
          <div className="grid grid-3">
            {requests.map((r, idx) => {
              const isOwn = user?._id && String(user._id) === String(r.requester?._id);
              const rc = getBloodGroupColor(r.patientBloodGroup);
              const st = getStatusStyle(r.status);
              return (
                <div key={r._id} className="contact-card contact-card-entry" style={{ animationDelay: `${idx * 0.08}s`, cursor: "pointer" }}
                  onClick={() => navigate(`/requests/${r._id}`)}
                  onMouseMove={(e) => {
                    const card = e.currentTarget;
                    const rect = card.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    const centerX = rect.width / 2;
                    const centerY = rect.height / 2;
                    const rotateX = ((y - centerY) / centerY) * -6;
                    const rotateY = ((x - centerX) / centerX) * 6;
                    card.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(8px)`;
                    const glare = card.querySelector(".contact-card-glare");
                    if (glare) {
                      glare.style.opacity = "1";
                      glare.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.1) 40%, transparent 70%)`;
                    }
                  }}
                  onMouseLeave={(e) => {
                    const card = e.currentTarget;
                    card.style.transform = "perspective(600px) rotateX(0deg) rotateY(0deg) translateZ(0px)";
                    const glare = card.querySelector(".contact-card-glare");
                    if (glare) { glare.style.opacity = "0"; }
                  }}
                >
                  <div className="contact-card-glare" />
                  <div className="contact-card-top">
                    <div className="contact-card-avatar" style={{ background: `linear-gradient(135deg, ${rc.text || "#EF4444"}, ${rc.text || "#DC2626"}88)`, overflow: "hidden", padding: 0 }}>
                      {r.requester?.photo ? (
                        <img src={r.requester.photo} alt={r.patientName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        r.requester?.name?.charAt(0)?.toUpperCase() || r.patientName?.charAt(0)?.toUpperCase()
                      )}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {r.patientBloodGroup && (
                        <div className="contact-card-blood-badge" style={{ background: rc.text || "#EF4444" }}>
                          {r.patientBloodGroup}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="contact-card-name">{r.patientName}</div>
                  <div className="contact-card-location">
                    <MapPin size={13} /> {r.area}, {r.district}
                  </div>
                  {r.requester?.email && (
                    <div className="contact-card-location">
                      <Mail size={13} /> {r.requester.email}
                    </div>
                  )}
                  <div className="contact-card-stats">
                    <span className="contact-card-stat"><Droplets size={13} /> {r.unitsRequired} unit(s)</span>
                    <span className="contact-card-stat"><Clock size={13} /> {r.dateNeeded ? new Date(r.dateNeeded).toLocaleDateString() : "ASAP"}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
                    <div className={`contact-card-status ${r.status === "completed" ? "status-completed-glow" : ""}`}>
                      <span className="contact-card-status-dot" style={{ background: st.dot }} />
                      <span style={{ color: st.color, fontWeight: r.status === "completed" ? 700 : 500 }}>{st.label}</span>
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      {isOwn && (
                        <button
                          onClick={(e) => { e.stopPropagation(); setShowDelete(r); }}
                          className="contact-card-icon-btn"
                          title="Delete request"
                          style={{ color: "var(--red)" }}
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                      {!isOwn && r.requester?._id && (
                        <Link
                          to={`/chat/${r.requester._id}`}
                          className="contact-card-icon-btn contact-card-icon-chat"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MessageCircle size={16} />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showDelete && (
        <div className="modal-overlay" onClick={() => !deleting && setShowDelete(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-title">Delete Request</div>
            <div className="modal-desc">Delete the request for <strong>{showDelete.patientName}</strong>? This cannot be undone.</div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button className="btn btn-secondary" onClick={() => setShowDelete(null)} disabled={deleting}>Cancel</button>
              <button className="btn btn-danger" onClick={() => handleDelete(showDelete._id)} disabled={deleting}>
                {deleting ? <><Loader2 size={14} className="animate-spin" /> Deleting...</> : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
