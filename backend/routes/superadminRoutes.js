const express = require("express");
const router = express.Router();

const {
  getAllHospitals,
  updateHospital,
  deleteHospital
} = require("../controllers/superadminController");

const { requireAuth } = require("../middleware/authMiddleware");
const { getAllUsersSuperAdmin, getAllDoctorsSuperAdmin } = require("../controllers/adminController");



// ---------------- HOSPITAL ROUTES ----------------
router.get("/hospitals", requireAuth, getAllHospitals);
router.put("/hospitals/:id", requireAuth, updateHospital);
router.delete("/hospitals/:id", requireAuth, deleteHospital);

router.get("/users", requireAuth, getAllUsersSuperAdmin);
router.get("/doctors", requireAuth, getAllDoctorsSuperAdmin);
module.exports = router;
