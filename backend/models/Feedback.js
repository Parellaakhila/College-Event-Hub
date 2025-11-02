import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
  {
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event" },
    studentName: String,
    rating: Number,
    comments: String,
  },
  { timestamps: true }
);

export default mongoose.model("Feedback", feedbackSchema);
