import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const BASE_URL = "http://localhost:5000";

export default function SuperAdminDashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [activeSection, setActiveSection] = useState("Dashboard");
  const [admins, setAdmins] = useState([]);
  const [stats, setStats] = useState({ admins: 0, users: 0, tickets: 0 });
  const [newAdmin, setNewAdmin] = useState({ name: "", email: "", password: "" });
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch all admins
  const fetchAdmins = useCallback(async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${BASE_URL}/api/superadmin/admins`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAdmins(res.data);
      setStats((prev) => ({ ...prev, admins: res.data.length }));
    } catch (err) {
      console.error(err);
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchAdmins();
  }, [token, fetchAdmins, navigate]); // ✅ dependencies added

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  // Create admin
  const handleCreateAdmin = async () => {
    const { name, email, password } = newAdmin;
    if (!name || !email || !password) return alert("All fields are required!");
    if (!token) return alert("No token found, please login again!");

    try {
      const res = await axios.post(
        `${BASE_URL}/api/superadmin/admins`,
        newAdmin,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Admin created successfully!");
      setAdmins((prev) => [...prev, res.data.admin]);
      setNewAdmin({ name: "", email: "", password: "" });
    } catch (err) {
      console.error(err);
      alert("Failed to create admin");
    }
  };

  // Toggle admin (enable/disable)
  const handleToggleAdmin = async (id) => {
    if (!token) return;
    try {
      const res = await axios.patch(
        `${BASE_URL}/api/superadmin/admins/${id}/toggle`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(res.data.msg);
      fetchAdmins();
    } catch (err) {
      console.error(err);
      alert("Failed to update admin");
    }
  };

  // Delete admin
  const handleDeleteAdmin = async (id) => {
    if (!window.confirm("Delete this admin?")) return;
    if (!token) return;
    try {
      await axios.delete(`${BASE_URL}/api/superadmin/admins/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAdmins((prev) => prev.filter((a) => a._id !== id));
      alert("Admin deleted successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to delete admin");
    }
  };

  // Update admin
  const handleUpdateAdmin = async (admin) => {
    const newName = prompt("Enter new name", admin.name);
    const newEmail = prompt("Enter new email", admin.email);
    if (!newName || !newEmail) return alert("Fields cannot be empty!");
    if (!token) return;

    try {
      await axios.put(
        `${BASE_URL}/api/superadmin/admins/${admin._id}`,
        { name: newName, email: newEmail },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Admin updated!");
      fetchAdmins();
    } catch (err) {
      console.error(err);
      alert("Update failed");
    }
  };

  const filteredAdmins = admins.filter((a) =>
    a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // UI styles
  const cardStyle = {
    backgroundColor: "#fff",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    fontWeight: "bold",
    fontSize: "18px",
    textAlign: "center",
  };

  const tableStyle = {
    width: "100%",
    borderCollapse: "collapse",
    backgroundColor: "#fff",
    borderRadius: "10px",
    overflow: "hidden",
    marginTop: "20px",
  };

  const thStyle = {
    backgroundColor: "#222",
    color: "#fff",
    padding: "10px",
    textAlign: "left",
  };

  const tdStyle = {
    padding: "10px",
    borderBottom: "1px solid #eee",
  };

  return (
    <div style={{ display: "flex" }}>
      {/* Sidebar */}
      <div
        style={{
          width: "250px",
          backgroundColor: "#111",
          color: "#fff",
          padding: "20px",
          minHeight: "100vh",
        }}
      >
        <h2>Super Admin</h2>
        <div
          style={{
            marginTop: "20px",
            cursor: "pointer",
            padding: "10px",
            background: activeSection === "Dashboard" ? "#333" : "transparent",
          }}
          onClick={() => setActiveSection("Dashboard")}
        >
          Dashboard
        </div>
        <div
          style={{
            marginTop: "10px",
            cursor: "pointer",
            padding: "10px",
            background: activeSection === "Admins" ? "#333" : "transparent",
          }}
          onClick={() => setActiveSection("Admins")}
        >
          Manage Admins
        </div>
        <div
          style={{
            marginTop: "10px",
            cursor: "pointer",
            padding: "10px",
            backgroundColor: "red",
          }}
          onClick={handleLogout}
        >
          Logout
        </div>
      </div>

      {/* Main content */}
      <div style={{ padding: "30px", flex: 1 }}>
        {activeSection === "Dashboard" && (
          <div>
            <h2>Dashboard Overview</h2>
            <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
              <div style={cardStyle}>Admins: {stats.admins}</div>
            </div>
          </div>
        )}

        {/* Manage Admins */}
        {activeSection === "Admins" && (
          <div>
            <h2>Manage Admins</h2>

            {/* Add admin */}
            <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
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
              <button onClick={handleCreateAdmin}>Add Admin</button>
            </div>

            {/* Search */}
            <input
              type="text"
              placeholder="Search admins..."
              style={{ marginTop: "20px", padding: "10px", width: "250px" }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Name</th>
                  <th style={thStyle}>Email</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAdmins.map((admin) => (
                  <tr key={admin._id}>
                    <td style={tdStyle}>{admin.name}</td>
                    <td style={tdStyle}>{admin.email}</td>
                    <td style={tdStyle}>
                      {admin.isApproved ? (
                        <span style={{ color: "green" }}>Active</span>
                      ) : (
                        <span style={{ color: "red" }}>Disabled</span>
                      )}
                    </td>

                    <td style={tdStyle}>
                      <button onClick={() => handleUpdateAdmin(admin)}>Edit</button>
                      <button
                        onClick={() => handleToggleAdmin(admin._id)}
                        style={{ marginLeft: "10px" }}
                      >
                        {admin.isApproved ? "Disable" : "Enable"}
                      </button>
                      <button
                        onClick={() => handleDeleteAdmin(admin._id)}
                        style={{ marginLeft: "10px", backgroundColor: "red", color: "#fff" }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredAdmins.length === 0 && (
                  <tr>
                    <td colSpan="4" style={{ textAlign: "center", padding: "15px" }}>
                      No admins found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
