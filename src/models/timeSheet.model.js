import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const timeSheetSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    login: {
      type: String,
      required: true,
    },
    logout: {
      type: String,
      required: true,
    },
    project: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    eod: {
      type: String,
    },
    durationHours: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

timeSheetSchema.plugin(mongoosePaginate);

export const TimeSheet = mongoose.model("TimeSheet", timeSheetSchema);
