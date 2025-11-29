import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function GoogleCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const role = params.get("role");

    if (token) {
      localStorage.setItem("token", token);

      // Role-based redirect
      switch (role) {
        case "superadmin":
          navigate("/superadmindashboard");
          break;
        case "admin":
          navigate("/admindashboard");
          break;
        case "doctor":
          navigate("/doctorDashboard");
          break;
        case "nurse":
          navigate("/nurseDashboard");
          break;
        case "receptionist":
          navigate("/receptionDashboard");
          break;
        case "pharmacist":
          navigate("/pharmacistDashboard");
          break;
        default:
          navigate("/dashboard"); // normal user
      }
    } else {
      navigate("/login");
    }
  }, [navigate]);

  return <p>Finishing Google Login...</p>;
}
