/**
 * ConversationHeader.jsx — Chat Conversation Header
 *
 * Top bar of the active conversation matching the BloodDrop design:
 * - Back arrow (<) on left
 * - Avatar with online dot
 * - Name (bold)
 * - Blood group in red text
 * - "Online" / "Offline" status with colored dot
 * - Right side: Phone, Video, Info icon buttons (red)
 */

import { ArrowLeft, Phone, Video, Info } from "lucide-react";

export default function ConversationHeader({ user, onBack, isOnline }) {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "12px 20px",
      borderBottom: "1px solid #F3F4F6",
      background: "#fff",
      flexShrink: 0,
    }}>
      {/* Back button — only on mobile */}
      {onBack && (
        <button
          onClick={onBack}
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#6B7280",
            transition: "background 0.15s",
            flexShrink: 0,
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = "#F3F4F6"}
          onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
        >
          <ArrowLeft size={20} />
        </button>
      )}

      {/* Avatar with online dot */}
      <div style={{ position: "relative", flexShrink: 0 }}>
        {user?.photo ? (
          <img
            src={user.photo}
            alt=""
            style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover" }}
          />
        ) : (
          <div style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #EF4444, #DC2626)",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 17,
            fontWeight: 800,
          }}>
            {user?.name?.charAt(0)?.toUpperCase() || "?"}
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
            border: "2px solid #fff",
          }} />
        )}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 16,
          fontWeight: 700,
          color: "#1E1B4B",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}>
          {user?.name || "Unknown"}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 2 }}>
          {user?.bloodGroup && (
            <span style={{ fontSize: 13, fontWeight: 600, color: "#EF4444" }}>
              {user.bloodGroup} Blood Group
            </span>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 1 }}>
          <div style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: isOnline ? "#22C55E" : "#9CA3AF",
          }} />
          <span style={{ fontSize: 12, color: isOnline ? "#22C55E" : "#9CA3AF", fontWeight: 500 }}>
            {isOnline ? "Online" : "Offline"}
          </span>
        </div>
      </div>

      {/* Action icons */}
      <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
        {[
          { icon: Phone, label: "Call" },
          { icon: Video, label: "Video" },
          { icon: Info, label: "Info" },
        ].map(({ icon: Icon, label }) => (
          <button
            key={label}
            title={label}
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#EF4444",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = "#FEE2E2"}
            onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
          >
            <Icon size={20} />
          </button>
        ))}
      </div>
    </div>
  );
}
