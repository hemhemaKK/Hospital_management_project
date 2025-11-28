import mongoose from "mongoose";

const complaintSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    subCategory: { type: mongoose.Schema.Types.ObjectId, ref: "SubCategory" },
    description: { type: String, required: true },
    problem:{type:String, required:true},
    images: [{ type: String }],
    location: {
      lat: Number,
      lng: Number,
      address: String,
    },
    assignedEmployee: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Resolved"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Complaint", complaintSchema);
