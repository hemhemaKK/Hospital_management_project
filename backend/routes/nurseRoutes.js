const express = require("express");
const { requireAuth } = require("../middleware/authMiddleware");

const {
  nurseDashboard,
  getNurseCategories,
  chooseNurseCategory,
  getAssignedDoctor
} = require("../controllers/nurseController");

const router = express.Router();

router.get("/dashboard", requireAuth, nurseDashboard);
router.get("/categories", requireAuth, getNurseCategories);
router.put("/choose-category", requireAuth, chooseNurseCategory);
router.get("/my-doctor", requireAuth, getAssignedDoctor);

module.exports = router;
