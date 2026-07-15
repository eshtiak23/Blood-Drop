/**
 * NotFoundPage - Fun animated 404 page with emojis and humor.
 * Shows a lost blood drop character trying to find its way home.
 */
import { useNavigate } from "react-router-dom";
import { Home, ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";

const floatingEmojis = ["🩸", "💉", "🏥", "🩺", "❤️", "🫀", "🩻", "💊"];

export default function NotFoundPage() {
  const navigate = useNavigate();
  const [droppedEmoji, setDroppedEmoji] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setDroppedEmoji((prev) => (prev + 1) % floatingEmojis.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ minHeight: "calc(100vh - 64px)", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", padding: 20, overflow: "hidden", position: "relative" }}>

      {/* Floating background emojis */}
      {floatingEmojis.map((emoji, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            fontSize: 28 + (i % 3) * 8,
            opacity: 0.12,
            animation: `floatEmoji ${6 + (i % 3) * 2}s ease-in-out infinite`,
            animationDelay: `${i * 0.7}s`,
            left: `${8 + (i * 12) % 85}%`,
            top: `${10 + (i * 17) % 70}%`,
            pointerEvents: "none",
          }}
        >
          {emoji}
        </div>
      ))}

      <div style={{ position: "relative", zIndex: 1 }}>
        {/* Animated 404 */}
        <div style={{ fontSize: 100, fontWeight: 900, lineHeight: 1, background: "linear-gradient(135deg, #EF4444, #EC4899, #8B5CF6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", animation: "bounce404 2s ease-in-out infinite" }}>
          404
        </div>

        {/* Animated blood drop character */}
        <div style={{ fontSize: 64, margin: "16px 0", animation: "wobble 1.5s ease-in-out infinite" }}>
          🩸
        </div>

        {/* Funny messages */}
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "var(--text)", marginBottom: 8 }}>
          Oops! This page got a transfusion...
        </h1>
        <p style={{ fontSize: 16, color: "var(--text-secondary)", maxWidth: 420, margin: "0 auto", lineHeight: 1.6 }}>
          It seems this page has <strong style={{ color: "var(--red)" }}>lost too much blood</strong> and couldn't make it. Don't worry — we'll find it!
        </p>

        {/* Rotating emoji display */}
        <div style={{ fontSize: 36, margin: "20px 0", animation: "fadeInUp 0.5s ease" }} key={droppedEmoji}>
          {floatingEmojis[droppedEmoji]}
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 24, flexWrap: "wrap" }}>
          <button
            className="btn btn-primary"
            onClick={() => navigate("/")}
            style={{ gap: 8, padding: "12px 24px" }}
          >
            <Home size={18} /> Take Me Home
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => navigate(-1)}
            style={{ gap: 8, padding: "12px 24px" }}
          >
            <ArrowLeft size={18} /> Go Back
          </button>
        </div>

        {/* Fun footer text */}
        <p style={{ marginTop: 32, fontSize: 13, color: "var(--text-muted)" }}>
          Need help? Contact us at <a href="mailto:support@blooddrop.com" style={{ color: "var(--red)", textDecoration: "none" }}>support@blooddrop.com</a>
        </p>
      </div>

      <style>{`
        @keyframes bounce404 {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-12px) scale(1.05); }
        }
        @keyframes wobble {
          0%, 100% { transform: rotate(0deg) translateY(0); }
          25% { transform: rotate(-8deg) translateY(-4px); }
          75% { transform: rotate(8deg) translateY(-4px); }
        }
        @keyframes floatEmoji {
          0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.12; }
          50% { transform: translateY(-20px) rotate(15deg); opacity: 0.2; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
