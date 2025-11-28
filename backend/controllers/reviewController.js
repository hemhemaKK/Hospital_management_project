// controllers/reviewController.js
const User = require("../models/User");

// Create a review
const createReview = async (req, res) => {
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

    res.status(201).json({
      message: "Review submitted successfully",
      review: user.reviews[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createReview,
  getReviews,
};
