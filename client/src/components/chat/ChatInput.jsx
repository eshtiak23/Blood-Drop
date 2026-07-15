/**
 * ChatInput.jsx — Message Input Area
 *
 * Bottom bar matching the BloodDrop design:
 * - Red "+" circle button on the left
 * - Pill-shaped input field with emoji and attach icons inside
 * - Red circular send button on the right
 *
 * Press Enter to send (Shift+Enter for new line).
 * Sends typing indicator while user is typing.
 *
 * Props:
 * - onSend(text, image) — callback when message is sent
 * - onTyping() / onStopTyping() — typing indicator callbacks
 */

import { useState, useRef, useEffect } from "react";
import { Send, Smile, Paperclip, Plus, X } from "lucide-react";

export default function ChatInput({ onSend, onTyping, onStopTyping }) {
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const textareaRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = Math.min(el.scrollHeight, 100) + "px";
    }
  }, [text]);

  // Handle typing indicator
  const handleTextChange = (e) => {
    setText(e.target.value);
    onTyping?.();
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      onStopTyping?.();
    }, 2000);
  };

  // Handle image selection
  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert("Image must be under 2MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setImagePreview(ev.target.result);
      setImage(ev.target.result);
    };
    reader.readAsDataURL(file);
  };

  // Remove selected image
  const removeImage = () => {
    setImage(null);
    setImagePreview("");
  };

  // Send message
  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed && !image) return;
    onSend(trimmed, image);
    setText("");
    setImage(null);
    setImagePreview("");
    onStopTyping?.();
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    textareaRef.current?.focus();
  };

  // Enter to send, Shift+Enter for newline
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div style={{
      padding: "12px 16px",
      paddingBottom: "max(12px, env(safe-area-inset-bottom))",
      background: "#fff",
      borderTop: "1px solid #F3F4F6",
      flexShrink: 0,
    }}>
      {/* Image preview */}
      {imagePreview && (
        <div style={{
          position: "relative",
          display: "inline-block",
          marginBottom: 10,
          padding: 4,
          borderRadius: 10,
          background: "#F9FAFB",
          border: "1px solid #F3F4F6",
        }}>
          <img
            src={imagePreview}
            alt="Preview"
            style={{ maxHeight: 80, borderRadius: 8 }}
          />
          <button
            onClick={removeImage}
            style={{
              position: "absolute",
              top: -6,
              right: -6,
              width: 22,
              height: 22,
              borderRadius: "50%",
              background: "#EF4444",
              color: "#fff",
              border: "2px solid #fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <X size={10} />
          </button>
        </div>
      )}

      <div style={{
        display: "flex",
        alignItems: "flex-end",
        gap: 10,
      }}>
        {/* Plus button */}
        <label style={{
          width: 42,
          height: 42,
          borderRadius: "50%",
          background: "#EF4444",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          flexShrink: 0,
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
          <input
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            style={{ display: "none" }}
          />
        </label>

        {/* Text input — pill shape */}
        <div style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          padding: "8px 14px",
          borderRadius: 24,
          background: "#F9FAFB",
          border: "1px solid #E5E7EB",
          gap: 8,
        }}>
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            rows={1}
            autoFocus
            style={{
              flex: 1,
              border: "none",
              background: "transparent",
              outline: "none",
              fontSize: 14,
              color: "#1E1B4B",
              resize: "none",
              lineHeight: "20px",
              maxHeight: 100,
              fontFamily: "inherit",
              padding: 0,
            }}
          />
          <Smile size={20} color="#9CA3AF" style={{ flexShrink: 0, cursor: "pointer" }} />
          <Paperclip size={20} color="#9CA3AF" style={{ flexShrink: 0, cursor: "pointer" }} />
        </div>

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={!text.trim() && !image}
          style={{
            width: 42,
            height: 42,
            borderRadius: "50%",
            background: (text.trim() || image) ? "#EF4444" : "#F3F4F6",
            color: (text.trim() || image) ? "#fff" : "#9CA3AF",
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: (text.trim() || image) ? "pointer" : "not-allowed",
            flexShrink: 0,
            transition: "all 0.15s",
          }}
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
