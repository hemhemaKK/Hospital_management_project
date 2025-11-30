// src/pages/Prescription.js
import { useEffect, useState } from "react";
import axios from "axios";

const BASE_URL = "https://hospital-management-project-gf55.onrender.com";

export default function Prescription() {
  const token = localStorage.getItem("token");

  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [loading, setLoading] = useState(false);

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
        Prescription Details
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
            const appt = appointments.find((a) => a._id === e.target.value);
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
          ONLY DISPLAY EXISTING PRESCRIPTIONS
      ============================================================ */}
      {selectedAppointment && (
        <>
          <h3 style={{ marginTop: 20 }}>
            Patient: {selectedAppointment.user?.name}
          </h3>
          <p>
            <b>Date:</b> {selectedAppointment.date} |{" "}
            <b>Time:</b> {selectedAppointment.time}
          </p>

          {selectedAppointment.prescription?.length > 0 ? (
            <div
              style={{
                marginTop: 20,
                background: "#f9fafb",
                padding: 20,
                borderRadius: 10,
                border: "1px solid #ddd",
              }}
            >
              <h3 style={{ marginBottom: 10 }}>Prescription List</h3>

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
          ) : (
            <p style={{ marginTop: 20, color: "#777" }}>
              No prescriptions added for this appointment.
            </p>
          )}
        </>
      )}

      {/* Loading / Empty */}
      {loading && <p>Loading appointments...</p>}
      {!loading && appointments.length === 0 && (
        <p>No appointments assigned.</p>
      )}
    </div>
  );
}
