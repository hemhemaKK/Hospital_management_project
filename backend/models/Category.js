import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },

  tenantId: { type: String, required: true },   // ⭐ ADDED

  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Category", categorySchema);
