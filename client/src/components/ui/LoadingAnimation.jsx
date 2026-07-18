/**
 * LoadingAnimation.jsx — Fun Loading Screen
 *
 * A playful loading animation for the LifeDrop app.
 * Shows a bouncing blood drop with a face, a pulsing heartbeat line,
 * and a rotating blood bag. Used during initial app load and auth checks.
 */

import { useState, useEffect } from "react";

const facts = [
  "One donation can save up to 3 lives!",
  "Blood lasts up to 42 days on shelf.",
  "You can donate blood every 90 days.",
  "Type O- blood can be given to anyone.",
  "About 1 in 7 people need blood.",
  "A pint of blood weighs about 1 pound.",
  "Red blood cells live for about 120 days.",
  "Blood makes up about 7% of body weight.",
];

export default function LoadingAnimation({ text = "Loading" }) {
  const [factIndex, setFactIndex] = useState(0);
  const [dots, setDots] = useState("");

  useEffect(() => {
    const dotInterval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 400);
    return () => clearInterval(dotInterval);
  }, []);

  useEffect(() => {
    const factInterval = setInterval(() => {
      setFactIndex((prev) => (prev + 1) % facts.length);
    }, 3000);
    return () => clearInterval(factInterval);
  }, []);

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #FEF2F2 0%, #F5F3FF 50%, #ECFDF5 100%)",
      zIndex: 9999,
      fontFamily: "'Inter', system-ui, sans-serif",
      overflow: "hidden",
    }}>
      {/* Floating background circles */}
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
        {[...Array(6)].map((_, i) => (
          <div key={i} style={{
            position: "absolute",
            width: 60 + i * 30,
            height: 60 + i * 30,
            borderRadius: "50%",
            background: `rgba(239, 68, 68, ${0.03 + i * 0.01})`,
            left: `${10 + i * 15}%`,
            top: `${20 + (i % 3) * 25}%`,
            animation: `floatBubble ${3 + i * 0.5}s ease-in-out infinite`,
            animationDelay: `${i * 0.3}s`,
          }} />
        ))}
      </div>

      {/* Main blood drop character */}
      <div style={{ position: "relative", marginBottom: 30 }}>
        {/* Shadow */}
        <div style={{
          position: "absolute",
          bottom: -8,
          left: "50%",
          transform: "translateX(-50%)",
          width: 50,
          height: 12,
          borderRadius: "50%",
          background: "rgba(0,0,0,0.08)",
          animation: "shadowPulse 1.2s ease-in-out infinite",
        }} />

        {/* Blood drop body */}
        <div style={{
          width: 80,
          height: 100,
          position: "relative",
          animation: "dropBounce 1.2s ease-in-out infinite",
        }}>
          {/* Drop shape */}
          <svg viewBox="0 0 80 100" style={{ width: 80, height: 100 }}>
            <defs>
              <linearGradient id="dropGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#EF4444" />
                <stop offset="100%" stopColor="#DC2626" />
              </linearGradient>
            </defs>
            <path
              d="M40 5 C40 5, 75 45, 75 65 C75 85, 60 95, 40 95 C20 95, 5 85, 5 65 C5 45, 40 5, 40 5Z"
              fill="url(#dropGrad)"
              stroke="none"
            />
            {/* Highlight */}
            <ellipse cx="28" cy="55" rx="8" ry="12" fill="rgba(255,255,255,0.3)" transform="rotate(-15, 28, 55)" />
          </svg>

          {/* Eyes */}
          <div style={{
            position: "absolute",
            top: 52,
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            gap: 12,
          }}>
            {/* Left eye */}
            <div style={{
              width: 10,
              height: 12,
              background: "#fff",
              borderRadius: "50%",
              position: "relative",
              animation: "blink 3s ease-in-out infinite",
            }}>
              <div style={{
                width: 5,
                height: 5,
                background: "#1E1B4B",
                borderRadius: "50%",
                position: "absolute",
                top: 3,
                left: 3,
              }} />
            </div>
            {/* Right eye */}
            <div style={{
              width: 10,
              height: 12,
              background: "#fff",
              borderRadius: "50%",
              position: "relative",
              animation: "blink 3s ease-in-out infinite",
            }}>
              <div style={{
                width: 5,
                height: 5,
                background: "#1E1B4B",
                borderRadius: "50%",
                position: "absolute",
                top: 3,
                left: 3,
              }} />
            </div>
          </div>

          {/* Smile */}
          <div style={{
            position: "absolute",
            top: 68,
            left: "50%",
            transform: "translateX(-50%)",
            width: 14,
            height: 7,
            borderBottom: "2.5px solid #fff",
            borderRadius: "0 0 10px 10px",
          }} />

          {/* Blush */}
          <div style={{
            position: "absolute",
            top: 64,
            left: 13,
            width: 8,
            height: 5,
            background: "rgba(255,150,150,0.5)",
            borderRadius: "50%",
          }} />
          <div style={{
            position: "absolute",
            top: 64,
            right: 13,
            width: 8,
            height: 5,
            background: "rgba(255,150,150,0.5)",
            borderRadius: "50%",
          }} />
        </div>
      </div>

      {/* Heartbeat line */}
      <div style={{ marginBottom: 24, overflow: "hidden", width: 200, height: 30 }}>
        <svg viewBox="0 0 200 30" style={{ width: 200, height: 30 }}>
          <polyline
            points="0,15 30,15 40,15 50,5 60,25 70,10 80,20 90,15 120,15 130,15 140,5 150,25 160,10 170,20 180,15 200,15"
            fill="none"
            stroke="#EF4444"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ strokeDasharray: 300, strokeDashoffset: 300, animation: "heartbeatDraw 2s ease-in-out infinite" }}
          />
        </svg>
      </div>

      {/* Loading text */}
      <div style={{ textAlign: "center" }}>
        <div style={{
          fontSize: 20,
          fontWeight: 700,
          color: "#1E1B4B",
          marginBottom: 8,
        }}>
          {text}{dots}
        </div>
        <div style={{
          fontSize: 13,
          color: "#9CA3AF",
          maxWidth: 280,
          lineHeight: 1.5,
          transition: "opacity 0.3s",
          minHeight: 40,
        }}>
          {facts[factIndex]}
        </div>
      </div>

      {/* Mini floating blood bags */}
      <div style={{ position: "absolute", bottom: 40, display: "flex", gap: 16 }}>
        {["💉", "🩸", "❤️"].map((emoji, i) => (
          <div key={i} style={{
            fontSize: 20,
            animation: `floatUp ${2 + i * 0.3}s ease-in-out infinite`,
            animationDelay: `${i * 0.5}s`,
            opacity: 0.6,
          }}>
            {emoji}
          </div>
        ))}
      </div>

      <style>{`
        @keyframes dropBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
        @keyframes shadowPulse {
          0%, 100% { transform: translateX(-50%) scale(1); opacity: 0.08; }
          50% { transform: translateX(-50%) scale(0.7); opacity: 0.04; }
        }
        @keyframes blink {
          0%, 90%, 100% { transform: scaleY(1); }
          95% { transform: scaleY(0.1); }
        }
        @keyframes heartbeatDraw {
          0% { stroke-dashoffset: 300; }
          50% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: -300; }
        }
        @keyframes floatBubble {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-20px) scale(1.05); }
        }
        @keyframes floatUp {
          0%, 100% { transform: translateY(0); opacity: 0.6; }
          50% { transform: translateY(-10px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
