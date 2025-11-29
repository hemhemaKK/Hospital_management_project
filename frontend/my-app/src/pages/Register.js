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
  const [profilePic, setProfilePic] = useState(null);
  const [location, setLocation] = useState({ lat: 51.505, lng: -0.09 });
  const [markerPosition, setMarkerPosition] = useState(null);

  const [hospitals, setHospitals] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState("");

  const navigate = useNavigate();
  const isSuperAdmin = email.toLowerCase().startsWith("superadmin");

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

  // ---------------- Register handlers ----------------
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

  // ---------------- Render ----------------
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

            <label style={labelStyle}>
              <input
                type="checkbox"
                checked={isHospital}
                onChange={() => setIsHospital(!isHospital)}
                style={{ marginRight: "6px" }}
              />
              Register as Hospital
            </label>

            {/* Name Fields */}
            <div style={{ display: "flex", gap: "0.4rem", marginBottom: "0.4rem" }}>
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

            {/* Normal User Hospital Selection */}
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

            {/* Hospital Fields */}
            {isHospital && (
              <>
                <div style={{ display: "flex", gap: "0.4rem", marginBottom: "0.4rem" }}>
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

                <div style={{ display: "flex", gap: "0.4rem", marginBottom: "0.4rem" }}>
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

                {/* Profile Pic + Current Location */}
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "0.4rem" }}>
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
                    {profilePic && (
                      <div style={{ color: "#fff", fontSize: "0.7rem", marginTop: "0.2rem" }}>
                        {profilePic.name}
                      </div>
                    )}
                  </div>

                  <button style={mapBtnCompactStyle} onClick={handleUseCurrentLocation}>
                    Use Current Location
                  </button>
                </div>

                {/* Map */}
                <MapContainer
                  center={[location.lat, location.lng]}
                  zoom={13}
                  style={{ height: "130px", width: "100%", borderRadius: "6px", marginBottom: "0.4rem" }}
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <LocationMarker />
                  <MapController location={location} />
                </MapContainer>
                <p style={{ color: "#fff", fontSize: "0.75rem", marginTop: "0.2rem" }}>
                  Click on map to select location
                </p>
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

            <button style={buttonStyle} onClick={handleRegister}>
              Register
            </button>

            <p style={{ color: "#fff", marginTop: "0.8rem" }}>
              Already have an account?{" "}
              <Link to="/login" style={{ color: "yellow" }}>
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
  padding: "6px 10px",
  borderRadius: "6px",
  backgroundColor: "#fff",
  boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
  fontWeight: "bold",
  color: "#333",
  textDecoration: "none",
};

const containerStyle = {
  maxWidth: "520px",
  padding: "1rem",
  borderRadius: "10px",
  boxShadow: "0px 6px 15px rgba(0,0,0,0.25)",
  textAlign: "center",
  backgroundColor: "rgba(255,255,255,0.1)",
  zIndex: 2,
};

const titleStyle = { marginBottom: "0.8rem", color: "#fff" };
const labelStyle = { color: "#fff", marginBottom: "0.6rem", display: "block" };

const inputWrapper = {
  display: "flex",
  alignItems: "center",
  backgroundColor: "#f1f1f1",
  borderRadius: "4px",
  padding: "0.25rem 0.4rem",
  marginBottom: "0.35rem",
};

const inputWrapperFlex = {
  display: "flex",
  alignItems: "center",
  flex: 1,
  backgroundColor: "#f1f1f1",
  borderRadius: "4px",
  padding: "0.25rem 0.4rem",
};

const iconStyle = { marginRight: "6px", color: "#666" };

const inputStyle = {
  flex: 1,
  padding: "0.35rem",
  border: "none",
  outline: "none",
  fontSize: "0.85rem",
  backgroundColor: "transparent",
};

const buttonStyle = {
  width: "100%",
  padding: "0.55rem",
  marginTop: "0.5rem",
  borderRadius: "4px",
  border: "none",
  backgroundColor: "#4CAF50",
  color: "white",
  fontSize: "0.95rem",
  cursor: "pointer",
  transition: "all 0.2s ease",
};

const uploadBtnCompactStyle = {
  display: "inline-block",
  padding: "0.25rem 0.5rem",
  backgroundColor: "#4CAF50",
  color: "#fff",
  borderRadius: "4px",
  cursor: "pointer",
  fontSize: "0.75rem",
};

const mapBtnCompactStyle = {
  padding: "0.25rem 0.5rem",
  fontSize: "0.75rem",
  borderRadius: "4px",
  border: "none",
  backgroundColor: "#4CAF50",
  color: "#fff",
  cursor: "pointer",
};
