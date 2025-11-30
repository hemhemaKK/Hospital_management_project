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
  const [nurses, setNurses] = useState([]);
  const [expandedAppts, setExpandedAppts] = useState({});
  const [presInputs, setPresInputs] = useState({});
  const [assignNurseId, setAssignNurseId] = useState({});
  const [actionLoading, setActionLoading] = useState({});
  const [loading, setLoading] = useState(true);

  const authHeaders = () => ({ headers: { Authorization: `Bearer ${token}` } });

  // Load doctor data
  useEffect(() => {
    if (!token) return;

    const loadData = async () => {
      try {
        const [resUser, resCat, resAppt, resNurses] = await Promise.all([
          axios.get(`${BASE_URL}/doctor/dashboard`, authHeaders()),
          axios.get(`${BASE_URL}/doctor/categories`, authHeaders()),
          axios.get(`${BASE_URL}/appointment/appointments`, authHeaders()),
          axios.get(`${BASE_URL}/doctor/nurse`, authHeaders()).catch(() => ({ data: [] })),
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
        console.error(err);
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
    if (!inputs.medicineName?.trim() || !inputs.dosage?.trim() || !inputs.duration?.trim()) {
      return alert("Enter medicine, dosage, and duration");
    }

    const prescription = {
      medicineName: inputs.medicineName.trim(),
      dosage: inputs.dosage.trim(),
      duration: inputs.duration.trim(),
      notes: inputs.notes?.trim() || "",
    };

    await updateAppointment(apptId, { action: "add_prescription", prescription });

    setPresInputs((p) => ({ ...p, [apptId]: { medicineName: "", dosage: "", duration: "", notes: "" } }));
  };

  const assignNurse = async (apptId) => {
    const nurseId = assignNurseId[apptId];
    if (!nurseId) return alert("Select a nurse");
    await updateAppointment(apptId, { action: "assign_nurse", nurseId });
    alert("Nurse assigned with prescriptions");
  };

  const directComplete = async (appt) => {
    await updateAppointment(appt._id, { action: "complete" });
  };

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
                      <div style={{ cursor: "pointer" }} onClick={() => toggleExpand(a._id)}>
                        {expanded ? "▾ " : "▸ "}
                        {a.user?.name}
                      </div>
                    </td>
                    <td style={tdStyle}>{a.date}</td>
                    <td style={tdStyle}>{a.time}</td>
                    <td style={tdStyle}>{a.nurse ? a.nurse.name : <i>Not Assigned</i>}</td>
                    <td style={tdStyle}>
                      <span style={statusBadge(a.status)}>{a.status}</span>
                    </td>
                    <td style={tdStyle}>
                      {a.status !== "REJECTED" && a.status !== "DOCTOR_COMPLETED" && (
                        <button style={actionBtnStyle("green")} onClick={() => directComplete(a)} disabled={loadingThis}>
                          Complete
                        </button>
                      )}
                    </td>
                  </tr>

                  {expanded && (
                    <tr>
                      <td colSpan={6} style={{ padding: 12, background: "#fbfbfb" }}>
                        {/* Description */}
                        <div>
                          <strong>Description:</strong>
                          <p>{a.description || "-"}</p>
                        </div>

                        {/* Prescriptions */}
                        <div>
                          <strong>Prescriptions</strong>
                          {prescriptions.length === 0 ? (
                            <p style={{ color: "#777" }}>No prescriptions yet.</p>
                          ) : (
                            prescriptions.map((p, idx) => (
                              <div key={idx} style={{ padding: 8, border: "1px solid #ddd", borderRadius: 6, marginTop: 6 }}>
                                <b>{p.medicineName}</b> — {p.dosage} ({p.duration})
                                <div style={{ fontSize: 12, color: "#555" }}>
                                  Prescribed by: {p.prescribedBy}
                                </div>
                                {p.notes && <div>Notes: {p.notes}</div>}
                              </div>
                            ))
                          )}
                        </div>

                        {/* Add prescription */}
                        {a.status !== "DOCTOR_COMPLETED" && (
                          <div style={{ marginTop: 12 }}>
                            <strong>Add Prescription</strong>
                            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 6 }}>
                              <input
                                placeholder="Medicine"
                                style={inputStyle}
                                value={presInputs[a._id]?.medicineName || ""}
                                onChange={(e) => handlePresChange(a._id, "medicineName", e.target.value)}
                              />
                              <input
                                placeholder="Dosage"
                                style={inputStyle}
                                value={presInputs[a._id]?.dosage || ""}
                                onChange={(e) => handlePresChange(a._id, "dosage", e.target.value)}
                              />
                              <input
                                placeholder="Duration"
                                style={inputStyle}
                                value={presInputs[a._id]?.duration || ""}
                                onChange={(e) => handlePresChange(a._id, "duration", e.target.value)}
                              />
                              <textarea
                                placeholder="Notes"
                                style={{ ...inputStyle, height: 60 }}
                                value={presInputs[a._id]?.notes || ""}
                                onChange={(e) => handlePresChange(a._id, "notes", e.target.value)}
                              />
                            </div>
                            <button style={actionBtnStyle("orange")} onClick={() => addPrescription(a._id)}>
                              Add Prescription
                            </button>
                          </div>
                        )}

                        {/* Assign Nurse */}
                        {a.prescription?.length > 0 && !a.nurse && (
                          <div style={{ marginTop: 20 }}>
                            <strong>Assign Nurse</strong>
                            <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                              <select
                                style={inputStyle}
                                value={assignNurseId[a._id] || ""}
                                onChange={(e) => setAssignNurseId((p) => ({ ...p, [a._id]: e.target.value }))}
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
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
          <button onClick={chooseCategory} style={chooseBtnStyle}>
            Submit
          </button>
        </div>
      ) : !user?.isVerified ? (
        <p style={{ color: "orange" }}>Waiting for admin approval...</p>
      ) : (
        <>{renderAppointmentTable()}</>
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
          <div style={bottomLinkStyle(false, true)} onClick={handleLogout}>
            Logout
          </div>
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

/* --- CSS & Helpers --- */
const sidebarStyle = { width: 250, background: "#111", height: "100vh", padding: "1rem", position: "fixed", display: "flex", flexDirection: "column", justifyContent: "space-between" };
const profileStyle = { textAlign: "center", paddingBottom: 10, borderBottom: "1px solid #444" };
const profilePicStyle = { width: 80, height: 80, borderRadius: "50%", objectFit: "cover" };
const menuItemStyle = (active) => ({ padding: 10, margin: "8px 0", borderRadius: 6, background: active ? "#333" : "transparent", color: active ? "#4CAF50" : "#fff", cursor: "pointer" });
const bottomLinkStyle = (active, isLogout = false) => ({ padding: 10, borderRadius: 8, textAlign: "center", background: isLogout ? "#ff4d4d" : active ? "#222" : "transparent", color: "#fff", cursor: "pointer" });
const selectStyle = { padding: 8, marginRight: 10, borderRadius: 6 };
const chooseBtnStyle = { padding: "8px 16px", background: "#4CAF50", border: "none", color: "white", borderRadius: 6, cursor: "pointer" };
const tableStyle = { width: "100%", marginTop: 20, background: "#fff", borderRadius: 10, borderCollapse: "collapse" };
const thStyle = { background: "#000", color: "#fff", padding: 12, textAlign: "left" };
const tdStyle = { padding: 12, verticalAlign: "top", borderBottom: "1px solid #eee" };
const trStyle = (i) => ({ background: i % 2 === 0 ? "#f9f9f9" : "#fff" });
const statusBadge = (status) => ({ padding: "5px 10px", borderRadius: 6, color: "#fff", fontWeight: "bold", background: status === "PENDING" ? "gray" : status === "DOCTOR_ACCEPTED" ? "green" : status === "NURSE_ASSIGNED" ? "blue" : status === "NURSE_COMPLETED" ? "orange" : status === "REJECTED" ? "red" : "#222" });
const actionBtnStyle = (color) => ({ padding: "6px 10px", border: "none", borderRadius: 6, margin: 2, color: "#fff", cursor: "pointer", background: color === "green" ? "#4CAF50" : color === "orange" ? "#FF9800" : color === "red" ? "#f44336" : "#777" });
const inputStyle = { padding: 8, borderRadius: 6, border: "1px solid #ddd", minWidth: 180 };
