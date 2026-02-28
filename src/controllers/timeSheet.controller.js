import { updateTimeSheet } from "../repositories/timeSheet.repository.js";
import {
  createTimeSheetEntryService,
  fetchTimeSheetService,
  getMissingTimeSheetService,
} from "../services/timesheet.service.js";
import ApiResponse from "../utils/apiResponse.js";

export const createTimeSheetEntry = async (req, res) => {
  const { date, login, logout, project, description, eod, durationHours } =
    req.body;

  if (!date || !login || !logout || !durationHours)
    return res
      .status(400)
      .json(new ApiResponse(400, "Please fill the required fields"));

  try {
    const data = {
      employeeId: req.user._id,
      date,
      login,
      logout,
      project,
      description,
      eod,
      durationHours,
    };

    const result = await createTimeSheetEntryService(data);

    if (result === "not allowed")
      return res
        .status(403)
        .json(
          new ApiResponse(
            403,
            "You can update timesheet only after the current day"
          )
        );

    if (result === "on leave")
      return res
        .status(403)
        .json(new ApiResponse(403, `You was on leave on ${date}`));

    if (result === "exists")
      return res
        .status(409)
        .json(
          new ApiResponse(
            409,
            "You already have updated timesheet on the selected date"
          )
        );

    if (!result)
      return res
        .status(404)
        .json(new ApiResponse(404, "Failed to create timesheet entry"));

    return res
      .status(201)
      .json(
        new ApiResponse(201, "Timesheet entry created successfully", result)
      );
  } catch (error) {
    console.log("Timesheet create error :: ", error);
    return res.status(500).json(new ApiResponse(500));
  }
};

export const updateTimeSheetEntry = async (req, res) => {
  const { project, description } = req.body;
  const { timesheetId } = req.params;

  try {
    const data = { project, description };

    const result = await updateTimeSheet(timesheetId, data);

    return res
      .status(200)
      .json(new ApiResponse(200, "Timesheet updated successfully", result));
  } catch (error) {
    console.log("Edit timesheet error :: ", error);
    return res.status(500).json(new ApiResponse(500));
  }
};

export const getTimeSheetEntry = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 31;
  const employeeId = req.query.employeeId; // optional

  // Date parameters (day, month, year are optional)
  const day = req.query.day ? parseInt(req.query.day) : null;
  const month = req.query.month ? parseInt(req.query.month) - 1 : null; // 0-indexed
  const year = req.query.year ? parseInt(req.query.year) : null;

  try {
    const result = await fetchTimeSheetService({
      page,
      limit,
      employeeId, // can be undefined
      day,
      month,
      year,
    });

    if (result.length === 0)
      return res
        .status(404)
        .json(new ApiResponse(404, "No timesheet entry found"));

    if (!result)
      return res
        .status(404)
        .json(new ApiResponse(404, "No timesheet entry found"));

    return res
      .status(200)
      .json(new ApiResponse(200, "Timesheet fetched successfully", result));
  } catch (error) {
    console.error("Fetch timesheet error :: ", error);
    return res.status(500).json(new ApiResponse(500));
  }
};

export const getAllMissingTimeSheets = async (req, res) => {
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    return res
      .status(400)
      .json(new ApiResponse(400, "Both startDate and endDate are required"));
  }

  try {
    const result = await getMissingTimeSheetService(startDate, endDate);

    return res
      .status(200)
      .json(new ApiResponse(200, "Timesheet fetched Successfully", result));
  } catch (error) {
    console.error("Fetch timesheet error :: ", error);
    return res.status(500).json(new ApiResponse(500));
  }
};
