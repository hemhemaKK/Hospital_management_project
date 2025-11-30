import { useEffect, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode"; // ✅ Correct import

const BASE_URL = "http://localhost:5000";

export default function AppointmentStatus() {
  const token = localStorage.getItem("token");
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);

  let userId;
  try {
    if (token) {
      const decoded = jwtDecode(token); // decode token
      userId = decoded.id || decoded._id; // adjust depending on your token payload
    }
  } catch (err) {
    console.error("Token decode error:", err);
  }

  /* ---------------------- Load Appointments ---------------------- */
  const loadAppointments = async () => {
    if (!token || !userId) return;

    setLoading(true);
    try {
      const res = await axios.get(
        `${BASE_URL}/api/appointment/user/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAppointments(res.data || []);
    } catch (err) {
      console.error("Error loading appointments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, [userId]);

  /* ---------------------- Cancel Appointment ---------------------- */
  const handleCancel = async (appointmentId) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?"))
      return;

    try {
      await axios.delete(
        `${BASE_URL}/api/appointment/${userId}/${appointmentId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setAppointments((prev) =>
        prev.filter((a) => a._id !== appointmentId)
      );

      alert("Appointment cancelled");
    } catch (err) {
      console.error("Cancel failed:", err);
      alert("Could not cancel appointment");
    }
  };

  /* ---------------------------- UI ---------------------------- */
  return (
    <div style={{ marginTop: 20 }}>
      <h3>My Appointments</h3>

      {loading ? (
        <p>Loading appointments...</p>
      ) : appointments.length === 0 ? (
        <p>No appointments found.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#111", color: "#fff" }}>
              <th style={thStyle}>Doctor</th>
              <th style={thStyle}>Category</th>
              <th style={thStyle}>Date</th>
              <th style={thStyle}>Time</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Action</th>
            </tr>
          </thead>

          <tbody>
            {appointments.map((a) => (
              <tr key={a._id} style={{ borderBottom: "1px solid #eee" }}>
                <td style={tdStyle}>
                  {a.doctor?.name ||
                    `${a.doctor?.firstName || ""} ${
                      a.doctor?.lastName || ""
                    }`.trim()}
                </td>

                <td style={tdStyle}>{a.category?.name || "-"}</td>

                <td style={tdStyle}>{a.date}</td>
                <td style={tdStyle}>{a.time}</td>

                <td style={tdStyle}>{a.status}</td>

                <td style={tdStyle}>
                  {a.status === "PENDING" || a.status === "booked" ? (
                    <button
                      onClick={() => handleCancel(a._id)}
                      style={cancelBtn}
                    >
                      Cancel
                    </button>
                  ) : (
                    "-"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

/* ------------------------ Styles ------------------------ */
const thStyle = { padding: 10, textAlign: "left", fontSize: 14 };
const tdStyle = { padding: 10, fontSize: 13 };

const cancelBtn = {
  padding: "6px 8px",
  borderRadius: 6,
  border: "none",
  background: "#e74c3c",
  color: "#fff",
  cursor: "pointer",
};
