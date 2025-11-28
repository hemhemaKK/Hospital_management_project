const express = require("express");
const { requireAuth } = require("../middleware/authMiddleware");
const {
  chooseCategory,
  getDashboard,
  getSubEmployees,
  approveSubEmployee,
  disapproveSubEmployee,
  rejectSubEmployee,
  createSubCategory,
  getSubCategories,
  updateSubCategory,
  deleteSubCategory,
  getSelectedSubCategories,
} = require("../controllers/employeeController");

// Initialize router
const router = express.Router();

// Employee chooses category
router.put("/choose-category", requireAuth, chooseCategory);

// Employee dashboard
router.get("/dashboard", requireAuth, getDashboard);

// Sub-employees routes (employee can manage their category)
router.get("/sub-employees", requireAuth, getSubEmployees);
router.put("/sub-employees/approve/:id", requireAuth, approveSubEmployee);
router.put("/sub-employees/disapprove/:id", requireAuth, disapproveSubEmployee);
router.delete("/sub-employees/reject/:id", requireAuth, rejectSubEmployee);
router.post("/subcategory", requireAuth, createSubCategory);
router.get("/subcategories", requireAuth, getSubCategories);

router.get("/selectedsubcategories", requireAuth, getSelectedSubCategories);
router.put("/subcategory/:id", requireAuth, updateSubCategory);
router.delete("/subcategory/:id", requireAuth, deleteSubCategory);


module.exports = router;
