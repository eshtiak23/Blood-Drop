/**
 * HealthHubPage — Health Hub
 *
 * Educational page about blood donation health tips, eligibility,
 * myths vs facts, and emergency guidance.
 *
 * All content is static (defined in HEALTH_DATA) for easy future
 * replacement with API data.
 */

import { useState, useEffect, useRef } from "react";
import {
  Apple, Droplets, Dumbbell, Heart, ShieldCheck, AlertTriangle,
  CheckCircle, XCircle, ChevronDown, ChevronUp, Stethoscope,
  Bed, Coffee, Wine, Ban, Activity, Brain, Bone, Eye,
  Thermometer, Pill, Scale, Ruler, Clock, Phone, MapPin,
  Sparkles, Star, BadgeCheck, Zap, TrendingUp, Users,
  CircleDot, ArrowRight, Info, CircleAlert, HandHeart
} from "lucide-react";

/* ────────────────────────────────────────
   HEALTH DATA — replace with API later
   ──────────────────────────────────────── */

const DIET_BEFORE = [
  { icon: Droplets, title: "Stay Hydrated", desc: "Drink 500ml of water 30 minutes before donation. Hydration makes veins easier to find and reduces dizziness.", color: "#3B82F6" },
  { icon: Apple, title: "Eat Iron-Rich Foods", desc: "Have a meal with spinach, red meat, lentils, or fortified cereals 2-3 hours before. Iron helps replenish red blood cells faster.", color: "#10B981" },
  { icon: Ban, title: "Avoid Fatty Foods", desc: "Skip fried food, cheeseburgers, and creamy pasta. Fats can affect blood test results and make your plasma cloudy.", color: "#F59E0B" },
  { icon: Coffee, title: "Limit Caffeine", desc: "Avoid coffee and energy drinks before donating. Caffeine can interfere with iron absorption and hydration.", color: "#8B5CF6" },
  { icon: ShieldCheck, title: "Eat a Balanced Meal", desc: "Have a proper meal 2-3 hours before donating. Good nutrition prevents lightheadedness and keeps energy stable.", color: "#EF4444" },
];

const DIET_AFTER = [
  { icon: Droplets, title: "Rehydrate Immediately", desc: "Drink at least 500ml of water or juice right after donating. Fluids help restore blood volume quickly.", color: "#3B82F6" },
  { icon: Apple, title: "Eat a Nutritious Snack", desc: "Have a light snack with carbs and protein — fruits, nuts, yogurt, or a sandwich. This restores energy levels.", color: "#10B981" },
  { icon: ShieldCheck, title: "Boost Iron Intake", desc: "Eat iron-rich foods for the next 24 hours: leafy greens, beans, eggs, and lean meats to replenish lost iron.", color: "#EF4444" },
  { icon: Wine, title: "Avoid Alcohol for 24 Hours", desc: "Alcohol dehydrates you and thins blood. Wait at least a full day before drinking after donation.", color: "#F59E0B" },
  { icon: Bed, title: "Rest and Recover", desc: "Avoid strenuous activity for 5-6 hours. Light walking is fine, but skip heavy workouts today.", color: "#8B5CF6" },
];

const EXERCISE_DO = [
  { icon: Activity, title: "Light Walking", desc: "A 15-20 minute walk after donation helps circulation and prevents dizziness." },
  { icon: Dumbbell, title: "Gentle Stretching", desc: "Light stretches keep blood flowing. Avoid straining the arm used for donation." },
  { icon: Heart, title: "Yoga (Light)", desc: "Gentle yoga poses are fine. Avoid inversions and intense flows for 24 hours." },
];

const EXERCISE_DONT = [
  { icon: Ban, title: "Heavy Lifting", desc: "Avoid lifting heavy objects or weights for 24 hours. Risk of bleeding and bruising." },
  { icon: Ban, title: "Intense Cardio", desc: "No running, cycling, or HIIT workouts for 24 hours. Your body needs time to recover." },
  { icon: Ban, title: "Contact Sports", desc: "Avoid football, basketball, or martial arts for 24 hours. Risk of injury to the puncture site." },
];

