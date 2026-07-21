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
import { MapPin, Phone, Calendar, Clock, Hospital, CheckCircle, ArrowLeft, Star, Trash2, Loader2, Mail } from "lucide-react";
import toast from "react-hot-toast";

function getBloodGroupColor(bloodGroup) {
  const c = BLOOD_GROUP_COLORS[bloodGroup];
  if (!c) return {};
  const isDark = document.documentElement.classList.contains("dark");
  return { bg: isDark ? c.darkBg : c.bg, text: isDark ? c.darkText : c.text };
}

function getStatusStyle(status) {
  switch (status) {
    case "open": return { color: "#22C55E", label: "Open", dot: "#22C55E" };
    case "accepted": return { color: "#3B82F6", label: "Accepted", dot: "#3B82F6" };
    case "completed": return { color: "#10B981", label: "Completed", dot: "#10B981" };
    case "cancelled": return { color: "#9CA3AF", label: "Cancelled", dot: "#9CA3AF" };
    default: return { color: "var(--text-muted)", label: status, dot: "var(--text-muted)" };
  }
}

export default function RequestDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [ratingForm, setRatingForm] = useState({ rating: 5, comment: "" });
  const [ratingSaving, setRatingSaving] = useState(false);
  const [rated, setRated] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get(`/requests/${id}`)
      .then((res) => { setRequest(res.data.request); setLoading(false); })
      .catch(() => { setRequest(null); setLoading(false); });
    if (user?._id) {
      hasRated(id).then(setRated).catch(() => setRated(false));
    }
  }, [id, user]);

  // Poll for status updates while request is open or accepted
  useEffect(() => {
    if (!request || request.status === "completed" || request.status === "cancelled") return;
    const interval = setInterval(() => {
      api.get(`/requests/${id}`).then((res) => setRequest(res.data.request)).catch(() => {});
    }, 15000);
    return () => clearInterval(interval);
  }, [id, request?.status]);

  const handleAction = async (action) => {
    if (submitting) return;
    setSubmitting(true);
    try {
      let result;
      if (action === "accept") result = await acceptRequest(id);
      else if (action === "complete") result = await completeRequest(id);
      if (result) {
        setRequest(result);
        toast.success(action === "accept" ? "Request accepted!" : "Marked as complete!");
      } else {
        const res = await api.get(`/requests/${id}`);
        setRequest(res.data.request);
        toast.success(action === "accept" ? "Request accepted!" : "Marked as complete!");
      }
      setShowModal("");
    } catch (err) {
      toast.error(err?.response?.data?.error || `Failed to ${action}`);
    } finally {
      setSubmitting(false);
    }
  };

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
    } catch {
      toast.error("Failed to submit rating");
    } finally {
      setRatingSaving(false);
    }
  };

  const handleDelete = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await deleteRequest(id);
      setShowModal("");
      toast.success("Request deleted");
      navigate("/requests");
    } catch (err) {
      toast.error(err?.response?.data?.error || "Failed to delete request");
      setShowModal("");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <div className="loading-spinner" />
      </div>
    );
  }

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
  const st = getStatusStyle(request.status);
  const canAccept = request.status === "open" && user?._id !== request.requester?._id;
  const canComplete = (user?._id === request.requester?._id || user?._id === request.acceptedBy?._id) && request.status === "accepted";
  const canDelete = user?._id === request.requester?._id && (request.status === "open" || request.status === "accepted");
  const isParticipant = user?._id === request.requester?._id || user?._id === request.acceptedBy?._id;

  return (
    <div className="container" style={{ padding: "32px 20px", maxWidth: 800 }}>
      <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm" style={{ marginBottom: 16 }}><ArrowLeft size={16} /> Back</button>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16, alignItems: "center" }}>
        <span className="badge" style={{ background: getBloodGroupColor(request.patientBloodGroup).bg, color: getBloodGroupColor(request.patientBloodGroup).text }}>{request.patientBloodGroup}</span>
        {u && <span className={`badge ${u.color || "badge-gray"}`}>{u.label}</span>}
        <span className={`badge status-badge-animate ${request.status === "completed" ? "badge-green" : request.status === "accepted" ? "badge-blue" : request.status === "cancelled" ? "badge-gray" : "badge-green"}`}>
          {st.label}
        </span>
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
            {/* Requester sees their own phone */}
            {user?._id === request.requester?._id && (
              <span style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text-secondary)" }}><Phone size={14} /> {request.contactNumber}</span>
            )}
            {request.requester?.email && (
              <a href={`mailto:${request.requester.email}`} style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--red)", textDecoration: "none", fontWeight: 600 }}><Mail size={14} /> {request.requester.email}</a>
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
            {/* Requester sees donor contact after acceptance */}
            {request.status === "accepted" && request.acceptedBy && user?._id === request.requester?._id && (
              <>
                <div className="separator" />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8 }}>Donor Contact</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div className="avatar avatar-sm" style={{ background: "#ECFDF5", color: "#059669" }}>{request.acceptedBy.name?.charAt(0)}</div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{request.acceptedBy.name}</div>
                      {request.acceptedBy.email && (
                        <a href={`mailto:${request.acceptedBy.email}`} style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--red)", textDecoration: "none", fontSize: 13, fontWeight: 600, marginTop: 2 }}>
                          <Mail size={12} /> {request.acceptedBy.email}
                        </a>
                      )}
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
            {/* Donor sees requester contact after acceptance */}
            {request.status === "accepted" && request.acceptedBy && user?._id === request.acceptedBy?._id && (
              <>
                <div className="separator" />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8 }}>Requester Contact</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div className="avatar avatar-sm" style={{ background: "#EFF6FF", color: "#2563EB" }}>{request.requester?.name?.charAt(0)}</div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{request.requester?.name}</div>
                      {request.requester?.email && (
                        <a href={`mailto:${request.requester.email}`} style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--red)", textDecoration: "none", fontSize: 13, fontWeight: 600, marginTop: 2 }}>
                          <Mail size={12} /> {request.requester.email}
                        </a>
                      )}
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
        {canAccept && <button className="btn btn-primary" onClick={() => setShowModal("accept")} disabled={submitting}><CheckCircle size={16} /> Accept Request</button>}
        {canComplete && <button className="btn btn-success" onClick={() => setShowModal("complete")} disabled={submitting}><CheckCircle size={16} /> Mark Complete</button>}
        {canDelete && <button className="btn btn-danger" onClick={() => setShowModal("delete")} disabled={submitting}><Trash2 size={16} /> Delete</button>}
      </div>

      {/* Rating form after completion */}
      {request.status === "completed" && user?._id && isParticipant && request.acceptedBy && (
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
        <div className="modal-overlay" onClick={() => !submitting && setShowModal("")}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-title">
              {showModal === "accept" ? "Accept Blood Request" : showModal === "complete" ? "Complete Request" : "Delete Request"}
            </div>
            <div className="modal-desc">
              {showModal === "accept" ? "Are you sure you want to accept this request?" : showModal === "complete" ? "Mark this request as completed?" : `Delete the request for ${request.patientName}? This cannot be undone.`}
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button className="btn btn-secondary" onClick={() => setShowModal("")} disabled={submitting}>Cancel</button>
              <button className={showModal === "delete" ? "btn btn-danger" : "btn btn-primary"} onClick={() => showModal === "delete" ? handleDelete() : handleAction(showModal)} disabled={submitting}>
                {submitting ? <><Loader2 size={14} className="animate-spin" /> Processing...</> : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
