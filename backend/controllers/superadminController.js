const User = require("../models/User");
const Hospital = require("../models/Hospital");

// Permission check
const isSuperAdmin = (role) => role === "superadmin";


// ------------------------------------------------------
// 1. GET ALL HOSPITALS + USERS UNDER EACH
// ------------------------------------------------------
exports.getAllHospitals = async (req, res) => {
  try {
    if (!isSuperAdmin(req.user.role)) {
      return res.status(403).json({ msg: "Only superadmin allowed" });
    }

    // Fetch all hospitals
    const hospitals = await Hospital.find().select("-__v").lean();

    // For each hospital → fetch users belonging to it
    for (let h of hospitals) {
      h.users = await User.find({ hospitalId: h._id })
        .select("firstName lastName email role")
        .lean();
    }

    return res.json({ hospitals });
  } catch (err) {
    console.error("Error fetching hospitals:", err);
    res.status(500).json({ msg: err.message });
  }
};



// ------------------------------------------------------
// 2. UPDATE HOSPITAL (Only name can be changed)
// ------------------------------------------------------
exports.updateHospital = async (req, res) => {
  try {
    if (!isSuperAdmin(req.user.role)) {
      return res.status(403).json({ msg: "Only superadmin allowed" });
    }

    const { id } = req.params;
    const { name } = req.body;

    const hospital = await Hospital.findById(id);
    if (!hospital) {
      return res.status(404).json({ msg: "Hospital not found" });
    }

    if (!name) {
      return res
        .status(400)
        .json({ msg: "Only hospital name can be updated" });
    }

    // Prevent duplicate hospital names
    const nameTaken = await Hospital.findOne({
      name,
      _id: { $ne: id },
    });

    if (nameTaken) {
      return res.status(400).json({ msg: "Hospital name already exists" });
    }

    hospital.name = name;
    await hospital.save();

    return res.json({
      msg: "Hospital name updated successfully",
      hospital,
    });

  } catch (err) {
    console.error("Error updating hospital:", err);
    res.status(500).json({ msg: err.message });
  }
};



// ------------------------------------------------------
// 3. DELETE HOSPITAL (Only if no users exist)
// ------------------------------------------------------
exports.deleteHospital = async (req, res) => {
  try {
    if (!isSuperAdmin(req.user.role)) {
      return res.status(403).json({ msg: "Only superadmin allowed" });
    }

    const { id } = req.params;

    const hospital = await Hospital.findById(id);
    if (!hospital) {
      return res.status(404).json({ msg: "Hospital not found" });
    }

    // Check if users belong to this hospital
    const usersExist = await User.find({ hospitalId: id }).countDocuments();

    if (usersExist > 0) {
      return res.status(400).json({
        msg: "Cannot delete hospital while users exist under it",
      });
    }

    await Hospital.findByIdAndDelete(id);

    return res.json({ msg: "Hospital deleted successfully" });

  } catch (err) {
    console.error("Error deleting hospital:", err);
    res.status(500).json({ msg: err.message });
  }
};
