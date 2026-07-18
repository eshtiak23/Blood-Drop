/**
 * LeaderboardPage — Blood donor leaderboard matching premium design.
 * Light header, podium with ml bars, stats row, table with ml, bottom CTA.
 */
import { useState, useEffect, useRef, useMemo } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import { BLOOD_GROUPS, BLOOD_GROUP_COLORS, DISTRICTS } from "../../data/constants";
import { Trophy, Search, MapPin, Droplets, X, Loader2, Shield, Users, Heart, Share2, Award } from "lucide-react";
import Pagination from "../../components/ui/Pagination";
import toast from "react-hot-toast";

const ML_PER_DONATION = 150;

/* ── Badge System ── */
function getBadge(donations) {
  if (donations >= 40) return { label: "Diamond", color: "#8B5CF6", bg: "rgba(139,92,246,0.1)" };
  if (donations >= 20) return { label: "Platinum", color: "#3B82F6", bg: "rgba(59,130,246,0.1)" };
  if (donations >= 10) return { label: "Gold", color: "#D97706", bg: "rgba(217,119,6,0.1)" };
  if (donations >= 5)  return { label: "Silver", color: "#6B7280", bg: "rgba(107,114,128,0.1)" };
  return              { label: "Bronze", color: "#D97706", bg: "rgba(217,119,6,0.08)" };
}

function getBloodGroupColor(bloodGroup) {
  const c = BLOOD_GROUP_COLORS[bloodGroup];
  if (!c) return {};
  const isDark = document.documentElement.classList.contains("dark");
  return { bg: isDark ? c.darkBg : c.bg, text: isDark ? c.darkText : c.text };
}

/* ── Animated Counter Hook ── */
function useCountUp(target, duration = 1500) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  const started = useRef(false);

  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.15 });
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible || started.current || !target) return;
    started.current = true;
    const start = performance.now();
    const animate = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [visible, target, duration]);

  return { ref, count };
}

/* ── Stat Card ── */
function StatCard({ icon, iconBg, value, label, sub, delay = 0 }) {
  const { ref, count } = useCountUp(typeof value === "number" ? value : 0);
  return (
    <div ref={ref} className="lb-stat-card" style={{ animationDelay: `${delay}s` }}>
      <div className="lb-stat-icon" style={{ background: iconBg }}>{icon}</div>
      <div className="lb-stat-info">
        <div className="lb-stat-label">{label}</div>
        <div className="lb-stat-value">{typeof value === "number" ? count.toLocaleString() : value}</div>
        {sub && <div className="lb-stat-sub">{sub}</div>}
      </div>
    </div>
  );
}

/* ── Podium Card ── */
function PodiumCard({ donor, rank }) {
  const bc = getBloodGroupColor(donor.bloodGroup);
  const ml = (donor.totalDonations || 0) * ML_PER_DONATION;
  const badge = getBadge(donor.totalDonations);
  const rankColors = {
    1: { border: "#F59E0B", bg: "rgba(245,158,11,0.04)", barBg: "linear-gradient(135deg, #F59E0B, #D97706)", numBg: "#F59E0B", pillBg: "#FEF3C7", pillColor: "#D97706" },
    2: { border: "#9CA3AF", bg: "rgba(156,163,175,0.04)", barBg: "linear-gradient(135deg, #9CA3AF, #6B7280)", numBg: "#6B7280", pillBg: "#F3F4F6", pillColor: "#374151" },
    3: { border: "#D97706", bg: "rgba(217,119,6,0.04)", barBg: "linear-gradient(135deg, #F59E0B, #EA580C)", numBg: "#D97706", pillBg: "#FEF3C7", pillColor: "#D97706" },
  };
  const rc = rankColors[rank];

  return (
    <div className={`podium-card podium-rank-${rank}`}>
      <div className="podium-rank-num" style={{ background: rc.numBg }}>
        {rank}
      </div>
      <Link to={`/donors/${donor._id}`} style={{ textDecoration: "none" }}>
        <div className="podium-avatar" style={{ borderColor: rc.border }}>
          {donor.photo ? (
            <img src={donor.photo} alt={donor.name} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
          ) : (
            <span>{donor.name?.charAt(0)?.toUpperCase()}</span>
          )}
        </div>
      </Link>
      <Link to={`/donors/${donor._id}`} style={{ textDecoration: "none", color: "inherit" }}>
        <div className="podium-name">{donor.name}</div>
      </Link>
      <div className="podium-blood" style={{ color: bc.text }}>{donor.bloodGroup}</div>
      <div className="podium-badge" style={{ background: badge.bg, color: badge.color }}>
        <Shield size={12} /> {badge.label}
      </div>
      <div className="podium-pill" style={{ background: rc.pillBg, color: rc.pillColor }}>
        {donor.totalDonations} Donations
      </div>
      <div className="podium-ml-bar" style={{ background: rc.barBg }}>
        <Droplets size={14} color="#fff" />
        <span>{ml.toLocaleString()} ml</span>
      </div>
    </div>
  );
}

