import { useState, useEffect } from "react";
import axios from "axios";
import { FaBars, FaTimes } from "react-icons/fa";
import ProfileSettings from "../pages/ProfileSettings";
import SupportTicket from "./Support";
import Complaint from "./UserComplaints";
import ComplaintStatus from "./complaintStatus";
import Chatbot from "./chatbot";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("Dashboard");
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) setMenuOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No token found");

        const res = await axios.get(
          "http://localhost:5000/api/profile",
          { headers: { Authorization: `Bearer ${token}` } }
        );
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

  if (loading) return <p>Loading...</p>;
  if (!user) return <p>User data not found.</p>;

  const sections = ["Dashboard", "Complaints", "Status", "Support", "Profile"];

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
      case "Complaints":
      case "Assigned Complaints":
      case "All Complaints":
        return <Complaint user={user} />;
      case "Status":
        return <ComplaintStatus user={user} />;
      case "Manage Users":
      case "Reports":
        return <p>{activeSection} content for Admin</p>;
      default:
        return <p>Section not found</p>;
    }
  };

  return (
    <div style={mainContainer}>
      {/* Hamburger for mobile */}
      {isMobile && (
        <div onClick={() => setMenuOpen(!menuOpen)} style={hamburgerStyle}>
          {menuOpen ? <FaTimes /> : <FaBars />}
        </div>
      )}

      {/* Overlay for mobile menu */}
      {isMobile && menuOpen && (
        <div style={overlayStyle} onClick={() => setMenuOpen(false)} />
      )}

      {/* Sidebar/Menu */}
      <div
        style={{
          ...menuStyle,
          left: isMobile ? (menuOpen ? "0" : "-250px") : "0",
          boxShadow:
            isMobile && menuOpen ? "2px 0 8px rgba(0,0,0,0.3)" : "none",
          transition: "left 0.3s ease-in-out",
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
            onClick={() => {
              setActiveSection(section);
              if (isMobile) setMenuOpen(false);
            }}
          >
            {section}
          </div>
        ))}

        <button
          style={logoutButtonStyle}
          onClick={() => {
            localStorage.removeItem("token");
            window.location.href = "/login";
          }}
        >
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div style={contentStyle(isMobile)}>
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
};

const hamburgerStyle = {
  position: "fixed",
  top: "15px",
  left: "25px",
  zIndex: 1001,
  fontSize: "28px",
  color: "#000000ff",
  backgroundColor: "#fff",
  borderRadius: "8px",
  padding: "6px 8px",
  cursor: "pointer",
  boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
};

const overlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  backgroundColor: "rgba(0,0,0,0.5)",
  zIndex: 998,
};

const menuStyle = {
  width: "230px",
  background: "#111",
  color: "#fff",
  display: "flex",
  flexDirection: "column",
  padding: "1rem",
  position: "fixed",
  top: 0,
  bottom: 0,
  zIndex: 1000,
};

const userInfoStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  marginBottom: "2rem",
};

const profilePicStyle = {
  width: "60px",
  height: "60px",
  borderRadius: "50%",
  marginBottom: "0.5rem",
};

const menuItemStyle = (isActive) => ({
  padding: "12px 16px",
  marginBottom: "5px",
  borderRadius: "6px",
  cursor: "pointer",
  backgroundColor: isActive ? "#222" : "transparent",
  color: isActive ? "#4CAF50" : "#fff",
  fontWeight: isActive ? "bold" : "normal",
});

const logoutButtonStyle = {
  marginTop: "auto",
  padding: "12px 16px",
  borderRadius: "6px",
  border: "none",
  backgroundColor: "#e74c3c",
  color: "#fff",
  cursor: "pointer",
  fontWeight: "bold",
};

const contentStyle = (isMobile) => ({
  flex: 1,
  padding: "2rem",
  marginLeft: isMobile ? "0" : "250px", // responsive margin
  transition: "margin-left 0.3s ease-in-out",
  background: "linear-gradient(135deg, #f4f4f4, #e0e7ff)",
});

const cards = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
  gap: "20px",
};

const cardStyle = (isMobile)=>({
  background: "linear-gradient(135deg, #ffffff, #f0f4ff)",
  borderRadius: "15px",
  padding: "2rem",
  boxShadow: "0 6px 20px rgba(0,0,0,0.25)",
  marginTop: isMobile ? "100px" : "20px", // responsive margin
  
});
