// src/pages/DoctorDashboard.js
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

  const [nurses, setNurses] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ------------------------------------------
        LOAD DASHBOARD DATA
  ------------------------------------------- */
  useEffect(() => {
    if (!token) return;

    const loadData = async () => {
      try {
        const resUser = await axios.get(`${BASE_URL}/doctor/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(resUser.data.user);

        const resCat = await axios.get(`${BASE_URL}/doctor/categories`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCategories(resCat.data);

        const resNurse = await axios.get(`${BASE_URL}/doctor/nurse`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNurses(resNurse.data);

        const resAppt = await axios.get(`${BASE_URL}/appointment/appointments`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAppointments(resAppt.data);

        setLoading(false);
      } catch (err) {
        console.error(err);
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
        DOCTOR SELECT CATEGORY
  ------------------------------------------- */
  const chooseCategory = async () => {
    if (!selectedCategoryId) return alert("Select a department");

    try {
      await axios.put(
        `${BASE_URL}/doctor/choose-category`,
        { categoryId: selectedCategoryId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Category selected. Wait for admin approval.");

      const resUser = await axios.get(`${BASE_URL}/doctor/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUser(resUser.data.user);
    } catch (err) {
      console.error(err);
      alert("Error selecting category");
    }
  };

  /* ------------------------------------------
        NURSE ACTIONS
  ------------------------------------------- */
  const handleNurseAction = async (id, action) => {
    try {
      let url = "";
      let method = "put";

      if (action === "approve")
        url = `${BASE_URL}/doctor/nurse/approve/${id}`;
      else if (action === "disapprove")
        url = `${BASE_URL}/doctor/nurse/disapprove/${id}`;
      else {
        url = `${BASE_URL}/doctor/nurse/reject/${id}`;
        method = "delete";
      }

      await axios({
        url,
        method,
        headers: { Authorization: `Bearer ${token}` },
      });

      // refresh nurse list
      const updated = await axios.get(`${BASE_URL}/doctor/nurse`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setNurses(updated.data);
    } catch (err) {
      console.error(err);
      alert("Error updating nurse");
    }
  };

  /* ------------------------------------------
        UPDATE APPOINTMENT
        payload example: { action: 'accept' } OR { action: 'assign_nurse', nurseId }
  ------------------------------------------- */
  const updateAppointment = async (id, payload) => {
    try {
      await axios.put(
        `${BASE_URL}/appointment/appointment/${id}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // refresh appointment list after update
      const refreshed = await axios.get(`${BASE_URL}/appointment/appointments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAppointments(refreshed.data);

      // if assigning nurse or nurse approvals changed, refresh nurses too
      if (payload?.action === "assign_nurse") {
        const resNurse = await axios.get(`${BASE_URL}/doctor/nurse`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNurses(resNurse.data);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update appointment");
    }
  };

  /* ------------------------------------------
        CATEGORY SELECT UI
  ------------------------------------------- */
  const renderCategorySelection = () => (
    <div style={{ marginTop: "20px" }}>
      <select
        style={selectStyle}
        value={selectedCategoryId}
        onChange={(e) => setSelectedCategoryId(e.target.value)}
      >
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
  );

  /* ------------------------------------------
        NURSE TABLE
  ------------------------------------------- */
  const renderNurseTable = () => (
    <table style={tableStyle}>
      <thead>
        <tr>
          <th style={thStyle}>Name</th>
          <th style={thStyle}>Email</th>
          <th style={thStyle}>Phone</th>
          <th style={thStyle}>Status</th>
          <th style={thStyle}>Actions</th>
        </tr>
      </thead>

      <tbody>
        {nurses.map((n, i) => (
          <tr key={n._id} style={trStyle(i)}>
            <td style={tdStyle}>{n.name}</td>
            <td style={tdStyle}>{n.email}</td>
            <td style={tdStyle}>{n.phone || "-"}</td>
            <td style={tdStyle}>{n.isVerified ? "Approved" : "Pending"}</td>

            <td style={tdStyle}>
              {!n.isVerified ? (
                <>
                  <button
                    style={actionBtnStyle("green")}
                    onClick={() => handleNurseAction(n._id, "approve")}
                  >
                    Approve
                  </button>

                  <button
                    style={actionBtnStyle("red")}
                    onClick={() => handleNurseAction(n._id, "reject")}
                  >
                    Reject
                  </button>
                </>
              ) : (
                <>
                  <button
                    style={actionBtnStyle("orange")}
                    onClick={() => handleNurseAction(n._id, "disapprove")}
                  >
                    Disapprove
                  </button>

                  <button
                    style={actionBtnStyle("gray")}
                    onClick={() => handleNurseAction(n._id, "delete")}
                  >
                    Delete
                  </button>
                </>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  /* ------------------------------------------
        APPOINTMENT TABLE
  ------------------------------------------- */
  const renderAppointmentTable = () => (
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
          appointments.map((a, i) => (
            <tr key={a._id} style={trStyle(i)}>
              <td style={tdStyle}>{a.user?.name}</td>
              <td style={tdStyle}>{a.date}</td>
              <td style={tdStyle}>{a.time}</td>

              {/* Nurse Column */}
              <td style={tdStyle}>
                {a.nurse ? <b>{a.nurse.name}</b> : <i>Not Assigned</i>}
              </td>

              {/* Status */}
              <td style={tdStyle}>
                <span
                  style={{
                    padding: "5px 10px",
                    borderRadius: "6px",
                    color: "#fff",
                    fontWeight: "bold",
                    background:
                      a.status === "PENDING"
                        ? "gray"
                        : a.status === "DOCTOR_ACCEPTED"
                        ? "green"
                        : a.status === "NURSE_ASSIGNED"
                        ? "blue"
                        : a.status === "NURSE_COMPLETED"
                        ? "orange"
                        : a.status === "REJECTED"
                        ? "red"
                        : "#222",
                  }}
                >
                  {a.status}
                </span>
              </td>

              {/* ACTIONS */}
              <td style={tdStyle}>

                {/* PENDING */}
                {a.status === "PENDING" && (
                  <>
                    <button
                      style={actionBtnStyle("green")}
                      onClick={() => updateAppointment(a._id, { action: "accept" })}
                    >
                      Accept
                    </button>

                    <button
                      style={actionBtnStyle("red")}
                      onClick={() => updateAppointment(a._id, { action: "reject" })}
                    >
                      Reject
                    </button>
                  </>
                )}

                {/* ASSIGN NURSE */}
                {a.status === "DOCTOR_ACCEPTED" && !a.nurse && (
                  <select
                    style={selectStyle}
                    onChange={(e) =>
                      updateAppointment(a._id, {
                        action: "assign_nurse",
                        nurseId: e.target.value,
                      })
                    }
                    defaultValue=""
                  >
                    <option value="">Select Nurse</option>
                    {nurses
                      .filter((n) => n.isVerified)
                      .map((n) => (
                        <option key={n._id} value={n._id}>
                          {n.name}
                        </option>
                      ))}
                  </select>
                )}

                {/* Already Assigned Nurse */}
                {a.status === "DOCTOR_ACCEPTED" && a.nurse && (
                  <b style={{ color: "blue" }}>{a.nurse.name}</b>
                )}

                {/* Nurse Completed */}
                {a.status === "NURSE_ASSIGNED" && (
                  <button
                    style={actionBtnStyle("orange")}
                    onClick={() =>
                      updateAppointment(a._id, { action: "nurse_complete" })
                    }
                  >
                    Nurse Completed
                  </button>
                )}

                {/* Doctor Complete */}
                {a.status === "NURSE_COMPLETED" && (
                  <button
                    style={actionBtnStyle("green")}
                    onClick={() => updateAppointment(a._id, { action: "complete" })}
                  >
                    Complete
                  </button>
                )}

                {a.status === "DOCTOR_COMPLETED" && (
                  <span style={{ color: "green", fontWeight: "bold" }}>
                    ✔ Completed
                  </span>
                )}
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={6} style={{ textAlign: "center", padding: "20px" }}>
              No Appointments
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );

  /* ------------------------------------------
        DASHBOARD CONTENT
  ------------------------------------------- */
  const renderDashboard = () => (
    <div>
      {!user?.selectedCategory ? (
        renderCategorySelection()
      ) : !user?.isVerified ? (
        <p style={{ color: "orange" }}>Waiting for admin approval...</p>
      ) : (
        <>
          <h3>Nurse List</h3>
          {renderNurseTable()}
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
            <img
              src={user?.profilePic || "https://via.placeholder.com/80"}
              alt="profile"
              style={profilePicStyle}
            />
            <h3 style={{ color: "#fff" }}>{user?.name}</h3>
            <p style={{ color: "#aaa" }}>{user?.email}</p>
          </div>

          {["Dashboard", "Nurses", "Appointments", "Profile"].map((menu) => (
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
          <div style={bottomLinkStyle(false, true)} onClick={handleLogout}>
            Logout
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={{ flex: 1, marginLeft: "250px", padding: "2rem" }}>
        {activeSection === "Dashboard" && renderDashboard()}
        {activeSection === "Nurses" && renderNurseTable()}
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
};

const thStyle = {
  background: "#000",
  color: "#fff",
  padding: "12px",
};

const tdStyle = {
  padding: "12px",
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
  background:
    color === "green"
      ? "#4CAF50"
      : color === "orange"
      ? "#FF9800"
      : color === "red"
      ? "#f44336"
      : "#777",
});
