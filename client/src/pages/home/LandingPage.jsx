/**
 * LandingPage.jsx — Public landing page for LifeDrop blood donor management app.
 * Displays hero banner, stats, how-it-works steps, features, blood groups,
 * testimonials, FAQ accordion, and a call-to-action section.
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { Heart, ArrowRight, Search, Phone, Shield, History, Bell, Lock, ChevronDown, Star, AlertTriangle, Droplet, X, Droplets } from "lucide-react";
import { TESTIMONIALS, FAQS, BLOOD_GROUPS, BLOOD_GROUP_COLORS } from "../../data/constants";
import { getAllFeedback } from "../../services/localStore";
import api from "../../services/api";

/* ── Helper: Blood Group Color ── */
function getBloodGroupColor(bloodGroup) {
  const c = BLOOD_GROUP_COLORS[bloodGroup];
  if (!c) return {};
  const isDark = document.documentElement.classList.contains("dark");
  return { bg: isDark ? c.darkBg : c.bg, text: isDark ? c.darkText : c.text };
}

/* ── Hook: IntersectionObserver for scroll-triggered animations ── */
function useInView(ref, threshold = 0.15) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    // Observe element; once visible, mark as seen and stop observing
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold });
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [ref, threshold]);
  return visible;
}

/* ── Component: Fade-in wrapper with optional stagger delay ── */
function AnimatedDiv({ children, delay = 0, style = {} }) {
  const ref = useRef(null);
  const visible = useInView(ref);
  return <div ref={ref} style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(24px)", transition: `all 0.5s ease ${delay}s`, ...style }}>{children}</div>;
}

