const express = require("express");
const User = require("../models/User");
const router = express.Router();

// POST /api/review - create a review (keep auth)
const { requireAuth } = require("../middleware/authMiddleware");

router.post("/", requireAuth, async (req, res) => {
  try {
    const { title, comment, rating } = req.body;

    if (!title || !comment || !rating) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.hasReviewed) {
      return res.status(400).json({ message: "You have already submitted a review" });
    }

    user.reviews.push({ title, comment, rating });
    user.hasReviewed = true;
    await user.save();

    res.status(201).json({ message: "Review submitted successfully", review: user.reviews[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/review - get all users' reviews (no auth)
router.get("/", async (req, res) => {
  try {
    const users = await User.find({}, { reviews: 1, name: 1, profilePic: 1 }); // include name & profilePic
    const allReviews = [];

    users.forEach((user) => {
      if (user.reviews && user.reviews.length > 0) {
        user.reviews.forEach((r) => {
          allReviews.push({
            name: user.name || "User",
            userName: user.name || "User",
            userImage: user.profilePic || "https://i.pravatar.cc/150?img=7",
            title: r.title,
            comment: r.comment,
            rating: r.rating,
            createdAt: r.createdAt,
          });
        });
      }
    });

    res.status(200).json({ reviews: allReviews });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;


module.exports = router;