/* ── Table Row ── */
function TableRow({ donor, rank, isCurrentUser }) {
  const badge = getBadge(donor.totalDonations);
  const bc = getBloodGroupColor(donor.bloodGroup);
  const ml = (donor.totalDonations || 0) * ML_PER_DONATION;

  const formatDate = (d) => {
    if (!d) return "Never";
    const date = new Date(d);
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  return (
    <div className={`lb-row ${isCurrentUser ? "lb-row-current" : ""}`}>
      <div className="lb-col-rank">
        <span className="lb-rank-num">{rank}</span>
      </div>
      <div className="lb-col-donor">
        <div className="lb-avatar">
          {donor.photo ? (
            <img src={donor.photo} alt={donor.name} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
          ) : (
            <span>{donor.name?.charAt(0)?.toUpperCase()}</span>
          )}
        </div>
        <div className="lb-donor-info">
          <Link to={`/donors/${donor._id}`} style={{ textDecoration: "none", color: "inherit" }}>
            <span className="lb-donor-name">{donor.name}</span>
            {isCurrentUser && <span className="lb-you-badge">You</span>}
          </Link>
        </div>
      </div>
      <div className="lb-col-blood" style={{ color: bc.text }}>{donor.bloodGroup}</div>
      <div className="lb-col-district">{donor.district}</div>
      <div className="lb-col-donations">
        <span className="lb-donation-count">{donor.totalDonations}</span>
        <span className="lb-donation-ml">{ml.toLocaleString()} ml</span>
      </div>
      <div className="lb-col-badge">
        <div className="lb-badge-pill" style={{ background: badge.bg, color: badge.color }}>
          <Shield size={12} /> {badge.label}
        </div>
      </div>
      <div className="lb-col-date">{formatDate(donor.lastDonationDate)}</div>
    </div>
  );
}

/* ── Mobile Card ── */
function MobileCard({ donor, rank, isCurrentUser }) {
  const badge = getBadge(donor.totalDonations);
  const bc = getBloodGroupColor(donor.bloodGroup);
  const ml = (donor.totalDonations || 0) * ML_PER_DONATION;

  return (
    <div className={`lb-mobile-card ${isCurrentUser ? "lb-row-current" : ""}`}>
      <div className="lb-mobile-top">
        <span className="lb-rank-num" style={{ width: 28, height: 28, fontSize: 12 }}>{rank}</span>
        <div className="lb-avatar" style={{ width: 40, height: 40, fontSize: 14 }}>
          {donor.photo ? (
            <img src={donor.photo} alt={donor.name} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
          ) : (
            <span>{donor.name?.charAt(0)?.toUpperCase()}</span>
          )}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Link to={`/donors/${donor._id}`} style={{ textDecoration: "none", color: "inherit" }}>
            <div style={{ fontSize: 13, fontWeight: 700 }}>{donor.name} {isCurrentUser && <span className="lb-you-badge">You</span>}</div>
          </Link>
          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{donor.district}</div>
        </div>
      </div>
      <div className="lb-mobile-bottom">
        <span style={{ fontSize: 12, fontWeight: 600, color: bc.text }}>{donor.bloodGroup}</span>
        <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text)" }}>{donor.totalDonations} <span style={{ color: "var(--red)", fontWeight: 600, fontSize: 11 }}>{ml.toLocaleString()} ml</span></span>
        <div className="lb-badge-pill" style={{ background: badge.bg, color: badge.color, fontSize: 10, padding: "2px 8px" }}>
          <Shield size={10} /> {badge.label}
        </div>
      </div>
    </div>
  );
}

