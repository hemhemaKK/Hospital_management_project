// src/pages/Prescription.js
import { useEffect, useState } from "react";
import axios from "axios";

const BASE_URL = "https://hospital-management-project-gf55.onrender.com";

export default function Prescription() {
  const token = localStorage.getItem("token");

  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [loading, setLoading] = useState(false);

  // Prescription form state
  const [prescriptions, setPrescriptions] = useState([
    { medicineName: "", dosage: "", duration: "", notes: "" },
  ]);

  /* ============================================================
     LOAD DOCTOR APPOINTMENTS
  ============================================================ */
  useEffect(() => {
    if (!token) return;

    const fetchAppointments = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${BASE_URL}/api/appointment/appointments`, {
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

  /* ============================================================
     FORM HANDLERS
  ============================================================ */
  const addPrescription = () => {
    setPrescriptions([
      ...prescriptions,
      { medicineName: "", dosage: "", duration: "", notes: "" },
    ]);
  };

  const handleChange = (index, field, value) => {
    const updated = [...prescriptions];
    updated[index][field] = value;
    setPrescriptions(updated);
  };

  /* ============================================================
     SUBMIT PRESCRIPTION
  ============================================================ */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAppointment)
      return alert("Select an appointment first");

    try {
      const res = await axios.put(
        `${BASE_URL}/api/appointment/prescription/${selectedAppointment._id}`,
        { prescriptions },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(res.data.message || "Prescriptions saved");

      // RESET FORM
      setPrescriptions([
        { medicineName: "", dosage: "", duration: "", notes: "" },
      ]);

      // RELOAD APPOINTMENTS
      const refresh = await axios.get(
        `${BASE_URL}/api/appointment/appointments`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setAppointments(refresh.data);

      const refreshedAppt = refresh.data.find(
        (a) => a._id === selectedAppointment._id
      );
      setSelectedAppointment(refreshedAppt);

      console.log("Updated Appointment:", refreshedAppt);
    } catch (err) {
      console.error("Saving prescription failed:", err);
      alert(err.response?.data?.message || "Failed to save prescriptions");
    }
  };

  return (
    <div
      style={{
        maxWidth: 900,
        margin: "40px auto",
        padding: 20,
        background: "#fff",
        borderRadius: 10,
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: 18 }}>
        Prescription Management
      </h2>

      {/* ============================================================
          SELECT APPOINTMENT
      ============================================================ */}
      <div style={{ marginBottom: 20 }}>
        <label>Select Appointment:</label>
        <select
          style={{
            padding: 10,
            borderRadius: 6,
            width: "100%",
            marginTop: 8,
          }}
          value={selectedAppointment?._id || ""}
          onChange={(e) => {
            const appt = appointments.find(
              (a) => a._id === e.target.value
            );
            setSelectedAppointment(
              appt ? JSON.parse(JSON.stringify(appt)) : null
            );
          }}
        >
          <option value="">-- Select Appointment --</option>
          {appointments.map((a) => (
            <option key={a._id} value={a._id}>
              {a.user?.name} | {a.date} {a.time}
            </option>
          ))}
        </select>
      </div>

      {/* ============================================================
          PRESCRIPTION FORM
      ============================================================ */}
      {selectedAppointment && (
        <form onSubmit={handleSubmit}>
          {prescriptions.map((p, idx) => (
            <div
              key={idx}
              style={{
                display: "flex",
                gap: 10,
                marginBottom: 10,
              }}
            >
              <input
                type="text"
                placeholder="Medicine Name"
                value={p.medicineName}
                onChange={(e) =>
                  handleChange(idx, "medicineName", e.target.value)
                }
                required
                style={{
                  flex: 2,
                  padding: 8,
                  borderRadius: 6,
                  border: "1px solid #ccc",
                }}
              />
              <input
                type="text"
                placeholder="Dosage"
                value={p.dosage}
                onChange={(e) =>
                  handleChange(idx, "dosage", e.target.value)
                }
                required
                style={{
                  flex: 1,
                  padding: 8,
                  borderRadius: 6,
                  border: "1px solid #ccc",
                }}
              />
              <input
                type="text"
                placeholder="Duration"
                value={p.duration}
                onChange={(e) =>
                  handleChange(idx, "duration", e.target.value)
                }
                required
                style={{
                  flex: 1,
                  padding: 8,
                  borderRadius: 6,
                  border: "1px solid #ccc",
                }}
              />
              <input
                type="text"
                placeholder="Notes"
                value={p.notes}
                onChange={(e) =>
                  handleChange(idx, "notes", e.target.value)
                }
                style={{
                  flex: 2,
                  padding: 8,
                  borderRadius: 6,
                  border: "1px solid #ccc",
                }}
              />
            </div>
          ))}

          <button
            type="button"
            onClick={addPrescription}
            style={{
              marginBottom: 12,
              padding: 10,
              borderRadius: 6,
              border: "none",
              background: "#1976d2",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            + Add Another Medicine
          </button>

          <br />

          <button
            type="submit"
            style={{
              padding: 12,
              borderRadius: 6,
              border: "none",
              background: "#27ae60",
              color: "#fff",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            Save Prescription
          </button>
        </form>
      )}

      {/* ============================================================
          EXISTING PRESCRIPTIONS (FROM DOCTOR + NURSE)
      ============================================================ */}
      {selectedAppointment?.prescription?.length > 0 && (
        <div
          style={{
            marginTop: 30,
            background: "#f9fafb",
            padding: 20,
            borderRadius: 10,
            border: "1px solid #ddd",
          }}
        >
          <h3 style={{ marginBottom: 10 }}>Existing Prescriptions</h3>

          {selectedAppointment.prescription.map((p, i) => (
            <div
              key={i}
              style={{
                marginBottom: 12,
                padding: 12,
                borderRadius: 8,
                background: "#fff",
                border: "1px solid #eee",
                boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
              }}
            >
              <p>
                <b>Medicine:</b> {p.medicineName}
              </p>
              <p>
                <b>Dosage:</b> {p.dosage}
              </p>
              <p>
                <b>Duration:</b> {p.duration}
              </p>
              <p>
                <b>Notes:</b> {p.notes || "---"}
              </p>

              <p>
                <b>Prescribed By:</b>{" "}
                {p.prescribedBy === selectedAppointment?.doctor?._id
                  ? "Doctor"
                  : "Nurse"}
              </p>

              <p style={{ fontSize: 12, color: "#888" }}>
                {new Date(p.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Loading / Empty */}
      {loading && <p>Loading appointments...</p>}
      {!loading && appointments.length === 0 && (
        <p>No appointments assigned.</p>
      )}
    </div>
  );
}
