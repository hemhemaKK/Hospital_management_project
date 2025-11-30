import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register, verifyOtp } from "../services/auth";
import { registerHospital, getHospitals } from "../services/hospitalApi";
import { FaUser, FaEnvelope, FaLock, FaArrowLeft } from "react-icons/fa";

import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix default marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

export default function Register() {
  const [step, setStep] = useState(1);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");

  const [isHospital, setIsHospital] = useState(false);
  const [hospitalName, setHospitalName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [profilePic, setProfilePic] = useState(null);
  const [location, setLocation] = useState({ lat: 51.505, lng: -0.09 });
  const [markerPosition, setMarkerPosition] = useState(null);

  const [hospitals, setHospitals] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState("");

  const navigate = useNavigate();
  const isSuperAdmin = email.toLowerCase().startsWith("superadmin");

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

  const isMobile = windowWidth <= 768;

  // ---------------- Map Marker on click ----------------
  function LocationMarker() {
    useMapEvents({
      click(e) {
        setMarkerPosition(e.latlng);
        setLocation({ lat: e.latlng.lat, lng: e.latlng.lng });
      },
    });
    return markerPosition ? <Marker position={markerPosition} /> : null;
  }

  // ---------------- Map Center controller ----------------
  function MapController({ location }) {
    const map = useMap();
    map.setView([location.lat, location.lng], map.getZoom());
    return null;
  }

  const handleUseCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setLocation({ lat: latitude, lng: longitude });
        setMarkerPosition({ lat: latitude, lng: longitude });
      },
      (err) => alert("Could not get your location")
    );
  };

  const handleRegister = async () => {
    if (!firstName || !lastName || !email || !password)
      return alert("All fields are required");

    if (isHospital) {
      if (!hospitalName || !phone || !address || !licenseNumber)
        return alert("All hospital fields are required");

      try {
        const formData = new FormData();
        formData.append("firstName", firstName);
        formData.append("lastName", lastName);
        formData.append("hospitalName", hospitalName);
        formData.append("phone", phone);
        formData.append("address", address);
        formData.append("licenseNumber", licenseNumber);
        formData.append("email", email);
        formData.append("password", password);
        formData.append("location", JSON.stringify(location));
        if (profilePic) formData.append("profilePic", profilePic);

        await registerHospital(formData);
        alert("Hospital registered. SuperAdmin will approve.");
        navigate("/login");
      } catch (err) {
        alert(err.response?.data?.msg || "Hospital registration failed");
      }
      return;
    }

    if (!isSuperAdmin && !selectedHospital)
      return alert("Please select a hospital.");

    try {
      await register({
        firstName,
        lastName,
        name: `${firstName} ${lastName}`,
        email,
        password,
        selectedHospital: isSuperAdmin ? null : selectedHospital,
      });
      alert("OTP sent to your email.");
      setStep(2);
    } catch (err) {
      alert(err.response?.data?.msg || "Registration failed");
    }
  };

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
    <div
      style={{
        ...layoutWrapper,
        flexDirection: isMobile ? "column" : "row",
      }}
    >
      {/* LEFT = REGISTER FORM */}
      <div
        style={{
          ...formSide,
          width: isMobile ? "100%" : "50%",
          padding: isMobile ? "1rem" : "0",
          paddingTop: isMobile ? "3.5rem" : "0", // Added padding for mobile to accommodate home button
        }}
      >
        <Link to="/" style={{
          ...homeBtnStyle,
          position: isMobile ? "absolute" : "absolute",
          top: isMobile ? "10px" : "20px",
          left: isMobile ? "10px" : "20px",
          zIndex: 1000, // Ensure it's above other elements
        }}>
          <FaArrowLeft size={20} /> Home
        </Link>

        <div
          style={{
            ...containerStyle,
            width: isMobile ? "90%" : "560px",
            padding: isMobile ? "1.5rem" : "2rem",
            marginTop: isMobile ? "0.5rem" : "0", // Added margin for mobile
          }}
        >
          {step === 1 ? (
            <>
              <h2 style={titleStyle}>Register</h2>

              <label style={labelStyle}>
                <input
                  type="checkbox"
                  checked={isHospital}
                  onChange={() => setIsHospital(!isHospital)}
                  style={{ marginRight: "6px" }}
                />
                Register as Hospital
              </label>

              <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: "0.4rem", marginBottom: "0.4rem" }}>
                <div style={inputWrapperFlex}>
                  <FaUser style={iconStyle} />
                  <input
                    style={inputStyle}
                    placeholder="First Name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
                <div style={inputWrapperFlex}>
                  <FaUser style={iconStyle} />
                  <input
                    style={inputStyle}
                    placeholder="Last Name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
              </div>

              <div style={inputWrapper}>
                <FaEnvelope style={iconStyle} />
                <input
                  style={inputStyle}
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

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

              {isHospital && (
                <>
                  <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: "0.4rem", marginBottom: "0.4rem" }}>
                    <div style={{ flex: 1 }}>
                      <div style={inputWrapperFlex}>
                        <input
                          style={inputStyle}
                          placeholder="Hospital Name"
                          value={hospitalName}
                          onChange={(e) => setHospitalName(e.target.value)}
                        />
                      </div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={inputWrapperFlex}>
                        <input
                          style={inputStyle}
                          placeholder="Phone"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: "0.4rem", marginBottom: "0.4rem" }}>
                    <div style={{ flex: 1 }}>
                      <div style={inputWrapperFlex}>
                        <input
                          style={inputStyle}
                          placeholder="Address"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                        />
                      </div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={inputWrapperFlex}>
                        <input
                          style={inputStyle}
                          placeholder="License Number"
                          value={licenseNumber}
                          onChange={(e) => setLicenseNumber(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: "0.5rem", alignItems: "center", marginBottom: "0.4rem" }}>
                    <div style={{ flex: 1, textAlign: "left" }}>
                      <label htmlFor="profilePic" style={uploadBtnCompactStyle}>
                        {profilePic ? "Change Hospital Picture" : "Upload Hospital Picture"}
                      </label>
                      <input
                        id="profilePic"
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={(e) => setProfilePic(e.target.files[0])}
                      />
                      {profilePic && <div style={{ color: "#00626a", fontSize: "0.7rem", marginTop: "0.2rem" }}>{profilePic.name}</div>}
                    </div>
                    <button style={mapBtnCompactStyle} onClick={handleUseCurrentLocation}>
                      Use Current Location
                    </button>
                  </div>

                  <MapContainer
                    center={[location.lat, location.lng]}
                    zoom={13}
                    style={{ height: "130px", width: "100%", borderRadius: "6px", marginBottom: "0.4rem" }}
                  >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <LocationMarker />
                    <MapController location={location} />
                  </MapContainer>
                  <p style={{ color: "#00626a", fontSize: "0.75rem", marginTop: "0.2rem" }}>
                    Click on map to select location
                  </p>
                </>
              )}

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

              <p style={{ color: "#1a1818ff", marginTop: "0.8rem" }}>
                Already have an account?{" "}
                <Link to="/login" style={{ color: "#00626a" }}>
                  Login
                </Link>
              </p>
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
        </div>
      </div>

      {/* RIGHT = WELCOME PANEL */}
      <div
        style={{
          ...rightPanel,
          width: isMobile ? "100%" : "50%",
          padding: isMobile ? "2rem 1rem" : "3rem 2rem",
        }}
      >
        <h1 style={leftTitle}>Join The Creative Community</h1>
        <img
          src="https://t3.ftcdn.net/jpg/08/60/01/22/360_F_860012214_XcDYSccoanH8aWgLnzITxSJokgYiiaTU.jpg"
          alt="Register"
          style={{ ...leftImage, width: isMobile ? "90%" : "70%" }}
        />
        <p style={{ ...leftText, maxWidth: isMobile ? "90%" : "350px" }}>
          Sign up to streamline hospital operations, collaborate with your team, and improve patient care. Smooth workflows and intuitive design make managing everything effortless.
        </p>
      </div>
    </div>
  );
}

