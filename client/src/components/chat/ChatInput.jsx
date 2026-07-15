/**
 * ChatInput.jsx — Message Input Area
 *
 * Bottom bar with:
 * - Text input (auto-expanding textarea)
 * - Image upload button (opens file picker)
 * - Send button (red, only enabled when there's content)
 *
 * Sends typing indicator while user is typing (debounced).
 * Press Enter to send (Shift+Enter for new line).
 *
 * Props:
 * - onSend(text, image) — callback when message is sent
 * - onTyping() / onStopTyping() — typing indicator callbacks
 */

import { useState, useRef, useEffect } from "react";
import { Send, Image, X } from "lucide-react";

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

    // Emit typing start
    onTyping?.();

    // Clear previous timeout
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    // Stop typing after 2 seconds of inactivity
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
      borderTop: "1px solid var(--border-light)",
      padding: "10px 12px",
      background: "var(--bg-card)",
    }}>
      {/* Image preview */}
      {imagePreview && (
        <div style={{
          position: "relative",
          display: "inline-block",
          marginBottom: 8,
          padding: 4,
          borderRadius: 8,
          background: "var(--bg-secondary)",
        }}>
          <img
            src={imagePreview}
            alt="Preview"
            style={{ maxHeight: 80, borderRadius: 6 }}
          />
          <button
            onClick={removeImage}
            style={{
              position: "absolute",
              top: -4,
              right: -4,
              width: 20,
              height: 20,
              borderRadius: "50%",
              background: "var(--red)",
              color: "#fff",
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              fontSize: 10,
            }}
          >
            <X size={10} />
          </button>
        </div>
      )}

      <div style={{
        display: "flex",
        alignItems: "flex-end",
        gap: 8,
      }}>
        {/* Image upload button */}
        <label style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          background: "var(--bg-secondary)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          flexShrink: 0,
          border: "1px solid var(--border-light)",
          transition: "background 0.15s",
        }}
          onMouseEnter={(e) => e.currentTarget.style.background = "var(--red-light)"}
          onMouseLeave={(e) => e.currentTarget.style.background = "var(--bg-secondary)"}
        >
          <Image size={16} color="var(--text-secondary)" />
          <input
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            style={{ display: "none" }}
          />
        </label>

        {/* Text input */}
        <div style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          padding: "6px 12px",
          borderRadius: 20,
          background: "var(--bg-secondary)",
          border: "1px solid var(--border-light)",
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
              color: "var(--text)",
              resize: "none",
              lineHeight: "20px",
              maxHeight: 100,
              fontFamily: "inherit",
            }}
          />
        </div>

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={!text.trim() && !image}
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: (text.trim() || image) ? "var(--red)" : "var(--bg-secondary)",
            color: (text.trim() || image) ? "#fff" : "var(--text-muted)",
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: (text.trim() || image) ? "pointer" : "not-allowed",
            flexShrink: 0,
            transition: "all 0.15s",
          }}
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
