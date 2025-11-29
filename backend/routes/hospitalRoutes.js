const express = require("express");
const router = express.Router();
const hospital = require("../controllers/hospitalController");
const { requireAuth } = require("../middleware/authMiddleware");
const Hospital = require("../models/Hospital");
const upload = require('../middleware/upload');

// ✔️ Hospital admin creates users (with profile picture upload)
router.post("/create-user", upload.single("profilePic"), hospital.createHospital);

router.get("/list", async (req, res) => {
  try {
    const hospitals = await Hospital.find({ isHospital: true })
      .select("hospitalName tenantId");
    res.json(hospitals);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// Approve or reject hospital
router.put("/approve/:hospitalId", requireAuth, hospital.approveHospital);
router.put("/reject/:hospitalId", requireAuth, hospital.rejectHospital);

module.exports = router;
