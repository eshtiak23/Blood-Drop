/**
 * DevelopersPage.jsx — Meet Our Developers
 *
 * Displays the team behind LifeDrop with developer cards,
 * stats banner, and a heartfelt footer message.
 */
import { Link } from "react-router-dom";
import { Users, Heart, Code, UserPlus, Mail, Globe, Droplet, Star } from "lucide-react";

const DEVELOPERS = [
  {
    name: "MD. Eshtiak Ahmed",
    role: "Full Stack Developer",
    roleColor: "#EF4444",
    desc: "Leads the development and architecture of LifeDrop platform.",
    initials: "EA",
    photo: "/eshtiak.png",
    gradient: "linear-gradient(135deg, #C4B5FD, #A78BFA)",
    lead: true,
    phone: "01989984061",
    email: "eshtiak4099@gmail.com",
    github: "#!",
    linkedin: "#!",
  },
  {
    name: "Towfiqur Rahman",
    role: "Frontend Developer",
    roleColor: "#EC4899",
    desc: "Builds responsive and interactive user interfaces with precision.",
    initials: "TR",
    photo: "/towfiqur.jpg",
    gradient: "linear-gradient(135deg, #F9A8D4, #EC4899)",
    lead: false,
    email: "towfiqur@lifedrop.com",
    github: "#!",
    linkedin: "#!",
  },
  {
    name: "Abdur Rahman",
    role: "Project Presenter",
    roleColor: "#7C3AED",
    desc: "Presents and represents the LifeDrop platform to stakeholders and teachers.",
    initials: "AR",
    photo: "/abdur.jpg",
    gradient: "linear-gradient(135deg, #C4B5FD, #8B5CF6)",
    lead: false,
    email: "abdurrahman76@gmail.com",
    github: "#!",
    linkedin: "#!",
  },
  {
    name: "Nafis Rahman",
    role: "UI/UX Designer",
    roleColor: "#EC4899",
    desc: "Designs beautiful and intuitive experiences for users.",
    initials: "NR",
    photo: "",
    gradient: "linear-gradient(135deg, #FBCFE8, #F472B6)",
    lead: false,
    email: "nafis@lifedrop.com",
    github: "#!",
    linkedin: "#!",
  },
  {
    name: "Rakibul Islam",
    role: "QA Engineer",
    roleColor: "#7C3AED",
    desc: "Ensures quality, performance and bug-free experience.",
    initials: "RI",
    photo: "",
    gradient: "linear-gradient(135deg, #DDD6FE, #A78BFA)",
    lead: false,
    email: "rakibul@lifedrop.com",
    github: "#!",
    linkedin: "#!",
  },
];

