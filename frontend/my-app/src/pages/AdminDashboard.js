import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const BASE_URL = "http://localhost:5000";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [activeSection, setActiveSection] = useState("Dashboard");
  const [user, setUser] = useState(null);

  const [stats, setStats] = useState({ users: 0, doctors: 0, tickets: 0, categories: 0 });

  const [users, setUsers] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [categories, setCategories] = useState([]);

  // category form
  const [categoryForm, setCategoryForm] = useState({ name: "", description: "" });

  // searches & filters
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [categorySearch, setCategorySearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  // ticket replies UI state: { "<userId>_<ticketId>": "reply text" }
  const [ticketReplies, setTicketReplies] = useState({});
  // track which ticket reply box is open
  const [openReplyKey, setOpenReplyKey] = useState(null);

  // load logged in user from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  // fetch all admin data
  useEffect(() => {
    if (!token) return;

    const fetchAllData = async () => {
      try {
        // parallel fetch: users, doctors, categories
        const [usersRes, doctorsRes, categoriesRes] = await Promise.all([
          axios.get(`${BASE_URL}/api/admin/users`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${BASE_URL}/api/admin/doctors`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${BASE_URL}/api/admin/category`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const usersData = usersRes.data || [];
        const doctorsData = doctorsRes.data || [];
        const categoriesData = categoriesRes.data || [];

        const allTickets = usersData.flatMap((u) => u.supportTickets || []);

        setStats({
          users: usersData.length,
          doctors: doctorsData.length,
          tickets: allTickets.length,
          categories: categoriesData.length,
        });

        setUsers(usersData);
        setDoctors(doctorsData);
        setCategories(categoriesData);
      } catch (err) {
        console.error("Error fetching admin data:", err);
        alert("Error fetching admin data — check console.");
      }
    };

    fetchAllData();
  }, [token]);

  const handleMenuClick = (menu) => setActiveSection(menu);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  /* ---------------- STYLES (inline) ---------------- */
  const sidebarStyle = {
    width: "250px",
    minHeight: "100vh",
    backgroundColor: "#111",
    padding: "0.5rem",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    position: "fixed",
    left: 0,
    top: 0,
  };

  const profileStyle = {
    padding: "0.5rem",
    borderBottom: "1px solid #444",
    textAlign: "center",
    color: "#fff",
  };

  const profilePicStyle = {
    borderRadius: "50%",
    marginBottom: "0.2rem",
    width: "80px",
    height: "80px",
    objectFit: "cover",
  };

  const menuItemStyle = (isActive) => ({
    textDecoration: "none",
    color: isActive ? "#4CAF50" : "#fff",
    padding: "0.8rem 1rem",
    display: "block",
    borderRadius: "8px",
    margin: "0.4rem 0",
    cursor: "pointer",
    fontWeight: "bold",
    backgroundColor: isActive ? "#222" : "transparent",
  });

  const bottomLinkStyle = (isActive, isLogout = false) => ({
    textDecoration: "none",
    color: "#fff",
    padding: "0.8rem 1rem",
    display: "block",
    borderRadius: "8px",
    margin: "0.4rem 0",
    cursor: "pointer",
    fontWeight: "bold",
    backgroundColor: isLogout ? "#ff4d4d" : isActive ? "#222" : "transparent",
    textAlign: "center",
  });

  const cardStyle = {
    backgroundColor: "#fff",
    flex: "1 1 200px",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: "18px",
  };

  const tableStyle = {
    width: "100%",
    borderCollapse: "separate",
    borderSpacing: 0,
    marginTop: "10px",
    backgroundColor: "#fff",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
    borderRadius: "10px",
    overflow: "hidden",
    fontSize: "0.95rem",
    color: "#333",
  };

  const thStyle = {
    backgroundColor: "#020202ff",
    color: "#fff",
    textAlign: "left",
    padding: "12px 15px",
    fontWeight: "bold",
  };

  const tdStyle = {
    padding: "12px 15px",
    borderBottom: "1px solid #eee",
    verticalAlign: "top",
  };

  const trStyle = (idx) => ({
    backgroundColor: idx % 2 === 0 ? "#f9f9f9" : "#fff",
  });

  /* ---------------- DOCTORS TABLE ACTIONS ---------------- */
  const approveDoctor = async (id) => {
    try {
      await axios.put(`${BASE_URL}/api/admin/doctors/approve/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setDoctors((prev) => prev.map((d) => (d._id === id ? { ...d, isApproved: true } : d)));
    } catch (err) {
      console.error("approveDoctor error:", err);
      alert("Failed to approve doctor");
    }
  };

  // toggle block/unblock (uses toggle endpoint)
  const toggleDoctor = async (id) => {
    try {
      await axios.put(`${BASE_URL}/api/admin/doctors/toggle/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setDoctors((prev) => prev.map((d) => (d._id === id ? { ...d, isApproved: !d.isApproved } : d)));
    } catch (err) {
      console.error("toggleDoctor error:", err);
      alert("Failed to toggle doctor status");
    }
  };

  const deleteDoctor = async (id) => {
    if (!window.confirm("Delete doctor?")) return;
    try {
      await axios.delete(`${BASE_URL}/api/admin/doctors/reject/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDoctors((prev) => prev.filter((d) => d._id !== id));
    } catch (err) {
      console.error("deleteDoctor error:", err);
      alert("Failed to delete doctor");
    }
  };

  /* ---------------- USERS ACTIONS ---------------- */
  const deleteUserFn = async (id) => {
    if (!window.confirm("Delete user?")) return;
    try {
      await axios.delete(`${BASE_URL}/api/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers((prev) => prev.filter((u) => u._id !== id));
    } catch (err) {
      console.error("deleteUser error:", err);
      alert("Failed to delete user");
    }
  };

  /* ---------------- CATEGORIES ACTIONS ---------------- */
  const addCategory = async () => {
    if (!categoryForm.name) return alert("Category name required");
    try {
      const res = await axios.post(`${BASE_URL}/api/admin/category`, categoryForm, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // backend returns res.data.category (see your controller)
      const created = res.data.category || res.data;
      setCategories((prev) => [created, ...prev]);
      setCategoryForm({ name: "", description: "" });
    } catch (err) {
      console.error("addCategory error:", err);
      alert("Failed to add category");
    }
  };

  /* ---------------- TICKETS: REPLY & CLOSE ----------------
      We'll assume API: PUT /api/admin/tickets/reply
      Body: { userId, ticketId, reply }
      Backend should:
        - find user by userId
        - find ticket by ticketId in user.supportTickets
        - set ticket.reply, ticket.status = 'closed', ticket.replyAt = Date.now()
      Response: updated ticket or success message
  ----------------------------------------------------- */
  const toggleReplyBox = (userId, ticketId) => {
    const key = `${userId}_${ticketId}`;
    setOpenReplyKey((prev) => (prev === key ? null : key));
  };

  const setReplyText = (userId, ticketId, text) => {
    const key = `${userId}_${ticketId}`;
    setTicketReplies((prev) => ({ ...prev, [key]: text }));
  };

  const sendReply = async (userId, ticketId) => {
    const key = `${userId}_${ticketId}`;
    const reply = (ticketReplies[key] || "").trim();
    if (!reply) return alert("Please type a reply before sending.");

    try {
      const res = await axios.put(
        `${BASE_URL}/api/admin/tickets/reply`,
        { userId, ticketId, reply },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update local users state: find user, find ticket, update reply and status
      setUsers((prevUsers) =>
        prevUsers.map((u) => {
          if (u._id !== userId) return u;
          const updatedTickets = (u.supportTickets || []).map((t) => {
            if (String(t._id) !== String(ticketId)) return t;
            return {
              ...t,
              reply,
              status: "closed",
              replyAt: new Date().toISOString(),
            };
          });
          return { ...u, supportTickets: updatedTickets };
        })
      );

      // close box + clear
      setOpenReplyKey(null);
      setTicketReplies((p) => {
        const copy = { ...p };
        delete copy[key];
        return copy;
      });

      alert("Reply sent and ticket marked as closed.");
    } catch (err) {
      console.error("sendReply error:", err);
      alert("Failed to send reply — check console.");
    }
  };

  /* ---------------- RENDER: USERS TABLE ---------------- */
  const renderUsersTable = () => {
    const filteredUsers = users.filter((u) => {
      const matchesSearch =
        u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRole = filterRole
        ? (u.role || "user").toLowerCase() === filterRole.toLowerCase()
        : true;

      return matchesSearch && matchesRole;
    });

    return (
      <div>
        <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
          <input
            type="text"
            placeholder="Search by name/email"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ padding: "6px 10px", borderRadius: "6px", border: "1px solid #ccc", flex: 1 }}
          />

          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            style={{ padding: "6px 10px", borderRadius: "6px", border: "1px solid #ccc" }}
          >
            <option value="">All Roles</option>
            <option value="user">User</option>
            <option value="nurse">Nurse</option>
            <option value="doctor">Doctor</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Name</th>
              <th style={thStyle}>Email</th>
              <th style={thStyle}>Role</th>
              <th style={thStyle}>Phone</th>
              <th style={thStyle}>Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredUsers.map((u, idx) => (
              <tr key={u._id} style={trStyle(idx)}>
                <td style={tdStyle}>{u.name}</td>
                <td style={tdStyle}>{u.email}</td>
                <td style={tdStyle}>{u.role}</td>
                <td style={tdStyle}>{u.phone || "-"}</td>
                <td style={tdStyle}>
                  <button
                    onClick={() => deleteUserFn(u._id)}
                    style={{
                      padding: "6px 10px",
                      backgroundColor: "#f44336",
                      color: "#fff",
                      border: "none",
                      borderRadius: "5px",
                      cursor: "pointer",
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  /* ---------------- RENDER: DOCTORS TABLE ---------------- */
  const renderDoctorsTable = () => {
    const filteredDoctors = doctors.filter((d) => {
      const matchesSearch =
        d.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.email?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = filterCategory
        ? (d.selectedCategory?.name || "").toLowerCase() === filterCategory.toLowerCase()
        : true;

      return matchesSearch && matchesCategory;
    });

    return (
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>Name</th>
            <th style={thStyle}>Email</th>
            <th style={thStyle}>Category</th>
            <th style={thStyle}>Status</th>
            <th style={thStyle}>Actions</th>
          </tr>
        </thead>

        <tbody>
          {filteredDoctors.map((d, idx) => (
            <tr key={d._id} style={trStyle(idx)}>
              <td style={tdStyle}>{d.name}</td>
              <td style={tdStyle}>{d.email}</td>
              <td style={tdStyle}>{d.selectedCategory?.name || "-"}</td>
              <td style={tdStyle}>
                {d.isApproved ? (
                  <span style={{ color: "green", fontWeight: "bold" }}>Approved</span>
                ) : (
                  <span style={{ color: "red", fontWeight: "bold" }}>Pending</span>
                )}
              </td>

              <td style={tdStyle}>
                {/* Approve - disabled when already approved */}
                <button
                  onClick={() => approveDoctor(d._id)}
                  disabled={d.isApproved}
                  style={{
                    padding: "6px 10px",
                    backgroundColor: d.isApproved ? "#ccc" : "#4CAF50",
                    color: "#fff",
                    border: "none",
                    marginRight: "5px",
                    borderRadius: "5px",
                    cursor: d.isApproved ? "not-allowed" : "pointer",
                  }}
                >
                  {d.isApproved ? "Approved" : "Approve"}
                </button>

                {/* Block / Unblock */}
                <button
                  onClick={() => toggleDoctor(d._id)}
                  style={{
                    padding: "6px 10px",
                    backgroundColor: d.isApproved ? "#ff9800" : "#4CAF50",
                    color: "#fff",
                    border: "none",
                    borderRadius: "5px",
                    marginRight: "5px",
                    cursor: "pointer",
                  }}
                >
                  {d.isApproved ? "Block" : "Unblock"}
                </button>

                {/* Delete */}
                <button
                  onClick={() => deleteDoctor(d._id)}
                  style={{
                    padding: "6px 10px",
                    backgroundColor: "#f44336",
                    color: "#fff",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                  }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  /* ---------------- RENDER: TICKETS TABLE (with reply) ---------------- */
  const renderTicketsTable = () => {
    // flatten tickets with reference to owning user so we can reply
    const allTickets = users.flatMap((u) =>
      (u.supportTickets || []).map((t) => ({
        ...t,
        userId: u._id,
        userName: u.name,
        userEmail: u.email,
      }))
    );

    return (
      <div>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>User</th>
              <th style={thStyle}>Subject</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Reply</th>
              <th style={thStyle}>Action</th>
            </tr>
          </thead>
          <tbody>
            {allTickets.map((t, idx) => {
              const key = `${t.userId}_${t._id}`;
              const isOpen = openReplyKey === key;

              return (
                <React.Fragment key={key}>
                  <tr style={trStyle(idx)}>
                    <td style={tdStyle}>
                      <div style={{ fontWeight: "bold" }}>{t.userName}</div>
                      <div style={{ color: "#666", fontSize: "12px" }}>{t.userEmail}</div>
                    </td>

                    <td style={tdStyle}>{t.subject}</td>

                    <td style={tdStyle}>
                      <div style={{ fontWeight: "bold" }}>{t.status}</div>
                      {t.reply && <div style={{ marginTop: "6px", fontSize: "12px" }}>Replied</div>}
                    </td>

                    <td style={tdStyle}>
                      {t.reply ? (
                        <div>
                          <div style={{ fontWeight: "600" }}>Admin Reply:</div>
                          <div style={{ marginTop: "6px" }}>{t.reply}</div>
                        </div>
                      ) : (
                        <div style={{ color: "#777" }}>No reply</div>
                      )}
                    </td>

                    <td style={tdStyle}>
                      {/* Toggle reply box */}
                      <button
                        onClick={() => toggleReplyBox(t.userId, t._id)}
                        style={{
                          padding: "6px 10px",
                          backgroundColor: "#4CAF50",
                          color: "#fff",
                          border: "none",
                          borderRadius: "6px",
                          marginRight: "8px",
                          cursor: "pointer",
                        }}
                      >
                        {isOpen ? "Close" : "Reply"}
                      </button>
                    </td>
                  </tr>

                  {/* Reply box row */}
                  {isOpen && (
                    <tr>
                      <td colSpan={5} style={{ padding: "10px 15px", background: "#fafafa" }}>
                        <textarea
                          rows={3}
                          value={ticketReplies[key] || ""}
                          onChange={(e) => setReplyText(t.userId, t._id, e.target.value)}
                          placeholder="Type your reply here..."
                          style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }}
                        />

                        <div style={{ marginTop: "8px", display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                          <button
                            onClick={() => {
                              setOpenReplyKey(null);
                            }}
                            style={{
                              padding: "8px 12px",
                              borderRadius: "6px",
                              border: "1px solid #ccc",
                              background: "#fff",
                              cursor: "pointer",
                            }}
                          >
                            Cancel
                          </button>

                          <button
                            onClick={() => sendReply(t.userId, t._id)}
                            style={{
                              padding: "8px 12px",
                              borderRadius: "6px",
                              border: "none",
                              background: "#4CAF50",
                              color: "#fff",
                              cursor: "pointer",
                            }}
                          >
                            Send Reply & Close
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  /* ---------------- RENDER: CATEGORIES ---------------- */
  
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", description: "" });

  const renderCategories = () => {
  const startEdit = (cat, safeId) => {
    setEditingId(safeId);
    setEditForm({
      name: cat?.name || "",
      description: cat?.description || ""
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ name: "", description: "" });
  };

  const saveEdit = async () => {
    if (!editForm.name.trim()) return alert("Name required");

    try {
      const res = await axios.put(
        `${BASE_URL}/api/admin/category/${editingId}`,  // safeId used
        editForm,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const updated = res.data.category;

      setCategories((prev) =>
        prev.map((c) =>
          (c._id || c.name) === editingId ? updated : c
        )
      );

      cancelEdit();
    } catch (err) {
      console.error("update category error:", err);
      alert("Failed to update category");
    }
  };

  const deleteCategory = async (id) => {
    if (!window.confirm("Delete this category?")) return;

    try {
      await axios.delete(`${BASE_URL}/api/admin/category/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setCategories((prev) =>
        prev.filter((c) => (c._id || c.name) !== id)
      );
    } catch (err) {
      console.error("delete category error:", err);
      alert("Failed to delete category");
    }
  };

  // SAFE FILTERING
  const uniqueCategoryNames = [
    ...new Set((categories || []).map((x) => x?.name || ""))
  ];

  const filteredCategories = (categories || []).filter((c) => {
    const name = c?.name || "";
    const desc = c?.description || "";
    const search = categorySearch.toLowerCase();

    const matchesSearch =
      name.toLowerCase().includes(search) ||
      desc.toLowerCase().includes(search);

    const matchesFilter = categoryFilter ? name === categoryFilter : true;

    return matchesSearch && matchesFilter;
  });

  return (
    <div>
      <h2 style={{ marginBottom: "15px" }}>Categories</h2>

      {/* ADD SECTION */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
        <input
          type="text"
          placeholder="Name"
          value={categoryForm.name}
          onChange={(e) =>
            setCategoryForm({ ...categoryForm, name: e.target.value })
          }
          style={{
            padding: "6px 10px",
            borderRadius: "6px",
            border: "1px solid #ccc",
            flex: 1,
          }}
        />

        <input
          type="text"
          placeholder="Description"
          value={categoryForm.description}
          onChange={(e) =>
            setCategoryForm({
              ...categoryForm,
              description: e.target.value,
            })
          }
          style={{
            padding: "6px 10px",
            borderRadius: "6px",
            border: "1px solid #ccc",
            flex: 2,
          }}
        />

        <button
          onClick={addCategory}
          style={{
            padding: "6px 12px",
            backgroundColor: "#4CAF50",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Add
        </button>
      </div>

      {/* SEARCH + FILTER */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
        <input
          type="text"
          placeholder="Search..."
          value={categorySearch}
          onChange={(e) => setCategorySearch(e.target.value)}
          style={{
            padding: "6px 10px",
            borderRadius: "6px",
            border: "1px solid #ccc",
            flex: 2,
          }}
        />

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          style={{
            padding: "6px 10px",
            borderRadius: "6px",
            border: "1px solid #ccc",
            flex: 1,
          }}
        >
          <option value="">All</option>
          {uniqueCategoryNames.map((name, i) => (
            <option key={i} value={name}>
              {name}
            </option>
          ))}
        </select>
      </div>

      {/* CATEGORY TABLE */}
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>Name</th>
            <th style={thStyle}>Description</th>
            <th style={thStyle}>Actions</th>
          </tr>
        </thead>

        <tbody>
          {filteredCategories.map((c, idx) => {
            const safeId = c._id || c.name || idx;
            const isEditing = editingId === safeId;

            return (
              <tr key={safeId} style={trStyle(idx)}>
                <td style={tdStyle}>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) =>
                        setEditForm({ ...editForm, name: e.target.value })
                      }
                      style={{
                        padding: "6px",
                        width: "100%",
                        borderRadius: "6px",
                        border: "1px solid #ccc",
                      }}
                    />
                  ) : (
                    c?.name || "-"
                  )}
                </td>

                <td style={tdStyle}>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.description}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          description: e.target.value,
                        })
                      }
                      style={{
                        padding: "6px",
                        width: "100%",
                        borderRadius: "6px",
                        border: "1px solid #ccc",
                      }}
                    />
                  ) : (
                    c?.description || "-"
                  )}
                </td>

                <td style={tdStyle}>
                  {isEditing ? (
                    <>
                      <button
                        onClick={saveEdit}
                        style={{
                          padding: "6px 10px",
                          backgroundColor: "#4CAF50",
                          color: "#fff",
                          border: "none",
                          borderRadius: "6px",
                          marginRight: "6px",
                        }}
                      >
                        Save
                      </button>

                      <button
                        onClick={cancelEdit}
                        style={{
                          padding: "6px 10px",
                          backgroundColor: "#888",
                          color: "#fff",
                          border: "none",
                          borderRadius: "6px",
                        }}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => startEdit(c, safeId)}
                        style={{
                          padding: "6px 10px",
                          backgroundColor: "#2196F3",
                          color: "#fff",
                          border: "none",
                          borderRadius: "6px",
                          marginRight: "6px",
                        }}
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => deleteCategory(safeId)}
                        style={{
                          padding: "6px 10px",
                          backgroundColor: "#f44336",
                          color: "#fff",
                          border: "none",
                          borderRadius: "6px",
                        }}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

  return (
    <div style={{ display: "flex" }}>
      {/* SIDEBAR */}
      <div style={sidebarStyle}>
        <div>
          <div style={profileStyle}>
            {user?.profilePic && <img src={user.profilePic} alt="Profile" style={profilePicStyle} />}

            <p style={{ fontWeight: "bold", fontSize: "16px" }}>{user?.name || "Admin"}</p>
            <p style={{ fontSize: "13px", color: "#ccc" }}>Role: {user?.role}</p>
            {user?.tenantId && <p style={{ fontSize: "13px", color: "#ccc" }}>Tenant: {user?.tenantId}</p>}
          </div>

          {["Dashboard", "Users", "Doctors", "Tickets", "Categories"].map((section) => (
            <div key={section} style={menuItemStyle(activeSection === section)} onClick={() => handleMenuClick(section)}>
              {section}
            </div>
          ))}
        </div>

        <div style={{ padding: "0.5rem" }}>
          <div style={bottomLinkStyle(false, true)} onClick={handleLogout}>
            Logout
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div style={{ marginLeft: "260px", padding: "50px", flex: 1 }}>
        {activeSection === "Dashboard" && (
          <div>
            <div style={{ display: "flex", gap: "20px", marginBottom: "30px", flexWrap: "wrap" }}>
              <div style={cardStyle}>Users: {stats.users}</div>
              <div style={cardStyle}>Doctors: {stats.doctors}</div>
              <div style={cardStyle}>Tickets: {stats.tickets}</div>
              <div style={cardStyle}>Categories: {stats.categories}</div>
            </div>

            <h2>Recent Tickets</h2>
            {renderTicketsTable()}
          </div>
        )}

        {activeSection === "Users" && renderUsersTable()}
        {activeSection === "Doctors" && renderDoctorsTable()}
        {activeSection === "Tickets" && renderTicketsTable()}
        {activeSection === "Categories" && renderCategories()}
      </div>
    </div>
  );
}
