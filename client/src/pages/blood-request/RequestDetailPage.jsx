/**
 * RequestDetailPage - Full detail view of a single blood request.
 * Shows patient info, contact details, requester, and action buttons.
 * Donors can accept open requests; requester/acceptor can mark as complete.
 */
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import { acceptRequest, completeRequest, addRating, hasRated, deleteRequest } from "../../services/localStore";
import { BLOOD_GROUP_COLORS, URGENCY } from "../../data/constants";
import { MapPin, Phone, Calendar, Clock, Hospital, CheckCircle, ArrowLeft, Star, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

/** Returns themed background/text colors for a blood group badge. */
function getBloodGroupColor(bloodGroup) {
  const c = BLOOD_GROUP_COLORS[bloodGroup];
  if (!c) return {};
  const isDark = document.documentElement.classList.contains("dark");
  return { bg: isDark ? c.darkBg : c.bg, text: isDark ? c.darkText : c.text };
}

export default function RequestDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [showModal, setShowModal] = useState("");
  const [ratingForm, setRatingForm] = useState({ rating: 5, comment: "" });
  const [ratingSaving, setRatingSaving] = useState(false);
  const [rated, setRated] = useState(false);

  useEffect(() => {
    api.get(`/requests/${id}`)
      .then((res) => setRequest(res.data.request))
      .catch(() => setRequest(null));
    if (user?._id) {
      hasRated(id).then(setRated).catch(() => setRated(false));
    }
  }, [id, user]);

  // Poll for status updates while request is still open (so requester sees when donor accepts)
  useEffect(() => {
    if (request?.status !== "open") return;
    const interval = setInterval(() => {
      api.get(`/requests/${id}`).then((res) => setRequest(res.data.request)).catch(() => {});
    }, 15000);
    return () => clearInterval(interval);
  }, [id, request?.status]);

  const handleAction = async (action) => {
    try {
      let result;
      if (action === "accept") result = await acceptRequest(id);
      else if (action === "complete") result = await completeRequest(id);
      toast.success(action === "accept" ? "Request accepted!" : "Marked as complete!");
      if (result) setRequest(result);
      else {
        const res = await api.get(`/requests/${id}`);
        setRequest(res.data.request);
      }
      setShowModal("");
    } catch (err) {
      toast.error(`Failed to ${action}`);
      setShowModal("");
    }
  };

  /** Submit a rating for the other party after request completion */
  const handleRate = async (e) => {
    e.preventDefault();
    if (!ratingForm.comment.trim()) return;
    setRatingSaving(true);
    try {
      const isRequester = user?._id === request.requester?._id;
      const ratedUserId = isRequester ? request.acceptedBy?._id : request.requester?._id;
      await addRating({ requestId: id, ratedUserId, rating: ratingForm.rating, comment: ratingForm.comment });
      setRated(true);
      toast.success("Thanks for your rating!");
    } catch (err) {
      toast.error("Failed to submit rating");
    } finally {
      setRatingSaving(false);
    }
  };

  /** Delete the request and navigate back */
  const handleDelete = async () => {
    try {
      await deleteRequest(id);
      toast.success("Request deleted");
      navigate("/requests");
    } catch (err) {
      toast.error("Failed to delete request");
    }
  };

  if (!request) return (
    <div className="container" style={{ padding: 40, textAlign: "center" }}>
      <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm" style={{ marginBottom: 16 }}><ArrowLeft size={16} /> Back</button>
      <div className="empty-state">
        <div className="empty-state-title">Request not found</div>
        <div className="empty-state-desc">This request may have been deleted.</div>
      </div>
    </div>
  );

  const u = URGENCY.find((x) => x.value === request.urgency);
  const canAccept = request.status === "open" && user?._id !== request.requester?._id;
  const canComplete = (user?._id === request.requester?._id || user?._id === request.acceptedBy?._id) && request.status === "accepted";
  const canDelete = user?._id === request.requester?._id && request.status === "open";

  return (
    <div className="container" style={{ padding: "32px 20px", maxWidth: 800 }}>
      <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm" style={{ marginBottom: 16 }}><ArrowLeft size={16} /> Back</button>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
        <span className="badge" style={{ background: getBloodGroupColor(request.patientBloodGroup).bg, color: getBloodGroupColor(request.patientBloodGroup).text }}>{request.patientBloodGroup}</span>
        <span className={`badge ${u?.color || "badge-gray"}`}>{u?.label || "Unknown"}</span>
        <span className={`badge ${request.status === "open" ? "badge-green" : request.status === "completed" ? "badge-gray" : "badge-blue"}`}>{request.status}</span>
      </div>

      <h1 style={{ fontSize: 24, fontWeight: 800 }}>{request.patientName}</h1>

      <div className="grid grid-2" style={{ marginTop: 20, gap: 20 }}>
        <div className="card"><div className="card-body">
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Patient Information</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 14 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text-secondary)" }}><Hospital size={14} /> {request.hospital}</span>
            <span style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text-secondary)" }}><MapPin size={14} /> {request.area}, {request.district}</span>
            <span style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text-secondary)" }}><Calendar size={14} /> Needed by: {request.dateNeeded ? new Date(request.dateNeeded).toLocaleDateString() : "ASAP"}</span>
            <span style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text-secondary)" }}><Clock size={14} /> Created: {new Date(request.createdAt).toLocaleDateString()}</span>
            <div className="separator" />
            <span style={{ fontWeight: 600 }}>{request.unitsRequired} unit(s) of {request.patientBloodGroup} blood needed</span>
          </div>
        </div></div>

        <div className="card"><div className="card-body">
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Contact Details</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 14 }}>
            {user?._id === request.requester?._id && (
              <span style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text-secondary)" }}><Phone size={14} /> {request.contactNumber}</span>
            )}
            {request.description && <div style={{ background: "var(--red-light)", padding: 12, borderRadius: 8, fontSize: 14 }}>{request.description}</div>}
            <div className="separator" />
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8 }}>Requested by</div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div className="avatar avatar-sm">{request.requester?.name?.charAt(0)}</div>
                <div><div style={{ fontWeight: 600, fontSize: 14 }}>{request.requester?.name}</div></div>
              </div>
            </div>
            {/* Show accepted donor's phone to the request owner */}
            {request.status === "accepted" && request.acceptedBy && user?._id === request.requester?._id && (
              <>
                <div className="separator" />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8 }}>Donor Contact</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div className="avatar avatar-sm" style={{ background: "#ECFDF5", color: "#059669" }}>{request.acceptedBy.name?.charAt(0)}</div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{request.acceptedBy.name}</div>
                      {request.acceptedBy.phone && (
                        <a href={`tel:${request.acceptedBy.phone}`} style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--red)", textDecoration: "none", fontSize: 13, fontWeight: 600, marginTop: 2 }}>
                          <Phone size={12} /> {request.acceptedBy.phone}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
            {/* Show requester's phone to the accepted donor */}
            {request.status === "accepted" && request.acceptedBy && user?._id === request.acceptedBy?._id && (
              <>
                <div className="separator" />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8 }}>Requester Contact</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div className="avatar avatar-sm" style={{ background: "#EFF6FF", color: "#2563EB" }}>{request.requester?.name?.charAt(0)}</div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{request.requester?.name}</div>
                      {request.contactNumber && (
                        <a href={`tel:${request.contactNumber}`} style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--red)", textDecoration: "none", fontSize: 13, fontWeight: 600, marginTop: 2 }}>
                          <Phone size={12} /> {request.contactNumber}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div></div>
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
        {canAccept && <button className="btn btn-primary" onClick={() => setShowModal("accept")}><CheckCircle size={16} /> Accept Request</button>}
        {canComplete && <button className="btn btn-success" onClick={() => setShowModal("complete")}><CheckCircle size={16} /> Mark Complete</button>}
        {canDelete && <button className="btn btn-danger" onClick={() => setShowModal("delete")}><Trash2 size={16} /> Delete</button>}
      </div>

      {/* ── Rate After Completion (only for participants) ── */}
      {request.status === "completed" && user?._id && (user?._id === request.requester?._id || user?._id === request.acceptedBy?._id) && request.acceptedBy && (
        <div className="card animate-fadeIn" style={{ marginTop: 20 }}>
          <div className="card-body">
            {rated ? (
              <div style={{ textAlign: "center", padding: "12px 0", color: "var(--green)", fontWeight: 600, fontSize: 14 }}>
                <CheckCircle size={18} style={{ verticalAlign: "middle", marginRight: 6 }} />
                You have already rated this donation. Thank you!
              </div>
            ) : (
              <form onSubmit={handleRate}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                  <Star size={18} fill="#F59E0B" color="#F59E0B" />
                  <h2 style={{ fontSize: 16, fontWeight: 700 }}>
                    Rate the {user?._id === request.requester?._id ? "Donor" : "Requester"}
                  </h2>
                </div>
                <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 12 }}>
                  How was your experience with {user?._id === request.requester?._id ? request.acceptedBy?.name : request.requester?.name}?
                </p>
                <div style={{ display: "flex", gap: 4, marginBottom: 12 }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} type="button" onClick={() => setRatingForm({ ...ratingForm, rating: star })} style={{ background: "none", border: "none", cursor: "pointer", padding: 2 }}>
                      <Star size={24} fill={star <= ratingForm.rating ? "#F59E0B" : "none"} color={star <= ratingForm.rating ? "#F59E0B" : "var(--text-muted)"} />
                    </button>
                  ))}
                </div>
                <div className="input-group" style={{ marginBottom: 12 }}>
                  <textarea className="input" rows={2} placeholder="Share your experience..." value={ratingForm.comment} onChange={(e) => setRatingForm({ ...ratingForm, comment: e.target.value })} required />
                </div>
                <button className="btn btn-primary btn-sm" type="submit" disabled={ratingSaving}>
                  {ratingSaving ? "Saving..." : "Submit Rating"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal("")}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-title">
              {showModal === "accept" ? "Accept Blood Request" : showModal === "complete" ? "Complete Request" : "Delete Request"}
            </div>
            <div className="modal-desc">
              {showModal === "accept" ? "Are you sure you want to accept this request?" : showModal === "complete" ? "Mark this request as completed?" : `Delete the request for ${request.patientName}? This cannot be undone.`}
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button className="btn btn-secondary" onClick={() => setShowModal("")}>Cancel</button>
              <button className={showModal === "delete" ? "btn btn-danger" : "btn btn-primary"} onClick={() => showModal === "delete" ? handleDelete() : handleAction(showModal)}>Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
