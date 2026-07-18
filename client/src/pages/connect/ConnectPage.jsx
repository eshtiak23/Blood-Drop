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
 * - Empty state illustrations
 */

import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Users, UserPlus, Phone, MessageCircle, Check, X as XIcon, Clock, Search, Sparkles } from "lucide-react";
import * as friendService from "../../services/friendService";
import toast from "react-hot-toast";

export default function ConnectPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("pending");
  const [pending, setPending] = useState([]);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);

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

  const handleAccept = async (requestId) => {
    setActionId(requestId);
    try {
      await friendService.acceptRequest(requestId);
      const req = pending.find((r) => r._id === requestId);
      setPending((prev) => prev.filter((r) => r._id !== requestId));
      if (req?.sender) setFriends((prev) => [req.sender, ...prev]);
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
      toast.success("Request rejected");
    } catch {
      toast.error("Failed to reject");
    } finally {
      setActionId(null);
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
          <div className="connect-stat-num">{friends.length}</div>
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
              {friends.map((friend) => (
                <div key={friend._id} className="connect-friend-card">
                  <div className="connect-card-left">
                    <div className="connect-avatar">
                      {friend.photo ? (
                        <img src={friend.photo} alt={friend.name} />
                      ) : (
                        friend.name?.charAt(0)?.toUpperCase()
                      )}
                      <span className="connect-blood-badge">{friend.bloodGroup}</span>
                    </div>
                    <div className="connect-card-info">
                      <div className="connect-card-name">{friend.name}</div>
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
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}
