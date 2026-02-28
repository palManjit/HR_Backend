import { TimeSheet } from "../models/timeSheet.model.js";

export const createTimeSheet = async (data) => {
  return (await TimeSheet.create(data)).populate("employeeId", "-password");
};

export const updateTimeSheet = async (_id, data) => {
  return await TimeSheet.findByIdAndUpdate(_id, data, {
    new: true,
  }).populate("employeeId", "-password");
};

export const fetchAllTimeSheet = async (page = 1, limit = 10, query) => {
  const options = {
    page,
    limit,
    sort: { date: 1 },
    populate: {
      path: "employeeId",
      select: "-password",
      populate: {
        path: "department",
      },
    },
  };

  return await TimeSheet.paginate(query, options);
};

export const fetchAllTimeSheetByDate = async (date, employeeId) => {
  return await TimeSheet.find({
    date: new Date(date),
    employeeId,
  }).populate("employeeId", "-password");
};

export const fetchTimeSheetsInRange = async (start, end) => {
  return await TimeSheet.aggregate([
    {
      $match: {
        date: { $gte: start, $lte: end },
      },
    },
    {
      $group: {
        _id: "$employeeId",
        dates: { $addToSet: "$date" },
      },
    },
  ]);
};
