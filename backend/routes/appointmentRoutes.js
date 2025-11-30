const express = require("express");
const { requireAuth } = require("../middleware/authMiddleware");

const {
  getCategories,
  getDoctorsByCategory,
  createAppointment,
  getAvailableSlots,
  getUserAppointments,
  deleteAppointment,
  getDoctorAppointments,
  updateAppointmentStatus,
  getReceptionistAppointments,
  getNurseAppointments
} = require("../controllers/appointmentController");

const router = express.Router();

// CATEGORY & DOCTOR LIST
router.get("/categories", requireAuth, getCategories);
router.get("/doctors/:categoryId", requireAuth, getDoctorsByCategory);

// CREATE APPOINTMENT
router.post("/create", requireAuth, createAppointment);

router.get("/receptionist/all", requireAuth, getReceptionistAppointments);
router.get("/nurse/appointments", requireAuth, getNurseAppointments);

// DOCTOR SIDE APPOINTMENTS
router.get("/appointments", requireAuth, getDoctorAppointments);
router.put("/appointment/:appointmentId", requireAuth, updateAppointmentStatus);

// USER SIDE APPOINTMENTS
router.get("/user/:userId", requireAuth, getUserAppointments);
router.delete("/:userId/:appointmentId", requireAuth, deleteAppointment);

// AVAILABLE SLOTS
router.get("/slots/:doctorId/:date", requireAuth, getAvailableSlots);

module.exports = router;
