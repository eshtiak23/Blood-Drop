/**
 * AdminDashboardPage - Admin panel showing platform stats (users, donors, requests)
 * and a list of recent users with the ability to verify unverified donors.
 */
import { useState, useEffect } from "react";
import { Users, Heart, AlertCircle, Shield, CheckCircle } from "lucide-react";
import { getRequests } from "../../services/localStore";
import api from "../../services/api";

export default function AdminDashboardPage() {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);

  /** Loads users via admin API and computes dashboard stats on mount */
  useEffect(() => {
    Promise.all([
      api.get("/auth/users"),
      getRequests(),
    ]).then(([usersRes, requests]) => {
      const allUsers = usersRes.data.users;
      setUsers(allUsers.slice(0, 8));
      setStats({
        totalUsers: allUsers.length,
        totalDonors: allUsers.filter((u) => u.role !== "admin").length,
        openRequests: requests.filter((r) => r.status === "open").length,
        pendingVerifications: allUsers.filter((u) => u.role !== "admin" && !u.isVerified).length,
      });
    }).catch(console.error);
  }, []);

  /** Verifies a donor via admin API and updates local state */
  const verifyDonor = async (id) => {
    await api.patch(`/auth/users/${id}/verify`);
    setUsers(users.map((u) => u._id === id ? { ...u, isVerified: true } : u));
  };

  return (
    <div className="container" style={{ padding: "32px 20px" }}>
      <h1 style={{ fontSize: 24, fontWeight: 800 }}>Admin Dashboard</h1>
      <p style={{ color: "var(--text-secondary)", marginTop: 4 }}>Platform overview</p>

      {stats && (
        <div className="grid grid-4" style={{ marginTop: 24, gap: 16 }}>
          <div className="card" style={{ padding: 20 }}><div style={{ display: "flex", justifyContent: "space-between" }}><div><div style={{ fontSize: 13, color: "var(--text-secondary)" }}>Users</div><div style={{ fontSize: 28, fontWeight: 800, marginTop: 4 }}>{stats.totalUsers}</div></div><Users size={20} color="var(--purple)" /></div></div>
          <div className="card" style={{ padding: 20 }}><div style={{ display: "flex", justifyContent: "space-between" }}><div><div style={{ fontSize: 13, color: "var(--text-secondary)" }}>Donors</div><div style={{ fontSize: 28, fontWeight: 800, marginTop: 4 }}>{stats.totalDonors}</div></div><Heart size={20} color="var(--red)" /></div></div>
          <div className="card" style={{ padding: 20 }}><div style={{ display: "flex", justifyContent: "space-between" }}><div><div style={{ fontSize: 13, color: "var(--text-secondary)" }}>Open Requests</div><div style={{ fontSize: 28, fontWeight: 800, marginTop: 4 }}>{stats.openRequests}</div></div><AlertCircle size={20} color="var(--blue)" /></div></div>
          <div className="card" style={{ padding: 20 }}><div style={{ display: "flex", justifyContent: "space-between" }}><div><div style={{ fontSize: 13, color: "var(--text-secondary)" }}>Pending Verification</div><div style={{ fontSize: 28, fontWeight: 800, marginTop: 4 }}>{stats.pendingVerifications}</div></div><Shield size={20} color="var(--red)" /></div></div>
        </div>
      )}

      <div className="card" style={{ marginTop: 24 }}>
        <div className="card-body">
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Recent Users</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {users.map((u) => (
              <div key={u._id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderRadius: 8, border: "1px solid var(--border-light)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div className="avatar avatar-sm">{u.name?.charAt(0)?.toUpperCase()}</div>
                  <div><div style={{ fontWeight: 600, fontSize: 14 }}>{u.name}</div><div style={{ fontSize: 12, color: "var(--text-muted)" }}>{u.email}</div></div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span className={`badge ${u.role === "admin" ? "badge-red" : "badge-blue"}`}>{u.role}</span>
                  {u.role !== "admin" && !u.isVerified && <button className="btn btn-success btn-sm" onClick={() => verifyDonor(u._id)}><CheckCircle size={12} /> Verify</button>}
                </div>
              </div>
            ))
            }
          </div>
        </div>
      </div>
    </div>
  );
}
