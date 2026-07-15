/**
 * ChatBubble.jsx — Single Message Bubble
 *
 * Renders one message in the conversation matching the BloodDrop design:
 * - Sent messages: red (#EF4444) background, white text, right-aligned
 *   - Rounded: 16px 16px 4px 16px (sharp bottom-right)
 * - Received messages: white background, dark text, left-aligned
 *   - Rounded: 16px 16px 16px 4px (sharp bottom-left)
 * - Time + seen indicator (✓✓) inside bubble at bottom-right
 * - Supports image messages with lightbox viewer
 */

import { useState } from "react";
import { Check, CheckCheck, X } from "lucide-react";

export default function ChatBubble({ message, isMine, showAvatar = false }) {
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString("en-BD", { hour: "2-digit", minute: "2-digit", hour12: true });
  };

  return (
    <>
      <div style={{
        display: "flex",
        justifyContent: isMine ? "flex-end" : "flex-start",
        alignItems: "flex-end",
        gap: 8,
        padding: "2px 20px",
      }}>
        {/* Received message avatar */}
        {!isMine && (
          <div style={{ width: 30, flexShrink: 0 }}>
            {showAvatar && message.senderId?.photo ? (
              <img
                src={message.senderId.photo}
                alt=""
                style={{ width: 30, height: 30, borderRadius: "50%", objectFit: "cover" }}
              />
            ) : showAvatar ? (
              <div style={{
                width: 30,
                height: 30,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #EF4444, #DC2626)",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                fontWeight: 700,
              }}>
                {message.senderId?.name?.charAt(0)?.toUpperCase() || "?"}
              </div>
            ) : null}
          </div>
        )}

        {/* Message bubble */}
        <div style={{
          maxWidth: "65%",
          padding: message.image && !message.text ? "4px" : "10px 14px",
          borderRadius: isMine ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
          background: isMine ? "#EF4444" : "#fff",
          color: isMine ? "#fff" : "#1E1B4B",
          boxShadow: isMine
            ? "0 2px 8px rgba(239,68,68,0.25)"
            : "0 1px 4px rgba(0,0,0,0.06)",
          border: isMine ? "none" : "1px solid #F3F4F6",
          wordBreak: "break-word",
        }}>
          {/* Image */}
          {message.image && (
            <img
              src={message.image}
              alt="Shared"
              style={{
                maxWidth: "100%",
                maxHeight: 220,
                borderRadius: 10,
                marginBottom: message.text ? 8 : 0,
                cursor: "pointer",
              }}
              onClick={() => setLightboxOpen(true)}
            />
          )}

          {/* Text */}
          {message.text && (
            <div style={{ fontSize: 14, lineHeight: 1.55 }}>
              {message.text}
            </div>
          )}

          {/* Time + seen indicator */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: 4,
            marginTop: 4,
          }}>
            <span style={{
              fontSize: 11,
              color: isMine ? "rgba(255,255,255,0.75)" : "#9CA3AF",
            }}>
              {formatTime(message.createdAt)}
            </span>
            {isMine && (
              message.seen ? (
                <CheckCheck size={14} color="rgba(255,255,255,0.9)" />
              ) : (
                <Check size={14} color="rgba(255,255,255,0.6)" />
              )
            )}
          </div>
        </div>
      </div>

      {/* Image Lightbox */}
      {lightboxOpen && message.image && (
        <div
          onClick={() => setLightboxOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(0,0,0,0.85)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
            cursor: "pointer",
          }}
        >
          <button
            onClick={() => setLightboxOpen(false)}
            style={{
              position: "absolute",
              top: 16,
              right: 16,
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.15)",
              border: "none",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              zIndex: 10000,
            }}
          >
            <X size={24} />
          </button>
          <img
            src={message.image}
            alt="Full size"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: "90vw",
              maxHeight: "90vh",
              borderRadius: 8,
              objectFit: "contain",
              cursor: "default",
            }}
          />
        </div>
      )}
    </>
  );
}
