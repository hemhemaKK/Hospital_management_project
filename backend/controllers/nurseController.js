const User = require("../models/User");
const Hospital = require("../models/Hospital");

/* ---------------------------------------------------
   1. Nurse Dashboard
--------------------------------------------------- */
exports.nurseDashboard = async (req, res) => {
  try {
    const nurse = await User.findById(req.user._id);

    if (!nurse) return res.status(404).json({ message: "Nurse not found" });

    res.status(200).json({ user: nurse });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ---------------------------------------------------
   2. Get All Categories (from all hospitals)
--------------------------------------------------- */
exports.getNurseCategories = async (req, res) => {
  try {
    const hospitals = await Hospital.find().select("categories name");

    const allCategories = [];

    hospitals.forEach((h) => {
      h.categories.forEach((c) => {
        allCategories.push({
          _id: c._id,
          name: c.name,
          description: c.description,
          hospitalName: h.name,
        });
      });
    });

    res.status(200).json(allCategories);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ---------------------------------------------------
   3. Nurse Choose Category
--------------------------------------------------- */
exports.chooseNurseCategory = async (req, res) => {
  try {
    const { categoryId } = req.body;

    const hospital = await Hospital.findOne({ "categories._id": categoryId });

    if (!hospital)
      return res.status(404).json({ message: "Category not found" });

    const nurse = await User.findById(req.user._id);

    nurse.selectedCategory = categoryId;
    nurse.selectedHospital = hospital._id;
    nurse.isVerified = false; // waiting for doctor approval

    await nurse.save();

    res.status(200).json({
      message: "Category selected. Wait for doctor approval.",
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ---------------------------------------------------
   4. Get Assigned Doctor
--------------------------------------------------- */
exports.getAssignedDoctor = async (req, res) => {
  try {
    const nurse = await User.findById(req.user._id);

    if (!nurse.selectedCategory)
      return res.status(400).json({ message: "Category not selected" });

    const doctor = await User.findOne({
      role: "doctor",
      selectedCategory: nurse.selectedCategory,
      isVerified: true,
    });

    if (!doctor)
      return res.status(404).json({ message: "Doctor not assigned yet" });

    res.status(200).json(doctor);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
