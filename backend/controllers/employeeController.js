import User from "../models/User.js";
import Category from "../models/Category.js";
import SubCategory from "../models/subCategory.js";

// Employee chooses a category
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

// Employee dashboard
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

// Get sub-employees in employee's category
export const getSubEmployees = async (req, res) => {
  try {
    const employee = await User.findById(req.user._id);
    if (!employee.selectedCategory) {
      return res.status(400).json({ message: "Employee has not selected a category" });
    }

    // Only sub-employees in this category
    const subEmployees = await User.find({
      role: "subemployee",
      selectedCategory: employee.selectedCategory,
    });

    res.status(200).json(subEmployees);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Approve sub-employee
export const approveSubEmployee = async (req, res) => {
  try {
    const employee = await User.findById(req.user._id);
    const subEmp = await User.findById(req.params.id);

    if (!subEmp) return res.status(404).json({ message: "Sub-employee not found" });

    if (subEmp.selectedCategory.toString() !== employee.selectedCategory.toString()) {
      return res.status(403).json({ message: "Cannot approve sub-employee outside your category" });
    }

    subEmp.isApproved = true;
    await subEmp.save();

    res.status(200).json({ message: "Sub-employee approved", subEmp });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Disapprove sub-employee
export const disapproveSubEmployee = async (req, res) => {
  try {
    const employee = await User.findById(req.user._id);
    const subEmp = await User.findById(req.params.id);

    if (!subEmp) return res.status(404).json({ message: "Sub-employee not found" });

    if (subEmp.selectedCategory.toString() !== employee.selectedCategory.toString()) {
      return res.status(403).json({ message: "Cannot disapprove sub-employee outside your category" });
    }

    subEmp.isApproved = false;
    await subEmp.save();

    res.status(200).json({ message: "Sub-employee disapproved", subEmp });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Reject sub-employee (delete)
export const rejectSubEmployee = async (req, res) => {
  try {
    const employee = await User.findById(req.user._id);
    const subEmp = await User.findById(req.params.id);

    if (!subEmp) return res.status(404).json({ message: "Sub-employee not found" });

    if (subEmp.selectedCategory.toString() !== employee.selectedCategory.toString()) {
      return res.status(403).json({ message: "Cannot reject sub-employee outside your category" });
    }

    await subEmp.deleteOne();

    res.status(200).json({ message: "Sub-employee rejected" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createSubCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    // Only employee can create subcategory
    if (req.user.role !== "employee") {
      return res.status(403).json({ message: "Access denied: only employees can create subcategories" });
    }

    const employee = await User.findById(req.user._id);
    if (!employee.selectedCategory) {
      return res.status(400).json({ message: "Select a category first" });
    }

    const category = await Category.findById(employee.selectedCategory);
    if (!category) return res.status(404).json({ message: "Selected category not found" });

    const subCategory = new SubCategory({
      name,
      description,
      category: category._id,
      createdBy: employee._id,
    });

    await subCategory.save();
    res.status(201).json({ message: "Subcategory created", subCategory });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// Get all subcategories under employee's category
export const getSubCategories = async (req, res) => {
  try {
    const employee = await User.findById(req.user._id);
    if (!employee.selectedCategory) {
      return res.status(400).json({ message: "Select a category first" });
    }

    const subCategories = await SubCategory.find({ category: employee.selectedCategory }).populate("category", "name");
    res.status(200).json(subCategories);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// Update SubCategory (Employee can edit only their own subcategory)
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

// Delete SubCategory (Employee can delete only their own subcategory)
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