/**
 * HealthHubPage — Health Hub
 *
 * A comprehensive, visually rich educational page about blood donation.
 * Features category navigation, 2-column card layout, illustrations,
 * and smooth animations. Fully responsive with dark mode support.
 *
 * Sections: Diet Tips, Exercise, Pros & Cons, Rules, Myths vs Facts, After Care
 */

import { useState, useEffect, useRef } from "react";
import {
  Apple, Droplets, Dumbbell, Heart, ShieldCheck, AlertTriangle,
  CheckCircle, XCircle, Stethoscope, Activity, ArrowRight, ChevronDown,
  Clock, Scale, Shield, User, FileCheck, Ban, Sparkles, Trophy,
  HeartPulse, Pill, Syringe, Leaf, Flame, Droplet, HandHeart,
  CircleCheck, CircleX, BadgeCheck, Zap, TrendingUp, Eye,
  Bed, Wine, Coffee, Brain, Bone, Thermometer, CircleAlert, Phone,
} from "lucide-react";

/* ────────────────────────────────────────
   HEALTH DATA — replace with API later
   ──────────────────────────────────────── */

const CATEGORIES = [
  { id: "diet", label: "Healthy\nDiet Tips", icon: Apple, color: "#10B981", bg: "#ECFDF5" },
  { id: "exercise", label: "Exercise\n& Fitness", icon: Activity, color: "#3B82F6", bg: "#EFF6FF" },
  { id: "proscons", label: "Pros & Cons\nof Donation", icon: Heart, color: "#EF4444", bg: "#FEF2F2" },
  { id: "rules", label: "Rules &\nEligibility", icon: ShieldCheck, color: "#8B5CF6", bg: "#F5F3FF" },
  { id: "myths", label: "Myths vs\nFacts", icon: AlertTriangle, color: "#F59E0B", bg: "#FFFBEB" },
  { id: "aftercare", label: "After Donation\nCare", icon: Stethoscope, color: "#0D9488", bg: "#F0FDFA" },
];

const DIET_TIPS = {
  before: [
    "Eat iron-rich foods",
    "Stay hydrated",
    "Avoid fatty foods",
    "Get proper sleep",
  ],
  after: [
    "Drink plenty of fluids",
    "Eat healthy snacks",
    "Avoid heavy workouts",
    "Rest for a few hours",
  ],
};

const EXERCISE_TIPS = [
  { icon: Activity, text: "30 mins of cardio (walking, jogging, cycling)", color: "#3B82F6" },
  { icon: Dumbbell, text: "Strength training 2-3 times a week", color: "#8B5CF6" },
  { icon: Sparkles, text: "Stretching & yoga for flexibility", color: "#10B981" },
  { icon: Heart, text: "Stay consistent and listen to your body", color: "#EF4444" },
];

const BENEFITS = [
  "Saves up to 3 lives",
  "Reduces risk of heart disease",
  "Stimulates new blood cells",
  "Helps in weight management",
  "Gives emotional satisfaction",
];

const SIDE_EFFECTS = [
  "Slight dizziness",
  "Bruising at the needle site",
  "Tiredness",
  "Low blood pressure (rare)",
  "Nausea (rare)",
];

const RULES = [
  { icon: User, text: "Age: 18-65 years", color: "#8B5CF6" },
  { icon: Scale, text: "Weight: Minimum 50 kg", color: "#3B82F6" },
  { icon: Droplets, text: "Hemoglobin: Minimum 12.5 g/dL", color: "#EF4444" },
  { icon: ShieldCheck, text: "No major illness in the last 2 weeks", color: "#10B981" },
  { icon: Clock, text: "Last donation gap: 3 months (men), 4 months (women)", color: "#F59E0B" },
  { icon: FileCheck, text: "Bring a valid ID proof", color: "#0D9488" },
];

const MYTHS_FACTS = [
  {
    myth: "Blood donation makes you weak.",
    fact: "Your body replaces the blood within 24-48 hours.",
  },
  {
    myth: "You can catch diseases by donating blood.",
    fact: "All equipment used is sterile and safe.",
  },
  {
    myth: "Donating blood reduces your immunity.",
    fact: "Blood donation does not affect your immunity.",
  },
];

