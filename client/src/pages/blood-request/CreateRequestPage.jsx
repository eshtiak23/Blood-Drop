/**
 * CreateRequestPage - Form for creating a new blood request.
 * Collects patient details, location (district → area cascading dropdown),
 * urgency, and contact info. Submits via localStore and redirects to the list.
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BLOOD_GROUPS, DISTRICTS, AREAS, URGENCY } from "../../data/constants";
import { useAuth } from "../../context/AuthContext";
import { createRequest } from "../../services/localStore";
import { ArrowLeft } from "lucide-react";

export default function CreateRequestPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ patientName: "", hospital: "", patientBloodGroup: "", unitsRequired: 1, urgency: "normal", dateNeeded: "", contactNumber: user?.phone || "", district: "", area: "", description: "" });
  const [error, setError] = useState("");
  // Cascading dropdown: areas list updates based on the selected district
  const areas = form.district ? (AREAS[form.district] || []) : [];
  const set = (k, v) => setForm({ ...form, [k]: v });

  const handleSubmit = (e) => {
    e.preventDefault(); setError("");
    try {
      createRequest(form, user);
      navigate("/requests");
    } catch (err) { setError(err.message); }
  };

  return (
    <div className="container" style={{ padding: "32px 20px", maxWidth: 640 }}>
      <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm" style={{ marginBottom: 16 }}><ArrowLeft size={16} /> Back</button>
      <h1 style={{ fontSize: 24, fontWeight: 800 }}>Create Blood Request</h1>
      <p style={{ color: "var(--text-secondary)", marginTop: 4, marginBottom: 20 }}>Fill out the form below to request blood</p>

      <div className="card"><div className="card-body">
        <form onSubmit={handleSubmit}>
          {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}
          <div className="grid grid-2" style={{ marginBottom: 16 }}>
            <div className="input-group"><label>Patient Name</label><input className="input" value={form.patientName} onChange={(e) => set("patientName", e.target.value)} required /></div>
            <div className="input-group"><label>Hospital</label><input className="input" value={form.hospital} onChange={(e) => set("hospital", e.target.value)} required /></div>
          </div>
          <div className="grid grid-2" style={{ marginBottom: 16 }}>
            <div className="input-group">
              <label>Blood Group Needed</label>
              <select className="input" value={form.patientBloodGroup} onChange={(e) => set("patientBloodGroup", e.target.value)} required>
                <option value="">Select</option>{BLOOD_GROUPS.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div className="input-group"><label>Units Required</label><input className="input" type="number" min={1} max={10} value={form.unitsRequired} onChange={(e) => set("unitsRequired", parseInt(e.target.value))} required /></div>
          </div>
          <div className="grid grid-2" style={{ marginBottom: 16 }}>
            <div className="input-group">
              <label>Urgency</label>
              <select className="input" value={form.urgency} onChange={(e) => set("urgency", e.target.value)}>
                {URGENCY.map((u) => <option key={u.value} value={u.value}>{u.label}</option>)}
              </select>
            </div>
            <div className="input-group"><label>Date Needed</label><input className="input" type="date" value={form.dateNeeded} onChange={(e) => set("dateNeeded", e.target.value)} required /></div>
          </div>
          <div className="grid grid-2" style={{ marginBottom: 16 }}>
            {/* Cascading district → area: selecting a district populates its areas */}
            <div className="input-group">
              <label>District</label>
              <select className="input" value={form.district} onChange={(e) => { set("district", e.target.value); set("area", ""); }} required>
                <option value="">Select</option>{DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="input-group">
              <label>Area</label>
              {/* Disabled until a district is selected to prevent invalid selections */}
              <select className="input" value={form.area} onChange={(e) => set("area", e.target.value)} disabled={!form.district} required>
                <option value="">{form.district ? "Select" : "Select district first"}</option>{areas.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
          </div>
          <div className="input-group" style={{ marginBottom: 16 }}>
            <label>Contact Number</label>
            <input className="input" value={form.contactNumber} onChange={(e) => set("contactNumber", e.target.value)} required />
          </div>
          <div className="input-group" style={{ marginBottom: 20 }}>
            <label>Description (Optional)</label>
            <textarea className="input" value={form.description} onChange={(e) => set("description", e.target.value)} rows={3} />
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Create Request</button>
          </div>
        </form>
      </div></div>
    </div>
  );
}
