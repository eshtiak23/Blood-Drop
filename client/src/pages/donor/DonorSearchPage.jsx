/**
 * DonorSearchPage — Main donor search interface.
 * Allows users to find blood donors by blood group, district/area, or proximity
 * using geolocation. Features collapsible filters, paginated results, and a
 * contact modal for reaching out to donors.
 */
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { BLOOD_GROUPS, BLOOD_GROUP_COLORS, DISTRICTS, AREAS } from "../../data/constants";
import donors from "../../data/donors.json";
import { Search, MapPin, Droplets, Calendar, Shield, UserSearch, Locate, Navigation, Phone, X, User, Clock, CheckCircle, ChevronLeft, ChevronRight, SlidersHorizontal, LogIn } from "lucide-react";

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
  const [filters, setFilters] = useState({ bloodGroup: "", district: "", area: "", radius: 10 });
  const [useLocation, setUseLocation] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState("");
  const [page, setPage] = useState(1);
  const [selectedDonor, setSelectedDonor] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const areas = filters.district ? (AREAS[filters.district] || []) : [];

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
  }, [filters, useLocation, userLocation]);

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
      <p style={{ color: "var(--text-secondary)", marginTop: 4 }}>
        Showing {filteredResults.length} of {donors.length} donors
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
            <div className="grid grid-4" style={{ gap: 12, alignItems: "end" }}>
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
        {pagedResults.length === 0 ? (
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
                return (
                <div key={d.id} className="card" style={{ padding: 20, transition: "all 0.3s" }}>
                  <div style={{ display: "flex", alignItems: "start", gap: 12 }}>
                    <div className="avatar" style={{ background: getBloodGroupColor(d.bloodGroup).bg || "var(--border-light)", color: getBloodGroupColor(d.bloodGroup).text || "var(--text)" }}>
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
                          <span className="badge" style={{ background: getBloodGroupColor(d.bloodGroup).bg, color: getBloodGroupColor(d.bloodGroup).text }}>
                            {d.bloodGroup}
                          </span>
                        )}
                      </div>
                      <div style={{ display: "flex", gap: 14, marginTop: 12, fontSize: 13, color: "var(--text-secondary)", flexWrap: "wrap" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Droplets size={12} /> {d.totalDonations} donations</span>
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
                        <button className="btn btn-primary btn-sm" style={{ marginLeft: "auto", padding: "4px 12px", fontSize: 12 }} onClick={() => {
                          if (!isAuthenticated) {
                            alert("Please log in to view donor contact information.");
                            navigate("/login");
                            return;
                          }
                          setSelectedDonor(d);
                        }}>
                          <Phone size={12} /> Contact
                        </button>
                      </div>
                    </div>
                  </div>
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
      {selectedDonor && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={() => setSelectedDonor(null)}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }} />
          <div className="card animate-fadeIn" style={{ position: "relative", width: "100%", maxWidth: 420, padding: 0, overflow: "hidden" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ background: getBloodGroupColor(selectedDonor.bloodGroup).bg || "var(--border-light)", padding: "28px 24px 20px", textAlign: "center" }}>
              <button onClick={() => setSelectedDonor(null)} style={{ position: "absolute", top: 12, right: 12, background: "var(--bg-card)", border: "none", borderRadius: "50%", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <X size={16} />
              </button>
              <div className="avatar avatar-xl" style={{ background: getBloodGroupColor(selectedDonor.bloodGroup).bg || "var(--border-light)", color: getBloodGroupColor(selectedDonor.bloodGroup).text || "var(--text)", margin: "0 auto 12px", fontSize: 36, width: 72, height: 72 }}>
                {selectedDonor.name?.charAt(0)?.toUpperCase()}
              </div>
              <div style={{ fontWeight: 700, fontSize: 20 }}>{selectedDonor.name}</div>
              <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 4, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                <MapPin size={13} /> {selectedDonor.area}, {selectedDonor.district}
              </div>
              <div style={{ marginTop: 12 }}>
                <span className="badge" style={{ background: getBloodGroupColor(selectedDonor.bloodGroup).bg, color: getBloodGroupColor(selectedDonor.bloodGroup).text, fontSize: 16, padding: "6px 20px" }}>{selectedDonor.bloodGroup}</span>
              </div>
            </div>

            <div style={{ padding: 20 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 12, fontSize: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: "var(--radius-sm)", background: "var(--bg-secondary)" }}>
                  <Phone size={16} color="var(--red)" />
                  <div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Phone</div>
                    <a href={`tel:${selectedDonor.phone}`} style={{ fontWeight: 600, color: "var(--text)", textDecoration: "none" }}>{selectedDonor.phone}</a>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: "var(--radius-sm)", background: "var(--bg-secondary)" }}>
                  <User size={16} color="var(--blue)" />
                  <div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Gender</div>
                    <div style={{ fontWeight: 600, textTransform: "capitalize" }}>{selectedDonor.gender}</div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: "var(--radius-sm)", background: "var(--bg-secondary)" }}>
                  <Droplets size={16} color="var(--red)" />
                  <div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Total Donations</div>
                    <div style={{ fontWeight: 600 }}>{selectedDonor.totalDonations} times</div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: "var(--radius-sm)", background: "var(--bg-secondary)" }}>
                  <Clock size={16} color="var(--text-muted)" />
                  <div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Last Donation</div>
                    <div style={{ fontWeight: 600 }}>{selectedDonor.lastDonationDate ? new Date(selectedDonor.lastDonationDate).toLocaleDateString() : "Never donated"}</div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: "var(--radius-sm)", background: "var(--bg-secondary)" }}>
                  {(() => { const canDonate = isDonationCooledDown(selectedDonor.lastDonationDate); return (<><CheckCircle size={16} color={canDonate ? "#059669" : "var(--text-muted)"} /><div><div style={{ fontSize: 12, color: "var(--text-muted)" }}>Availability</div><div style={{ fontWeight: 600, color: canDonate ? "#059669" : "var(--text-muted)" }}>{canDonate ? "Available to donate" : "Not Available (donated within 3 months)"}</div></div></>); })()}
                </div>
              </div>

              <a href={`tel:${selectedDonor.phone}`} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", marginTop: 20, padding: "12px 0", borderRadius: "var(--radius-sm)", background: "var(--red)", color: "#fff", fontWeight: 600, fontSize: 15, textDecoration: "none", border: "none", cursor: "pointer" }}>
                <Phone size={16} /> Call Donor
              </a>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media(max-width:768px){
          .grid{grid-template-columns:1fr !important;}
          .grid-4{grid-template-columns:repeat(2,1fr) !important;}
        }
        @media(max-width:480px){
          .grid-4{grid-template-columns:1fr !important;}
        }
      `}</style>
    </div>
  );
}
