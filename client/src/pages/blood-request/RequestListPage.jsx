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
import { MapPin, Clock, Plus, AlertCircle, Phone, Trash2 } from "lucide-react";

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
    await deleteRequest(requestId);
    const updated = await searchRequests(filters);
    setRequests(updated);
    setShowDelete(null);
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
              return (
                <div key={r._id} className="card" style={{ padding: 20, position: "relative" }}>
                  {/* Delete button — only for own requests */}
                  {isOwn && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setShowDelete(r); }}
                      style={{ position: "absolute", top: 12, right: 12, background: "none", border: "none", color: "var(--text-muted)", padding: 4, borderRadius: 6, transition: "all 0.2s" }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = "#EF4444"; e.currentTarget.style.background = "var(--red-light)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-muted)"; e.currentTarget.style.background = "none"; }}
                      title="Delete request"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}

                  <Link to={`/requests/${r._id}`} style={{ textDecoration: "none", color: "inherit" }}>
                    <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
                      <span className="badge" style={{ background: getBloodGroupColor(r.patientBloodGroup).bg, color: getBloodGroupColor(r.patientBloodGroup).text }}>{r.patientBloodGroup}</span>
                      <span className={`badge ${u?.color || "badge-gray"}`}>{u?.label}</span>
                      <span className={`badge ${r.status === "open" ? "badge-green" : r.status === "completed" ? "badge-gray" : "badge-blue"}`}>{r.status}</span>
                    </div>
                    <h3 style={{ fontSize: 16, fontWeight: 700 }}>{r.patientName}</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8, fontSize: 13, color: "var(--text-secondary)" }}>
                      <span>{r.hospital}</span>
                      <span style={{ display: "flex", alignItems: "center", gap: 4 }}><MapPin size={12} /> {r.area}, {r.district}</span>
                      <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Clock size={12} /> {r.dateNeeded ? new Date(r.dateNeeded).toLocaleDateString() : "ASAP"}</span>
                    </div>
                    <div style={{ marginTop: 12, fontSize: 13, color: "var(--text-muted)" }}>{r.unitsRequired} unit(s) needed</div>
                  </Link>

                  {/* Call button — for other users only */}
                  {!isOwn && r.contactNumber && (
                    <a
                      href={`tel:${r.contactNumber}`}
                      className="btn btn-secondary btn-sm"
                      style={{ marginTop: 12, width: "100%", gap: 6, textDecoration: "none" }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Phone size={14} /> Call
                    </a>
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
