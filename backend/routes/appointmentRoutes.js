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

router.get("/categories", requireAuth, getCategories);
router.get("/doctors/:categoryId", requireAuth, getDoctorsByCategory);
router.post("/create", requireAuth, createAppointment);
router.get("/slots/:doctorId/:date", requireAuth, getAvailableSlots);
router.get("/user/:userId", requireAuth, getUserAppointments);
router.delete("/:userId/:appointmentId", requireAuth, deleteAppointment);

module.exports = router;
