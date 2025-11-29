const express = require("express");
const router = express.Router();
const hospital = require("../controllers/hospitalController");
const {requireAuth} = require("../middleware/authMiddleware");
const Hospital = require("../models/Hospital");

// Hospital admin creates users
router.post( "/create-user", hospital.createHospital);

router.get("/list", async (req, res) => {
  try {
    const hospitals = await Hospital.find({ isHospital: true }).select("hospitalName tenantId");
    res.json(hospitals);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});
// Approve or reject hospital
router.put("/approve/:hospitalId", requireAuth, hospital.approveHospital);
router.put("/reject/:hospitalId", requireAuth, hospital.rejectHospital);

module.exports = router;
