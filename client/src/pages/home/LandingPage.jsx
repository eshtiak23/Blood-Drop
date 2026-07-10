/**
 * LandingPage.jsx — Public landing page for LifeDrop blood donor management app.
 * Displays hero banner, stats, how-it-works steps, features, blood groups,
 * testimonials, FAQ accordion, and a call-to-action section.
 */
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Heart, ArrowRight, Search, Phone, Shield, History, Bell, Lock, ChevronDown, Droplets, Star, AlertTriangle, Droplet } from "lucide-react";
import { STATS, TESTIMONIALS, FAQS, BLOOD_GROUPS, BLOOD_GROUP_COLORS } from "../../data/constants";
import { getAllFeedback } from "../../services/localStore";

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

/* ── Data: Feature cards ── */
const FEATURES = [
  { title: "Find Donors Instantly", desc: "Search by blood group, location, and availability.", icon: Search },
  { title: "Emergency Requests", desc: "Create urgent blood requests and reach donors in minutes.", icon: AlertTriangle },
  { title: "Verified Donors", desc: "All donors are verified for safety and reliability.", icon: Shield },
  { title: "Track Donations", desc: "Keep a complete record and get eligibility reminders.", icon: History },
  { title: "Real-time Notifications", desc: "Instant notifications for requests and updates.", icon: Bell },
  { title: "Safe & Secure", desc: "Your data is encrypted and privacy is prioritized.", icon: Lock },
];

