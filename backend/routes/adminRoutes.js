const express = require("express");
const {
  getAllUsers,
  getAllDoctors,
  getPendingDoctors,
  approveDoctors,
  rejectDoctor,
  deleteUser,
  getAllTickets,
  createCategory,
  getAllCategories,
  replyToTicket,
  updateCategory,
  deleteCategory
} = require("../controllers/adminController");
const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();

// router.get("/me", requireAuth, (req, res) => {
//   res.json({
//     id: req.user._id,
//     email: req.user.email,
//     name: req.user.name,
//     role: req.user.role,
//     tenantId: req.user.tenantId
//   });
// });

// User Management
router.get("/users", requireAuth, getAllUsers);
router.delete("/users/:id", requireAuth, deleteUser);

// Doctor Management
router.get("/doctors", requireAuth, getAllDoctors);
router.get("/doctors/pending", requireAuth, getPendingDoctors);
router.put("/doctors/approve/:id", requireAuth, approveDoctors);
router.delete("/doctors/reject/:id", requireAuth, rejectDoctor);

// Tickets
router.get("/tickets", requireAuth, getAllTickets);
// Ticket Reply
router.put("/tickets/reply", requireAuth, replyToTicket);

// Categories
router.post("/category", requireAuth, createCategory);
router.get("/category", requireAuth, getAllCategories);
router.put("/category/:id", requireAuth, updateCategory);
router.delete("/category/:id", requireAuth, deleteCategory);

module.exports = router;
