import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ProfileSettings from "./pages/ProfileSettings";
import AdminDashboard from "./pages/AdminDashboard";
import Footer from "./components/Footer";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import NurseDashboard from "./pages/NurseDashboard";
import DoctorDashboard from "./pages/doctorDashboard";
import GoogleCallback from "./pages/GoogleCallback";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/footer" element={<Footer />} />
        <Route path="/about" element={<About />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        
        <Route path="/superadmindashboard" element={<SuperAdminDashboard />} />
        <Route path="/admindashboard" element={<AdminDashboard />} />
        <Route path="/nurseDashboard" element={<NurseDashboard />} />
        <Route path="/doctorDashboard" element={<DoctorDashboard />} />
        
        <Route path="/profile" element={<ProfileSettings />} />

        <Route path="/google-callback" element={<GoogleCallback />} />

        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
      </Routes>
    </Router>
  );
}

export default App;