const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/authMiddleware");
const User = require("../models/User");
const profileController = require('../controllers/profileController')

// GET profile (already exists)
router.get("/", requireAuth, async (req, res) => {
  try {
    console.log(req.user.id)
    const user = await User.findById(req.user._id).select("-password -otp");
    res.json({ user });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

router.post("/send-otp", requireAuth, profileController.sendOtp);

// Verify OTP
router.post("/verify-otp", requireAuth, profileController.verifyOtp);

router.post("/update-pic", requireAuth, profileController.updateProfilePic);

// ✅ ADDED: Update profile information route
router.put("/update", requireAuth, async (req, res) => {
  try {
    const { dateOfBirth, gender, bloodGroup, height, weight } = req.body;
    
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    // Update the fields
    if (dateOfBirth) user.dateOfBirth = dateOfBirth;
    if (gender) user.gender = gender;
    if (bloodGroup) user.bloodGroup = bloodGroup;
    if (height) user.height = height;
    if (weight) user.weight = weight;

    await user.save();

    res.json({ 
      msg: "Profile updated successfully",
      user: {
        _id: user._id,
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,
        bloodGroup: user.bloodGroup,
        height: user.height,
        weight: user.weight
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

module.exports = router;