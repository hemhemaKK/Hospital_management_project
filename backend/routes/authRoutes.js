const express = require("express");
const router = express.Router();
const AuthController = require("../controllers/authController");

// Normal Auth
router.post("/register", AuthController.register);
router.post("/login", AuthController.login);
router.post("/verify-otp", AuthController.verifyOtp);


module.exports = router;
