/**
 * DonorSearchPage — Main donor search interface.
 * Allows users to find blood donors by blood group, district/area, or proximity
 * using geolocation. Features collapsible filters, paginated results, and a
 * contact modal for reaching out to donors.
 */
import { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { MessageCircle } from "lucide-react";
import { BLOOD_GROUPS, BLOOD_GROUP_COLORS, DISTRICTS, AREAS } from "../../data/constants";
import api from "../../services/api";
import * as friendService from "../../services/friendService";
import { Search, MapPin, Droplets, Calendar, Shield, UserSearch, Locate, Navigation, User, Clock, CheckCircle, SlidersHorizontal, Loader2, UserPlus, Check, Clock3, X, Mail } from "lucide-react";
import toast from "react-hot-toast";
import Pagination from "../../components/ui/Pagination";

const RADIUS_OPTIONS = [10, 20, 30, 50, 100];
const PER_PAGE = 12;
const DONATION_COOLDOWN_MONTHS = 3;

// Returns theme-aware bg/text colors for a blood group badge
function getBloodGroupColor(bloodGroup) {
  const c = BLOOD_GROUP_COLORS[bloodGroup];
  if (!c) return {};
  const isDark = document.documentElement.classList.contains("dark");
  return { bg: isDark ? c.darkBg : c.bg, text: isDark ? c.darkText : c.text };
}

// Calculates great-circle distance (km) between two GPS coords using the Haversine formula
function haversineDistance(lat1, lng1, lat2, lng2) {
  if (!lat1 || !lng1 || !lat2 || !lng2) return Infinity;
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Formats distance for display: "1.2 km" for ≥1km, otherwise "800 m"
function formatDistance(km) {
  return km >= 1 ? `${km.toFixed(1)} km` : `${Math.round(km * 1000)} m`;
}

// Returns true if the donor hasn't donated in the last 3 months (safe to donate again)
function isDonationCooledDown(lastDonationDate) {
  if (!lastDonationDate) return true;
  const last = new Date(lastDonationDate);
  const now = new Date();
  const diffMs = now - last;
  const diffMonths = diffMs / (1000 * 60 * 60 * 24 * 30);
  return diffMonths >= DONATION_COOLDOWN_MONTHS;
}

export default function DonorSearchPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ bloodGroup: searchParams.get("bloodGroup") || "", district: "", area: "", radius: 10 });
  const [useLocation, setUseLocation] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState("");
  const [page, setPage] = useState(1);
  const [selectedDonor, setSelectedDonor] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [friendStatuses, setFriendStatuses] = useState({});
  const areas = filters.district ? (AREAS[filters.district] || []) : [];

  // Fetch donors from API
  const fetchDonors = (showLoader = false) => {
    if (showLoader) setLoading(true);
    api.get("/donors/search")
      .then((res) => setDonors(res.data.donors))
      .catch(() => {})
      .finally(() => { if (showLoader) setLoading(false); });
  };

  // Initial load + polling every 30s for new donors
  useEffect(() => {
    const bloodGroup = searchParams.get("bloodGroup");
    if (bloodGroup) setHasSearched(true);
    fetchDonors(true);
    const interval = setInterval(() => fetchDonors(false), 30000);
    return () => clearInterval(interval);
  }, []);

  const handleConnect = async (donorId) => {
    if (!isAuthenticated) { navigate("/login"); return; }
    try {
      const result = await friendService.sendRequest(donorId);
      if (result.autoAccepted) {
        toast.success("You are now connected! Phone number revealed.");
        setFriendStatuses((prev) => ({ ...prev, [donorId]: { status: "accepted" } }));
      } else {
        toast.success("Connection request sent!");
        setFriendStatuses((prev) => ({ ...prev, [donorId]: { status: "pending_sent" } }));
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to send request");
    }
  };

  // Lock body scroll when modal is open
  useEffect(() => {
    if (selectedDonor) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [selectedDonor]);

  const filteredResults = useMemo(() => {
    let list = [...donors];

    if (filters.bloodGroup) list = list.filter((d) => d.bloodGroup === filters.bloodGroup);

    if (useLocation && userLocation) {
      list = list
        .map((d) => ({ ...d, distance: haversineDistance(userLocation.lat, userLocation.lng, d.lat, d.lng) }))
        .filter((d) => d.distance <= filters.radius)
        .sort((a, b) => a.distance - b.distance);
    } else {
      if (filters.district) list = list.filter((d) => d.district === filters.district);
      if (filters.area) list = list.filter((d) => d.area === filters.area);
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return list;
  }, [donors, filters, useLocation, userLocation]);

  const totalPages = Math.ceil(filteredResults.length / PER_PAGE);
  const pagedResults = filteredResults.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  // Load friend statuses for visible donors
  useEffect(() => {
    if (!isAuthenticated || pagedResults.length === 0) return;
    pagedResults.forEach(async (d) => {
      if (friendStatuses[d._id]) return;
      try {
        const data = await friendService.getStatus(d._id);
        setFriendStatuses((prev) => ({ ...prev, [d._id]: data }));
      } catch {}
    });
  }, [pagedResults, isAuthenticated]);

  const handleSearch = () => { setHasSearched(true); setPage(1); };

  const handleUseLocation = () => {
    setLocationError("");
    if (!navigator.geolocation) {
      setLocationError("Geolocation not supported by your browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setUseLocation(true);
        setFilters((f) => ({ ...f, district: "", area: "" }));
        setPage(1);
        setHasSearched(true);
      },
      () => {
        setLocationError("Location access denied. Please allow location or use district search.");
        setUseLocation(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleClearFilters = () => {
    setFilters({ bloodGroup: "", district: "", area: "", radius: 10 });
    setUseLocation(false);
    setUserLocation(null);
    setPage(1);
    setHasSearched(false);
  };

  return (
    <div className="container" style={{ padding: "32px 20px" }}>
      <h1 style={{ fontSize: 24, fontWeight: 800 }}>Find Blood Donors</h1>
      <p style={{ color: "var(--text-secondary)", marginTop: 4, display: "flex", alignItems: "center", gap: 8 }}>
        {loading ? "Loading donors..." : `Showing ${filteredResults.length} of ${donors.length} donors`}
        <button onClick={() => fetchDonors(false)} title="Refresh donor list" style={{ background: "none", border: "none", padding: 4, cursor: "pointer", color: "var(--text-muted)", display: "flex", alignItems: "center" }}>
          <Loader2 size={14} style={{ animation: loading ? "spin 1s linear infinite" : "none" }} />
        </button>
      </p>

      {locationError && (
        <div style={{ padding: "10px 14px", borderRadius: "var(--radius-sm)", background: "var(--yellow-light)", color: "var(--yellow-dark)", fontSize: 13, marginTop: 12 }}>
          {locationError}
        </div>
      )}

      {/* ---- Search Filters (collapsible) ---- */}
      <button className="btn btn-secondary" style={{ marginTop: 20, width: "100%", justifyContent: "space-between" }} onClick={() => setSearchOpen(!searchOpen)}>
        <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <SlidersHorizontal size={16} /> Search Filters
        </span>
        <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{searchOpen ? "Close" : "Open"}</span>
      </button>

      {searchOpen && (
        <div className="card animate-fadeIn" style={{ marginTop: 8, padding: 20 }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
            <button className={`btn ${!useLocation ? "btn-primary" : "btn-secondary"} btn-sm`} onClick={() => { setUseLocation(false); setUserLocation(null); setPage(1); }}>
              <Search size={14} /> District Search
            </button>
            <button className={`btn ${useLocation ? "btn-primary" : "btn-secondary"} btn-sm`} onClick={handleUseLocation}>
              <Locate size={14} /> Search Near Me
            </button>
            {hasSearched && (
              <button className="btn btn-ghost btn-sm" onClick={handleClearFilters}>
                Clear Filters
              </button>
            )}
          </div>

          {useLocation ? (
            <div className="grid" style={{ gridTemplateColumns: "repeat(3, 1fr)", gap: 12, alignItems: "end" }}>
              <div className="input-group">
                <label style={{ fontSize: 13 }}>Blood Group</label>
                <select className="input" value={filters.bloodGroup} onChange={(e) => { setFilters({ ...filters, bloodGroup: e.target.value }); setPage(1); }}>
                  <option value="">Any</option>
                  {BLOOD_GROUPS.map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div className="input-group">
                <label style={{ fontSize: 13 }}>Radius</label>
                <select className="input" value={filters.radius} onChange={(e) => { setFilters({ ...filters, radius: Number(e.target.value) }); setPage(1); }}>
                  {RADIUS_OPTIONS.map((r) => <option key={r} value={r}>{r} km</option>)}
                </select>
              </div>
              <button className="btn btn-primary" onClick={handleSearch}>
                <Navigation size={16} /> Search
              </button>
            </div>
          ) : (
            <div className="grid grid-4 donor-search-grid" style={{ gap: 12, alignItems: "end" }}>
              <div className="input-group">
                <label style={{ fontSize: 13 }}>Blood Group</label>
                <select className="input" value={filters.bloodGroup} onChange={(e) => { setFilters({ ...filters, bloodGroup: e.target.value }); setPage(1); }}>
                  <option value="">Any</option>
                  {BLOOD_GROUPS.map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div className="input-group">
                <label style={{ fontSize: 13 }}>District</label>
                <select className="input" value={filters.district} onChange={(e) => { setFilters({ ...filters, district: e.target.value, area: "" }); setPage(1); }}>
                  <option value="">Any</option>
                  {DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="input-group">
                <label style={{ fontSize: 13 }}>Area</label>
                <select className="input" value={filters.area} onChange={(e) => { setFilters({ ...filters, area: e.target.value }); setPage(1); }} disabled={!filters.district}>
                  <option value="">{filters.district ? "Any" : "Select district"}</option>
                  {areas.map((a) => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              <button className="btn btn-primary" onClick={handleSearch}>
                <Search size={16} /> Search
              </button>
            </div>
          )}
        </div>
      )}

      {pagedResults.length > 0 && (
        <p style={{ marginTop: 16, fontSize: 14, color: "var(--text-secondary)" }}>
          Showing {((page - 1) * PER_PAGE) + 1}–{Math.min(page * PER_PAGE, filteredResults.length)} of {filteredResults.length} donors
        </p>
      )}

      {/* ---- Donor Cards ---- */}
      <div style={{ marginTop: 8 }}>
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
            <Loader2 size={32} color="var(--red)" className="animate-pulse" />
          </div>
        ) : pagedResults.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><UserSearch size={28} color="var(--purple)" /></div>
            <div className="empty-state-title">No donors found</div>
            <div className="empty-state-desc">Try adjusting your search filters</div>
          </div>
        ) : (
          <>
            <div className="grid grid-3">
              {pagedResults.map((d) => {
                const canDonate = isDonationCooledDown(d.lastDonationDate);
                const c = getBloodGroupColor(d.bloodGroup);
                return (
                <div key={d._id} className="contact-card contact-card-entry" style={{ animationDelay: `${pagedResults.indexOf(d) * 0.08}s` }}
                  onMouseMove={(e) => {
                    const card = e.currentTarget;
                    const rect = card.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    const centerX = rect.width / 2;
                    const centerY = rect.height / 2;
                    const rotateX = ((y - centerY) / centerY) * -6;
                    const rotateY = ((x - centerX) / centerX) * 6;
                    card.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(8px)`;
                    const glare = card.querySelector(".contact-card-glare");
                    if (glare) {
                      glare.style.opacity = "1";
                      glare.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.1) 40%, transparent 70%)`;
                    }
                  }}
                  onMouseLeave={(e) => {
                    const card = e.currentTarget;
                    card.style.transform = "perspective(600px) rotateX(0deg) rotateY(0deg) translateZ(0px)";
                    const glare = card.querySelector(".contact-card-glare");
                    if (glare) { glare.style.opacity = "0"; }
                  }}
                >
                  <div className="contact-card-glare" />
                  <div className="contact-card-top">
                  <div className="contact-card-avatar" style={{ background: `linear-gradient(135deg, ${c.text || "#EF4444"}, ${c.text || "#DC2626"}88)`, overflow: "hidden", padding: 0 }}>
                    {d.photo ? (
                      <img src={d.photo} alt={d.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      d.name?.charAt(0)?.toUpperCase()
                    )}
                  </div>
                    {d.bloodGroup && (
                      <div className="contact-card-blood-badge" style={{ background: c.text || "#EF4444" }}>
                        {d.bloodGroup}
                      </div>
                    )}
                  </div>
                  <Link to={`/donors/${d._id}`} style={{ textDecoration: "none", color: "inherit" }}>
                    <div className="contact-card-name">{d.name}</div>
                  </Link>
                  <div className="contact-card-location">
                    <MapPin size={13} /> {d.area}, {d.district}
                  </div>
                  {d.email && (
                    <div className="contact-card-location">
                      <Mail size={13} /> {d.email}
                    </div>
                  )}
                  <div className="contact-card-stats">
                    <span className="contact-card-stat"><Droplets size={13} /> {d.totalDonations || 0} donations</span>
                    <span className="contact-card-stat"><Calendar size={13} /> {d.lastDonationDate ? new Date(d.lastDonationDate).toLocaleDateString() : "Never"}</span>
                  </div>
                  <div className="contact-card-status">
                    <span className="contact-card-status-dot" style={{ background: canDonate ? "#22C55E" : "#9CA3AF" }} />
                    <span style={{ color: canDonate ? "#22C55E" : "var(--text-muted)" }}>{canDonate ? "Available" : "Not Available"}</span>
                  </div>
                  <div className="contact-card-actions">
                    {(() => {
                      const fs = friendStatuses[d._id]?.status;
                      if (fs === "accepted") {
                        return (
                          <span className="contact-card-icon-btn" style={{ background: "#ECFDF5", color: "#059669", fontSize: 12, fontWeight: 600, width: "auto", padding: "0 12px", gap: 4, display: "flex", alignItems: "center" }}>
                            <Check size={14} /> Connected
                          </span>
                        );
                      }
                      if (fs === "pending_sent") {
                        return (
                          <span className="contact-card-icon-btn" style={{ background: "#FEF3C7", color: "#D97706", fontSize: 12, fontWeight: 600, width: "auto", padding: "0 12px", gap: 4, display: "flex", alignItems: "center" }}>
                            <Clock3 size={14} /> Pending
                          </span>
                        );
                      }
                      return (
                        <button className="contact-card-icon-btn" onClick={(e) => { e.stopPropagation(); handleConnect(d._id); }} style={{ background: "#EFF6FF", color: "#2563EB", fontSize: 12, fontWeight: 600, width: "auto", padding: "0 12px", gap: 4, display: "flex", alignItems: "center" }}>
                          <UserPlus size={14} /> Connect
                        </button>
                      );
                    })()}
                    <button className="contact-card-icon-btn contact-card-icon-chat" onClick={() => {
                      if (!isAuthenticated) { navigate("/login"); return; }
                      setSelectedDonor(d);
                    }}>
                      Details
                    </button>
                  </div>
                </div>
                );
              })}
            </div>

            {/* ---- Pagination ---- */}
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        )}
      </div>

      {/* ---- Contact Modal ---- */}
      {selectedDonor && createPortal(
        <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "12px" }} onClick={() => setSelectedDonor(null)}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(6px)" }} />
          {(() => {
            const sc = getBloodGroupColor(selectedDonor.bloodGroup);
            const canDonate = isDonationCooledDown(selectedDonor.lastDonationDate);
            return (
              <div onClick={(e) => e.stopPropagation()} style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 420, maxHeight: "90vh", overflowY: "auto", background: "var(--bg-card)", borderRadius: "var(--radius-lg)", boxShadow: "0 25px 60px rgba(0,0,0,0.25)" }}>
                {/* Close */}
                <button onClick={() => setSelectedDonor(null)} style={{ position: "absolute", top: 10, right: 10, zIndex: 10, width: 28, height: 28, borderRadius: "50%", background: "rgba(255,255,255,0.9)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
                  <X size={14} />
                </button>

                {/* Header */}
                <div style={{ padding: "24px 20px 16px", textAlign: "center", background: `linear-gradient(135deg, ${sc.bg || "#FEE2E2"}, ${sc.bg || "#FEE2E2"}cc)` }}>
                  <div style={{ width: 60, height: 60, borderRadius: "50%", background: sc.text || "#DC2626", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 800, margin: "0 auto 10px", boxShadow: "0 4px 12px rgba(0,0,0,0.15)", border: "3px solid rgba(255,255,255,0.5)" }}>
                    {selectedDonor.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div style={{ fontSize: 17, fontWeight: 800, color: "var(--text)" }}>{selectedDonor.name}</div>
                  <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2, display: "flex", alignItems: "center", justifyContent: "center", gap: 3 }}>
                    <MapPin size={11} /> {selectedDonor.area}{selectedDonor.district ? `, ${selectedDonor.district}` : ""}
                  </div>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 5, marginTop: 8, padding: "4px 14px", borderRadius: 20, fontSize: 14, fontWeight: 700, background: sc.bg, color: sc.text }}>
                    <Droplets size={13} /> {selectedDonor.bloodGroup}
                  </div>
                </div>

                {/* Stats */}
                <div style={{ padding: "12px 20px 10px", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                  <div style={{ textAlign: "center", padding: "10px 4px", borderRadius: 10, background: "var(--bg-secondary)" }}>
                    <div style={{ width: 30, height: 30, borderRadius: "50%", background: "var(--red-light)", color: "var(--red)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 4px" }}><Droplets size={14} /></div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text)" }}>{selectedDonor.totalDonations || 0}</div>
                    <div style={{ fontSize: 10, color: "var(--text-muted)" }}>Donations</div>
                  </div>
                  <div style={{ textAlign: "center", padding: "10px 4px", borderRadius: 10, background: "var(--bg-secondary)" }}>
                    <div style={{ width: 30, height: 30, borderRadius: "50%", background: "var(--blue-light)", color: "var(--blue)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 4px" }}><Calendar size={14} /></div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text)" }}>{selectedDonor.age || "—"}</div>
                    <div style={{ fontSize: 10, color: "var(--text-muted)" }}>Age</div>
                  </div>
                  <div style={{ textAlign: "center", padding: "10px 4px", borderRadius: 10, background: "var(--bg-secondary)" }}>
                    <div style={{ width: 30, height: 30, borderRadius: "50%", background: canDonate ? "var(--green-light)" : "var(--yellow-light)", color: canDonate ? "var(--green)" : "var(--yellow)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 4px" }}>
                      {canDonate ? <CheckCircle size={13} /> : <Clock size={13} />}
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: canDonate ? "var(--green)" : "var(--yellow)" }}>{canDonate ? "Available" : "Cooldown"}</div>
                    <div style={{ fontSize: 10, color: "var(--text-muted)" }}>Status</div>
                  </div>
                </div>

                {/* Email */}
                {selectedDonor.email && (
                  <div style={{ padding: "6px 20px" }}>
                    <a href={`mailto:${selectedDonor.email}`} style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--red)", textDecoration: "none", fontSize: 14, fontWeight: 600 }}>
                      <Mail size={14} /> {selectedDonor.email}
                    </a>
                  </div>
                )}

                {/* Connect section */}
                <div style={{ padding: "10px 20px" }}>
                  {(() => {
                    const fs = friendStatuses[selectedDonor._id]?.status;
                    if (fs === "accepted") {
                      return (
                        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 10, background: "#ECFDF5" }}>
                          <Check size={18} color="#059669" />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 9, color: "#059669", textTransform: "uppercase", letterSpacing: 0.5 }}>Status</div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: "#059669" }}>Connected — Phone number visible in your connections</div>
                          </div>
                        </div>
                      );
                    }
                    return (
                      <button
                        onClick={() => handleConnect(selectedDonor._id)}
                        style={{
                          display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 10,
                          background: fs === "pending_sent" ? "#FEF3C7" : "#EFF6FF",
                          border: "none", width: "100%", cursor: "pointer", textAlign: "left",
                        }}
                      >
                        {fs === "pending_sent" ? <Clock3 size={18} color="#D97706" /> : <UserPlus size={18} color="#2563EB" />}
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 9, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>Connect</div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: fs === "pending_sent" ? "#D97706" : "#2563EB" }}>
                            {fs === "pending_sent" ? "Request Sent" : "Send Connection Request"}
                          </div>
                        </div>
                      </button>
                    );
                  })()}
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: 10, padding: "8px 20px 16px", borderTop: "1px solid var(--border-light)" }}>
                  <Link to={`/chat/${selectedDonor._id}`} onClick={() => setSelectedDonor(null)} className="btn btn-primary" style={{ flex: 1, padding: "11px 0", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                    <MessageCircle size={15} /> Chat
                  </Link>
                </div>
              </div>
            );
          })()}
        </div>,
        document.body
      )}

      <style>{`
        @media(max-width:768px){
          .donor-search-grid{grid-template-columns:1fr !important;}
          .donor-search-grid .grid-4{grid-template-columns:repeat(2,1fr) !important;}
        }
        @media(max-width:480px){
          .grid-4{grid-template-columns:1fr !important;}
        }
      `}</style>
    </div>
  );
}
