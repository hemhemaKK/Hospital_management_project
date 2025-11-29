const express = require("express");
const { requireAuth } = require("../middleware/authMiddleware");
const {
  getCategories,
  getDoctorsByCategory,
  createAppointment,
  getAvailableSlots,
  getUserAppointments,
  deleteAppointment
} = require("../controllers/appointmentController");

const router = express.Router();

// Categories (Support-style)
router.get("/categories", requireAuth, getCategories);

// Doctors by category
router.get("/doctors/:categoryId", requireAuth, getDoctorsByCategory);

// Create appointment
router.post("/create", requireAuth, createAppointment);

// Available slots
router.get("/slots/:doctorId/:date", requireAuth, getAvailableSlots);

// User appointments
router.get("/user/:userId", requireAuth, getUserAppointments);

// Delete appointment
router.delete("/:userId/:appointmentId", requireAuth, deleteAppointment);

module.exports = router;
