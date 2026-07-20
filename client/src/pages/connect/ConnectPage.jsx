/**
 * ConnectPage.jsx — Connection Management
 *
 * Two-tab page for managing friend/connection requests:
 * - Pending Requests tab: Shows incoming requests with accept/reject
 * - My Connections tab: Shows accepted connections with phone + chat
 *
 * Features:
 * - Stats banner (total, pending, connected counts)
 * - Animated tab switching
 * - Phone reveal only for connected users
 * - Click connected person to view info modal
 * - Disconnect button to remove connections
 * - Empty state illustrations
 */

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Users, UserPlus, Phone, MessageCircle, Check, X as XIcon, Clock, Search, Sparkles, Droplets, MapPin, Unlink, X } from "lucide-react";
import * as friendService from "../../services/friendService";
import toast from "react-hot-toast";

const BLOOD_GROUP_COLORS = {
  "A+": { bg: "#FEE2E2", text: "#DC2626" }, "A-": { bg: "#FEF3C7", text: "#D97706" },
  "B+": { bg: "#DBEAFE", text: "#2563EB" }, "B-": { bg: "#E0E7FF", text: "#4F46E5" },
  "AB+": { bg: "#F3E8FF", text: "#7C3AED" }, "AB-": { bg: "#FCE7F3", text: "#DB2777" },
  "O+": { bg: "#ECFDF5", text: "#059669" }, "O-": { bg: "#F0FDF4", text: "#15803D" },
};

