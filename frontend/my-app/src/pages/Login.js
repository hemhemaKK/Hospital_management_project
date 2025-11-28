import { useState } from "react";
import { login } from "../services/auth";
import { useNavigate, Link } from "react-router-dom";
import { FaEnvelope, FaLock, FaHome, FaEye, FaEyeSlash } from "react-icons/fa";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [hoverBtn, setHoverBtn] = useState(false);
  const [hoverHome, setHoverHome] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await login({ email, password });
      const user = res.data.user;
      const token = res.data.token;

      localStorage.setItem("token", token);
      
      if (user.role === "superadmin") {
        alert("SuperAdmin login successful!");
        navigate("/supadmindashboard");
      }
      else if (user.role === "admin") {
        alert("Admin login successful!");
        navigate("/admindashboard");
      }

      else if (user.role === "doctor") {
        alert("Doctor login successful!");
        navigate("/doctorDashboard");
      }

      else if (user.role === "nurses") {
        alert("Nurse login successful!");
        navigate("/nurseDashboard");
      }

      else if (user.role === "receptionists") {
        alert("Receptionist login successful!");
        navigate("/receptionDashboard");
      }

      else if (user.role === "pharmacists") {
        alert("Pharmacist login successful!");
        navigate("/pharmacistDashboard");
      }
      
      else {
        // Normal user
        alert("Login successful!");
        navigate("/dashboard");
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div style={pageWrapper}>
      <div style={overlayStyle}></div>

      {/* Home button */}
      <Link
        to="/"
        style={{
          ...homeBtnStyle,
          transform: hoverHome ? "scale(1.05)" : "scale(1)",
          backgroundColor: hoverHome ? "#f5f5f5" : "#fff",
        }}
        onMouseEnter={() => setHoverHome(true)}
        onMouseLeave={() => setHoverHome(false)}
      >
        <FaHome size={22} /> Home
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
            style={{ cursor: "pointer", color: "#7b7b7bff" }}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>

        <button
          style={{
            ...buttonStyle,
            transform: hoverBtn ? "scale(1.05)" : "scale(1)",
            backgroundColor: hoverBtn ? "#45a049" : "#4CAF50",
          }}
          onMouseEnter={() => setHoverBtn(true)}
          onMouseLeave={() => setHoverBtn(false)}
          onClick={handleLogin}
        >
          Login
        </button>

        <p style={{ marginTop: "1rem", color: "#fff" }}>
          New User? <Link to="/register" style={{ color: "#4CAF50" }}>Register</Link>
        </p>
      </div>
    </div>
  );
}

// Styles (same as before)
const pageWrapper = { minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", backgroundImage: "url('https://images.unsplash.com/photo-1508780709619-79562169bc64?auto=format&fit=crop&w=1470&q=80')", backgroundSize: "cover", backgroundPosition: "center", position: "relative" };
const overlayStyle = { position: "absolute", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(5px)" };
const homeBtnStyle = { position: "absolute", top: "20px", left: "20px", display: "flex", alignItems: "center", gap: "6px", padding: "8px 12px", borderRadius: "8px", backgroundColor: "#fff", boxShadow: "0 2px 6px rgba(0,0,0,0.2)", fontWeight: "bold", color: "#333", textDecoration: "none", transition: "all 0.3s ease", zIndex: 3 };
const containerStyle = { maxWidth: "400px", padding: "2rem", borderRadius: "12px", boxShadow: "0px 8px 20px rgba(0,0,0,0.25)", textAlign: "center", backgroundColor: "rgba(255,255,255,0.1)", zIndex: 2 };
const titleStyle = { marginBottom: "1.5rem", color: "#fff" };
const inputWrapper = { display: "flex", alignItems: "center", backgroundColor: "#f1f1f1", borderRadius: "8px", padding: "0.5rem 0.8rem", margin: "0.7rem 0" };
const iconStyle = { marginRight: "8px", color: "#666" };
const inputStyle = { flex: 1, padding: "0.6rem", border: "none", outline: "none", fontSize: "1rem", backgroundColor: "transparent" };
const buttonStyle = { width: "100%", padding: "0.8rem", marginTop: "1rem", borderRadius: "8px", border: "none", backgroundColor: "#4CAF50", color: "white", fontSize: "1rem", cursor: "pointer", transition: "all 0.2s ease" };
