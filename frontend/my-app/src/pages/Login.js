import { useState, useEffect } from "react";
import { login } from "../services/auth";
import { useNavigate, Link } from "react-router-dom";
import { FaEnvelope, FaLock, FaHome, FaEye, FaEyeSlash } from "react-icons/fa";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobile = windowWidth <= 768;

  const handleGoogleAuth = () => {
    if (!apiUrl) return console.error("REACT_APP_API_URL is undefined!");
    window.location.href = `${apiUrl}/api/auth/google`;
  };

  const handleLogin = async () => {
    try {
      const res = await login({ email, password });
      const { user, token } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      if (user.role === "superadmin") return navigate("/superadmindashboard");
      if (user.role === "admin") return navigate("/admindashboard");
      if (user.role === "doctor") return navigate("/doctorDashboard");
      if (user.role === "nurse") return navigate("/nurseDashboard");
      if (user.role === "receptionist") return navigate("/receptionistDashboard");
      if (user.role === "pharmacist") return navigate("/pharmacistDashboard");

      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.msg || "Login failed");
    }
  };

  return (
    <div
      style={{
        ...layoutWrapper,
        flexDirection: isMobile ? "column" : "row",
      }}
    >
      {/* LEFT PANEL */}
      <div
        style={{
          ...leftPanel,
          width: isMobile ? "100%" : "50%",
          padding: isMobile ? "2rem 1rem" : "3rem 2rem",
        }}
      >
        <h1 style={leftTitle}>HOSPITAL MANAGEMENT SYSTEM</h1>

        <img
          src="https://alliedsoftech89.wordpress.com/wp-content/uploads/2013/06/medical-doctor-jobs-in-china-expat-jobs-in-china.jpg"
          alt="Login"
          style={{ ...leftImage, width: isMobile ? "90%" : "70%" }}
        />

        <p style={{ ...leftText, maxWidth: isMobile ? "90%" : "350px" }}>
          A comprehensive solution for efficient hospital operations and improved patient care.
        </p>
      </div>

      {/* RIGHT SIDE LOGIN PAGE */}
      <div
        style={{
          ...pageWrapper,
          width: isMobile ? "100%" : "50%",
          padding: isMobile ? "0.5rem" : "20px", // Reduced only on mobile
          paddingTop: isMobile ? "2rem" : "20px", // Reduced only on mobile
          alignItems: isMobile ? "flex-start" : "center", // Changed only on mobile
        }}
      >
        <Link to="/" style={{
          ...homeBtn,
          position: "absolute",
          top: isMobile ? "10px" : "20px", // Closer to top only on mobile
          left: isMobile ? "10px" : "20px",
          zIndex: 1000,
          padding: isMobile ? "5px 10px" : "6px 12px", // Smaller only on mobile
        }}>
          <FaHome size={isMobile ? 16 : 20} /> Home
        </Link>

        <div
          style={{
            ...card,
            width: isMobile ? "95%" : "380px", // Wider only on mobile
            padding: isMobile ? "1.2rem" : "2rem", // Reduced only on mobile
            marginTop: isMobile ? "0.5rem" : "0", // Reduced only on mobile
          }}
        >
          <h2 style={title}>Login</h2>

          {/* Email */}
          <div style={inputBox}>
            <FaEnvelope style={inputIcon} />
            <input
              style={input}
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Password */}
          <div style={inputBox}>
            <FaLock style={inputIcon} />
            <input
              style={input}
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <span 
              style={{
                ...eyeIcon,
                padding: "4px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minWidth: "24px",
              }} 
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          <p style={forgot}>
            <Link to="/forgot-password" style={{ color: "#00626a" }}>
              Forgot Password?
            </Link>
          </p>

          <button style={loginBtn} onClick={handleLogin}>
            Login
          </button>

          <button style={googleBtn} onClick={handleGoogleAuth}>
            Login with Google
          </button>

          <p style={signupText}>
            New User?{" "}
            <Link to="/register" style={{ color: "#00626a" }}>
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

/* ------------------- STYLES ------------------- */
const layoutWrapper = {
  display: "flex",
  width: "100%",
  minHeight: "100vh",
  position: "relative",
};

const leftPanel = {
  flex: 1,
  background: "linear-gradient(135deg, #00626a, #00838f)",
  color: "white",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  textAlign: "center",
};

const leftTitle = {
  fontSize: "2.2rem",
  fontWeight: "bold",
  marginBottom: "1rem",
};

const leftImage = {
  maxWidth: "320px",
  marginTop: "1rem",
  borderRadius: "10px",
};

const leftText = {
  fontSize: "1.1rem",
  opacity: 0.9,
  marginTop: "1rem",
};

const pageWrapper = {
  minHeight: "100vh",
  flex: 1,
  display: "flex",
  justifyContent: "center",
  backgroundColor: "#ffffff",
  position: "relative",
};

const homeBtn = {
  background: "#00626a",
  color: "#fff",
  borderRadius: "6px",
  fontWeight: "bold",
  textDecoration: "none",
  display: "flex",
  alignItems: "center",
  gap: "6px",
  boxShadow: "0 3px 10px rgba(0,0,0,0.15)",
};

const card = {
  borderRadius: "10px",
  backgroundColor: "#fff",
  border: "1px solid #e5e5e5",
  boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
  textAlign: "center",
};

const title = {
  fontSize: "1.8rem",
  marginBottom: "1rem",
  color: "#00626a",
};

const inputBox = {
  display: "flex",
  alignItems: "center",
  border: "1px solid #ccc",
  borderRadius: "8px",
  padding: "0.6rem",
  marginTop: "0.8rem",
  position: "relative",
  overflow: "hidden",
};

const inputIcon = {
  marginRight: "8px",
  color: "#00626a",
  flexShrink: 0,
};

const input = {
  flex: 1,
  border: "none",
  outline: "none",
  fontSize: "1rem",
  minWidth: 0,
};

const eyeIcon = {
  cursor: "pointer",
  color: "#00626a",
  flexShrink: 0,
  marginLeft: "8px",
};

const forgot = {
  textAlign: "right",
  marginTop: "6px",
  fontSize: "0.9rem",
};

const loginBtn = {
  width: "100%",
  padding: "0.7rem",
  backgroundColor: "#00626a",
  border: "none",
  color: "white",
  borderRadius: "8px",
  marginTop: "1rem",
  fontSize: "1rem",
  cursor: "pointer",
  fontWeight: "bold",
};

const googleBtn = {
  width: "100%",
  padding: "0.7rem",
  backgroundColor: "#fff",
  border: "1px solid #00626a",
  color: "#00626a",
  borderRadius: "8px",
  marginTop: "0.7rem",
  fontSize: "1rem",
  cursor: "pointer",
  fontWeight: "bold",
};

const signupText = {
  marginTop: "1rem",
  fontSize: "0.95rem",
};