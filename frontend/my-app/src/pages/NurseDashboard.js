import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ProfileSettings from "./ProfileSettings";

const BASE_URL = "http://localhost:5000/api";

export default function NurseDashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [activeSection, setActiveSection] = useState("Dashboard");
  const [user, setUser] = useState(null);

  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");

  const [assignedDoctor, setAssignedDoctor] = useState(null);
  const [loading, setLoading] = useState(true);

  /* --------------------------------------------------------
     LOAD NURSE + CATEGORIES
  -------------------------------------------------------- */
  useEffect(() => {
    if (!token) return;

    const loadData = async () => {
      try {
        // LOAD NURSE DETAILS
        const resUser = await axios.get(`${BASE_URL}/nurse/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const nurse = resUser.data.user;
        setUser(nurse);

        // LOAD CATEGORIES
        const resCat = await axios.get(`${BASE_URL}/nurse/categories`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCategories(resCat.data);

        // LOAD ASSIGNED DOCTOR
        if (nurse.selectedCategory && nurse.isVerified) {
          const resDoctor = await axios.get(`${BASE_URL}/nurse/my-doctor`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setAssignedDoctor(resDoctor.data);
        }

        setLoading(false);
      } catch (err) {
        console.error(err);
        alert("Error loading nurse dashboard");
      }
    };

    loadData();
  }, [token]);

  /* --------------------------------------------------------
     LOGOUT
  -------------------------------------------------------- */
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  /* --------------------------------------------------------
     NURSE CHOOSES CATEGORY
  -------------------------------------------------------- */
  const chooseCategory = async () => {
    if (!selectedCategoryId) return alert("Please select a category");

    try {
      await axios.put(
        `${BASE_URL}/nurse/choose-category`,
        { categoryId: selectedCategoryId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Category selected. Wait for doctor approval.");

      // reload nurse data
      const resUser = await axios.get(`${BASE_URL}/nurse/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUser(resUser.data.user);
    } catch (err) {
      console.error(err);
      alert("Error selecting category");
    }
  };

  /* --------------------------------------------------------
     UI: CATEGORY SELECTION
  -------------------------------------------------------- */
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

  /* --------------------------------------------------------
     UI: ASSIGNED DOCTOR
  -------------------------------------------------------- */
  const renderDoctorInfo = () => (
    <div style={doctorBox}>
      <h3 style={{ color: "#00626aee", marginBottom: "15px" }}>Assigned Doctor</h3>
      <p><b>Name:</b> {assignedDoctor?.name}</p>
      <p><b>Email:</b> {assignedDoctor?.email}</p>
      <p><b>Phone:</b> {assignedDoctor?.phone || "-"}</p>
      <p><b>Department:</b> {assignedDoctor?.selectedCategory?.name || "-"}</p>
    </div>
  );

  /* --------------------------------------------------------
     DASHBOARD MAIN
  -------------------------------------------------------- */
  const renderDashboard = () => (
    <div>
      {!user.selectedCategory ? (
        renderCategorySelection()
      ) : !user.isVerified ? (
        <p style={{ color: "#ff9800", marginTop: "20px", fontWeight: "bold" }}>
          Waiting for doctor approval...
        </p>
      ) : (
        <>
          <h3 style={{ marginTop: "30px", color: "#00626aee" }}>Your Assigned Doctor</h3>
          {assignedDoctor ? renderDoctorInfo() : <p>No doctor assigned yet.</p>}
        </>
      )}
    </div>
  );

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* ---------------- SIDEBAR ---------------- */}
      <div style={sidebarStyle}>
        <div>
          <div style={profileStyle}>
            <img
              src={user?.profilePic || "https://via.placeholder.com/80"}
              alt="profile"
              style={profilePicStyle}
            />
            <h3 style={{ color: "#fff" }}>{user?.name}</h3>
            <p style={{ color: "#ccc" }}>{user?.email}</p>
            {user?.selectedCategory && (
              <p style={{ color: "#aaa", fontSize: "12px" }}>
                Department: {user.selectedCategory.name}
              </p>
            )}
          </div>

          {["Dashboard", "My Doctor", "Profile"].map((menu) => (
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
          <div style={bottomLinkStyle} onClick={handleLogout}>
            Logout
          </div>
        </div>
      </div>

      {/* ---------------- CONTENT ---------------- */}
      <div style={contentAreaStyle}>
        {activeSection === "Dashboard" && renderDashboard()}
        {activeSection === "My Doctor" && (
          <div>
            <h2 style={{ color: "#00626aee", marginBottom: "20px" }}>My Doctor</h2>
            {assignedDoctor ? renderDoctorInfo() : <p>No doctor assigned yet.</p>}
          </div>
        )}
        {activeSection === "Profile" && <ProfileSettings />}
      </div>
    </div>
  );
}

/* ====================== STYLES ====================== */

const sidebarStyle = {
  width: "250px",
  background: "#00626aee",
  height: "100vh",
  padding: "1rem",
  position: "fixed",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  boxShadow: "2px 0 10px rgba(0,0,0,0.1)",
};

const profileStyle = {
  textAlign: "center",
  marginBottom: "20px",
  borderBottom: "1px solid rgba(255,255,255,0.2)",
  paddingBottom: "15px",
};

const profilePicStyle = {
  width: "80px",
  height: "80px",
  borderRadius: "50%",
  objectFit: "cover",
  border: "3px solid #00838f",
};

const menuItemStyle = (active) => ({
  padding: "12px 15px",
  margin: "6px 0",
  borderRadius: "8px",
  background: active ? "#00838f" : "transparent",
  color: "#fff",
  cursor: "pointer",
  fontWeight: "bold",
  transition: "background-color 0.2s ease",
  fontSize: "14px",
});

const bottomLinkStyle = {
  padding: "12px 15px",
  borderRadius: "8px",
  textAlign: "center",
  color: "#fff",
  cursor: "pointer",
  background: "#d32f2f",
  fontWeight: "bold",
  transition: "background-color 0.2s ease",
  fontSize: "14px",
};

const contentAreaStyle = {
  flex: 1,
  marginLeft: "250px",
  padding: "2rem",
  backgroundColor: "#f5f5f5",
  minHeight: "100vh",
};

const selectStyle = {
  padding: "10px 12px",
  marginRight: "10px",
  borderRadius: "6px",
  border: "1px solid #ccc",
  fontSize: "14px",
  minWidth: "250px",
};

const chooseBtnStyle = {
  padding: "10px 20px",
  background: "#00838f",
  border: "none",
  color: "white",
  borderRadius: "6px",
  cursor: "pointer",
  fontWeight: "bold",
  fontSize: "14px",
  transition: "background-color 0.2s ease",
};

const doctorBox = {
  background: "#fff",
  padding: "25px",
  borderRadius: "10px",
  width: "350px",
  fontSize: "15px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  borderLeft: "4px solid #00838f",
};

/* END */