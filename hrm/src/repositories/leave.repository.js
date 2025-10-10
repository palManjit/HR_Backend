import { Leave } from "../models/leave.model.js";

export const createLeave = async (data) => {
  return await Leave.create(data);
};

export const updateLeave = async (_id, status) => {
  return await Leave.findByIdAndUpdate(
    _id,
    {
      status,
    },
    {
      new: true,
    }
  );
};

export const fetchAllLeaveByMonth = async (query, page, limit) => {
  return await Leave.paginate(query, {
    page,
    limit,
    sort: { createdAt: -1 },
    populate: {
      path: "employee",
      select: "-password",
    },
  });
};

export const getLeaveByIdInRange = async (employee, from, to) => {
  const startOfDay = new Date(from);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(to);
  endOfDay.setHours(23, 59, 59, 999);

  return await Leave.findOne({
    employee,
    $or: [
      {
        from: { $lte: startOfDay },
        to: { $gte: endOfDay },
      },
      {
        from: { $gte: startOfDay, $lte: endOfDay },
      },
      {
        to: { $gte: startOfDay, $lte: endOfDay },
      },
    ],
  });
};

export const getAllLeavesInDateRange = async (start, end) => {
  return await Leave.aggregate([
    {
      $match: {
        status: "approved",
        $and: [{ from: { $lte: end } }, { to: { $gte: start } }],
      },
    },
    {
      $project: {
        employee: 1,
        from: 1,
        to: 1,
      },
    },
    {
      $group: {
        _id: "$employee",
        leavePeriods: { $push: { from: "$from", to: "$to" } },
      },
    },
  ]);
};
