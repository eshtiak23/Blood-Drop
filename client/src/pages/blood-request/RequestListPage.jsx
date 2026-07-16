/**
 * RequestListPage - Displays a searchable/filterable list of blood requests.
 * Allows users to browse open requests by blood group, district, and urgency.
 * Each card links to the full detail view of that request.
 * Contact button shows requester phone. Delete button for own requests.
 */
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { searchRequests, deleteRequest } from "../../services/localStore";
import { BLOOD_GROUPS, BLOOD_GROUP_COLORS, DISTRICTS, URGENCY } from "../../data/constants";
import { MapPin, Clock, Plus, AlertCircle, Phone, Trash2, MessageCircle } from "lucide-react";
import toast from "react-hot-toast";

/** Returns themed background/text colors for a blood group badge. */
function getBloodGroupColor(bloodGroup) {
  const c = BLOOD_GROUP_COLORS[bloodGroup];
  if (!c) return {};
  const isDark = document.documentElement.classList.contains("dark");
  return { bg: isDark ? c.darkBg : c.bg, text: isDark ? c.darkText : c.text };
}

export default function RequestListPage() {
  const { user } = useAuth();
  const [filters, setFilters] = useState({ bloodGroup: "", district: "", urgency: "" });
  const [requests, setRequests] = useState([]);
  const [showDelete, setShowDelete] = useState(null);

  useEffect(() => {
    searchRequests(filters).then(setRequests).catch(() => setRequests([]));
  }, [filters]);

  const handleDelete = async (requestId) => {
    try {
      await deleteRequest(requestId);
      toast.success("Request deleted");
      const updated = await searchRequests(filters);
      setRequests(updated);
      setShowDelete(null);
    } catch (err) {
      toast.error("Failed to delete request");
    }
  };

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
      <div style={{ display: "flex", gap: 12, marginTop: 20, flexWrap: "wrap" }}>
        <select className="input" style={{ flex: 1, minWidth: 140 }} value={filters.bloodGroup} onChange={(e) => setFilters({ ...filters, bloodGroup: e.target.value })}>
          <option value="">All Groups</option>{BLOOD_GROUPS.map((g) => <option key={g} value={g}>{g}</option>)}
        </select>
        <select className="input" style={{ flex: 1, minWidth: 140 }} value={filters.district} onChange={(e) => setFilters({ ...filters, district: e.target.value })}>
          <option value="">All Districts</option>{DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
        <select className="input" style={{ flex: 1, minWidth: 140 }} value={filters.urgency} onChange={(e) => setFilters({ ...filters, urgency: e.target.value })}>
          <option value="">All Urgency</option>{URGENCY.map((u) => <option key={u.value} value={u.value}>{u.label}</option>)}
        </select>
      </div>

      <div style={{ marginTop: 24 }}>
        {requests.length === 0 ? (
          <div className="empty-state"><div className="empty-state-icon"><AlertCircle size={28} color="var(--red)" /></div><div className="empty-state-title">No blood requests</div><div className="empty-state-desc">Be the first to create a request</div></div>
        ) : (
          <div className="grid grid-3">
            {requests.map((r) => {
              const u = URGENCY.find((x) => x.value === r.urgency);
              const isOwn = user?._id && user._id === r.requester?._id;
              const rc = getBloodGroupColor(r.patientBloodGroup);
              return (
                <div key={r._id} className="contact-card" style={{ position: "relative" }}>
                  {/* Delete button — only for own requests */}
                  {isOwn && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setShowDelete(r); }}
                      style={{ position: "absolute", top: 12, right: 12, background: "none", border: "none", color: "var(--text-muted)", padding: 4, borderRadius: 6, transition: "all 0.2s", zIndex: 2 }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = "#EF4444"; e.currentTarget.style.background = "var(--red-light)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-muted)"; e.currentTarget.style.background = "none"; }}
                      title="Delete request"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}

                  <div className="contact-card-top">
                    <div className="contact-card-avatar" style={{ background: `linear-gradient(135deg, ${rc.text || "#EF4444"}, ${rc.text || "#DC2626"}88)` }}>
                      {r.patientName?.charAt(0)?.toUpperCase()}
                    </div>
                    {r.patientBloodGroup && (
                      <div className="contact-card-blood-badge" style={{ background: rc.text || "#EF4444" }}>
                        {r.patientBloodGroup}
                      </div>
                    )}
                  </div>
                  <Link to={`/requests/${r._id}`} style={{ textDecoration: "none", color: "inherit" }}>
                    <div className="contact-card-name">{r.patientName}</div>
                    <div className="contact-card-location">
                      <MapPin size={13} /> {r.area}, {r.district}
                    </div>
                  </Link>
                  <div className="contact-card-stats">
                    <span className="contact-card-stat"><Droplets size={13} /> {r.unitsRequired} unit(s)</span>
                    <span className="contact-card-stat"><Clock size={13} /> {r.dateNeeded ? new Date(r.dateNeeded).toLocaleDateString() : "ASAP"}</span>
                  </div>
                  <div className="contact-card-status">
                    <span className="contact-card-status-dot" style={{ background: r.status === "open" ? "#22C55E" : "#9CA3AF" }} />
                    <span style={{ color: r.status === "open" ? "#22C55E" : "var(--text-muted)" }}>{r.status === "open" ? "Open" : "Completed"}</span>
                  </div>
                  {!isOwn && (
                    <div className="contact-card-actions">
                      {r.contactNumber && (
                        <a href={`tel:${r.contactNumber}`} className="contact-card-btn-call" onClick={(e) => e.stopPropagation()}>
                          <Phone size={18} />
                        </a>
                      )}
                      <Link to={`/chat/${r.requester?._id}`} className="contact-card-btn-primary" onClick={(e) => e.stopPropagation()}>
                        <MessageCircle size={14} /> Chat
                      </Link>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Delete Confirmation Modal ── */}
      {showDelete && (
        <div className="modal-overlay" onClick={() => setShowDelete(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-title">Delete Request</div>
            <div className="modal-desc">Are you sure you want to delete the request for <strong>{showDelete.patientName}</strong>? This cannot be undone.</div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button className="btn btn-secondary" onClick={() => setShowDelete(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => handleDelete(showDelete._id)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
