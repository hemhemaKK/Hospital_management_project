const express = require("express");
const router = express.Router();

const {
  getAllAdmins,
  updateAdmin,
  toggleAdmin,
  deleteAdmin,
} = require("../controllers/superadminController");

const { requireAuth } = require("../middleware/authMiddleware");

// All routes require logged-in superadmin
router.get("/admins", requireAuth, getAllAdmins);
router.put("/admins/:id", requireAuth, updateAdmin);
router.patch("/admins/:id/toggle", requireAuth, toggleAdmin);
router.delete("/admins/:id", requireAuth, deleteAdmin);


router.get("/hospitals/list", requireAuth, async (req, res) => {
  try {
    const hospitals = await User.find({
      role: "admin",
      isHospital: true
    })
      .select("_id hospitalName address hospitalPhone hospitalStatus")
      .lean();

    res.json({ hospitals });
  } catch (err) {
    console.error("🔥 ERROR in /superadmin/hospitals/list:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

module.exports = router;