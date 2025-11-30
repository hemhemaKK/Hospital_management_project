import { useState } from "react";
import { login } from "../services/auth";
import { useNavigate, Link } from "react-router-dom";
import { FaEnvelope, FaLock, FaHome, FaEye, FaEyeSlash } from "react-icons/fa";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_URL;

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
    <div style={pageWrapper}>
      <div style={overlayStyle}></div>

      <Link to="/" style={homeBtnStyle}>
        <FaHome size={20} /> Home
      </Link>

      <div style={containerStyle}>
        <h2 style={titleStyle}>Login</h2>

        {/* Email */}
        <div style={inputWrapper}>
          <FaEnvelope style={iconStyle} />
          <input
            style={inputStyle}
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* Password */}
        <div style={inputWrapper}>
          <FaLock style={iconStyle} />
          <input
            style={inputStyle}
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <span
            onClick={() => setShowPassword(!showPassword)}
            style={{ cursor: "pointer", color: "#666", marginLeft: "6px" }}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>

        {/* Forgot Password Link */}
        <p style={{ textAlign: "right", margin: "0.3rem 0", fontSize: "0.85rem" }}>
          <Link to="/forgot-password" style={{ color: "#4CAF50" }}>
            Forgot Password?
          </Link>
        </p>

        <button style={buttonStyle} onClick={handleLogin}>
          Login
        </button>

        {/* Google Login */}
        <button style={googleBtnStyle} onClick={handleGoogleAuth}>
          Login with Google
        </button>

        <p style={textStyle}>
          New User?{" "}
          <Link to="/register" style={{ color: "#4CAF50" }}>
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}


/* ---------------------- Styles ---------------------- */

const pageWrapper = {
  minHeight: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  backgroundImage:
    "url('https://images.unsplash.com/photo-1508780709619-79562169bc64?auto=format&fit=crop&w=1470&q=80')",
  backgroundSize: "cover",
  backgroundPosition: "center",
  position: "relative",
};

const overlayStyle = {
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  backgroundColor: "rgba(0,0,0,0.55)",
  backdropFilter: "blur(5px)",
};

const homeBtnStyle = {
  position: "absolute",
  top: "18px",
  left: "18px",
  display: "flex",
  alignItems: "center",
  gap: "6px",
  padding: "6px 10px",
  borderRadius: "6px",
  backgroundColor: "#fff",
  boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
  fontWeight: "bold",
  color: "#333",
  textDecoration: "none",
  zIndex: 3,
};

const containerStyle = {
  maxWidth: "380px",
  padding: "1.5rem",
  borderRadius: "10px",
  boxShadow: "0px 6px 15px rgba(0,0,0,0.25)",
  textAlign: "center",
  backgroundColor: "rgba(255,255,255,0.1)",
  zIndex: 2,
};

const titleStyle = { marginBottom: "1rem", color: "#fff" };

const inputWrapper = {
  display: "flex",
  alignItems: "center",
  backgroundColor: "#f1f1f1",
  borderRadius: "6px",
  padding: "0.35rem 0.5rem",
  margin: "0.5rem 0",
};

const iconStyle = { marginRight: "6px", color: "#666" };

const inputStyle = {
  flex: 1,
  padding: "0.4rem",
  border: "none",
  outline: "none",
  fontSize: "0.95rem",
  backgroundColor: "transparent",
};

const buttonStyle = {
  width: "100%",
  padding: "0.55rem",
  marginTop: "0.7rem",
  borderRadius: "6px",
  border: "none",
  backgroundColor: "#4CAF50",
  color: "white",
  fontSize: "0.95rem",
  cursor: "pointer",
  transition: "all 0.2s ease",
};

const googleBtnStyle = {
  width: "100%",
  padding: "0.55rem",
  marginTop: "0.5rem",
  borderRadius: "6px",
  border: "none",
  backgroundColor: "#fff",
  color: "#333",
  fontSize: "0.95rem",
  cursor: "pointer",
  transition: "all 0.2s ease",
};

const textStyle = { marginTop: "0.8rem", color: "#fff", fontSize: "0.85rem" };
