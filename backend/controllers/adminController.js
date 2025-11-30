import User from "../models/User.js";
import Hospital from "../models/Hospital.js";  // IMPORTANT


const isSuperAdmin = (role) => role === "superadmin";

/**
 * ============================
 *  GET ALL USERS (TENANT-FILTERED)
 * ============================
 */
export const getAllUsers = async (req, res) => {
  try {
    if (req.user.role !== "admin")
      return res.status(403).json({ message: "Access denied: not admin" });

    const tenantId = req.user.tenantId;

    const users = await User.find({
      selectedHospitalTenantId: tenantId
    }).select("-password -otp");

    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * ============================
 *  GET ALL DOCTORS (TENANT-FILTERED)
 * ============================
 */
export const getAllDoctors = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;

    const doctors = await User.find({
      role: "doctor",
      selectedHospitalTenantId: tenantId
    })
      .populate("selectedCategory", "name")
      .sort({ createdAt: -1 })
      .select("name email role phone isVerified selectedCategory");

    res.status(200).json(doctors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * ============================
 *  GET PENDING DOCTORS (TENANT-FILTERED)
 * ============================
 */
export const getPendingDoctors = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;

    const pending = await User.find({
      role: "doctor_pending",
      selectedHospitalTenantId: tenantId
    }).select("name email role isApproved");

    res.status(200).json(pending);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * ============================
 *  APPROVE DOCTOR
 * ============================
 */
export const approveDoctors = async (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.user.tenantId;

    const doctor = await User.findOne({
      _id: id,
      selectedHospitalTenantId: tenantId
    });

    if (!doctor)
      return res.status(404).json({ message: "Doctor not found" });

    doctor.role = "doctor";
    doctor.isVerified= true;

    await doctor.save();

    res.json({ message: "Doctor approved", doctor });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * ============================
 *  TOGGLE DOCTOR APPROVAL
 * ============================
 */
export const toggleDoctorApproval = async (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.user.tenantId;

    const doctor = await User.findOne({
      _id: id,
      role: "doctor",
      selectedHospitalTenantId: tenantId
    });

    if (!doctor)
      return res.status(404).json({ message: "Doctor not found" });

    doctor.isVerified = !doctor.isVerified;
    await doctor.save();

    res.json({
      message: doctor.isVerified ? "Doctor approved" : "Doctor disapproved",
      doctor
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * ============================
 *  REJECT DOCTOR
 * ============================
 */
export const rejectDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.user.tenantId;

    const doctor = await User.findOne({
      _id: id,
      selectedHospitalTenantId: tenantId
    });

    if (!doctor)
      return res.status(404).json({ message: "Doctor not found" });

    await User.findByIdAndDelete(id);

    res.json({ message: "Doctor rejected and deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * ============================
 *  DELETE USER
 * ============================
 */
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.user.tenantId;

    const user = await User.findOne({
      _id: id,
      selectedHospitalTenantId: tenantId
    });

    if (!user)
      return res.status(404).json({ message: "User not found" });

    await User.findByIdAndDelete(id);

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * CREATE CATEGORY (TENANT SCOPED)
 */
export const createCategory = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const { name, description } = req.body;

    const hospital = await Hospital.findOne({ tenantId });
    if (!hospital) return res.status(404).json({ message: "Hospital not found" });

    // Prevent duplicate
    const exists = hospital.categories.find(
      (c) => c.name.toLowerCase() === name.toLowerCase()
    );

    if (exists)
      return res.status(400).json({ message: "Category already exists" });

    // CREATE NEW CATEGORY WITH _id
    const newCategory = {
      name,
      description
    };

    hospital.categories.push(newCategory);
    await hospital.save();

    const added = hospital.categories[hospital.categories.length - 1]; // latest category with _id

    res.status(201).json({ message: "Category added", category: added });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const { id } = req.params;
    const { name, description } = req.body;

    const hospital = await Hospital.findOne({ tenantId });
    if (!hospital) return res.status(404).json({ message: "Hospital not found" });

    const category = hospital.categories.id(id);
    if (!category) return res.status(404).json({ message: "Category not found" });

    category.name = name || category.name;
    category.description = description || category.description;

    await hospital.save();

    res.json({ message: "Category updated", category });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};




/**
 * GET CATEGORIES (TENANT FILTERED)
 */
export const getAllCategories = async (req, res) => {
  try {
    // ANY ROLE CAN ACCESS (user, nurse, doctor, admin)
    const tenantId = req.user.selectedHospitalTenantId || req.user.tenantId;

    if (!tenantId)
      return res.status(400).json({ message: "Tenant ID missing" });

    const hospital = await Hospital.findOne({ tenantId });
    if (!hospital)
      return res.status(404).json({ message: "Hospital not found" });

    // Return only category list (SAFE)
    return res.json(hospital.categories);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};



/**
 * UPDATE CATEGORY
 */
export const deleteCategory = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const { id } = req.params;

    const hospital = await Hospital.findOne({ tenantId });
    if (!hospital) return res.status(404).json({ message: "Hospital not found" });

    hospital.categories = hospital.categories.filter(
      (cat) => cat._id.toString() !== id
    );

    await hospital.save();

    res.json({ message: "Category deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * ============================
 *  GET ALL TICKETS
 * ============================
 */
export const getAllTickets = async (req, res) => {
  try {
    if (req.user.role !== "admin")
      return res.status(403).json({ message: "Access denied" });

    const tenantId = req.user.tenantId;

    const users = await User.find({
      selectedHospitalTenantId: tenantId
    }).select("name email supportTickets");

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

/**
 * ============================
 *  REPLY TO TICKET (ADMIN)
 * ============================
 */
export const replyToTicket = async (req, res) => {
  try {
    const { userId, ticketId, reply } = req.body;

    if (!reply || !ticketId || !userId) {
      return res.status(400).json({ message: "Missing details" });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user)
      return res.status(404).json({ message: "User not found" });

    // Find ticket
    const ticket = user.supportTickets.id(ticketId);
    if (!ticket)
      return res.status(404).json({ message: "Ticket not found" });

    // Update ticket
    ticket.reply = reply;
    ticket.status = "closed";
    ticket.replyAt = new Date();

    await user.save();

    res.json({
      message: "Reply sent and ticket closed",
      ticket
    });

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};


/**
 * GET ALL USERS (NO TENANT FILTER)
 */
export const getAllUsersSuperAdmin = async (req, res) => {
  try {
    if (!isSuperAdmin(req.user.role))
      return res.status(403).json({ message: "Only superadmin allowed" });

    const users = await User.find().select("-password -otp -__v");

    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * GET ALL DOCTORS (NO TENANT FILTER)
 */
export const getAllDoctorsSuperAdmin = async (req, res) => {
  try {
    if (!isSuperAdmin(req.user.role))
      return res.status(403).json({ message: "Only superadmin allowed" });

    const doctors = await User.find({ role: "doctor" })
      .select("-password -otp")
      .populate("selectedCategory", "name");

    res.json(doctors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * GET ALL HOSPITALS + USERS UNDER THEM
 */
export const getAllHospitalsSuperAdmin = async (req, res) => {
  try {
    if (!isSuperAdmin(req.user.role))
      return res.status(403).json({ message: "Only superadmin allowed" });

    const hospitals = await Hospital.find().lean();

    for (let h of hospitals) {
      h.users = await User.find({
        selectedHospitalTenantId: h.tenantId
      }).select("name email role isApproved");
    }

    res.json({ hospitals });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};