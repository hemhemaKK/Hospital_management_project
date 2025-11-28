import User from "../models/User.js";
import Category from "../models/Category.js";

const ADMIN_EMAIL = "mcaprojecttestemail@gmail.com";

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    if (req.user.email !== ADMIN_EMAIL)
      return res.status(403).json({ message: "Access denied: not admin" });

    const users = await User.find().select("-password -otp");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all employees
export const getAllEmployees = async (req, res) => {
  try {
    const employees = await User.find({ role: "employee" })
      .populate("selectedCategory", "name") 
      .sort({ createdAt: -1 })
      .select("name email role isApproved");
    res.status(200).json(employees);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all pending employees
export const getPendingEmployees = async (req, res) => {
  try {
    const pending = await User.find({ role: "employee_pending" }).select("name email role isApproved");
    res.status(200).json(pending);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Approve employee (initial approval)
export const approveEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const employee = await User.findById(id);
    if (!employee || employee.role !== "employee") return res.status(404).json({ message: "Employee not found" });

    employee.isApproved = true;
    await employee.save();

    res.status(200).json({ message: "Employee approved", employee });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Toggle approval (approve <-> disapprove)
export const toggleEmployeeApproval = async (req, res) => {
  try {
    const { id } = req.params;
    const employee = await User.findById(id);
    if (!employee || employee.role !== "employee") return res.status(404).json({ message: "Employee not found" });

    employee.isApproved = !employee.isApproved;
    await employee.save();

    res.status(200).json({
      message: employee.isApproved ? "Employee approved" : "Employee disapproved",
      employee
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Reject employee
export const rejectEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const employee = await User.findById(id);
    if (!employee || (employee.role !== "employee" && employee.role !== "employee_pending"))
      return res.status(404).json({ message: "Employee not found" });

    await User.findByIdAndDelete(id);
    res.status(200).json({ message: "Employee rejected and deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete user
export const deleteUser = async (req, res) => {
  try {
    if (req.user.email !== ADMIN_EMAIL) return res.status(403).json({ message: "Access denied: not admin" });

    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    await User.findByIdAndDelete(id);
    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createCategory = async (req, res) => {
  try {
    if (req.user.email !== ADMIN_EMAIL)
      return res.status(403).json({ message: "Access denied: not admin" });

    const { name, description } = req.body;
    if (!name) return res.status(400).json({ message: "Category name is required" });

    const category = new Category({ name, description });
    await category.save();

    res.status(201).json({ message: "Category created", category });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all categories
export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.status(200).json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update category
export const updateCategory = async (req, res) => {
  try {
    if (req.user.email !== ADMIN_EMAIL)
      return res.status(403).json({ message: "Access denied: not admin" });

    const { id } = req.params;
    const { name, description } = req.body;

    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      { name, description },
      { new: true }
    );

    if (!updatedCategory) return res.status(404).json({ message: "Category not found" });

    res.status(200).json({ message: "Category updated", category: updatedCategory });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete category
export const deleteCategory = async (req, res) => {
  try {
    if (req.user.email !== ADMIN_EMAIL)
      return res.status(403).json({ message: "Access denied: not admin" });

    const { id } = req.params;
    const category = await Category.findById(id);
    if (!category) return res.status(404).json({ message: "Category not found" });

    await Category.findByIdAndDelete(id);
    res.status(200).json({ message: "Category deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Tickets & Contacts
export const getAllTickets = async (req, res) => {
  try {
    if (req.user.email !== ADMIN_EMAIL) return res.status(403).json({ message: "Access denied" });

    const users = await User.find().select("name email supportTickets");
    const tickets = users.flatMap(user =>
      (user.supportTickets || []).map(ticket => ({
        ...ticket.toObject(),
        user: { name: user.name, email: user.email }
      }))
    );
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

