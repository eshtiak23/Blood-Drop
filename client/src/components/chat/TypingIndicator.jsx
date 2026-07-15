/**
 * TypingIndicator.jsx — Animated Typing Dots
 *
 * Shows an animated "..." indicator when the other user is typing.
 * Displays as a small pill-shaped bubble with three bouncing dots.
 *
 * Props:
 * - userName — name of the user who is typing
 */

export default function TypingIndicator({ userName }) {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: 6,
      padding: "4px 12px 8px",
    }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 3,
        padding: "6px 12px",
        borderRadius: 14,
        background: "var(--bg-card)",
        border: "1px solid var(--border-light)",
        boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
      }}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "var(--text-muted)",
              animation: `typingBounce 1.2s ease-in-out ${i * 0.15}s infinite`,
            }}
          />
        ))}
      </div>
      <span style={{ fontSize: 11, color: "var(--text-muted)", fontStyle: "italic" }}>
        {userName} is typing...
      </span>

      <style>{`
        @keyframes typingBounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-4px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
