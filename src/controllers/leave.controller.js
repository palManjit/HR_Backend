import {
  createLeaveService,
  fetchAllLeaveByMonthService,
  setLeavesService,
  updateLeaveStatusService,
} from "../services/leave.service.js";
import ApiResponse from "../utils/apiResponse.js";

export const createLeaveRequset = async (req, res) => {
  const { from, to, type, reason } = req.body;

  if (!from || !to || !type || !reason)
    return res
      .status(400)
      .json(new ApiResponse(400, "Please fill the required fields"));

  try {
    
    const result = await createLeaveService(
      req.user._id,
      from,
      to,
      type,
      reason
    );

    if (result === "not allowed")
      return res
        .status(403)
        .json(
          new ApiResponse(403, "Please select a future date for your leave")
        );

    if (result === "invalid")
      return res
        .status(403)
        .json(new ApiResponse(403, "End date cannot be before start date"));

    if (result === "exists")
      return res
        .status(409)
        .json(
          new ApiResponse(
            409,
            "You already have a leave in the selected date range."
          )
        );

    if (!result)
      return res
        .status(404)
        .json(new ApiResponse(404, "Failed to create leave"));

    return res
      .status(201)
      .json(new ApiResponse(201, "Leave application submitted", result));
  } catch (error) {
    console.log("Create leave error :: ", error);
    return res.status(500).json(new ApiResponse(500));
  }
};

export const updateLeaveStatus = async (req, res) => {
  const { status } = req.body;

  const { _id } = req.params;

  try {
    const result = await updateLeaveStatusService(_id, status);

    return res
      .status(200)
      .json(new ApiResponse(200, "Leave status updated successfully", result));
  } catch (error) {
    console.log("Leave request status update error :: ", error);
    return res.status(500).json(new ApiResponse(500));
  }
};

export const getAllLeaves = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const month = parseInt(req.query.month) - 1 || new Date().getMonth();
  const year = parseInt(req.query.year) || new Date().getFullYear();
  const employeeId = req.query.employeeId || null;

  try {
    const result = await fetchAllLeaveByMonthService({
      page,
      limit,
      month,
      year,
      employeeId,
    });

    if (result.length === 0)
      return res.status(404).json(new ApiResponse(404, "No leaves found"));

    return res
      .status(200)
      .json(new ApiResponse(200, "Leaves fetched successfully", result));
  } catch (error) {
    console.log("Fetch leave error :: ", error);
    return res.status(500).json(new ApiResponse(500));
  }
};

export const updateEmployeeLeaves = async (req, res) => {
  const { employeeId } = req.params;
  const { casual, medical, total } = req.body;

  try {
    // Validate input
    if (casual === undefined && medical === undefined) {
      return res.status(400).json({
        success: false,
        message: "Must provide either casual or medical leave count",
      });
    }

    // The total will be automatically calculated by the pre-save hook
    const updatedUser = await setLeavesService(employeeId, casual, medical, total);

    if (updatedUser === "not found") {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Leave balances updated successfully",
      data: {
        leaveBalance: updatedUser.leaveBalance,
      },
    });
  } catch (error) {
    console.error("Error updating leave balances:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update leave balances",
      error: error.message,
    });
  }
};
