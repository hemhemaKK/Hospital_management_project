import { useState, useEffect } from "react";
import axios from "axios";
import { FaBars, FaTimes, FaSignOutAlt } from "react-icons/fa";

import ProfileSettings from "../pages/ProfileSettings";
import SupportTicket from "./Support";
import Complaint from "./UserComplaints";
import ComplaintStatus from "./complaintStatus";
import Chatbot from "./chatbot";

// 🆕 Appointment Components (YOU WILL SEND THESE NEXT)
import Appointment from "./Appointment";
import AppointmentStatus from "./AppointmentStatus";
import Reports from "./Reports";
import Prescription from "./Prescription";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("Dashboard");
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) setMenuOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No token found");

        const res = await axios.get("https://hospital-management-project-gf55.onrender.com/api/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUser(res.data.user);
      } catch (err) {
        console.error("Authorization error:", err);
        localStorage.removeItem("token");
        alert("Not authorized. Please login again.");
        window.location.href = "/login";
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleMenuItemClick = (section) => {
    setActiveSection(section);
    if (isMobile) {
      setMenuOpen(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobile && menuOpen) {
        const sidebar = document.querySelector('.sidebar');
        const hamburger = document.querySelector('.hamburger');
        if (sidebar && !sidebar.contains(event.target) && 
            hamburger && !hamburger.contains(event.target)) {
          setMenuOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobile, menuOpen]);

  if (loading) return <p>Loading...</p>;
  if (!user) return <p>User data not found.</p>;

  const sections = [
    "Dashboard",
    "Appointment",
    "Appointment Status",
    "Report",
    "Prescription",
    "Support",
    "Profile",
  ];

  const renderSection = () => {
    switch (activeSection) {
      case "Dashboard":
        return (
          <div style={cards}>
            <div style={cardStyle(isMobile)}>
              <h2>Welcome, {user.name}</h2>
              <p>This is your dashboard overview.</p>
            </div>
          </div>
        );

      case "Profile":
        return <ProfileSettings user={user} />;

      case "Support":
        return <SupportTicket user={user} />;

      case "Complaint Status":
        return <ComplaintStatus user={user} />;

      case "Appointment":
        return <Appointment user={user} />;

      case "Appointment Status":
        return <AppointmentStatus user={user} />;

      case "Report":
        return <Reports user={user} />;

      case "Prescription":
        return <Prescription user={user} />;

      default:
        return <p>Section not found</p>;
    }
  };

  return (
    <div style={mainContainer}>
      {/* Mobile Header with Logout Button - Always Visible on Mobile */}
      {isMobile && (
        <div style={mobileHeaderStyle}>
          <div style={mobileHeaderContent}>
            <div 
              className="hamburger"
              onClick={() => setMenuOpen(!menuOpen)} 
              style={hamburgerStyle}
            >
              {menuOpen ? <FaTimes /> : <FaBars />}
            </div>
            
            <div style={mobileUserInfo}>
              <img
                src={user.profilePic || "https://via.placeholder.com/40"}
                alt="Profile"
                style={mobileProfilePicStyle}
              />
              <div style={mobileUserText}>
                <p style={{ margin: 0, fontWeight: "bold", fontSize: "14px" }}>
                  {user.name}
                </p>
                <p style={{ margin: 0, fontSize: "11px", color: "#666" }}>
                  {user.role?.toUpperCase() || "USER"}
                </p>
              </div>
            </div>

            {/* Mobile Logout Button - Always Visible */}
            <button
              style={mobileLogoutButtonStyle}
              onClick={handleLogout}
              title="Logout"
            >
              <FaSignOutAlt />
            </button>
          </div>
        </div>
      )}

      {isMobile && menuOpen && (
        <div style={overlayStyle} onClick={() => setMenuOpen(false)} />
      )}

      {/* Sidebar */}
      <div
        className="sidebar"
        style={{
          ...menuStyle,
          left: isMobile ? (menuOpen ? "0" : "-250px") : "0",
          top: isMobile ? "60px" : "0", // Adjust top for mobile header
          height: isMobile ? "calc(100vh - 60px)" : "100vh", // Adjust height for mobile header
          transition: "left 0.3s ease-in-out",
          zIndex: 999,
        }}
      >
        <div style={userInfoStyle}>
          <img
            src={user.profilePic || "https://via.placeholder.com/60"}
            alt="Profile"
            style={profilePicStyle}
          />
          <div>
            <p style={{ margin: 0, fontWeight: "bold" }}>{user.name}</p>
            <p style={{ margin: 0, fontSize: "0.85rem", color: "#ccc" }}>
              {user.email}
            </p>
            <p style={{ margin: 0, fontSize: "0.8rem", color: "#aaa" }}>
              Role: {user.role?.toUpperCase() || "USER"}
            </p>
          </div>
        </div>

        {sections.map((section) => (
          <div
            key={section}
            style={menuItemStyle(activeSection === section)}
            onClick={() => handleMenuItemClick(section)}
          >
            {section}
          </div>
        ))}

        {/* Desktop Logout Button - Only visible in sidebar on desktop */}
        {!isMobile && (
          <button
            style={logoutButtonStyle}
            onClick={handleLogout}
          >
            Logout
          </button>
        )}
      </div>

      {/* Content Area */}
      <div style={contentStyle(isMobile, menuOpen)}>
        {renderSection()}
        <Chatbot userId={user._id} />
      </div>
    </div>
  );
}

// ---------------- STYLES ----------------
const mainContainer = {
  display: "flex",
  minHeight: "100vh",
  position: "relative",
};

// NEW: Mobile Header Styles
const mobileHeaderStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  backgroundColor: "#fff",
  padding: "10px 15px",
  zIndex: 1000,
  boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
  borderBottom: "1px solid #e0e0e0",
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
  border: "2px solid #00626a",
};

// NEW: Mobile Logout Button Style
const mobileLogoutButtonStyle = {
  backgroundColor: "#e74c3c",
  color: "#fff",
  border: "none",
  borderRadius: "50%",
  width: "40px",
  height: "40px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  fontSize: "16px",
  transition: "all 0.2s ease",
  boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
};

const hamburgerStyle = {
  fontSize: "18px",
  color: "#000",
  backgroundColor: "#f0f0f0",
  borderRadius: "6px",
  padding: "8px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "36px",
  height: "36px",
};

const overlayStyle = {
  position: "fixed",
  top: "60px", // Start below mobile header
  left: 0,
  width: "100%",
  height: "calc(100% - 60px)",
  backgroundColor: "rgba(0,0,0,0.5)",
  zIndex: 998,
};

const menuStyle = {
  width: "250px",
  background: "#111",
  color: "#fff",
  display: "flex",
  flexDirection: "column",
  padding: "1rem",
  position: "fixed",
  bottom: 0,
  overflowY: "auto",
};

const userInfoStyle = {
  textAlign: "center",
  marginBottom: "2rem",
  padding: "10px",
};

const profilePicStyle = {
  width: "60px",
  height: "60px",
  borderRadius: "50%",
  marginBottom: "0.5rem",
  border: "2px solid #444",
};

const menuItemStyle = (isActive) => ({
  padding: "12px 16px",
  marginBottom: "8px",
  borderRadius: "8px",
  cursor: "pointer",
  backgroundColor: isActive ? "#2c5aa0" : "transparent",
  color: isActive ? "#fff" : "#ddd",
  fontWeight: isActive ? "bold" : "normal",
  transition: "all 0.2s ease",
  border: isActive ? "1px solid #4CAF50" : "1px solid transparent",
  fontSize: "14px",
});

const logoutButtonStyle = {
  marginTop: "auto",
  padding: "12px 16px",
  borderRadius: "8px",
  border: "none",
  backgroundColor: "#e74c3c",
  color: "#fff",
  cursor: "pointer",
  fontWeight: "bold",
  fontSize: "14px",
  transition: "background-color 0.2s ease",
};

// UPDATED: Content style to account for mobile header
const contentStyle = (isMobile, menuOpen) => ({
  flex: 1,
  padding: isMobile ? "80px 15px 15px 15px" : "2rem", // More top padding for mobile header
  marginLeft: isMobile ? "0" : "250px",
  transition: "all 0.3s ease-in-out",
  background: "linear-gradient(135deg, #f4f4f4, #e0e7ff)",
  minHeight: "100vh",
  width: isMobile ? "100%" : "calc(100% - 250px)",
});

const cards = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
  gap: "20px",
  width: "100%",
};

const cardStyle = (isMobile) => ({
  background: "linear-gradient(135deg, #ffffff, #f0f4ff)",
  borderRadius: "15px",
  padding: "2rem",
  boxShadow: "0 6px 20px rgba(0,0,0,0.25)",
  marginTop: isMobile ? "0" : "20px",
  width: "100%",
});