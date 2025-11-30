import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const BASE_URL = "http://localhost:5000/api";

export default function ReceptionistDashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [appointments, setAppointments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeSection, setActiveSection] = useState("Appointments");
  const [loading, setLoading] = useState(true);

  /* -----------------------------------------------
        LOAD ALL APPOINTMENTS
  ------------------------------------------------ */
  useEffect(() => {
    if (!token) return;
    fetchAllAppointments();
  }, []);

  const fetchAllAppointments = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/appointment/receptionist/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setAppointments(res.data || []);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching appointments:", err);
      alert("Unable to load appointments");
    }
  };

  /* -----------------------------------------------
        SEARCH FILTER
  ------------------------------------------------ */
  const filteredAppointments = appointments.filter((a) => {
    const term = searchTerm.toLowerCase();

    return (
      a.user?.name?.toLowerCase().includes(term) ||
      a.doctor?.name?.toLowerCase().includes(term) ||
      a.category?.name?.toLowerCase().includes(term) ||
      a.date?.includes(term)
    );
  });

  /* -----------------------------------------------
        LOGOUT
  ------------------------------------------------ */
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  /* -----------------------------------------------
        APPOINTMENT TABLE
  ------------------------------------------------ */
  const renderAppointmentTable = () => (
    <div>
      <h2>All Appointments</h2>

      <input
        type="text"
        placeholder="Search patient, doctor, category, date..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{
          width: "100%",
          padding: "10px",
          marginBottom: "15px",
          borderRadius: "6px",
          border: "1px solid #aaa",
        }}
      />

      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>Patient</th>
            <th style={thStyle}>Doctor</th>
            <th style={thStyle}>Category</th>
            <th style={thStyle}>Date</th>
            <th style={thStyle}>Time</th>
            <th style={thStyle}>Status</th>
          </tr>
        </thead>

        <tbody>
          {filteredAppointments.length > 0 ? (
            filteredAppointments.map((a, i) => (
              <tr key={a._id} style={trStyle(i)}>
                <td style={tdStyle}>{a.user?.name || "Unknown"}</td>
                <td style={tdStyle}>{a.doctor?.name || "Unknown"}</td>
                <td style={tdStyle}>{a.category?.name || "N/A"}</td>
                <td style={tdStyle}>{a.date}</td>
                <td style={tdStyle}>{a.time}</td>

                <td style={tdStyle}>
                  <span
                    style={{
                      padding: "5px 10px",
                      borderRadius: "6px",
                      fontWeight: "bold",
                      color: "#fff",
                      background:
                        a.status === "PENDING"
                          ? "orange"
                          : a.status === "DOCTOR_ACCEPTED"
                          ? "green"
                          : a.status === "REJECTED"
                          ? "red"
                          : "#555",
                    }}
                  >
                    {a.status}
                  </span>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6} style={{ padding: "20px", textAlign: "center" }}>
                No appointments found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  if (loading) return <p>Loading...</p>;

  /* -----------------------------------------------
        MAIN UI
  ------------------------------------------------ */
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <div style={sidebarStyle}>
        <h2 style={{ color: "#fff", textAlign: "center" }}>Receptionist</h2>

        <div>
          <div
            style={menuItemStyle(activeSection === "Appointments")}
            onClick={() => setActiveSection("Appointments")}
          >
            Appointments
          </div>

          <div
            style={menuItemStyle(false)}
            onClick={() => alert("More features coming soon!")}
          >
            Patients
          </div>

          <div
            style={menuItemStyle(false)}
            onClick={() => alert("More features coming soon!")}
          >
            Doctors
          </div>
        </div>

        <div style={{ padding: "1rem" }}>
          <div style={logoutStyle} onClick={handleLogout}>
            Logout
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, marginLeft: "250px", padding: "2rem" }}>
        {activeSection === "Appointments" && renderAppointmentTable()}
      </div>
    </div>
  );
}

/* -----------------------------------------------
      STYLES
------------------------------------------------ */

const sidebarStyle = {
  width: "250px",
  background: "#111",
  height: "100vh",
  position: "fixed",
  padding: "1rem",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
};

const menuItemStyle = (active) => ({
  padding: "12px",
  background: active ? "#333" : "transparent",
  color: active ? "#4CAF50" : "#fff",
  margin: "10px 0",
  borderRadius: "6px",
  cursor: "pointer",
});

const logoutStyle = {
  padding: "12px",
  background: "#ff4d4d",
  borderRadius: "6px",
  textAlign: "center",
  color: "#fff",
  cursor: "pointer",
};

const tableStyle = {
  width: "100%",
  background: "#fff",
  borderRadius: "10px",
};

const thStyle = {
  background: "#000",
  color: "white",
  padding: "12px",
};

const tdStyle = {
  padding: "12px",
};

const trStyle = (i) => ({
  background: i % 2 === 0 ? "#f2f2f2" : "#fff",
});
