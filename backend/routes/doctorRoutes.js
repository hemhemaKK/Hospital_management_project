const express = require("express");
const { requireAuth } = require("../middleware/authMiddleware");

const {
  getCategories,
  chooseCategory,
  getDashboard,
  getNurse,
  approveNurse,
  disapproveNurse,
  rejectNurse
} = require("../controllers/doctorController");

const router = express.Router();

// Category system
router.get("/categories", requireAuth, getCategories);
router.put("/choose-category", requireAuth, chooseCategory);

// Dashboard
router.get("/dashboard", requireAuth, getDashboard);

// Nurses
router.get("/nurse", requireAuth, getNurse);
router.put("/nurse/approve/:id", requireAuth, approveNurse);
router.put("/nurse/disapprove/:id", requireAuth, disapproveNurse);
router.delete("/nurse/reject/:id", requireAuth, rejectNurse);


module.exports = router;
