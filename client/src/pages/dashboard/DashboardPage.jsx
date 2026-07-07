import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { searchRequests, getMyRequests } from "../../services/localStore";
import { BLOOD_GROUPS } from "../../data/constants";
import { Droplets, Heart, AlertCircle, Search, Plus, Users } from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [nearbyRequests, setNearbyRequests] = useState([]);

  useEffect(() => {
    const all = searchRequests();
    const stock = {};
    BLOOD_GROUPS.forEach((g) => { stock[g] = 0; });
    all.filter((r) => r.status === "open").forEach((r) => { stock[r.patientBloodGroup] = (stock[r.patientBloodGroup] || 0) + 1; });
    setStats(stock);

    if (user?.role === "donor" && user?.district) {
      setNearbyRequests(all.filter((r) => r.district === user.district && r.status === "open").slice(0, 3));
    }
    if (user?.role === "seeker") {
      setNearbyRequests(getMyRequests(user._id).slice(0, 3));
    }
  }, [user]);

  return (
    <div className="container" style={{ padding: "32px 20px" }}>
      <h1 style={{ fontSize: 24, fontWeight: 800 }}>Welcome back, {user?.name?.split(" ")[0]}</h1>
      <p style={{ color: "var(--text-secondary)", marginTop: 4 }}>Here's what's happening with your account</p>

      <div className="grid grid-4" style={{ marginTop: 24, gap: 16 }}>
        {user?.role === "donor" && (
          <>
            <div className="card" style={{ padding: 20 }}><div style={{ display: "flex", justifyContent: "space-between" }}><div><div style={{ fontSize: 13, color: "var(--text-secondary)" }}>Donations</div><div style={{ fontSize: 28, fontWeight: 800, marginTop: 4 }}>{user.totalDonations || 0}</div></div><Heart size={20} color="var(--red)" /></div></div>
            <div className="card" style={{ padding: 20 }}><div style={{ display: "flex", justifyContent: "space-between" }}><div><div style={{ fontSize: 13, color: "var(--text-secondary)" }}>Status</div><div style={{ fontSize: 28, fontWeight: 800, marginTop: 4, color: user.isAvailable ? "var(--green)" : "var(--text-muted)" }}>{user.isAvailable ? "Active" : "Off"}</div></div><Droplets size={20} color="var(--blue)" /></div></div>
          </>
        )}
        {stats && <>
          <div className="card" style={{ padding: 20 }}><div style={{ display: "flex", justifyContent: "space-between" }}><div><div style={{ fontSize: 13, color: "var(--text-secondary)" }}>Open Requests</div><div style={{ fontSize: 28, fontWeight: 800, marginTop: 4 }}>{Object.values(stats).reduce((a, b) => a + b, 0)}</div></div><AlertCircle size={20} color="var(--red)" /></div></div>
          <div className="card" style={{ padding: 20 }}><div style={{ display: "flex", justifyContent: "space-between" }}><div><div style={{ fontSize: 13, color: "var(--text-secondary)" }}>Blood Groups</div><div style={{ fontSize: 28, fontWeight: 800, marginTop: 4 }}>{Object.values(stats).filter((v) => v > 0).length}</div></div><Users size={20} color="var(--red)" /></div></div>
        </>}
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 24, flexWrap: "wrap" }}>
        {user?.role === "seeker" && <Link to="/requests/create" className="btn btn-primary"><Plus size={16} /> Create Request</Link>}
        <Link to="/donors" className="btn btn-secondary"><Search size={16} /> Find Donors</Link>
        <Link to="/requests" className="btn btn-ghost">View All Requests</Link>
      </div>

      {stats && (
        <div style={{ marginTop: 32 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Blood Stock Overview</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))", gap: 8 }}>
            {Object.entries(stats).map(([group, count]) => (
              <div key={group} style={{ textAlign: "center", padding: "12px 8px", borderRadius: 12, border: "1px solid var(--border-light)", background: "var(--bg-card)" }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: "var(--red)" }}>{count}</div>
                <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{group}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {nearbyRequests.length > 0 && (
        <div style={{ marginTop: 32 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>{user?.role === "donor" ? "Nearby Requests" : "My Requests"}</h2>
          <div className="grid grid-3">
            {nearbyRequests.map((r) => (
              <Link key={r._id} to={`/requests/${r._id}`} className="card" style={{ padding: 16 }}>
                <div style={{ display: "flex", gap: 6, marginBottom: 8 }}><span className="badge badge-pink">{r.patientBloodGroup}</span><span className={`badge ${r.status === "open" ? "badge-green" : "badge-blue"}`}>{r.status}</span></div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{r.patientName}</div>
                <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 4 }}>{r.hospital}</div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
