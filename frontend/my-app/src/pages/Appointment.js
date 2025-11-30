// src/pages/Appointment.js
import { useEffect, useState, useMemo } from "react";
import axios from "axios";

const BASE_URL = "http://localhost:5000";

export default function Appointment() {
  const token = localStorage.getItem("token");
  const [user, setUser] = useState(null);

  // form state
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [doctorId, setDoctorId] = useState("");
  const [date, setDate] = useState(""); // yyyy-mm-dd
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [description, setDescription] = useState("");

  // appointments list
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);

  // ---------- Load profile ----------
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
        alert("Please login again.");
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
    };
    fetchProfile();
  }, [token]);

  // ---------- Load categories ----------
  useEffect(() => {
    if (!token) return;
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/admin/category`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCategories(res.data || []);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };
    fetchCategories();
  }, [token]);

  // ---------- When category changes -> load doctors ----------
  useEffect(() => {
    if (!token || !categoryId) {
      setDoctors([]);
      setDoctorId(""); // reset selected doctor
      return;
    }

    const fetchDoctors = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/appointment/doctors/${categoryId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("does this fetch doctor working")
        setDoctors(res.data || []);
        setDoctorId(""); // reset selected doctor when category changes
      } catch (err) {
        console.error("Error fetching doctors:", err);
        setDoctors([]);
        setDoctorId("");
      }
    };
    fetchDoctors();
  }, [token, categoryId]);

  // ---------- When doctor OR date changes -> load available slots ----------
useEffect(() => {
  if (!token || !doctorId || !date) {
    setAvailableSlots([]);
    setSelectedSlot("");
    return;
  }

  const fetchSlots = async () => {
    try {
      // 1) get available slots from backend
      const res = await axios.get(
        `${BASE_URL}/api/appointment/slots/${doctorId}/${date}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      let slots = res.data?.availableSlots || [];

      // 2) fetch all appointments for this doctor on this date
      const bookedRes = await axios.get(
        `${BASE_URL}/api/admin/appointments/doctor/${doctorId}/${date}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const bookedTimes = bookedRes.data?.map((b) => b.time) || [];

      // 3) remove booked slots
      const filtered = slots.filter((slot) => !bookedTimes.includes(slot));

      setAvailableSlots(filtered);
      setSelectedSlot("");
    } catch (err) {
      console.error("Error fetching slots:", err);
      setAvailableSlots([]);
    }
  };

  fetchSlots();
}, [token, doctorId, date]);


  // ---------- Load user's appointments ----------
  const loadAppointments = async (uid) => {
    if (!token || !uid) return;
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/api/appointment/user/${uid}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAppointments(res.data || []);
    } catch (err) {
      console.error("Error loading appointments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?._id) loadAppointments(user._id);
  }, [user]);

  // ---------- Book appointment ----------
  const handleBook = async (e) => {
    e.preventDefault();
    if (!user?._id) return alert("User not loaded.");
    if (!categoryId) return alert("Please select a category.");
    if (!doctorId) return alert("Please select a doctor.");
    if (!date) return alert("Please select a date.");
    if (!selectedSlot) return alert("Please select a time slot.");

    try {
      const body = {
        userId: user._id,
        doctorId,
        categoryId,
        hospitalId: null,
        date,
        time: selectedSlot,
        description,
      };

      const res = await axios.post(`${BASE_URL}/api/appointment/create`, body, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert(res.data?.message || "Appointment booked");

      if (res.data?.appointment) {
        setAppointments((prev) => [res.data.appointment, ...prev]);
      } else {
        loadAppointments(user._id);
      }

      setCategoryId("");
      setDoctors([]);
      setDoctorId("");
      setDate("");
      setAvailableSlots([]);
      setSelectedSlot("");
      setDescription("");
    } catch (err) {
      console.error("Booking failed:", err);
      alert(err.response?.data?.message || "Booking failed");
    }
  };

  // ---------- Cancel appointment ----------
  const handleCancel = async (appointmentId) => {
    if (!user?._id) return;
    if (!window.confirm("Cancel this appointment?")) return;

    try {
      await axios.delete(`${BASE_URL}/api/appointment/${user._id}/${appointmentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAppointments((prev) => prev.filter((a) => a._id !== appointmentId));
      alert("Appointment cancelled");
    } catch (err) {
      console.error("Cancel failed:", err);
      alert("Could not cancel appointment");
    }
  };

  // ---------- Date helpers ----------
  const todayYYYYMMDD = useMemo(() => {
    const t = new Date();
    const y = t.getFullYear();
    const m = `${t.getMonth() + 1}`.padStart(2, "0");
    const d = `${t.getDate()}`.padStart(2, "0");
    return `${y}-${m}-${d}`;
  }, []);

  // ---------- Render ----------
  return (
    <div style={{ maxWidth: 900, margin: "40px auto", padding: 20, background: "#fff", borderRadius: 10, boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
      <h2 style={{ textAlign: "center", marginBottom: 18 }}>Book an Appointment</h2>

      {/* Form */}
      <form onSubmit={handleBook} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          style={{ padding: 10, borderRadius: 6, border: "1px solid #ccc" }}
        >
          <option value="">-- Select Category / Department --</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          value={doctorId}
          onChange={(e) => setDoctorId(e.target.value)}
          disabled={!doctors.length}
          style={{ padding: 10, borderRadius: 6, border: "1px solid #ccc" }}
        >
          <option value="">-- Select Doctor --</option>
          {doctors.map((d) => (
            <option key={d._id} value={d._id}>
              {d.name || `${d.firstName || ""} ${d.lastName || ""}`.trim()} {d.specialization ? `- ${d.specialization}` : ""}
            </option>
          ))}
        </select>

        <input type="date" value={date} min={todayYYYYMMDD} onChange={(e) => setDate(e.target.value)} style={{ padding: 10, borderRadius: 6, border: "1px solid #ccc" }} />

        <div>
          <div style={{ marginBottom: 8, fontWeight: "600" }}>Available Time Slots</div>
          {doctorId && date ? (
            availableSlots.length > 0 ? (
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {availableSlots.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setSelectedSlot(slot)}
                    style={{
                      padding: "8px 12px",
                      borderRadius: 6,
                      border: selectedSlot === slot ? "2px solid #1976d2" : "1px solid #ccc",
                      background: selectedSlot === slot ? "#e8f0ff" : "#fff",
                      cursor: "pointer",
                    }}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            ) : (
              <div style={{ color: "#666" }}>No slots available for selected date.</div>
            )
          ) : (
            <div style={{ color: "#666" }}>Select doctor and date to see slots.</div>
          )}
        </div>

        <textarea
          placeholder="Brief description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          style={{ padding: 10, borderRadius: 6, border: "1px solid #ccc" }}
        />

        <button type="submit" style={{ padding: 12, borderRadius: 6, border: "none", background: "#1976d2", color: "#fff", fontWeight: "600", cursor: "pointer" }}>
          Book Appointment
        </button>
      </form>

      {/* Appointments list */}
      <div style={{ marginTop: 28 }}>
        <h3 style={{ marginBottom: 12 }}>My Appointments</h3>
        {loading ? (
          <p>Loading appointments...</p>
        ) : appointments.length === 0 ? (
          <p>No appointments yet.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#111", color: "#fff" }}>
                <th style={thStyle}>Doctor</th>
                <th style={thStyle}>Category</th>
                <th style={thStyle}>Date</th>
                <th style={thStyle}>Time</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Action</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((a) => (
                <tr key={a._id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={tdStyle}>{a.doctor?.name || `${a.doctor?.firstName || ""} ${a.doctor?.lastName || ""}`.trim()}</td>
                  <td style={tdStyle}>{a.category?.name || "-"}</td>
                  <td style={tdStyle}>{a.date}</td>
                  <td style={tdStyle}>{a.time}</td>
                  <td style={tdStyle}>{a.status}</td>
                  <td style={tdStyle}>
                    <button onClick={() => handleCancel(a._id)} style={{ padding: "6px 8px", borderRadius: 6, border: "none", background: "#e74c3c", color: "#fff", cursor: "pointer" }}>
                      Cancel
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

const thStyle = { padding: 10, textAlign: "left", fontSize: 14 };
const tdStyle = { padding: 10, fontSize: 13 };