export default function ConnectPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("pending");
  const [pending, setPending] = useState([]);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [disconnecting, setDisconnecting] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [pendingData, friendsData] = await Promise.all([
        friendService.getPending(),
        friendService.getFriends(),
      ]);
      setPending(pendingData);
      setFriends(friendsData);
    } catch {
      toast.error("Failed to load connections");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (selectedFriend) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [selectedFriend]);

  const handleAccept = async (requestId) => {
    setActionId(requestId);
    try {
      await friendService.acceptRequest(requestId);
      const [pendingData, friendsData] = await Promise.all([
        friendService.getPending(),
        friendService.getFriends(),
      ]);
      setPending(pendingData);
      setFriends(friendsData);
      window.dispatchEvent(new Event("friendsUpdated"));
      toast.success("Connected!");
    } catch {
      toast.error("Failed to accept");
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async (requestId) => {
    setActionId(requestId);
    try {
      await friendService.rejectRequest(requestId);
      setPending((prev) => prev.filter((r) => r._id !== requestId));
      window.dispatchEvent(new Event("friendsUpdated"));
      toast.success("Request rejected");
    } catch {
      toast.error("Failed to reject");
    } finally {
      setActionId(null);
    }
  };

  const handleDisconnect = async (requestId) => {
    if (disconnecting) return;
    setDisconnecting(true);
    try {
      await friendService.withdrawRequest(requestId);
      setFriends((prev) => prev.filter((f) => f._id !== requestId));
      setSelectedFriend(null);
      window.dispatchEvent(new Event("friendsUpdated"));
      toast.success("Connection removed");
    } catch {
      toast.error("Failed to disconnect");
    } finally {
      setDisconnecting(false);
    }
  };

  const timeAgo = (date) => {
    const secs = Math.floor((Date.now() - new Date(date)) / 1000);
    if (secs < 60) return "just now";
    const mins = Math.floor(secs / 60);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 30) return `${days}d ago`;
    return `${Math.floor(days / 30)}mo ago`;
  };

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <div className="loading-spinner" />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "24px 20px 60px" }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>
          <span style={{ color: "var(--red)" }}>Connect</span>
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 15 }}>
          Build your network. Accept requests to share contact info.
        </p>
      </div>

      {/* Stats Banner */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 24 }}>
        <div className="connect-stat-card">
          <div className="connect-stat-icon" style={{ background: "linear-gradient(135deg, #EF4444, #DC2626)" }}>
            <Users size={20} color="#fff" />
          </div>
          <div className="connect-stat-num">{friends.length + pending.length}</div>
          <div className="connect-stat-label">Total</div>
        </div>
        <div className="connect-stat-card">
          <div className="connect-stat-icon" style={{ background: "linear-gradient(135deg, #F59E0B, #D97706)" }}>
            <Clock size={20} color="#fff" />
          </div>
          <div className="connect-stat-num">{pending.length}</div>
          <div className="connect-stat-label">Pending</div>
        </div>
        <div className="connect-stat-card">
          <div className="connect-stat-icon" style={{ background: "linear-gradient(135deg, #10B981, #059669)" }}>
            <Sparkles size={20} color="#fff" />
          </div>
          <div className="connect-stat-num">{friends.length}</div>
          <div className="connect-stat-label">Connected</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="connect-tabs">
        <button
          className={`connect-tab ${activeTab === "pending" ? "active" : ""}`}
          onClick={() => setActiveTab("pending")}
        >
          Pending Requests
          {pending.length > 0 && <span className="connect-tab-badge">{pending.length}</span>}
        </button>
        <button
          className={`connect-tab ${activeTab === "connected" ? "active" : ""}`}
          onClick={() => setActiveTab("connected")}
        >
          My Connections
          {friends.length > 0 && <span className="connect-tab-badge">{friends.length}</span>}
        </button>
      </div>

      {/* Tab Content */}
      <div className="connect-tab-content">
        {activeTab === "pending" ? (
          pending.length === 0 ? (
            <div className="connect-empty">
              <div className="connect-empty-icon">
                <UserPlus size={40} />
              </div>
              <h3>No pending requests</h3>
              <p>When someone wants to connect with you, their request will appear here.</p>
              <Link to="/donors" className="btn btn-primary" style={{ marginTop: 8 }}>
                <Search size={16} /> Find Donors
              </Link>
            </div>
          ) : (
            <div className="connect-list">
              {pending.map((req) => (
                <div key={req._id} className="connect-request-card">
                  <div className="connect-card-left">
                    <div className="connect-avatar">
                      {req.sender?.photo ? (
                        <img src={req.sender.photo} alt={req.sender.name} />
                      ) : (
                        req.sender?.name?.charAt(0)?.toUpperCase()
                      )}
                      <span className="connect-blood-badge">{req.sender?.bloodGroup}</span>
                    </div>
                    <div className="connect-card-info">
                      <div className="connect-card-name">{req.sender?.name}</div>
                      <div className="connect-card-meta">
                        {req.sender?.district}{req.sender?.area ? `, ${req.sender.area}` : ""}
                      </div>
                      <div className="connect-card-time">Wants to connect · {timeAgo(req.createdAt)}</div>
                    </div>
                  </div>
                  <div className="connect-card-actions">
                    <button
                      className="connect-btn accept"
                      onClick={() => handleAccept(req._id)}
                      disabled={actionId === req._id}
                    >
                      <Check size={16} /> Accept
                    </button>
                    <button
                      className="connect-btn reject"
                      onClick={() => handleReject(req._id)}
                      disabled={actionId === req._id}
                    >
                      <XIcon size={16} /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          friends.length === 0 ? (
            <div className="connect-empty">
              <div className="connect-empty-icon">
                <Users size={40} />
              </div>
              <h3>No connections yet</h3>
              <p>Accept connection requests to see your contacts here with phone numbers.</p>
              <Link to="/donors" className="btn btn-primary" style={{ marginTop: 8 }}>
                <Search size={16} /> Find Donors
              </Link>
            </div>
          ) : (
            <div className="connect-list">
              {friends.map((f) => {
                const friend = f.friend || f;
                return (
                <div key={f._id} className="connect-friend-card">
                  <div className="connect-card-left">
                    <div
                      className="connect-avatar"
                      onClick={() => setSelectedFriend({ ...friend, requestId: f._id })}
                      style={{ cursor: "pointer" }}
                    >
                      {friend.photo ? (
                        <img src={friend.photo} alt={friend.name} />
                      ) : (
                        friend.name?.charAt(0)?.toUpperCase()
                      )}
                      <span className="connect-blood-badge">{friend.bloodGroup}</span>
                    </div>
                    <div className="connect-card-info">
                      <div
                        className="connect-card-name"
                        onClick={() => setSelectedFriend({ ...friend, requestId: f._id })}
                        style={{ cursor: "pointer" }}
                      >
                        {friend.name}
                      </div>
                      <div className="connect-card-meta">
                        {friend.district}{friend.area ? `, ${friend.area}` : ""}
                      </div>
                      {friend.phone && (
                        <a href={`tel:${friend.phone}`} className="connect-phone">
                          <Phone size={13} /> {friend.phone}
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="connect-card-actions">
                    <Link to={`/chat/${friend._id}`} className="connect-btn chat">
                      <MessageCircle size={16} /> Chat
                    </Link>
                  </div>
                </div>
                );
              })}
            </div>
          )
        )}
      </div>

      {/* ---- Friend Info Modal ---- */}
      {selectedFriend && createPortal(
        <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "12px" }} onClick={() => setSelectedFriend(null)}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(6px)" }} />
          {(() => {
            const sc = BLOOD_GROUP_COLORS[selectedFriend.bloodGroup] || { bg: "#FEE2E2", text: "#DC2626" };
            return (
              <div onClick={(e) => e.stopPropagation()} style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 420, maxHeight: "90vh", overflowY: "auto", background: "var(--bg-card)", borderRadius: "var(--radius-lg)", boxShadow: "0 25px 60px rgba(0,0,0,0.25)" }}>
                {/* Close */}
                <button onClick={() => setSelectedFriend(null)} style={{ position: "absolute", top: 10, right: 10, zIndex: 10, width: 28, height: 28, borderRadius: "50%", background: "rgba(255,255,255,0.9)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
                  <X size={14} />
                </button>

                {/* Header */}
                <div style={{ padding: "24px 20px 16px", textAlign: "center", background: `linear-gradient(135deg, ${sc.bg}, ${sc.bg}cc)` }}>
                  <div style={{ width: 60, height: 60, borderRadius: "50%", background: sc.text, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 800, margin: "0 auto 10px", boxShadow: "0 4px 12px rgba(0,0,0,0.15)", border: "3px solid rgba(255,255,255,0.5)" }}>
                    {selectedFriend.photo ? (
                      <img src={selectedFriend.photo} alt="" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
                    ) : (
                      selectedFriend.name?.charAt(0)?.toUpperCase()
                    )}
                  </div>
                  <div style={{ fontSize: 17, fontWeight: 800, color: "var(--text)" }}>{selectedFriend.name}</div>
                  <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2, display: "flex", alignItems: "center", justifyContent: "center", gap: 3 }}>
                    <MapPin size={11} /> {selectedFriend.area}{selectedFriend.district ? `, ${selectedFriend.district}` : ""}
                  </div>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 5, marginTop: 8, padding: "4px 14px", borderRadius: 20, fontSize: 14, fontWeight: 700, background: sc.bg, color: sc.text }}>
                    <Droplets size={13} /> {selectedFriend.bloodGroup}
                  </div>
                </div>

                {/* Info */}
                <div style={{ padding: "14px 20px" }}>
                  {selectedFriend.phone && (
                    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 10, background: "var(--bg-secondary)", marginBottom: 8 }}>
                      <Phone size={16} color="var(--green)" />
                      <div>
                        <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>Phone</div>
                        <a href={`tel:${selectedFriend.phone}`} style={{ fontSize: 14, fontWeight: 600, color: "var(--green)", textDecoration: "none" }}>{selectedFriend.phone}</a>
                      </div>
                    </div>
                  )}
                  <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 10, background: "var(--bg-secondary)", marginBottom: 8 }}>
                    <MapPin size={16} color="var(--red)" />
                    <div>
                      <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>Location</div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{selectedFriend.area}{selectedFriend.district ? `, ${selectedFriend.district}` : ""}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 10, background: "var(--bg-secondary)" }}>
                    <Droplets size={16} color={sc.text} />
                    <div>
                      <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>Blood Group</div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: sc.text }}>{selectedFriend.bloodGroup}</div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: 10, padding: "8px 20px 16px", borderTop: "1px solid var(--border-light)" }}>
                  <Link to={`/chat/${selectedFriend._id}`} onClick={() => setSelectedFriend(null)} className="btn btn-primary" style={{ flex: 1, padding: "11px 0", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                    <MessageCircle size={15} /> Chat
                  </Link>
                  <button
                    onClick={() => handleDisconnect(selectedFriend.requestId)}
                    disabled={disconnecting}
                    className="btn"
                    style={{
                      flex: 1, padding: "11px 0", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                      background: "#FEE2E2", color: "#DC2626", border: "none", borderRadius: "var(--radius-sm)", fontWeight: 600, cursor: disconnecting ? "not-allowed" : "pointer", opacity: disconnecting ? 0.6 : 1,
                    }}
                  >
                    <Unlink size={15} /> {disconnecting ? "Removing..." : "Disconnect"}
                  </button>
                </div>
              </div>
            );
          })()}
        </div>,
        document.body
      )}
    </div>
  );
}
