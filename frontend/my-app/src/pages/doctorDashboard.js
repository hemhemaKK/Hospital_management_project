// ✔ FULL UPDATED DOCTOR DASHBOARD WITH NURSE SECTION

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ProfileSettings from "./ProfileSettings";

const BASE_URL = "http://localhost:5000/api";

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [activeSection, setActiveSection] = useState("Dashboard");
  const [user, setUser] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // NEW — Nurses of doctor category
  const [nurses, setNurses] = useState([]);
  const [nurseSearch, setNurseSearch] = useState("");

  // UI states
  const [expandedAppts, setExpandedAppts] = useState({});
  const [presInputs, setPresInputs] = useState({});
  const [actionLoading, setActionLoading] = useState({});
  const [assignNurseId, setAssignNurseId] = useState({});

  const authHeaders = () => ({ headers: { Authorization: `Bearer ${token}` } });

  // Auto refresh appointments
  useEffect(() => {
    if (!token) return;

    let mounted = true;

    const fetchAppts = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/appointment/appointments`, authHeaders());
        if (mounted) setAppointments(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchAppts();
    const interval = setInterval(fetchAppts, 2000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [token]);

  // Load dashboard data
  useEffect(() => {
    if (!token) return;

    const loadData = async () => {
      try {
        const [resUser, resCat, resAppt, resNurses] = await Promise.all([
          axios.get(`${BASE_URL}/doctor/dashboard`, authHeaders()),
          axios.get(`${BASE_URL}/doctor/categories`, authHeaders()),
          axios.get(`${BASE_URL}/appointment/appointments`, authHeaders()),
          axios.get(`${BASE_URL}/doctor/nurse`, authHeaders()).catch(() => ({ data: [] }))
        ]);

        setUser(resUser.data.user);
        setCategories(resCat.data || []);
        setAppointments(resAppt.data || []);
        setNurses(resNurses.data || []);

        const initInputs = {};
        (resAppt.data || []).forEach((a) => {
          initInputs[a._id] = { medicineName: "", dosage: "", duration: "", notes: "" };
        });

        setPresInputs(initInputs);
        setLoading(false);

      } catch (err) {
        console.error("Error loading dashboard:", err);
        alert("Error loading dashboard");
      }
    };

    loadData();
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const chooseCategory = async () => {
    if (!selectedCategoryId) return alert("Select a department");
    try {
      await axios.put(`${BASE_URL}/doctor/choose-category`, { categoryId: selectedCategoryId }, authHeaders());
      alert("Department selected. Waiting for admin approval.");
      const resUser = await axios.get(`${BASE_URL}/doctor/dashboard`, authHeaders());
      setUser(resUser.data.user);
    } catch (err) {
      console.error(err);
      alert("Error selecting category");
    }
  };

  const toggleExpand = (id) => {
    setExpandedAppts((s) => ({ ...s, [id]: !s[id] }));
  };

  const handlePresChange = (apptId, field, value) => {
    setPresInputs((p) => ({ ...p, [apptId]: { ...(p[apptId] || {}), [field]: value } }));
  };

  const updateAppointment = async (id, payload) => {
    setActionLoading((s) => ({ ...s, [id]: true }));
    try {
      await axios.put(`${BASE_URL}/appointment/appointment/${id}`, payload, authHeaders());
      const refreshed = await axios.get(`${BASE_URL}/appointment/appointments`, authHeaders());
      setAppointments(refreshed.data || []);
    } catch (err) {
      console.error(err);
      alert("Failed to update appointment");
    } finally {
      setActionLoading((s) => ({ ...s, [id]: false }));
    }
  };

  const addPrescription = async (apptId) => {
    const inputs = presInputs[apptId] || {};
    if (!inputs.medicineName || !inputs.dosage || !inputs.duration)
      return alert("Medicine, dosage and duration required");

    await updateAppointment(apptId, {
      action: "add_prescription",
      prescription: {
        medicineName: inputs.medicineName,
        dosage: inputs.dosage,
        duration: inputs.duration,
        notes: inputs.notes || "",
      },
    });

    setPresInputs((p) => ({ ...p, [apptId]: { medicineName: "", dosage: "", duration: "", notes: "" } }));
  };

  const assignNurse = async (apptId) => {
    const nurseId = assignNurseId[apptId];
    if (!nurseId) return alert("Select a nurse");

    await updateAppointment(apptId, { action: "assign_nurse", nurseId });
  };

  const acceptAppointment = (id) => updateAppointment(id, { action: "accept" });
  const rejectAppointment = (id) => window.confirm("Sure?") && updateAppointment(id, { action: "reject" });
  const directComplete = (appt) => updateAppointment(appt._id, { action: "complete" });

  /* ---------------- NURSE TABLE ---------------- */

  const renderNurseTable = () => {
    const filtered = nurses.filter((n) => {
      const s = nurseSearch.toLowerCase();
      return n.name.toLowerCase().includes(s) || n.email.toLowerCase().includes(s);
    });

    return (
      <div>
        <h2>Nurses in Your Department</h2>

        <input
          type="text"
          placeholder="Search nurse..."
          value={nurseSearch}
          onChange={(e) => setNurseSearch(e.target.value)}
          style={{ ...inputStyle, margin: "10px 0" }}
        />

        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Name</th>
              <th style={thStyle}>Email</th>
              <th style={thStyle}>Phone</th>
              <th style={thStyle}>Status</th>
            </tr>
          </thead>

          <tbody>
            {filtered.length > 0 ? (
              filtered.map((n, i) => (
                <tr key={n._id} style={trStyle(i)}>
                  <td style={tdStyle}>{n.name}</td>
                  <td style={tdStyle}>{n.email}</td>
                  <td style={tdStyle}>{n.phone || "-"}</td>
                  <td style={tdStyle}>
                    <span style={{ ...statusTag(n.status || "ACTIVE") }}>{n.status || "ACTIVE"}</span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} style={{ textAlign: "center", padding: 20 }}>
                  No nurses found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  };

  /* ---------------- RENDER APPOINTMENTS ---------------- */
  const renderAppointmentTable = () => (
    <div>
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>Patient</th>
            <th style={thStyle}>Date</th>
            <th style={thStyle}>Time</th>
            <th style={thStyle}>Nurse</th>
            <th style={thStyle}>Status</th>
            <th style={thStyle}>Action</th>
          </tr>
        </thead>

        <tbody>
          {appointments.length === 0 ? (
            <tr>
              <td colSpan={6} style={{ textAlign: "center", padding: 20 }}>No Appointments</td>
            </tr>
          ) : (
            appointments.map((a, i) => {
              const expanded = expandedAppts[a._id];
              const prescriptions = Array.isArray(a.prescription) ? a.prescription : [];

              return (
                <React.Fragment key={a._id}>
                  <tr style={trStyle(i)}>
                    <td style={tdStyle} onClick={() => toggleExpand(a._id)}>{expanded ? "▾" : "▸"} {a.user?.name}</td>
                    <td style={tdStyle}>{a.date}</td>
                    <td style={tdStyle}>{a.time}</td>
                    <td style={tdStyle}>{a.nurse ? a.nurse.name : "-"}</td>

                    <td style={tdStyle}>
                      <span style={statusTag(a.status)}>{a.status}</span>
                    </td>

                    <td style={tdStyle}>
                      {a.status === "PENDING" && (
                        <>
                          <button style={btn("green")} onClick={() => acceptAppointment(a._id)}>Accept</button>
                          <button style={btn("red")} onClick={() => rejectAppointment(a._id)}>Reject</button>
                        </>
                      )}

                      {a.status !== "DOCTOR_COMPLETED" &&
                        a.status !== "REJECTED" &&
                        a.status !== "PENDING" && (
                          <button style={btn("green")} onClick={() => directComplete(a)}>
                            Complete
                          </button>
                        )}
                    </td>
                  </tr>

                  {expanded && (
                    <tr>
                      <td colSpan={6} style={{ padding: 20, background: "#fafafa" }}>
                        <div>
                          <b>Description:</b>
                          <p>{a.description || "-"}</p>

                          <b>Prescriptions:</b>
                          {prescriptions.length === 0 ? (
                            <p>No prescriptions</p>
                          ) : (
                            prescriptions.map((p, idx) => (
                              <div key={idx} style={presBox}>
                                <b>{p.medicineName}</b> — {p.dosage} ({p.duration})
                              </div>
                            ))
                          )}

                          {/* Add prescription */}
                          <div style={{ marginTop: 15 }}>
                            <b>Add Prescription</b>
                            <div style={{ display: "flex", gap: 10, marginTop: 5, flexWrap: "wrap" }}>
                              <input style={inputStyle} placeholder="Medicine"
                                value={presInputs[a._id]?.medicineName || ""}
                                onChange={(e) => handlePresChange(a._id, "medicineName", e.target.value)}
                              />
                              <input style={inputStyle} placeholder="Dosage"
                                value={presInputs[a._id]?.dosage || ""}
                                onChange={(e) => handlePresChange(a._id, "dosage", e.target.value)}
                              />
                              <input style={inputStyle} placeholder="Duration"
                                value={presInputs[a._id]?.duration || ""}
                                onChange={(e) => handlePresChange(a._id, "duration", e.target.value)}
                              />
                            </div>

                            <button style={btn("orange")} onClick={() => addPrescription(a._id)}>Add</button>
                          </div>

                          {/* Assign Nurse */}
                          {prescriptions.length > 0 && !a.nurse && (
                            <div style={{ marginTop: 20 }}>
                              <b>Assign Nurse</b>

                              <div style={{ marginTop: 8, display: "flex", gap: 10 }}>
                                <select
                                  style={inputStyle}
                                  value={assignNurseId[a._id] || ""}
                                  onChange={(e) =>
                                    setAssignNurseId((p) => ({ ...p, [a._id]: e.target.value }))
                                  }
                                >
                                  <option value="">Select Nurse</option>
                                  {nurses.map((n) => (
                                    <option key={n._id} value={n._id}>{n.name}</option>
                                  ))}
                                </select>

                                <button style={btn("green")} onClick={() => assignNurse(a._id)}>
                                  Assign
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );

  const renderDashboard = () => (
    <div>
      {!user?.selectedCategory ? (
        <div>
          <select style={selectStyle} value={selectedCategoryId}
            onChange={(e) => setSelectedCategoryId(e.target.value)}>
            <option value="">Select Department</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
          <button onClick={chooseCategory} style={chooseBtnStyle}>Submit</button>
        </div>
      ) : !user?.isVerified ? (
        <p style={{ color: "orange" }}>Waiting for admin approval...</p>
      ) : (
        renderAppointmentTable()
      )}
    </div>
  );

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <div style={sidebarStyle}>
        <div>
          <div style={profileStyle}>
            <img src={user?.profilePic || "https://via.placeholder.com/80"} alt="profile" style={profilePicStyle} />
            <h3 style={{ color: "#fff" }}>{user?.name}</h3>
            <p style={{ color: "#aaa" }}>{user?.email}</p>
          </div>

          {/* UPDATED Sidebar: Added Nurses */}
          {["Dashboard", "Appointments", "Nurses", "Profile"].map((menu) => (
            <div
              key={menu}
              style={menuItemStyle(activeSection === menu)}
              onClick={() => setActiveSection(menu)}
            >
              {menu}
            </div>
          ))}
        </div>

        <div style={{ padding: "0.5rem" }}>
          <div style={bottomLinkStyle(false, true)} onClick={handleLogout}>Logout</div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, marginLeft: 250, padding: "2rem" }}>
        {activeSection === "Dashboard" && renderDashboard()}
        {activeSection === "Appointments" && renderAppointmentTable()}
        {activeSection === "Nurses" && renderNurseTable()}
        {activeSection === "Profile" && <ProfileSettings />}
      </div>
    </div>
  );
}

/* ---- Styles ---- */

const sidebarStyle = {
  width: 250,
  background: "#111",
  height: "100vh",
  position: "fixed",
  padding: "1rem",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
};

const profileStyle = {
  textAlign: "center",
  paddingBottom: 10,
  borderBottom: "1px solid #444",
};

const profilePicStyle = {
  width: 80,
  height: 80,
  borderRadius: "50%",
  objectFit: "cover",
};

const menuItemStyle = (active) => ({
  padding: 10,
  margin: "8px 0",
  borderRadius: 6,
  background: active ? "#333" : "transparent",
  color: active ? "#4CAF50" : "#fff",
  cursor: "pointer",
});

const bottomLinkStyle = (active, isLogout = false) => ({
  padding: 10,
  borderRadius: 8,
  textAlign: "center",
  background: isLogout ? "#ff4d4d" : active ? "#222" : "transparent",
  color: "#fff",
  cursor: "pointer",
});

const tableStyle = {
  width: "100%",
  marginTop: 20,
  background: "#fff",
  borderRadius: 10,
  borderCollapse: "collapse",
};

const thStyle = {
  background: "#000",
  color: "#fff",
  padding: 12,
  textAlign: "left",
};

const tdStyle = {
  padding: 12,
  borderBottom: "1px solid #eee",
};

const trStyle = (i) => ({
  background: i % 2 === 0 ? "#f9f9f9" : "#fff",
});

const btn = (color) => ({
  padding: "6px 12px",
  borderRadius: 6,
  border: "none",
  cursor: "pointer",
  color: "#fff",
  margin: "3px",
  background:
    color === "green"
      ? "#4CAF50"
      : color === "red"
      ? "#f44336"
      : color === "orange"
      ? "#FF9800"
      : "#555",
});

const statusTag = (status) => ({
  padding: "5px 10px",
  borderRadius: 6,
  color: "#fff",
  background:
    status === "PENDING"
      ? "gray"
      : status === "DOCTOR_ACCEPTED"
      ? "green"
      : status === "NURSE_ASSIGNED"
      ? "blue"
      : status === "NURSE_COMPLETED"
      ? "orange"
      : status === "REJECTED"
      ? "red"
      : "#222",
});

const inputStyle = {
  padding: "8px",
  borderRadius: 6,
  border: "1px solid #ddd",
  minWidth: 160,
};

const presBox = {
  padding: 10,
  marginTop: 8,
  border: "1px solid #ddd",
  borderRadius: 6,
};

const selectStyle = {
  padding: 8,
  borderRadius: 6,
};

const chooseBtnStyle = {
  padding: "8px 16px",
  background: "#4CAF50",
  color: "#fff",
  borderRadius: 6,
  border: "none",
  cursor: "pointer",
};