const BENEFITS = [
  { icon: Heart, title: "Saves Lives", desc: "One donation can save up to 3 lives. Your blood is separated into red cells, platelets, and plasma.", color: "#EF4444" },
  { icon: Stethoscope, title: "Free Health Checkup", desc: "Every donation includes a mini health screening — blood pressure, pulse, temperature, and hemoglobin test.", color: "#3B82F6" },
  { icon: ShieldCheck, title: "Reduces Iron Stores", desc: "Regular donation lowers excess iron levels, reducing the risk of heart disease and liver problems.", color: "#10B981" },
  { icon: TrendingUp, title: "Boosts Blood Cell Production", desc: "After donation, your body produces new blood cells, keeping your blood fresh and healthy.", color: "#8B5CF6" },
  { icon: Sparkles, title: "Burns Calories", desc: "Donating one pint of blood burns approximately 650 calories as your body works to replenish cells.", color: "#F59E0B" },
  { icon: HandHeart, title: "Emotional Well-being", desc: "Helping others triggers a 'helper's high' — reducing stress and boosting your mood naturally.", color: "#EC4899" },
];

const SIDE_EFFECTS = [
  { icon: Thermometer, title: "Dizziness or Lightheadedness", severity: "Common", desc: "Usually passes within minutes. Sit down, drink fluids, and rest.", color: "#F59E0B" },
  { icon: CircleAlert, title: "Bruising at Puncture Site", severity: "Common", desc: "Normal — apply gentle pressure and a cold compress. Heals in 1-2 weeks.", color: "#3B82F6" },
  { icon: Bed, title: "Fatigue", severity: "Common", desc: "Feeling tired is normal. Rest well and eat nutritious food for 24 hours.", color: "#8B5CF6" },
  { icon: Bone, title: "Tingling or Numbness", severity: "Rare", desc: "If you feel tingling in fingers during donation, tell the nurse. They'll adjust the needle.", color: "#10B981" },
];

const ELIGIBILITY = [
  { rule: "Age: 18-65 years", met: true, icon: Clock },
  { rule: "Weight: At least 50 kg (110 lbs)", met: true, icon: Scale },
  { rule: "No active infections or illness", met: true, icon: Stethoscope },
  { rule: "Hemoglobin: 12.5+ g/dL (women) or 13+ g/dL (men)", met: true, icon: Droplets },
  { rule: "No recent tattoos or piercings (last 6 months)", met: true, icon: ShieldCheck },
  { rule: "No blood clotting disorders", met: true, icon: Heart },
  { rule: "Not pregnant or breastfeeding", met: true, icon: CircleDot },
  { rule: "No HIV, Hepatitis B or C", met: true, icon: ShieldCheck },
  { rule: "Wait at least 56 days between whole blood donations", met: true, icon: Clock },
  { rule: "No recent surgery (last 6 months)", met: true, icon: Stethoscope },
];

const MYTHS_FACTS = [
  {
    myth: "Donating blood makes you weak permanently",
    fact: "Your body replaces the lost blood volume within 24-48 hours and red blood cells within 4-6 weeks. Most people feel fine the same day.",
  },
  {
    myth: "You can catch diseases from donating blood",
    fact: "Absolutely not. All equipment is sterile and single-use. It's impossible to contract any infection from donating blood.",
  },
  {
    myth: "People with tattoos can't donate",
    fact: "You CAN donate if your tattoo was done at a licensed facility and is at least 6 months old. Rules vary by country.",
  },
  {
    myth: "Donating blood hurts a lot",
    fact: "The needle prick lasts 1-2 seconds. Most donors describe it as a brief pinch. The actual donation takes only 8-10 minutes.",
  },
  {
    myth: "Blood donors get paid",
    fact: "In most countries, blood donation is voluntary and unpaid. Blood is a gift of life — the reward is knowing you helped save someone.",
  },
  {
    myth: "Diabetics cannot donate blood",
    fact: "People with well-controlled diabetes (on insulin or oral medication) CAN donate, provided they meet other eligibility criteria.",
  },
  {
    myth: "Donating blood weakens your immune system",
    fact: "Your immune system is not significantly affected. White blood cells are replenished within hours. You can resume normal activities the next day.",
  },
  {
    myth: "You lose a lot of weight by donating blood",
    fact: "The blood volume lost (about 1 pint) is replaced within 24 hours by plasma. Any weight change is temporary and negligible.",
  },
];

