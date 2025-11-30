import { useEffect, useState, useMemo } from "react";
import axios from "axios";

const BASE_URL = "https://hospital-management-project-gf55.onrender.com";

export default function Support() {
  const token = localStorage.getItem("token");
  const [user, setUser] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [subject, setSubject] = useState("");
  const [customSubject, setCustomSubject] = useState("");
  const [message, setMessage] = useState("");
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const parsed = Date.parse(dateString);
    if (isNaN(parsed)) return "-";
    return new Date(parsed).toLocaleString();
  };

  // Fetch user
  useEffect(() => {
    if (!token) return;
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data.user);
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    };
    fetchProfile();
  }, [token]);

  // Fetch categories
  useEffect(() => {
    if (!token) return;
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/admin/category`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCategories(res.data);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };
    fetchCategories();
  }, [token]);

  // Fetch tickets
  useEffect(() => {
    if (!user?._id) return;
    const fetchTickets = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${BASE_URL}/api/tickets/${user._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTickets(
          res.data
            .map((t) => ({
              ...t,
              createdAt: t.createdAt || t.updatedAt || new Date().toISOString(),
            }))
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        );
      } catch (err) {
        console.error(err);
        alert("Error fetching tickets");
      }
      setLoading(false);
    };
    fetchTickets();
  }, [user, token]);

  // Create ticket
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?._id) return alert("User not loaded yet!");
    const finalSubject = subject === "Other" ? customSubject : subject;
    if (!finalSubject || !message) return alert("Subject and Message required!");

    try {
      const res = await axios.post(
        `${BASE_URL}/api/tickets/create`,
        { subject: finalSubject, message },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTickets((prev) => [
        {
          ...res.data.ticket,
          createdAt: res.data.ticket?.createdAt || new Date().toISOString(),
        },
        ...prev,
      ]);
      setSubject("");
      setCustomSubject("");
      setMessage("");
    } catch (err) {
      console.error(err);
      alert("Error creating ticket");
    }
  };

  const handleDelete = async (ticketId) => {
    if (!user?._id) return alert("User not loaded yet!");
    if (!window.confirm("Delete this ticket?")) return;

    try {
      await axios.delete(`${BASE_URL}/api/tickets/${user._id}/${ticketId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTickets((prev) => prev.filter((t) => t._id !== ticketId));
    } catch (err) {
      console.error(err);
      alert("Error deleting ticket");
    }
  };

  // Filtered tickets (search + status)
  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      const matchesSearch =
        t.subject.toLowerCase().includes(search.toLowerCase()) ||
        t.message.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter ? t.status === statusFilter : true;
      return matchesSearch && matchesStatus;
    });
  }, [tickets, search, statusFilter]);

  return (
    <div
      style={{
        maxWidth: "900px",
        margin: "50px auto",
        padding: "20px",
        background: "#fff",
        borderRadius: "10px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
        Raise a Support Ticket
      </h2>

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "15px" }}
      >
        <select
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }}
        >
          <option value="">-- Select a Subject/Category --</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat.name}>
              {cat.name}
            </option>
          ))}
          <option value="Other">Other</option>
        </select>

        {subject === "Other" && (
          <input
            type="text"
            placeholder="Custom subject"
            value={customSubject}
            onChange={(e) => setCustomSubject(e.target.value)}
            style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }}
          />
        )}

        <textarea
          placeholder="Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={5}
          style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }}
        />

        <button
          type="submit"
          style={{
            padding: "10px",
            borderRadius: "5px",
            border: "none",
            background: "#3498db",
            color: "#fff",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          Submit Ticket
        </button>
      </form>

      {/* Search & Filter */}
      <div style={{ marginTop: "30px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <input
          type="text"
          placeholder="Search by subject or message"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: "1", padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }}
        >
          <option value="">All Statuses</option>
          <option value="open">Open</option>
          <option value="pending">Pending</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      <h3 style={{ marginTop: "20px", color: "#333" }}>
        {filteredTickets.length === 0 ? "No tickets found." : "My Tickets"}
      </h3>

      {loading ? (
        <p>Loading tickets...</p>
      ) : (
        filteredTickets.length > 0 && (
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginTop: "10px",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#000000ff", color: "#fff" }}>
                <th style={{ padding: "10px", textAlign: "left" }}>Subject</th>
                <th style={{ padding: "10px", textAlign: "left" }}>Message</th>
                <th style={{ padding: "10px", textAlign: "left" }}>Status</th>
                <th style={{ padding: "10px", textAlign: "left" }}>Reply</th>
                <th style={{ padding: "10px", textAlign: "left" }}>Created At</th>
                <th style={{ padding: "10px", textAlign: "left" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.map((t) => (
                <tr key={t._id} style={{ borderBottom: "1px solid #ccc" }}>
                  <td style={{ padding: "10px" }}>{t.subject}</td>
                  <td style={{ padding: "10px" }}>{t.message}</td>
                  <td
                    style={{
                      padding: "10px",
                      color:
                        t.status === "open"
                          ? "green"
                          : t.status === "pending"
                          ? "orange"
                          : "red",
                    }}
                  >
                    {t.status}
                  </td>
                  <td style={{ padding: "10px", color: "blue" }}>{t.reply || "-"}</td>
                  <td style={{ padding: "10px" }}>{formatDate(t.createdAt)}</td>
                  <td style={{ padding: "10px" }}>
                    <button
                      onClick={() => handleDelete(t._id)}
                      style={{
                        padding: "5px 10px",
                        border: "none",
                        borderRadius: "5px",
                        background: "#e74c3c",
                        color: "#fff",
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
        )
      )}
    </div>
  );
}
