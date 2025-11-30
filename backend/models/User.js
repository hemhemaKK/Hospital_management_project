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

const prescriptionSchema = new mongoose.Schema({
  medicineName: { type: String, required: true },
  dosage: { type: String, required: true },
  duration: { type: String, required: true },
  notes: { type: String, default: "" },
  prescribedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now }
});

const reportSchema = new mongoose.Schema({
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  content: { type: String, default: "" },
  updatedAt: { type: Date }
});

const appointmentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  nurse: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },

  category: { type: mongoose.Schema.Types.ObjectId },
  hospital: { type: mongoose.Schema.Types.ObjectId, ref: "Hospital" },

  date: String,
  time: String,
  description: String,

  status: {
    type: String,
    enum: [
      "PENDING",
      "DOCTOR_ACCEPTED",
      "NURSE_ASSIGNED",
      "NURSE_COMPLETED",
      "DOCTOR_COMPLETED",
      "REJECTED"
    ],
    default: "PENDING"
  },

  report: reportSchema,
  prescription: [prescriptionSchema],

  createdAt: { type: Date, default: Date.now }
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

    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },

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
      type: mongoose.Schema.Types.ObjectId
    },

    // ALL APPOINTMENTS CONNECTED TO THIS USER
    appointments: [appointmentSchema]
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
