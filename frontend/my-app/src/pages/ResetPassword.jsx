import { useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

export default function ResetPassword() {
  const { token } = useParams();
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_URL;

  const handleReset = async () => {
    if (!newPassword) return alert("Please enter a new password");

    setLoading(true);
    try {
      await axios.post(`${apiUrl}/api/password/reset-password`, {
        token,
        newPassword,
      });
      alert("Password reset successful!");
      navigate("/login");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.msg || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={pageWrapper}>
      <div style={containerStyle}>
        <h2>Reset Password</h2>
        <input
          type="password"
          placeholder="Enter new password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          style={inputStyle}
        />

        <button onClick={handleReset} style={buttonStyle} disabled={loading}>
          {loading ? "Resetting..." : "Reset Password"}
        </button>
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
