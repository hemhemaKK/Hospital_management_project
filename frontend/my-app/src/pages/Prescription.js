// src/pages/Prescription.js
import { useEffect, useState } from "react";
import axios from "axios";

const BASE_URL = "http://localhost:5000";

export default function Prescription() {
  const token = localStorage.getItem("token");

  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [loading, setLoading] = useState(false);

  // Prescription form state
  const [prescriptions, setPrescriptions] = useState([
    { medicineName: "", dosage: "", duration: "", notes: "" },
  ]);

  // Load doctor's appointments
  useEffect(() => {
    if (!token) return;
    const fetchAppointments = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${BASE_URL}/api/appointment/doctor`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAppointments(res.data || []);
      } catch (err) {
        console.error("Error fetching appointments:", err);
        alert("Failed to load appointments");
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, [token]);

  // Handle adding new prescription row
  const addPrescription = () => {
    setPrescriptions([...prescriptions, { medicineName: "", dosage: "", duration: "", notes: "" }]);
  };

  // Handle input change
  const handleChange = (index, field, value) => {
    const newPrescriptions = [...prescriptions];
    newPrescriptions[index][field] = value;
    setPrescriptions(newPrescriptions);
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAppointment) return alert("Select an appointment first");

    try {
      const res = await axios.put(
        `${BASE_URL}/api/appointment/prescription/${selectedAppointment._id}`,
        { prescriptions },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(res.data.message || "Prescriptions saved");
      setPrescriptions([{ medicineName: "", dosage: "", duration: "", notes: "" }]);
    } catch (err) {
      console.error("Saving prescription failed:", err);
      alert(err.response?.data?.message || "Failed to save prescriptions");
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: "40px auto", padding: 20, background: "#fff", borderRadius: 10, boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
      <h2 style={{ textAlign: "center", marginBottom: 18 }}>Prescription Management</h2>

      {/* Appointment Selection */}
      <div style={{ marginBottom: 20 }}>
        <label>Select Appointment:</label>
        <select
          style={{ padding: 10, borderRadius: 6, width: "100%", marginTop: 8 }}
          value={selectedAppointment?._id || ""}
          onChange={(e) => {
            const appt = appointments.find((a) => a._id === e.target.value);
            setSelectedAppointment(appt || null);
          }}
        >
          <option value="">-- Select Appointment --</option>
          {appointments.map((a) => (
            <option key={a._id} value={a._id}>
              {a.user?.name || `${a.user?.firstName} ${a.user?.lastName}`} | {a.date} {a.time}
            </option>
          ))}
        </select>
      </div>

      {/* Prescription Form */}
      {selectedAppointment && (
        <form onSubmit={handleSubmit}>
          {prescriptions.map((p, idx) => (
            <div key={idx} style={{ display: "flex", gap: 10, marginBottom: 10 }}>
              <input
                type="text"
                placeholder="Medicine Name"
                value={p.medicineName}
                onChange={(e) => handleChange(idx, "medicineName", e.target.value)}
                required
                style={{ flex: 2, padding: 8, borderRadius: 6, border: "1px solid #ccc" }}
              />
              <input
                type="text"
                placeholder="Dosage"
                value={p.dosage}
                onChange={(e) => handleChange(idx, "dosage", e.target.value)}
                required
                style={{ flex: 1, padding: 8, borderRadius: 6, border: "1px solid #ccc" }}
              />
              <input
                type="text"
                placeholder="Duration"
                value={p.duration}
                onChange={(e) => handleChange(idx, "duration", e.target.value)}
                required
                style={{ flex: 1, padding: 8, borderRadius: 6, border: "1px solid #ccc" }}
              />
              <input
                type="text"
                placeholder="Notes"
                value={p.notes}
                onChange={(e) => handleChange(idx, "notes", e.target.value)}
                style={{ flex: 2, padding: 8, borderRadius: 6, border: "1px solid #ccc" }}
              />
            </div>
          ))}

          <button type="button" onClick={addPrescription} style={{ marginBottom: 12, padding: 10, borderRadius: 6, border: "none", background: "#1976d2", color: "#fff", cursor: "pointer" }}>
            + Add Another Medicine
          </button>

          <br />

          <button type="submit" style={{ padding: 12, borderRadius: 6, border: "none", background: "#27ae60", color: "#fff", fontWeight: "600", cursor: "pointer" }}>
            Save Prescription
          </button>
        </form>
      )}

      {/* Loading / Empty */}
      {loading && <p>Loading appointments...</p>}
      {!loading && appointments.length === 0 && <p>No appointments assigned.</p>}
    </div>
  );
}
