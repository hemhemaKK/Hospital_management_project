const express = require("express");
const { createComplaint, getUserComplaints, assignComplaint, getComplaintsForEmployee, markComplaintSolved } = require("../controllers/complaintController");
const { requireAuth } = require("../middleware/authMiddleware");
const router = express.Router();

// POST – Create a new complaint
router.post("/create", requireAuth, createComplaint);

// GET – Fetch complaints of logged-in user
router.get("/complaints", requireAuth, getUserComplaints);
router.get("/employee-category-complaints", requireAuth, getComplaintsForEmployee);

router.put("/assign", requireAuth, assignComplaint);

router.patch("/:complaintId/resolve", requireAuth, markComplaintSolved);

module.exports = router;
