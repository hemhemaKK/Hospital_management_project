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
  reply: { type: String, default: "" },
  replyAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String },
    lastName: { type: String },
    name: { type: String },

    email: { type: String, unique: true },
    password: String,
    otp: Number,
    isVerified: { type: Boolean, default: false },

    googleId: String,

    // Corrected roles
    role: {
      type: String,
      enum: [
        "superadmin",
        "admin",
        "doctor",
        "nurse",
        "receptionist",
        "pharmacist",
        "user"
      ],
      default: "user"
    },

    profilePic: { type: String, default: "" },
    phone: { type: String, default: "" },
    isPhoneVerified: { type: Boolean, default: false },
    isApproved: { type: Boolean, default: false },

    /* ------------------------------------------------------------------
       HOSPITAL ADMIN RELATED FIELDS
    ------------------------------------------------------------------ */

    isHospital: { type: Boolean, default: false },

    hospitalName: { type: String },
    address: { type: String },
    licenseNumber: { type: String, unique: true, sparse: true },
    hospitalPhone: { type: String },

    hospitalStatus: {
      type: String,
      enum: ["PENDING", "VERIFIED", "ACTIVE", "SUSPENDED", "INACTIVE"],
      default: "PENDING"
    },

    
    /* ------------------------------------------------------------------
       DOCTOR RELATED FIELDS
    ------------------------------------------------------------------ */

    selectedHospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // hospital admin
      default: null
    },

    selectedCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null
    },

    /* ------------------------------------------------------------------
       FEATURES
    ------------------------------------------------------------------ */

    reviews: [reviewSchema],
    supportTickets: [ticketSchema],
    hasReviewed: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