/* ── Component: Animated counter that counts up when scrolled into view ── */
function CountUpStat({ target, suffix = "", label, delay = 0 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const visible = useInView(ref);
  const started = useRef(false);

  useEffect(() => {
    if (!visible || started.current || !target) return;
    started.current = true;
    const duration = 1500;
    const start = performance.now();
    const animate = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [visible, target]);

  return (
    <div ref={ref} style={{ textAlign: "center", opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(24px)", transition: `all 0.5s ease ${delay}s` }}>
      <div style={{ fontSize: 28, fontWeight: 800, color: "var(--red)" }}>{count}{suffix}</div>
      <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 4 }}>{label}</div>
    </div>
  );
}

/* ── Data: Feature cards ── */
const FEATURES = [
  { title: "Find Donors Instantly", desc: "Search by blood group, location, and availability.", icon: Search },
  { title: "Emergency Requests", desc: "Create urgent blood requests and reach donors in minutes.", icon: AlertTriangle },
  { title: "Verified Donors", desc: "All donors are verified for safety and reliability.", icon: Shield },
  { title: "Track Donations", desc: "Keep a complete record and get eligibility reminders.", icon: History },
  { title: "Real-time Notifications", desc: "Instant notifications for requests and updates.", icon: Bell },
  { title: "Safe & Secure", desc: "Your data is encrypted and privacy is prioritized.", icon: Lock },
];

/* ── Data: Blood compatibility matrix ── */
const COMPATIBILITY = {
  "O-":  { donateTo: ["O-","O+","A-","A+","B-","B+","AB-","AB+"], receiveFrom: ["O-"] },
  "O+":  { donateTo: ["O+","A+","B+","AB+"], receiveFrom: ["O-","O+"] },
  "A-":  { donateTo: ["A-","A+","AB-","AB+"], receiveFrom: ["O-","A-"] },
  "A+":  { donateTo: ["A+","AB+"], receiveFrom: ["O-","O+","A-","A+"] },
  "B-":  { donateTo: ["B-","B+","AB-","AB+"], receiveFrom: ["O-","B-"] },
  "B+":  { donateTo: ["B+","AB+"], receiveFrom: ["O-","O+","B-","B+"] },
  "AB-": { donateTo: ["AB-","AB+"], receiveFrom: ["O-","A-","B-","AB-"] },
  "AB+": { donateTo: ["AB+"], receiveFrom: ["O-","O+","A-","A+","B-","B+","AB-","AB+"] },
};
const BLOOD_TYPES = ["O-","O+","A-","A+","B-","B+","AB-","AB+"];

/* ── Main Component ── */
export default function LandingPage() {
  // Track which FAQ item is expanded (null = all collapsed)
  const [openFaq, setOpenFaq] = useState(null);
  const [userFeedback, setUserFeedback] = useState([]);
  const [bannerIdx, setBannerIdx] = useState(0);
  const [realStats, setRealStats] = useState(null);
  const [selectedBloodType, setSelectedBloodType] = useState("O-");
  const [showCompatModal, setShowCompatModal] = useState(false);
  const banners = [
    "/banner1.png",
    "/banner2.png",
    "/banner3.webp",
    "/banner4.webp",
  ];

  useEffect(() => {
    getAllFeedback().then((fb) => {
      setUserFeedback(fb.map((f) => ({
        name: f.userName,
        role: "LifeDrop User",
        content: f.comment,
        rating: f.rating,
        isUserFeedback: true,
        userPhoto: f.userPhoto,
      })));
    }).catch(() => {});
    api.get("/stats").then((res) => setRealStats(res.data)).catch(() => {});
  }, []);

  // Auto-rotate banner every 4 seconds
  useEffect(() => {
    const timer = setInterval(() => setBannerIdx((i) => (i + 1) % banners.length), 4000);
    return () => clearInterval(timer);
  }, [banners.length]);

  // Close compat modal on Escape key
  useEffect(() => {
    if (!showCompatModal) return;
    const handleEsc = (e) => { if (e.key === "Escape") setShowCompatModal(false); };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [showCompatModal]);

  // Merge static testimonials with user feedback (user feedback shows first)
  const allTestimonials = [...userFeedback, ...TESTIMONIALS];

  return (
    <div>
      {/* ── Hero ── */}
      <section className="hero-section">
        <div className="hero-banner-wrap">
          {/* Banner images with crossfade */}
          {banners.map((src, i) => (
            <img key={src} src={src} alt={`LifeDrop banner ${i + 1}`} className={`hero-banner-img ${i === bannerIdx ? "hero-banner-active" : ""}`} />
          ))}
          {/* Color overlay */}
          <div className="hero-overlay" />
          {/* Animated blood drops */}
          <div className="hero-drops">
            {[...Array(10)].map((_, i) => (
              <span key={i} className="blood-drop" style={{
                left: `${8 + i * 9}%`,
                animationDelay: `${i * 0.7}s`,
                animationDuration: `${3.5 + (i % 3) * 1.5}s`,
                width: `${6 + (i % 3) * 2}px`,
                height: `${6 + (i % 3) * 2}px`,
              }} />
            ))}
          </div>
          {/* Center content: heading, subtitle, buttons */}
          <div className="hero-content">
            <h1 className="hero-title">Every Drop <span>Counts</span></h1>
            <p className="hero-subtitle">Find blood donors instantly. Connect, donate, and save lives.</p>
            <div className="hero-btns">
              <Link to="/requests/create" className="btn btn-hero-primary">Request Blood</Link>
              <Link to="/donors" className="btn btn-hero-secondary">Find Donors</Link>
            </div>
          </div>
          {/* Dot indicators */}
          <div className="hero-banner-dots">
            {banners.map((_, i) => (
              <button key={i} onClick={() => setBannerIdx(i)} className={`hero-banner-dot ${i === bannerIdx ? "hero-banner-dot-active" : ""}`} aria-label={`Slide ${i + 1}`} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section style={{ borderBottom: "1px solid var(--border)", background: "var(--bg-card)", padding: "32px 0" }}>
        <div className="container">
          <div className="grid grid-4">
            {realStats ? (
              <>
                <CountUpStat target={realStats.totalDonors} suffix="+" label="Registered Donors" delay={0} />
                <CountUpStat target={realStats.livesSaved} suffix="+" label="Lives Saved" delay={0.1} />
                <CountUpStat target={realStats.districtsCovered} label="Districts Covered" delay={0.2} />
              </>
            ) : (
              <>
                <AnimatedDiv delay={0}><div style={{ textAlign: "center" }}><div style={{ fontSize: 28, fontWeight: 800, color: "var(--red)" }}>...</div><div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 4 }}>Registered Donors</div></div></AnimatedDiv>
                <AnimatedDiv delay={0.1}><div style={{ textAlign: "center" }}><div style={{ fontSize: 28, fontWeight: 800, color: "var(--red)" }}>...</div><div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 4 }}>Lives Saved</div></div></AnimatedDiv>
                <AnimatedDiv delay={0.2}><div style={{ textAlign: "center" }}><div style={{ fontSize: 28, fontWeight: 800, color: "var(--red)" }}>...</div><div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 4 }}>Districts Covered</div></div></AnimatedDiv>
              </>
            )}
            <AnimatedDiv delay={0.3}><div style={{ textAlign: "center" }}><div style={{ fontSize: 28, fontWeight: 800, color: "var(--red)" }}>24/7</div><div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 4 }}>Emergency Support</div></div></AnimatedDiv>
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="section reveal" style={{ background: "var(--bg-card)" }}>
        <div className="container" style={{ textAlign: "center" }}>
          <h2 style={{ fontSize: 32, fontWeight: 800 }}>How It Works</h2>
          <p style={{ color: "var(--text-secondary)", marginTop: 8 }}>Simple steps to save a life</p>
          <div className="how-it-works-row" style={{ marginTop: 48 }}>
            {[{ icon: Search, title: "Search", desc: "Find donors by blood group and location" },
              { icon: Phone, title: "Connect", desc: "Reach out to verified donors" },
              { icon: Heart, title: "Donate", desc: "Meet and donate blood" },
              { icon: History, title: "Track", desc: "Track donation history" }].map((s, i) => (
              <div key={s.title} className="how-it-works-step-wrap">
                <AnimatedDiv delay={i * 0.1}>
                  <div className="how-it-works-card how-it-works-card-3d"
                    onMouseMove={(e) => {
                      const card = e.currentTarget;
                      const rect = card.getBoundingClientRect();
                      const x = e.clientX - rect.left;
                      const y = e.clientY - rect.top;
                      const centerX = rect.width / 2;
                      const centerY = rect.height / 2;
                      const rotateX = ((y - centerY) / centerY) * -5;
                      const rotateY = ((x - centerX) / centerX) * 5;
                      card.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(6px)`;
                      const glare = card.querySelector(".feature-card-glare");
                      if (glare) {
                        glare.style.opacity = "1";
                        glare.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.08) 40%, transparent 70%)`;
                      }
                    }}
                    onMouseLeave={(e) => {
                      const card = e.currentTarget;
                      card.style.transform = "perspective(600px) rotateX(0deg) rotateY(0deg) translateZ(0px)";
                      const glare = card.querySelector(".feature-card-glare");
                      if (glare) { glare.style.opacity = "0"; }
                    }}
                  >
                    <div className="feature-card-glare" />
                    <div className="how-it-works-icon">
                      <s.icon size={28} color="var(--red)" />
                    </div>
                    <h3 style={{ fontSize: 16, fontWeight: 700, marginTop: 16 }}>{s.title}</h3>
                    <p style={{ fontSize: 14, color: "var(--text-secondary)", marginTop: 6 }}>{s.desc}</p>
                  </div>
                </AnimatedDiv>
                {i < 3 && (
                  <div className="how-it-works-arrow">
                    <ArrowRight size={28} color="var(--lavender)" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Blood Compatibility Chart (Compact Trigger) ── */}
      <section className="section reveal">
        <div className="container" style={{ position: "relative" }}>
          {/* Left blood man */}
          <div className="blood-man blood-man-left">
            <div className="blood-man-body">
              <div className="blood-man-eyes">
                <div className="blood-man-eye"><div className="blood-man-pupil" /></div>
                <div className="blood-man-eye"><div className="blood-man-pupil" style={{ animationDelay: "0.1s" }} /></div>
              </div>
              <div className="blood-man-cheeks"><div className="blood-man-cheek" /><div className="blood-man-cheek" /></div>
              <div className="blood-man-smile" />
            </div>
          </div>
          {/* Right blood man */}
          <div className="blood-man blood-man-right">
            <div className="blood-man-body">
              <div className="blood-man-eyes">
                <div className="blood-man-eye"><div className="blood-man-pupil" style={{ animationDelay: "1.5s" }} /></div>
                <div className="blood-man-eye"><div className="blood-man-pupil" style={{ animationDelay: "1.6s" }} /></div>
              </div>
              <div className="blood-man-cheeks"><div className="blood-man-cheek" /><div className="blood-man-cheek" /></div>
              <div className="blood-man-smile" />
            </div>
          </div>

          <AnimatedDiv>
            <div
              onClick={() => setShowCompatModal(true)}
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border-light)",
                borderRadius: "var(--radius-xl)",
                padding: "48px 40px",
                textAlign: "center",
                cursor: "pointer",
                transition: "all 0.3s ease",
                maxWidth: 780,
                margin: "0 auto",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "var(--shadow-lg)";
                e.currentTarget.style.borderColor = "rgba(239,68,68,0.3)";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.borderColor = "var(--border-light)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 12 }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: "var(--red-light)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Droplets size={24} color="var(--red)" />
                </div>
                <h2 style={{ fontSize: 24, fontWeight: 800 }}>Blood Compatibility Chart</h2>
              </div>
              <p style={{ color: "var(--text-secondary)", fontSize: 15, maxWidth: 440, margin: "0 auto 20px", lineHeight: 1.6 }}>
                Find your compatible blood donors in seconds.
              </p>
              {/* Mini blood type pills preview */}
              <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 6, marginBottom: 20 }}>
                {BLOOD_TYPES.map((bt) => {
                  const c = getBloodGroupColor(bt);
                  return (
                    <span key={bt} style={{ padding: "5px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700, background: c.bg || "var(--bg-secondary)", color: c.text || "var(--text)" }}>
                      {bt}
                    </span>
                  );
                })}
              </div>
              {/* CTA */}
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 24px", borderRadius: 50, background: "var(--red)", color: "#fff", fontSize: 14, fontWeight: 700, transition: "all 0.2s" }}>
                View Full Chart <ArrowRight size={16} />
              </div>
            </div>
          </AnimatedDiv>
        </div>
      </section>

      {/* ── Blood Compatibility Modal ── */}
      {showCompatModal && createPortal(
        <div
          onClick={() => setShowCompatModal(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 10000,
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
            overflowY: "auto",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "var(--bg-card)",
              borderRadius: "var(--radius-xl)",
              width: "100%",
              maxWidth: 680,
              maxHeight: "90vh",
              overflowY: "auto",
              padding: "28px 24px",
              position: "relative",
            }}
          >
            {/* Close button */}
            <button
              onClick={() => setShowCompatModal(false)}
              style={{
                position: "absolute",
                top: 16,
                right: 16,
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: "var(--bg-secondary)",
                border: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "var(--text-secondary)",
                transition: "all 0.15s",
                zIndex: 1,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "var(--red-light)"; e.currentTarget.style.color = "var(--red)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "var(--bg-secondary)"; e.currentTarget.style.color = "var(--text-secondary)"; }}
            >
              <X size={18} />
            </button>

            {/* Title */}
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: "var(--red-light)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                <Droplets size={22} color="var(--red)" />
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 800 }}>Blood Compatibility Chart</h2>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 6 }}>Select a blood type to see compatibility</p>
            </div>

            {/* Blood type selector pills */}
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 6, marginBottom: 24 }}>
              {BLOOD_TYPES.map((bt) => {
                const c = getBloodGroupColor(bt);
                const isSelected = selectedBloodType === bt;
                return (
                  <button
                    key={bt}
                    onClick={() => setSelectedBloodType(bt)}
                    style={{
                      padding: "8px 16px", borderRadius: 50, border: "none", cursor: "pointer",
                      fontSize: 13, fontWeight: 700, transition: "all 0.2s ease",
                      background: isSelected ? (c.text || "#DC2626") : (c.bg || "var(--bg-secondary)"),
                      color: isSelected ? "#fff" : (c.text || "var(--text)"),
                      boxShadow: isSelected ? `0 3px 12px ${c.text || "#DC2626"}44` : "none",
                      transform: isSelected ? "scale(1.06)" : "scale(1)",
                    }}
                  >
                    {bt}
                  </button>
                );
              })}
            </div>

            {/* Donate To / Receive From cards */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 24 }}>
              {/* Can Donate To */}
              <div style={{ padding: 18, borderRadius: "var(--radius)", border: "1px solid var(--border-light)", background: "var(--bg-card)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--green-light)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Heart size={16} color="var(--green)" fill="var(--green)" />
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>Can Donate To</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{COMPATIBILITY[selectedBloodType].donateTo.length} types</div>
                  </div>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {COMPATIBILITY[selectedBloodType].donateTo.map((bt) => {
                    const c = getBloodGroupColor(bt);
                    return (
                      <span key={bt} style={{ padding: "4px 10px", borderRadius: 16, fontSize: 12, fontWeight: 600, background: c.bg || "var(--bg-secondary)", color: c.text || "var(--text)" }}>
                        {bt}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Can Receive From */}
              <div style={{ padding: 18, borderRadius: "var(--radius)", border: "1px solid var(--border-light)", background: "var(--bg-card)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--red-light)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Droplet size={16} color="var(--red)" />
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>Can Receive From</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{COMPATIBILITY[selectedBloodType].receiveFrom.length} types</div>
                  </div>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {COMPATIBILITY[selectedBloodType].receiveFrom.map((bt) => {
                    const c = getBloodGroupColor(bt);
                    return (
                      <span key={bt} style={{ padding: "4px 10px", borderRadius: 16, fontSize: 12, fontWeight: 600, background: c.bg || "var(--bg-secondary)", color: c.text || "var(--text)" }}>
                        {bt}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Full compatibility matrix */}
            <div style={{ overflowX: "auto", marginBottom: 20 }}>
              <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 2, fontSize: 12 }}>
                <thead>
                  <tr>
                    <th style={{ padding: "6px 4px", fontWeight: 700, color: "var(--text-muted)", fontSize: 10, textAlign: "center" }}>Donor ↓ / Recipient →</th>
                    {BLOOD_TYPES.map((bt) => (
                      <th key={bt} style={{ padding: "6px 4px", fontWeight: 700, fontSize: 11, textAlign: "center", color: selectedBloodType === bt ? "var(--red)" : "var(--text)", background: selectedBloodType === bt ? "var(--red-light)" : "transparent", borderRadius: 4 }}>{bt}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {BLOOD_TYPES.map((donor) => (
                    <tr key={donor}>
                      <td style={{ padding: "6px 4px", fontWeight: 700, fontSize: 11, textAlign: "center", color: selectedBloodType === donor ? "var(--red)" : "var(--text)", background: selectedBloodType === donor ? "var(--red-light)" : "transparent", borderRadius: 4 }}>{donor}</td>
                      {BLOOD_TYPES.map((recipient) => {
                        const compatible = COMPATIBILITY[donor].donateTo.includes(recipient);
                        const isHighlighted = selectedBloodType === donor || selectedBloodType === recipient;
                        return (
                          <td key={recipient} style={{
                            padding: "6px 4px", textAlign: "center", borderRadius: 4,
                            background: compatible
                              ? (isHighlighted ? "rgba(34,197,94,0.25)" : "rgba(34,197,94,0.1)")
                              : (isHighlighted ? "rgba(239,68,68,0.1)" : "transparent"),
                            transition: "background 0.2s ease",
                          }}>
                            {compatible ? "✅" : "❌"}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Universal donor/recipient badges */}
            <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 50, background: "var(--green-light)", border: "1px solid rgba(34,197,94,0.2)" }}>
                <Heart size={14} color="var(--green)" fill="var(--green)" />
                <span style={{ fontSize: 12, fontWeight: 700, color: "var(--green)" }}>Universal Donor: O-</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 50, background: "var(--red-light)", border: "1px solid rgba(239,68,68,0.2)" }}>
                <Droplet size={14} color="var(--red)" />
                <span style={{ fontSize: 12, fontWeight: 700, color: "var(--red)" }}>Universal Recipient: AB+</span>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ── Features ── */}
      <section className="section reveal">
        <div className="container" style={{ textAlign: "center" }}>
          <h2 style={{ fontSize: 32, fontWeight: 800 }}>Why Choose LifeDrop?</h2>
          <div className="grid grid-3" style={{ marginTop: 48 }}>
            {FEATURES.map((f, i) => (
              <AnimatedDiv key={f.title} delay={i * 0.08}>
                <div className="feature-card-3d" style={{ padding: 28, borderRadius: "var(--radius)", border: "1px solid var(--border-light)", background: "var(--bg-card)" }}
                  onMouseMove={(e) => {
                    const card = e.currentTarget;
                    const rect = card.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    const centerX = rect.width / 2;
                    const centerY = rect.height / 2;
                    const rotateX = ((y - centerY) / centerY) * -5;
                    const rotateY = ((x - centerX) / centerX) * 5;
                    card.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(6px)`;
                    const glare = card.querySelector(".feature-card-glare");
                    if (glare) {
                      glare.style.opacity = "1";
                      glare.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.08) 40%, transparent 70%)`;
                    }
                  }}
                  onMouseLeave={(e) => {
                    const card = e.currentTarget;
                    card.style.transform = "perspective(600px) rotateX(0deg) rotateY(0deg) translateZ(0px)";
                    const glare = card.querySelector(".feature-card-glare");
                    if (glare) { glare.style.opacity = "0"; }
                  }}
                >
                  <div className="feature-card-glare" />
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: "var(--red-light)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <f.icon size={24} color="var(--red)" />
                  </div>
                  <h3 style={{ fontSize: 17, fontWeight: 700, marginTop: 16 }}>{f.title}</h3>
                  <p style={{ fontSize: 14, color: "var(--text-secondary)", marginTop: 8 }}>{f.desc}</p>
                </div>
              </AnimatedDiv>
            ))}
          </div>
        </div>
      </section>

      {/* ── Blood Groups ── */}
      <section className="section reveal" style={{ background: "var(--bg-card)" }}>
        <div className="container" style={{ textAlign: "center" }}>
          <h2 style={{ fontSize: 32, fontWeight: 800 }}>Blood Groups We Serve</h2>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 16, marginTop: 40 }}>
            {BLOOD_GROUPS.map((g) => {
              const c = getBloodGroupColor(g);
              return (
                <Link key={g} to={`/donors?bloodGroup=${g}`} className="blood-group-card blood-group-pulse"
                  style={{
                    width: 80, height: 80, borderRadius: 18, display: "flex", alignItems: "center", justifyContent: "center",
                    background: c.bg, color: c.text, fontSize: 17, fontWeight: 700,
                    boxShadow: "var(--shadow)", transition: "all 0.3s ease", cursor: "pointer",
                    border: `2px solid transparent`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-6px) scale(1.08)";
                    e.currentTarget.style.boxShadow = `0 8px 30px ${c.text}30, 0 0 0 2px ${c.text}50`;
                    e.currentTarget.style.borderColor = c.text + "60";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0) scale(1)";
                    e.currentTarget.style.boxShadow = "var(--shadow)";
                    e.currentTarget.style.borderColor = "transparent";
                  }}
                >{g}</Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="section reveal">
        <div className="container" style={{ textAlign: "center" }}>
          <h2 style={{ fontSize: 32, fontWeight: 800 }}>What People Say</h2>
          <div className="grid grid-3" style={{ marginTop: 48 }}>
            {allTestimonials.map((t, i) => (
              <AnimatedDiv key={t.name + i} delay={i * 0.1}>
                <div className="testimonial-card-3d" style={{ padding: 28, borderRadius: "var(--radius)", border: "1px solid var(--border-light)", background: "var(--bg-card)", textAlign: "left", position: "relative", overflow: "hidden" }}
                  onMouseMove={(e) => {
                    const card = e.currentTarget;
                    const rect = card.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    const centerX = rect.width / 2;
                    const centerY = rect.height / 2;
                    const rotateX = ((y - centerY) / centerY) * -5;
                    const rotateY = ((x - centerX) / centerX) * 5;
                    card.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(6px)`;
                    const glare = card.querySelector(".testimonial-card-glare");
                    if (glare) {
                      glare.style.opacity = "1";
                      glare.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.08) 40%, transparent 70%)`;
                    }
                  }}
                  onMouseLeave={(e) => {
                    const card = e.currentTarget;
                    card.style.transform = "perspective(600px) rotateX(0deg) rotateY(0deg) translateZ(0px)";
                    const glare = card.querySelector(".testimonial-card-glare");
                    if (glare) { glare.style.opacity = "0"; }
                  }}
                >
                  <div className="testimonial-card-glare" />
                  {t.isUserFeedback && <div style={{ position: "absolute", top: 12, right: 12, fontSize: 10, fontWeight: 600, color: "var(--red)", background: "var(--red-light)", padding: "2px 8px", borderRadius: 10 }}>User Review</div>}
                  <div style={{ display: "flex", gap: 2 }}>{[...Array(5)].map((_, j) => <Star key={j} size={14} fill={j < (t.rating || 5) ? "#FBBF24" : "none"} color={j < (t.rating || 5) ? "#FBBF24" : "var(--text-muted)"} />)}</div>
                  <p style={{ fontSize: 14, color: "var(--text-secondary)", marginTop: 14, lineHeight: 1.7 }}>"{t.content}"</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 16 }}>
                    <div className="avatar" style={{ background: t.isUserFeedback && t.userPhoto ? "none" : "linear-gradient(135deg, #EF4444, #DC2626)", color: "white", overflow: t.userPhoto ? "hidden" : "visible" }}>
                      {t.userPhoto ? <img src={t.userPhoto} alt={t.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : t.name.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>{t.name}</div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{t.role}</div>
                    </div>
                  </div>
                </div>
              </AnimatedDiv>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="section reveal" style={{ background: "var(--bg-card)" }}>
        <div className="container" style={{ maxWidth: 700, margin: "0 auto" }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, textAlign: "center" }}>Frequently Asked Questions</h2>
          <div style={{ marginTop: 40, display: "flex", flexDirection: "column", gap: 12 }}>
            {FAQS.map((faq, i) => (
              <div key={i} className="faq-item">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="faq-btn">
                  {faq.question}
                  <ChevronDown size={18} style={{ transform: openFaq === i ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s", flexShrink: 0, marginLeft: 12 }} />
                </button>
                {openFaq === i && (
                  <div className="faq-answer">{faq.answer}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="section reveal">
        <div className="container">
          <div style={{ background: "linear-gradient(135deg, #EF4444, #B91C1C)", borderRadius: "var(--radius-xl)", padding: "60px 40px", textAlign: "center", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -40, right: -40, width: 160, height: 160, borderRadius: "50%", background: "rgba(255,255,255,0.1)" }} />
            <div style={{ position: "absolute", bottom: -40, left: -40, width: 160, height: 160, borderRadius: "50%", background: "rgba(255,255,255,0.1)" }} />
            <div style={{ position: "relative" }}>
              <Droplet size={40} color="white" fill="white" style={{ margin: "0 auto" }} />
              <h2 style={{ fontSize: 32, fontWeight: 800, color: "white", marginTop: 16 }}>Become a Blood Donor Today</h2>
              <p style={{ fontSize: 17, color: "rgba(255,255,255,0.8)", marginTop: 12, maxWidth: 500, margin: "12px auto 0" }}>Join thousands of donors saving lives every day.</p>
              <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 28, flexWrap: "wrap" }}>
                <Link to="/register" className="btn" style={{ background: "white", color: "var(--red)", fontWeight: 700, padding: "14px 32px", borderRadius: "var(--radius)" }}>Register as Donor <ArrowRight size={18} /></Link>
                <Link to="/requests/create" className="btn" style={{ border: "1px solid white", color: "white", padding: "14px 32px", borderRadius: "var(--radius)" }}>Request Blood</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Responsive overrides + hero styles */}
      <style>{`
        .hero-section {
          position: relative;
          width: 100%;
          overflow: hidden;
        }
        .hero-banner-wrap {
          position: relative;
          width: 100%;
          height: 560px;
          overflow: hidden;
        }
        .hero-banner-img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 0;
          transition: opacity 0.8s ease-in-out;
        }
        .hero-banner-active {
          opacity: 1;
        }
        .hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(153, 27, 27, 0.55) 0%, rgba(127, 29, 29, 0.45) 40%, rgba(185, 28, 28, 0.35) 100%);
          z-index: 1;
        }
        .hero-drops {
          position: absolute;
          inset: 0;
          z-index: 1;
          pointer-events: none;
          overflow: hidden;
        }
        .blood-drop {
          position: absolute;
          top: -12px;
          border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
          background: rgba(239, 68, 68, 0.35);
          animation: bloodDropFall linear infinite;
          will-change: transform;
        }
        @keyframes bloodDropFall {
          0% { transform: translateY(-12px); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(580px); opacity: 0; }
        }
        .hero-content {
          position: absolute;
          inset: 0;
          z-index: 2;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 0 20px;
        }
        .hero-title {
          font-size: 56px;
          font-weight: 800;
          color: #fff;
          line-height: 1.1;
          text-shadow: 0 2px 20px rgba(0,0,0,0.3);
        }
        .hero-title span {
          background: linear-gradient(135deg, #FCA5A5, #FEE2E2);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .hero-subtitle {
          font-size: 18px;
          color: rgba(255, 255, 255, 0.85);
          margin-top: 16px;
          max-width: 500px;
          text-shadow: 0 1px 8px rgba(0,0,0,0.2);
        }
        .hero-btns {
          display: flex;
          gap: 16px;
          margin-top: 32px;
          flex-wrap: wrap;
          justify-content: center;
        }
        .btn-hero-primary {
          padding: 14px 36px;
          border-radius: 50px;
          font-size: 16px;
          font-weight: 700;
          color: #fff;
          background: linear-gradient(135deg, #EF4444, #EC4899);
          box-shadow: 0 4px 20px rgba(239, 68, 68, 0.4);
          transition: all 0.3s ease;
          border: none;
          animation: ctaPulse 2s ease-in-out infinite;
        }
        @keyframes ctaPulse {
          0%, 100% { box-shadow: 0 4px 20px rgba(239, 68, 68, 0.4); }
          50% { box-shadow: 0 4px 32px rgba(239, 68, 68, 0.7); }
        }
        .btn-hero-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 28px rgba(239, 68, 68, 0.5);
        }
        .btn-hero-secondary {
          padding: 14px 36px;
          border-radius: 50px;
          font-size: 16px;
          font-weight: 700;
          color: #fff;
          background: rgba(255, 255, 255, 0.12);
          border: 1.5px solid rgba(255, 255, 255, 0.4);
          backdrop-filter: blur(8px);
          transition: all 0.3s ease;
        }
        .btn-hero-secondary:hover {
          background: rgba(255, 255, 255, 0.22);
          border-color: rgba(255, 255, 255, 0.6);
          transform: translateY(-2px);
        }
        .hero-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          z-index: 3;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
          border: 1.5px solid rgba(255, 255, 255, 0.25);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          backdrop-filter: blur(6px);
        }
        .hero-arrow:hover {
          background: rgba(255, 255, 255, 0.22);
          border-color: rgba(255, 255, 255, 0.5);
        }
        .hero-arrow-left { left: 20px; }
        .hero-arrow-right { right: 20px; }
        .hero-banner-dots {
          position: absolute;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 10px;
          z-index: 2;
        }
        .hero-banner-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.35);
          border: 2px solid rgba(255, 255, 255, 0.5);
          cursor: pointer;
          transition: all 0.3s ease;
          padding: 0;
        }
        .hero-banner-dot-active {
          background: #EF4444;
          border-color: #EF4444;
          box-shadow: 0 0 10px rgba(239, 68, 68, 0.6);
          transform: scale(1.3);
        }
        .faq-item {
          border-radius: var(--radius);
          border: 1px solid var(--border);
          background: var(--bg-card);
          overflow: hidden;
          transition: border-color 0.2s;
        }
        .faq-item:hover {
          border-color: rgba(239, 68, 68, 0.3);
        }
        .faq-btn {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          padding: 16px 20px;
          font-size: 15px;
          font-weight: 600;
          text-align: left;
          color: var(--text);
          background: transparent;
        }
        .faq-btn:hover {
          color: var(--red);
        }
        .faq-answer {
          padding: 0 20px 16px;
          font-size: 14px;
          color: var(--text-secondary);
          line-height: 1.7;
        }

        /* ── Blood Man Character ── */
        .blood-man {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 110px;
          height: 120px;
          z-index: 5;
          pointer-events: none;
        }
        .blood-man-left { left: 10px; }
        .blood-man-right { right: 10px; }
        .blood-man-body {
          width: 90px;
          height: 100px;
          background: linear-gradient(135deg, #EF4444, #DC2626);
          border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
          position: relative;
          margin: 0 auto;
          animation: bloodManBounce 2s ease-in-out infinite;
          box-shadow: 0 8px 24px rgba(239, 68, 68, 0.4);
        }
        .blood-man-eyes {
          position: absolute;
          top: 28px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 14px;
        }
        .blood-man-eye {
          width: 16px;
          height: 16px;
          background: #fff;
          border-radius: 50%;
          position: relative;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .blood-man-pupil {
          width: 8px;
          height: 8px;
          background: #1E1B4B;
          border-radius: 50%;
          position: absolute;
          top: 4px;
          left: 4px;
          animation: eyeFlip 2.5s ease-in-out infinite;
        }
        .blood-man-pupil::after {
          content: "";
          position: absolute;
          top: 1px;
          right: 1px;
          width: 3px;
          height: 3px;
          background: #fff;
          border-radius: 50%;
        }
        .blood-man-smile {
          position: absolute;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          width: 20px;
          height: 10px;
          border-bottom: 3px solid #fff;
          border-radius: 0 0 50% 50%;
        }
        .blood-man-cheeks {
          position: absolute;
          top: 42px;
          width: 100%;
          display: flex;
          justify-content: space-between;
          padding: 0 8px;
          pointer-events: none;
        }
        .blood-man-cheek {
          width: 10px;
          height: 6px;
          background: rgba(255, 170, 170, 0.6);
          border-radius: 50%;
        }
        @keyframes bloodManBounce {
          0%, 100% { transform: translateY(0) rotate(0deg) scaleY(1); }
          30% { transform: translateY(-12px) rotate(-3deg) scaleY(1.02); }
          50% { transform: translateY(-14px) rotate(0deg) scaleY(1.02); }
          70% { transform: translateY(-12px) rotate(3deg) scaleY(1.02); }
          85% { transform: translateY(2px) rotate(0deg) scaleY(0.92); }
          92% { transform: translateY(0) rotate(0deg) scaleY(1); }
        }
        @keyframes eyeFlip {
          0%, 30%, 100% { transform: translateY(0) translateX(0) scaleY(1); }
          35%, 45% { transform: translateY(0) translateX(0) scaleY(0.08); }
          50%, 80% { transform: translateY(0) translateX(3px) scaleY(1); }
          85%, 95% { transform: translateY(0) translateX(-3px) scaleY(1); }
        }

        @media (max-width: 768px) {
          .blood-man { display: none !important; }
          .hero-banner-wrap { height: 400px; }
          .hero-title { font-size: 34px; }
          .hero-subtitle { font-size: 14px; margin-top: 12px; max-width: 340px; }
          .hero-btns { margin-top: 24px; gap: 12px; }
          .btn-hero-primary, .btn-hero-secondary { padding: 12px 28px; font-size: 14px; }
          .hero-arrow { width: 40px; height: 40px; }
          .hero-arrow-left { left: 12px; }
          .hero-arrow-right { right: 12px; }
          .hero-content { padding: 0 16px; }
          .compat-matrix { font-size: 11px; }
          .compat-matrix th, .compat-matrix td { padding: 6px 3px !important; }
          .compat-cards { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 480px) {
          .hero-banner-wrap { height: 300px; }
          .hero-title { font-size: 26px; }
          .hero-subtitle { font-size: 13px; padding: 0 8px; max-width: 280px; }
          .hero-btns { flex-direction: column; align-items: center; gap: 10px; margin-top: 20px; }
          .btn-hero-primary, .btn-hero-secondary { width: 200px; text-align: center; padding: 11px 24px; font-size: 13px; }
          .hero-arrow { display: none; }
          .hero-content { padding: 0 12px; }
          .hero-drops { display: none; }
          .btn-hero-primary { animation: none; }
          .compat-matrix { font-size: 10px; }
          .compat-matrix th, .compat-matrix td { padding: 5px 2px !important; }
        }
      `}</style>
    </div>
  );
}
