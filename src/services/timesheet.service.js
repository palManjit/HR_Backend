import {
  getAllLeavesInDateRange,
  getLeaveByIdInRange,
} from "../repositories/leave.repository.js";
import {
  createTimeSheet,
  fetchAllTimeSheet,
  fetchAllTimeSheetByDate,
  fetchTimeSheetsInRange,
  updateTimeSheet,
} from "../repositories/timeSheet.repository.js";
import { fetchAllActiveEmployees } from "../repositories/user.repository.js";

export const createTimeSheetEntryService = async (data) => {
  try {
    const { date, employeeId } = data;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Convert input date to Date object and set to midnight for accurate comparison
    const inputDate = new Date(date);

    // Prevent creating timesheet for today or future dates
    if (inputDate >= today) {
      return "not allowed";
    }

    // check if leave on that day
    const leave = await getLeaveByIdInRange(employeeId, inputDate, inputDate);
    console.log("Leave :: ", leave);

    if (leave && leave.status === "approved") {
      return "on leave";
    }
    // check if already exists
    const result = await fetchAllTimeSheetByDate(date, employeeId);

    if (result.length > 0) return "exists";

    return await createTimeSheet(data);
  } catch (error) {
    console.error("Create timesheet service error :: ", error);
    throw error;
  }
};

export const fetchTimeSheetService = async ({
  page = 1,
  limit = 10,
  employeeId,
  day,
  month,
  year,
}) => {
  try {
    const now = new Date();
    const m = month !== null && month !== undefined ? month : now.getMonth();
    const y = year !== null && year !== undefined ? year : now.getFullYear();

    // Determine date range
    let startDate, endDate;

    if (day !== null && day !== undefined) {
      startDate = new Date(Date.UTC(y, m, day, 0, 0, 0));
      endDate = new Date(Date.UTC(y, m, day, 23, 59, 59, 999));
    } else {
      startDate = new Date(Date.UTC(y, m, 1, 0, 0, 0)); // 1st day of month
      endDate = new Date(Date.UTC(y, m + 1, 0, 23, 59, 59, 999)); // Last day of month
    }

    const query = {
      date: { $gte: startDate, $lte: endDate },
    };

    if (employeeId) {
      query.employeeId = employeeId;
    }

    console.log(query);

    return await fetchAllTimeSheet(page, limit, query);
  } catch (error) {
    console.error("Fetch timesheet service error :: ", error);
    throw error;
  }
};

export const editTimeSheetService = async (timesheetId, data) => {
  try {
    return await updateTimeSheet(timesheetId, data);
  } catch (error) {
    console.log("Timesheet edit error :: ", error);
    throw error;
  }
};

export const getMissingTimeSheetService = async (startDate, endDate) => {
  try {
    const start = new Date(startDate);
    const end = new Date(endDate);

    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    // fetch all employees
    const employees = await fetchAllActiveEmployees({
      status: "accepted",
      role: { $in: ["employee"] },
    });

    // get all timesheet in the given range
    const timeSheets = await fetchTimeSheetsInRange(start, end);

    // get all approved leaves
    const leaves = await getAllLeavesInDateRange(start, end);

    const allDates = [];
    const currentDate = new Date(start);
    currentDate.setDate(currentDate.getDate() + 1);
    end.setDate(end.getDate() + 1);

    while (currentDate <= end) {
      allDates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    const result = await Promise.all(
      employees.map(async (employee) => {
        const empTimeSheets = timeSheets.find((t) =>
          t._id.equals(employee._id)
        );

        const filledDates = empTimeSheets?.dates || [];

        const empLeaves = leaves.find((l) => l._id.equals(employee._id));

        const leavePeriods = empLeaves?.leavePeriods || [];

        const missingDates = allDates.filter((date) => {
          const dateStr = date.toISOString().split("T")[0];

          // Check if timesheet exists
          const hasTimesheet = filledDates.some(
            (d) => d.toISOString().split("T")[0] === dateStr
          );

          const onLeave = leavePeriods.some((period) => {
            const leaveStart = new Date(period.from).setHours(0, 0, 0, 0);
            const leaveEnd = new Date(period.to).setHours(23, 59, 59, 999);
            return date >= leaveStart && date <= leaveEnd;
          });

          return !hasTimesheet && !onLeave;
        });

        return {
          employeeId: employee._id,
          employeeName: employee.name,
          employeeID: employee.employeeID,
          missingDates: missingDates.map(
            (date) => date.toISOString().split("T")[0]
          ),
        };
      })
    );

    return result.filter((emp) => emp.missingDates.length > 0);
  } catch (error) {
    console.log("Department edit error :: ", error);
    throw error;
  }
};
