import mongoose from "mongoose";

const ApplicationSchema = new mongoose.Schema({
  userEmail: String,
  company: String,
  role: String,
  status: { type: String, default: "APPLIED" },
  emailDate: Date,
  threadId: { type: String, unique: true },
  subject: String,
  snippet: String,
  // NEW FIELD
  notes: { type: String, default: "" }
}, { timestamps: true });

export default mongoose.models.Application || mongoose.model("Application", ApplicationSchema);