/* ── Main Component ── */
export default function LeaderboardPage() {
  const { user } = useAuth();
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [bloodFilter, setBloodFilter] = useState("");
  const [districtFilter, setDistrictFilter] = useState("");
  const [sortBy, setSortBy] = useState("donations");
  const [page, setPage] = useState(1);
  const PER_PAGE = 10;

  const fetchLeaderboard = () => {
    setLoading(true);
    api.get("/donors/leaderboard").then((res) => {
      setDonors(res.data.donors);
      setLoading(false);
    }).catch((err) => {
      const msg = err.response?.status === 500
        ? "Server is waking up. Please try again in a few seconds."
        : "Failed to load leaderboard. Please try again.";
      toast.error(msg);
      setLoading(false);
    });
  };

  useEffect(() => { fetchLeaderboard(); }, []);

  const filtered = useMemo(() => {
    let list = [...donors];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((d) => d.name?.toLowerCase().includes(q));
    }
    if (bloodFilter) list = list.filter((d) => d.bloodGroup === bloodFilter);
    if (districtFilter) list = list.filter((d) => d.district === districtFilter);

    if (sortBy === "donations") {
      list.sort((a, b) => b.totalDonations - a.totalDonations || new Date(a.lastDonationDate || 0) - new Date(b.lastDonationDate || 0));
    } else if (sortBy === "recent") {
      list.sort((a, b) => new Date(b.lastDonationDate || 0) - new Date(a.lastDonationDate || 0));
    } else {
      list.sort((a, b) => b.totalDonations - a.totalDonations || new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
    }
    return list;
  }, [donors, search, bloodFilter, districtFilter, sortBy]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const top3 = donors.slice(0, 3);
  const totalDonations = donors.reduce((sum, d) => sum + (d.totalDonations || 0), 0);
  const livesImpacted = Math.round(totalDonations * 1.3);
  const topDonor = donors[0];

  useEffect(() => { setPage(1); }, [search, bloodFilter, districtFilter, sortBy]);

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: 16 }}>
        <Loader2 size={32} className="animate-spin" color="var(--red)" />
        <span style={{ color: "var(--text-muted)", fontSize: 14 }}>Loading leaderboard...</span>
      </div>
    );
  }

  if (donors.length === 0) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: 16 }}>
        <Trophy size={40} color="var(--red)" style={{ opacity: 0.4 }} />
        <span style={{ color: "var(--text-muted)", fontSize: 14 }}>No data available</span>
        <button className="btn btn-primary btn-sm" onClick={fetchLeaderboard}>Retry</button>
      </div>
    );
  }

  return (
    <div className="lb-page">
      {/* ── Header ── */}
      <div className="lb-header">
        <div className="lb-header-drops">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="lb-header-drop" style={{ left: `${15 + i * 14}%`, animationDelay: `${i * 0.8}s`, width: `${8 + (i % 3) * 4}px`, height: `${8 + (i % 3) * 4}px` }} />
          ))}
        </div>
        <div className="container" style={{ position: "relative", zIndex: 2, padding: "40px 20px 32px" }}>
          <div className="lb-header-row">
            <div className="lb-header-trophy"><Trophy size={28} color="#EF4444" /></div>
            <div>
              <h1 className="lb-header-title">Blood Donor <span style={{ color: "var(--red)" }}>Leaderboard</span></h1>
              <p className="lb-header-sub">Honoring our heroes who donate blood and save lives.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: "0 20px 48px" }}>
        {/* ── Podium ── */}
        {top3.length >= 3 && (
          <div className="podium-section">
            <div className="podium">
              <PodiumCard donor={top3[1]} rank={2} />
              <PodiumCard donor={top3[0]} rank={1} />
              <PodiumCard donor={top3[2]} rank={3} />
            </div>
          </div>
        )}

        {/* ── Stats Row ── */}
        <div className="lb-stats-row">
          <StatCard icon={<Users size={20} color="#EF4444" />} iconBg="rgba(239,68,68,0.1)" value={donors.length} label="Total Donors" sub="Active Donors" delay={0} />
          <StatCard icon={<Droplets size={20} color="#EF4444" />} iconBg="rgba(239,68,68,0.1)" value={totalDonations} label="Total Donations" sub="This Year" delay={0.1} />
          <StatCard icon={<Heart size={20} color="#EF4444" />} iconBg="rgba(239,68,68,0.1)" value={livesImpacted} label="Lives Impacted" sub="So Far" delay={0.2} />
          {topDonor && (
            <div className="lb-stat-card" style={{ animationDelay: "0.3s" }}>
              <div className="lb-stat-icon" style={{ background: "rgba(245,158,11,0.1)" }}><Trophy size={20} color="#F59E0B" /></div>
              <div className="lb-stat-info">
                <div className="lb-stat-label">Top Donor</div>
                <div className="lb-stat-value" style={{ fontSize: 16 }}>{topDonor.name}</div>
                <div className="lb-stat-sub" style={{ color: "var(--red)", fontWeight: 600 }}>{topDonor.totalDonations} Donations</div>
              </div>
            </div>
          )}
        </div>

        {/* ── Filters ── */}
        <div className="lb-filters">
          <div className="lb-search-wrap">
            <Search size={16} className="lb-search-icon" />
            <input type="text" placeholder="Search donor by name..." value={search} onChange={(e) => setSearch(e.target.value)} className="lb-search-input" />
            {search && <button onClick={() => setSearch("")} className="lb-search-clear"><X size={14} /></button>}
          </div>
          <select className="input lb-filter-select" value={bloodFilter} onChange={(e) => setBloodFilter(e.target.value)}>
            <option value="">All Blood Groups</option>
            {BLOOD_GROUPS.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
          <select className="input lb-filter-select" value={districtFilter} onChange={(e) => setDistrictFilter(e.target.value)}>
            <option value="">All Districts</option>
            {DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          <select className="input lb-filter-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="donations">Most Donations</option>
            <option value="recent">Recent Donation</option>
            <option value="rank">Rank</option>
          </select>
        </div>

        {/* ── Table ── */}
        <div className="lb-table-wrap">
          <div className="lb-table-header">
            <div className="lb-col-rank">Rank</div>
            <div className="lb-col-donor">Donor</div>
            <div className="lb-col-blood">Blood Group</div>
            <div className="lb-col-district">District</div>
            <div className="lb-col-donations">Total Donations</div>
            <div className="lb-col-badge">Badge</div>
            <div className="lb-col-date">Last Donation</div>
          </div>
          {paginated.length === 0 ? (
            <div className="empty-state" style={{ padding: "40px 20px" }}>
              <div className="empty-state-icon"><Trophy size={28} color="var(--red)" /></div>
              <div className="empty-state-title">No donors found</div>
              <div className="empty-state-desc">Try adjusting your filters</div>
            </div>
          ) : (
            paginated.map((d, i) => (
              <TableRow key={d._id} donor={d} rank={(page - 1) * PER_PAGE + i + 1} isCurrentUser={user?._id === d._id} />
            ))
          )}
        </div>

        {/* ── Mobile Cards ── */}
        <div className="lb-mobile-wrap">
          {paginated.length === 0 ? (
            <div className="empty-state" style={{ padding: "40px 20px" }}>
              <div className="empty-state-icon"><Trophy size={28} color="var(--red)" /></div>
              <div className="empty-state-title">No donors found</div>
              <div className="empty-state-desc">Try adjusting your filters</div>
            </div>
          ) : (
            paginated.map((d, i) => (
              <MobileCard key={d._id} donor={d} rank={(page - 1) * PER_PAGE + i + 1} isCurrentUser={user?._id === d._id} />
            ))
          )}
        </div>

        {/* ── Pagination ── */}
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

        {/* ── Bottom CTA ── */}
        <div className="lb-cta">
          <div className="lb-cta-left">
            <div className="lb-cta-icon"><Award size={24} color="#EF4444" /></div>
            <div>
              <div className="lb-cta-title">Keep donating, keep inspiring!</div>
              <div className="lb-cta-sub">The more you donate, the higher you rank.</div>
            </div>
          </div>
          <button className="btn btn-primary lb-cta-btn" onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success("Link copied!"); }}>
            <Share2 size={16} /> Share Your Achievement
          </button>
        </div>
      </div>
    </div>
  );
}
