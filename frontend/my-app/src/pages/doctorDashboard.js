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
  const [loading, setLoading] = useState(true);

  /* ------------------------------------------------------
     LOAD DOCTOR + CATEGORIES
  ------------------------------------------------------ */
  useEffect(() => {
    if (!token) return;

    const loadData = async () => {
      try {
        // Doctor details
        const resUser = await axios.get(`${BASE_URL}/doctor/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const doctor = resUser.data.user;
        setUser(doctor);

        // Load categories
        const resCat = await axios.get(`${BASE_URL}/doctor/categories`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setCategories(resCat.data);

        // Load nurses if doctor approved
        if (doctor.isVerified && doctor.selectedCategory) {
          const resNurse = await axios.get(`${BASE_URL}/doctor/nurse`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setNurses(resNurse.data);
        }

        setLoading(false);
      } catch (err) {
        console.error(err);
        alert("Error loading dashboard");
      }
    };

    loadData();
  }, [token]);

  /* ------------------------------------------------------
     LOGOUT
  ------------------------------------------------------ */
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  /* ------------------------------------------------------
     SELECT CATEGORY
  ------------------------------------------------------ */
  const chooseCategory = async () => {
    if (!selectedCategoryId) return alert("Please select a department");

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

  /* ------------------------------------------------------
     NURSE ACTIONS
  ------------------------------------------------------ */
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

      alert(`Nurse ${action} successful`);
    } catch (err) {
      console.error(err);
      alert("Error updating nurse");
    }
  };

  /* ------------------------------------------------------
     UI: CATEGORY SELECTION
  ------------------------------------------------------ */
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
            {c.name} ({c.hospitalName})
          </option>
        ))}
      </select>

      <button onClick={chooseCategory} style={chooseBtnStyle}>
        Submit
      </button>
    </div>
  );

  /* ------------------------------------------------------
     UI: NURSE TABLE
  ------------------------------------------------------ */
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

  /* ------------------------------------------------------
     DASHBOARD VIEW
  ------------------------------------------------------ */
  const renderDashboard = () => (
    <div>
      {!user.selectedCategory ? (
        renderCategorySelection()
      ) : !user.isVerified ? (
        <p style={{ color: "orange", marginTop: "20px" }}>
          Waiting for admin approval...
        </p>
      ) : (
        <>
          <h3 style={{ marginTop: "30px" }}>Nurse List</h3>
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

          {["Dashboard", "Nurses", "Profile"].map((menu) => (
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

      {/* CONTENT */}
      <div style={{ flex: 1, marginLeft: "250px", padding: "2rem" }}>
        {activeSection === "Dashboard" && renderDashboard()}
        {activeSection === "Nurses" && renderNurseTable()}
        {activeSection === "Profile" && <ProfileSettings />}  {/* ✅ YOUR PROFILE PAGE */}
      </div>
    </div>
  );
}

/* ====================== CSS ====================== */

const sidebarStyle = {
  width: "250px",
  background: "#111",
  height: "100vh",
  padding: "1rem",
  position: "fixed",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
};

const profileStyle = {
  textAlign: "center",
  marginBottom: "20px",
  borderBottom: "1px solid #444",
  paddingBottom: "10px",
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
  color: "#fff",
  cursor: "pointer",
  background: isLogout ? "#ff4d4d" : active ? "#222" : "transparent",
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
  background: "#fff",
  borderRadius: "10px",
  marginTop: "20px",
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
  margin: "2px",
  borderRadius: "6px",
  background:
    color === "green"
      ? "#4CAF50"
      : color === "orange"
      ? "#FF9800"
      : color === "red"
      ? "#f44336"
      : "#777",
  border: "none",
  color: "#fff",
});