const AFTER_CARE = [
  { icon: Bed, text: "Rest for 10-15 minutes", color: "#8B5CF6" },
  { icon: Droplets, text: "Drink plenty of fluids", color: "#3B82F6" },
  { icon: Ban, text: "Avoid smoking & alcohol", color: "#EF4444" },
  { icon: Dumbbell, text: "Avoid heavy lifting for 24 hours", color: "#F59E0B" },
  { icon: Apple, text: "Eat a healthy meal", color: "#10B981" },
  { icon: Heart, text: "If you feel dizzy, lie down and raise your legs", color: "#0D9488" },
];

/* ────────────────────────────────────────
   SCROLL REVEAL HOOK
   ──────────────────────────────────────── */

function useReveal(threshold = 0.1) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold, rootMargin: "0px 0px -30px 0px" }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

/* ────────────────────────────────────────
   SUB-COMPONENTS
   ──────────────────────────────────────── */

/** Category navigation circle */
function CategoryTab({ icon: Icon, label, color, bg, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
        background: "none", border: "none", cursor: "pointer", minWidth: 90,
      }}
    >
      <div style={{
        width: 60, height: 60, borderRadius: "50%",
        background: hovered ? color : bg,
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
        transform: hovered ? "scale(1.12)" : "scale(1)",
        boxShadow: hovered ? `0 8px 24px ${color}30` : `0 2px 8px ${color}15`,
      }}>
        <Icon size={24} color={hovered ? "#fff" : color} style={{ transition: "color 0.3s" }} />
      </div>
      <span style={{
        fontSize: 12, fontWeight: 600, color: "var(--text)", lineHeight: 1.3,
        textAlign: "center", whiteSpace: "pre-line",
      }}>{label}</span>
    </button>
  );
}

