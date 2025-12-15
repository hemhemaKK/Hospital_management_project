import { useEffect, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const BASE_URL = "https://hospital-management-project-gf55.onrender.com";

export default function AppointmentStatus() {
  const token = localStorage.getItem("token");
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);

  // NEW ----------
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");

  let userId;
  try {
    if (token) {
      const decoded = jwtDecode(token);
      userId = decoded.id || decoded._id;
    }
  } catch (err) {
    console.error("Token decode error:", err);
  }

  const loadAppointments = async () => {
    if (!token || !userId) return;
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/api/appointment/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
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

  const handleCancel = async (appointmentId) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return;
    try {
      await axios.delete(`${BASE_URL}/api/appointment/${userId}/${appointmentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAppointments((prev) => prev.filter((a) => a._id !== appointmentId));
      alert("Appointment cancelled");
    } catch (err) {
      console.error("Cancel failed:", err);
      alert("Could not cancel appointment");
    }
  };

  const renderStatus = (status) => {
    let color = "#777";
    switch (status) {
      case "PENDING": color = "#f39c12"; break;
      case "DOCTOR_ACCEPTED": color = "#3498db"; break;
      case "NURSE_ASSIGNED": color = "#9b59b6"; break;
      case "NURSE_COMPLETED": color = "#1abc9c"; break;
      case "DOCTOR_COMPLETED": color = "#2ecc71"; break;
      case "REJECTED": color = "#e74c3c"; break;
    }
    return (
      <span style={{ 
        padding: "4px 8px",
        borderRadius: 4,
        backgroundColor: color,
        color: "#fff",
        fontSize: 12,
        animation: "fadeIn 0.4s ease",
      }}>
        {status.replace("_", " ")}
      </span>
    );
  };

  // Filter + Search Logic
  const filteredData = appointments.filter(a => {
    const matchesSearch =
      a.doctor?.name?.toLowerCase().includes(search.toLowerCase()) ||
      a.category?.name?.toLowerCase().includes(search.toLowerCase()) ||
      a.date?.includes(search);

    const matchesStatus =
      filterStatus === "ALL" || a.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  return (
    <div style={{ marginTop: 20 }}>
      <h3 style={{ animation: "fadeIn 0.6s ease" }}>My Appointments</h3>

      {/* SEARCH + FILTER BAR */}
      <div style={{
        display: "flex",
        gap: 15,
        marginBottom: 20,
        alignItems: "center",
        animation: "slideDown 0.5s ease",
      }}>

        <input
          placeholder="Search doctor, category, date..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            padding: "8px 12px",
            borderRadius: 6,
            border: "1px solid #ccc",
            width: 260,
            transition: "0.3s",
            boxShadow: "0 0 5px rgba(0,0,0,0.05)",
          }}
        />

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{
            padding: "8px 12px",
            borderRadius: 6,
            border: "1px solid #ccc",
            cursor: "pointer",
            transition: "0.3s",
          }}
        >
          <option value="ALL">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="DOCTOR_ACCEPTED">Doctor Accepted</option>
          <option value="NURSE_ASSIGNED">Nurse Assigned</option>
          <option value="NURSE_COMPLETED">Nurse Completed</option>
          <option value="DOCTOR_COMPLETED">Doctor Completed</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      {loading ? (
        <p>Loading appointments...</p>
      ) : filteredData.length === 0 ? (
        <p>No appointments found.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", animation: "fadeIn 0.6s ease" }}>
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
            {filteredData.map((a, index) => (
              <tr
                key={a._id}
                style={{
                  background: "#ffffffff",
                  borderBottom: "1px solid #2a1b1bff",
                  animation: `rowFade 0.4s ease ${index * 0.1}s`,
                }}
              >
                <td style={tdStyle}>{a.doctor?.name}</td>
                <td style={tdStyle}>{a.category?.name || "-"}</td>
                <td style={tdStyle}>{a.date}</td>
                <td style={tdStyle}>{a.time}</td>
                <td style={tdStyle}>{renderStatus(a.status)}</td>

                <td style={tdStyle}>
                  {["PENDING", "DOCTOR_ACCEPTED", "NURSE_ASSIGNED"].includes(a.status) ? (
                    <button
                      onClick={() => handleCancel(a._id)}
                      style={cancelBtn}
                    >
                      Cancel
                    </button>
                  ) : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* INLINE ANIMATIONS */}
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }

          @keyframes slideDown {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }

          @keyframes rowFade {
            from { opacity: 0; transform: translateX(-10px); }
            to { opacity: 1; transform: translateX(0); }
          }
        `}
      </style>
    </div>
  );
}

const thStyle = { padding: 10, textAlign: "left", fontSize: 14 };
const tdStyle = { padding: 10, fontSize: 13 };

const cancelBtn = {
  padding: "6px 12px",
  borderRadius: 6,
  border: "none",
  background: "#e74c3c",
  color: "#fff",
  cursor: "pointer",
  transition: "0.3s",
  fontWeight: "bold",
  transform: "scale(1)",
  boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
  hover: {
    transform: "scale(1.05)",
  }
};
