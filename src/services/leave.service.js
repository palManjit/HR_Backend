import mongoose from "mongoose";
import {
  createLeave,
  fetchAllLeaveByMonth,
  getLeaveByIdInRange,
  updateLeave,
} from "../repositories/leave.repository.js";
import { Leave } from "../models/leave.model.js";
import { User } from "../models/user.model.js";

export const createLeaveService = async (_id, from, to, type, reason) => {
  try {
    const startDate = new Date(from);
    const endDate = new Date(to);

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Strip time

    const onlyStart = new Date(startDate);
    onlyStart.setHours(0, 0, 0, 0); // Strip time

    if (onlyStart < today) return "not allowed";
    if (endDate < startDate) return "invalid";

    const existingLeave = await getLeaveByIdInRange(_id, startDate, endDate);
    if (existingLeave) return "exists";

    const diffInMs = endDate - startDate;
    const duration = diffInMs / (1000 * 60 * 60 * 24) + 1;

    const data = {
      employee: _id,
      from: startDate,
      to: endDate,
      duration,
      leaveType: type,
      reason,
    };

    return await createLeave(data);
  } catch (error) {
    console.log("Create leave service error :: ", error);
    throw error;
  }
};

export const updateLeaveStatusService = async (_id, status) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. Get the current leave document first
    const currentLeave = await Leave.findById(_id).session(session);
    if (!currentLeave) {
      throw new Error("Leave not found");
    }

    // 2. Check if we're changing to approved status
    if (status === "approved") {
      const user = await User.findById(currentLeave.employee).session(session);

      // Validate leave balance
      if (user.leaveBalance[currentLeave.leaveType] < currentLeave.duration) {
        throw new Error(`Insufficient ${currentLeave.leaveType} leave balance`);
      }

      // Check if this was previously approved (to prevent double deduction)
      if (currentLeave.status === "approved") {
        throw new Error("Leave is already approved");
      }
    }

    // 3. Handle status change from approved to rejected/cancelled
    if (currentLeave.status === "approved" && status !== "approved") {
      const user = await User.findById(currentLeave.employee).session(session);

      // Return the leave days
      user.leaveBalance.total += currentLeave.duration;
      user.leaveBalance[currentLeave.leaveType] += currentLeave.duration;
      await user.save({ session });
    }

    // 4. Update the leave status
    const updatedLeave = await Leave.findByIdAndUpdate(
      _id,
      { status },
      { new: true, session }
    );

    // 5. If new status is approved, deduct from balance
    if (status === "approved" && currentLeave.status !== "approved") {
      const user = await User.findByIdAndUpdate(
        currentLeave.employee,
        {
          $inc: {
            "leaveBalance.total": -currentLeave.duration,
            [`leaveBalance.${currentLeave.leaveType}`]: -currentLeave.duration,
          },
        },
        { new: true, session }
      );

      // Verify the deduction didn't make balance negative
      if (user.leaveBalance.total < 0) {
        throw new Error("Leave balance cannot be negative");
      }
    }

    await session.commitTransaction();
    return updatedLeave;
  } catch (error) {
    await session.abortTransaction();
    console.error("Update leave status service error :: ", error);

    // Convert specific errors to user-friendly messages
    if (error.message.includes("Insufficient")) {
      throw new Error(error.message);
    }
    if (error.message.includes("already approved")) {
      throw new Error("This leave has already been approved");
    }

    throw new Error("Failed to update leave status");
  } finally {
    session.endSession();
  }
};

export const fetchAllLeaveByMonthService = async ({
  page = 1,
  limit = 10,
  month,
  year,
  employeeId,
}) => {
  try {
    // Calculate start and end of the given month
    const startOfMonth = new Date(year, month, 1); // month is 0-based
    const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59, 999);

    const query = {
      from: {
        $gte: startOfMonth,
        $lte: endOfMonth,
      },
    };

    if (employeeId) {
      query.employee = employeeId;
    }

    return await fetchAllLeaveByMonth(query, page, limit);
  } catch (error) {
    console.error("Fetch leave service error :: ", error);
    return null;
  }
};

export const setLeavesService = async (employeeId, casual, medical, total) => {
  try {
    const updateFields = {};

    if (casual !== undefined) {
      updateFields["leaveBalance.casual"] = casual;
    }
    if (medical !== undefined) {
      updateFields["leaveBalance.medical"] = medical;
    }

    updateFields["leaveBalance.total"] = total;

    // The total will be automatically calculated by the pre-save hook
    const updatedUser = await User.findByIdAndUpdate(
      employeeId,
      { $set: updateFields },
      { new: true }
    );

    if (!updatedUser) {
      return "not found";
    }

    return updatedUser;
  } catch (error) {}
};
