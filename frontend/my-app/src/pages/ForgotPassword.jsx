import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_URL;

  const handleSubmit = async () => {
    if (!email) return alert("Please enter your email");
    setLoading(true);

    try {
      await axios.post(`${apiUrl}/api/password/forgot-password`, { email });
      alert("Password reset link sent to your email");
      navigate("/login"); // optional, can stay on this page
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.msg || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={pageWrapper}>
      <div style={containerStyle}>
        <h2>Forgot Password</h2>
        <p>Enter your email to receive a password reset link</p>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
        />

        <button onClick={handleSubmit} style={buttonStyle} disabled={loading}>
          {loading ? "Sending..." : "Send Reset Link"}
        </button>

        <p style={{ marginTop: "0.5rem" }}>
          <Link to="/login" style={{ color: "#4CAF50" }}>
            Back to Login
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
  background: "#f5f5f5",
};

const containerStyle = {
  maxWidth: "400px",
  padding: "2rem",
  borderRadius: "10px",
  boxShadow: "0px 6px 15px rgba(0,0,0,0.2)",
  backgroundColor: "#fff",
  textAlign: "center",
};

const inputStyle = {
  width: "100%",
  padding: "0.6rem",
  margin: "0.5rem 0",
  borderRadius: "5px",
  border: "1px solid #ccc",
  outline: "none",
};

const buttonStyle = {
  width: "100%",
  padding: "0.6rem",
  marginTop: "0.5rem",
  borderRadius: "5px",
  border: "none",
  backgroundColor: "#4CAF50",
  color: "#fff",
  fontSize: "1rem",
  cursor: "pointer",
};
