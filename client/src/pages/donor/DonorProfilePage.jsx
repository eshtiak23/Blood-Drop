import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BLOOD_GROUP_COLORS } from "../../data/constants";
import donors from "../../data/donors.json";
import { addBookmark, isBookmarked, removeBookmark } from "../../services/localStore";
import { MapPin, Phone, Calendar, Droplets, Shield, Bookmark, ArrowLeft } from "lucide-react";

function getBloodGroupColor(bloodGroup) {
  const c = BLOOD_GROUP_COLORS[bloodGroup];
  if (!c) return {};
  const isDark = document.documentElement.classList.contains("dark");
  return { bg: isDark ? c.darkBg : c.bg, text: isDark ? c.darkText : c.text };
}

export default function DonorProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [donor, setDonor] = useState(null);
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    const found = donors.find((d) => d.id === id);
    setDonor(found || null);
    if (found) setBookmarked(isBookmarked(found.id));
  }, [id]);

  const toggleBookmark = () => {
    if (bookmarked) { removeBookmark(donor.id); setBookmarked(false); }
    else { addBookmark(donor.id, donor); setBookmarked(true); }
  };

  if (!donor) return <div className="container" style={{ padding: 40, textAlign: "center" }}>Donor not found</div>;

  const c = getBloodGroupColor(donor.bloodGroup);

  return (
    <div className="container" style={{ padding: "32px 20px", maxWidth: 800 }}>
      <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm" style={{ marginBottom: 16 }}><ArrowLeft size={16} /> Back</button>

      <div className="card animate-fadeIn">
        <div className="card-body">
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
            <div className="avatar avatar-xl" style={{ background: c.bg || "var(--red-light)", color: c.text || "var(--red)" }}>{donor.name?.charAt(0)?.toUpperCase()}</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <h1 style={{ fontSize: 24, fontWeight: 800 }}>{donor.name}</h1>
                {donor.isVerified && <span className="badge badge-green"><Shield size={12} /> Verified</span>}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-secondary)", marginTop: 4 }}><MapPin size={14} /> {donor.area}, {donor.district}</div>
              {donor.bloodGroup && <span className="badge" style={{ background: c.bg, color: c.text, marginTop: 10, fontSize: 14, padding: "6px 16px" }}>{donor.bloodGroup}</span>}
            </div>
          </div>

          <div className="separator" style={{ margin: "24px 0" }} />

          <div className="grid grid-2">
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Contact</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 14 }}>
                <a href={`tel:${donor.phone}`} style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text-secondary)", textDecoration: "none" }}><Phone size={14} /> {donor.phone}</a>
              </div>
            </div>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Donation Info</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 14 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text-secondary)" }}><Droplets size={14} /> {donor.totalDonations || 0} total donations</span>
                <span style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text-secondary)" }}><Calendar size={14} /> Last: {donor.lastDonationDate ? new Date(donor.lastDonationDate).toLocaleDateString() : "Never"}</span>
                <span style={{ display: "flex", alignItems: "center", gap: 8, color: donor.isAvailable ? "var(--green)" : "var(--text-muted)" }}>{donor.isAvailable ? "Available" : "Unavailable"}</span>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
            <a href={`tel:${donor.phone}`} className="btn btn-primary"><Phone size={16} /> Call Donor</a>
            <button className={`btn ${bookmarked ? "btn-primary" : "btn-secondary"}`} onClick={toggleBookmark}><Bookmark size={16} /> {bookmarked ? "Bookmarked" : "Bookmark"}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
