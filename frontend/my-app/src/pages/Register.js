import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

import { register, verifyOtp } from "../services/auth";
import { registerHospital, getHospitals } from "../services/hospitalApi";

import { FaUser, FaEnvelope, FaLock, FaArrowLeft } from "react-icons/fa";

export default function Register() {
  const [step, setStep] = useState(1);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [otp, setOtp] = useState("");

  // Hospital registration fields
  const [isHospital, setIsHospital] = useState(false);
  const [hospitalName, setHospitalName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");

  // Hospital selection for normal users
  const [hospitals, setHospitals] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState("");

  const navigate = useNavigate();

  // ⭐ Auto-detect superadmin email
  const isSuperAdmin = email.toLowerCase().startsWith("superadmin");

  // ---------------- GOOGLE ----------------
  const apiUrl = process.env.REACT_APP_API_URL;

  const handleGoogleInRegister = () => {
    if (isHospital) {
      return alert("Google login is not allowed for hospital registration.");
    }

    if (!firstName || !lastName || !email || !password || (!isSuperAdmin && !selectedHospital)) {
      return alert("Please fill all required fields before using Google.");
    }

    return alert("Google login is only for Login. Use Email/Password to Register.");
  };

  // ------------------------------------------
  // LOAD HOSPITALS
  // ------------------------------------------
  useEffect(() => {
    async function loadHospitals() {
      try {
        const res = await getHospitals();
        setHospitals(res.data);
      } catch (err) {
        console.log("Error loading hospitals:", err);
      }
    }
    loadHospitals();
  }, []);

  // ------------------------------------------------
  // REGISTER SUBMISSION
  // ------------------------------------------------
  const handleRegister = async () => {
    if (!firstName || !lastName || !email || !password)
      return alert("All fields are required");

    // -------------------------
    // HOSPITAL REGISTRATION
    // -------------------------
    if (isHospital) {
      try {
        await registerHospital({
          firstName,
          lastName,
          name: `${firstName} ${lastName}`,
          email,
          password,
          phone,
          hospitalName,
          address,
          licenseNumber,
        });

        alert("Hospital registered. SuperAdmin will approve.");
        return navigate("/login");
      } catch (err) {
        return alert(err.response?.data?.msg || "Hospital registration failed");
      }
    }

    // -------------------------
    // NORMAL USER REGISTRATION
    // -------------------------
    if (!isSuperAdmin && !selectedHospital) {
      return alert("Please select a hospital.");
    }

    try {
      await register({
        firstName,
        lastName,
        name: `${firstName} ${lastName}`,
        email,
        password,
        selectedHospital: isSuperAdmin ? null : selectedHospital, // 🚀 FIXED
      });

      alert("OTP sent to your email.");
      setStep(2);
    } catch (err) {
      alert(err.response?.data?.msg || "Registration failed");
    }
  };

  // ------------------------------------------------
  // OTP VERIFY
  // ------------------------------------------------
  const handleVerifyOtp = async () => {
    if (!otp) return alert("Enter OTP");

    try {
      await verifyOtp({ email, otp });
      alert("Email verified! Please login.");
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.msg || "OTP verification failed");
    }
  };

  return (
    <div style={pageWrapper}>
      <div style={overlayStyle}></div>

      <Link to="/" style={homeBtnStyle}>
        <FaArrowLeft size={20} /> Home
      </Link>

      <div style={containerStyle}>
        {step === 1 ? (
          <>
            <h2 style={titleStyle}>Register</h2>

            {/* HOSPITAL TOGGLE */}
            <label style={{ color: "white", marginBottom: "1rem" }}>
              <input
                type="checkbox"
                checked={isHospital}
                onChange={() => setIsHospital(!isHospital)}
              />
              Register as Hospital
            </label>

            {/* FIRST NAME */}
            <div style={inputWrapper}>
              <FaUser style={iconStyle} />
              <input
                style={inputStyle}
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>

            {/* LAST NAME */}
            <div style={inputWrapper}>
              <FaUser style={iconStyle} />
              <input
                style={inputStyle}
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>

            {/* EMAIL */}
            <div style={inputWrapper}>
              <FaEnvelope style={iconStyle} />
              <input
                style={inputStyle}
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* USER selects hospital (EXCEPT superadmin + hospital registration) */}
            {!isHospital && !isSuperAdmin && (
              <div style={inputWrapper}>
                <select
                  style={inputStyle}
                  value={selectedHospital}
                  onChange={(e) => setSelectedHospital(e.target.value)}
                >
                  <option value="">Select Hospital</option>
                  {hospitals.map((h) => (
                    <option key={h._id} value={h._id}>
                      {h.hospitalName}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* HOSPITAL FIELDS */}
            {isHospital && (
              <>
                <div style={inputWrapper}>
                  <input
                    style={inputStyle}
                    placeholder="Hospital Name"
                    value={hospitalName}
                    onChange={(e) => setHospitalName(e.target.value)}
                  />
                </div>

                <div style={inputWrapper}>
                  <input
                    style={inputStyle}
                    placeholder="Hospital Phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                <div style={inputWrapper}>
                  <input
                    style={inputStyle}
                    placeholder="Address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>

                <div style={inputWrapper}>
                  <input
                    style={inputStyle}
                    placeholder="License Number"
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                  />
                </div>
              </>
            )}

            {/* PASSWORD */}
            <div style={inputWrapper}>
              <FaLock style={iconStyle} />
              <input
                style={inputStyle}
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button style={buttonStyle} onClick={handleRegister}>
              Register
            </button>

            {/* GOOGLE BUTTON */}
            <button
              style={{
                ...buttonStyle,
                backgroundColor: "white",
                color: "black",
                marginTop: "1rem",
                opacity: isHospital ? 0.6 : 1,
                cursor: isHospital ? "not-allowed" : "pointer",
              }}
              onClick={handleGoogleInRegister}
            >
              Continue with Google
            </button>
          </>
        ) : (
          <>
            <h2 style={titleStyle}>Verify OTP</h2>

            <div style={inputWrapper}>
              <input
                style={inputStyle}
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
            </div>

            <button style={buttonStyle} onClick={handleVerifyOtp}>
              Verify OTP
            </button>
          </>
        )}

        <p style={{ color: "#fff", marginTop: "1.5rem" }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "yellow" }}>
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

// ---------------------- STYLES ----------------------
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
  backgroundColor: "rgba(0,0,0,0.5)",
  backdropFilter: "blur(5px)",
};

const homeBtnStyle = {
  position: "absolute",
  top: "20px",
  left: "20px",
  display: "flex",
  alignItems: "center",
  gap: "6px",
  padding: "8px 12px",
  borderRadius: "8px",
  backgroundColor: "#fff",
  boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
  fontWeight: "bold",
  color: "#333",
  textDecoration: "none",
};

const containerStyle = {
  maxWidth: "400px",
  padding: "2rem",
  borderRadius: "12px",
  boxShadow: "0px 8px 20px rgba(0,0,0,0.25)",
  textAlign: "center",
  backgroundColor: "rgba(255,255,255,0.1)",
  zIndex: 2,
};

const titleStyle = { marginBottom: "1.5rem", color: "#fff" };
const inputWrapper = {
  display: "flex",
  alignItems: "center",
  backgroundColor: "#f1f1f1",
  borderRadius: "8px",
  padding: "0.5rem 0.8rem",
  margin: "0.7rem 0",
};
const iconStyle = { marginRight: "8px", color: "#666" };
const inputStyle = {
  flex: 1,
  padding: "0.6rem",
  border: "none",
  outline: "none",
  fontSize: "1rem",
  backgroundColor: "transparent",
};
const buttonStyle = {
  width: "100%",
  padding: "0.8rem",
  marginTop: "1rem",
  borderRadius: "8px",
  border: "none",
  backgroundColor: "#4CAF50",
  color: "white",
  fontSize: "1rem",
  cursor: "pointer",
  transition: "all 0.2s ease",
};
