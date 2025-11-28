import User from "../models/User.js";
import Category from "../models/Category.js";
import SubCategory from "../models/subCategory.js";

// doctor chooses a category
export const chooseCategory = async (req, res) => {
  try {
    const { categoryId } = req.body;
    const category = await Category.findById(categoryId);
    if (!category) return res.status(404).json({ message: "Category not found" });

    const user = await User.findById(req.user._id);
    user.selectedCategory = category._id;
    await user.save();

    res.status(200).json({ message: "Category selected", category });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// doctor dashboard
export const getDashboard = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("selectedCategory", "name description");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({
      user,
      approved: user.isApproved,
      message: user.isApproved
        ? "User is approved"
        : "Admin has not approved your registration yet",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get nurses in doctor's category
export const getNurse = async (req, res) => {
  try {
    const doctor = await User.findById(req.user._id);
    if (!doctor.selectedCategory) {
      return res.status(400).json({ message: "doctor has not selected a category" });
    }

    // Only nurses in this category
    const Nurse = await User.find({
      role: "Nurse",
      selectedCategory: doctor.selectedCategory,
    });

    res.status(200).json(Nurse);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Approve nurse
export const approveNurse = async (req, res) => {
  try {
    const doctor = await User.findById(req.user._id);
    const nurse = await User.findById(req.params.id);

    if (!nurse) return res.status(404).json({ message: "nurse not found" });

    if (nurse.selectedCategory.toString() !== doctor.selectedCategory.toString()) {
      return res.status(403).json({ message: "Cannot approve nurse outside your category" });
    }

    nurse.isApproved = true;
    await nurse.save();

    res.status(200).json({ message: "nurse approved", nurse });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Disapprove nurse
export const disapproveNurse = async (req, res) => {
  try {
    const doctor = await User.findById(req.user._id);
    const nurse = await User.findById(req.params.id);

    if (!nurse) return res.status(404).json({ message: "nurse not found" });

    if (nurse.selectedCategory.toString() !== doctor.selectedCategory.toString()) {
      return res.status(403).json({ message: "Cannot disapprove nurse outside your category" });
    }

    nurse.isApproved = false;
    await nurse.save();

    res.status(200).json({ message: "nurse disapproved", nurse });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Reject nurse (delete)
export const rejectNurse = async (req, res) => {
  try {
    const doctor = await User.findById(req.user._id);
    const nurse = await User.findById(req.params.id);

    if (!nurse) return res.status(404).json({ message: "nurse not found" });

    if (nurse.selectedCategory.toString() !== doctor.selectedCategory.toString()) {
      return res.status(403).json({ message: "Cannot reject nurse outside your category" });
    }

    await nurse.deleteOne();

    res.status(200).json({ message: "nurse rejected" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createSubCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    // Only doctor can create subcategory
    if (req.user.role !== "doctor") {
      return res.status(403).json({ message: "Access denied: only doctors can create subcategories" });
    }

    const doctor = await User.findById(req.user._id);
    if (!doctor.selectedCategory) {
      return res.status(400).json({ message: "Select a category first" });
    }

    const category = await Category.findById(doctor.selectedCategory);
    if (!category) return res.status(404).json({ message: "Selected category not found" });

    const subCategory = new SubCategory({
      name,
      description,
      category: category._id,
      createdBy: doctor._id,
    });

    await subCategory.save();
    res.status(201).json({ message: "Subcategory created", subCategory });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// Get all subcategories under doctor's category
export const getSubCategories = async (req, res) => {
  try {
    const doctor = await User.findById(req.user._id);
    if (!doctor.selectedCategory) {
      return res.status(400).json({ message: "Select a category first" });
    }

    const subCategories = await SubCategory.find({ category: doctor.selectedCategory }).populate("category", "name");
    res.status(200).json(subCategories);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// Update SubCategory (doctor can edit only their own subcategory)
export const updateSubCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const subCategory = await SubCategory.findById(id);
    if (!subCategory) return res.status(404).json({ message: "SubCategory not found" });

    if (subCategory.createdBy.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Cannot edit subcategory created by others" });

    subCategory.name = name || subCategory.name;
    subCategory.description = description || subCategory.description;
    await subCategory.save();

    res.status(200).json({ message: "SubCategory updated", subCategory });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// Delete SubCategory (doctor can delete only their own subcategory)
export const deleteSubCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const subCategory = await SubCategory.findById(id);
    if (!subCategory) return res.status(404).json({ message: "SubCategory not found" });

    if (subCategory.createdBy.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Cannot delete subcategory created by others" });

    await SubCategory.findByIdAndDelete(id);
    res.status(200).json({ message: "SubCategory deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

export const getSelectedSubCategories = async (req, res) => {
  try {
    const { categoryId } = req.query;

    if (!categoryId) {
      return res.status(400).json({ message: "categoryId is required" });
    }

    const subcategories = await SubCategory.find({ category: categoryId });
    res.status(200).json(subcategories);
  } catch (err) {
    console.error("Error fetching subcategories:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const chooseHospitalAndCategory = async (req, res) => {
  try {
    const doctorId = req.user._id;
    const { hospitalId, categoryId } = req.body;

    if (!hospitalId || !categoryId) {
      return res.status(400).json({ message: "Hospital and Category are required" });
    }

    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== "doctor") {
      return res.status(404).json({ message: "Doctor not found" });
    }

    doctor.selectedHospital = hospitalId;
    doctor.selectedCategory = categoryId;
    doctor.isApproved = false; // reset approval after changing
    await doctor.save();

    res.status(200).json({
      message: "Hospital & Category selected successfully",
      doctor,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
