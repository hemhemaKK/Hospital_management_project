// controllers/chatController.js
import User from "../models/User.js";
import Complaint from "../models/Complaints.js";
import Category from "../models/Category.js";
import SubCategory from "../models/subCategory.js";

/**
 * Chat endpoint: POST /api/chatbot
 * Body: { userId, message }
 *
 * Returns: { reply: "<text reply>" }
 */
export const chatWithBot = async (req, res) => {
  try {
    const { userId, message } = req.body;
    if (!userId || !message) {
      return res.status(400).json({ reply: "Missing userId or message" });
    }

    const lower = message.toLowerCase();

    // Quick utilities for matching intents
    const containsAny = (arr) => arr.some((w) => lower.includes(w));

    // Intent checks
    const isGreeting = containsAny(["hello", "hi", "hey", "good morning", "good afternoon", "good evening"]);
    const wantsHowToComplaint = containsAny([
      "raise complaint",
      "make complaint",
      "create complaint",
      "file complaint",
      "how to complain",
      "how to raise a complaint",
      "how do i complain",
    ]);
    const wantsHowToTicket = containsAny([
      "support ticket",
      "raise ticket",
      "create ticket",
      "how to raise ticket",
      "how to create ticket",
    ]);
    const mentionsComplaint = containsAny(["complaint", "complaints"]);
    const mentionsTicket = containsAny(["ticket", "tickets", "support", "support ticket"]);
    const asksCategories = containsAny(["categories", "subcategories", "category list", "subcategory list", "which categories"]);

    // Start building a reply text (always a string to keep frontend simple)
    let replyText = "Sorry, I didn't understand that. Please try asking in another way.";

    // 1) Greeting
    if (isGreeting) {
      replyText =
        "Hello! I’m here to help you with complaints, support tickets, categories and how to use the system. Ask me things like:\n" +
        "- 'How do I raise a complaint?'\n" +
        "- 'What is the status of my complaints?'\n" +
        "- 'How do I create a support ticket?'\n" +
        "How can I help you today?";
      return res.json({ reply: replyText });
    }

    // If the user explicitly asked how to raise a complaint
    if (wantsHowToComplaint) {
      // also list categories to help them choose
      const categories = await Category.find().lean();
      let categoryList = "No categories available.";
      if (categories.length) {
        categoryList = categories.map((c) => `• ${c.name}${c.description ? ` — ${c.description}` : ""}`).join("\n");
      }
      replyText =
        "To raise a complaint:\n" +
        "1. Open the 'Complaints' page in your dashboard.\n" +
        "2. Click 'Create Complaint'.\n" +
        "3. Select a category (and optionally subcategory), enter a short problem title, a full description, attach images, and optionally share your location.\n" +
        "4. Submit — you'll receive updates when the status changes.\n\nAvailable categories:\n" +
        categoryList;
      return res.json({ reply: replyText });
    }

    // If the user explicitly asked how to raise a support ticket
    if (wantsHowToTicket) {
      replyText =
        "To create a support ticket:\n" +
        "1. Open the 'Support' (or 'Tickets') page in your dashboard.\n" +
        "2. Click 'Create Ticket' or 'New Ticket'.\n" +
        "3. Enter a clear subject and describe your issue in the message.\n" +
        "4. Submit — an admin will reply. You can check ticket status anytime in Support.";
      return res.json({ reply: replyText });
    }

    // If the user requested categories or subcategories
    if (asksCategories) {
      const categories = await Category.find().lean();
      if (!categories.length) {
        replyText = "No categories are available at the moment.";
      } else {
        // Build category -> subcategory listing
        let lines = [];
        for (const c of categories) {
          const subs = await SubCategory.find({ category: c._id }).lean();
          const subList = subs.length ? subs.map((s) => s.name).join(", ") : "No subcategories";
          lines.push(`Category: ${c.name}\n  Subcategories: ${subList}`);
        }
        replyText = `Available categories and subcategories:\n\n${lines.join("\n\n")}`;
      }
      return res.json({ reply: replyText });
    }

    // If both complaint and ticket keywords are present, prefer a clarifying question or show both summaries
    // We'll detect both and return combined info.
    if (mentionsComplaint && mentionsTicket) {
      // Build both summaries and combine
      // Complaints summary
      const userComplaints = await Complaint.find({ user: userId }).populate("category subCategory").lean();
      let complaintsSummary = "";
      if (!userComplaints.length) {
        complaintsSummary = "You currently have no complaints filed.";
      } else {
        const pending = userComplaints.filter((c) => c.status === "Pending").length;
        const inProgress = userComplaints.filter((c) => c.status === "In Progress").length;
        const resolved = userComplaints.filter((c) => c.status === "Resolved").length;

        const list = userComplaints
          .map(
            (c, i) =>
              `${i + 1}. [${c.status}] Category: ${c.category?.name || "—"}, Subcategory: ${c.subCategory?.name || "—"}\n` +
              `   Problem: ${c.problem}\n` +
              `   Description: ${c.description || "—"}`
          )
          .join("\n\n");

        complaintsSummary = `Complaints Summary\nYou have ${pending} Pending, ${inProgress} In Progress, and ${resolved} Resolved complaint(s).\n\n${list}`;
      }

      // Tickets summary
      const userObj = await User.findById(userId).lean();
      const tickets = userObj?.supportTickets || [];
      let ticketsSummary = "";
      if (!tickets.length) {
        ticketsSummary = "You currently have no support tickets.";
      } else {
        const open = tickets.filter((t) => t.status === "open").length;
        const pending = tickets.filter((t) => t.status === "pending").length;
        const closed = tickets.filter((t) => t.status === "closed").length;

        const list = tickets
          .map(
            (t, i) =>
              `${i + 1}. [${t.status}] Subject: ${t.subject}\n` +
              `   Message: ${t.message}\n` +
              `   ${t.reply ? `Reply: ${t.reply}` : "No reply yet"}`
          )
          .join("\n\n");

        ticketsSummary = `Tickets Summary\nYou have ${open} open, ${pending} pending, and ${closed} closed support ticket(s).\n\n${list}`;
      }

      replyText = `I see you asked about both complaints and support tickets. Here are both summaries:\n\n${complaintsSummary}\n\n---\n\n${ticketsSummary}`;
      return res.json({ reply: replyText });
    }

    // If message mentions only complaints (or user asks "status" ambiguously but earlier checks didn't match)
    if (mentionsComplaint) {
      const userComplaints = await Complaint.find({ user: userId }).populate("category subCategory").lean();
      if (!userComplaints.length) {
        replyText = "You currently have no complaints filed.";
      } else {
        const pending = userComplaints.filter((c) => c.status === "Pending").length;
        const inProgress = userComplaints.filter((c) => c.status === "In Progress").length;
        const resolved = userComplaints.filter((c) => c.status === "Resolved").length;

        const list = userComplaints
          .map(
            (c, i) =>
              `${i + 1}. [${c.status}] Category: ${c.category?.name || "—"}, Subcategory: ${c.subCategory?.name || "—"}\n` +
              `   Problem: ${c.problem}\n` +
              `   Description: ${c.description || "—"}`
          )
          .join("\n\n");

        replyText = `You have ${pending} Pending, ${inProgress} In Progress, and ${resolved} Resolved complaint(s).\n\nComplaint Details:\n${list}`;
      }
      return res.json({ reply: replyText });
    }

    // If message mentions only support tickets
    if (mentionsTicket) {
      const userObj = await User.findById(userId).lean();
      const tickets = userObj?.supportTickets || [];

      if (!tickets.length) {
        replyText = "You currently have no support tickets.";
      } else {
        const open = tickets.filter((t) => t.status === "open").length;
        const pending = tickets.filter((t) => t.status === "pending").length;
        const closed = tickets.filter((t) => t.status === "closed").length;

        const list = tickets
          .map(
            (t, i) =>
              `${i + 1}. [${t.status}] Subject: ${t.subject}\n` +
              `   Message: ${t.message}\n` +
              `   ${t.reply ? `Reply: ${t.reply}` : "No reply yet"}`
          )
          .join("\n\n");

        replyText = `You have ${open} open, ${pending} pending, and ${closed} closed support ticket(s).\n\nTicket Details:\n${list}`;
      }
      return res.json({ reply: replyText });
    }

    // Fallback help and tips
    if (containsAny(["help", "how", "what", "guide"])) {
      replyText =
        "I can help with:\n" +
        "- Raising a complaint: ask 'how to raise complaint' or 'create complaint'\n" +
        "- Complaint status: ask 'complaint status' or 'status of my complaints'\n" +
        "- Raising a support ticket: ask 'how to create ticket' or 'raise ticket'\n" +
        "- Ticket status: ask 'ticket status' or 'my tickets'\n" +
        "- View categories: ask 'categories' or 'subcategories'\n" +
        "What would you like to do?";
      return res.json({ reply: replyText });
    }

    // Generic thanks/farewell
    if (containsAny(["thank", "thanks", "thx"])) {
      replyText = "You’re welcome! If you need anything else, ask me about complaints or support tickets.";
      return res.json({ reply: replyText });
    }

    // Final fallback
    return res.json({ reply: replyText });
  } catch (error) {
    console.error("Chatbot error:", error);
    return res.status(500).json({ reply: "Server error. Please try again later." });
  }
};
