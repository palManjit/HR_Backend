import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import { User } from "./user.model.js";

const leaveSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    from: {
      type: Date,
      required: true,
    },
    to: {
      type: Date,
      required: true,
    },
    duration: {
      type: Number,
      default: 1,
    },
    leaveType: {
      type: String,
      enum: ["casual", "medical", "planned"],
      default: "casual",
    },
    reason: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

// Auto-calculate duration when dates change
leaveSchema.pre("save", function (next) {
  if (this.isModified("from") || this.isModified("to")) {
    const diffTime = Math.abs(this.to - this.from);
    this.duration = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }
  next();
});

// Validate leave balance before creating or approving leave
leaveSchema.pre("save", async function (next) {
  if (this.isNew || (this.isModified("status") && this.status === "approved")) {
    const user = await User.findById(this.employee);

    if (user.leaveBalance[this.leaveType] < this.duration) {
      throw new Error(
        `Insufficient ${this.leaveType} leave balance. Available: ${
          user.leaveBalance[this.leaveType]
        } days`
      );
    }

    // Check for overlapping approved leaves
    const existingLeave = await mongoose.model("Leave").findOne({
      employee: this.employee,
      status: "approved",
      $or: [{ from: { $lte: this.to }, to: { $gte: this.from } }],
    });

    if (
      existingLeave &&
      (!this.isNew || existingLeave._id.toString() !== this._id.toString())
    ) {
      throw new Error(
        `Already have approved leave from ${existingLeave.from.toDateString()} to ${existingLeave.to.toDateString()}`
      );
    }
  }
  next();
});

// Handle leave approval/rejection
leaveSchema.post("save", async function (doc, next) {
  if (doc.isModified("status")) {
    const user = await User.findById(doc.employee);

    if (doc.status === "approved" && this.previous("status") !== "approved") {
      // Deduct from balance
      user.leaveBalance.total -= doc.duration;
      user.leaveBalance[doc.leaveType] -= doc.duration;
    } else if (
      doc.status !== "approved" &&
      this.previous("status") === "approved"
    ) {
      // Return days if approval is revoked
      user.leaveBalance.total += doc.duration;
      user.leaveBalance[doc.leaveType] += doc.duration;
    }

    await user.save();
  }
  next();
});

leaveSchema.plugin(mongoosePaginate);

export const Leave = mongoose.model("Leave", leaveSchema);
