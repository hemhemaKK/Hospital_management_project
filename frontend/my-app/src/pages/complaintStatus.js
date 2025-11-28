import React, { useState, useEffect } from "react";
import axios from "axios";

const ComplaintStatus = () => {
  const [complaints, setComplaints] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        setLoading(true);
        const res = await axios.get("http://localhost:5000/api/complaints/complaints", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setComplaints(res.data);
        setFiltered(res.data);
      } catch (err) {
        console.error("Error fetching complaints:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchComplaints();
  }, [token]);

  useEffect(() => {
    let temp = [...complaints];
    if (searchTerm) {
      temp = temp.filter(
        (c) =>
          c.problem.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.category?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.subCategory?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (statusFilter !== "All") temp = temp.filter((c) => c.status === statusFilter);
    setFiltered(temp);
  }, [searchTerm, statusFilter, complaints]);

  const downloadReport = () => {
    const headers = ["Problem", "Category", "Subcategory", "Status", "Created At"];
    const rows = filtered.map((c) => [
      c.problem,
      c.category?.name || "",
      c.subCategory?.name || "",
      c.status,
      new Date(c.createdAt).toLocaleString(),
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "complaints_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      style={{
        maxWidth: "1000px",
        margin: "40px auto",
        padding: "25px",
        fontFamily: "Inter, sans-serif",
        background: "linear-gradient(135deg, #f7f8fc 0%, #eef1f7 100%)",
        borderRadius: "16px",
        boxShadow: "0 8px 25px rgba(0,0,0,0.08)",
      }}
    >
      <h2
        style={{
          textAlign: "center",
          marginBottom: "25px",
          color: "#2d2f31",
          fontSize: "2rem",
          fontWeight: "700",
          letterSpacing: "0.5px",
        }}
      >
        My Complaints Status
      </h2>

      {/* Search & Filter Controls */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
          gap: "12px",
        }}
      >
        <input
          type="text"
          placeholder="Search by problem, category or subcategory"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: "10px 14px",
            borderRadius: "10px",
            border: "1px solid #ccc",
            width: "100%",
            flex: 2,
            minWidth: "220px",
            fontSize: "14px",
          }}
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            padding: "10px 12px",
            borderRadius: "10px",
            border: "1px solid #ccc",
            flex: 1,
            fontSize: "14px",
            cursor: "pointer",
          }}
        >
          <option value="All">All Status</option>
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Resolved">Resolved</option>
        </select>

        <button
          onClick={downloadReport}
          style={{
            background: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "10px",
            padding: "10px 18px",
            cursor: "pointer",
            fontWeight: "600",
            transition: "0.3s",
          }}
          onMouseOver={(e) => (e.target.style.background = "#43a047")}
          onMouseOut={(e) => (e.target.style.background = "#4CAF50")}
        >
          Download Report
        </button>
      </div>

      {/* Complaints Table */}
      {loading ? (
        <p style={{ textAlign: "center", fontSize: "1.1rem", color: "#555" }}>
          Loading complaints...
        </p>
      ) : filtered.length === 0 ? (
        <p style={{ textAlign: "center", fontSize: "1.1rem", color: "#666" }}>
          No complaints found.
        </p>
      ) : (
        <div
          style={{
            overflowX: "auto",
            borderRadius: "12px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              borderRadius: "12px",
              overflow: "hidden",
            }}
          >
            <thead>
              <tr
                style={{
                  background: "#000000ff",
                  color: "white",
                  textAlign: "left",
                }}
              >
                {["Problem", "Category", "Subcategory", "Status", "Created At"].map((head) => (
                  <th
                    key={head}
                    style={{
                      padding: "14px",
                      fontWeight: "600",
                      fontSize: "15px",
                      borderBottom: "2px solid #ddd",
                    }}
                  >
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr
                  key={c._id}
                  style={{
                    background: "#fff",
                    transition: "0.3s",
                  }}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.background = "#f2f2ff")
                  }
                  onMouseOut={(e) =>
                    (e.currentTarget.style.background = "#fff")
                  }
                >
                  <td style={tdStyle}>{c.problem}</td>
                  <td style={tdStyle}>{c.category?.name}</td>
                  <td style={tdStyle}>{c.subCategory?.name}</td>
                  <td style={tdStyle}>
                    <span
                      style={{
                        padding: "5px 10px",
                        borderRadius: "20px",
                        color: "#fff",
                        fontSize: "13px",
                        backgroundColor: getStatusColor(c.status),
                        boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                      }}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    {new Date(c.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const tdStyle = {
  padding: "12px 14px",
  borderBottom: "1px solid #eee",
  fontSize: "14px",
  color: "#333",
};

const getStatusColor = (status) => {
  switch (status) {
    case "Pending":
      return "#FFA500";
    case "In Progress":
      return "#1E90FF";
    case "Resolved":
      return "#4CAF50";
    default:
      return "#555";
  }
};

export default ComplaintStatus;
