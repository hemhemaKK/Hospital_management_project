const User = require("../models/User");

// simple check
const isSuperAdmin = (role) => role === "superadmin";


// ---------------- GET ALL ADMINS ----------------
exports.getAllAdmins = async (req, res) => {
  try {
    if (!isSuperAdmin(req.user.role))
      return res.status(403).json({ msg: "Access denied: Only superadmin" });

    const admins = await User.find({ role: "admin" }).select("-password -otp");
    res.json(admins);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// ---------------- UPDATE ADMIN ----------------
exports.updateAdmin = async (req, res) => {
  try {
    if (!isSuperAdmin(req.user.role))
      return res.status(403).json({ msg: "Only superadmin can update admins" });

    const { id } = req.params;
    const { name, email } = req.body;

    const updated = await User.findByIdAndUpdate(
      id,
      { name, email },
      { new: true }
    ).select("-password");

    if (!updated) return res.status(404).json({ msg: "Admin not found" });

    res.json({ msg: "Admin updated", admin: updated });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// ---------------- ENABLE / DISABLE ADMIN ----------------
exports.toggleAdmin = async (req, res) => {
  try {
    if (!isSuperAdmin(req.user.role))
      return res.status(403).json({ msg: "Only superadmin can toggle admin status" });

    const { id } = req.params;
    const admin = await User.findById(id);

    if (!admin || admin.role !== "admin")
      return res.status(404).json({ msg: "Admin not found" });

    admin.isApproved = !admin.isApproved;
    await admin.save();

    res.json({
      msg: admin.isApproved ? "Admin enabled" : "Admin disabled",
      admin
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// ---------------- DELETE ADMIN ----------------
exports.deleteAdmin = async (req, res) => {
  try {
    if (!isSuperAdmin(req.user.role))
      return res.status(403).json({ msg: "Only superadmin can delete admins" });

    const { id } = req.params;

    const admin = await User.findById(id);
    if (!admin || admin.role !== "admin")
      return res.status(404).json({ msg: "Admin not found" });

    await User.findByIdAndDelete(id);

    res.json({ msg: "Admin deleted successfully" });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};
