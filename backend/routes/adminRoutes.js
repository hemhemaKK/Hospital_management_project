const express = require("express");
const { requireAuth } = require("../middleware/authMiddleware");
const {
  getAllUsers,
  getAllTickets,
  createCategory,
  getAllCategories,
  getAllEmployees,
  deleteUser,
  deleteCategory,
  updateCategory,
  getPendingEmployees,
  approveEmployee,
  rejectEmployee,
  toggleEmployeeApproval
} = require("../controllers/adminController");

const router = express.Router();

// User management
router.get("/users", requireAuth, getAllUsers);
router.delete("/users/:id", requireAuth, deleteUser);

// Employee management
router.get("/employees", requireAuth, getAllEmployees);
router.get("/employees/pending", requireAuth, getPendingEmployees);
router.put("/employees/approve/:id", requireAuth, approveEmployee);
router.delete("/employees/reject/:id", requireAuth, rejectEmployee);
router.put("/employees/toggle/:id", requireAuth, toggleEmployeeApproval);

// Category management
router.post("/category", requireAuth, createCategory);
router.get("/category", requireAuth, getAllCategories);
router.put("/category/:id", requireAuth, updateCategory);
router.delete("/category/:id", requireAuth, deleteCategory);

// Tickets and contacts
router.get("/tickets", requireAuth, getAllTickets);

module.exports = router;
