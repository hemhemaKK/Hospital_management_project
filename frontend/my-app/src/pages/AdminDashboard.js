import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ProfileSettings from "./ProfileSettings";

const BASE_URL = "http://localhost:5000";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [activeSection, setActiveSection] = useState("Dashboard");
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ users: 0, doctors: 0, tickets: 0, categories: 0 });
  const [users, setUsers] = useState([]);
  const [ticketReplies, setTicketReplies] = useState({});
  const [doctors, setdoctors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoryForm, setCategoryForm] = useState({ name: "", description: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [filterCategory, setFilterCategory] = useState("");

  // --- Fetching data ---
  useEffect(() => {
    if (!token) return;

    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/profile`, { headers: { Authorization: `Bearer ${token}` } });
        setUser(res.data.user);
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    };

    const fetchAllData = async () => {
      try {
        const [usersRes, doctorsRes, categoriesRes] = await Promise.all([
          axios.get(`${BASE_URL}/api/admin/users`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${BASE_URL}/api/admin/doctors`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${BASE_URL}/api/admin/category`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        const allTickets = usersRes.data.flatMap(u => u.supportTickets || []);

        setStats({
          users: usersRes.data.length,
          doctors: doctorsRes.data.length,
          tickets: allTickets.length,
          categories: categoriesRes.data.length,
        });

        setUsers(usersRes.data);
        setdoctors(doctorsRes.data);
        setCategories(categoriesRes.data);
      } catch (err) {
        console.error("Error fetching admin data:", err);
      }
    };

    fetchProfile();
    fetchAllData();
  }, [token]);

  // --- Handlers ---
  const handleMenuClick = (menu) => setActiveSection(menu);
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };
  const handleCategoryChange = (e) => {
    const { name, value } = e.target;
    setCategoryForm(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateCategory = async () => {
    if (!categoryForm.name) return alert("Category name is required");
    try {
      const res = await axios.post(`${BASE_URL}/api/admin/category`, categoryForm, { headers: { Authorization: `Bearer ${token}` } });
      setCategories(prev => [...prev, res.data.category]);
      setCategoryForm({ name: "", description: "" });
      setStats(prev => ({ ...prev, categories: prev.categories + 1 }));
      alert("Category created!");
    } catch (err) {
      console.error(err);
    }
  };

  const handleTicketReply = async (userId, ticketId) => {
    if (!ticketReplies[ticketId]) return alert("Enter a reply first!");
    try {
      await axios.put(`${BASE_URL}/api/tickets/reply/${userId}/${ticketId}`, { reply: ticketReplies[ticketId] }, { headers: { Authorization: `Bearer ${token}` } });
      alert("Replied successfully!");
      setUsers(prev => prev.map(u => ({
        ...u,
        supportTickets: u.supportTickets?.map(t => t._id === ticketId ? { ...t, status: "closed", reply: ticketReplies[ticketId] } : t)
      })));
      setTicketReplies(prev => ({ ...prev, [ticketId]: "" }));
    } catch (err) {
      console.error(err);
      alert("Failed to reply");
    }
  };

  // --- Styles ---
  const tableStyle = { width: "100%", borderCollapse: "separate", borderSpacing: 0, marginTop: "10px", backgroundColor: "#fff", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", borderRadius: "10px", overflow: "hidden", fontSize: "0.95rem", color: "#333" };
  const thStyle = { backgroundColor: "#020202ff", color: "#fff", textAlign: "left", padding: "12px 15px", fontWeight: "bold" };
  const tdStyle = { padding: "12px 15px", borderBottom: "1px solid #eee" };
  const trStyle = (idx) => ({ backgroundColor: idx % 2 === 0 ? "#f9f9f9" : "#fff", transition: "background-color 0.2s" });
  const cardStyle = { backgroundColor: "#fff", flex: "1 1 200px", padding: "20px", borderRadius: "10px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", textAlign: "center", fontWeight: "bold", fontSize: "18px" };
  const sectionTitle = { color: "#333", marginBottom: "15px" };
  const sidebarStyle = { width: "250px", minHeight: "100vh", backgroundColor: "#111", padding: "0.5rem", display: "flex", flexDirection: "column", justifyContent: "space-between", position: "fixed", left: 0, top: 0 };
  const profileStyle = { padding: "0.5rem", borderBottom: "1px solid #444", textAlign: "center" };
  const profilePicStyle = { borderRadius: "50%", marginBottom: "0.2rem", width: "80px", height: "80px", objectFit: "cover" };
  const menuItemStyle = isActive => ({ textDecoration: "none", color: isActive ? "#4CAF50" : "#fff", padding: "0.8rem 1rem", display: "block", borderRadius: "8px", margin: "0.4rem 0", cursor: "pointer", fontWeight: "bold", backgroundColor: isActive ? "#222" : "transparent", transition: "all 0.2s" });
  const bottomLinkStyle = (isActive, isLogout = false) => ({ textDecoration: "none", color: "#fff", padding: "0.8rem 1rem", display: "block", borderRadius: "8px", margin: "0.4rem 0", cursor: "pointer", fontWeight: "bold", backgroundColor: isLogout ? "#ff4d4d" : isActive ? "#222" : "transparent", textAlign: "center", transition: "all 0.2s" });

  // --- Render Tables ---
  const renderUsersTable = () => {
    const filteredUsers = users.filter(u => {
      const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = filterRole ? (u.role || "user").toLowerCase() === filterRole.toLowerCase() : true;
      return matchesSearch && matchesRole;
    });

    return (
      <div>
        <div style={{ display: "flex", gap: "10px", marginBottom: "10px", flexWrap: "wrap" }}>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ padding: "6px 10px", borderRadius: "6px", border: "1px solid #ccc", flex: 1 }}
          />
          <select
            value={filterRole}
            onChange={e => setFilterRole(e.target.value)}
            style={{ padding: "6px 10px", borderRadius: "6px", border: "1px solid #ccc" }}
          >
            <option value="">All Roles</option>
            <option value="user">User</option>
            <option value="nurse">Nurse</option>
            <option value="doctor">Doctor</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Name</th>
                <th style={thStyle}>Email</th>
                <th style={thStyle}>Role</th>
                <th style={thStyle}>Phone</th>
                <th style={thStyle}>Phone Verified</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u, idx) => (
                <tr key={u._id} style={trStyle(idx)}>
                  <td style={tdStyle}>{u.name}</td>
                  <td style={tdStyle}>{u.email}</td>
                  <td style={tdStyle}>{u.role || "User"}</td>
                  <td style={tdStyle}>{u.phone || "-"}</td>
                  <td style={tdStyle}>
                    <span style={{
                      color: "white",
                      padding: "4px 8px",
                      borderRadius: "6px",
                      backgroundColor: u.isPhoneVerified ? "green" : "red",
                      fontWeight: "bold",
                      fontSize: "0.9rem"
                    }}>{u.isPhoneVerified ? "Yes" : "No"}</span>
                  </td>
                  <td style={tdStyle}>
                    <button
                      onClick={async () => {
                        if (!window.confirm("Delete this user?")) return;
                        try {
                          await axios.delete(`${BASE_URL}/api/admin/users/${u._id}`, { headers: { Authorization: `Bearer ${token}` } });
                          setUsers(prev => prev.filter(user => user._id !== u._id));
                          setStats(prev => ({ ...prev, users: prev.users - 1 }));
                          alert("User deleted!");
                        } catch (err) {
                          console.error(err);
                          alert("Delete failed!");
                        }
                      }}
                      style={{ padding: "4px 8px", backgroundColor: "#ff4d4d", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", padding: "10px" }}>
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderdoctorsTable = () => {
    const filtereddoctors = doctors.filter(emp => {
      const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || emp.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory ? (emp.selectedCategory?.name || "").trim().toLowerCase() === filterCategory.trim().toLowerCase() : true;
      return matchesSearch && matchesCategory;
    });

    const groupeddoctors = filtereddoctors.reduce((acc, emp) => {
      const categoryName = emp.selectedCategory?.name || "No category";
      if (!acc[categoryName]) acc[categoryName] = [];
      acc[categoryName].push(emp);
      return acc;
    }, {});

    const uniqueCategories = [...new Set(doctors.map(e => e.selectedCategory?.name || "No category"))];

    return (
      <div>
        <div style={{ display: "flex", gap: "10px", marginBottom: "10px", flexWrap: "wrap" }}>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ padding: "6px 10px", borderRadius: "6px", border: "1px solid #ccc", flex: 1 }}
          />
          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            style={{ padding: "6px 10px", borderRadius: "6px", border: "1px solid #ccc" }}
          >
            <option value="">All Categories</option>
            {uniqueCategories.map(cat => (<option key={cat} value={cat.trim()}>{cat}</option>))}
          </select>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Name</th>
                <th style={thStyle}>Email</th>
                <th style={thStyle}>Phone</th>
                <th style={thStyle}>Role / Status</th>
                <th style={thStyle}>Category</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(groupeddoctors).map(([category, emps]) => (
                <React.Fragment key={category}>
                  <tr style={{ backgroundColor: "#e0e0e0" }}>
                    <td colSpan="6" style={{ textAlign: "center", fontWeight: "bold" }}>{category}</td>
                  </tr>
                  {emps.map((e, idx) => (
                    <tr key={e._id} style={trStyle(idx)}>
                      <td style={tdStyle}>{e.name}</td>
                      <td style={tdStyle}>{e.email}</td>
                      <td style={tdStyle}>{e.phone || "-"}</td>
                      <td style={tdStyle}>{e.role === "doctor" && !e.isApproved ? "Pending Approval" : e.isApproved ? "Approved" : e.role || "doctor"}</td>
                      <td style={tdStyle}>{e.selectedCategory?.name || "No category"}</td>
                      <td style={tdStyle}>
                        {e.role === "doctor" ? (
                          <div style={{ display: "flex", gap: "5px" }}>
                            <button
                              onClick={async () => {
                                try {
                                  const url = e.isApproved
                                    ? `${BASE_URL}/api/admin/doctors/toggle/${e._id}`
                                    : `${BASE_URL}/api/admin/doctors/approve/${e._id}`;
                                  await axios.put(url, {}, { headers: { Authorization: `Bearer ${token}` } });
                                  setdoctors(prev => prev.map(emp => emp._id === e._id ? { ...emp, isApproved: !emp.isApproved } : emp));
                                  alert(e.isApproved ? "Doctor disapproved!" : "Doctor approved!");
                                } catch (err) {
                                  console.error(err);
                                  alert("Action failed!");
                                }
                              }}
                              style={{ padding: "4px 8px", backgroundColor: e.isApproved ? "#FFC107" : "#4CAF50", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" }}
                            >{e.isApproved ? "Disapprove" : "Approve"}</button>

                            {!e.isApproved && (
                              <button
                                onClick={async () => {
                                  if (!window.confirm("Reject this doctor?")) return;
                                  try {
                                    await axios.delete(`${BASE_URL}/api/admin/doctors/reject/${e._id}`, { headers: { Authorization: `Bearer ${token}` } });
                                    setdoctors(prev => prev.filter(emp => emp._id !== e._id));
                                    setStats(prev => ({ ...prev, doctors: prev.doctors - 1 }));
                                    alert("Doctor rejected!");
                                  } catch (err) {
                                    console.error(err);
                                    alert("Rejection failed!");
                                  }
                                }}
                                style={{ padding: "4px 8px", backgroundColor: "#ff4d4d", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" }}
                              >Reject</button>
                            )}
                          </div>
                        ) : (
                          <button
                            onClick={async () => {
                              if (!window.confirm("Delete this user?")) return;
                              try {
                                await axios.delete(`${BASE_URL}/api/admin/users/${e._id}`, { headers: { Authorization: `Bearer ${token}` } });
                                setdoctors(prev => prev.filter(emp => emp._id !== e._id));
                                setStats(prev => ({ ...prev, doctors: prev.doctors - 1 }));
                                alert("User deleted!");
                              } catch (err) {
                                console.error(err);
                                alert("Delete failed!");
                              }
                            }}
                            style={{ padding: "4px 8px", backgroundColor: "#ff4d4d", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" }}
                          >Delete</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
              {filtereddoctors.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", padding: "10px" }}>No doctors found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };
  const [ticketSearch, setTicketSearch] = useState("");
  const [ticketStatusFilter, setTicketStatusFilter] = useState("");

  const renderTicketsTable = () => {
  
  const allTickets = users.flatMap(u =>
    (u.supportTickets || []).map(ticket => ({
      ...ticket,
      userId: u._id,
      userName: u.name,
      userEmail: u.email
    }))
  );

  // Filter tickets based on search and status
  const filteredTickets = allTickets.filter(ticket => {
    const matchesSearch =
      ticket.subject.toLowerCase().includes(ticketSearch.toLowerCase()) ||
      ticket.userName.toLowerCase().includes(ticketSearch.toLowerCase()) ||
      ticket.userEmail.toLowerCase().includes(ticketSearch.toLowerCase());
    const matchesStatus = ticketStatusFilter
      ? ticket.status.toLowerCase() === ticketStatusFilter.toLowerCase()
      : true;
    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      {/* Search & Filter */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "10px", flexWrap: "wrap" }}>
        <input
          type="text"
          placeholder="Search by user or subject..."
          value={ticketSearch}
          onChange={e => setTicketSearch(e.target.value)}
          style={{ flex: 1, padding: "6px 10px", borderRadius: "6px", border: "1px solid #ccc" }}
        />
        <select
          value={ticketStatusFilter}
          onChange={e => setTicketStatusFilter(e.target.value)}
          style={{ padding: "6px 10px", borderRadius: "6px", border: "1px solid #ccc" }}
        >
          <option value="">All Status</option>
          <option value="open">Open</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      {/* Tickets Table */}
      <div style={{ overflowX: "auto" }}>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>ID</th>
              <th style={thStyle}>User</th>
              <th style={thStyle}>Subject</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Date</th>
              <th style={thStyle}>Reply</th>
            </tr>
          </thead>
          <tbody>
            {filteredTickets.map((ticket, idx) => (
              <tr key={ticket._id || idx} style={trStyle(idx)}>
                <td style={tdStyle}>{ticket._id}</td>
                <td style={tdStyle}>{`${ticket.userName} (${ticket.userEmail})`}</td>
                <td style={tdStyle}>{ticket.subject}</td>
                <td style={tdStyle}>
                  <b style={{ color: ticket.status === "open" ? "green" : "red" }}>{ticket.status}</b>
                </td>
                <td style={tdStyle}>{new Date(ticket.createdAt).toLocaleString()}</td>
                <td style={tdStyle}>
                  {ticket.status === "open" ? (
                    <div style={{ display: "flex", gap: "5px" }}>
                      <input
                        type="text"
                        placeholder="Type reply..."
                        value={ticketReplies[ticket._id] || ""}
                        onChange={e => setTicketReplies(prev => ({ ...prev, [ticket._id]: e.target.value }))}
                        style={{ flex: 1, padding: "4px", borderRadius: "6px", border: "1px solid #ccc" }}
                      />
                      <button
                        onClick={() => handleTicketReply(ticket.userId, ticket._id)}
                        style={{ padding: "4px 8px", backgroundColor: "#4CAF50", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" }}
                      >
                        Reply
                      </button>
                    </div>
                  ) : ticket.reply || "-"}
                </td>
              </tr>
            ))}
            {filteredTickets.length === 0 && (
              <tr>
                <td colSpan="6" style={{ textAlign: "center", padding: "10px" }}>
                  No tickets found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

 
 const [categorySearch, setCategorySearch] = useState("");
 const [categoryFilter, setCategoryFilter] = useState("");
 const renderCategories = () => {

  // Unique category names for filter dropdown
  const uniqueCategoryNames = [...new Set(categories.map(c => c.name))];

  // Filtered categories based on search & filter
  const filteredCategories = categories.filter(
    c =>
      (c.name.toLowerCase().includes(categorySearch.toLowerCase()) ||
       (c.description || "").toLowerCase().includes(categorySearch.toLowerCase())) &&
      (categoryFilter ? c.name === categoryFilter : true)
  );

  return (
    <div>
      <h2 style={sectionTitle}>Categories</h2>

      {/* Add New Category */}
      <div style={{ marginBottom: "10px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={categoryForm.name}
          onChange={handleCategoryChange}
          style={{ padding: "6px 10px", borderRadius: "6px", border: "1px solid #ccc", flex: 1 }}
        />
        <input
          type="text"
          name="description"
          placeholder="Description"
          value={categoryForm.description}
          onChange={handleCategoryChange}
          style={{ padding: "6px 10px", borderRadius: "6px", border: "1px solid #ccc", flex: 2 }}
        />
        <button
          onClick={handleCreateCategory}
          style={{ padding: "6px 12px", backgroundColor: "#4CAF50", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" }}
        >
          Add
        </button>
      </div>

      {/* Search & Filter */}
      <div style={{ marginBottom: "10px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <input
          type="text"
          placeholder="Search categories..."
          value={categorySearch}
          onChange={e => setCategorySearch(e.target.value)}
          style={{ padding: "6px 10px", borderRadius: "6px", border: "1px solid #ccc", flex: 2 }}
        />
        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          style={{ padding: "6px 10px", borderRadius: "6px", border: "1px solid #ccc", flex: 1 }}
        >
          <option value="">All Categories</option>
          {uniqueCategoryNames.map(name => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
      </div>

      {/* Categories Table */}
      <div style={{ overflowX: "auto" }}>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Name</th>
              <th style={thStyle}>Description</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCategories.map((c, idx) => (
              <tr key={c._id} style={trStyle(idx)}>
                <td style={tdStyle}>{c.name}</td>
                <td style={tdStyle}>{c.description || "-"}</td>
                <td style={tdStyle}>
                  {/* Edit Button */}
                  <button
                    onClick={async () => {
                      const name = prompt("Enter new category name", c.name);
                      if (!name) return alert("Category name cannot be empty");
                      const description = prompt("Enter new description", c.description || "");
                      try {
                        const res = await axios.put(
                          `${BASE_URL}/api/admin/category/${c._id}`,
                          { name, description },
                          { headers: { Authorization: `Bearer ${token}` } }
                        );
                        setCategories(prev => prev.map(cat => (cat._id === c._id ? res.data.category : cat)));
                        alert("Category updated!");
                      } catch (err) {
                        console.error(err);
                        alert("Update failed!");
                      }
                    }}
                    style={{ marginRight: "5px", padding: "4px 8px", backgroundColor: "#2196F3", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" }}
                  >
                    Edit
                  </button>

                  {/* Delete Button */}
                  <button
                    onClick={async () => {
                      if (!window.confirm("Delete this category?")) return;
                      try {
                        await axios.delete(`${BASE_URL}/api/admin/category/${c._id}`, { headers: { Authorization: `Bearer ${token}` } });
                        setCategories(prev => prev.filter(cat => cat._id !== c._id));
                        alert("Category deleted!");
                      } catch (err) {
                        console.error(err);
                        alert("Delete failed!");
                      }
                    }}
                    style={{ padding: "4px 8px", backgroundColor: "#ff4d4d", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {filteredCategories.length === 0 && (
              <tr>
                <td colSpan="3" style={{ textAlign: "center", padding: "10px" }}>
                  No categories found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};


  // --- Main render ---
  return (
    <div style={{ display: "flex" }}>
      <div style={sidebarStyle}>
        <div>
          <div style={profileStyle}>
            {user?.profilePic && <img src={user.profilePic} alt="Profile" style={profilePicStyle} />}
            <p style={{ color: "#fff", fontWeight: "bold" }}>{user?.name || "Admin"}</p>
          </div>
          {["Dashboard", "Users", "doctors", "Tickets", "Categories", "Profile"].map(section => (
            <div key={section} style={menuItemStyle(activeSection === section)} onClick={() => handleMenuClick(section)}>{section}</div>
          ))}
        </div>
        <div style={{ padding: "0.5rem" }}>
          <div style={bottomLinkStyle(false, true)} onClick={handleLogout}>Logout</div>
        </div>
      </div>

      <div style={{ marginLeft: "260px", padding: "50px", flex: 1 }}>
        {activeSection === "Dashboard" && (
          <div>
      {/* Stats cards */}
      <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", marginBottom: "30px" }}>
        <div style={cardStyle}>Users: {stats.users}</div>
        <div style={cardStyle}>doctors: {stats.doctors}</div>
        <div style={cardStyle}>Tickets: {stats.tickets}</div>
        <div style={cardStyle}>Categories: {stats.categories}</div>
      </div>

      {/* Tickets table */}
      <div>
        <h2 style={{ marginBottom: "10px" }}>Recent Tickets</h2>
        {renderTicketsTable()}
      </div>
    </div>

          
        )}
        {activeSection === "Users" && renderUsersTable()}
        {activeSection === "doctors" && renderdoctorsTable()}
        {activeSection === "Tickets" && renderTicketsTable()}
        {activeSection === "Categories" && renderCategories()}
        {activeSection === "Profile" && <ProfileSettings />}
      </div>
    </div>
  );
}
