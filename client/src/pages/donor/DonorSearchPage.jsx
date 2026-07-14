/**
 * DonorSearchPage — Main donor search interface.
 * Allows users to find blood donors by blood group, district/area, or proximity
 * using geolocation. Features collapsible filters, paginated results, and a
 * contact modal for reaching out to donors.
 */
import { useState, useMemo, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { BLOOD_GROUPS, BLOOD_GROUP_COLORS, DISTRICTS, AREAS } from "../../data/constants";
import api from "../../services/api";
import { Search, MapPin, Droplets, Calendar, Shield, UserSearch, Locate, Navigation, Phone, X, User, Clock, CheckCircle, ChevronLeft, ChevronRight, SlidersHorizontal, Loader2 } from "lucide-react";

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
      list.sort((a, b) => b.totalDonations - a.totalDonations);
    }

    return list;
  }, [donors, filters, useLocation, userLocation]);

  const totalPages = Math.ceil(filteredResults.length / PER_PAGE);
  const pagedResults = filteredResults.slice((page - 1) * PER_PAGE, page * PER_PAGE);

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
                <div key={d._id} className="card" style={{ padding: 20, transition: "all 0.3s" }}>
                  <Link to={`/donors/${d._id}`} style={{ textDecoration: "none", color: "inherit", display: "block" }}>
                    <div style={{ display: "flex", alignItems: "start", gap: 12 }}>
                      <div className="avatar" style={{ background: c.bg || "var(--border-light)", color: c.text || "var(--text)" }}>
                        {d.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                          <div>
                            <div style={{ fontWeight: 600 }}>{d.name}</div>
                            <div style={{ fontSize: 13, color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
                              <MapPin size={12} /> {d.area}, {d.district}
                            </div>
                          </div>
                          {d.bloodGroup && (
                            <span className="badge" style={{ background: c.bg, color: c.text }}>
                              {d.bloodGroup}
                            </span>
                          )}
                        </div>
                        <div style={{ display: "flex", gap: 14, marginTop: 12, fontSize: 13, color: "var(--text-secondary)", flexWrap: "wrap" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Droplets size={12} /> {d.totalDonations || 0} donations</span>
                          <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Calendar size={12} /> {d.lastDonationDate ? new Date(d.lastDonationDate).toLocaleDateString() : "Never"}</span>
                          {d.distance != null && (
                            <span style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--red)", fontWeight: 600 }}>
                              <Navigation size={12} /> {formatDistance(d.distance)}
                            </span>
                          )}
                        </div>
                        <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap", alignItems: "center" }}>
                          {d.isVerified && <span className="badge badge-green"><Shield size={10} /> Verified</span>}
                          <span className={`badge ${canDonate ? "badge-green" : "badge-gray"}`}>{canDonate ? "Available" : "Not Available"}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                  <button className="btn btn-primary btn-sm" style={{ marginTop: 12, width: "100%", gap: 6 }} onClick={(e) => {
                    e.preventDefault();
                    if (!isAuthenticated) {
                      navigate("/login");
                      return;
                    }
                    setSelectedDonor(d);
                  }}>
                    <Phone size={12} /> Contact
                  </button>
                </div>
                );
              })}
            </div>

            {/* ---- Pagination ---- */}
            {totalPages > 1 && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 24 }}>
                <button className="btn btn-secondary btn-sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                  <ChevronLeft size={16} /> Prev
                </button>
                <div style={{ display: "flex", gap: 4 }}>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      style={{
                        width: 36, height: 36, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 14, fontWeight: 500, border: "none", cursor: "pointer",
                        background: p === page ? "var(--purple)" : "transparent",
                        color: p === page ? "white" : "var(--text-secondary)",
                      }}
                    >
                      {p}
                    </button>
                  ))}
                </div>
                <button className="btn btn-secondary btn-sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                  Next <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* ---- Contact Modal ---- */}
      {selectedDonor && (() => {
        const sc = getBloodGroupColor(selectedDonor.bloodGroup);
        const canDonate = isDonationCooledDown(selectedDonor.lastDonationDate);
        return (
        <div className="donor-modal-overlay" onClick={() => setSelectedDonor(null)}>
          <div className="donor-modal-backdrop" />
          <div className="donor-modal" onClick={(e) => e.stopPropagation()}>
            <button className="donor-modal-close" onClick={() => setSelectedDonor(null)}>
              <X size={16} />
            </button>

            {/* Header */}
            <div className="donor-modal-header" style={{ background: `linear-gradient(135deg, ${sc.bg || "var(--red-light)"}, ${sc.bg || "var(--red-light)"}dd)` }}>
              <div className="donor-modal-avatar" style={{ background: sc.text || "var(--red)", color: "#fff" }}>
                {selectedDonor.name?.charAt(0)?.toUpperCase()}
              </div>
              <h3 className="donor-modal-name">{selectedDonor.name}</h3>
              <div className="donor-modal-location">
                <MapPin size={12} /> {selectedDonor.area}{selectedDonor.district ? `, ${selectedDonor.district}` : ""}
              </div>
              <div className="donor-modal-blood" style={{ background: sc.bg, color: sc.text, border: `2px solid ${sc.text}22` }}>
                <Droplets size={13} /> {selectedDonor.bloodGroup}
              </div>
            </div>

            {/* Body */}
            <div className="donor-modal-body">
              <div className="donor-modal-stats">
                <div className="donor-modal-stat">
                  <div className="donor-modal-stat-icon" style={{ background: "var(--red-light)", color: "var(--red)" }}><Droplets /></div>
                  <div className="donor-modal-stat-value">{selectedDonor.totalDonations || 0}</div>
                  <div className="donor-modal-stat-label">Donations</div>
                </div>
                <div className="donor-modal-stat">
                  <div className="donor-modal-stat-icon" style={{ background: "var(--purple-light)", color: "var(--purple)" }}><Calendar /></div>
                  <div className="donor-modal-stat-value" style={{ fontSize: 12 }}>{selectedDonor.lastDonationDate ? new Date(selectedDonor.lastDonationDate).toLocaleDateString("en-BD", { day: "numeric", month: "short" }) : "Never"}</div>
                  <div className="donor-modal-stat-label">Last Donation</div>
                </div>
                <div className="donor-modal-stat">
                  <div className="donor-modal-stat-icon" style={{ background: canDonate ? "var(--green-light)" : "var(--yellow-light)", color: canDonate ? "var(--green)" : "var(--yellow)" }}>
                    {canDonate ? <CheckCircle /> : <Clock />}
                  </div>
                  <div className="donor-modal-stat-value" style={{ fontSize: 11, color: canDonate ? "var(--green)" : "var(--yellow)" }}>{canDonate ? "Available" : "Cooldown"}</div>
                  <div className="donor-modal-stat-label">Status</div>
                </div>
              </div>

              <div className="donor-modal-phone-row">
                <div className="donor-modal-phone-info">
                  <Phone size={16} color="var(--red)" />
                  <div>
                    <div className="donor-modal-phone-label">Phone</div>
                    <a href={`tel:${selectedDonor.phone}`} className="donor-modal-phone-number">{selectedDonor.phone || "Not provided"}</a>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="donor-modal-actions">
              <a href={`tel:${selectedDonor.phone}`} className="btn btn-primary donor-modal-call">
                <Phone size={14} /> Call Now
              </a>
              <Link to={`/donors/${selectedDonor._id}`} onClick={() => setSelectedDonor(null)} className="btn btn-secondary donor-modal-view">
                View Profile
              </Link>
            </div>
          </div>
        </div>
        );
      })()}

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
