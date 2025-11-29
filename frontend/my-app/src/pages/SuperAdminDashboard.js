import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const BASE_URL = "http://localhost:5000";

export default function SuperAdminDashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [activeSection, setActiveSection] = useState("Dashboard");

  /** ADMIN STATES */
  const [admins, setAdmins] = useState([]);
  const [stats, setStats] = useState({ admins: 0, hospitals: 0 });
  const [newAdmin, setNewAdmin] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [searchTerm, setSearchTerm] = useState("");

  /** HOSPITAL STATES */
  const [hospitals, setHospitals] = useState([]);

  // ------------------------------
  // FETCH ADMINS
  // ------------------------------
  const fetchAdmins = useCallback(async () => {
    if (!token) return;

    try {
      const res = await axios.get(`${BASE_URL}/api/superadmin/admins`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setAdmins(res.data);
      setStats((prev) => ({ ...prev, admins: res.data.length }));
    } catch (err) {
      console.error("Admin fetch failed:", err);
    }
  }, [token]);

  // ------------------------------
  // FETCH HOSPITALS
  // ------------------------------
  const fetchHospitals = useCallback(async () => {
    if (!token) return;

    try {
      const res = await axios.get(`${BASE_URL}/api/superadmin/hospitals`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setHospitals(res.data.hospitals);
      setStats((prev) => ({ ...prev, hospitals: res.data.hospitals.length }));
    } catch (err) {
      console.error("Hospital fetch failed:", err);
    }
  }, [token]);

  // ------------------------------
  // LOAD DATA ON PAGE LOAD
  // ------------------------------
  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchAdmins();
    fetchHospitals();
  }, [token, fetchAdmins, fetchHospitals, navigate]);

  // ------------------------------
  // LOGOUT
  // ------------------------------
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  // ------------------------------
  // CREATE ADMIN
  // ------------------------------
  const handleCreateAdmin = async () => {
    if (!newAdmin.name || !newAdmin.email || !newAdmin.password)
      return alert("All fields are required!");

    try {
      await axios.post(`${BASE_URL}/api/superadmin/admins`, newAdmin, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("Admin created successfully!");
      fetchAdmins();
      setNewAdmin({ name: "", email: "", password: "" });
    } catch (err) {
      alert("Failed to create admin");
    }
  };

  // ------------------------------
  // UPDATE ADMIN
  // ------------------------------
  const handleUpdateAdmin = async (admin) => {
    const newName = prompt("New admin name:", admin.name);
    const newEmail = prompt("New admin email:", admin.email);

    if (!newName || !newEmail) return;

    try {
      await axios.put(
        `${BASE_URL}/api/superadmin/admins/${admin._id}`,
        { name: newName, email: newEmail },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Admin updated!");
      fetchAdmins();
    } catch (err) {
      alert("Failed to update admin");
    }
  };

  // ------------------------------
  // ENABLE / DISABLE ADMIN
  // ------------------------------
  const handleToggleAdmin = async (id) => {
    try {
      const res = await axios.patch(
        `${BASE_URL}/api/superadmin/admins/${id}/toggle`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(res.data.msg);
      fetchAdmins();
    } catch (err) {
      alert("Failed to toggle admin status");
    }
  };

  // ------------------------------
  // DELETE ADMIN
  // ------------------------------
  const handleDeleteAdmin = async (id) => {
    if (!window.confirm("Delete this admin?")) return;

    try {
      await axios.delete(`${BASE_URL}/api/superadmin/admins/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("Admin deleted!");
      fetchAdmins();
    } catch (err) {
      alert("Failed to delete admin");
    }
  };

  // ------------------------------
  // UPDATE HOSPITAL NAME
  // ------------------------------
  const handleUpdateHospital = async (hospital) => {
    const newName = prompt("Enter new hospital name:", hospital.name);
    if (!newName) return;

    try {
      await axios.put(
        `${BASE_URL}/api/superadmin/hospitals/${hospital._id}`,
        { name: newName },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Hospital updated!");
      fetchHospitals();
    } catch (err) {
      alert("Update failed");
    }
  };

  // ------------------------------
  // APPROVE HOSPITAL
  // ------------------------------
  const handleApproveHospital = async (id) => {
    try {
      await axios.put(
        `${BASE_URL}/api/hospital/approve/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Hospital Approved!");
      fetchHospitals();
    } catch (err) {
      alert(err.response?.data?.msg || "Approve failed");
    }
  };

  // ------------------------------
  // REJECT HOSPITAL
  // ------------------------------
  const handleRejectHospital = async (id) => {
    try {
      await axios.put(
        `${BASE_URL}/api/hospital/reject/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Hospital Rejected!");
      fetchHospitals();
    } catch (err) {
      alert(err.response?.data?.msg || "Reject failed");
    }
  };

  // ------------------------------
  // DELETE HOSPITAL
  // ------------------------------
  const handleDeleteHospital = async (id) => {
    if (!window.confirm("Are you sure? This cannot be undone.")) return;

    try {
      await axios.delete(`${BASE_URL}/api/superadmin/hospitals/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("Hospital deleted");
      fetchHospitals();
    } catch (err) {
      alert("Delete failed");
    }
  };

  // ------------------------------
  // FILTER ADMINS
  // ------------------------------
  const filteredAdmins = admins.filter(
    (a) =>
      a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ------------------------------
  // STYLES
  // ------------------------------
  const card = {
    background: "#fff",
    padding: 20,
    borderRadius: 10,
    boxShadow: "0 3px 10px rgba(0,0,0,0.1)",
    fontSize: 18,
    fontWeight: "bold",
  };

  const table = {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: 20,
  };

  const th = {
    background: "#222",
    color: "#fff",
    padding: 10,
    textAlign: "left",
  };

  const td = {
    padding: 10,
    borderBottom: "1px solid #ddd",
  };

  // ------------------------------
  return (
    <div style={{ display: "flex" }}>
      {/* SIDEBAR */}
      <div
        style={{
          width: 250,
          background: "#111",
          color: "white",
          padding: 20,
          minHeight: "100vh",
        }}
      >
        <h2>SuperAdmin</h2>

        <div
          style={{
            marginTop: 20,
            padding: 10,
            cursor: "pointer",
            background: activeSection === "Dashboard" ? "#333" : "transparent",
          }}
          onClick={() => setActiveSection("Dashboard")}
        >
          Dashboard
        </div>

        <div
          style={{
            marginTop: 10,
            padding: 10,
            cursor: "pointer",
            background: activeSection === "Admins" ? "#333" : "transparent",
          }}
          onClick={() => setActiveSection("Admins")}
        >
          Manage Admins
        </div>

        <div
          style={{
            marginTop: 10,
            padding: 10,
            cursor: "pointer",
            background: activeSection === "Hospitals" ? "#333" : "transparent",
          }}
          onClick={() => setActiveSection("Hospitals")}
        >
          Manage Hospitals
        </div>

        <div
          onClick={handleLogout}
          style={{
            marginTop: 30,
            padding: 10,
            background: "red",
            cursor: "pointer",
            borderRadius: 4,
          }}
        >
          Logout
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={{ padding: 30, flex: 1 }}>

        {/* DASHBOARD */}
        {activeSection === "Dashboard" && (
          <div>
            <h2>Dashboard Summary</h2>

            <div style={{ display: "flex", gap: 20 }}>
              <div style={card}>Admins: {stats.admins}</div>
              <div style={card}>Hospitals: {stats.hospitals}</div>
            </div>
          </div>
        )}

        {/* ADMIN SECTION */}
        {activeSection === "Admins" && (
          <div>
            <h2>Manage Admins</h2>

            <div style={{ display: "flex", gap: 10 }}>
              <input
                type="text"
                placeholder="Name"
                value={newAdmin.name}
                onChange={(e) =>
                  setNewAdmin({ ...newAdmin, name: e.target.value })
                }
              />
              <input
                type="email"
                placeholder="Email"
                value={newAdmin.email}
                onChange={(e) =>
                  setNewAdmin({ ...newAdmin, email: e.target.value })
                }
              />
              <input
                type="password"
                placeholder="Password"
                value={newAdmin.password}
                onChange={(e) =>
                  setNewAdmin({ ...newAdmin, password: e.target.value })
                }
              />
              <button onClick={handleCreateAdmin}>Add</button>
            </div>

            <input
              type="text"
              placeholder="Search..."
              style={{ marginTop: 15, padding: 10 }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <table style={table}>
              <thead>
                <tr>
                  <th style={th}>Name</th>
                  <th style={th}>Email</th>
                  <th style={th}>Status</th>
                  <th style={th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAdmins.map((a) => (
                  <tr key={a._id}>
                    <td style={td}>{a.name}</td>
                    <td style={td}>{a.email}</td>
                    <td style={td}>{a.isApproved ? "Active" : "Disabled"}</td>
                    <td style={td}>
                      <button onClick={() => handleUpdateAdmin(a)}>Edit</button>
                      <button
                        style={{ marginLeft: 10 }}
                        onClick={() => handleToggleAdmin(a._id)}
                      >
                        {a.isApproved ? "Disable" : "Enable"}
                      </button>
                      <button
                        style={{
                          marginLeft: 10,
                          background: "red",
                          color: "white",
                        }}
                        onClick={() => handleDeleteAdmin(a._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* HOSPITAL SECTION */}
        {activeSection === "Hospitals" && (
          <div>
            <h2>Manage Hospitals</h2>

            <table style={table}>
              <thead>
                <tr>
                  <th style={th}>Name</th>
                  <th style={th}>Address</th>
                  <th style={th}>Phone</th>
                  <th style={th}>Status</th>
                  <th style={th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {hospitals.map((h) => (
                  <tr key={h._id}>
                    <td style={td}>{h.name}</td>
                    <td style={td}>{h.address}</td>
                    <td style={td}>{h.phone}</td>
                    <td style={td}>{h.status}</td>

                    <td style={td}>
                      {/* EDIT NAME */}
                      <button onClick={() => handleUpdateHospital(h)}>
                        Edit Name
                      </button>

                      {/* APPROVE */}
                      {h.status !== "VERIFIED" && (
                        <button
                          style={{
                            marginLeft: 10,
                            background: "green",
                            color: "white",
                          }}
                          onClick={() => handleApproveHospital(h._id)}
                        >
                          Approve
                        </button>
                      )}

                      {/* REJECT */}
                      {h.status !== "INACTIVE" && (
                        <button
                          style={{
                            marginLeft: 10,
                            background: "orange",
                            color: "white",
                          }}
                          onClick={() => handleRejectHospital(h._id)}
                        >
                          Reject
                        </button>
                      )}

                      {/* DELETE */}
                      <button
                        style={{
                          marginLeft: 10,
                          background: "red",
                          color: "white",
                        }}
                        onClick={() => handleDeleteHospital(h._id)}
                      >
                        Delete
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
