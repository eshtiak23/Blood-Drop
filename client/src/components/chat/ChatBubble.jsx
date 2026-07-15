/**
 * ChatBubble.jsx — Single Message Bubble
 *
 * Renders one message in the conversation.
 * - Sent messages (from current user): red background, white text, right-aligned
 * - Received messages (from other user): white background, gray text, left-aligned
 * - Shows timestamp and seen indicator (✓✓) for sent messages
 * - Supports image messages (displayed as a thumbnail)
 *
 * Props:
 * - message — the message object { text, image, senderId, createdAt, seen }
 * - isMine — whether this message was sent by the current user
 * - showAvatar — whether to show sender's avatar (first message in group)
 */

import { Check, CheckCheck } from "lucide-react";

export default function ChatBubble({ message, isMine, showAvatar = false }) {
  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString("en-BD", { hour: "2-digit", minute: "2-digit", hour12: true });
  };

  return (
    <div style={{
      display: "flex",
      justifyContent: isMine ? "flex-end" : "flex-start",
      alignItems: "flex-end",
      gap: 6,
      marginBottom: 4,
      padding: "0 12px",
    }}>
      {/* Received message avatar */}
      {!isMine && (
        <div style={{ width: 28, flexShrink: 0 }}>
          {showAvatar && message.senderId?.photo ? (
            <img
              src={message.senderId.photo}
              alt=""
              style={{ width: 28, height: 28, borderRadius: "50%", objectFit: "cover" }}
            />
          ) : showAvatar ? (
            <div style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: "var(--purple)",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 11,
              fontWeight: 700,
            }}>
              {message.senderId?.name?.charAt(0)?.toUpperCase() || "?"}
            </div>
          ) : null}
        </div>
      )}

      {/* Message bubble */}
      <div style={{
        maxWidth: "70%",
        padding: message.image && !message.text ? "4px" : "8px 12px",
        borderRadius: isMine ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
        background: isMine ? "var(--red)" : "var(--bg-card)",
        color: isMine ? "#fff" : "var(--text)",
        boxShadow: isMine ? "0 1px 3px rgba(239,68,68,0.3)" : "0 1px 3px rgba(0,0,0,0.08)",
        border: isMine ? "none" : "1px solid var(--border-light)",
      }}>
        {/* Image */}
        {message.image && (
          <img
            src={message.image}
            alt="Shared"
            style={{
              maxWidth: "100%",
              maxHeight: 200,
              borderRadius: 8,
              marginBottom: message.text ? 6 : 0,
              cursor: "pointer",
            }}
            onClick={() => window.open(message.image, "_blank")}
          />
        )}

        {/* Text */}
        {message.text && (
          <div style={{ fontSize: 14, lineHeight: 1.5, wordBreak: "break-word" }}>
            {message.text}
          </div>
        )}

        {/* Time + seen indicator */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          gap: 4,
          marginTop: 2,
          opacity: 0.6,
        }}>
          <span style={{ fontSize: 10, color: isMine ? "rgba(255,255,255,0.8)" : "var(--text-muted)" }}>
            {formatTime(message.createdAt)}
          </span>
          {isMine && (
            message.seen ? (
              <CheckCheck size={13} color="rgba(255,255,255,0.9)" />
            ) : (
              <Check size={13} color="rgba(255,255,255,0.6)" />
            )
          )}
        </div>
      </div>
    </div>
  );
}
