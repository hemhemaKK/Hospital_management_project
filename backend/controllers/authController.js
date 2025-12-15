const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sgMail = require("@sendgrid/mail");
const User = require("../models/User");
const Hospital = require("../models/Hospital")

// ⭐ ADDED for Google OAuth2
const { OAuth2Client } = require("google-auth-library");

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
    const { firstName, lastName, email, password, selectedHospital } = req.body;

    let existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ msg: "Email already registered" });

    const fullName = `${firstName} ${lastName}`;
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000);

    // Determine role from email prefix
    let role = "user";
    const lower = email.toLowerCase();

    if (lower.startsWith("superadmin")) role = "superadmin";
    else if (lower.startsWith("doctor")) role = "doctor";
    else if (lower.startsWith("nurse")) role = "nurse";
    else if (lower.startsWith("recep")) role = "receptionist";
    else if (lower.startsWith("pharma")) role = "pharmacist";

    // Create base user object
    const newUser = new User({
      firstName,
      lastName,
      name: fullName,
      email,
      password: hashedPassword,
      otp,
      role,
      isVerified: false
    });

    // ⭐ If user selected a hospital → fetch tenantId & save
    if (selectedHospital) {
      const hospitalData = await Hospital.findById(selectedHospital);

      if (!hospitalData)
        return res.status(400).json({ msg: "Invalid hospital selected" });

      newUser.selectedHospital = hospitalData._id;
      newUser.selectedHospitalTenantId = hospitalData.tenantId;
    }

    await newUser.save();
    await sendOTP(email, otp);

    res.status(201).json({ msg: "OTP sent to email", role });
  } catch (err) {
    console.error("Register error:", err.message);
    res.status(500).json({ msg: "Server error" });
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

    // hospital moves to VERIFIED after email verification
    if (user.isHospital) {
      user.hospitalStatus = "VERIFIED";
    }

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


// ------------------ LOGIN (USER + HOSPITAL) ------------------
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // -------------------------------
    // 1️⃣ TRY LOGIN AS NORMAL USER
    // -------------------------------
    let user = await User.findOne({ email });

    if (user) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch)
        return res.status(400).json({ msg: "Invalid credentials" });

      if (!user.isVerified)
        return res.status(400).json({ msg: "Email not verified" });

      const token = jwt.sign(
        { id: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      return res.json({
        msg: "Login successful",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    }

    // -------------------------------
    // 2️⃣ TRY LOGIN AS HOSPITAL ADMIN
    // -------------------------------
    const hospital = await Hospital.findOne({ email });

    if (hospital) {
      console.log("email found")
      const isMatch = await bcrypt.compare(password, hospital.password);
      if (!isMatch)
        return res.status(400).json({ msg: "Invalid credentials" });
      console.log("is match pasword")
      const token = jwt.sign(
        { id: hospital._id, email: hospital.email, role: "admin" },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      return res.json({
        msg: "Hospital Admin login successful",
        token,
        user: {
          id: hospital._id,
          name: hospital.name,
          email: hospital.email,
          role: hospital.role,
          tenantId: hospital.tenantId
        },
      });
    }

    // -------------------------------
    // 3️⃣ NO MATCH → INVALID
    // -------------------------------
    return res.status(400).json({ msg: "Invalid credentials" });

  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// ==================================================
// ⭐⭐ GOOGLE OAUTH2 ADDITIONS START HERE ⭐⭐
// ==================================================

const oauthClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// -------------------------------------
// ⭐ Step 1: Give Google Login URL
// -------------------------------------
exports.getGoogleAuthURL = async (req, res) => {
  const url = oauthClient.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: ["profile", "email"],
  });

  return res.redirect(url);  // 🔥 IMPORTANT
};
// -------------------------------------
// ⭐ Step 2: Google OAuth Callback with redirect
// -------------------------------------
exports.googleCallback = async (req, res) => {
  try {
    const code = req.query.code;
    if (!code) return res.redirect(`${process.env.FRONTEND_URL}/login`);

    const { tokens } = await oauthClient.getToken(code);
    const ticket = await oauthClient.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture, sub } = payload;

    let user = await User.findOne({ email });

    if (!user) {
      // Identify role based on email prefix
      let role = "user";
      const lower = email.toLowerCase();

      if (lower.startsWith("superadmin")) role = "superadmin";
      else if (lower.startsWith("doctor")) role = "doctor";
      else if (lower.startsWith("nurse")) role = "nurse";
      else if (lower.startsWith("recep")) role = "receptionist";
      else if (lower.startsWith("pharma")) role = "pharmacist";

      user = await User.create({
        name,
        email,
        googleId: sub,
        isVerified: true,
        profilePic: picture,
        role,
      });
    }

    const token = generateToken(user);

    const frontendUrl = process.env.FRONTEND_URL || "https://hospital-management-project-rosy.vercel.app";
    return res.redirect(`${frontendUrl}/google-callback?token=${token}&role=${user.role}`);

  } catch (err) {
    console.error("Google OAuth Error:", err);
    return res.redirect(`${process.env.FRONTEND_URL}/login?error=google_login_failed`);
  }
};

