/**
 * ChatSidebar.jsx — Conversation List Panel
 *
 * Left side of the chat page. Shows:
 * - BloodDrop logo + back arrow
 * - "Chats" title with red "+" button to start new chat
 * - Search input to filter conversations
 * - List of conversations with avatar, name, last message, timestamp, unread badge
 * - Online status dots for each user
 * - Active conversation highlighted in light red
 */

import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Search, ArrowLeft, Plus } from "lucide-react";

export default function ChatSidebar({ conversations, onSelectConversation, activeId, onlineUsers, user }) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return conversations;
    const q = search.toLowerCase();
    return conversations.filter(
      (c) =>
        c.otherUser?.name?.toLowerCase().includes(q) ||
        c.lastMessage?.text?.toLowerCase().includes(q)
    );
  }, [conversations, search]);

  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now - d;
    if (diff < 60000) return "now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
    const dayDiff = Math.floor(diff / 86400000);
    if (dayDiff === 1) return "Yesterday";
    if (dayDiff < 7) return d.toLocaleDateString("en-BD", { weekday: "short" });
    return d.toLocaleDateString("en-BD", { day: "numeric", month: "short" });
  };

  return (
    <div style={{
      width: "100%",
      height: "100%",
      display: "flex",
      flexDirection: "column",
      background: "#fff",
      borderRight: "1px solid #F3F4F6",
    }}>
      {/* Top Bar: Logo + Back */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "16px 20px 8px",
      }}>
        <Link to="/" style={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#6B7280",
          transition: "background 0.15s",
        }}
          onMouseEnter={(e) => e.currentTarget.style.background = "#F3F4F6"}
          onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
        >
          <ArrowLeft size={20} />
        </Link>
        <img src="/Logo.png" alt="LifeDrop" style={{ height: 28, width: 28, objectFit: "contain", borderRadius: 6 }} />
        <span style={{ fontSize: 18, fontWeight: 800, color: "#1E1B4B" }}>
          Life<span style={{ color: "#DC2626" }}>Drop</span>
        </span>
      </div>

      {/* Chats Title + New Chat Button */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 20px 8px",
      }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: "#1E1B4B" }}>Chats</h2>
        <Link to="/donors" style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          background: "#EF4444",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          transition: "transform 0.15s, box-shadow 0.15s",
        }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.05)";
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(239,68,68,0.3)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          <Plus size={20} />
        </Link>
      </div>

      {/* Search */}
      <div style={{ padding: "4px 20px 12px" }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 14px",
          borderRadius: 12,
          background: "#F9FAFB",
          border: "1px solid #F3F4F6",
        }}>
          <Search size={16} color="#9CA3AF" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              flex: 1,
              border: "none",
              background: "transparent",
              outline: "none",
              fontSize: 14,
              color: "#1E1B4B",
            }}
          />
        </div>
      </div>

      {/* Conversation List */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {filtered.length === 0 ? (
          <div style={{ padding: "40px 20px", textAlign: "center" }}>
            <p style={{ fontSize: 14, color: "#9CA3AF", marginBottom: 4 }}>
              {search ? "No conversations found" : "No conversations yet"}
            </p>
            <p style={{ fontSize: 12, color: "#9CA3AF", opacity: 0.7 }}>
              {!search && "Click '+' to find donors and start chatting"}
            </p>
          </div>
        ) : (
          filtered.map((conv) => {
            const isActive = conv._id === activeId;
            const isOnline = onlineUsers.has(conv.otherUser?._id?.toString?.() || conv.otherUser?._id);
            return (
              <div
                key={conv._id}
                onClick={() => onSelectConversation(conv)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "14px 20px",
                  cursor: "pointer",
                  background: isActive ? "#FEE2E2" : "transparent",
                  borderBottom: "1px solid #F3F4F6",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = "#F9FAFB"; }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
              >
                {/* Avatar with online dot */}
                <div style={{ position: "relative", flexShrink: 0 }}>
                  {conv.otherUser?.photo ? (
                    <img
                      src={conv.otherUser.photo}
                      alt=""
                      style={{ width: 48, height: 48, borderRadius: "50%", objectFit: "cover" }}
                    />
                  ) : (
                    <div style={{
                      width: 48,
                      height: 48,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #EF4444, #DC2626)",
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 18,
                      fontWeight: 800,
                    }}>
                      {conv.otherUser?.name?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                  )}
                  {isOnline && (
                    <div style={{
                      position: "absolute",
                      bottom: 2,
                      right: 2,
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      background: "#22C55E",
                      border: "2px solid #fff",
                    }} />
                  )}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                    <span style={{
                      fontSize: 15,
                      fontWeight: conv.unreadCount > 0 ? 700 : 600,
                      color: "#1E1B4B",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}>
                      {conv.otherUser?.name || "Unknown"}
                    </span>
                    <span style={{
                      fontSize: 12,
                      color: conv.unreadCount > 0 ? "#EF4444" : "#9CA3AF",
                      fontWeight: conv.unreadCount > 0 ? 600 : 400,
                      flexShrink: 0,
                      marginLeft: 8,
                    }}>
                      {formatTime(conv.lastMessage?.createdAt)}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{
                      fontSize: 13,
                      color: conv.unreadCount > 0 ? "#374151" : "#9CA3AF",
                      fontWeight: conv.unreadCount > 0 ? 500 : 400,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      flex: 1,
                    }}>
                      {conv.lastMessage?.text || "Start a conversation..."}
                    </span>
                    {conv.unreadCount > 0 && (
                      <span style={{
                        minWidth: 22,
                        height: 22,
                        borderRadius: 11,
                        background: "#EF4444",
                        color: "#fff",
                        fontSize: 11,
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "0 6px",
                        flexShrink: 0,
                      }}>
                        {conv.unreadCount > 9 ? "9+" : conv.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
