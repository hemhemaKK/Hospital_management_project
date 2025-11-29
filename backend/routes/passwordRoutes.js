const express = require("express");
const router = express.Router();
const passwordController = require("../controllers/passwordController");

// Request reset
router.post("/forgot-password", passwordController.forgotPassword);

// Reset password
router.post("/reset-password", passwordController.resetPassword);

module.exports = router;
