import User from "../models/User.js";
import Hospital from "../models/Hospital.js";

/* ---------------------------------------------------
   1. GET ALL CATEGORIES FROM ALL HOSPITALS
--------------------------------------------------- */
export const getCategories = async (req, res) => {
  try {
    const hospitals = await Hospital.find().select("categories name");

    const allCategories = [];

    hospitals.forEach(h => {
      h.categories.forEach(c => {
        allCategories.push({
          _id: c._id,
          name: c.name,
          description: c.description,
          hospitalId: h._id,
          hospitalName: h.name
        });
      });
    });

    res.status(200).json(allCategories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ---------------------------------------------------
   2. DOCTOR CHOOSES CATEGORY
--------------------------------------------------- */
export const chooseCategory = async (req, res) => {
  try {
    const { categoryId } = req.body;
    const doctor = await User.findById(req.user._id);

    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    // only doctor allowed
    if (doctor.role !== "doctor") {
      return res.status(403).json({ message: "Only doctors can select a category" });
    }

    // prevent re-select
    if (doctor.selectedCategory) {
      return res.status(400).json({ message: "Category already selected" });
    }

    // check if category exists
    const hospital = await Hospital.findOne({ "categories._id": categoryId });

    if (!hospital)
      return res.status(404).json({ message: "Category not found" });

    doctor.selectedCategory = categoryId;
    doctor.selectedHospital = hospital._id;
    doctor.isVerified = false;
    await doctor.save();

    res.status(200).json({
      message: "Category selected, wait for admin approval.",
      selectedCategory: categoryId,
      hospitalId: hospital._id
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ---------------------------------------------------
   3. DOCTOR DASHBOARD
--------------------------------------------------- */
export const getDashboard = async (req, res) => {
  try {
    const doctor = await User.findById(req.user._id);

    if (!doctor)
      return res.status(404).json({ message: "Doctor not found" });

    let categoryInfo = null;

    if (doctor.selectedCategory) {
      const hospital = await Hospital.findOne(
        { "categories._id": doctor.selectedCategory },
        { "categories.$": 1, name: 1 }
      );

      if (hospital && hospital.categories && hospital.categories[0]) {
        categoryInfo = {
          ...hospital.categories[0]._doc,
          hospitalName: hospital.name
        };
      }
    }

    res.status(200).json({
      user: {
        ...doctor.toObject(),
        selectedCategoryInfo: categoryInfo
      },
      approved: doctor.isVerified
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ---------------------------------------------------
   4. GET NURSES (same hospital + same category)
--------------------------------------------------- */
export const getNurse = async (req, res) => {
  try {
    const doctor = await User.findById(req.user._id);

    if (doctor.role !== "doctor") {
      return res.status(403).json({ message: "Only doctors can view nurses" });
    }

    if (!doctor.selectedCategory || !doctor.selectedHospital)
      return res.status(400).json({ message: "Select a category first" });

    const nurses = await User.find({
      role: "nurse",
      selectedCategory: doctor.selectedCategory,
      selectedHospital: doctor.selectedHospital
    }).select("-password -otp -refreshToken");

    res.status(200).json(nurses);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ---------------------------------------------------
   5. APPROVE NURSE
--------------------------------------------------- */
export const approveNurse = async (req, res) => {
  try {
    const doctor = await User.findById(req.user._id);
    const nurse = await User.findById(req.params.id);

    if (doctor.role !== "doctor") {
      return res.status(403).json({ message: "Only doctors can approve nurses" });
    }

    if (!nurse) return res.status(404).json({ message: "Nurse not found" });

    if (
      String(nurse.selectedCategory) !== String(doctor.selectedCategory) ||
      String(nurse.selectedHospital) !== String(doctor.selectedHospital)
    ) {
      return res.status(403).json({ message: "Different hospital/category" });
    }

    nurse.isVerified = true;
    await nurse.save();

    res.status(200).json({ message: "Nurse approved", nurse });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ---------------------------------------------------
   6. DISAPPROVE NURSE
--------------------------------------------------- */
export const disapproveNurse = async (req, res) => {
  try {
    const doctor = await User.findById(req.user._id);
    const nurse = await User.findById(req.params.id);

    if (doctor.role !== "doctor") {
      return res.status(403).json({ message: "Only doctors can disapprove nurses" });
    }

    if (!nurse) return res.status(404).json({ message: "Nurse not found" });

    if (
      String(nurse.selectedCategory) !== String(doctor.selectedCategory) ||
      String(nurse.selectedHospital) !== String(doctor.selectedHospital)
    ) {
      return res.status(403).json({ message: "Different hospital/category" });
    }

    nurse.isVerified = false;
    await nurse.save();

    res.status(200).json({ message: "Nurse disapproved", nurse });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ---------------------------------------------------
   7. REJECT (DELETE) NURSE
--------------------------------------------------- */
export const rejectNurse = async (req, res) => {
  try {
    const doctor = await User.findById(req.user._id);
    const nurse = await User.findById(req.params.id);

    if (doctor.role !== "doctor") {
      return res.status(403).json({ message: "Only doctors can reject nurses" });
    }

    if (!nurse) return res.status(404).json({ message: "Nurse not found" });

    if (
      String(nurse.selectedCategory) !== String(doctor.selectedCategory) ||
      String(nurse.selectedHospital) !== String(doctor.selectedHospital)
    ) {
      return res.status(403).json({ message: "Different hospital/category" });
    }

    await nurse.deleteOne();
    res.status(200).json({ message: "Nurse deleted" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
