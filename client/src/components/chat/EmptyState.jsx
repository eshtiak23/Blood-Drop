/**
 * EmptyState.jsx — Empty Chat State
 *
 * Shown when no conversation is selected.
 * Displays a message encouraging the user to select
 * a conversation or start a new one.
 *
 * Props:
 * - onStartChat — callback to navigate to donor search
 */

import { MessageCircle, Search } from "lucide-react";
import { Link } from "react-router-dom";

export default function EmptyState() {
  return (
    <div style={{
      flex: 1,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: 40,
      background: "var(--bg-secondary)",
      textAlign: "center",
    }}>
      <div style={{
        width: 80,
        height: 80,
        borderRadius: "50%",
        background: "var(--red-light)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 20,
      }}>
        <MessageCircle size={36} color="var(--red)" />
      </div>

      <h3 style={{ fontSize: 20, fontWeight: 800, color: "var(--text)", marginBottom: 8 }}>
        Welcome to Chat
      </h3>
      <p style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 20, maxWidth: 280, lineHeight: 1.6 }}>
        Select a conversation from the sidebar or start a new one by visiting a donor's profile.
      </p>

      <Link
        to="/donors"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "10px 20px",
          borderRadius: 10,
          background: "var(--red)",
          color: "#fff",
          textDecoration: "none",
          fontSize: 14,
          fontWeight: 700,
          transition: "transform 0.15s, box-shadow 0.15s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-1px)";
          e.currentTarget.style.boxShadow = "0 4px 12px rgba(239,68,68,0.3)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "none";
        }}
      >
        <Search size={16} />
        Find Donors
      </Link>
    </div>
  );
}
