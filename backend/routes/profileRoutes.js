const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/authMiddleware");
const User = require("../models/User");
const profileController = require('../controllers/profileController')

// GET profile (already exists)
router.get("/", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password -otp");
    res.json({ user });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

router.post("/send-otp", requireAuth, profileController.sendOtp);

// Verify OTP
router.post("/verify-otp", requireAuth, profileController.verifyOtp);

router.post("/update-pic",requireAuth, profileController.updateProfilePic);

module.exports = router;
