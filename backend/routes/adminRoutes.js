const express = require("express");
const { requireAuth } = require("../middleware/authMiddleware");
const {
  getAllUsers,
  getAllTickets,
  createCategory,
  getAllCategories,
  getAllDoctors,
  deleteUser,
  deleteCategory,
  updateCategory,
  getPendingDoctors,
  approveDoctors,
  rejectDoctor,
  toggleDoctorApproval
} = require("../controllers/adminController");

const router = express.Router();

// User management
router.get("/users", requireAuth, getAllUsers);
router.delete("/users/:id", requireAuth, deleteUser);

// Doctor management
router.get("/doctors", requireAuth, getAllDoctors);
router.get("/doctors/pending", requireAuth, getPendingDoctors);
router.put("/doctors/approve/:id", requireAuth, approveDoctors);
router.delete("/doctors/reject/:id", requireAuth, rejectDoctor);
router.put("/doctors/toggle/:id", requireAuth, toggleDoctorApproval);

// Category management
router.post("/category", requireAuth, createCategory);
router.get("/category", requireAuth, getAllCategories);
router.put("/category/:id", requireAuth, updateCategory);
router.delete("/category/:id", requireAuth, deleteCategory);

// Tickets and contacts
router.get("/tickets", requireAuth, getAllTickets);

module.exports = router;