/** Content card wrapper */
function ContentCard({ title, children, id }) {
  const { ref, visible } = useReveal();
  return (
    <div
      ref={ref}
      id={id}
      style={{
        background: "var(--bg-card)",
        borderRadius: 20,
        padding: 28,
        border: "1px solid var(--border-light)",
        boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(20px)",
        transition: "all 0.5s cubic-bezier(0.16,1,0.3,1)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <h3 style={{ fontSize: 20, fontWeight: 800, color: "var(--text)" }}>{title}</h3>
        <a href="#top" style={{ fontSize: 13, fontWeight: 600, color: "var(--red)", textDecoration: "none" }}>
          View All
        </a>
      </div>
      {children}
    </div>
  );
}

/** Diet section with Before/After tabs */
function DietSection() {
  const [tab, setTab] = useState("before");
  const items = DIET_TIPS[tab];
  return (
    <ContentCard title="Healthy Diet Tips" id="diet">
      {/* Tab switcher */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {["before", "after"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: "8px 18px", borderRadius: 20, fontSize: 13, fontWeight: 600,
              border: "none", cursor: "pointer", transition: "all 0.3s",
              background: tab === t ? "#10B981" : "#ECFDF5",
              color: tab === t ? "#fff" : "#10B981",
            }}
          >
            {t === "before" ? "Before Donation" : "After Donation"}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
        {/* Bullet list */}
        <div style={{ flex: 1 }}>
          {items.map((item, i) => (
            <div key={`${tab}-${i}`} style={{
              display: "flex", alignItems: "center", gap: 10, padding: "8px 0",
              animation: `fadeSlideIn 0.3s ease ${i * 0.05}s both`,
            }}>
              <CircleCheck size={18} color="#10B981" />
              <span style={{ fontSize: 14, color: "var(--text)", fontWeight: 500 }}>{item}</span>
            </div>
          ))}
        </div>
        {/* Image */}
        <div style={{
          width: 140, height: 140, borderRadius: 16, overflow: "hidden", flexShrink: 0,
          boxShadow: "0 8px 24px rgba(16,185,129,0.15)",
        }}>
          <img src="/health/salad-bowl.png" alt="Healthy food" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
      </div>
    </ContentCard>
  );
}

/** Exercise section */
function ExerciseSection() {
  return (
    <ContentCard title="Exercise & Fitness" id="exercise">
      <p style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 18, lineHeight: 1.6 }}>
        Regular exercise keeps you fit and improves blood circulation.
      </p>
      <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
        <div style={{ flex: 1 }}>
          {EXERCISE_TIPS.map((tip, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 10, padding: "10px 0",
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: 10,
                background: `${tip.color}12`, color: tip.color,
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <tip.icon size={16} />
              </div>
              <span style={{ fontSize: 14, color: "var(--text)", fontWeight: 500 }}>{tip.text}</span>
            </div>
          ))}
        </div>
        {/* Runner image */}
        <div style={{
          width: 160, height: 180, borderRadius: 16, overflow: "hidden", flexShrink: 0,
          boxShadow: "0 8px 24px rgba(59,130,246,0.15)",
        }}>
          <img src="/health/runner.png" alt="Exercise" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
      </div>
    </ContentCard>
  );
}

/** Pros & Cons section */
function ProsConsSection() {
  return (
    <ContentCard title="Pros & Cons of Blood Donation" id="proscons">
      <div style={{ display: "flex", gap: 20 }}>
        {/* Benefits */}
        <div style={{
          flex: 1, padding: 18, borderRadius: 14,
          background: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.12)",
        }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 12px",
            borderRadius: 8, background: "rgba(16,185,129,0.12)", marginBottom: 14,
          }}>
            <Sparkles size={14} color="#10B981" />
            <span style={{ fontSize: 12, fontWeight: 700, color: "#10B981" }}>Benefits</span>
          </div>
          {BENEFITS.map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0" }}>
              <CircleCheck size={16} color="#10B981" />
              <span style={{ fontSize: 13, color: "var(--text)", fontWeight: 500 }}>{item}</span>
            </div>
          ))}
        </div>
        {/* Side Effects */}
        <div style={{
          flex: 1, padding: 18, borderRadius: 14,
          background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.12)",
        }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 12px",
            borderRadius: 8, background: "rgba(239,68,68,0.12)", marginBottom: 14,
          }}>
            <AlertTriangle size={14} color="#EF4444" />
            <span style={{ fontSize: 12, fontWeight: 700, color: "#EF4444" }}>Possible Side Effects</span>
          </div>
          {SIDE_EFFECTS.map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0" }}>
              <CircleX size={16} color="#EF4444" />
              <span style={{ fontSize: 13, color: "var(--text)", fontWeight: 500 }}>{item}</span>
            </div>
          ))}
        </div>
      </div>
      {/* Heart hands image */}
      <div style={{ display: "flex", justifyContent: "center", marginTop: 16 }}>
        <div style={{
          width: 80, height: 80, borderRadius: "50%", overflow: "hidden",
          boxShadow: "0 4px 16px rgba(239,68,68,0.15)",
        }}>
          <img src="/health/heart-hands.png" alt="Heart" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
      </div>
    </ContentCard>
  );
}

/** Rules & Eligibility section */
function RulesSection() {
  return (
    <ContentCard title="Rules & Eligibility" id="rules">
      <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
        <div style={{ flex: 1 }}>
          {RULES.map((rule, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 12, padding: "10px 0",
              borderBottom: i < RULES.length - 1 ? "1px solid var(--border-light)" : "none",
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: 10,
                background: `${rule.color}12`, color: rule.color,
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <rule.icon size={16} />
              </div>
              <span style={{ fontSize: 14, color: "var(--text)", fontWeight: 500 }}>{rule.text}</span>
            </div>
          ))}
        </div>
        {/* Clipboard image */}
        <div style={{
          width: 130, height: 160, borderRadius: 16, overflow: "hidden", flexShrink: 0,
          boxShadow: "0 8px 24px rgba(139,92,246,0.15)",
        }}>
          <img src="/health/clipboard.png" alt="Checklist" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
      </div>
    </ContentCard>
  );
}