const EMERGENCY_TIPS = [
  { icon: Thermometer, title: "Feeling Dizzy", action: "Sit or lie down immediately. Elevate your legs. Drink water slowly. If it persists for more than 10 minutes, call for medical help.", color: "#F59E0B" },
  { icon: CircleAlert, title: "Fainting", action: "Lie flat on your back with legs elevated. Loosen tight clothing. Do not stand up until fully alert. Seek medical attention.", color: "#EF4444" },
  { icon: Eye, title: "Blurred Vision", action: "Stop all activity. Sit down in a cool place. Breathe slowly. If vision doesn't return in 5 minutes, contact a doctor.", color: "#8B5CF6" },
  { icon: Brain, title: "Nausea or Vomiting", action: "Lie down with head slightly elevated. Sip clear fluids. Avoid solid food until nausea passes. Seek help if severe.", color: "#10B981" },
];

const FAQS = [
  {
    q: "How long does a blood donation take?",
    a: "The actual blood draw takes 8-10 minutes. The entire process — registration, screening, donation, and refreshments — takes about 45-60 minutes.",
  },
  {
    q: "How often can I donate blood?",
    a: "You can donate whole blood every 56 days (8 weeks). Platelet donations can be made more frequently — up to 24 times per year.",
  },
  {
    q: "Is it safe to donate blood?",
    a: "Yes, absolutely. Donating blood is very safe. All equipment is sterile and single-use. Your body replenishes the lost blood naturally within weeks.",
  },
  {
    q: "What happens to my blood after donation?",
    a: "Your blood is tested, separated into components (red cells, platelets, plasma), and stored. It's then distributed to hospitals for patients in need.",
  },
  {
    q: "Can I donate if I'm on medication?",
    a: "It depends on the medication. Common medications like blood pressure pills, diabetes medication, and antibiotics are usually fine. Always disclose your medications during screening.",
  },
  {
    q: "Why is blood donation important?",
    a: "Every 2 seconds, someone needs blood. Blood cannot be manufactured — it can only come from generous donors. One donation can save up to 3 lives.",
  },
];

/* ────────────────────────────────────────
   SCROLL REVEAL HOOK
   ──────────────────────────────────────── */

function useReveal(threshold = 0.12) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold, rootMargin: "0px 0px -40px 0px" }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

/* ────────────────────────────────────────
   SUB-COMPONENTS
   ──────────────────────────────────────── */

function Section({ title, subtitle, children, id }) {
  const { ref, visible } = useReveal();
  return (
    <section ref={ref} id={id} style={{ padding: "48px 0", opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(24px)", transition: "all 0.6s cubic-bezier(0.16,1,0.3,1)" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 20px" }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: "var(--text)", marginBottom: 8 }}>{title}</h2>
          {subtitle && <p style={{ fontSize: 15, color: "var(--text-secondary)", maxWidth: 600, margin: "0 auto" }}>{subtitle}</p>}
        </div>
        {children}
      </div>
    </section>
  );
}

function TipCard({ icon: Icon, title, desc, color, delay = 0 }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: 24,
        borderRadius: "var(--radius-lg)",
        background: "var(--bg-card)",
        border: "1px solid var(--border-light)",
        boxShadow: hovered ? "0 12px 30px rgba(0,0,0,0.08)" : "var(--shadow)",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        transition: "all 0.3s ease",
        animationDelay: `${delay}s`,
      }}
    >
      <div style={{
        width: 48, height: 48, borderRadius: 12,
        background: `${color}15`, color,
        display: "flex", alignItems: "center", justifyContent: "center",
        marginBottom: 14,
      }}>
        <Icon size={22} />
      </div>
      <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", marginBottom: 6 }}>{title}</h3>
      <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>{desc}</p>
    </div>
  );
}

