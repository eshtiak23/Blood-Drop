/**
 * DonorProfilePage - Shows detailed info for a single donor (matched by route param id).
 * Includes contact info, donation history, and a bookmark toggle button.
 */
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { BLOOD_GROUP_COLORS } from "../../data/constants";
import { addBookmark, isBookmarked, removeBookmark } from "../../services/localStore";
import * as friendService from "../../services/friendService";
import api from "../../services/api";
import { MapPin, Calendar, Droplets, Shield, Bookmark, ArrowLeft, MessageCircle, Loader2, UserPlus, Check, Clock3 } from "lucide-react";
import toast from "react-hot-toast";

/** Returns blood group badge colors based on dark/light theme */
function getBloodGroupColor(bloodGroup) {
  const c = BLOOD_GROUP_COLORS[bloodGroup];
  if (!c) return {};
  const isDark = document.documentElement.classList.contains("dark");
  return { bg: isDark ? c.darkBg : c.bg, text: isDark ? c.darkText : c.text };
}

export default function DonorProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [donor, setDonor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookmarked, setBookmarked] = useState(false);
  const [friendStatus, setFriendStatus] = useState(null);

  useEffect(() => {
    setLoading(true);
    api.get(`/donors/${id}`)
      .then((res) => setDonor(res.data.donor))
      .catch(() => setDonor(null))
      .finally(() => setLoading(false));
    isBookmarked(id).then(setBookmarked).catch(() => setBookmarked(false));
    if (isAuthenticated && user?._id !== id) {
      friendService.getStatus(id).then(setFriendStatus).catch(() => {});
    }
  }, [id, isAuthenticated, user]);

  const toggleBookmark = async () => {
    try {
      if (bookmarked) { await removeBookmark(id); setBookmarked(false); toast.success("Bookmark removed"); }
      else { await addBookmark(id); setBookmarked(true); toast.success("Bookmark added"); }
    } catch (err) {
      toast.error("Failed to update bookmark");
    }
  };

  const handleConnect = async () => {
    if (!isAuthenticated) { navigate("/login"); return; }
    try {
      const result = await friendService.sendRequest(id);
      if (result.autoAccepted) {
        toast.success("You are now connected! Phone number revealed.");
        setFriendStatus({ status: "accepted" });
      } else {
        toast.success("Connection request sent!");
        setFriendStatus({ status: "pending_sent" });
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to send request");
    }
  };

  if (loading) return <div className="container" style={{ padding: 40, textAlign: "center" }}><Loader2 size={24} className="animate-pulse" style={{ color: "var(--red)" }} /></div>;
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
              <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 14, color: "var(--text-secondary)" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {friendStatus?.status === "accepted"
                    ? <>Phone available in your connections</>
                    : <>Send a connection request to see phone number</>
                  }
                </span>
              </div>
            </div>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Donation Info</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 14 }}>
                {donor.age && <span style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text-secondary)" }}><Calendar size={14} /> Age: {donor.age}</span>}
                <span style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text-secondary)" }}><Droplets size={14} /> {donor.totalDonations || 0} total donations</span>
                <span style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text-secondary)" }}><Calendar size={14} /> Last: {donor.lastDonationDate ? new Date(donor.lastDonationDate).toLocaleDateString() : "Never"}</span>
                <span style={{ display: "flex", alignItems: "center", gap: 8, color: donor.isAvailable ? "var(--green)" : "var(--text-muted)" }}>{donor.isAvailable ? "Available" : "Unavailable"}</span>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
            <Link to={`/chat/${donor._id}`} className="btn btn-primary" style={{ display: "flex", alignItems: "center", gap: 6 }}><MessageCircle size={16} /> Chat</Link>
            {user?._id !== donor._id && (
              friendStatus?.status === "accepted" ? (
                <span className="btn btn-secondary" style={{ display: "flex", alignItems: "center", gap: 6, cursor: "default" }}><Check size={16} /> Connected</span>
              ) : friendStatus?.status === "pending_sent" ? (
                <span className="btn btn-secondary" style={{ display: "flex", alignItems: "center", gap: 6, cursor: "default", background: "#FEF3C7", color: "#D97706" }}><Clock3 size={16} /> Pending</span>
              ) : (
                <button className="btn btn-secondary" onClick={handleConnect} style={{ display: "flex", alignItems: "center", gap: 6 }}><UserPlus size={16} /> Connect</button>
              )
            )}
            <button className={`btn ${bookmarked ? "btn-primary" : "btn-secondary"}`} onClick={toggleBookmark}><Bookmark size={16} /> {bookmarked ? "Bookmarked" : "Bookmark"}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
