/**
 * RequestDetailPage - Full detail view of a single blood request.
 * Shows patient info, contact details, requester, and action buttons.
 * Donors can accept open requests; requester/acceptor can mark as complete.
 */
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getRequests, acceptRequest, completeRequest } from "../../services/localStore";
import { BLOOD_GROUP_COLORS, URGENCY, STATUS } from "../../data/constants";
import { MapPin, Phone, Calendar, Clock, User, Hospital, CheckCircle, ArrowLeft } from "lucide-react";

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

  useEffect(() => {
    const found = getRequests().find((r) => r._id === id);
    setRequest(found || null);
  }, [id]);

  const handleAction = (action) => {
    if (action === "accept") acceptRequest(id, user);   // Donor accepts the request → status becomes "accepted"
    if (action === "complete") completeRequest(id);       // Requester or accepted donor marks it done → status becomes "completed"
    const found = getRequests().find((r) => r._id === id);
    setRequest(found);
    setShowModal("");
  };

  if (!request) return <div className="container" style={{ padding: 40, textAlign: "center" }}>Request not found</div>;

  const u = URGENCY.find((x) => x.value === request.urgency);
  // Any logged-in user can accept open requests (everyone is both donor and seeker)
  const canAccept = request.status === "open";
  // Only the original requester or the accepted donor can mark a request complete
  const canComplete = (user?._id === request.requester?._id || user?._id === request.acceptedBy?._id) && request.status === "accepted";

  return (
    <div className="container" style={{ padding: "32px 20px", maxWidth: 800 }}>
      <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm" style={{ marginBottom: 16 }}><ArrowLeft size={16} /> Back</button>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
        <span className="badge" style={{ background: getBloodGroupColor(request.patientBloodGroup).bg, color: getBloodGroupColor(request.patientBloodGroup).text }}>{request.patientBloodGroup}</span>
        <span className={`badge ${u?.color || ""}`}>{u?.label}</span>
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
            <span style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text-secondary)" }}><Phone size={14} /> {request.contactNumber}</span>
            {request.description && <div style={{ background: "var(--red-light)", padding: 12, borderRadius: 8, fontSize: 14 }}>{request.description}</div>}
            <div className="separator" />
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8 }}>Requested by</div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div className="avatar avatar-sm">{request.requester?.name?.charAt(0)}</div>
                <div><div style={{ fontWeight: 600, fontSize: 14 }}>{request.requester?.name}</div></div>
              </div>
            </div>
          </div>
        </div></div>
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
        {/* Accept: shown only to donors when request is open */}
        {canAccept && <button className="btn btn-primary" onClick={() => setShowModal("accept")}><CheckCircle size={16} /> Accept Request</button>}
        {/* Complete: shown to requester or accepted donor when request is accepted */}
        {canComplete && <button className="btn btn-success" onClick={() => setShowModal("complete")}><CheckCircle size={16} /> Mark Complete</button>}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal("")}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-title">{showModal === "accept" ? "Accept Blood Request" : "Complete Request"}</div>
            <div className="modal-desc">{showModal === "accept" ? "Are you sure you want to accept this request?" : "Mark this request as completed?"}</div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button className="btn btn-secondary" onClick={() => setShowModal("")}>Cancel</button>
              <button className="btn btn-primary" onClick={() => handleAction(showModal)}>Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
