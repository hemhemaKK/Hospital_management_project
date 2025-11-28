import Complaint from "../models/Complaints.js";
import User from "../models/User.js";
import { sendStatusUpdateEmail } from "../utils/sendStatusUpdateEmail.js";

export const createComplaint = async (req, res) => {
  try {
    const { category, subCategory, description, problem, images, location } = req.body;

    const employee = await User.findOne({
      role: "employee",
      selectedCategory: category,
      isApproved: true,
    });

    const complaint = new Complaint({
      user: req.user._id,
      category,
      subCategory,
      description,
      images,
      problem, 
      location,
      assignedEmployee: null,
    });

    await complaint.save();
    res.status(201).json({ message: "Complaint created", complaint });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getUserComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ user: req.user._id })
      .populate("category", "name")
      .populate("subCategory", "name description")
      .populate("assignedEmployee", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(complaints);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const assignComplaint = async (req, res) => {
  try {
    const { complaintId, employeeId } = req.body;

    const complaint = await Complaint.findById(complaintId);
    if (!complaint) return res.status(404).json({ message: "Complaint not found" });

    const employee = await User.findById(employeeId);
    if (!employee) return res.status(404).json({ message: "Employee not found" });

    // Only allow assignment to a sub-employee
    if (employee.role !== "subemployee") {
      return res.status(400).json({ message: "Only sub-employees can be assigned" });
    }

    complaint.assignedEmployee = employee._id;
    complaint.status = "In Progress"; 
    await complaint.save();

    console.log(complaint.user.email)
    await sendStatusUpdateEmail(
      complaint.user.email,
      {
        userName: complaint.user.name,
        problem: complaint.problem,
        assignedTo: employee.name
      },
      complaint.status
    );

    res.status(200).json({ message: "Complaint assigned successfully", complaint });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};


export const getComplaintsForEmployee = async (req, res) => {
  try {
    const employee = req.user; // logged-in employee
    if (!employee.selectedCategory) {
      return res.status(400).json({ message: "Employee has no assigned category" });
    }

    const complaints = await Complaint.find({ category: employee.selectedCategory })
      .populate("user", "name email")
      .populate("assignedEmployee", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(complaints);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Mark complaint as solved
export const markComplaintSolved = async (req, res) => {
  try {
    const { complaintId } = req.params;

    const complaint = await Complaint.findById(complaintId)
      .populate("user", "name email")
      .populate("assignedEmployee", "name");

    if (!complaint)
      return res.status(404).json({ message: "Complaint not found" });

    if (!complaint.assignedEmployee)
      return res.status(400).json({ message: "Complaint has no assigned employee" });

    if (complaint.assignedEmployee._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You are not authorized to mark this complaint as solved" });
    }

    complaint.status = "Resolved";
    await complaint.save();

    console.log(complaint.user.email)
    await sendStatusUpdateEmail(
      complaint.user.email,
      {
        userName: complaint.user.name,
        problem: complaint.problem,
        assignedTo: complaint.assignedEmployee.name
      },
      complaint.status
    );

    res.status(200).json({ message: "Complaint marked as solved", complaint });
  } catch (err) {
    console.error("❌ markComplaintSolved error:", err);
    res.status(500).json({ message: err.message });
  }
};