function ExerciseCard({ items, type }) {
  const isDo = type === "do";
  return (
    <div style={{ flex: 1, minWidth: 280 }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 10, marginBottom: 16,
        padding: "12px 16px", borderRadius: "var(--radius)",
        background: isDo ? "rgba(16,185,129,0.08)" : "rgba(239,68,68,0.08)",
      }}>
        {isDo ? <CheckCircle size={20} color="#10B981" /> : <XCircle size={20} color="#EF4444" />}
        <h3 style={{ fontSize: 18, fontWeight: 700, color: isDo ? "#10B981" : "#EF4444" }}>
          {isDo ? "Do's" : "Don'ts"}
        </h3>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {items.map((item, i) => (
          <div key={i} style={{
            display: "flex", gap: 14, alignItems: "start",
            padding: 16, borderRadius: "var(--radius)",
            background: "var(--bg-card)", border: "1px solid var(--border-light)",
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: isDo ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
              color: isDo ? "#10B981" : "#EF4444",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <item.icon size={16} />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>{item.title}</div>
              <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 2, lineHeight: 1.5 }}>{item.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BenefitCard({ icon: Icon, title, desc, color, delay = 0 }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: 24, borderRadius: "var(--radius-lg)", textAlign: "center",
        background: "var(--bg-card)", border: "1px solid var(--border-light)",
        boxShadow: hovered ? "0 12px 30px rgba(0,0,0,0.08)" : "var(--shadow)",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        transition: "all 0.3s ease",
      }}
    >
      <div style={{
        width: 56, height: 56, borderRadius: "50%",
        background: `${color}15`, color,
        display: "flex", alignItems: "center", justifyContent: "center",
        margin: "0 auto 14px",
      }}>
        <Icon size={24} />
      </div>
      <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", marginBottom: 6 }}>{title}</h3>
      <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>{desc}</p>
    </div>
  );
}

function SideEffectCard({ icon: Icon, title, severity, desc, color }) {
  return (
    <div style={{
      display: "flex", gap: 14, alignItems: "start",
      padding: 18, borderRadius: "var(--radius)",
      background: "var(--bg-card)", border: "1px solid var(--border-light)",
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: 10,
        background: `${color}15`, color,
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>
        <Icon size={18} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>{title}</span>
          <span style={{
            fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 6,
            background: severity === "Common" ? "rgba(245,158,11,0.1)" : "rgba(16,185,129,0.1)",
            color: severity === "Common" ? "#D97706" : "#10B981",
          }}>{severity}</span>
        </div>
        <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>{desc}</p>
      </div>
    </div>
  );
}

function EligibilityItem({ rule, met, icon: Icon }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12,
      padding: "14px 16px", borderRadius: "var(--radius-sm)",
      background: "var(--bg-card)", border: "1px solid var(--border-light)",
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: "50%",
        background: met ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
        color: met ? "#10B981" : "#EF4444",
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>
        {met ? <CheckCircle size={16} /> : <XCircle size={16} />}
      </div>
      <Icon size={16} color="var(--text-muted)" />
      <span style={{ fontSize: 14, color: "var(--text)", flex: 1 }}>{rule}</span>
    </div>
  );
}

function MythFactCard({ myth, fact, index }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{
      borderRadius: "var(--radius)", overflow: "hidden",
      background: "var(--bg-card)", border: "1px solid var(--border-light)",
      transition: "all 0.3s ease",
    }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          width: "100%", padding: "16px 20px", background: "none", border: "none",
          cursor: "pointer", textAlign: "left",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: "rgba(239,68,68,0.1)", color: "#EF4444",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 12, fontWeight: 800, flexShrink: 0,
          }}>
            {index + 1}
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#EF4444", textTransform: "uppercase", letterSpacing: 0.5 }}>Myth</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{myth}</div>
          </div>
        </div>
        <div style={{
          width: 28, height: 28, borderRadius: "50%",
          background: "var(--bg-secondary)",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "transform 0.3s ease",
          transform: open ? "rotate(180deg)" : "rotate(0)",
        }}>
          <ChevronDown size={14} color="var(--text-muted)" />
        </div>
      </button>
      {open && (
        <div style={{
          padding: "0 20px 16px 60px",
          animation: "fadeIn 0.3s ease",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
            <CheckCircle size={14} color="#10B981" />
            <span style={{ fontSize: 11, fontWeight: 600, color: "#10B981", textTransform: "uppercase", letterSpacing: 0.5 }}>Fact</span>
          </div>
          <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6 }}>{fact}</p>
        </div>
      )}
    </div>
  );
}

