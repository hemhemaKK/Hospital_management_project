// SuperAdminDashboard.jsx
import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const BASE_URL = "https://hospital-management-project-gf55.onrender.com";

export default function SuperAdminDashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [activeSection, setActiveSection] = useState("Dashboard");

  // data
  const [doctorsCounts, setDoctorsCount] = useState(0);
  const [hospitals, setHospitals] = useState([]); // array of hospital objects (with categories)
  const [users, setUsers] = useState([]); // all users across hospitals
  const [stats, setStats] = useState({ admins: 0, hospitals: 0, users: 0 });

  // UI
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedHospitals, setExpandedHospitals] = useState({}); // mapping tenantId => bool
  const [loading, setLoading] = useState(true);
  const [creatingAdmin, setCreatingAdmin] = useState({ name: "", email: "", password: "" });
  const [expandedId, setExpandedId] = useState(null);
  // fetch hospitals (with full info) for superadmin
  const fetchHospitals = useCallback(async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${BASE_URL}/api/superadmin/hospitals`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Expecting { hospitals: [...] } or an array
      const data = res.data?.hospitals ?? res.data ?? [];
      setHospitals(Array.isArray(data) ? data : []);
      setStats((s) => ({ ...s, hospitals: (Array.isArray(data) ? data.length : 0) }));
    } catch (err) {
      console.error("fetchHospitals error:", err);
      // keep app usable
      setHospitals([]);
    }
  }, [token]);

  // fetch all users (superadmin: all users across tenants)
  const fetchAllUsers = useCallback(async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${BASE_URL}/api/superadmin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data ?? [];
      setUsers(Array.isArray(data) ? data : []);
      setStats((s) => ({ ...s, users: Array.isArray(data) ? data.length : 0 }));
    } catch (err) {
      console.error("fetchAllUsers error:", err);
      setUsers([]);
    }
  }, [token]);

  // fetch admin count (or just reuse users filter)
  const fetchAdminCount = useCallback(async () => {
    if (!token) return;
    try {
      // endpoint expecting admins list
      const res = await axios.get(`${BASE_URL}/api/superadmin/doctors`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data ?? [];
      setDoctorsCount
        (Array.isArray(data) ? data.length : 0);
      setStats((s) => ({ ...s, admins: Array.isArray(data) ? data.length : 0 }));
    } catch (err) {
      console.error("fetchAdminCount error:", err);
      setDoctorsCount
        (0);
    }
  }, [token]);

  // initial load
  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    setLoading(true);
    Promise.allSettled([fetchHospitals(), fetchAllUsers(), fetchAdminCount()]).finally(() =>
      setLoading(false)
    );
  }, [token, fetchHospitals, fetchAllUsers, fetchAdminCount, navigate]);

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  /* ---------- Hospital actions ---------- */
  const handleApproveHospital = async (id) => {
    try {
      await axios.put(`${BASE_URL}/api/hospital/approve/${id}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      alert("Hospital approved");
      fetchHospitals();
    } catch (err) {
      console.error("approveHospital", err);
      alert(err.response?.data?.message || "Approve failed");
    }
  };

  const handleRejectHospital = async (id) => {
    try {
      await axios.put(`${BASE_URL}/api/hospital/reject/${id}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      alert("Hospital rejected");
      fetchHospitals();
    } catch (err) {
      console.error("rejectHospital", err);
      alert(err.response?.data?.message || "Reject failed");
    }
  };

  const handleDeleteHospital = async (id) => {
    if (!window.confirm("Delete hospital? This action cannot be undone.")) return;
    try {
      await axios.delete(`${BASE_URL}/api/superadmin/hospitals/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      alert("Hospital deleted");
      fetchHospitals();
      fetchAllUsers();
    } catch (err) {
      console.error("deleteHospital", err);
      alert("Delete failed");
    }
  };

  const handleEditHospitalName = async (hospital) => {
    const newName = prompt("Enter new hospital name:", hospital.name || "");
    if (!newName) return;
    try {
      await axios.put(`${BASE_URL}/api/superadmin/hospitals/${hospital._id}`, { name: newName }, { headers: { Authorization: `Bearer ${token}` } });
      alert("Hospital updated");
      fetchHospitals();
    } catch (err) {
      console.error("updateHospital", err);
      alert("Update failed");
    }
  };

  /* ---------- User actions ---------- */
  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Delete user?")) return;
    try {
      await axios.delete(`${BASE_URL}/api/superadmin/users/${userId}`, { headers: { Authorization: `Bearer ${token}` } });
      alert("User deleted");
      fetchAllUsers();
      // refresh hospital list (counts)
      fetchHospitals();
    } catch (err) {
      console.error("deleteUser", err);
      alert("Failed to delete user");
    }
  };

  /* ---------- Helpers: group users by hospital tenantId ---------- */
  const groupedUsers = React.useMemo(() => {
    // build mapping tenantId -> { hospitalName?, users: [] }
    const map = {};
    // attach hospitals names if available
    hospitals.forEach((h) => {
      const key = h.tenantId || h._id || "unknown";
      map[key] = { hospital: h, users: [] };
    });

    users.forEach((u) => {
      const key = u.selectedHospitalTenantId || "unknown";
      if (!map[key]) map[key] = { hospital: null, users: [] };
      map[key].users.push(u);
    });

    return map; // object
  }, [users, hospitals]);

  // search within grouped results (simple filter)
  const visibleGroupKeys = Object.keys(groupedUsers).filter((tenantId) => {
    const block = groupedUsers[tenantId];
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    // match hospital
    const hname = block.hospital?.name ?? block.hospital?.hospitalName ?? "";
    if ((hname || "").toLowerCase().includes(q)) return true;
    // match any user name/email inside
    return block.users.some((u) => (u.name || "").toLowerCase().includes(q) || (u.email || "").toLowerCase().includes(q));
  });

  /* ---------- UI Helpers ---------- */
  const toggleExpand = (tenantId) => {
    setExpandedHospitals((prev) => ({ ...prev, [tenantId]: !prev[tenantId] }));
  };

  /* ---------- Styles (simple inline + small CSS injected) ---------- */
  const container = { display: "flex", fontFamily: "Inter, system-ui, Arial", minHeight: "100vh" };
  const sidebar = { width: 260, background: "#0b1220", color: "#fff", padding: 16, display: "flex", flexDirection: "column", justifyContent: "space-between", position: "fixed", left: 0, top: 0, bottom: 0 };
  const main = { marginLeft: 280, padding: 28, flex: 1, background: "#f5f7fb", minHeight: "100vh" };
  const menuItem = (active) => ({ padding: "10px 12px", borderRadius: 8, cursor: "pointer", marginBottom: 8, background: active ? "#111827" : "transparent", color: active ? "#A7F3D0" : "#d1d5db", fontWeight: active ? 700 : 600, transition: "background 180ms, transform 120ms" });
  const card = { background: "#fff", padding: 18, borderRadius: 10, boxShadow: "0 6px 20px rgba(12,17,23,0.06)" };
  const table = { width: "100%", borderCollapse: "collapse" };
  const th = { textAlign: "left", padding: "10px 12px", background: "#0b1220", color: "#fff", borderRadius: 6 };
  const td = { padding: "10px 12px", borderBottom: "1px solid #eee" };

  // small animation CSS injection for fade and hover
  const injectedStyles = `
    .fade-in { animation: fadeIn 350ms ease both; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
    .btn { padding: 8px 10px; border-radius: 6px; border: none; cursor: pointer; font-weight: 600; }
    .btn:active { transform: translateY(1px); }
    .btn-light { background: #e6eef7; color: #0b1220; }
    .btn-danger { background: #f87171; color: white; }
    .btn-success { background: #34d399; color: white; }
    .btn-warning { background: #fb923c; color: white; }
    .small-muted { color: #6b7280; font-size: 13px; }
    .pill { padding: 6px 10px; border-radius: 999px; background: #eef2ff; color: #3730a3; font-weight: 700; font-size: 13px; }
  `;

  if (loading) {
    return (
      <div style={{ ...container, alignItems: "center", justifyContent: "center" }}>
        <style>{injectedStyles}</style>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 18, marginBottom: 8 }}>Loading dashboard...</div>
          <div style={{ width: 48, height: 48, borderRadius: 8, background: "#0b1220", margin: "0 auto" }} />
        </div>
      </div>
    );
  }

  return (
    <div style={container}>
      <style>{injectedStyles}</style>

      {/* SIDEBAR */}
      <div style={sidebar}>
        <div>
          <h2 style={{ margin: 0, color: "#A7F3D0" }}>SuperAdmin</h2>
          <p style={{ marginTop: 6, color: "#9CA3AF", fontSize: 13 }}>Global management</p>

          <div style={{ marginTop: 18 }}>
            <div style={menuItem(activeSection === "Dashboard")} onClick={() => setActiveSection("Dashboard")}>Dashboard</div>
            <div style={menuItem(activeSection === "Users")} onClick={() => setActiveSection("Users")}>Users</div>
            <div style={menuItem(activeSection === "Hospitals")} onClick={() => setActiveSection("Hospitals")}>Hospitals</div>
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div style={{ width: 44, height: 44, borderRadius: 44, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", color: "#0b1220", fontWeight: 800 }}>
              SA
            </div>
            <div>
              <div style={{ fontWeight: 700 }}>{(JSON.parse(localStorage.getItem("user") || "{}")).name || "SuperAdmin"}</div>
              <div style={{ color: "#9CA3AF", fontSize: 13 }}>Super Admin</div>
            </div>
          </div>

          <div style={{ marginTop: 14 }}>
            <button className="btn btn-danger" onClick={handleLogout} style={{ width: "100%" }}>Logout</button>
          </div>
        </div>
      </div>

      {/* MAIN */}
      <div style={main}>
        {/* DASHBOARD VIEW */}
        {activeSection === "Dashboard" && (
          <div className="fade-in">
            <h1 style={{ marginTop: 0 }}>Dashboard</h1>

            <div style={{ display: "flex", gap: 16, marginBottom: 20, flexWrap: "wrap" }}>
              <div style={{ ...card, minWidth: 220 }}>
                <div style={{ fontSize: 12, color: "#6b7280" }}>Admins</div>
                <div style={{ fontSize: 22, fontWeight: 800, marginTop: 6 }}>{stats.admins}</div>
                <div className="small-muted" style={{ marginTop: 8 }}>Total Doctors-Are-Created accounts</div>
              </div>

              <div style={{ ...card, minWidth: 220 }}>
                <div style={{ fontSize: 12, color: "#6b7280" }}>Hospitals</div>
                <div style={{ fontSize: 22, fontWeight: 800, marginTop: 6 }}>{stats.hospitals}</div>
                <div className="small-muted" style={{ marginTop: 8 }}>Hospitals registered across system</div>
              </div>

              <div style={{ ...card, minWidth: 220 }}>
                <div style={{ fontSize: 12, color: "#6b7280" }}>Users</div>
                <div style={{ fontSize: 22, fontWeight: 800, marginTop: 6 }}>{stats.users}</div>
                <div className="small-muted" style={{ marginTop: 8 }}>All users (doctors/nurses/patients/staff)</div>
              </div>
            </div>
          </div>
        )}

        {/* USERS VIEW (grouped by hospital) */}
        {activeSection === "Users" && (
          <div className="fade-in">
            <h1 style={{ marginTop: 0 }}>Users grouped by Hospital</h1>

            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              <input
                placeholder="Search hospitals or users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ flex: 1, padding: 10, borderRadius: 8, border: "1px solid #e6e9ef" }}
              />
              <button className="btn btn-light" onClick={() => { setSearchTerm(""); }}>Clear</button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {visibleGroupKeys.length === 0 ? (
                <div style={{ ...card }}>No users found.</div>
              ) : (
                visibleGroupKeys.map((tenantId) => {
                  const block = groupedUsers[tenantId];
                  const hosp = block.hospital;
                  const localUsers = block.users || [];
                  const expanded = !!expandedHospitals[tenantId];

                  return (
                    <div key={tenantId} style={{ background: "#fff", borderRadius: 10, padding: 12, boxShadow: "0 8px 26px rgba(12,17,23,0.04)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <div style={{ fontWeight: 800 }}>{hosp?.name ?? "Unknown Hospital"} <span style={{ color: "#6b7280", fontSize: 13 }}>({tenantId})</span></div>
                          <div className="small-muted">{localUsers.length} user(s) • {hosp?.status ?? "n/a"}</div>
                        </div>

                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          <button className="btn btn-light" onClick={() => toggleExpand(tenantId)}>{expanded ? "Collapse" : "Expand"}</button>
                          <button className="btn btn-danger" onClick={() => {
                            if (window.confirm("Delete all users of this hospital? (This will delete users only)")) {
                              // not implementing bulk-delete here; just a placeholder
                              alert("Bulk delete not implemented in UI. Use API or individual deletes.");
                            }
                          }}>Bulk</button>
                        </div>
                      </div>

                      {expanded && (
                        <div style={{ marginTop: 12 }}>
                          {localUsers.length === 0 ? (
                            <div style={{ padding: 12 }} className="small-muted">No users for this hospital.</div>
                          ) : (
                            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                              <thead>
                                <tr>
                                  <th style={{ textAlign: "left", padding: 8, fontWeight: 700 }}>Name</th>
                                  <th style={{ textAlign: "left", padding: 8, fontWeight: 700 }}>Email</th>
                                  <th style={{ textAlign: "left", padding: 8, fontWeight: 700 }}>Role</th>
                                  <th style={{ textAlign: "left", padding: 8, fontWeight: 700 }}>Status</th>
                                  <th style={{ textAlign: "left", padding: 8, fontWeight: 700 }}>Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {localUsers.map((u) => (
                                  <tr key={u._id}>
                                    <td style={td}>{u.name || u.fullName || "-"}</td>
                                    <td style={td}>{u.email}</td>
                                    <td style={td}>{u.role || "user"}</td>
                                    <td style={td}>{u.status || (u.isApproved ? "Approved" : "Pending")}</td>
                                    <td style={td}>
                                      <button className="btn btn-light" onClick={() => alert(JSON.stringify(u, null, 2))}>View</button>
                                      <button className="btn btn-danger" style={{ marginLeft: 8 }} onClick={() => handleDeleteUser(u._id)}>Delete</button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {activeSection === "Hospitals" && (
          <div className="fade-in">
            <h1 style={{ marginTop: 0 }}>Hospitals</h1>

            {/* SEARCH BAR */}
            <div style={{ marginBottom: 12, display: "flex", gap: 8 }}>
              <input
                placeholder="Search hospitals..."
                style={{
                  flex: 1,
                  padding: 10,
                  borderRadius: 8,
                  border: "1px solid #e6e9ef",
                }}
                onChange={(e) => setSearchTerm(e.target.value)}
                value={searchTerm}
              />

              <button
                className="btn btn-light"
                onClick={() => {
                  setSearchTerm("");
                  fetchHospitals();
                }}
              >
                Refresh
              </button>
            </div>

            {/* CARD LIST */}
            <div style={{ display: "grid", gap: 16 }}>
              {hospitals
                .filter((h) => {
                  const q = searchTerm.toLowerCase();
                  return (
                    !searchTerm ||
                    (h.name || "").toLowerCase().includes(q) ||
                    (h.hospitalName || "").toLowerCase().includes(q) ||
                    (h.tenantId || "").toLowerCase().includes(q) ||
                    (h.address || "").toLowerCase().includes(q)
                  );
                })
                .map((h) => {
                  const expanded = expandedId === h._id;
                  const isVerified = String(h.status).toLowerCase() === "verified";

                  return (
                    <div
                      key={h._id}
                      onClick={() =>
                        setExpandedId((prev) => (prev === h._id ? null : h._id))
                      }
                      style={{
                        background: "#fff",
                        borderRadius: 10,
                        boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
                        padding: 16,
                        cursor: "pointer",
                        transition: "0.2s",
                      }}
                    >
                      {/* CARD TOP */}
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: 6,
                        }}
                      >
                        <div>
                          <h3 style={{ margin: 0, fontWeight: 800 }}>
                            {h.name || h.hospitalName}
                          </h3>
                          <p style={{ margin: 0, fontSize: 13, color: "#6b7280" }}>
                            {h.address}
                          </p>
                        </div>

                        <div
                          style={{
                            background: "#eef2ff",
                            color: "#3730a3",
                            padding: "6px 12px",
                            borderRadius: 30,
                            fontWeight: 700,
                            height: 30,
                          }}
                        >
                          {h.status}
                        </div>
                      </div>

                      {/* EXPANDED SECTION */}
                      {expanded && (
                        <div
                          style={{
                            marginTop: 12,
                            paddingTop: 12,
                            borderTop: "1px solid #e5e7eb",
                            animation: "fadeIn 0.3s ease",
                          }}
                        >
                          {/* READ-ONLY FORM */}
                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: "1fr 1fr",
                              gap: 10,
                              marginBottom: 14,
                            }}
                          >
                            <div>
                              <label style={{ fontSize: 12 }}>Hospital Name</label>
                              <input
                                readOnly
                                value={h.name}
                                style={{
                                  width: "100%",
                                  padding: 8,
                                  borderRadius: 6,
                                  border: "1px solid #ddd",
                                }}
                              />
                            </div>

                            <div>
                              <label style={{ fontSize: 12 }}>Tenant ID</label>
                              <input
                                readOnly
                                value={h.tenantId}
                                style={{
                                  width: "100%",
                                  padding: 8,
                                  borderRadius: 6,
                                  border: "1px solid #ddd",
                                }}
                              />
                            </div>

                            <div>
                              <label style={{ fontSize: 12 }}>Email</label>
                              <input
                                readOnly
                                value={h.email}
                                style={{
                                  width: "100%",
                                  padding: 8,
                                  borderRadius: 6,
                                  border: "1px solid #ddd",
                                }}
                              />
                            </div>

                            <div>
                              <label style={{ fontSize: 12 }}>Phone</label>
                              <input
                                readOnly
                                value={h.phone}
                                style={{
                                  width: "100%",
                                  padding: 8,
                                  borderRadius: 6,
                                  border: "1px solid #ddd",
                                }}
                              />
                            </div>

                            <div>
                              <label style={{ fontSize: 12 }}>License Number</label>
                              <input
                                readOnly
                                value={h.licenseNumber}
                                style={{
                                  width: "100%",
                                  padding: 8,
                                  borderRadius: 6,
                                  border: "1px solid #ddd",
                                }}
                              />
                            </div>

                            <div>
                              <label style={{ fontSize: 12 }}>Created At</label>
                              <input
                                readOnly
                                value={new Date(h.createdAt).toLocaleString()}
                                style={{
                                  width: "100%",
                                  padding: 8,
                                  borderRadius: 6,
                                  border: "1px solid #ddd",
                                }}
                              />
                            </div>
                          </div>

                          {/* ------------------ LOCATION IMAGE + LINK + COORDINATES ------------------ */}
                          {h.location && (
                            <div style={{ marginBottom: 16 }}>
                              <h4 style={{ margin: "6px 0" }}>Hospital Location</h4>

                              {/* Location Image */}
                              {(h.location.imageUrl || h.profilePic) ? (
                                <img
                                  src={h.location.imageUrl || h.profilePic}
                                  alt="Hospital Location"
                                  style={{
                                    width: "100%",
                                    height: 260,
                                    objectFit: "cover",
                                    borderRadius: 10,
                                    marginBottom: 12,
                                  }}
                                />
                              ) : (
                                <div
                                  style={{
                                    width: "100%",
                                    height: 200,
                                    background: "#f3f4f6",
                                    borderRadius: 10,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: "#6b7280",
                                    fontWeight: 600,
                                  }}
                                >
                                  No image available
                                </div>
                              )}

                              {/* Coordinates Section */}
                              <div
                                style={{
                                  display: "grid",
                                  gridTemplateColumns: "1fr 1fr",
                                  gap: 10,
                                  marginBottom: 10,
                                }}
                              >
                            </div>

                              {/* OPEN IN MAPS BUTTON */}
                              {(h.location.latitude && h.location.longitude) ? (
                                <button
                                  className="btn btn-light"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    window.open(
                                      `https://www.google.com/maps?q=${h.location.latitude},${h.location.longitude}`,
                                      "_blank"
                                    );
                                  }}
                                >
                                  📍 View Location on Google Maps
                                </button>
                              ) : (
                                h.address && (
                                  <button
                                    className="btn btn-light"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      window.open(
                                        `https://www.google.com/maps?q=${encodeURIComponent(h.address)}`,
                                        "_blank"
                                      );
                                    }}
                                  >
                                    🗺️ View Address on Google Maps
                                  </button>
                                )
                              )}
                            </div>
                          )}


                          {/* ACTION BUTTONS */}
                          <div style={{ display: "flex", gap: 10 }}>
                            <button
                              className="btn btn-success"
                              disabled={isVerified}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (!isVerified) handleApproveHospital(h._id);
                              }}
                              style={{
                                opacity: isVerified ? 0.5 : 1,
                                cursor: isVerified ? "not-allowed" : "pointer",
                              }}
                            >
                              {isVerified ? "Approved" : "Approve"}
                            </button>

                            <button
                              className="btn btn-warning"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRejectHospital(h._id);
                              }}
                            >
                              Reject
                            </button>

                            <button
                              className="btn btn-danger"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteHospital(h._id);
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        )}



      </div>
    </div>
  );
}
