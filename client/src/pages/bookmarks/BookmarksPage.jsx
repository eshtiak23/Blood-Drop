/**
 * BookmarksPage - Displays a list of donors the user has bookmarked for quick access.
 * Users can view saved donors and remove bookmarks from this page.
 */
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getBookmarks, removeBookmark } from "../../services/localStore";
import { BLOOD_GROUP_COLORS } from "../../data/constants";
import { Bookmark, MapPin, Droplets, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

/** Returns blood group badge colors based on dark/light theme */
function getBloodGroupColor(bloodGroup) {
  const c = BLOOD_GROUP_COLORS[bloodGroup];
  if (!c) return {};
  const isDark = document.documentElement.classList.contains("dark");
  return { bg: isDark ? c.darkBg : c.bg, text: isDark ? c.darkText : c.text };
}

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState([]);

  useEffect(() => { getBookmarks().then(setBookmarks).catch(() => setBookmarks([])); }, []);

  const remove = async (donorId) => {
    try {
      await removeBookmark(donorId);
      getBookmarks().then(setBookmarks);
      toast.success("Bookmark removed");
    } catch (err) {
      toast.error("Failed to remove bookmark");
    }
  };

  return (
    <div className="container" style={{ padding: "32px 20px" }}>
      <h1 style={{ fontSize: 24, fontWeight: 800 }}>Bookmarked Donors</h1>
      <p style={{ color: "var(--text-secondary)", marginTop: 4 }}>Your saved donors for quick access</p>

      <div style={{ marginTop: 24 }}>
        {bookmarks.length === 0 ? (
          <div className="empty-state"><div className="empty-state-icon"><Bookmark size={28} color="var(--red)" /></div><div className="empty-state-title">No bookmarks yet</div><div className="empty-state-desc">Save donors you trust for quick access</div>
            <Link to="/donors" className="btn btn-primary" style={{ marginTop: 16 }}>Find Donors</Link></div>
        ) : (
          <div className="grid grid-3">
            {bookmarks.map((b) => {
              const d = b.donorId;
              const c = getBloodGroupColor(d.bloodGroup);
              return (
                <div key={b._id} className="contact-card">
                  <div className="contact-card-top">
                    <div className="contact-card-avatar" style={{ background: `linear-gradient(135deg, ${c.text || "#EF4444"}, ${c.text || "#DC2626"}88)` }}>
                      {d.name?.charAt(0)?.toUpperCase()}
                    </div>
                    {d.bloodGroup && (
                      <div className="contact-card-blood-badge" style={{ background: c.text || "#EF4444" }}>
                        {d.bloodGroup}
                      </div>
                    )}
                  </div>
                  <div className="contact-card-name">{d.name}</div>
                  <div className="contact-card-location">
                    <MapPin size={13} /> {d.area}, {d.district}
                  </div>
                  <div className="contact-card-stats">
                    <span className="contact-card-stat"><Droplets size={13} /> {d.totalDonations || 0} donations</span>
                    <span className="contact-card-stat"><Calendar size={13} /> {d.lastDonationDate ? new Date(d.lastDonationDate).toLocaleDateString() : "Never"}</span>
                  </div>
                  <div className="contact-card-actions">
                    <button className="contact-card-btn-primary" style={{ background: "var(--red-light)", color: "var(--red)" }} onClick={() => remove(d._id)}>
                      <Trash2 size={14} /> Remove
                    </button>
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
