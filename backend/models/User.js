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

    googleId: String,

    otp: Number,
    isVerified: { type: Boolean, default: false },

    phone: { type: String, default: "" },
    isPhoneVerified: { type: Boolean, default: false },

    profilePic: { type: String, default: "" },

    role: {
      type: String,
      enum: [
        "superadmin",
        "doctor",
        "nurse",
        "receptionist",
        "pharmacist",
        "user"
      ],
      default: "user"
    },

   
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE", "LOCKED", "PASSWORD_EXPIRED"],
      default: "ACTIVE"
    },

    passwordHistory: [{ type: String }],

    // ⭐ USER SELECTS A HOSPITAL DURING REGISTER
    selectedHospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
      default: null
    },

    selectedHospitalTenantId: {
      type: String,
      default: null
    },
    reviews: [reviewSchema],
    hasReviewed: { type: Boolean, default: false },

    supportTickets: [ticketSchema],

    selectedCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
