const axios = require("axios");
const User = require("../models/User");
const cloudinary = require("../config/cloudinary"); // Cloudinary config
const multer = require("multer");

// 2Factor API Key
const API_KEY = "40c3ca09-80eb-11f0-a562-0200cd936042";

// Store session_id temporarily for OTP verification
let otpSessionStore = {};

// ------------------- SEND OTP -------------------
exports.sendOtp = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ msg: "Phone is required" });

    const url = `https://2factor.in/API/V1/${API_KEY}/SMS/+91${phone}/AUTOGEN`;
    const response = await axios.get(url);

    otpSessionStore[phone] = response.data.Details; // store session_id
    res.json({ msg: "OTP sent via SMS", sessionId: otpSessionStore[phone] });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ msg: "Failed to send OTP" });
  }
};

// ------------------- VERIFY OTP -------------------
exports.verifyOtp = async (req, res) => {
  try {
    const { phone, enteredOtp } = req.body;
    const sessionId = otpSessionStore[phone];

    if (!sessionId)
      return res.status(400).json({ msg: "No OTP request found for this number" });

    const url = `https://2factor.in/API/V1/${API_KEY}/SMS/VERIFY/${sessionId}/${enteredOtp}`;
    const response = await axios.get(url);

    if (response.data.Status === "Success") {
      const user = await User.findById(req.user.id);
      user.phone = phone;
      user.isPhoneVerified = true;
      await user.save();

      delete otpSessionStore[phone];
      return res.json({ msg: "Phone verified successfully" });
    }

    return res.status(400).json({ msg: "Invalid OTP" });
  } catch (err) {
    console.error(err.response?.data || err.message);
    return res.status(500).json({ msg: "OTP verification failed" });
  }
};

// ------------------- UPDATE PROFILE PICTURE -------------------
exports.updateProfilePic = async (req, res) => {
  try {
    const { imageUrl } = req.body;
    if (!imageUrl) return res.status(400).json({ msg: "Image URL is required" });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    user.profilePic = imageUrl;
    await user.save();

    // Return updated user object
    res.json({
      _id: user._id,
      email: user.email,
      phone: user.phone,
      isPhoneVerified: user.isPhoneVerified,
      profilePic: user.profilePic,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Failed to update profile picture" });
  }
};

