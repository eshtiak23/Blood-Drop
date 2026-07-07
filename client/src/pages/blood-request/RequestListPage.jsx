import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { searchRequests } from "../../services/localStore";
import { BLOOD_GROUPS, BLOOD_GROUP_COLORS, DISTRICTS, URGENCY } from "../../data/constants";
import { MapPin, Clock, Plus, AlertCircle } from "lucide-react";

export default function RequestListPage() {
  const [filters, setFilters] = useState({ bloodGroup: "", district: "", urgency: "" });
  const [requests, setRequests] = useState([]);

  useEffect(() => { setRequests(searchRequests(filters)); }, [filters]);

  return (
    <div className="container" style={{ padding: "32px 20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800 }}>Blood Requests</h1>
          <p style={{ color: "var(--text-secondary)", marginTop: 4 }}>Find and respond to blood requests</p>
        </div>
        <Link to="/requests/create" className="btn btn-primary"><Plus size={16} /> Create Request</Link>
      </div>

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
          <div className="empty-state"><div className="empty-state-icon"><AlertCircle size={28} color="var(--purple)" /></div><div className="empty-state-title">No blood requests</div><div className="empty-state-desc">Be the first to create a request</div></div>
        ) : (
          <div className="grid grid-3">
            {requests.map((r) => {
              const u = URGENCY.find((x) => x.value === r.urgency);
              return (
                <Link key={r._id} to={`/requests/${r._id}`} className="card" style={{ padding: 20 }}>
                  <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
                    <span className="badge" style={{ background: BLOOD_GROUP_COLORS[r.patientBloodGroup]?.bg, color: BLOOD_GROUP_COLORS[r.patientBloodGroup]?.text }}>{r.patientBloodGroup}</span>
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
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
