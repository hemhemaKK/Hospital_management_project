const User = require("../models/User");


// Get tickets of a specific user (Admin or self)
// Get tickets
exports.getTickets = async (req, res) => {
  try {
    if (req.user.email === "mcaprojecttestemail@gmail.com") {
      // Admin: get all users' tickets
      const users = await User.find({}, "supportTickets name email"); // optionally include name/email
      // flatten tickets with user info
      const allTickets = users.flatMap(u =>
        u.supportTickets.map(t => ({
          ...t.toObject(),
          userName: u.name,
          userEmail: u.email
        }))
      );
      return res.json(allTickets);
    } else {
      const user = await User.findById(req.user._id).select("supportTickets name email");
      const tickets = user.supportTickets.map(t => ({
        ...t.toObject(),
        userName: user.name,
        userEmail: user.email
      }));
      return res.json(tickets);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Create a new ticket
exports.createTicket = async (req, res) => {
  try {
    const { subject, message } = req.body;
    if (!subject || !message) return res.status(400).json({ message: "Subject and message are required" });

    const user = await User.findById(req.user._id);
    const ticket = { subject, message, status: "open" };

    user.supportTickets.push(ticket);
    await user.save();

    res.status(201).json({ message: "Ticket created successfully", ticket });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Reply to ticket (Admin)
exports.replyTicket = async (req, res) => {
  try {
    const { userId, ticketId } = req.params;
    const { reply } = req.body;

    if (!reply) return res.status(400).json({ message: "Reply is required" });

    const user = await User.findById(userId);
    const ticket = user.supportTickets.id(ticketId);

    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    ticket.reply = reply;
    ticket.replyAt = new Date();
    ticket.status = "closed";
    ticket.updatedAt = new Date();

    await user.save();
    res.json({ message: "Replied successfully", ticket });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete a ticket
exports.deleteTicket = async (req, res) => {
  try {
    const { userId, ticketId } = req.params;

    if (req.user.role !== "admin" && req.user._id.toString() !== userId)
      return res.status(403).json({ message: "Forbidden" });

    const user = await User.findById(userId);
    const ticket = user.supportTickets.id(ticketId);

    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    ticket.remove();
    await user.save();

    res.json({ message: "Ticket deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



