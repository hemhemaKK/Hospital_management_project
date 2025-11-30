import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ProfileSettings from "./ProfileSettings";

const BASE_URL = "https://hospital-management-project-gf55.onrender.com/api";

export default function NurseDashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [activeSection, setActiveSection] = useState("Dashboard");
  const [user, setUser] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);

  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");

  const [assignedDoctor, setAssignedDoctor] = useState(null);
  const [loading, setLoading] = useState(true);

  const [appointments, setAppointments] = useState([]);
  const [prescriptionText, setPrescriptionText] = useState({}); // keyed by appointmentId

  // Check if mobile on mount and resize
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

  /* --------------------------------------------------------
     LOAD NURSE + CATEGORIES + NURSE APPOINTMENTS
  -------------------------------------------------------- */
  useEffect(() => {
    if (!token) return;

    const loadData = async () => {
      try {
        // LOAD NURSE PROFILE
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

        // LOAD APPOINTMENTS ASSIGNED TO THIS NURSE
        const resAppt = await axios.get(
          `${BASE_URL}/appointment/nurse/appointments`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setAppointments(resAppt.data);

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

  /* --------------------------------------------------------
     NURSE → SELECT CATEGORY
  -------------------------------------------------------- */
  const chooseCategory = async () => {
    if (!selectedCategoryId)
      return alert("Please select a category before submitting.");

    try {
      await axios.put(
        `${BASE_URL}/nurse/choose-category`,
        { categoryId: selectedCategoryId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Category selected. Wait for doctor approval.");

      // Reload nurse data
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
     MARK APPOINTMENT AS COMPLETED
  -------------------------------------------------------- */
  const markAsComplete = async (appointmentId) => {
    try {
      await axios.put(
        `${BASE_URL}/appointment/appointment/${appointmentId}`,
        { action: "nurse_complete" },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Appointment marked as completed");
      refreshAppointments();
    } catch (err) {
      console.error(err);
      alert("Error completing appointment");
    }
  };

  /* --------------------------------------------------------
     ADD PRESCRIPTION
  -------------------------------------------------------- */
  const addPrescription = async (appointmentId) => {
    const text = prescriptionText[appointmentId];
    if (!text || !text.trim())
      return alert("Enter prescription before submitting");

    try {
      await axios.put(
        `${BASE_URL}/appointment/appointment/${appointmentId}`,
        {
          action: "add_prescription",
          prescription: {
            medicineName: text,
            dosage: "N/A",
            duration: "N/A",
            notes: "",
          },
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Prescription added");
      setPrescriptionText((prev) => ({ ...prev, [appointmentId]: "" }));
      refreshAppointments();
    } catch (err) {
      console.error(err);
      alert("Error adding prescription");
    }
  };

  const refreshAppointments = async () => {
    const res = await axios.get(`${BASE_URL}/appointment/nurse/appointments`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setAppointments(res.data);
  };

  /* --------------------------------------------------------
     CATEGORY SELECT UI
  -------------------------------------------------------- */
  const renderCategorySelection = () => (
    <div style={categorySelectionStyle}>
      <select
        style={selectStyle(isMobile)}
        value={selectedCategoryId}
        onChange={(e) => setSelectedCategoryId(e.target.value)}
      >
        <option value="">Select Category</option>
        {categories.map((c) => (
          <option key={c._id} value={c._id}>
            {c.name} ({c.hospitalName})
          </option>
        ))}
      </select>

      <button onClick={chooseCategory} style={chooseBtnStyle(isMobile)}>
        Submit
      </button>
    </div>
  );

  /* --------------------------------------------------------
     DOCTOR INFO UI
  -------------------------------------------------------- */
  const renderDoctorInfo = () =>
    assignedDoctor ? (
      <div style={doctorBox(isMobile)}>
        <h3>Assigned Doctor</h3>
        <p>
          <b>Name:</b> {assignedDoctor?.name}
        </p>
        <p>
          <b>Email:</b> {assignedDoctor?.email}
        </p>
        <p>
          <b>Phone:</b> {assignedDoctor?.phone || "-"}
        </p>
      </div>
    ) : (
      <p>No doctor assigned yet.</p>
    );

  /* --------------------------------------------------------
     NURSE APPOINTMENTS UI
  -------------------------------------------------------- */
  const renderAppointments = () => (
    <div style={appointmentsContainerStyle}>
      <h2>My Appointments</h2>

      {appointments.length === 0 ? (
        <p>No appointments assigned to you yet.</p>
      ) : (
        appointments.map((appt) => (
          <div
            key={appt._id}
            style={appointmentCardStyle(isMobile)}
          >
            <h3 style={{ margin: "0 0 10px 0", fontSize: isMobile ? "18px" : "20px" }}>{appt.user?.name}</h3>
            <p style={appointmentDetailStyle}>
              <b>Date:</b> {appt.date}
            </p>
            <p style={appointmentDetailStyle}>
              <b>Time:</b> {appt.time}
            </p>
            <p style={appointmentDetailStyle}>
              <b>Doctor:</b> {appt.doctor?.name}
            </p>
            <p style={appointmentDetailStyle}>
              <b>Description:</b> {appt.description}
            </p>

            {/* STATUS BADGE */}
            <p style={appointmentDetailStyle}>
              <b>Status:</b>{" "}
              <span
                style={statusBadgeStyle(appt.status)}
              >
                {appt.status}
              </span>
            </p>

            {/* EXISTING PRESCRIPTIONS */}
            <div style={{ marginTop: "10px" }}>
              <h4 style={{ margin: "15px 0 10px 0", fontSize: isMobile ? "16px" : "18px" }}>Prescriptions:</h4>
              {appt.prescription?.length === 0 ? (
                <p>No prescriptions yet.</p>
              ) : (
                appt.prescription.map((p, i) => (
                  <div key={i} style={prescriptionItemStyle}>
                    <b>{p.prescribedBy === appt.doctor?._id ? "Doctor" : "Nurse"}:</b>{" "}
                    {p.medicineName} | {p.dosage} | {p.duration} | {p.notes}
                  </div>
                ))
              )}
            </div>

            {/* Action Buttons Container */}
            <div style={actionButtonsContainerStyle(isMobile)}>
              {/* Complete Button */}
              <button
                style={completeBtnStyle(isMobile, appt.status === "NURSE_COMPLETED")}
                disabled={appt.status === "NURSE_COMPLETED"}
                onClick={() => markAsComplete(appt._id)}
              >
                {appt.status === "NURSE_COMPLETED"
                  ? "Completed"
                  : "Mark as Complete"}
              </button>
            </div>

            {/* Prescription Input */}
            <textarea
              placeholder="Add Prescription..."
              style={textAreaStyle(isMobile)}
              value={prescriptionText[appt._id] || ""}
              onChange={(e) =>
                setPrescriptionText((prev) => ({
                  ...prev,
                  [appt._id]: e.target.value,
                }))
              }
            />

            <button
              style={presBtnStyle(isMobile)}
              onClick={() => addPrescription(appt._id)}
            >
              Save Prescription
            </button>
          </div>
        ))
      )}
    </div>
  );

  /* --------------------------------------------------------
     DASHBOARD MAIN VIEW
  -------------------------------------------------------- */
  const renderDashboard = () => (
    <div style={dashboardContainerStyle}>
      {!user.selectedCategory ? (
        renderCategorySelection()
      ) : !user.isVerified ? (
        <p style={waitingApprovalStyle}>
          Waiting for doctor approval...
        </p>
      ) : (
        <>
          <h3 style={{ marginTop: "30px", fontSize: isMobile ? "20px" : "24px" }}>Your Assigned Doctor</h3>
          {renderDoctorInfo()}
        </>
      )}
    </div>
  );

  if (loading) return <p>Loading...</p>;

  return (
    <div style={containerStyle}>
      {/* Mobile Header with Logout Button - Always Visible on Mobile */}
      {isMobile && (
        <div style={mobileHeaderStyle}>
          <div style={mobileHeaderContent}>
            {/* Hamburger Menu */}
            <button 
              style={hamburgerStyle}
              onClick={toggleSidebar}
            >
              <span style={hamburgerLineStyle}></span>
              <span style={hamburgerLineStyle}></span>
              <span style={hamburgerLineStyle}></span>
            </button>
            
            <div style={mobileUserInfo}>
              <img
                src={user?.profilePic || "https://via.placeholder.com/35"}
                alt="profile"
                style={mobileProfilePicStyle}
              />
              <div style={mobileUserText}>
                <h3 style={{ margin: 0, fontSize: "14px", color: "#fff" }}>{user?.name}</h3>
                <p style={{ margin: 0, fontSize: "11px", color: "#ccc" }}>{user?.role}</p>
              </div>
            </div>

            {/* Mobile Logout Button */}
            <button
              style={mobileLogoutButtonStyle}
              onClick={handleLogout}
              title="Logout"
            >
              Logout
            </button>
          </div>
        </div>
      )}

      {/* Mobile Overlay */}
      {isMobile && sidebarVisible && (
        <div 
          style={overlayStyle}
          onClick={closeSidebar}
        />
      )}

      {/* ---------------- SIDEBAR ---------------- */}
      <div style={{
        ...sidebarStyle,
        left: isMobile ? (sidebarVisible ? "0" : "-250px") : "0",
        top: isMobile ? "60px" : "0",
        height: isMobile ? "calc(100vh - 60px)" : "100vh",
        transition: "left 0.3s ease-in-out",
      }}>
        <div>
          <div style={profileStyle}>
            <img
              src={user?.profilePic || "https://via.placeholder.com/80"}
              alt="profile"
              style={profilePicStyle}
            />
            <h3 style={{ color: "#fff", fontSize: isMobile ? "16px" : "18px", margin: "10px 0 5px 0" }}>{user?.name}</h3>
            <p style={{ color: "#aaa", fontSize: isMobile ? "12px" : "14px", margin: 0 }}>{user?.email}</p>
          </div>

          {["Dashboard", "My Doctor", "Appointments", "Profile"].map(
            (menu) => (
              <div
                key={menu}
                style={menuItemStyle(activeSection === menu)}
                onClick={() => handleMenuClick(menu)}
              >
                {menu}
              </div>
            )
          )}
        </div>

        <div style={{ padding: "0.5rem" }}>
          {/* Only show sidebar logout on desktop */}
          {!isMobile && (
            <div style={bottomLinkStyle(false, true)} onClick={handleLogout}>
              Logout
            </div>
          )}
        </div>
      </div>

      {/* ---------------- CONTENT ---------------- */}
      <div style={contentStyle(isMobile)}>
        {activeSection === "Dashboard" && renderDashboard()}
        {activeSection === "My Doctor" && renderDoctorInfo()}
        {activeSection === "Appointments" && renderAppointments()}
        {activeSection === "Profile" && <ProfileSettings />}
      </div>
    </div>
  );
}

/* ====================== RESPONSIVE STYLES ====================== */

const containerStyle = {
  display: "flex",
  minHeight: "100vh",
  position: "relative",
};

// Mobile Header Styles
const mobileHeaderStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  background: "#111",
  padding: "10px 15px",
  zIndex: 1000,
  boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
  borderBottom: "1px solid #444",
  boxSizing: "border-box",
};

const mobileHeaderContent = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  width: "100%",
};

const mobileUserInfo = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  flex: 1,
  marginLeft: "10px",
};

const mobileUserText = {
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
};

const mobileProfilePicStyle = {
  width: "35px",
  height: "35px",
  borderRadius: "50%",
  objectFit: "cover",
  border: "2px solid #4CAF50",
};

const mobileLogoutButtonStyle = {
  background: "#ff4d4d",
  color: "white",
  border: "none",
  borderRadius: "6px",
  padding: "8px 12px",
  cursor: "pointer",
  fontSize: "12px",
  fontWeight: "bold",
  whiteSpace: "nowrap",
};

// Hamburger Menu Styles
const hamburgerStyle = {
  background: "transparent",
  border: "none",
  cursor: "pointer",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  width: "25px",
  height: "20px",
  padding: 0,
};

const hamburgerLineStyle = {
  width: "100%",
  height: "3px",
  backgroundColor: "#fff",
  borderRadius: "2px",
  transition: "all 0.3s ease",
};

const overlayStyle = {
  position: "fixed",
  top: "60px",
  left: 0,
  width: "100%",
  height: "calc(100% - 60px)",
  backgroundColor: "rgba(0,0,0,0.5)",
  zIndex: 998,
};

const sidebarStyle = {
  width: "250px",
  background: "#111",
  padding: "1rem",
  position: "fixed",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  zIndex: 999,
  boxSizing: "border-box",
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
  padding: "12px",
  margin: "8px 0",
  borderRadius: "6px",
  background: active ? "#333" : "transparent",
  color: active ? "#4CAF50" : "#fff",
  cursor: "pointer",
  transition: "all 0.2s ease",
  fontSize: "14px",
});

const bottomLinkStyle = (active, isLogout = false) => ({
  padding: "12px",
  borderRadius: "8px",
  textAlign: "center",
  color: "#fff",
  cursor: "pointer",
  background: isLogout ? "#ff4d4d" : active ? "#222" : "transparent",
  transition: "background-color 0.2s ease",
  fontSize: "14px",
});

const contentStyle = (isMobile) => ({
  flex: 1,
  marginLeft: isMobile ? "0" : "250px",
  padding: isMobile ? "80px 15px 15px 15px" : "2rem",
  transition: "all 0.3s ease-in-out",
  minHeight: "100vh",
  boxSizing: "border-box",
  width: isMobile ? "100%" : "calc(100% - 250px)",
});

// Category Selection Styles
const categorySelectionStyle = {
  marginTop: "20px",
  display: "flex",
  flexDirection: "column",
  gap: "10px",
  width: "100%",
};

const selectStyle = (isMobile) => ({
  padding: "12px",
  borderRadius: "6px",
  border: "1px solid #ddd",
  fontSize: isMobile ? "14px" : "16px",
  width: "100%",
  boxSizing: "border-box",
});

const chooseBtnStyle = (isMobile) => ({
  padding: "12px 20px",
  background: "#4CAF50",
  border: "none",
  color: "white",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: isMobile ? "14px" : "16px",
  width: isMobile ? "100%" : "auto",
  fontWeight: "bold",
});

const waitingApprovalStyle = {
  color: "orange",
  marginTop: "20px",
  fontSize: "16px",
  textAlign: "center",
  padding: "20px",
};

// Doctor Info Styles
const doctorBox = (isMobile) => ({
  background: "#fff",
  padding: "20px",
  borderRadius: "10px",
  width: isMobile ? "100%" : "300px",
  fontSize: isMobile ? "14px" : "16px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  boxSizing: "border-box",
  marginTop: "10px",
});

// Appointments Styles
const appointmentsContainerStyle = {
  width: "100%",
};

const appointmentCardStyle = (isMobile) => ({
  background: "#fff",
  padding: isMobile ? "12px" : "16px",
  borderRadius: "10px",
  marginBottom: "16px",
  boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
  boxSizing: "border-box",
  width: "100%",
});

const appointmentDetailStyle = {
  margin: "8px 0",
  fontSize: "14px",
  lineHeight: "1.4",
};

const statusBadgeStyle = (status) => ({
  padding: "4px 8px",
  borderRadius: "6px",
  color: "#fff",
  background: status === "NURSE_COMPLETED" ? "green" : "orange",
  fontSize: "12px",
  fontWeight: "bold",
  display: "inline-block",
});

const prescriptionItemStyle = {
  marginBottom: "6px",
  fontSize: "13px",
  padding: "8px",
  background: "#f8f9fa",
  borderRadius: "4px",
  borderLeft: "3px solid #4CAF50",
};

const actionButtonsContainerStyle = (isMobile) => ({
  display: "flex",
  flexDirection: isMobile ? "column" : "row",
  gap: "10px",
  marginTop: "15px",
});

const completeBtnStyle = (isMobile, isCompleted) => ({
  padding: "10px 16px",
  background: isCompleted ? "#ccc" : "green",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: isCompleted ? "not-allowed" : "pointer",
  fontSize: isMobile ? "13px" : "14px",
  width: isMobile ? "100%" : "auto",
  opacity: isCompleted ? 0.6 : 1,
  fontWeight: "bold",
});

const textAreaStyle = (isMobile) => ({
  width: "100%",
  height: "70px",
  marginTop: "10px",
  padding: "10px",
  borderRadius: "6px",
  border: "1px solid #ccc",
  fontSize: isMobile ? "14px" : "16px",
  boxSizing: "border-box",
  fontFamily: "inherit",
});

const presBtnStyle = (isMobile) => ({
  padding: "10px 16px",
  background: "#3b82f6",
  color: "white",
  border: "none",
  borderRadius: "6px",
  marginTop: "10px",
  cursor: "pointer",
  width: "100%",
  fontSize: isMobile ? "14px" : "16px",
  fontWeight: "bold",
});

const dashboardContainerStyle = {
  width: "100%",
};