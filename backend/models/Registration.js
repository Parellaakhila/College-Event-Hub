import mongoose from "mongoose";

const registrationSchema = new mongoose.Schema(
  {
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event" },
    studentName: String,
    studentEmail: String,
    collegeName: String,
    status: { type: String, default: "Pending" }, // Pending, Approved, Rejected
  },
  { timestamps: true }
);

export default mongoose.model("Registration", registrationSchema);