function EmergencyCard({ icon: Icon, title, action, color }) {
  return (
    <div style={{
      padding: 20, borderRadius: "var(--radius)",
      background: `${color}08`, border: `1px solid ${color}25`,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: `${color}15`, color,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Icon size={18} />
        </div>
        <h4 style={{ fontSize: 15, fontWeight: 700, color }}>{title}</h4>
      </div>
      <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>{action}</p>
    </div>
  );
}

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{
      borderRadius: "var(--radius)", overflow: "hidden",
      background: "var(--bg-card)", border: "1px solid var(--border-light)",
    }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          width: "100%", padding: "16px 20px", background: "none", border: "none",
          cursor: "pointer", textAlign: "left",
        }}
      >
        <span style={{ fontSize: 15, fontWeight: 600, color: "var(--text)", flex: 1, paddingRight: 12 }}>{q}</span>
        <div style={{
          width: 28, height: 28, borderRadius: "50%",
          background: open ? "var(--red)" : "var(--bg-secondary)",
          color: open ? "#fff" : "var(--text-muted)",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all 0.3s ease", flexShrink: 0,
        }}>
          {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
      </button>
      {open && (
        <div style={{ padding: "0 20px 16px", animation: "fadeIn 0.3s ease" }}>
          <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7 }}>{a}</p>
        </div>
      )}
    </div>
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

  return (
    <div style={{ minHeight: "100vh" }}>
      {/* ── Hero ── */}
      <div ref={heroRef} style={{
        background: "linear-gradient(135deg, #DC2626 0%, #EF4444 50%, #F87171 100%)",
        padding: "64px 20px 56px",
        position: "relative", overflow: "hidden",
        opacity: heroVisible ? 1 : 0,
        transform: heroVisible ? "translateY(0)" : "translateY(-20px)",
        transition: "all 0.7s cubic-bezier(0.16,1,0.3,1)",
      }}>
        {/* Decorative drops */}
        <div style={{ position: "absolute", top: 20, left: "10%", width: 12, height: 16, borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%", background: "rgba(255,255,255,0.15)", animation: "float 6s ease-in-out infinite" }} />
        <div style={{ position: "absolute", top: 40, right: "15%", width: 8, height: 10, borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%", background: "rgba(255,255,255,0.1)", animation: "float 8s ease-in-out infinite 1s" }} />
        <div style={{ position: "absolute", bottom: 30, left: "20%", width: 10, height: 13, borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%", background: "rgba(255,255,255,0.12)", animation: "float 7s ease-in-out infinite 2s" }} />

        <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 2 }}>
          <div style={{
            width: 72, height: 72, borderRadius: "50%",
            background: "rgba(255,255,255,0.2)", backdropFilter: "blur(10px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 20px", border: "2px solid rgba(255,255,255,0.3)",
          }}>
            <Heart size={32} color="#fff" fill="#fff" />
          </div>
          <h1 style={{ fontSize: 36, fontWeight: 900, color: "#fff", marginBottom: 12, lineHeight: 1.2 }}>
            Health Hub
          </h1>
          <p style={{ fontSize: 17, color: "rgba(255,255,255,0.9)", maxWidth: 550, margin: "0 auto", lineHeight: 1.6 }}>
            Everything you need to know before, during, and after donating blood. Stay informed, stay healthy, save lives.
          </p>
        </div>
      </div>

      {/* ── Diet Before Donation ── */}
      <Section id="diet-before" title="Diet Before Donation" subtitle="Eat smart before you donate — it makes the experience safer and easier.">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          {DIET_BEFORE.map((tip, i) => (
            <TipCard key={i} {...tip} delay={i * 0.08} />
          ))}
        </div>
      </Section>

      {/* ── Diet After Donation ── */}
      <Section id="diet-after" title="Diet After Donation" subtitle="Recovery starts with what you eat and drink after giving blood.">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          {DIET_AFTER.map((tip, i) => (
            <TipCard key={i} {...tip} delay={i * 0.08} />
          ))}
        </div>
      </Section>

      {/* ── Exercise ── */}
      <Section id="exercise" title="Exercise & Fitness" subtitle="Know what's safe and what to avoid after donating blood.">
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
          <ExerciseCard items={EXERCISE_DO} type="do" />
          <ExerciseCard items={EXERCISE_DONT} type="dont" />
        </div>
      </Section>

      {/* ── Benefits ── */}
      <Section id="benefits" title="Benefits of Donating Blood" subtitle="Donating blood doesn't just help others — it helps you too.">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
          {BENEFITS.map((b, i) => (
            <BenefitCard key={i} {...b} delay={i * 0.08} />
          ))}
        </div>
      </Section>

      {/* ── Side Effects ── */}
      <Section id="side-effects" title="Possible Side Effects" subtitle="Most side effects are mild and pass quickly. Here's what to expect.">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 12 }}>
          {SIDE_EFFECTS.map((s, i) => (
            <SideEffectCard key={i} {...s} />
          ))}
        </div>
      </Section>

      {/* ── Eligibility ── */}
      <Section id="eligibility" title="Donation Eligibility" subtitle="Check if you're eligible to donate blood.">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))", gap: 10 }}>
          {ELIGIBILITY.map((e, i) => (
            <EligibilityItem key={i} {...e} />
          ))}
        </div>
      </Section>

      {/* ── Myths vs Facts ── */}
      <Section id="myths" title="Myths vs Facts" subtitle="Don't believe everything you hear. Let's separate fact from fiction.">
        <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 700, margin: "0 auto" }}>
          {MYTHS_FACTS.map((mf, i) => (
            <MythFactCard key={i} index={i} {...mf} />
          ))}
        </div>
      </Section>

      {/* ── Emergency Tips ── */}
      <Section id="emergency" title="Emergency Tips" subtitle="Know what to do if you feel unwell after donating blood.">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          {EMERGENCY_TIPS.map((e, i) => (
            <EmergencyCard key={i} {...e} />
          ))}
        </div>
        <div style={{
          marginTop: 24, padding: "16px 20px", borderRadius: "var(--radius)",
          background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)",
          display: "flex", alignItems: "center", gap: 12, maxWidth: 700, margin: "24px auto 0",
        }}>
          <Phone size={20} color="#EF4444" />
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#EF4444" }}>Emergency Hotline</div>
            <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>Call <strong>999</strong> or your local emergency number if symptoms are severe or persist.</div>
          </div>
        </div>
      </Section>

      {/* ── FAQ ── */}
      <Section id="faq" title="Frequently Asked Questions" subtitle="Got questions? We've got answers.">
        <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 700, margin: "0 auto" }}>
          {FAQS.map((faq, i) => (
            <FaqItem key={i} {...faq} />
          ))}
        </div>
      </Section>

      {/* ── Bottom CTA ── */}
      <div style={{ padding: "48px 20px", textAlign: "center" }}>
        <div style={{
          maxWidth: 600, margin: "0 auto", padding: 32,
          borderRadius: "var(--radius-lg)",
          background: "linear-gradient(135deg, #FEE2E2, #FECACA)",
          border: "1px solid rgba(239,68,68,0.15)",
        }}>
          <Heart size={28} color="#EF4444" style={{ marginBottom: 12 }} />
          <h3 style={{ fontSize: 22, fontWeight: 800, color: "var(--text)", marginBottom: 8 }}>Ready to Save Lives?</h3>
          <p style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 20 }}>Find a blood donor request near you and make a difference today.</p>
          <a href="/requests" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "12px 28px", borderRadius: "var(--radius-sm)",
            background: "#EF4444", color: "#fff", textDecoration: "none",
            fontSize: 15, fontWeight: 600,
            transition: "all 0.2s",
          }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#DC2626"; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "#EF4444"; e.currentTarget.style.transform = "translateY(0)"; }}
          >
            View Requests <ArrowRight size={16} />
          </a>
        </div>
      </div>

      {/* ── Animations ── */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-12px) rotate(5deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 480px) {
          .health-hero h1 { font-size: 28px; }
        }
      `}</style>
    </div>
  );
}
