const express = require("express");
const router = express.Router();
const ticketController = require("../controllers/ticketController");
const { requireAuth } = require("../middleware/authMiddleware");

// Routes
router.post("/create", requireAuth, ticketController.createTicket);
router.put("/reply/:userId/:ticketId", requireAuth, ticketController.replyTicket);
router.delete("/:userId/:ticketId", requireAuth, ticketController.deleteTicket);
router.get("/:userId", requireAuth, ticketController.getTickets);

module.exports = router;