export default function DevelopersPage() {
  return (
    <div style={{ minHeight: "100vh" }}>
      {/* ── Header Section ── */}
      <section style={{
        background: "linear-gradient(180deg, #F3E8FF 0%, #FDF2F8 40%, #FFFFFF 100%)",
        padding: "60px 20px 48px",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Decorative elements */}
        <div style={{ position: "absolute", top: 40, left: "15%", color: "#C4B5FD", fontSize: 28, opacity: 0.5 }}>+</div>
        <div style={{ position: "absolute", top: 80, right: "10%", color: "#C4B5FD", fontSize: 20, opacity: 0.4 }}>✦</div>
        <div style={{ position: "absolute", top: 30, right: "18%", color: "#DDD6FE", fontSize: 18, opacity: 0.5 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="6" cy="6" r="1.5"/><circle cx="18" cy="6" r="1.5"/><circle cx="6" cy="18" r="1.5"/><circle cx="18" cy="18" r="1.5"/><circle cx="12" cy="12" r="1.5"/></svg>
        </div>
        <div style={{ position: "absolute", bottom: 60, left: "8%", color: "#DDD6FE", fontSize: 22, opacity: 0.35 }}>✦</div>
        <div style={{ position: "absolute", bottom: 40, right: "6%", color: "#DDD6FE", fontSize: 18, opacity: 0.3 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="6" cy="6" r="1.5"/><circle cx="18" cy="6" r="1.5"/><circle cx="6" cy="18" r="1.5"/><circle cx="18" cy="18" r="1.5"/></svg>
        </div>

        {/* Dots grid decoration */}
        <div style={{ position: "absolute", top: 50, left: "25%", display: "grid", gridTemplateColumns: "repeat(4, 6px)", gap: 6, opacity: 0.25 }}>
          {[...Array(12)].map((_, i) => <div key={i} style={{ width: 4, height: 4, borderRadius: "50%", background: "#C4B5FD" }} />)}
        </div>
        <div style={{ position: "absolute", top: 50, right: "25%", display: "grid", gridTemplateColumns: "repeat(4, 6px)", gap: 6, opacity: 0.25 }}>
          {[...Array(12)].map((_, i) => <div key={i} style={{ width: 4, height: 4, borderRadius: "50%", background: "#C4B5FD" }} />)}
        </div>

        {/* Purple heart decoration */}
        <div style={{ position: "absolute", bottom: 80, left: "12%", opacity: 0.2 }}>
          <Heart size={24} color="#A78BFA" />
        </div>
        <div style={{ position: "absolute", top: 60, right: "5%", opacity: 0.25 }}>
          <Heart size={20} fill="#DDD6FE" color="#DDD6FE" />
        </div>

        {/* Badge */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: "rgba(124, 58, 237, 0.1)", border: "1px solid rgba(124, 58, 237, 0.2)",
          borderRadius: 999, padding: "8px 20px", marginBottom: 20,
          fontSize: 12, fontWeight: 700, letterSpacing: 1.5, color: "#7C3AED", textTransform: "uppercase",
        }}>
          <Users size={14} /> THE TEAM BEHIND LIFEDROP
        </div>

        {/* Title */}
        <h1 style={{ fontSize: 44, fontWeight: 800, lineHeight: 1.2, marginBottom: 12 }}>
          Meet Our <span style={{
            background: "linear-gradient(135deg, #EC4899, #A78BFA)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>Developers</span>
        </h1>

        {/* Heart divider */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, margin: "8px 0 16px" }}>
          <div style={{ width: 40, height: 2, background: "linear-gradient(90deg, transparent, #DDD6FE)" }} />
          <Heart size={16} fill="#A78BFA" color="#A78BFA" />
          <div style={{ width: 40, height: 2, background: "linear-gradient(90deg, #DDD6FE, transparent)" }} />
        </div>

        {/* Subtitle */}
        <p style={{ color: "#6B7280", fontSize: 16, maxWidth: 400, margin: "0 auto" }}>
          Passionate minds working together to save lives
        </p>
      </section>

      {/* ── Developer Cards ── */}
      <section style={{ padding: "48px 20px 60px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{
          display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 24,
        }}>
          {DEVELOPERS.map((dev, i) => (
            <div key={dev.name} style={{
              position: "relative",
              background: "#fff",
              border: "1px solid #EDE9FE",
              borderRadius: 20,
              padding: "40px 24px 28px",
              width: 210,
              textAlign: "center",
              boxShadow: "0 4px 20px rgba(124, 58, 237, 0.06)",
              transition: "all 0.3s ease",
            }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-6px)";
                e.currentTarget.style.boxShadow = "0 12px 32px rgba(124, 58, 237, 0.15), 0 0 20px rgba(236, 72, 153, 0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 20px rgba(124, 58, 237, 0.06)";
              }}
            >
              {/* Lead badge */}
              {dev.lead && (
                <div style={{
                  position: "absolute", top: -10, left: 16,
                  display: "flex", alignItems: "center", gap: 4,
                  background: "linear-gradient(135deg, #7C3AED, #6D28D9)",
                  color: "#fff", fontSize: 11, fontWeight: 700,
                  padding: "5px 12px", borderRadius: 999,
                  boxShadow: "0 2px 8px rgba(124, 58, 237, 0.35)",
                  letterSpacing: 0.5,
                }}>
                  <Star size={12} fill="#fff" /> LEAD
                </div>
              )}

              {/* Avatar */}
              <div style={{
                width: 90, height: 90, borderRadius: "50%",
                background: dev.gradient,
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 16px",
                boxShadow: `0 0 24px ${dev.roleColor}22, 0 0 48px ${dev.roleColor}11`,
              }}>
                {dev.photo ? (
                  <img src={dev.photo} alt={dev.name} style={{
                    width: 82, height: 82, borderRadius: "50%",
                    objectFit: "cover",
                  }} />
                ) : (
                  <div style={{
                    width: 82, height: 82, borderRadius: "50%",
                    background: "#fff",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 28, fontWeight: 800, color: dev.roleColor,
                  }}>
                    {dev.initials}
                  </div>
                )}
              </div>

              {/* Name */}
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "#1E1B4B", marginBottom: 4 }}>{dev.name}</h3>

              {/* Role */}
              <p style={{ fontSize: 13, fontWeight: 600, color: dev.roleColor, marginBottom: 12 }}>{dev.role}</p>

              {/* Description */}
              <p style={{ fontSize: 13, color: "#6B7280", lineHeight: 1.6, marginBottom: 18 }}>{dev.desc}</p>

              {/* Social icons */}
              <div style={{ display: "flex", justifyContent: "center", gap: 10 }}>
                <a href={dev.github} style={{
                  width: 34, height: 34, borderRadius: "50%",
                  background: "#F3E8FF", display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#7C3AED", transition: "all 0.2s",
                }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "#7C3AED"; e.currentTarget.style.color = "#fff"; e.currentTarget.style.boxShadow = "0 0 12px rgba(124, 58, 237, 0.4)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "#F3E8FF"; e.currentTarget.style.color = "#7C3AED"; e.currentTarget.style.boxShadow = "none"; }}
                >
                  <Code size={16} />
                </a>
                <a href={dev.linkedin} style={{
                  width: 34, height: 34, borderRadius: "50%",
                  background: "#F3E8FF", display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#7C3AED", transition: "all 0.2s",
                }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "#7C3AED"; e.currentTarget.style.color = "#fff"; e.currentTarget.style.boxShadow = "0 0 12px rgba(124, 58, 237, 0.4)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "#F3E8FF"; e.currentTarget.style.color = "#7C3AED"; e.currentTarget.style.boxShadow = "none"; }}
                >
                  <Globe size={16} />
                </a>
                <a href={`mailto:${dev.email}`} style={{
                  width: 34, height: 34, borderRadius: "50%",
                  background: "#FCE7F3", display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#EC4899", transition: "all 0.2s",
                }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "#EC4899"; e.currentTarget.style.color = "#fff"; e.currentTarget.style.boxShadow = "0 0 12px rgba(236, 72, 153, 0.4)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "#FCE7F3"; e.currentTarget.style.color = "#EC4899"; e.currentTarget.style.boxShadow = "none"; }}
                >
                  <Mail size={16} />
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Stats Banner ── */}
      <section style={{ padding: "0 20px 48px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{
          background: "linear-gradient(135deg, #7C3AED, #A855F7, #EC4899)",
          borderRadius: 24, padding: "40px 48px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexWrap: "wrap", gap: 32,
          boxShadow: "0 8px 32px rgba(124, 58, 237, 0.25)",
        }}>
          {/* Left side */}
          <div style={{ display: "flex", alignItems: "center", gap: 20, flex: "1 1 300px" }}>
            <div style={{
              width: 64, height: 64, borderRadius: "50%",
              background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <Droplet size={32} color="#fff" fill="rgba(255,255,255,0.3)" />
            </div>
            <div>
              <h3 style={{ color: "#fff", fontSize: 22, fontWeight: 800, lineHeight: 1.3 }}>Built with Passion,<br />Driven by Purpose</h3>
              <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 14, marginTop: 6 }}>
                We believe technology can make a real difference in people's lives.
              </p>
            </div>
          </div>

          {/* Right side — stats */}
          <div style={{ display: "flex", gap: 40, flexWrap: "wrap" }}>
            {[
              { icon: Code, value: "10K+", label: "Lines of Code" },
              { icon: UserPlus, value: "500+", label: "Happy Users" },
              { icon: Heart, value: "100+", label: "Lives Impacted" },
            ].map((stat) => (
              <div key={stat.label} style={{ textAlign: "center" }}>
                <stat.icon size={20} color="rgba(255,255,255,0.8)" style={{ marginBottom: 6 }} />
                <div style={{ color: "#fff", fontSize: 28, fontWeight: 800 }}>{stat.value}</div>
                <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 13 }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer Message ── */}
      <section style={{ padding: "0 20px 60px", maxWidth: 800, margin: "0 auto" }}>
        <div style={{
          background: "#fff", border: "1px solid #EDE9FE", borderRadius: 16,
          padding: "24px 32px", display: "flex", alignItems: "center",
          justifyContent: "space-between", flexWrap: "wrap", gap: 16,
          boxShadow: "0 2px 12px rgba(124, 58, 237, 0.06)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Heart size={18} fill="#EC4899" color="#EC4899" />
            <span style={{ fontSize: 14, color: "#6B7280" }}>
              LifeDrop is more than a platform, it's a mission to save lives.
            </span>
          </div>
          <span style={{
            fontSize: 14, fontWeight: 600, fontStyle: "italic",
            background: "linear-gradient(135deg, #EC4899, #A78BFA)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>
            Thank you for being a part of our journey! 💜
          </span>
        </div>
      </section>
    </div>
  );
}
