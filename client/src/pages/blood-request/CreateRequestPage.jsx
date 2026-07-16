/**
 * CreateRequestPage - Form for creating a new blood request.
 * Collects patient details, location (district → area cascading dropdown),
 * urgency, and contact info. Submits via API and redirects to the list.
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BLOOD_GROUPS, DISTRICTS, AREAS, URGENCY } from "../../data/constants";
import { useAuth } from "../../context/AuthContext";
import { createRequest } from "../../services/localStore";
import { ArrowLeft, Loader2 } from "lucide-react";
import { validateRequestForm } from "../../utils/validate";
import toast from "react-hot-toast";

export default function CreateRequestPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ patientName: "", hospital: "", patientBloodGroup: "", unitsRequired: 1, urgency: "normal", dateNeeded: "", contactNumber: user?.phone || "", district: "", area: "", description: "" });
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const areas = form.district ? (AREAS[form.district] || []) : [];
  const set = (k, v) => setForm({ ...form, [k]: v });

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(""); setFieldErrors({});

    const { valid, errors } = validateRequestForm(form);
    if (!valid) {
      setFieldErrors(errors);
      const firstErr = Object.values(errors)[0];
      setError(firstErr);
      toast.error(firstErr);
      return;
    }

    setSubmitting(true);
    try {
      await createRequest(form);
      toast.success("Request created successfully!");
      navigate("/requests");
    } catch (err) { setError(err.response?.data?.error || err.message); toast.error(err.response?.data?.error || err.message); }
    finally { setSubmitting(false); }
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
            <div className="input-group"><label>Patient Name <span style={{ color: "var(--red)" }}>*</span></label><input className="input" value={form.patientName} onChange={(e) => set("patientName", e.target.value)} required />
              {fieldErrors.patientName && <div style={{ color: "#EF4444", fontSize: 12, marginTop: 4 }}>{fieldErrors.patientName}</div>}
            </div>
            <div className="input-group"><label>Hospital <span style={{ color: "var(--red)" }}>*</span></label><input className="input" value={form.hospital} onChange={(e) => set("hospital", e.target.value)} required />
              {fieldErrors.hospital && <div style={{ color: "#EF4444", fontSize: 12, marginTop: 4 }}>{fieldErrors.hospital}</div>}
            </div>
          </div>
          <div className="grid grid-2" style={{ marginBottom: 16 }}>
            <div className="input-group">
              <label>Blood Group Needed <span style={{ color: "var(--red)" }}>*</span></label>
              <select className="input" value={form.patientBloodGroup} onChange={(e) => set("patientBloodGroup", e.target.value)} required>
                <option value="">Select</option>{BLOOD_GROUPS.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
              {fieldErrors.patientBloodGroup && <div style={{ color: "#EF4444", fontSize: 12, marginTop: 4 }}>{fieldErrors.patientBloodGroup}</div>}
            </div>
            <div className="input-group"><label>Units Required <span style={{ color: "var(--red)" }}>*</span></label><input className="input" type="number" min={1} max={10} value={form.unitsRequired} onChange={(e) => { const v = parseInt(e.target.value, 10); set("unitsRequired", isNaN(v) ? 1 : v); }} required />
              {fieldErrors.unitsRequired && <div style={{ color: "#EF4444", fontSize: 12, marginTop: 4 }}>{fieldErrors.unitsRequired}</div>}
            </div>
          </div>
          <div className="grid grid-2" style={{ marginBottom: 16 }}>
            <div className="input-group">
              <label>Urgency</label>
              <select className="input" value={form.urgency} onChange={(e) => set("urgency", e.target.value)}>
                {URGENCY.map((u) => <option key={u.value} value={u.value}>{u.label}</option>)}
              </select>
            </div>
            <div className="input-group"><label>Date Needed <span style={{ color: "var(--red)" }}>*</span></label><input className="input" type="date" value={form.dateNeeded} onChange={(e) => set("dateNeeded", e.target.value)} required />
              {fieldErrors.dateNeeded && <div style={{ color: "#EF4444", fontSize: 12, marginTop: 4 }}>{fieldErrors.dateNeeded}</div>}
            </div>
          </div>
          <div className="grid grid-2" style={{ marginBottom: 16 }}>
            <div className="input-group">
              <label>District <span style={{ color: "var(--red)" }}>*</span></label>
              <select className="input" value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value, area: "" })} required>
                <option value="">Select</option>{DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
              {fieldErrors.district && <div style={{ color: "#EF4444", fontSize: 12, marginTop: 4 }}>{fieldErrors.district}</div>}
            </div>
            <div className="input-group">
              <label>Area <span style={{ color: "var(--red)" }}>*</span></label>
              <select className="input" value={form.area} onChange={(e) => set("area", e.target.value)} disabled={!form.district} required>
                <option value="">{form.district ? "Select" : "Select district first"}</option>{areas.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
              {fieldErrors.area && <div style={{ color: "#EF4444", fontSize: 12, marginTop: 4 }}>{fieldErrors.area}</div>}
            </div>
          </div>
          <div className="input-group" style={{ marginBottom: 16 }}>
            <label>Contact Number <span style={{ color: "var(--red)" }}>*</span></label>
            <input className="input" type="tel" placeholder="01XXXXXXXXX" value={form.contactNumber} onChange={(e) => set("contactNumber", e.target.value)} required />
            {fieldErrors.contactNumber && <div style={{ color: "#EF4444", fontSize: 12, marginTop: 4 }}>{fieldErrors.contactNumber}</div>}
          </div>
          <div className="input-group" style={{ marginBottom: 20 }}>
            <label>Description (Optional)</label>
            <textarea className="input" value={form.description} onChange={(e) => set("description", e.target.value)} rows={3} />
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)} disabled={submitting}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={submitting}>
              {submitting ? <><Loader2 size={16} className="animate-pulse" /> Creating...</> : "Create Request"}
            </button>
          </div>
        </form>
      </div></div>
    </div>
  );
}
