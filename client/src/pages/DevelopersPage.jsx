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
    github: "https://github.com/eshtiak23",
    linkedin: "https://www.linkedin.com/in/eshtiak23/",
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
    name: "Sabbir Ahmed",
    role: "Dead_Weight",
    roleColor: "#EC4899",
    desc: "Designs beautiful and intuitive experiences for users.",
    initials: "SA",
    photo: "/sabbir.jpg",
    gradient: "linear-gradient(135deg, #FBCFE8, #F472B6)",
    lead: false,
    email: "sabbir@lifedrop.com",
    github: "#!",
    linkedin: "#!",
  },
  {
    name: "Al Yeamin Abir",
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
  {
    name: "Md. Aliul Islam",
    role: "Frontend Developer",
    roleColor: "#F59E0B",
    desc: "Handles server-side logic, database management and API integration.",
    initials: "RA",
    photo: "",
    gradient: "linear-gradient(135deg, #FDE68A, #F59E0B)",
    lead: false,
    email: "aliul@lifedrop.com",
    github: "#!",
    linkedin: "#!",
  }
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
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 28, justifyItems: "center",
        }}>
          {DEVELOPERS.map((dev, i) => (
            <div key={dev.name} className="dev-card" style={{
              position: "relative",
              background: "#fff",
              borderRadius: 24,
              padding: "48px 28px 32px",
              width: "100%",
              maxWidth: 340,
              textAlign: "center",
              boxShadow: "0 4px 20px rgba(124, 58, 237, 0.06)",
              transition: "all 0.4s ease",
              animation: `devCardFadeIn 0.5s ease forwards`,
              animationDelay: `${i * 0.1}s`,
              opacity: 0,
              transformStyle: "preserve-3d",
              perspective: 800,
              cursor: "pointer",
            }}
              onMouseEnter={(e) => {
                const card = e.currentTarget;
                card.style.boxShadow = "0 20px 50px rgba(124, 58, 237, 0.2), 0 0 30px rgba(236, 72, 153, 0.15)";
                card.classList.add("dev-card-hover");
              }}
              onMouseMove={(e) => {
                const card = e.currentTarget;
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = ((y - centerY) / centerY) * -8;
                const rotateY = ((x - centerX) / centerX) * 8;
                card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
              }}
              onMouseLeave={(e) => {
                const card = e.currentTarget;
                card.style.transform = "perspective(800px) rotateX(0deg) rotateY(0deg) translateZ(0px)";
                card.style.boxShadow = "0 4px 20px rgba(124, 58, 237, 0.06)";
                card.classList.remove("dev-card-hover");
              }}
            >
              {/* Card color accent */}
              <div style={{
                position: "absolute", top: 0, left: 0, right: 0, height: 4,
                borderRadius: "24px 24px 0 0",
                background: `linear-gradient(90deg, ${dev.roleColor}, ${dev.roleColor}88)`,
              }} />

              {/* Lead badge */}
              {dev.lead && (
                <div style={{
                  position: "absolute", top: -12, left: 18,
                  display: "flex", alignItems: "center", gap: 5,
                  background: "linear-gradient(135deg, #7C3AED, #6D28D9)",
                  color: "#fff", fontSize: 12, fontWeight: 700,
                  padding: "6px 14px", borderRadius: 999,
                  boxShadow: "0 2px 10px rgba(124, 58, 237, 0.4)",
                  letterSpacing: 0.5,
                }}>
                  <Star size={13} fill="#fff" /> LEAD
                </div>
              )}

              {/* Avatar */}
              <div style={{
                width: 100, height: 100, borderRadius: "50%",
                background: dev.gradient,
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 18px",
                boxShadow: `0 0 28px ${dev.roleColor}22, 0 0 56px ${dev.roleColor}11`,
              }}>
                {dev.photo ? (
                  <img src={dev.photo} alt={dev.name} style={{
                    width: 92, height: 92, borderRadius: "50%",
                    objectFit: "cover",
                  }} />
                ) : (
                  <div style={{
                    width: 92, height: 92, borderRadius: "50%",
                    background: "#fff",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 32, fontWeight: 800, color: dev.roleColor,
                  }}>
                    {dev.initials}
                  </div>
                )}
              </div>

              {/* Name */}
              <h3 style={{ fontSize: 17, fontWeight: 700, color: "#1E1B4B", marginBottom: 4 }}>{dev.name}</h3>

              {/* Role */}
              <p style={{ fontSize: 14, fontWeight: 600, color: dev.roleColor, marginBottom: 14 }}>{dev.role}</p>

              {/* Description */}
              <p style={{ fontSize: 14, color: "#6B7280", lineHeight: 1.6, marginBottom: 20 }}>{dev.desc}</p>

              {/* Social icons */}
              <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
                <a href={dev.github} target="_blank" rel="noopener noreferrer" style={{
                  width: 38, height: 38, borderRadius: "50%",
                  background: "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#333", transition: "all 0.3s ease", border: "1px solid #E5E7EB",
                }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "#24292e"; e.currentTarget.style.color = "#fff"; e.currentTarget.style.boxShadow = "0 0 16px rgba(36, 41, 46, 0.4)"; e.currentTarget.style.transform = "scale(1.1)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "#F3F4F6"; e.currentTarget.style.color = "#333"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "scale(1)"; }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                </a>
                <a href={dev.linkedin} target="_blank" rel="noopener noreferrer" style={{
                  width: 38, height: 38, borderRadius: "50%",
                  background: "#E8F4FD", display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#0A66C2", transition: "all 0.3s ease", border: "1px solid #B8D8F0",
                }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "#0A66C2"; e.currentTarget.style.color = "#fff"; e.currentTarget.style.boxShadow = "0 0 16px rgba(10, 102, 194, 0.4)"; e.currentTarget.style.transform = "scale(1.1)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "#E8F4FD"; e.currentTarget.style.color = "#0A66C2"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "scale(1)"; }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                </a>
                <a href={`mailto:${dev.email}`} style={{
                  width: 38, height: 38, borderRadius: "50%",
                  background: "#FDE8EF", display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#EC4899", transition: "all 0.3s ease", border: "1px solid #F5C2D4",
                }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "#EC4899"; e.currentTarget.style.color = "#fff"; e.currentTarget.style.boxShadow = "0 0 16px rgba(236, 72, 153, 0.4)"; e.currentTarget.style.transform = "scale(1.1)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "#FDE8EF"; e.currentTarget.style.color = "#EC4899"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "scale(1)"; }}
                >
                  <Mail size={18} />
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
