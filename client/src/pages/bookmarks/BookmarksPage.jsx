import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getBookmarks, removeBookmark } from "../../services/localStore";
import { BLOOD_GROUP_COLORS } from "../../data/constants";
import { Bookmark, MapPin, Droplets, Trash2 } from "lucide-react";

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState([]);

  useEffect(() => { setBookmarks(getBookmarks()); }, []);

  const remove = (donorId) => { removeBookmark(donorId); setBookmarks(getBookmarks()); };

  return (
    <div className="container" style={{ padding: "32px 20px" }}>
      <h1 style={{ fontSize: 24, fontWeight: 800 }}>Bookmarked Donors</h1>
      <p style={{ color: "var(--text-secondary)", marginTop: 4 }}>Your saved donors for quick access</p>

      <div style={{ marginTop: 24 }}>
        {bookmarks.length === 0 ? (
          <div className="empty-state"><div className="empty-state-icon"><Bookmark size={28} color="var(--purple)" /></div><div className="empty-state-title">No bookmarks yet</div><div className="empty-state-desc">Save donors you trust for quick access</div>
            <Link to="/donors" className="btn btn-primary" style={{ marginTop: 16 }}>Find Donors</Link></div>
        ) : (
          <div className="grid grid-3">
            {bookmarks.map((b) => {
              const d = b.donor;
              const c = BLOOD_GROUP_COLORS[d.bloodGroup] || {};
              return (
                <div key={b._id} className="card" style={{ padding: 20 }}>
                  <div style={{ display: "flex", alignItems: "start", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <div className="avatar" style={{ background: c.bg, color: c.text }}>{d.name?.charAt(0)}</div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{d.name}</div>
                        <div style={{ fontSize: 13, color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 4 }}><MapPin size={12} /> {d.area}, {d.district}</div>
                      </div>
                    </div>
                    {d.bloodGroup && <span className="badge" style={{ background: c.bg, color: c.text }}>{d.bloodGroup}</span>}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
                    <span style={{ fontSize: 13, color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 4 }}><Droplets size={12} /> {d.totalDonations || 0} donations</span>
                    <button className="btn btn-ghost btn-sm" style={{ color: "#EF4444" }} onClick={() => remove(d._id)}><Trash2 size={14} /> Remove</button>
                  </div>
                </div>
              );
            })}
          </div>
        )
        }
      </div>
    </div>
  );
}
