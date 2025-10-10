import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const departmentSchema = new mongoose.Schema(
  {
    department: {
      type: String,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

departmentSchema.plugin(mongoosePaginate);

export const Department = mongoose.model("Department", departmentSchema);
