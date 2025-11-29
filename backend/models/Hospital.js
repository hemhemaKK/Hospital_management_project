const mongoose = require("mongoose");

const hospitalSchema = new mongoose.Schema(
  {
    tenantId: { type: String, unique: true, required: true },
    firstName: { type: String },
    lastName: { type: String },
    name: { type: String, required: true },
    address: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    licenseNumber: { type: String, unique: true, required: true },
    categories: [
  {
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    name: { type: String, required: true },
    description: { type: String },
    createdAt: { type: Date, default: Date.now }
  }
],

    // NEW FIELDS (FOR LOGIN)
    hospitalName: { type: String, unique: true },
    password: { type: String, required: true },
    passwordHistory: [{ type: String }],

    // To identify it is a hospital account
    isHospital: { type: Boolean, default: false },

    // Hospital admin role
    role: { type: String, default: "admin" },

    status: {
      type: String,
      enum: ["PENDING", "VERIFIED", "ACTIVE", "SUSPENDED", "INACTIVE"],
      default: "PENDING",
    },

    createdAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Hospital", hospitalSchema);
