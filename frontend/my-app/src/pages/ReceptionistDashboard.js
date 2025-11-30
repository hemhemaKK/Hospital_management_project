// ReceptionistDashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// react-big-calendar + date-fns localizer
import { Calendar, Views } from "react-big-calendar";
import { dateFnsLocalizer } from "react-big-calendar";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import isWithinInterval from "date-fns/isWithinInterval";
import addMinutes from "date-fns/addMinutes";
import parseISO from "date-fns/parseISO";
import isSameDay from "date-fns/isSameDay";
import isAfter from "date-fns/isAfter";
import isBefore from "date-fns/isBefore";

import { saveAs } from "file-saver";

import "react-big-calendar/lib/css/react-big-calendar.css"; // optional but recommended

const locales = {
    "en-US": require("date-fns/locale/en-US"),
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek: (date) => startOfWeek(date, { weekStartsOn: 1 }),
    getDay,
    locales,
});

const BASE_URL = "http://localhost:5000/api";

export default function ReceptionistDashboard() {
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    // UI state: filters / search / sort
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState(""); // "", "PENDING", ...
    const [doctorFilter, setDoctorFilter] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("");
    const [sortBy, setSortBy] = useState("dateAsc"); // dateAsc, dateDesc, doctor, category
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");

    // calendar view state
    const [view, setView] = useState(Views.MONTH);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [currentDate, setCurrentDate] = useState(new Date());

    // derived lists for filter dropdowns
    const doctors = useMemo(() => {
        const map = {};
        appointments.forEach((a) => {
            if (a.doctor && a.doctor.name) map[a.doctor._id] = a.doctor;
        });
        return Object.values(map);
    }, [appointments]);

    const categories = useMemo(() => {
        const map = {};
        appointments.forEach((a) => {
            if (a.category && a.category.name) {
                const id = a.category._id || a.category;
                map[id] = { ...a.category, _id: id };
            }
        });
        return Object.values(map);
    }, [appointments]);

    // Fetch all appointments (receptionist endpoint)
    useEffect(() => {
        if (!token) {
            navigate("/login");
            return;
        }

        const fetchAllAppointments = async () => {
            try {
                setLoading(true);
                const res = await axios.get(`${BASE_URL}/appointment/receptionist/all`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                // Normalise appointments: ensure date/time exist and parseable
                const normalized = (res.data || []).map((a) => {
                    // Keep server fields, but ensure category is object with name where possible
                    const category = a.category && typeof a.category === "object" ? a.category : { _id: a.category, name: a.category?.name || null };

                    return {
                        ...a,
                        category,
                        // store as original date/time strings too
                        _rawDate: a.date,
                        _rawTime: a.time,
                    };
                });

                setAppointments(normalized);
            } catch (err) {
                console.error("Error fetching appointments:", err);
                alert("Unable to load appointments. Please login again.");
                localStorage.removeItem("token");
                navigate("/login");
            } finally {
                setLoading(false);
            }
        };

        fetchAllAppointments();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Utility: convert appointment -> calendar event
    const apptToEvent = (appt) => {
        // appt.date expected format: "YYYY-MM-DD", appt.time: "HH:mm" (24h)
        // create start Date at local timezone
        try {
            if (!appt._rawDate || !appt._rawTime) {
                // fallback: createdAt if exists
                const start = appt.createdAt ? new Date(appt.createdAt) : new Date();
                return {
                    id: appt._id,
                    title: `${appt.user?.name || "Patient"} — ${appt.doctor?.name || "Doctor"}`,
                    start,
                    end: addMinutes(start, 30),
                    allDay: false,
                    original: appt,
                };
            }

            // combine date + time into a Date
            const dtStr = `${appt._rawDate} ${appt._rawTime}`;
            // parse with date-fns: create Date via parse, using format "yyyy-MM-dd HH:mm"
            const parsed = parse(dtStr, "yyyy-MM-dd HH:mm", new Date());
            if (isNaN(parsed)) {
                // fallback to parseISO of date
                const start = parseISO(appt._rawDate);
                return {
                    id: appt._id,
                    title: `${appt.user?.name || "Patient"} — ${appt.doctor?.name || "Doctor"}`,
                    start,
                    end: addMinutes(start, 30),
                    allDay: false,
                    original: appt,
                };
            }

            return {
                id: appt._id,
                title: `${appt.user?.name || "Patient"} — ${appt.doctor?.name || "Doctor"}`,
                start: parsed,
                end: addMinutes(parsed, 30),
                allDay: false,
                original: appt,
            };
        } catch (e) {
            const start = appt.createdAt ? new Date(appt.createdAt) : new Date();
            return {
                id: appt._id,
                title: `${appt.user?.name || "Patient"} — ${appt.doctor?.name || "Doctor"}`,
                start,
                end: addMinutes(start, 30),
                allDay: false,
                original: appt,
            };
        }
    };

    // memoized calendar events from appointments
    const events = useMemo(() => appointments.map(apptToEvent), [appointments]);

    // Filtering logic (applies both to list and to calendar events display)
    const filteredAppointments = useMemo(() => {
        const term = searchTerm.trim().toLowerCase();

        const rangeFilter = (a) => {
            if (!dateFrom && !dateTo) return true;
            // convert appointment date to Date
            try {
                const apptDate = parse(a._rawDate, "yyyy-MM-dd", new Date());
                if (dateFrom) {
                    const fromD = parse(dateFrom, "yyyy-MM-dd", new Date());
                    if (isBefore(apptDate, fromD)) return false;
                }
                if (dateTo) {
                    const toD = parse(dateTo, "yyyy-MM-dd", new Date());
                    if (isAfter(apptDate, toD)) return false;
                }
                return true;
            } catch (e) {
                return true;
            }
        };

        const ret = appointments.filter((a) => {
            if (statusFilter && a.status !== statusFilter) return false;
            if (doctorFilter && (!a.doctor || String(a.doctor._id) !== String(doctorFilter))) return false;
            if (categoryFilter && (!a.category || String(a.category._id) !== String(categoryFilter))) return false;

            if (!rangeFilter(a)) return false;

            if (!term) return true;

            return (
                (a.user?.name || "").toLowerCase().includes(term) ||
                (a.doctor?.name || "").toLowerCase().includes(term) ||
                (a.category?.name || "").toLowerCase().includes(term) ||
                (a._rawDate || "").toLowerCase().includes(term) ||
                (a._rawTime || "").toLowerCase().includes(term)
            );
        });

        // sorting
        const sorted = ret.sort((x, y) => {
            if (sortBy === "dateAsc") {
                const dx = parse(`${x._rawDate} ${x._rawTime}`, "yyyy-MM-dd HH:mm", new Date());
                const dy = parse(`${y._rawDate} ${y._rawTime}`, "yyyy-MM-dd HH:mm", new Date());
                return dx - dy;
            }
            if (sortBy === "dateDesc") {
                const dx = parse(`${x._rawDate} ${x._rawTime}`, "yyyy-MM-dd HH:mm", new Date());
                const dy = parse(`${y._rawDate} ${y._rawTime}`, "yyyy-MM-dd HH:mm", new Date());
                return dy - dx;
            }
            if (sortBy === "doctor") {
                return (x.doctor?.name || "").localeCompare(y.doctor?.name || "");
            }
            if (sortBy === "category") {
                return (x.category?.name || "").localeCompare(y.category?.name || "");
            }
            return 0;
        });

        return sorted;
    }, [appointments, searchTerm, statusFilter, doctorFilter, categoryFilter, sortBy, dateFrom, dateTo]);

    // map filtered appointments to calendar events to restrict calendar view
    const filteredEvents = useMemo(() => filteredAppointments.map(apptToEvent), [filteredAppointments]);

    // handlers
    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    const handleSelectEvent = (event) => {
        setSelectedEvent(event.original || event);
    };

    const handleDoubleClickEvent = (event) => {
        // quick action: open selected
        setSelectedEvent(event.original || event);
    };

    const handleExportCSV = () => {
        if (!filteredAppointments || filteredAppointments.length === 0) {
            alert("No appointments to export.");
            return;
        }
        const header = ["Patient", "Doctor", "Category", "Date", "Time", "Status", "Description"];
        const rows = filteredAppointments.map((a) => [
            `"${a.user?.name || ""}"`,
            `"${a.doctor?.name || ""}"`,
            `"${a.category?.name || ""}"`,
            a._rawDate || "",
            a._rawTime || "",
            a.status || "",
            `"${(a.description || "").replace(/"/g, '""')}"`,
        ]);
        const csv = [header.join(","), ...rows.map((r) => r.join(","))].join("\n");
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        saveAs(blob, `appointments_${format(new Date(), "yyyyMMdd_HHmm")}.csv`);
    };

    const jumpToDate = (isoDate) => {
        if (!isoDate) return;
        const d = parse(isoDate, "yyyy-MM-dd", new Date());
        if (!isNaN(d)) {
            setCurrentDate(d);
        }
    };

    // small utility: human readable appointment time + doctor/category safe display
    const renderCellSummary = (a) => {
        return (
            <div>
                <div style={{ fontWeight: 700 }}>{a.user?.name || "Unknown patient"}</div>
                <div style={{ fontSize: 13, color: "#333" }}>
                    {a._rawTime} • Dr. {a.doctor?.name || "—"} • {a.category?.name || "—"}
                </div>
            </div>
        );
    };

    if (loading) return <p style={{ padding: 20 }}>Loading appointments...</p>;

    return (
        <div style={{ display: "flex", minHeight: "100vh", gap: 16 }}>
            {/* Right: list + details */}
            <div style={{ width: 480, padding: 20, borderLeft: "1px solid #eee", background: "#fafafa" }}>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <h3 style={{ margin: 0 }}>Appointments ({filteredAppointments.length})</h3>
                    <div style={{ display: "flex", gap: 8 }}>
                        <input type="date" onChange={(e) => jumpToDate(e.target.value)} style={{ padding: 6 }} />
                    </div>
                </div>

                <div style={{ maxHeight: "84vh", overflowY: "auto", paddingRight: 8 }}>

                    {filteredAppointments.length === 0 && <div style={{ color: "#777" }}>No appointments found.</div>}

                    {filteredAppointments.map((a, idx) => (
                        <div key={a._id} style={{ padding: 12, marginBottom: 10, borderRadius: 8, background: "#fff", boxShadow: "0 4px 10px rgba(0,0,0,0.03)" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                                <div>
                                    <div style={{ fontWeight: 700 }}>{a.user?.name}</div>
                                    <div style={{ fontSize: 13, color: "#555" }}>{a._rawDate} • {a._rawTime}</div>
                                    <div style={{ fontSize: 13, color: "#555", marginTop: 6 }}>Dr. {a.doctor?.name || "—"} • {a.category?.name || "—"}</div>
                                </div>

                                <div style={{ textAlign: "right" }}>
                                    <div style={{ marginBottom: 20 }}>
                                        <span style={{
                                            fontWeight: "bold", padding: "4px 6px", borderRadius: 8, color: "#fff", background:
                                                a.status === "PENDING" ? "#FFB347" :
                                                    a.status === "DOCTOR_ACCEPTED" ? "#4CAF50" :
                                                        a.status === "NURSE_ASSIGNED" ? "#2196F3" :
                                                            a.status === "NURSE_COMPLETED" ? "#FF9800" :
                                                                a.status === "DOCTOR_COMPLETED" ? "#673AB7" :
                                                                    a.status === "REJECTED" ? "#F44336" : "#777"
                                        }}>{a.status}</span>
                                    </div>

                                    <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                                        <button onClick={() => setSelectedEvent(a)} style={smallBtnStyle}>Details</button>
                                        <button onClick={() => { setCurrentDate(parse(a._rawDate, "yyyy-MM-dd", new Date())); setView(Views.DAY); }} style={smallOutlineBtnStyle}>Go to day</button>
                                    </div>
                                </div>
                            </div>

                            {a.description && <div style={{ marginTop: 8, color: "#444" }}>{a.description}</div>}
                        </div>
                    ))}
                </div>
            </div>
            {/* Left: Filters + Calendar */}
            <div style={{ flex: 1, padding: 20 }}>
                <div style={filterBarStyle}>
                    <input
                        placeholder="Search patient, doctor, category, date..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={searchInputStyle}
                    />

                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={selectStyle}>
                        <option value="">All statuses</option>
                        <option value="PENDING">PENDING</option>
                        <option value="DOCTOR_ACCEPTED">DOCTOR_ACCEPTED</option>
                        <option value="NURSE_ASSIGNED">NURSE_ASSIGNED</option>
                        <option value="NURSE_COMPLETED">NURSE_COMPLETED</option>
                        <option value="DOCTOR_COMPLETED">DOCTOR_COMPLETED</option>
                        <option value="REJECTED">REJECTED</option>
                    </select>

                    <select value={doctorFilter} onChange={(e) => setDoctorFilter(e.target.value)} style={selectStyle}>
                        <option value="">All doctors</option>
                        {doctors.map((d) => (
                            <option key={d._id} value={d._id}>
                                {d.name}
                            </option>
                        ))}
                    </select>

                    <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} style={selectStyle}>
                        <option value="">All categories</option>
                        {categories.map((c) => (
                            <option key={c._id} value={c._id}>
                                {c.name}
                            </option>
                        ))}
                    </select>

                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={selectStyle}>
                        <option value="dateAsc">Sort: Date ↑</option>
                        <option value="dateDesc">Sort: Date ↓</option>
                        <option value="doctor">Sort: Doctor</option>
                        <option value="category">Sort: Category</option>
                    </select>

                    <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} style={dateInputStyle} />
                    <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} style={dateInputStyle} />

                    <button onClick={() => { setDateFrom(""); setDateTo(""); setSearchTerm(""); setStatusFilter(""); setDoctorFilter(""); setCategoryFilter(""); setSortBy("dateAsc"); }} style={resetBtnStyle}>
                        Reset
                    </button>

                    <button onClick={handleExportCSV} style={exportBtnStyle}>Export CSV</button>
                </div>

                <div style={{ marginTop: 12 }}>
                    <Calendar
                        localizer={localizer}
                        events={filteredEvents}
                        startAccessor="start"
                        endAccessor="end"
                        style={{ height: "70vh", borderRadius: 8, boxShadow: "0 6px 18px rgba(0,0,0,0.08)" }}
                        onSelectEvent={handleSelectEvent}
                        onDoubleClickEvent={handleDoubleClickEvent}
                        view={view}
                        onView={(v) => setView(v)}
                        date={currentDate}
                        onNavigate={(d) => setCurrentDate(d)}
                        selectable
                        popup
                        eventPropGetter={(event) => {
                            // color by status
                            const st = event.original?.status;
                            const color =
                                st === "PENDING"
                                    ? "#FFB347"
                                    : st === "DOCTOR_ACCEPTED"
                                        ? "#4CAF50"
                                        : st === "NURSE_ASSIGNED"
                                            ? "#2196F3"
                                            : st === "NURSE_COMPLETED"
                                                ? "#FF9800"
                                                : st === "DOCTOR_COMPLETED"
                                                    ? "#673AB7"
                                                    : st === "REJECTED"
                                                        ? "#F44336"
                                                        : "#607D8B";
                            return { style: { backgroundColor: color, color: "#fff", borderRadius: 6, padding: "2px 6px", border: "none" } };
                        }}
                        components={{
                            event: ({ event }) => {
                                const ap = event.original || event;
                                return (
                                    <div style={{ fontSize: 12, lineHeight: "1.1" }}>
                                        <div style={{ fontWeight: 700 }}>{ap.user?.name}</div>
                                        <div style={{ fontSize: 11 }}>{ap._rawTime} — Dr. {ap.doctor?.name || "—"}</div>
                                    </div>
                                );
                            },
                        }}
                    />
                </div>
            </div>
            <div style={{ marginTop: 12 }}>
                <button onClick={() => { setAppointments([]); localStorage.removeItem("token"); navigate("/login"); }} style={{ ...exportBtnStyle, background: "#e74c3c", marginTop: 8 }}>
                    Logout
                </button>
            </div>


            {/* Details drawer/modal (simple) */}
            {selectedEvent && (
                <div style={modalOverlayStyle} onClick={() => setSelectedEvent(null)}>
                    <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <h3 style={{ margin: 0 }}>Appointment Details</h3>
                            <button onClick={() => setSelectedEvent(null)} style={smallOutlineBtnStyle}>Close</button>
                        </div>

                        <div style={{ marginTop: 12 }}>
                            <div style={{ fontWeight: 700 }}>{selectedEvent.user?.name || selectedEvent.user?.name}</div>
                            <div style={{ color: "#555" }}>{selectedEvent._rawDate} • {selectedEvent._rawTime}</div>
                            <div style={{ marginTop: 8 }}>Doctor: <b>{selectedEvent.doctor?.name || selectedEvent.doctor?.name}</b></div>
                            <div>Category: <b>{selectedEvent.category?.name || (selectedEvent.category && selectedEvent.category.name) || "—"}</b></div>
                            <div style={{ marginTop: 8 }}><b>Status:</b> {selectedEvent.status}</div>

                            {selectedEvent.prescription && selectedEvent.prescription.length > 0 && (
                                <div style={{ marginTop: 12 }}>
                                    <strong>Prescriptions</strong>
                                    {selectedEvent.prescription.map((p, i) => (
                                        <div key={i} style={{ padding: 8, background: "#fff", borderRadius: 6, marginTop: 6 }}>
                                            <div style={{ fontWeight: 700 }}>{p.medicineName} — {p.dosage}</div>
                                            <div style={{ fontSize: 13 }}>{p.duration}</div>
                                            {p.notes && <div style={{ marginTop: 6 }}>{p.notes}</div>}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {selectedEvent.description && (
                                <div style={{ marginTop: 12 }}>
                                    <strong>Notes</strong>
                                    <div style={{ marginTop: 6 }}>{selectedEvent.description}</div>
                                </div>
                            )}
                        </div>

                        {/* small actions area (receptionist has read-only by default) */}
                        <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                            <button style={smallOutlineBtnStyle} onClick={() => {
                                // quick copy link / or open patient profile - placeholder
                                alert("Open patient profile (implement link).");
                            }}>Open Patient</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

/* ---------------- Styles ---------------- */

const filterBarStyle = {
    display: "flex",
    gap: 10,
    alignItems: "center",
    flexWrap: "wrap",
    background: "#fff",
    padding: 12,
    borderRadius: 8,
    boxShadow: "0 6px 18px rgba(0,0,0,0.04)",
};

const searchInputStyle = {
    minWidth: 240,
    padding: "8px 10px",
    borderRadius: 8,
    border: "1px solid #ddd",
};

const selectStyle = {
    padding: "8px 10px",
    borderRadius: 8,
    border: "1px solid #ddd",
    background: "#fff",
};

const dateInputStyle = {
    padding: "8px 10px",
    borderRadius: 8,
    border: "1px solid #ddd",
};

const exportBtnStyle = {
    background: "#1976d2",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "8px 12px",
    cursor: "pointer",
};

const resetBtnStyle = {
    background: "#f0f0f0",
    color: "#333",
    border: "none",
    borderRadius: 8,
    padding: "8px 10px",
    cursor: "pointer",
};

const smallBtnStyle = {
    padding: "6px 10px",
    borderRadius: 6,
    background: "#1976d2",
    color: "#fff",
    border: "none",
    cursor: "pointer",
};

const smallOutlineBtnStyle = {
    padding: "6px 10px",
    borderRadius: 6,
    background: "transparent",
    color: "#1976d2",
    border: "1px solid #1976d2",
    cursor: "pointer",
};

const modalOverlayStyle = {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.35)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
};

const modalStyle = {
    width: 680,
    maxWidth: "95%",
    background: "#fff",
    borderRadius: 10,
    padding: 18,
    boxShadow: "0 12px 40px rgba(0,0,0,0.2)",
};

