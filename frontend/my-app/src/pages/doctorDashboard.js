import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ProfileSettings from "./ProfileSettings";
import SupportTicket from "./Support";
import SubCategoryDashboard from "./SubCategory";
import AssignComplaint from "./AssignComplaint";

const BASE_URL = "http://localhost:5000/api";

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [activeSection, setActiveSection] = useState("Dashboard");
  const [user, setUser] = useState(null);

  // NEW STATES
  const [hospitals, setHospitals] = useState([]);
  const [selectedHospitalId, setSelectedHospitalId] = useState("");

  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");

  const [nurses, setNurses] = useState([]);
  const [loading, setLoading] = useState(true);

  // FETCH DATA
  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      try {
        // doctor info
        const resUser = await axios.get(`${BASE_URL}/doctor/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const doctor = resUser.data.user;
        setUser(doctor);

        // Load hospitals if not selected
        if (!doctor.selectedHospital) {
          const resHospitals = await axios.get(`${BASE_URL}/superadmin/hospitals/list`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setHospitals(resHospitals.data);
        }

        // Load categories if not selected
        if (!doctor.selectedCategory) {
          const resCat = await axios.get(`${BASE_URL}/admin/category`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setCategories(resCat.data);
        }

        // Load nurses only when approved
        if (doctor.isApproved) {
          const resNurses = await axios.get(`${BASE_URL}/doctor/nurse`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setNurses(resNurses.data);
        }

        setLoading(false);
      } catch (err) {
        console.error(err);
        alert("Error loading dashboard");
      }
    };

    fetchData();
  }, [token]);

  // LOGOUT
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  // NEW ---> SELECT HOSPITAL + CATEGORY
  const chooseHospitalCategory = async () => {
    if (!selectedHospitalId) return alert("Please select a hospital!");
    if (!selectedCategoryId) return alert("Please select a category!");

    try {
      await axios.put(
        `${BASE_URL}/doctor/choose-hospital-category`,
        {
          hospitalId: selectedHospitalId,
          categoryId: selectedCategoryId,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // refresh
      const resUser = await axios.get(`${BASE_URL}/doctor/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUser(resUser.data.user);
      alert("Hospital & Category selected! Wait for admin approval.");
    } catch (err) {
      console.error(err);
      alert("Failed to select hospital & category");
    }
  };

  // Nurse actions
  const handleNurseAction = async (nurseId, action) => {
    try {
      let url = "";
      let method = "put";

      if (action === "approve")
        url = `${BASE_URL}/doctor/nurse/approve/${nurseId}`;
      else if (action === "disapprove")
        url = `${BASE_URL}/doctor/nurse/disapprove/${nurseId}`;
      else {
        url = `${BASE_URL}/doctor/nurse/reject/${nurseId}`;
        method = "delete";
      }

      await axios({
        method,
        url,
        headers: { Authorization: `Bearer ${token}` },
      });

      // refresh
      const resNurses = await axios.get(`${BASE_URL}/doctor/nurse`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNurses(resNurses.data);

      alert(`Nurse ${action} successful`);
    } catch (err) {
      console.error(err);
      alert("Error updating nurse");
    }
  };

  // UI: Nurse Table
  const renderNurseTable = () => (
    <div style={{ overflowX: "auto", marginTop: "20px" }}>
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>Name</th>
            <th style={thStyle}>Email</th>
            <th style={thStyle}>Phone</th>
            <th style={thStyle}>Category</th>
            <th style={thStyle}>Status</th>
            <th style={thStyle}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {nurses.map((n, idx) => (
            <tr key={n._id} style={trStyle(idx)}>
              <td style={tdStyle}>{n.name}</td>
              <td style={tdStyle}>{n.email}</td>
              <td style={tdStyle}>{n.phone || "-"}</td>
              <td style={tdStyle}>{n.selectedCategory?.name || "-"}</td>
              <td style={tdStyle}>{n.isApproved ? "Approved" : "Pending"}</td>
              <td style={tdStyle}>
                {!n.isApproved ? (
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
    </div>
  );

  // UI: Dashboard main
  const renderDashboard = () => (
    <div>
      {/* If doctor has NOT selected BOTH hospital + category */}
      {(!user.selectedHospital || !user.selectedCategory) && (
        <div style={{ marginTop: "20px" }}>
          {/* Hospital dropdown */}
          {!user.selectedHospital && (
            <select
              style={selectStyle}
              value={selectedHospitalId}
              onChange={(e) => setSelectedHospitalId(e.target.value)}
            >
              <option value="">Select Hospital</option>
              {hospitals.map((h) => (
                <option key={h._id} value={h._id}>
                  {h.hospitalName} - {h.address}
                </option>
              ))}
            </select>
          )}

          {/* Category dropdown */}
          {!user.selectedCategory && (
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
          )}

          <button onClick={chooseHospitalCategory} style={chooseBtnStyle}>
            Submit
          </button>
        </div>
      )}

      {/* Already selected hospital + category */}
      {user.selectedHospital && user.selectedCategory && (
        <>
          {!user.isApproved && (
            <p style={{ color: "orange", marginTop: "20px" }}>
              Waiting for Admin approval...
            </p>
          )}

          {user.isApproved && (
            <>
              <h3 style={{ marginTop: "30px" }}>Nurse List</h3>
              {renderNurseTable()}
            </>
          )}
        </>
      )}
    </div>
  );

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ display: "flex", background: "#f1f1f1", minHeight: "100vh" }}>
      {/* SIDEBAR */}
      <div style={sidebarStyle}>
        <div>
          <div style={profileStyle}>
            <img
              src={user?.profilePic || "https://via.placeholder.com/80"}
              alt="avatar"
              style={profilePicStyle}
            />
            <h3 style={{ color: "#fff" }}>{user.fullName || user.name}</h3>
            <p style={{ color: "#aaa" }}>{user.email}</p>
          </div>

          {["Dashboard", "Category", "Assign Complaint", "Support", "Profile"].map(
            (menu) => (
              <div
                key={menu}
                style={menuItemStyle(activeSection === menu)}
                onClick={() => setActiveSection(menu)}
              >
                {menu}
              </div>
            )
          )}
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <div style={bottomLinkStyle} onClick={handleLogout}>
            Logout
          </div>
        </div>
      </div>

      {/* MAIN */}
      <div style={{ marginLeft: "250px", flex: 1, padding: "2rem" }}>
        {activeSection === "Dashboard" && renderDashboard()}
        {activeSection === "Profile" && (
          <ProfileSettings user={user} setUser={setUser} />
        )}
        {activeSection === "Support" && <SupportTicket />}
        {activeSection === "Category" && <SubCategoryDashboard />}
        {activeSection === "Assign Complaint" && <AssignComplaint />}
      </div>
    </div>
  );
}

/* ------------ STYLES ------------ */

const sidebarStyle = {
  width: "250px",
  background: "#111",
  position: "fixed",
  left: 0,
  top: 0,
  height: "100vh",
  padding: "1rem",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
};

const profileStyle = {
  textAlign: "center",
  paddingBottom: "1rem",
  borderBottom: "1px solid #444",
};

const profilePicStyle = {
  width: "80px",
  height: "80px",
  borderRadius: "50%",
  objectFit: "cover",
};

const menuItemStyle = (isActive) => ({
  color: isActive ? "#4CAF50" : "#fff",
  padding: "0.8rem",
  cursor: "pointer",
  borderRadius: "8px",
  margin: "0.4rem 0",
  background: isActive ? "#333" : "transparent",
});

const bottomLinkStyle = {
  background: "#ff4d4d",
  color: "#fff",
  padding: "0.8rem",
  borderRadius: "8px",
  cursor: "pointer",
  textAlign: "center",
};

const tableStyle = {
  width: "100%",
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

const trStyle = (idx) => ({
  background: idx % 2 === 0 ? "#f9f9f9" : "#fff",
});

const actionBtnStyle = (color) => ({
  padding: "6px 10px",
  margin: "2px",
  borderRadius: "6px",
  border: "none",
  color: "#fff",
  background:
    color === "green"
      ? "#4CAF50"
      : color === "orange"
      ? "#FF9800"
      : color === "red"
      ? "#f44336"
      : "#777",
  cursor: "pointer",
});

const selectStyle = {
  marginRight: "10px",
  padding: "8px",
  borderRadius: "6px",
};

const chooseBtnStyle = {
  padding: "8px 15px",
  borderRadius: "6px",
  background: "#4CAF50",
  color: "#fff",
  border: "none",
  cursor: "pointer",
};
