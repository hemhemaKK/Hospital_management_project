import { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend, ResponsiveContainer
} from "recharts";

const BASE_URL = "http://localhost:5000";
const COLORS = ["#1976d2", "#2ecc71", "#e74c3c"];

export default function Report() {
  const token = localStorage.getItem("token");
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState("all");

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

  useEffect(() => {
    if (filterType === "all") {
      setFilteredAppointments(appointments);
      return;
    }

    const now = new Date();
    const filtered = appointments.filter((a) => {
      const appDate = new Date(a.date);
      if (filterType === "today") {
        return appDate.toDateString() === now.toDateString();
      } else if (filterType === "week") {
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
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

  const totalAppointments = filteredAppointments.length;
  const booked = filteredAppointments.filter(a => a.status === "PENDING").length;
  const completed = filteredAppointments.filter(a => 
    a.status === "DOCTOR_COMPLETED" || a.status === "NURSE_COMPLETED"
  ).length;
  const canceled = filteredAppointments.filter(a => a.status === "REJECTED").length;

  const appointmentsByCategory = filteredAppointments.reduce((acc, a) => {
    const name = a.category?.name || "Uncategorized";
    acc[name] = (acc[name] || 0) + 1;
    return acc;
  }, {});

  const barData = Object.keys(appointmentsByCategory).map(cat => ({
    category: cat,
    count: appointmentsByCategory[cat],
  }));

  const pieData = [
    { name: "Booked", value: booked },
    { name: "Completed", value: completed },
    { name: "Canceled", value: canceled },
  ];

  return (
    <div style={reportContainer}>

      <h2 style={titleStyle}>My Appointments Report</h2>

      {/* Filter Buttons */}
      <div style={filterContainer}>
        {["all", "today", "week", "month"].map(ft => (
          <button
            key={ft}
            onClick={() => setFilterType(ft)}
            style={{
              ...filterButton,
              ...(filterType === ft ? activeFilterButton : {})
            }}
          >
            {ft.toUpperCase()}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ textAlign: "center" }}>Loading...</p>
      ) : (
        <>
          {/* Summary Cards */}
          <div style={summaryRow}>
            {[
              { title: "Total", value: totalAppointments, color: "#1976d2" },
              { title: "Booked", value: booked, color: "#f39c12" },
              { title: "Completed", value: completed, color: "#2ecc71" },
              { title: "Canceled", value: canceled, color: "#e74c3c" },
            ].map((card, index) => (
              <div
                key={card.title}
                style={{
                  ...summaryCard,
                  borderTop: `4px solid ${card.color}`,
                  animationDelay: `${index * 0.15}s`,
                }}
              >
                <h4>{card.title}</h4>
                <p style={{ fontSize: 20, fontWeight: "bold" }}>{card.value}</p>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div style={chartRow}>

            {/* BAR CHART */}
            <div style={chartBox}>
              <h4>Appointments per Category</h4>
              {barData.length === 0 ? (
                <p>No data available</p>
              ) : (
                <ResponsiveContainer width="100%" height="90%">
                  <BarChart data={barData}>
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#1976d2" animationDuration={900} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* PIE CHART */}
            <div style={chartBox}>
              <h4>Status Distribution</h4>
              <ResponsiveContainer width="100%" height="90%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    label
                    animationDuration={900}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend verticalAlign="bottom" height={20} />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ✨ SCREEN-FITTED, CLEANER RESPONSIVE STYLES */

const reportContainer = {
  maxWidth: 900,            // REDUCED WIDTH ✔
  margin: "30px auto",
  padding: 35,
  background: "#fff",
  borderRadius: 8,
  boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
};

const titleStyle = {
  textAlign: "center",
  marginBottom: 15,
  fontSize: 22,
  fontWeight: "bold",
};

const filterContainer = {
  marginBottom: 15,
  display: "flex",
  gap: 10,
  justifyContent: "center",
};

const filterButton = {
  padding: "6px 12px",
  borderRadius: 6,
  border: "1px solid #ccc",
  background: "#fffcfcff",
  cursor: "pointer",
  fontWeight: "bold",
  transition: "0.2s",
};

const activeFilterButton = {
  background: "#1976d2",
  color: "#fff",
  border: "2px solid #145ea8",
  transform: "scale(1.05)",
};

const summaryRow = {
  display: "flex",
  gap: 15,
  marginBottom: 20,
  flexWrap: "wrap",
};

const summaryCard = {
  padding: 15,
  borderRadius: 8,
  background: "#f7f7f7",
  textAlign: "center",
  flex: 1,
  minWidth: 120,
};

const chartRow = {
  display: "flex",
  gap: 20,
  flexWrap: "wrap",
};

const chartBox = {
  flex: 1,
  minWidth: 260,
  height: 250,        // REDUCED HEIGHT ✔
  padding: 10,
  borderRadius: 8,
  background: "#ffffffff",
  boxShadow: "0 3px 10px rgba(0,0,0,0.05)",
};
