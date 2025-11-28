import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Admin or Employee who created
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Category", categorySchema);
