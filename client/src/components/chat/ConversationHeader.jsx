/**
 * ConversationHeader.jsx — Chat Conversation Header
 *
 * Top bar of the active conversation showing:
 * - Back button (on mobile, to return to conversation list)
 * - Other user's avatar and name
 * - Online status (green dot + "Online" / "Offline")
 * - Blood group badge (optional)
 *
 * Props:
 * - user — the other user object { name, photo, bloodGroup, isAvailable }
 * - onBack — callback to go back to conversation list (mobile)
 * - isOnline — whether the other user is currently online
 */

import { ArrowLeft, Phone } from "lucide-react";

export default function ConversationHeader({ user, onBack, isOnline }) {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "10px 16px",
      borderBottom: "1px solid var(--border-light)",
      background: "var(--bg-card)",
    }}>
      {/* Back button (mobile) */}
      {onBack && (
        <button
          onClick={onBack}
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: "var(--bg-secondary)",
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          <ArrowLeft size={16} color="var(--text)" />
        </button>
      )}

      {/* Avatar */}
      {user?.photo ? (
        <img
          src={user.photo}
          alt=""
          style={{ width: 38, height: 38, borderRadius: "50%", objectFit: "cover" }}
        />
      ) : (
        <div style={{
          width: 38,
          height: 38,
          borderRadius: "50%",
          background: "var(--red)",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 15,
          fontWeight: 800,
          flexShrink: 0,
        }}>
          {user?.name?.charAt(0)?.toUpperCase() || "?"}
        </div>
      )}

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {user?.name || "Unknown"}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 1 }}>
          <div style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: isOnline ? "#22C55E" : "var(--text-muted)",
          }} />
          <span style={{ fontSize: 11, color: isOnline ? "#22C55E" : "var(--text-muted)" }}>
            {isOnline ? "Online" : "Offline"}
          </span>
          {user?.bloodGroup && (
            <span style={{
              fontSize: 10,
              fontWeight: 700,
              color: "var(--red)",
              background: "var(--red-light)",
              padding: "1px 6px",
              borderRadius: 8,
            }}>
              {user.bloodGroup}
            </span>
          )}
        </div>
      </div>

      {/* Call button */}
      {user?.phone && (
        <a
          href={`tel:${user.phone}`}
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: "var(--green-light)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textDecoration: "none",
            flexShrink: 0,
          }}
        >
          <Phone size={16} color="var(--green)" />
        </a>
      )}
    </div>
  );
}
