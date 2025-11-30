import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./AdminDashboard.css";

const BASE_URL = "https://hospital-management-project-gf55.onrender.com";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [activeSection, setActiveSection] = useState("Dashboard");
  const [user, setUser] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);

  const [stats, setStats] = useState({ users: 0, doctors: 0, tickets: 0, Deparment: 0 });

  const [users, setUsers] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [Deparment, setDeparment] = useState([]);

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

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) {
        setSidebarVisible(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

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
        // parallel fetch: users, doctors, Deparment
        const [usersRes, doctorsRes, DeparmentRes] = await Promise.all([
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
        const DeparmentData = DeparmentRes.data || [];

        const allTickets = usersData.flatMap((u) => u.supportTickets || []);

        setStats({
          users: usersData.length,
          doctors: doctorsData.length,
          tickets: allTickets.length,
          Deparment: DeparmentData.length,
        });

        setUsers(usersData);
        setDoctors(doctorsData);
        setDeparment(DeparmentData);
      } catch (err) {
        console.error("Error fetching admin data:", err);
        alert("Error fetching admin data — check console.");
      }
    };

    fetchAllData();
  }, [token]);

  const handleMenuClick = (menu) => {
    setActiveSection(menu);
    if (isMobile) {
      setSidebarVisible(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  const closeSidebar = () => {
    setSidebarVisible(false);
  };

  /* ---------------- DOCTORS TABLE ACTIONS ---------------- */
  const approveDoctor = async (id) => {
    try {
      await axios.put(`${BASE_URL}/api/admin/doctors/approve/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setDoctors((prev) => prev.map((d) => (d._id === id ? { ...d, isVerified: true } : d)));
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

      setDoctors((prev) => prev.map((d) => (d._id === id ? { ...d, isVerified: !d.isVerified } : d)));
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

  /* ---------------- Deparment ACTIONS ---------------- */
  const addCategory = async () => {
    if (!categoryForm.name) return alert("Category name required");
    try {
      const res = await axios.post(`${BASE_URL}/api/admin/category`, categoryForm, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // backend returns res.data.category (see your controller)
      const created = res.data.category || res.data;
      setDeparment((prev) => [created, ...prev]);
      setCategoryForm({ name: "", description: "" });
    } catch (err) {
      console.error("addCategory error:", err);
      alert("Failed to add category");
    }
  };

  /* ---------------- TICKETS: REPLY & CLOSE ---------------- */
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
        <div className="flex-container">
          <input
            type="text"
            placeholder="Search by name/email"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field"
          />

          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="select-field"
          >
            <option value="">All Roles</option>
            <option value="user">User</option>
            <option value="nurse">Nurse</option>
            <option value="doctor">Doctor</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Phone</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredUsers.map((u, idx) => (
                <tr key={u._id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.role}</td>
                  <td>{u.phone || "-"}</td>
                  <td>
                    <div className={isMobile ? "mobile-actions" : ""}>
                      <button
                        onClick={() => deleteUserFn(u._id)}
                        className="btn btn-danger"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const [doctorStatusFilter, setDoctorStatusFilter] = useState("");
  const [ticketStatusFilter, setTicketStatusFilter] = useState("");
  const [ticketSearch, setTicketSearch] = useState("");

  /* ---------------- RENDER: DOCTORS TABLE ---------------- */
  const renderDoctorsTable = () => {
    const search = searchTerm.toLowerCase();

    const filteredDoctors = doctors.filter((d) => {
      const name = (d.name || "").toLowerCase();
      const email = (d.email || "").toLowerCase();
      const categoryName = (d.selectedCategory?.name || "").toLowerCase();
      const status = d.isVerified ? "approved" : "pending";

      const matchesSearch =
        name.includes(search) ||
        email.includes(search) ||
        categoryName.includes(search);

      const matchesCategory = filterCategory
        ? categoryName === filterCategory.toLowerCase()
        : true;

      const matchesStatus =
        doctorStatusFilter
          ? status === doctorStatusFilter.toLowerCase()
          : true;

      return matchesSearch && matchesCategory && matchesStatus;
    });

    return (
      <div>
        {/* SEARCH + FILTER BAR */}
        <div className="flex-container">
          <input
            type="text"
            placeholder="Search by name/email/category"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field"
          />

          <select
            value={doctorStatusFilter}
            onChange={(e) => setDoctorStatusFilter(e.target.value)}
            className="select-field"
          >
            <option value="">All Status</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
          </select>
        </div>

        {/* DOCTOR TABLE */}
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Category</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredDoctors.map((d, idx) => (
                <tr key={d._id}>
                  <td>{d.name}</td>
                  <td>{d.email}</td>
                  <td>{d.selectedCategory?.name || "-"}</td>

                  {/* FIXED STATUS */}
                  <td>
                    {d.isVerified ? (
                      <span className="status-approved">
                        Approved
                      </span>
                    ) : (
                      <span className="status-pending">
                        Pending
                      </span>
                    )}
                  </td>

                  <td>
                    <div className={isMobile ? "mobile-actions" : ""}>
                      {/* FIXED APPROVE BUTTON */}
                      <button
                        onClick={() => approveDoctor(d._id)}
                        disabled={d.isVerified}
                        className="btn btn-primary"
                      >
                        {d.isVerified ? "Approved" : "Approve"}
                      </button>

                      {/* FIXED BLOCK/UNBLOCK BUTTON */}
                      <button
                        onClick={() => toggleDoctor(d._id)}
                        className="btn btn-warning"
                      >
                        {d.isVerified ? "Block" : "Unblock"}
                      </button>

                      {/* DELETE DOCTOR */}
                      <button
                        onClick={() => deleteDoctor(d._id)}
                        className="btn btn-danger"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  /* ---------------- RENDER: TICKETS TABLE (with reply) ---------------- */
  const renderTicketsTable = () => {
    const allTickets = users.flatMap((u) =>
      (u.supportTickets || []).map((t) => ({
        ...t,
        userId: u._id,
        userName: u.name,
        userEmail: u.email,
      }))
    );

    const search = ticketSearch.toLowerCase();

    const filteredTickets = allTickets.filter((t) => {
      const subject = (t.subject || "").toLowerCase();
      const user = (t.userName || "").toLowerCase();
      const email = (t.userEmail || "").toLowerCase();
      const status = (t.status || "").toLowerCase();

      const matchesSearch =
        subject.includes(search) ||
        user.includes(search) ||
        email.includes(search);

      const matchesStatus = ticketStatusFilter
        ? status === ticketStatusFilter.toLowerCase()
        : true;

      return matchesSearch && matchesStatus;
    });

    return (
      <div>
        {/* SEARCH + FILTER BAR */}
        <div className="flex-container">
          <input
            type="text"
            placeholder="Search tickets (subject/user/email)"
            value={ticketSearch}
            onChange={(e) => setTicketSearch(e.target.value)}
            className="input-field"
          />

          <select
            value={ticketStatusFilter}
            onChange={(e) => setTicketStatusFilter(e.target.value)}
            className="select-field"
          >
            <option value="">All Status</option>
            <option value="open">Open</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        {/* TICKET TABLE */}
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>User</th>
                <th>Subject</th>
                <th>Status</th>
                <th>Reply</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredTickets.map((t, idx) => {
                const key = `${t.userId}_${t._id}`;
                const isOpen = openReplyKey === key;

                return (
                  <React.Fragment key={key}>
                    <tr>
                      <td>
                        <b>{t.userName}</b>
                        <div className="user-info">
                          {t.userEmail}
                        </div>
                      </td>

                      <td>{t.subject}</td>
                      <td>{t.status}</td>

                      <td>
                        {t.reply ? (
                          <div>{t.reply}</div>
                        ) : (
                          <span style={{ color: "#777" }}>No reply</span>
                        )}
                      </td>

                      <td>
                        <button
                          onClick={() => toggleReplyBox(t.userId, t._id)}
                          className="btn btn-primary"
                        >
                          {isOpen ? "Close" : "Reply"}
                        </button>
                      </td>
                    </tr>

                    {isOpen && (
                      <tr>
                        <td colSpan={5} style={{ padding: "10px", background: "#fafafa" }}>
                          <textarea
                            rows="3"
                            value={ticketReplies[key] || ""}
                            onChange={(e) =>
                              setReplyText(t.userId, t._id, e.target.value)
                            }
                            placeholder="Type reply..."
                            className="textarea-field"
                          ></textarea>

                          <div style={{ marginTop: "8px", textAlign: "right" }}>
                            <button
                              onClick={() => sendReply(t.userId, t._id)}
                              className="btn btn-primary"
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
      </div>
    );
  };

  /* ---------------- RENDER: Deparment ---------------- */
  
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", description: "" });

  const renderDeparment = () => {
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

        setDeparment((prev) =>
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

        setDeparment((prev) =>
          prev.filter((c) => (c._id || c.name) !== id)
        );
      } catch (err) {
        console.error("delete category error:", err);
        alert("Failed to delete category");
      }
    };

    // SAFE FILTERING
    const uniqueCategoryNames = [
      ...new Set((Deparment || []).map((x) => x?.name || ""))
    ];

    const filteredDeparment = (Deparment || []).filter((c) => {
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
        <h2 style={{ marginBottom: "15px" }}>Deparment</h2>

        {/* ADD SECTION */}
        <div className="flex-container">
          <input
            type="text"
            placeholder="Name"
            value={categoryForm.name}
            onChange={(e) =>
              setCategoryForm({ ...categoryForm, name: e.target.value })
            }
            className="input-field"
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
            className="input-field"
          />

          <button
            onClick={addCategory}
            className="btn btn-primary"
          >
            Add
          </button>
        </div>

        {/* SEARCH + FILTER */}
        <div className="flex-container">
          <input
            type="text"
            placeholder="Search..."
            value={categorySearch}
            onChange={(e) => setCategorySearch(e.target.value)}
            className="input-field"
          />

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="select-field"
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
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredDeparment.map((c, idx) => {
                const safeId = c._id || c.name || idx;
                const isEditing = editingId === safeId;

                return (
                  <tr key={safeId}>
                    <td>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(e) =>
                            setEditForm({ ...editForm, name: e.target.value })
                          }
                          className="input-field"
                          style={{ width: "100%" }}
                        />
                      ) : (
                        c?.name || "-"
                      )}
                    </td>

                    <td>
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
                          className="input-field"
                          style={{ width: "100%" }}
                        />
                      ) : (
                        c?.description || "-"
                      )}
                    </td>

                    <td>
                      <div className={isMobile ? "mobile-actions" : ""}>
                        {isEditing ? (
                          <>
                            <button
                              onClick={saveEdit}
                              className="btn btn-primary"
                            >
                              Save
                            </button>

                            <button
                              onClick={cancelEdit}
                              className="btn btn-secondary"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => startEdit(c, safeId)}
                              className="btn btn-info"
                            >
                              Edit
                            </button>

                            <button
                              onClick={() => deleteCategory(safeId)}
                              className="btn btn-danger"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", position: "relative" }}>
      {/* Mobile Header with Logout Button - Always Visible on Mobile */}
      {isMobile && (
        <div className="mobile-header">
          <div className="mobile-header-content">
            <div className="mobile-profile">
              {user?.profilePic && (
                <img 
                  src={user.profilePic} 
                  alt="Profile" 
                  className="mobile-profile-pic" 
                />
              )}
              <div className="mobile-user-info">
                <h3>{user?.name || "Admin"}</h3>
                <p>{user?.role} • {user?.tenantId || "System"}</p>
              </div>
            </div>

            {/* Mobile Logout Button - Always Visible */}
            <button
              className="mobile-logout-btn"
              onClick={handleLogout}
              title="Logout"
            >
              Logout
            </button>
          </div>
        </div>
      )}

      {/* Mobile Hamburger Menu */}
      <button 
        className={`hamburger-menu ${sidebarVisible ? 'active' : ''}`}
        onClick={toggleSidebar}
      >
        <span className="hamburger-line"></span>
        <span className="hamburger-line"></span>
        <span className="hamburger-line"></span>
      </button>

      {/* Mobile Overlay */}
      {isMobile && (
        <div 
          className={`mobile-overlay ${sidebarVisible ? 'visible' : ''}`}
          onClick={closeSidebar}
        />
      )}

      {/* SIDEBAR */}
      <div className={`sidebar ${isMobile ? (sidebarVisible ? 'mobile-visible' : 'mobile-hidden') : ''}`}>
        <div>
          <div className="profile-section">
            {user?.profilePic && <img src={user.profilePic} alt="Profile" className="profile-pic" />}

            <p style={{ fontWeight: "bold", fontSize: "16px" }}>{user?.name || "Admin"}</p>
            <p style={{ fontSize: "13px", color: "#ccc" }}>Role: {user?.role}</p>
            {user?.tenantId && <p style={{ fontSize: "13px", color: "#ccc" }}>Tenant: {user?.tenantId}</p>}
          </div>

          {["Dashboard", "Users", "Doctors", "Tickets", "Deparment"].map((section) => (
            <div 
              key={section} 
              className={`menu-item ${activeSection === section ? 'active' : ''}`} 
              onClick={() => handleMenuClick(section)}
            >
              {section}
            </div>
          ))}
        </div>

        <div style={{ padding: "0.5rem" }}>
          {/* Only show sidebar logout on desktop */}
          {!isMobile && (
            <div className="bottom-link logout" onClick={handleLogout}>
              Logout
            </div>
          )}
        </div>
      </div>

      {/* CONTENT */}
      <div className={`content-area ${isMobile ? 'mobile-full' : ''}`}>
        {activeSection === "Dashboard" && (
          <div>
            <div className="flex-wrap">
              <div className="card">Users: {stats.users}</div>
              <div className="card">Doctors: {stats.doctors}</div>
              <div className="card">Tickets: {stats.tickets}</div>
              <div className="card">Deparment: {stats.Deparment}</div>
            </div>

            <h2>Recent Tickets</h2>
            {renderTicketsTable()}
          </div>
        )}

        {activeSection === "Users" && renderUsersTable()}
        {activeSection === "Doctors" && renderDoctorsTable()}
        {activeSection === "Tickets" && renderTicketsTable()}
        {activeSection === "Deparment" && renderDeparment()}
      </div>
    </div>
  );
}