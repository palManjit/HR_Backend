import mongoose from "mongoose";

const candidateSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: String,
      required: true,
    },
    position: {
      type: String,
      required: true,
    },
    experience: {
      type: Number,
      default: 0,
    },
    resumeUrl: {
      type: String,
    },
    status: {
      type: String,
      enum: ["APPLIED", "INTERVIEW", "SELECTED", "REJECTED"],
      default: "APPLIED",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Candidate", candidateSchema);