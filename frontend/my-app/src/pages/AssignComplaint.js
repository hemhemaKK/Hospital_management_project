import React, { useState, useEffect } from "react";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const AssignComplaint = () => {
  const [complaints, setComplaints] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [subEmployees, setSubEmployees] = useState({});
  const [selectedSubEmployee, setSelectedSubEmployee] = useState({});
  const [imageModal, setImageModal] = useState(null);
  const [mapModal, setMapModal] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/complaints/employee-category-complaints",
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const sorted = res.data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setComplaints(sorted);
        setFiltered(sorted);

        // Fetch sub-employees per category
        const categories = [...new Set(res.data.map((c) => c.category._id))];
        const subEmpObj = {};
        for (let catId of categories) {
          const subRes = await axios.get(
            `http://localhost:5000/api/employee/sub-employees?categoryId=${catId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          subEmpObj[catId] = subRes.data;
        }
        setSubEmployees(subEmpObj);
      } catch (err) {
        console.error("Error fetching complaints/sub-employees:", err);
      }
    };
    fetchComplaints();
  }, [token]);

  // Filter & Search Effect
  useEffect(() => {
    let temp = [...complaints];

    if (searchTerm) {
      temp = temp.filter((c) => {
        const problem = c.problem ? c.problem.toLowerCase() : "";
        const userName = c.user?.name ? c.user.name.toLowerCase() : "";
        const categoryName = c.category?.name ? c.category.name.toLowerCase() : "";
        const term = searchTerm.toLowerCase();

        return (
          problem.includes(term) ||
          userName.includes(term) ||
          categoryName.includes(term)
        );
      });

    }

    if (statusFilter !== "All") {
      temp = temp.filter((c) => c.status === statusFilter);
    }

    setFiltered(temp);
  }, [searchTerm, statusFilter, complaints]);

  const handleAssign = async (complaintId) => {
    const subEmployeeId = selectedSubEmployee[complaintId];
    if (!subEmployeeId) return alert("Select a sub-employee first");

    try {
      const res = await axios.put(
        "http://localhost:5000/api/complaints/assign",
        { complaintId, employeeId: subEmployeeId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(res.data.message);

      setComplaints((prev) =>
        prev.map((c) =>
          c._id === complaintId
            ? {
              ...c,
              assignedEmployee: res.data.complaint.assignedEmployee,
              status: res.data.complaint.status,
            }
            : c
        )
      );
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to assign complaint");
    }
  };

  return (
    <div
      style={{
        maxWidth: "1200px",
        margin: "30px auto",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
        Assign Complaints to Sub-Employees
      </h2>

      {/* Search & Filter */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "10px",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <input
          type="text"
          placeholder="Search by problem, user, or category"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            flex: 1,
            minWidth: "220px",
            padding: "10px 15px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
            fontSize: "14px",
            transition: "border 0.2s, box-shadow 0.2s",
          }}
          onFocus={(e) => {
            e.target.style.borderColor = "#6c5ce7";
            e.target.style.boxShadow = "0 0 5px rgba(108,92,231,0.3)";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = "#ccc";
            e.target.style.boxShadow = "none";
          }}
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            padding: "10px 15px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            backgroundColor: "#fff",
            boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
            fontSize: "14px",
            minWidth: "150px",
            cursor: "pointer",
            transition: "border 0.2s, box-shadow 0.2s",
          }}
          onFocus={(e) => {
            e.target.style.borderColor = "#6c5ce7";
            e.target.style.boxShadow = "0 0 5px rgba(108,92,231,0.3)";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = "#ccc";
            e.target.style.boxShadow = "none";
          }}
        >
          <option value="All">All Status</option>
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Resolved">Resolved</option>
        </select>
      </div>

      <table
        style={{
          width: "100%",
          borderCollapse: "separate",
          borderSpacing: "0 5px",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <thead>
          <tr
            style={{
              backgroundColor: "#262626ff",
              color: "white",
              textAlign: "left",
              borderRadius: "8px",
            }}
          >
            <th style={{ padding: "10px" }}>Date</th>
            <th style={{ padding: "10px" }}>Problem</th>
            <th style={{ padding: "10px" }}>Status</th>
            <th style={{ padding: "10px" }}>User</th>
            <th style={{ padding: "10px" }}>Location</th>
            <th style={{ padding: "10px" }}>Images</th>
            <th style={{ padding: "10px" }}>Assign Sub-Employee</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length > 0 ? (
            filtered.map((c, idx) => (
              <tr
                key={c._id}
                style={{
                  backgroundColor: idx % 2 === 0 ? "#f7f7f7" : "#ffffff",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  borderRadius: "8px",
                  transition: "transform 0.2s",
                  cursor: "default",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.transform = "scale(1.01)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.transform = "scale(1)")
                }
              >
                <td style={{ padding: "10px" }}>
                  {new Date(c.createdAt).toLocaleString()}
                </td>
                <td style={{ padding: "10px" }}>{c.problem}</td>
                <td style={{ padding: "10px" }}>
                  <span
                    style={{
                      color: c.status === "open" ? "#00b894" : "#d63031",
                      fontWeight: "bold",
                    }}
                  >
                    {c.status}
                  </span>
                </td>
                <td style={{ padding: "10px" }}>
                  {c.user.name} ({c.user.email})
                </td>
                <td style={{ padding: "10px" }}>
                  {c.location ? (
                    <span
                      style={{
                        cursor: "pointer",
                        color: "#0984e3",
                        textDecoration: "underline",
                      }}
                      onClick={() => setMapModal(c.location)}
                    >
                      View Map
                    </span>
                  ) : (
                    "No Location"
                  )}
                </td>
                <td style={{ padding: "10px" }}>
                  {c.images && c.images.length > 0 ? (
                    <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
                      {c.images.map((img, idx) => (
                        <img
                          key={idx}
                          src={img}
                          alt={`complaint-${idx}`}
                          style={{
                            width: "60px",
                            height: "60px",
                            objectFit: "cover",
                            cursor: "pointer",
                            borderRadius: "6px",
                            border: "1px solid #ccc",
                            transition: "transform 0.2s",
                          }}
                          onClick={() => setImageModal(img)}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.transform = "scale(1.1)")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.transform = "scale(1)")
                          }
                        />
                      ))}
                    </div>
                  ) : (
                    "No Image"
                  )}
                </td>
                <td style={{ padding: "10px" }}>
                  {c.assignedEmployee ? (
                    <span style={{ color: "#636e72", fontWeight: "bold" }}>
                      {c.assignedEmployee.name}
                    </span>
                  ) : (
                    <div style={{ display: "flex", gap: "5px" }}>
                      <select
                        value={selectedSubEmployee[c._id] || ""}
                        onChange={(e) =>
                          setSelectedSubEmployee({
                            ...selectedSubEmployee,
                            [c._id]: e.target.value,
                          })
                        }
                        style={{
                          padding: "6px",
                          borderRadius: "6px",
                          border: "1px solid #ccc",
                        }}
                      >
                        <option value="">Select Sub-Employee</option>
                        {subEmployees[c.category._id]?.map((se) => (
                          <option key={se._id} value={se._id}>
                            {se.name}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => handleAssign(c._id)}
                        disabled={!selectedSubEmployee[c._id]}
                        style={{
                          padding: "6px 12px",
                          borderRadius: "6px",
                          cursor: selectedSubEmployee[c._id]
                            ? "pointer"
                            : "not-allowed",
                          backgroundColor: selectedSubEmployee[c._id]
                            ? "#4CAF50"
                            : "#b2bec3",
                          color: "#fff",
                          border: "none",
                          transition: "background 0.2s",
                        }}
                      >
                        Assign
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan="7"
                style={{
                  textAlign: "center",
                  padding: "20px",
                  color: "#636e72",
                  fontWeight: "bold",
                }}
              >
                No records found.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Image Modal */}
      {imageModal && (
        <div
          onClick={() => setImageModal(null)}
          style={modalStyle}
        >
          <img
            src={imageModal}
            alt="full"
            style={{ maxHeight: "80%", maxWidth: "80%" }}
          />
        </div>
      )}

      {/* Map Modal */}
      {mapModal && (
        <div
          onClick={() => setMapModal(null)}
          style={modalStyle}
        >
          <div
            style={{
              width: "80%",
              height: "80%",
              backgroundColor: "white",
              cursor: "default",
              borderRadius: "10px",
            }}
          >
            <MapContainer
              center={[mapModal.lat, mapModal.lng]}
              zoom={13}
              style={{ width: "100%", height: "100%", borderRadius: "10px" }}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker position={[mapModal.lat, mapModal.lng]}>
                <Popup>{mapModal.address || "User Location"}</Popup>
              </Marker>
            </MapContainer>
          </div>
        </div>
      )}
    </div>
  );
};

const modalStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  backgroundColor: "rgba(0,0,0,0.7)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
  cursor: "pointer",
};

export default AssignComplaint;