/* ── Main Component ── */
export default function LandingPage() {
  // Track which FAQ item is expanded (null = all collapsed)
  const [openFaq, setOpenFaq] = useState(null);
  // User-submitted feedback from localStorage
  const [userFeedback, setUserFeedback] = useState([]);
  // Banner carousel index
  const [bannerIdx, setBannerIdx] = useState(0);
  const banners = ["/banner1.png", "/banner2.png"];

  useEffect(() => {
    const fb = getAllFeedback();
    // Convert feedback to the same shape as TESTIMONIALS so they render together
    setUserFeedback(fb.map((f) => ({
      name: f.userName,
      role: "LifeDrop User",
      content: f.comment,
      rating: f.rating,
      isUserFeedback: true,
      userPhoto: f.userPhoto,
    })));
  }, []);

  // Auto-rotate banner every 4 seconds
  useEffect(() => {
    const timer = setInterval(() => setBannerIdx((i) => (i + 1) % banners.length), 4000);
    return () => clearInterval(timer);
  }, [banners.length]);

  // Merge static testimonials with user feedback (user feedback shows first)
  const allTestimonials = [...userFeedback, ...TESTIMONIALS];

  return (
    <div>
      {/* ── Hero ── */}
      <section style={{ position: "relative", overflow: "hidden", background: "var(--bg-card)" }}>
        <div style={{ position: "absolute", top: -120, right: -120, width: 320, height: 320, borderRadius: "50%", background: "rgba(239,68,68,0.08)", filter: "blur(60px)" }} />
        <div style={{ position: "absolute", bottom: -120, left: -120, width: 320, height: 320, borderRadius: "50%", background: "rgba(239,68,68,0.06)", filter: "blur(60px)" }} />
        <div className="container hero-grid" style={{ display: "grid", gap: 48, alignItems: "center", padding: "80px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
              <Link to="/requests/create" className="btn btn-primary btn-lg">Request Blood <ArrowRight size={18} /></Link>
              <Link to="/donors" className="btn btn-secondary btn-lg">Find Donors</Link>
            </div>
          </div>
          <AnimatedDiv delay={0.2} style={{ display: "flex", justifyContent: "center" }}>
            <div className="hero-banner-wrap">
              {banners.map((src, i) => (
                <img key={src} src={src} alt={`LifeDrop banner ${i + 1}`} className={`hero-banner-img ${i === bannerIdx ? "hero-banner-active" : ""}`} />
              ))}
              <div className="hero-banner-dots">
                {banners.map((_, i) => (
                  <button key={i} onClick={() => setBannerIdx(i)} className={`hero-banner-dot ${i === bannerIdx ? "hero-banner-dot-active" : ""}`} aria-label={`Slide ${i + 1}`} />
                ))}
              </div>
            </div>
          </AnimatedDiv>
        </div>
      </section>

      {/* ── Stats ── */}
      <section style={{ borderBottom: "1px solid var(--border)", background: "var(--bg-card)", padding: "32px 0" }}>
        <div className="container">
          <div className="grid grid-4">
            {STATS.map((s, i) => (
              <AnimatedDiv key={s.label} delay={i * 0.1}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 28, fontWeight: 800, color: "var(--red)" }}>{s.value}</div>
                  <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 4 }}>{s.label}</div>
                </div>
              </AnimatedDiv>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="section" style={{ background: "var(--bg-card)" }}>
        <div className="container" style={{ textAlign: "center" }}>
          <h2 style={{ fontSize: 32, fontWeight: 800 }}>How It Works</h2>
          <p style={{ color: "var(--text-secondary)", marginTop: 8 }}>Simple steps to save a life</p>
          <div className="grid grid-4" style={{ marginTop: 48 }}>
            {[{ icon: Search, title: "Search", desc: "Find donors by blood group and location" },
              { icon: Phone, title: "Connect", desc: "Reach out to verified donors" },
              { icon: Heart, title: "Donate", desc: "Meet and donate blood" },
              { icon: History, title: "Track", desc: "Track donation history" }].map((s, i) => (
              <AnimatedDiv key={s.title} delay={i * 0.1}>
                <div style={{ textAlign: "center", padding: "0 12px" }}>
                  <div style={{ width: 60, height: 60, borderRadius: "50%", background: "var(--red-light)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto" }}>
                    <s.icon size={28} color="var(--red)" />
                  </div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, marginTop: 16 }}>{s.title}</h3>
                  <p style={{ fontSize: 14, color: "var(--text-secondary)", marginTop: 6 }}>{s.desc}</p>
                </div>
              </AnimatedDiv>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="section">
        <div className="container" style={{ textAlign: "center" }}>
          <h2 style={{ fontSize: 32, fontWeight: 800 }}>Why Choose LifeDrop?</h2>
          <div className="grid grid-3" style={{ marginTop: 48 }}>
            {FEATURES.map((f, i) => (
              <AnimatedDiv key={f.title} delay={i * 0.08}>
                <div style={{ padding: 28, borderRadius: "var(--radius)", border: "1px solid var(--border-light)", background: "var(--bg-card)", transition: "all 0.3s", cursor: "default" }}
                  onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "var(--shadow-md)"; e.currentTarget.style.borderColor = "rgba(239,68,68,0.2)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = "var(--border-light)"; }}
                >
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
      <section className="section" style={{ background: "var(--bg-card)" }}>
        <div className="container" style={{ textAlign: "center" }}>
          <h2 style={{ fontSize: 32, fontWeight: 800 }}>Blood Groups We Serve</h2>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 16, marginTop: 40 }}>
            {BLOOD_GROUPS.map((g) => (
              <Link key={g} to={`/donors?bloodGroup=${g}`} style={{
                width: 72, height: 72, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center",
                background: getBloodGroupColor(g).bg, color: getBloodGroupColor(g).text, fontSize: 16, fontWeight: 700,
                boxShadow: "var(--shadow)", transition: "all 0.2s", cursor: "pointer",
              }}
                onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.1)"}
                onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
              >{g}</Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="section">
        <div className="container" style={{ textAlign: "center" }}>
          <h2 style={{ fontSize: 32, fontWeight: 800 }}>What People Say</h2>
          <div className="grid grid-3" style={{ marginTop: 48 }}>
            {allTestimonials.map((t, i) => (
              <AnimatedDiv key={t.name + i} delay={i * 0.1}>
                <div style={{ padding: 28, borderRadius: "var(--radius)", border: "1px solid var(--border-light)", background: "var(--bg-card)", textAlign: "left", position: "relative", overflow: "hidden" }}>
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
      <section className="section" style={{ background: "var(--bg-card)" }}>
        <div className="container" style={{ maxWidth: 700, margin: "0 auto" }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, textAlign: "center" }}>Frequently Asked Questions</h2>
          <div style={{ marginTop: 40, display: "flex", flexDirection: "column", gap: 12 }}>
            {FAQS.map((faq, i) => (
              <div key={i} style={{ borderRadius: "var(--radius)", border: "1px solid var(--border-light)", overflow: "hidden" }}>
                {/* Toggle: clicking an open item closes it; clicking closed opens it */}
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", padding: "16px 20px", fontSize: 15, fontWeight: 600, textAlign: "left" }}>
                  {faq.question}
                  <ChevronDown size={18} style={{ transform: openFaq === i ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s", flexShrink: 0, marginLeft: 12 }} />
                </button>
                {openFaq === i && (
                  <div style={{ padding: "0 20px 16px", fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7 }}>{faq.answer}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="section">
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

      {/* Responsive overrides for hero grid on mobile */}
      <style>{`
        .hero-grid { grid-template-columns: 1fr 1fr; }
        .hero-banner-wrap {
          position: relative;
          width: 100%;
          max-width: 480px;
          aspect-ratio: 4 / 3;
          border-radius: var(--radius-xl);
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(239,68,68,0.15), 0 4px 20px rgba(0,0,0,0.08);
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
        .hero-banner-dots {
          position: absolute;
          bottom: 14px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 8px;
          z-index: 2;
        }
        .hero-banner-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: rgba(255,255,255,0.4);
          border: 2px solid rgba(255,255,255,0.6);
          cursor: pointer;
          transition: all 0.3s ease;
          padding: 0;
        }
        .hero-banner-dot-active {
          background: #EF4444;
          border-color: #EF4444;
          box-shadow: 0 0 8px rgba(239,68,68,0.5);
          transform: scale(1.2);
        }
        @media (max-width: 768px) {
          .hero-grid { grid-template-columns: 1fr !important; padding: 48px 16px !important; text-align: center; }
          .hero-grid h1 { font-size: 32px !important; }
          .hero-grid > div:first-child > div:last-child { justify-content: center; }
          .hero-banner-wrap { max-width: 100%; margin: 0 auto; }
        }
      `}</style>
    </div>
  );
}