/** Myths vs Facts section */
function MythsSection() {
  return (
    <ContentCard title="Myths vs Facts" id="myths">
      {MYTHS_FACTS.map((item, i) => (
        <div key={i} style={{
          display: "flex", alignItems: "stretch", gap: 0, marginBottom: i < MYTHS_FACTS.length - 1 ? 12 : 0,
          borderRadius: 12, overflow: "hidden", border: "1px solid var(--border-light)",
        }}>
          {/* Myth */}
          <div style={{
            flex: 1, padding: "14px 16px",
            background: "rgba(239,68,68,0.04)",
            borderRight: "2px solid var(--border-light)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
              <CircleX size={14} color="#EF4444" />
              <span style={{ fontSize: 11, fontWeight: 700, color: "#EF4444", textTransform: "uppercase" }}>Myth</span>
            </div>
            <p style={{ fontSize: 13, color: "var(--text)", fontWeight: 500, lineHeight: 1.5 }}>{item.myth}</p>
          </div>
          {/* VS badge */}
          <div style={{
            width: 36, display: "flex", alignItems: "center", justifyContent: "center",
            background: "#FEF2F2", flexShrink: 0,
          }}>
            <span style={{ fontSize: 10, fontWeight: 800, color: "#EF4444", background: "#FEE2E2", padding: "3px 6px", borderRadius: 6 }}>VS</span>
          </div>
          {/* Fact */}
          <div style={{
            flex: 1, padding: "14px 16px",
            background: "rgba(16,185,129,0.04)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
              <CircleCheck size={14} color="#10B981" />
              <span style={{ fontSize: 11, fontWeight: 700, color: "#10B981", textTransform: "uppercase" }}>Fact</span>
            </div>
            <p style={{ fontSize: 13, color: "var(--text)", fontWeight: 500, lineHeight: 1.5 }}>{item.fact}</p>
          </div>
        </div>
      ))}
      {/* Blood drop image */}
      <div style={{ display: "flex", justifyContent: "center", marginTop: 16 }}>
        <div style={{
          width: 80, height: 80, borderRadius: "50%", overflow: "hidden",
          boxShadow: "0 4px 16px rgba(245,158,11,0.15)",
        }}>
          <img src="/health/blood-care.png" alt="Blood care" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
      </div>
    </ContentCard>
  );
}

/** After Donation Care section */
function AfterCareSection() {
  return (
    <ContentCard title="After Donation Care" id="aftercare">
      <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
        <div style={{ flex: 1 }}>
          {AFTER_CARE.map((item, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 12, padding: "10px 0",
              borderBottom: i < AFTER_CARE.length - 1 ? "1px solid var(--border-light)" : "none",
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: 10,
                background: `${item.color}12`, color: item.color,
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <item.icon size={16} />
              </div>
              <span style={{ fontSize: 14, color: "var(--text)", fontWeight: 500 }}>{item.text}</span>
            </div>
          ))}
        </div>
        {/* Blood care image */}
        <div style={{
          width: 140, height: 160, borderRadius: 16, overflow: "hidden", flexShrink: 0,
          boxShadow: "0 8px 24px rgba(13,148,136,0.15)",
        }}>
          <img src="/health/blood-care.png" alt="After donation care" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
      </div>
    </ContentCard>
  );
}

/* ────────────────────────────────────────
   MAIN PAGE COMPONENT
   ──────────────────────────────────────── */

export default function HealthHubPage() {
  const heroRef = useRef(null);
  const [heroVisible, setHeroVisible] = useState(false);

  useEffect(() => {
    if (heroRef.current) setHeroVisible(true);
  }, []);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div id="top" style={{ minHeight: "100vh", background: "var(--bg)" }}>

      {/* ═══════════════ HERO ═══════════════ */}
      <div ref={heroRef} style={{
        padding: "56px 20px 48px",
        background: "linear-gradient(135deg, #FEF2F2 0%, #FFF1F2 40%, #FFFFFF 100%)",
        borderBottom: "1px solid rgba(239,68,68,0.08)",
        opacity: heroVisible ? 1 : 0,
        transform: heroVisible ? "translateY(0)" : "translateY(-16px)",
        transition: "all 0.7s cubic-bezier(0.16,1,0.3,1)",
      }}>
        <div style={{
          maxWidth: 1100, margin: "0 auto",
          display: "flex", alignItems: "center", gap: 40,
        }}>
          {/* Left: Text */}
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: "linear-gradient(135deg, #EF4444, #DC2626)",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 4px 12px rgba(239,68,68,0.25)",
              }}>
                <HeartPulse size={22} color="#fff" />
              </div>
              <span style={{ fontSize: 22, fontWeight: 800, color: "var(--text)" }}>
                Life<span style={{ color: "#EF4444" }}>Drop</span>
              </span>
            </div>
            <h1 style={{ fontSize: 36, fontWeight: 900, color: "#EF4444", marginBottom: 8, lineHeight: 1.15 }}>
              Health Hub
            </h1>
            <p style={{ fontSize: 16, color: "var(--text-secondary)", fontWeight: 500, marginBottom: 8 }}>
              Stay healthy, stay strong, save more lives.
            </p>
            <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.6, maxWidth: 420 }}>
              Your guide to a healthier you and a successful donation experience.
            </p>
          </div>
          {/* Right: Hero illustration */}
          <div className="health-hero-illust" style={{
            width: 340, height: 240, borderRadius: 24, overflow: "hidden", flexShrink: 0,
            boxShadow: "0 16px 48px rgba(239,68,68,0.12)",
            animation: heroVisible ? "heroFloat 5s ease-in-out infinite" : "none",
          }}>
            <img src="/health/hero-illustration.png" alt="Health and blood donation"
              style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        </div>
      </div>

      {/* ═══════════════ CATEGORY TABS ═══════════════ */}
      <div style={{
        maxWidth: 900, margin: "-24px auto 0", padding: "0 20px", position: "relative", zIndex: 10,
      }}>
        <div style={{
          display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap",
          background: "var(--bg-card)",
          borderRadius: 20, padding: "20px 24px",
          border: "1px solid var(--border-light)",
          boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
        }}>
          {CATEGORIES.map((cat) => (
            <CategoryTab key={cat.id} {...cat} onClick={() => scrollToSection(cat.id)} />
          ))}
        </div>
      </div>

      {/* ═══════════════ CONTENT GRID ═══════════════ */}
      <div style={{ maxWidth: 1100, margin: "40px auto 0", padding: "0 20px" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 24,
          alignItems: "start",
        }}>
          {/* Left column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <DietSection />
            <ProsConsSection />
            <MythsSection />
          </div>
          {/* Right column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <ExerciseSection />
            <RulesSection />
            <AfterCareSection />
          </div>
        </div>
      </div>

      {/* ═══════════════ BOTTOM CTA ═══════════════ */}
      <div style={{ maxWidth: 1100, margin: "48px auto 0", padding: "0 20px 60px" }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 24, justifyContent: "space-between",
          padding: "32px 40px", borderRadius: 20,
          background: "linear-gradient(135deg, #FEF2F2, #FFF1F2)",
          border: "1px solid rgba(239,68,68,0.12)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{
              width: 56, height: 56, borderRadius: "50%",
              background: "linear-gradient(135deg, #F59E0B, #D97706)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 16px rgba(245,158,11,0.3)",
            }}>
              <Trophy size={26} color="#fff" />
            </div>
            <div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: "var(--text)", marginBottom: 4 }}>
                Healthy Donor, Happy Donor!
              </h3>
              <p style={{ fontSize: 14, color: "var(--text-secondary)", maxWidth: 400, lineHeight: 1.5 }}>
                Follow these tips and guidelines to make your donation experience safe and positive.
              </p>
            </div>
          </div>
          <a href="/requests" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "14px 28px", borderRadius: 14,
            background: "#EF4444", color: "#fff", textDecoration: "none",
            fontSize: 15, fontWeight: 700, whiteSpace: "nowrap",
            transition: "all 0.3s",
            boxShadow: "0 4px 16px rgba(239,68,68,0.3)",
          }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#DC2626"; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(239,68,68,0.4)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "#EF4444"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(239,68,68,0.3)"; }}
          >
            I'm Ready to Save Lives <Heart size={16} fill="#fff" />
          </a>
        </div>
      </div>

      {/* ═══════════════ ANIMATIONS ═══════════════ */}
      <style>{`
        @keyframes heroFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateX(-8px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @media (max-width: 900px) {
          .health-hero-illust { display: none; }
        }
        @media (max-width: 768px) {
          #top > div:nth-child(3) > div > div {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 480px) {
          #top > div:nth-child(2) > div > div {
            gap: 8px !important;
            padding: 14px 12px !important;
          }
        }
      `}</style>
    </div>
  );
}
