import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ProfileSettings from "./ProfileSettings";
import "./DoctorDashboard.css";

const BASE_URL = "https://hospital-management-project-gf55.onrender.com/api";

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [activeSection, setActiveSection] = useState("Dashboard");
  const [user, setUser] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [nurses, setNurses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);

  /* ------------------------------------------------------
     MOBILE DETECTION
  ------------------------------------------------------ */
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) {
        setSidebarVisible(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

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
     MOBILE MENU HANDLERS
  ------------------------------------------------------ */
  const handleMenuClick = (menu) => {
    setActiveSection(menu);
    if (isMobile) {
      setSidebarVisible(false);
    }
  };

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  const closeSidebar = () => {
    setSidebarVisible(false);
  };

  /* ------------------------------------------------------
     UI: CATEGORY SELECTION
  ------------------------------------------------------ */
  const renderCategorySelection = () => (
    <div style={{ marginTop: "20px" }}>
      <select
        className="select-field"
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

      <button onClick={chooseCategory} className="choose-btn">
        Submit
      </button>
    </div>
  );

  /* ------------------------------------------------------
     UI: NURSE TABLE (Desktop)
  ------------------------------------------------------ */
  const renderNurseTable = () => (
    <div className="table-container">
      <table className="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {nurses.map((n, i) => (
            <tr key={n._id}>
              <td>{n.name}</td>
              <td>{n.email}</td>
              <td>{n.phone || "-"}</td>
              <td>
                <span className={n.isVerified ? "status-approved" : "status-pending"}>
                  {n.isVerified ? "Approved" : "Pending"}
                </span>
              </td>

              <td>
                {!n.isVerified ? (
                  <>
                    <button
                      className="btn btn-primary"
                      onClick={() => handleNurseAction(n._id, "approve")}
                    >
                      Approve
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleNurseAction(n._id, "reject")}
                    >
                      Reject
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className="btn btn-warning"
                      onClick={() => handleNurseAction(n._id, "disapprove")}
                    >
                      Disapprove
                    </button>
                    <button
                      className="btn btn-secondary"
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

  /* ------------------------------------------------------
     UI: NURSE MOBILE CARDS
  ------------------------------------------------------ */
  const renderNurseMobileCards = () => (
    <div className="mobile-card-view">
      {nurses.map((n) => (
        <div key={n._id} className="mobile-card">
          <div className="mobile-card-row">
            <span className="mobile-card-label">Name:</span>
            <span className="mobile-card-value">{n.name || "-"}</span>
          </div>
          <div className="mobile-card-row">
            <span className="mobile-card-label">Email:</span>
            <span className="mobile-card-value">{n.email || "-"}</span>
          </div>
          <div className="mobile-card-row">
            <span className="mobile-card-label">Phone:</span>
            <span className="mobile-card-value">{n.phone || "-"}</span>
          </div>
          <div className="mobile-card-row">
            <span className="mobile-card-label">Status:</span>
            <span className={`mobile-card-value ${n.isVerified ? "status-approved" : "status-pending"}`}>
              {n.isVerified ? "Approved" : "Pending"}
            </span>
          </div>
          <div className="mobile-card-actions">
            {!n.isVerified ? (
              <>
                <button
                  className="btn btn-primary"
                  onClick={() => handleNurseAction(n._id, "approve")}
                >
                  Approve
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => handleNurseAction(n._id, "reject")}
                >
                  Reject
                </button>
              </>
            ) : (
              <>
                <button
                  className="btn btn-warning"
                  onClick={() => handleNurseAction(n._id, "disapprove")}
                >
                  Disapprove
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => handleNurseAction(n._id, "delete")}
                >
                  Delete
                </button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  /* ------------------------------------------------------
     DASHBOARD VIEW
  ------------------------------------------------------ */
  const renderDashboard = () => (
    <div>
      {!user.selectedCategory ? (
        renderCategorySelection()
      ) : !user.isVerified ? (
        <p style={{ color: "#ff9800", marginTop: "20px", fontWeight: "bold" }}>
          Waiting for admin approval...
        </p>
      ) : (
        <>
          <h3 style={{ marginTop: "30px", color: "#00626aee" }}>Nurse List</h3>
          {renderNurseTable()}
          {renderNurseMobileCards()}
        </>
      )}
    </div>
  );

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ display: "flex" }}>
      {/* Mobile Hamburger Menu */}
      <button 
        className={`hamburger-menu ${sidebarVisible ? 'active' : ''}`}
        onClick={toggleSidebar}
      >
        <span className="hamburger-line"></span>
        <span className="hamburger-line"></span>
        <span className="hamburger-line"></span>
      </button>

      {/* Mobile Overlay */}
      {isMobile && (
        <div 
          className={`mobile-overlay ${sidebarVisible ? 'visible' : ''}`}
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <div className={`sidebar ${isMobile ? (sidebarVisible ? 'mobile-visible' : 'mobile-hidden') : ''}`}>
        <div>
          <div className="profile-section">
            <img
              src={user?.profilePic || "https://i.pinimg.com/originals/ec/8c/e0/ec8ce013e5be3d2448bddfe9e10ee5af.jpg"}
              alt="profile"
              className="profile-pic"
            />
            <h3 style={{ color: "#fff" }}>{user?.name}</h3>
            <p style={{ color: "#ccc" }}>{user?.email}</p>
            {user?.selectedCategory && (
              <p style={{ color: "#aaa", fontSize: "12px" }}>
                Department: {user.selectedCategory.name}
              </p>
            )}
          </div>

          {["Dashboard", "Nurses", "Profile"].map((menu) => (
            <button
              key={menu}
              className={`menu-item ${activeSection === menu ? 'active' : ''}`}
              onClick={() => handleMenuClick(menu)}
            >
              {menu}
            </button>
          ))}
        </div>

        <div style={{ padding: "0.5rem" }}>
          <button className="bottom-link" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      {/* CONTENT */}
      <div className={`content-area ${isMobile ? 'mobile-full' : ''}`}>
        {activeSection === "Dashboard" && renderDashboard()}
        {activeSection === "Nurses" && (
          <div>
            <h2 style={{ color: "#00626aee", marginBottom: "20px" }}>Nurse Management</h2>
            {renderNurseTable()}
            {renderNurseMobileCards()}
          </div>
        )}
        {activeSection === "Profile" && <ProfileSettings />}
      </div>
    </div>
  );
}