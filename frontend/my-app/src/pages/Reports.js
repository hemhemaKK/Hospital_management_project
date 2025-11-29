import { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend, ResponsiveContainer
} from "recharts";

const BASE_URL = "http://localhost:5000";
const COLORS = ["#1976d2", "#2ecc71", "#e74c3c"]; // blue, green, red

export default function Report() {
  const token = localStorage.getItem("token");
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(false);

  const [filterType, setFilterType] = useState("all"); // all, today, week, month

  // ---------- Load logged-in user's appointments ----------
  const loadAppointments = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const profileRes = await axios.get(`${BASE_URL}/api/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const userId = profileRes.data.user._id;

      const res = await axios.get(`${BASE_URL}/api/appointment/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAppointments(res.data || []);
      setFilteredAppointments(res.data || []);
    } catch (err) {
      console.error("Error loading appointments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  // ---------- Filter appointments by date ----------
  useEffect(() => {
    if (filterType === "all") {
      setFilteredAppointments(appointments);
      return;
    }

    const now = new Date();
    const filtered = appointments.filter((a) => {
      const appDate = new Date(a.date);
      if (filterType === "today") {
        return (
          appDate.getFullYear() === now.getFullYear() &&
          appDate.getMonth() === now.getMonth() &&
          appDate.getDate() === now.getDate()
        );
      } else if (filterType === "week") {
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay()); // Sunday
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6); // Saturday
        return appDate >= weekStart && appDate <= weekEnd;
      } else if (filterType === "month") {
        return (
          appDate.getFullYear() === now.getFullYear() &&
          appDate.getMonth() === now.getMonth()
        );
      }
      return true;
    });

    setFilteredAppointments(filtered);
  }, [filterType, appointments]);

  // ---------- Compute summary ----------
  const totalAppointments = filteredAppointments.length;
  const booked = filteredAppointments.filter(a => a.status === "booked").length;
  const completed = filteredAppointments.filter(a => a.status === "completed").length;
  const canceled = filteredAppointments.filter(a => a.status === "canceled").length;

  // ---------- Bar chart: appointments per category ----------
  const appointmentsByCategory = filteredAppointments.reduce((acc, a) => {
    const name = a.category?.name || "Uncategorized";
    acc[name] = (acc[name] || 0) + 1;
    return acc;
  }, {});
  const barData = Object.keys(appointmentsByCategory).map(cat => ({
    category: cat,
    count: appointmentsByCategory[cat],
  }));

  // ---------- Pie chart: status distribution ----------
  const pieData = [
    { name: "Booked", value: booked },
    { name: "Completed", value: completed },
    { name: "Canceled", value: canceled },
  ];

  return (
    <div style={{ maxWidth: 1000, margin: "40px auto", padding: 20, background: "#fff", borderRadius: 10, boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
      <h2 style={{ textAlign: "center", marginBottom: 18 }}>My Appointments Report</h2>

      {/* Date filter */}
      <div style={{ marginBottom: 20, display: "flex", gap: 12, justifyContent: "center" }}>
        {["all", "today", "week", "month"].map(ft => (
          <button
            key={ft}
            onClick={() => setFilterType(ft)}
            style={{
              padding: "8px 16px",
              borderRadius: 6,
              border: filterType === ft ? "2px solid #1976d2" : "1px solid #ccc",
              background: filterType === ft ? "#e8f0ff" : "#fff",
              cursor: "pointer"
            }}
          >
            {ft.charAt(0).toUpperCase() + ft.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          {/* Summary cards */}
          <div style={{ display: "flex", gap: 20, marginBottom: 20 }}>
            {[
              { title: "Total", value: totalAppointments },
              { title: "Booked", value: booked },
              { title: "Completed", value: completed },
              { title: "Canceled", value: canceled },
            ].map((card) => (
              <div key={card.title} style={cardStyle}>
                <h4>{card.title}</h4>
                <p>{card.value}</p>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div style={{ display: "flex", gap: 40, flexWrap: "wrap" }}>
            {/* Bar chart */}
            <div style={{ flex: 1, minWidth: 300, height: 300 }}>
              <h4>Appointments per Category</h4>
              {barData.length === 0 ? <p>No data</p> : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#1976d2" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Pie chart */}
            <div style={{ flex: 1, minWidth: 300, height: 300 }}>
              <h4>Status Distribution</h4>
              {totalAppointments === 0 ? <p>No data</p> : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend verticalAlign="bottom" />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

const cardStyle = {
  padding: 20,
  borderRadius: 8,
  background: "#f5f5f5",
  textAlign: "center",
  flex: 1,
};
