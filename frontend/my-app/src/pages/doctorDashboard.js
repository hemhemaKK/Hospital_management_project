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

  // NEW (for nurses)
  const [nurses, setNurses] = useState([]);

  // UI states
  const [expandedAppts, setExpandedAppts] = useState({});
  const [presInputs, setPresInputs] = useState({});
  const [actionLoading, setActionLoading] = useState({});
  const [assignNurseId, setAssignNurseId] = useState({}); // appointment → nurse id

  const authHeaders = () => ({ headers: { Authorization: `Bearer ${token}` } });

  // AUTO REFRESH
  useEffect(() => {
    if (!token) return;

    let mounted = true;
    const fetchAppts = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/appointment/appointments`, authHeaders());
        if (mounted) setAppointments(res.data);
      } catch (err) {
        console.error("Auto refresh error", err);
      }
    };

    fetchAppts();
    const interval = setInterval(fetchAppts, 2000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [token]);

  // LOAD INITIAL DATA
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
      alert("Category selected. Wait for admin approval.");
      const resUser = await axios.get(`${BASE_URL}/doctor/dashboard`, authHeaders());
      setUser(resUser.data.user);
    } catch (err) {
      console.error(err);
      alert("Error selecting category");
    }
  };

  const toggleExpand = (id) => {
    setExpandedAppts((s) => ({ ...s, [id]: !s[id] }));
    if (!presInputs[id]) {
      setPresInputs((p) => ({ ...p, [id]: { medicineName: "", dosage: "", duration: "", notes: "" } }));
    }
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
      console.error("Failed to update appointment", err);
      alert("Failed to update appointment");
    } finally {
      setActionLoading((s) => ({ ...s, [id]: false }));
    }
  };

  // Add Prescription
  const addPrescription = async (apptId) => {
    const inputs = presInputs[apptId] || {};
    if (!inputs.medicineName?.trim() || !inputs.dosage?.trim() || !inputs.duration?.trim()) {
      return alert("Please enter medicine name, dosage, duration");
    }

    const prescription = {
      medicineName: inputs.medicineName.trim(),
      dosage: inputs.dosage.trim(),
      duration: inputs.duration.trim(),
      notes: inputs.notes?.trim() || "",
    };

    await updateAppointment(apptId, { action: "add_prescription", prescription });

    setPresInputs((p) => ({
      ...p,
      [apptId]: { medicineName: "", dosage: "", duration: "", notes: "" },
    }));
  };

  // Assign Nurse (Option B — AFTER prescription)
  const assignNurse = async (apptId) => {
    const nurseId = assignNurseId[apptId];
    if (!nurseId) return alert("Select nurse");

    await updateAppointment(apptId, { action: "assign_nurse", nurseId });
    alert("Nurse assigned");
  };

  const directComplete = async (appt) => {
    await updateAppointment(appt._id, { action: "complete" });
  };

  const acceptAppointment = async (id) => {
    await updateAppointment(id, { action: "accept" });
  };

  const rejectAppointment = async (id) => {
    const ok = window.confirm("Are you sure?");
    if (!ok) return;
    await updateAppointment(id, { action: "reject" });
  };

  // Appointment Table with Nurse Assign UI
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
          {appointments.length > 0 ? (
            appointments.map((a, i) => {
              const expanded = !!expandedAppts[a._id];
              const loadingThis = !!actionLoading[a._id];
              const prescriptions = Array.isArray(a.prescription) ? a.prescription : [];

              return (
                <React.Fragment key={a._id}>
                  <tr style={trStyle(i)}>
                    <td style={tdStyle}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ cursor: "pointer" }} onClick={() => toggleExpand(a._id)}>
                          {expanded ? "▾" : "▸"}
                        </div>
                        <div>{a.user?.name}</div>
                      </div>
                    </td>

                    <td style={tdStyle}>{a.date}</td>
                    <td style={tdStyle}>{a.time}</td>

                    <td style={tdStyle}>{a.nurse ? <b>{a.nurse.name}</b> : <i>Not Assigned</i>}</td>

                    <td style={tdStyle}>
                      <span style={{
                        padding: "5px 10px",
                        borderRadius: 6,
                        color: "#fff",
                        fontWeight: "bold",
                        background:
                          a.status === "PENDING" ? "gray" :
                          a.status === "DOCTOR_ACCEPTED" ? "green" :
                          a.status === "NURSE_ASSIGNED" ? "blue" :
                          a.status === "NURSE_COMPLETED" ? "orange" :
                          a.status === "REJECTED" ? "red" :
                          "#222"
                      }}>
                        {a.status}
                      </span>
                    </td>

                    <td style={tdStyle}>
                      {a.status === "PENDING" && (
                        <>
                          <button style={actionBtnStyle("green")} onClick={() => acceptAppointment(a._id)} disabled={loadingThis}>Accept</button>
                          <button style={actionBtnStyle("red")} onClick={() => rejectAppointment(a._id)} disabled={loadingThis}>Reject</button>
                        </>
                      )}

                      {a.status !== "PENDING" &&
                        a.status !== "REJECTED" &&
                        a.status !== "DOCTOR_COMPLETED" && (
                          <button style={actionBtnStyle("green")} onClick={() => directComplete(a)} disabled={loadingThis}>
                            Complete
                          </button>
                        )}

                      {a.status === "DOCTOR_COMPLETED" && (
                        <span style={{ color: "green", fontWeight: "bold" }}>✔ Completed</span>
                      )}
                    </td>
                  </tr>

                  {expanded && (
                    <tr>
                      <td colSpan={6} style={{ padding: 12, background: "#fbfbfb" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                          
                          {/* Description */}
                          <div>
                            <strong>Description:</strong>
                            <p>{a.description || "-"}</p>
                          </div>

                          {/* Prescription list */}
                          <div>
                            <strong>Prescriptions</strong>
                            {prescriptions.length === 0 ? (
                              <p style={{ color: "#777" }}>No prescriptions yet.</p>
                            ) : (
                              prescriptions.map((p, idx) => (
                                <div key={idx} style={{ padding: 8, background: "#fff", borderRadius: 6, border: "1px solid #ddd", marginTop: 6 }}>
                                  <b>{p.medicineName}</b> — {p.dosage}
                                  <div>{p.duration}</div>
                                  <div style={{ fontSize: 12, color: "#555" }}>
                                    {p.prescribedBy === user?._id ? "Prescribed by you" : "By nurse"}
                                  </div>
                                </div>
                              ))
                            )}
                          </div>

                          {/* Add Prescription */}
                          {a.status !== "DOCTOR_COMPLETED" && (
                            <div>
                              <strong>Add Prescription</strong>

                              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 6 }}>
                                <input placeholder="Medicine" style={inputStyle}
                                  value={presInputs[a._id]?.medicineName || ""}
                                  onChange={(e) => handlePresChange(a._id, "medicineName", e.target.value)}
                                />

                                <input placeholder="Dosage" style={inputStyle}
                                  value={presInputs[a._id]?.dosage || ""}
                                  onChange={(e) => handlePresChange(a._id, "dosage", e.target.value)}
                                />

                                <input placeholder="Duration" style={inputStyle}
                                  value={presInputs[a._id]?.duration || ""}
                                  onChange={(e) => handlePresChange(a._id, "duration", e.target.value)}
                                />

                                <textarea placeholder="Notes" style={{ ...inputStyle, height: 60 }}
                                  value={presInputs[a._id]?.notes || ""}
                                  onChange={(e) => handlePresChange(a._id, "notes", e.target.value)}
                                />
                              </div>

                              <button style={actionBtnStyle("orange")} onClick={() => addPrescription(a._id)}>
                                Add Prescription
                              </button>
                            </div>
                          )}

                          {/* Assign Nurse AFTER prescription */}
                          {a.prescription?.length > 0 && !a.nurse && (
                            <div style={{ marginTop: 20 }}>
                              <strong>Assign Nurse</strong>

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
                                    <option key={n._id} value={n._id}>
                                      {n.name}
                                    </option>
                                  ))}
                                </select>

                                <button style={actionBtnStyle("green")} onClick={() => assignNurse(a._id)}>
                                  Assign Nurse
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
          ) : (
            <tr>
              <td colSpan={6} style={{ textAlign: "center", padding: "20px" }}>
                No Appointments
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  const renderDashboard = () => (
    <div>
      {!user?.selectedCategory ? (
        <div style={{ marginTop: 20 }}>
          <select style={selectStyle} value={selectedCategoryId} onChange={(e) => setSelectedCategoryId(e.target.value)}>
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
        <>
          <h3>Appointments</h3>
          {renderAppointmentTable()}
        </>
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

          {["Dashboard", "Appointments", "Profile"].map((menu) => (
            <div key={menu} style={menuItemStyle(activeSection === menu)} onClick={() => setActiveSection(menu)}>
              {menu}
            </div>
          ))}
        </div>

        <div style={{ padding: "0.5rem" }}>
          <div style={bottomLinkStyle(false, true)} onClick={handleLogout}>Logout</div>
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, marginLeft: 250, padding: "2rem" }}>
        {activeSection === "Dashboard" && renderDashboard()}
        {activeSection === "Appointments" && renderAppointmentTable()}
        {activeSection === "Profile" && <ProfileSettings />}
      </div>
    </div>
  );
}

/* --- CSS --- */

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

const profileStyle = {
  textAlign: "center",
  paddingBottom: "10px",
  borderBottom: "1px solid #444",
};

const profilePicStyle = {
  width: "80px",
  height: "80px",
  borderRadius: "50%",
  objectFit: "cover",
};

const menuItemStyle = (active) => ({
  padding: "10px",
  margin: "8px 0",
  borderRadius: "6px",
  background: active ? "#333" : "transparent",
  color: active ? "#4CAF50" : "#fff",
  cursor: "pointer",
});

const bottomLinkStyle = (active, isLogout = false) => ({
  padding: "10px",
  borderRadius: "8px",
  textAlign: "center",
  background: isLogout ? "#ff4d4d" : active ? "#222" : "transparent",
  color: "#fff",
  cursor: "pointer",
});

const selectStyle = {
  padding: "8px",
  marginRight: "10px",
  borderRadius: "6px",
};

const chooseBtnStyle = {
  padding: "8px 16px",
  background: "#4CAF50",
  border: "none",
  color: "white",
  borderRadius: "6px",
  cursor: "pointer",
};

const tableStyle = {
  width: "100%",
  marginTop: "20px",
  background: "#fff",
  borderRadius: "10px",
  borderCollapse: "collapse",
};

const thStyle = {
  background: "#000",
  color: "#fff",
  padding: "12px",
  textAlign: "left",
};

const tdStyle = {
  padding: "12px",
  verticalAlign: "top",
  borderBottom: "1px solid #eee",
};

const trStyle = (i) => ({
  background: i % 2 === 0 ? "#f9f9f9" : "#fff",
});

const actionBtnStyle = (color) => ({
  padding: "6px 10px",
  border: "none",
  borderRadius: "6px",
  margin: "2px",
  color: "#fff",
  cursor: "pointer",
  background:
    color === "green" ? "#4CAF50" :
    color === "orange" ? "#FF9800" :
    color === "red" ? "#f44336" :
    "#777",
});

const inputStyle = {
  padding: 8,
  borderRadius: 6,
  border: "1px solid #ddd",
  minWidth: 180,
};
