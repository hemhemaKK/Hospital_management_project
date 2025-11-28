// models/User.js
const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  title: { type: String, required: true },
  comment: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  createdAt: { type: Date, default: Date.now }
});

const ticketSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  message: { type: String, required: true },
  status: { type: String, default: "open", enum: ["open", "pending", "closed"] },
  reply: { type: String, default: "" },          // Admin reply
  replyAt: { type: Date },                       // Timestamp of reply
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  otp: Number,
  isVerified: { type: Boolean, default: false },
  googleId: String,
  role: { type: String, enum: ["admin", "employee", "subemployee", "user"], default: "user" },
  profilePic: { type: String, default: "" },
  phone: { type: String, default: "" },
  isPhoneVerified: { type: Boolean, default: false },
  isApproved: { type: Boolean, default: false },
  // New fields
  reviews: [reviewSchema],        // Array of reviews
  supportTickets: [ticketSchema], // Array of tickets with reply
  hasReviewed: { type: Boolean, default: false },
  selectedCategory: { type: mongoose.Schema.Types.ObjectId, ref: "Category" }, // new field
 
});

module.exports = mongoose.model("User", userSchema);
