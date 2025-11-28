const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sgMail = require("@sendgrid/mail");
const User = require("../models/User");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// helper: generate JWT
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
};

// helper: send OTP email via SendGrid
const sendOTP = async (email, otp) => {
  try {
    const msg = {
      to: email,
      from: process.env.EMAIL_FROM,
      subject: "Verify your Email - OTP",
      html: `<p>Your OTP is: <strong>${otp}</strong></p>`,
    };
    await sgMail.send(msg);
    console.log("OTP sent to:", email);
  } catch (err) {
    console.error("SendGrid error:", err.response?.body || err.message);
    throw new Error("Failed to send OTP");
  }
};

// ------------------ REGISTER ------------------
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    // Determine role based on email prefix
    let role = "user";
    const emailLower = email.toLowerCase();

    if (emailLower.startsWith("admin")) role = "admin";
    else if (emailLower.startsWith("emp")) role = "employee";
    else if (emailLower.startsWith("sub")) role = "subemployee";

    // Generate OTP for all users
    const otp = Math.floor(100000 + Math.random() * 900000);

    user = new User({
      name,
      email,
      password: hashedPassword,
      otp,
      isVerified: false, // everyone must verify
      role,
    });

    await user.save();

    // Send OTP via email
    await sendOTP(email, otp);

    res.status(201).json({
      msg: "OTP sent to email. Please verify to complete registration.",
      role,
    });
  } catch (err) {
    console.error("Error in register:", err.message);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

// ------------------ VERIFY OTP ------------------
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "User not found" });

    // OTP must match for all users
    if (user.otp !== parseInt(otp)) {
      return res.status(400).json({ msg: "Invalid OTP" });
    }

    user.isVerified = true;
    user.otp = null;
    await user.save();

    const token = generateToken(user);

    res.json({
      msg: "Email verified successfully",
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error("Error in verifyOtp:", err.message);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

// ------------------ LOGIN ------------------
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    if (!user.isVerified) {
      return res.status(400).json({ msg: "Email not verified" });
    }

    const token = generateToken(user);

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error("Error in login:", err.message);
    res.status(500).json({ msg: "Server error" });
  }
};