// ----------------- STYLES -----------------
const layoutWrapper = {
  display: "flex",
  width: "100%",
  minHeight: "100vh",
  position: "relative",
};

const formSide = {
  flex: 1,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  position: "relative",
};

const rightPanel = {
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

const homeBtnStyle = {
  display: "flex",
  alignItems: "center",
  gap: "6px",
  padding: "6px 12px",
  background: "#00626a",
  color: "#fff",
  borderRadius: "6px",
  fontWeight: "bold",
  textDecoration: "none",
  boxShadow: "0 3px 10px rgba(0,0,0,0.15)",
};

const containerStyle = {
  padding: "2rem",
  borderRadius: "10px",
  backgroundColor: "#fff",
  border: "1px solid #e5e5e5",
  boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
  zIndex: 2,
  textAlign: "center",
};

const titleStyle = {
  fontSize: "1.8rem",
  fontWeight: "bold",
  marginBottom: "1rem",
  color: "#00626a",
};

const labelStyle = {
  color: "#00626a",
  fontWeight: "bold",
  marginBottom: "0.7rem",
  display: "block",
};

const inputWrapper = {
  display: "flex",
  alignItems: "center",
  border: "1px solid #ccc",
  borderRadius: "8px",
  padding: "0.6rem",
  marginBottom: "0.6rem",
  background: "#fff",
};

const inputWrapperFlex = {
  display: "flex",
  alignItems: "center",
  flex: 1,
  border: "1px solid #ccc",
  borderRadius: "8px",
  padding: "0.6rem",
  background: "#fff",
};

const iconStyle = {
  color: "#00626a",
  marginRight: "8px",
  fontSize: "1rem",
};

const inputStyle = {
  flex: 1,
  border: "none",
  outline: "none",
  fontSize: "1rem",
  background: "transparent",
};

const buttonStyle = {
  width: "100%",
  padding: "0.7rem",
  border: "none",
  backgroundColor: "#00626a",
  color: "white",
  borderRadius: "8px",
  fontSize: "1rem",
  fontWeight: "bold",
  cursor: "pointer",
  marginTop: "0.7rem",
  transition: "0.2s ease",
};

const uploadBtnCompactStyle = {
  display: "inline-block",
  padding: "0.4rem 0.7rem",
  backgroundColor: "#00626a",
  color: "#fff",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "0.8rem",
  fontWeight: "bold",
};

const mapBtnCompactStyle = {
  padding: "0.4rem 0.8rem",
  backgroundColor: "#00626a",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "0.8rem",
  fontWeight: "bold",
};