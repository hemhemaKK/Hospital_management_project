import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register, verifyOtp } from "../services/auth";
import { FaUser, FaEnvelope, FaLock, FaArrowLeft } from "react-icons/fa";

export default function Register() {
  const [step, setStep] = useState(1); // 1 = register, 2 = OTP

  // Existing fields
  const [name, setName] = useState("");

  // NEW — split name for your requirement
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");

  // HOSPITAL fields
  const [isHospital, setIsHospital] = useState(false);
  const [phone, setPhone] = useState("");
  const [hospitalName, setHospitalName] = useState("");
  const [address, setAddress] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");

  const [hoverBtn, setHoverBtn] = useState(false);
  const [hoverHome, setHoverHome] = useState(false);
  const navigate = useNavigate();

  // ---------------- REGISTER ----------------
const handleRegister = async () => {
  if (!firstName || !lastName || !email || !password)
    return alert("All fields are required");

  const finalName = `${firstName} ${lastName}`;

  const payload = isHospital
    ? {
        name: finalName,
        firstName,
        lastName,
        email,
        password,
        isHospital,
        hospitalName,
        address,
        licenseNumber,
        hospitalPhone: phone,  // ✔ FIXED FIELD
      }
    : {
        name: finalName,
        firstName,
        lastName,
        email,
        password,
        isHospital,
      };

  try {
    await register(payload);
    alert("OTP sent to your email.");
    setStep(2);
  } catch (err) {
    alert(err.response?.data?.msg || "Registration failed");
  }
};


  // ---------------- VERIFY OTP ----------------
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
        <FaArrowLeft size={20} /> Home
      </Link>

      <div style={containerStyle}>
        {step === 1 ? (
          <>
            <h2 style={titleStyle}>Register</h2>

            {/* Toggle — Is this a hospital onboarding? */}
            <div style={{ color: "white", marginBottom: "1rem", fontWeight: "bold" }}>
              <label>
                <input
                  type="checkbox"
                  checked={isHospital}
                  onChange={() => setIsHospital(!isHospital)}
                  style={{ marginRight: "8px" }}
                />
                Register as Hospital?
              </label>
            </div>

            {/* First Name */}
            <div style={inputWrapper}>
              <FaUser style={iconStyle} />
              <input
                style={inputStyle}
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>

            {/* Last Name */}
            <div style={inputWrapper}>
              <FaUser style={iconStyle} />
              <input
                style={inputStyle}
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>

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

            {/* Hospital extra fields */}
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
                    placeholder="Phone Number"
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
                    placeholder="Hospital License Number"
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                  />
                </div>
              </>
            )}

            {/* Password */}
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

            <button
              style={{
                ...buttonStyle,
                transform: hoverBtn ? "scale(1.05)" : "scale(1)",
                backgroundColor: hoverBtn ? "#45a049" : "#4CAF50",
              }}
              onMouseEnter={() => setHoverBtn(true)}
              onMouseLeave={() => setHoverBtn(false)}
              onClick={handleRegister}
            >
              Register
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

            <button
              style={{
                ...buttonStyle,
                transform: hoverBtn ? "scale(1.05)" : "scale(1)",
                backgroundColor: hoverBtn ? "#45a049" : "#4CAF50",
              }}
              onClick={handleVerifyOtp}
              onMouseEnter={() => setHoverBtn(true)}
              onMouseLeave={() => setHoverBtn(false)}
            >
              Verify OTP
            </button>
          </>
        )}

        <p style={{ marginTop: "1.5rem", color: "#fff", fontWeight: "bold" }}>
          Already have an account?{" "}
          <Link
            to="/login"
            style={{ color: "#4CAF50", fontWeight: "bold", textDecoration: "none" }}
          >
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
  top: 0, left: 0, width: "100%", height: "100%",
  backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(5px)",
};

const homeBtnStyle = {
  position: "absolute", top: "20px", left: "20px",
  display: "flex", alignItems: "center", gap: "6px",
  padding: "8px 12px", borderRadius: "8px", backgroundColor: "#fff",
  boxShadow: "0 2px 6px rgba(0,0,0,0.2)", fontWeight: "bold", color: "#333",
  textDecoration: "none", transition: "all 0.3s ease", zIndex: 3,
};

const containerStyle = {
  maxWidth: "400px", padding: "2rem", borderRadius: "12px",
  boxShadow: "0px 8px 20px rgba(0,0,0,0.25)", textAlign: "center",
  backgroundColor: "rgba(255,255,255,0.1)", zIndex: 2,
};

const titleStyle = { marginBottom: "1.5rem", color: "#fff" };
const inputWrapper = { display: "flex", alignItems: "center", backgroundColor: "#f1f1f1", borderRadius: "8px", padding: "0.5rem 0.8rem", margin: "0.7rem 0" };
const iconStyle = { marginRight: "8px", color: "#666" };
const inputStyle = { flex: 1, padding: "0.6rem", border: "none", outline: "none", fontSize: "1rem", backgroundColor: "transparent" };
const buttonStyle = { width: "100%", padding: "0.8rem", marginTop: "1rem", borderRadius: "8px", border: "none", backgroundColor: "#4CAF50", color: "white", fontSize: "1rem", cursor: "pointer", transition: "all 0.2s ease" };
