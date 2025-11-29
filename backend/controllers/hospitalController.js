const bcrypt = require("bcryptjs");
const Hospital = require("../models/Hospital");
const sgMail = require("@sendgrid/mail");
const cloudinary = require("../config/cloudinary");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Password policy
const validatePasswordPolicy = (password) => {
  const regex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return regex.test(password);
};

// ---------------------------------------------------------
// CREATE HOSPITAL (REGISTER AS HOSPITAL ADMIN)
// ---------------------------------------------------------
exports.createHospital = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      hospitalName,
      address,
      phone,
      email,
      licenseNumber,
      password,
      location
    } = req.body;

    // Validate fields
    if (
      !firstName ||
      !lastName ||
      !address ||
      !hospitalName ||
      !phone ||
      !email ||
      !licenseNumber ||
      !password
    ) {
      return res.status(400).json({ msg: "All fields are required" });
    }

    // Password validation
    if (!validatePasswordPolicy(password)) {
      return res.status(400).json({
        msg: "Password must contain 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 symbol",
      });
    }

    // Duplicate check
    const existingEmail = await Hospital.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ msg: "Email already exists" });
    }

    const existingLicense = await Hospital.findOne({ licenseNumber });
    if (existingLicense) {
      return res.status(400).json({ msg: "License number already exists" });
    }

    // ⭐ CLOUDINARY UPLOAD
    let profilePicUrl = null;

    if (req.file) {
      const uploadResult = await cloudinary.uploader.upload(req.file.path, {
        folder: "hospital_management",
      });
      profilePicUrl = uploadResult.secure_url;
    }

    // Generate metadata
    const tenantId = "tenant-" + Math.floor(Math.random() * 100000);
    const name = `${firstName} ${lastName}`;

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Parse location if exists
    let parsedLocation = null;
    if (location) {
      parsedLocation = JSON.parse(location);
    }


    // Save hospital
    const newHospital = new Hospital({
      tenantId,
      firstName,
      lastName,
      name,
      hospitalName,
      address,
      phone,
      email,
      licenseNumber,
      password: hashedPassword,
      passwordHistory: [hashedPassword],
      role: "admin",
      isHospital: false,   // Wait for superadmin approval
      status: "PENDING",
      profilePic: profilePicUrl,
      location: parsedLocation
    });

    await newHospital.save();

    return res.status(201).json({
      msg: "Hospital registration submitted. Awaiting approval.",
      hospitalId: newHospital._id,
      tenantId: newHospital.tenantId,
      profilePic: profilePicUrl
    });

  } catch (err) {
    console.error("Hospital create error:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

// ---------------------------------------------------------
// SUPERADMIN APPROVES HOSPITAL
// ---------------------------------------------------------
exports.approveHospital = async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.hospitalId);

    if (!hospital)
      return res.status(404).json({ msg: "Hospital not found" });

    hospital.isHospital = true;     // Now hospital can login
    hospital.status = "VERIFIED";

    await hospital.save();

    return res.json({ msg: "Hospital approved successfully" });

  } catch (err) {
    console.error("Approve hospital error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// ---------------------------------------------------------
// SUPERADMIN REJECTS HOSPITAL
// ---------------------------------------------------------
exports.rejectHospital = async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.hospitalId);

    if (!hospital)
      return res.status(404).json({ msg: "Hospital not found" });

    hospital.isHospital = false;
    hospital.status = "INACTIVE";

    await hospital.save();

    return res.json({ msg: "Hospital rejected successfully" });

  } catch (err) {
    console.error("Reject hospital error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};
