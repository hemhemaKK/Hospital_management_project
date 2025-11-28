const express = require("express");
const { requireAuth } = require("../middleware/authMiddleware");
const {
  chooseCategory,
  getDashboard,
  getNurse, 
  approveNurse, 
  disapproveNurse,
  rejectNurse,
  createSubCategory,
  getSubCategories,
  updateSubCategory,
  deleteSubCategory,
  getSelectedSubCategories,
  chooseHospitalAndCategory,
} = require("../controllers/doctorController");

// Initialize router
const router = express.Router();


router.put("/choose-hospital-category", requireAuth, chooseHospitalAndCategory);

// Employee chooses category
router.put("/choose-category", requireAuth, chooseCategory);

// Employee dashboard
router.get("/dashboard", requireAuth, getDashboard);

// nurse routes (employee can manage their category)
router.get("/nurse", requireAuth, getNurse);  
router.put("/nurse/approve/:id", requireAuth, approveNurse);
router.put("/nurse/disapprove/:id", requireAuth, disapproveNurse);
router.delete("/nurse/reject/:id", requireAuth, rejectNurse);
router.post("/subcategory", requireAuth, createSubCategory);
router.get("/subcategories", requireAuth, getSubCategories);

router.get("/selectedsubcategories", requireAuth, getSelectedSubCategories);
router.put("/subcategory/:id", requireAuth, updateSubCategory);
router.delete("/subcategory/:id", requireAuth, deleteSubCategory);


module.exports = router;
