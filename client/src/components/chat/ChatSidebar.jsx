/**
 * ChatSidebar.jsx — Conversation List Panel
 *
 * Left side of the chat page (desktop) or main view (mobile).
 * Shows:
 * - "Start New Chat" button to search for users
 * - Search input to filter conversations
 * - List of conversations with avatar, name, last message, unread badge
 * - Online status dots for each user
 *
 * Props:
 * - onSelectConversation(conversation) — called when user clicks a conversation
 * - activeId — currently active conversation ID (for highlight)
 * - isMobile — whether to show back button style
 */

import { useState, useMemo } from "react";
import { Search, MessageCircle, UserPlus } from "lucide-react";

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
    if (diff < 172800000) return "Yesterday";
    return d.toLocaleDateString("en-BD", { day: "numeric", month: "short" });
  };

  return (
    <div style={{
      width: "100%",
      height: "100%",
      display: "flex",
      flexDirection: "column",
      background: "var(--bg-card)",
      borderRight: "1px solid var(--border-light)",
    }}>
      {/* Header */}
      <div style={{ padding: "16px 16px 12px", borderBottom: "1px solid var(--border-light)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: "var(--text)" }}>Messages</h2>
          <span style={{
            background: "var(--red)",
            color: "#fff",
            fontSize: 11,
            fontWeight: 700,
            padding: "2px 8px",
            borderRadius: 10,
            minWidth: 20,
            textAlign: "center",
          }}>
            {conversations.length}
          </span>
        </div>

        {/* Search */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "8px 12px",
          borderRadius: 10,
          background: "var(--bg-secondary)",
          border: "1px solid var(--border-light)",
        }}>
          <Search size={15} color="var(--text-muted)" />
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
              fontSize: 13,
              color: "var(--text)",
            }}
          />
        </div>
      </div>

      {/* Conversation List */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {filtered.length === 0 ? (
          <div style={{ padding: "40px 20px", textAlign: "center" }}>
            <MessageCircle size={40} color="var(--text-muted)" style={{ marginBottom: 12, opacity: 0.4 }} />
            <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 4 }}>
              {search ? "No conversations found" : "No conversations yet"}
            </p>
            <p style={{ fontSize: 12, color: "var(--text-muted)", opacity: 0.7 }}>
              {!search && "Click 'Chat' on a donor's profile to start chatting"}
            </p>
          </div>
        ) : (
          filtered.map((conv) => {
            const isActive = conv._id === activeId;
            const isOnline = onlineUsers.has(conv.otherUser?._id);
            return (
              <div
                key={conv._id}
                onClick={() => onSelectConversation(conv)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 16px",
                  cursor: "pointer",
                  background: isActive ? "var(--red-light)" : "transparent",
                  borderLeft: isActive ? "3px solid var(--red)" : "3px solid transparent",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = "var(--bg-secondary)"; }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
              >
                {/* Avatar with online dot */}
                <div style={{ position: "relative", flexShrink: 0 }}>
                  {conv.otherUser?.photo ? (
                    <img
                      src={conv.otherUser.photo}
                      alt=""
                      style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover" }}
                    />
                  ) : (
                    <div style={{
                      width: 44,
                      height: 44,
                      borderRadius: "50%",
                      background: "var(--red)",
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 17,
                      fontWeight: 800,
                    }}>
                      {conv.otherUser?.name?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                  )}
                  {isOnline && (
                    <div style={{
                      position: "absolute",
                      bottom: 1,
                      right: 1,
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      background: "#22C55E",
                      border: "2px solid var(--bg-card)",
                    }} />
                  )}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{
                      fontSize: 14,
                      fontWeight: conv.unreadCount > 0 ? 700 : 600,
                      color: "var(--text)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}>
                      {conv.otherUser?.name || "Unknown"}
                    </span>
                    <span style={{
                      fontSize: 11,
                      color: conv.unreadCount > 0 ? "var(--red)" : "var(--text-muted)",
                      fontWeight: conv.unreadCount > 0 ? 600 : 400,
                      flexShrink: 0,
                      marginLeft: 8,
                    }}>
                      {formatTime(conv.lastMessage?.createdAt)}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                    <span style={{
                      fontSize: 12,
                      color: conv.unreadCount > 0 ? "var(--text)" : "var(--text-muted)",
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
                        minWidth: 20,
                        height: 20,
                        borderRadius: 10,
                        background: "var(--red)",
                        color: "#fff",
                        fontSize: 11,
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "0 6px",
                        flexShrink: 0,
                      }}>
                        {conv.unreadCount}
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
