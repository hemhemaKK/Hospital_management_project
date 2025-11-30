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

  // UI states
  const [expandedAppts, setExpandedAppts] = useState({}); // appointmentId -> bool
  const [presInputs, setPresInputs] = useState({}); // appointmentId -> { medicineName, dosage, duration, notes }
  const [actionLoading, setActionLoading] = useState({}); // appointmentId -> bool

  /* ------------------------------------------
     Helper: Axios headers
  ------------------------------------------- */
  const authHeaders = () => ({ headers: { Authorization: `Bearer ${token}` } });

  /* ------------------------------------------
     AUTO REFRESH APPOINTMENTS (2s)
  ------------------------------------------- */
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

  /* ------------------------------------------
     LOAD INITIAL DATA (once)
  ------------------------------------------- */
  useEffect(() => {
    if (!token) return;

    const loadData = async () => {
      try {
        const [resUser, resCat, resAppt] = await Promise.all([
          axios.get(`${BASE_URL}/doctor/dashboard`, authHeaders()),
          axios.get(`${BASE_URL}/doctor/categories`, authHeaders()),
          axios.get(`${BASE_URL}/appointment/appointments`, authHeaders()),
        ]);

        setUser(resUser.data.user);
        setCategories(resCat.data || []);
        setAppointments(resAppt.data || []);

        // initialize prescription inputs for existing appointments (optional)
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

  /* ------------------------------------------
     LOGOUT
  ------------------------------------------- */
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  /* ------------------------------------------
     SELECT CATEGORY (doctor)
  ------------------------------------------- */
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

  /* ------------------------------------------
     Toggle expanded appointment UI
  ------------------------------------------- */
  const toggleExpand = (id) => {
    setExpandedAppts((s) => ({ ...s, [id]: !s[id] }));
    if (!presInputs[id]) {
      setPresInputs((p) => ({ ...p, [id]: { medicineName: "", dosage: "", duration: "", notes: "" } }));
    }
  };

  /* ------------------------------------------
     Prescription input handler
  ------------------------------------------- */
  const handlePresChange = (apptId, field, value) => {
    setPresInputs((p) => ({ ...p, [apptId]: { ...(p[apptId] || {}), [field]: value } }));
  };

  /* ------------------------------------------
     Update appointment helper (generic)
     - payload: { action: 'add_prescription' | 'complete' | 'accept' | 'reject', prescription?, ... }
  ------------------------------------------- */
  const updateAppointment = async (id, payload) => {
    setActionLoading((s) => ({ ...s, [id]: true }));
    try {
      await axios.put(`${BASE_URL}/appointment/appointment/${id}`, payload, authHeaders());
      // refresh appointments once done
      const refreshed = await axios.get(`${BASE_URL}/appointment/appointments`, authHeaders());
      setAppointments(refreshed.data || []);
    } catch (err) {
      console.error("Failed to update appointment", err);
      alert("Failed to update appointment");
    } finally {
      setActionLoading((s) => ({ ...s, [id]: false }));
    }
  };

  /* ------------------------------------------
     Add prescription only (doctor)
  ------------------------------------------- */
  const addPrescription = async (apptId) => {
    const inputs = presInputs[apptId] || {};
    if (!inputs.medicineName?.trim() || !inputs.dosage?.trim() || !inputs.duration?.trim()) {
      return alert("Please enter medicine name, dosage and duration");
    }
    const prescription = {
      medicineName: inputs.medicineName.trim(),
      dosage: inputs.dosage.trim(),
      duration: inputs.duration.trim(),
      notes: inputs.notes?.trim() || "",
    };

    await updateAppointment(apptId, { action: "add_prescription", prescription });
    // clear the inputs for that appointment
    setPresInputs((p) => ({ ...p, [apptId]: { medicineName: "", dosage: "", duration: "", notes: "" } }));
  };

  /* ------------------------------------------
     Add prescription AND mark complete (doctor immediate flow)
     - This will add prescription first, then mark appointment complete
  ------------------------------------------- */
  const addPrescriptionAndComplete = async (apptId) => {
    const inputs = presInputs[apptId] || {};
    if (!inputs.medicineName?.trim() || !inputs.dosage?.trim() || !inputs.duration?.trim()) {
      return alert("Please enter medicine name, dosage and duration");
    }
    const prescription = {
      medicineName: inputs.medicineName.trim(),
      dosage: inputs.dosage.trim(),
      duration: inputs.duration.trim(),
      notes: inputs.notes?.trim() || "",
    };

    // add prescription
    setActionLoading((s) => ({ ...s, [apptId]: true }));
    try {
      await axios.put(`${BASE_URL}/appointment/appointment/${apptId}`, { action: "add_prescription", prescription }, authHeaders());
      // now complete
      await axios.put(`${BASE_URL}/appointment/appointment/${apptId}`, { action: "complete" }, authHeaders());

      // refresh
      const refreshed = await axios.get(`${BASE_URL}/appointment/appointments`, authHeaders());
      setAppointments(refreshed.data || []);
      setPresInputs((p) => ({ ...p, [apptId]: { medicineName: "", dosage: "", duration: "", notes: "" } }));
    } catch (err) {
      console.error("Error add+complete", err);
      alert("Failed to add prescription and complete");
    } finally {
      setActionLoading((s) => ({ ...s, [apptId]: false }));
    }
  };

  /* ------------------------------------------
     Direct complete (doctor), allowed if any prescription exists OR confirm without prescription
  ------------------------------------------- */
  const directComplete = async (appt) => {
    if (!Array.isArray(appt.prescription) || appt.prescription.length === 0) {
      const ok = window.confirm("No prescription exists for this appointment. Do you want to mark it complete without a prescription?");
      if (!ok) return;
    }

    await updateAppointment(appt._id, { action: "complete" });
  };

  /* ------------------------------------------
     Simple accept / reject actions (doctor)
  ------------------------------------------- */
  const acceptAppointment = async (id) => {
    await updateAppointment(id, { action: "accept" });
  };
  const rejectAppointment = async (id) => {
    const ok = window.confirm("Are you sure you want to reject this appointment?");
    if (!ok) return;
    await updateAppointment(id, { action: "reject" });
  };

  /* ------------------------------------------
     UI RENDER: Category selection (if doctor not selected)
  ------------------------------------------- */
  const renderCategorySelection = () => (
    <div style={{ marginTop: "20px" }}>
      <select style={selectStyle} value={selectedCategoryId} onChange={(e) => setSelectedCategoryId(e.target.value)}>
        <option value="">Select Department</option>
        {categories.map((c) => (
          <option key={c._id} value={c._id}>
            {c.name}
          </option>
        ))}
      </select>

      <button onClick={chooseCategory} style={chooseBtnStyle}>Submit</button>
    </div>
  );

  /* ------------------------------------------
     APPOINTMENT TABLE (doctor-only flow)
  ------------------------------------------- */
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

                    {/* Nurse info (read-only in this doctor-only flow) */}
                    <td style={tdStyle}>{a.nurse ? <b>{a.nurse.name}</b> : <i>Not Assigned</i>}</td>

                    {/* Status badge */}
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
                                  a.status === "REJECTED" ? "red" : "#222"
                      }}>
                        {a.status}
                      </span>
                    </td>

                    {/* Actions (doctor) */}
                    <td style={tdStyle}>
                      {/* Pending: accept / reject */}
                      {a.status === "PENDING" && (
                        <>
                          <button style={actionBtnStyle("green")} onClick={() => acceptAppointment(a._id)} disabled={loadingThis}>
                            Accept
                          </button>
                          <button style={actionBtnStyle("red")} onClick={() => rejectAppointment(a._id)} disabled={loadingThis}>
                            Reject
                          </button>
                        </>
                      )}

                      {/* If accepted or nurse completed or already has prescription doctor can complete */}
                      {a.status !== "PENDING" && a.status !== "REJECTED" && a.status !== "DOCTOR_COMPLETED" && (
                        <>
                          <button style={actionBtnStyle("green")} onClick={() => directComplete(a)} disabled={loadingThis}>
                            Complete
                          </button>
                        </>
                      )}

                      {/* Completed */}
                      {a.status === "DOCTOR_COMPLETED" && <span style={{ color: "green", fontWeight: "bold" }}>✔ Completed</span>}
                    </td>
                  </tr>

                  {/* Expanded row: description, prescriptions, add-prescription & add+complete */}
                  {expanded && (
                    <tr>
                      <td colSpan={6} style={{ padding: 12, background: "#fbfbfb" }}>
                        <div style={{ display: "flex", gap: 20, flexDirection: "column" }}>
                          <div>
                            <strong>Description:</strong>
                            <p style={{ marginTop: 6 }}>{a.description || "-"}</p>
                          </div>

                          <div>
                            <strong>Prescriptions</strong>
                            {prescriptions.length === 0 ? (
                              <p style={{ color: "#6b7280" }}>No prescriptions yet.</p>
                            ) : (
                              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                {prescriptions.map((p, idx) => (
                                  <div key={idx} style={{ background: "#fff", padding: 8, borderRadius: 6, border: "1px solid #e6e6e6" }}>
                                    <div style={{ fontWeight: 700 }}>{p.medicineName} — {p.dosage}</div>
                                    <div style={{ fontSize: 13, color: "#555" }}>{p.duration}</div>
                                    {p.notes && <div style={{ marginTop: 6 }}>{p.notes}</div>}
                                    <div style={{ marginTop: 6, fontSize: 12, color: "#6b7280" }}>
                                      {p.prescribedBy && String(p.prescribedBy) === String(user?._id) ? "Prescribed by you" : "Prescribed by nurse/doctor"}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Add prescription controls (doctor-only flow) */}
                          {a.status !== "DOCTOR_COMPLETED" && (
                            <div>
                              <strong>Add Prescription (Doctor)</strong>
                              <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                                <input placeholder="Medicine name" value={(presInputs[a._id]?.medicineName) || ""} onChange={(e) => handlePresChange(a._id, "medicineName", e.target.value)} style={inputStyle} />
                                <input placeholder="Dosage (e.g., 1 tablet)" value={(presInputs[a._id]?.dosage) || ""} onChange={(e) => handlePresChange(a._id, "dosage", e.target.value)} style={inputStyle} />
                                <input placeholder="Duration (e.g., 7 days)" value={(presInputs[a._id]?.duration) || ""} onChange={(e) => handlePresChange(a._id, "duration", e.target.value)} style={inputStyle} />
                                <textarea placeholder="Notes (optional)" value={(presInputs[a._id]?.notes) || ""} onChange={(e) => handlePresChange(a._id, "notes", e.target.value)} style={{ ...inputStyle, height: 60 }} />
                              </div>

                              <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
                                <button style={actionBtnStyle("orange")} onClick={() => addPrescription(a._id)} disabled={!!actionLoading[a._id]}>
                                  {actionLoading[a._id] ? "Saving..." : "Add Prescription"}
                                </button>

                                <button style={actionBtnStyle("green")} onClick={() => addPrescriptionAndComplete(a._id)} disabled={!!actionLoading[a._id]}>
                                  {actionLoading[a._id] ? "Processing..." : "Add & Complete"}
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

  /* ------------------------------------------
     DASHBOARD render
  ------------------------------------------- */
  const renderDashboard = () => (
    <div>
      {!user?.selectedCategory ? (
        renderCategorySelection()
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
      <div style={{ flex: 1, marginLeft: "250px", padding: "2rem" }}>
        {activeSection === "Dashboard" && renderDashboard()}
        {activeSection === "Appointments" && renderAppointmentTable()}
        {activeSection === "Profile" && <ProfileSettings />}
      </div>
    </div>
  );
}

/* ---------------- CSS ------------------ */

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
    color === "green" ? "#4CAF50" : color === "orange" ? "#FF9800" : color === "red" ? "#f44336" : "#777",
});

const inputStyle = {
  padding: 8,
  borderRadius: 6,
  border: "1px solid #ddd",
  minWidth: 180,
};
