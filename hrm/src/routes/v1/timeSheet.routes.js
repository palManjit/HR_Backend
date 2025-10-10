import { Router } from "express";
import {
  createTimeSheetEntry,
  getAllMissingTimeSheets,
  getTimeSheetEntry,
  updateTimeSheetEntry,
} from "../../controllers/timeSheet.controller.js";
import {
  adminMiddleware,
  authMiddleware,
  employeeMiddleware,
  hrMiddleware,
  itMiddleware,
  managerMiddleware,
} from "../../middlewares/auth.middleware.js";

const router = Router();

router.use(authMiddleware);

router
  .route("/")
  .get(getTimeSheetEntry)
  .post(employeeMiddleware, createTimeSheetEntry);
router.route("/:timesheetId").patch(employeeMiddleware, updateTimeSheetEntry);
// router.route("/employee/:employeeId").get(getTimeSheetEntryByEmployeeId);
router
  .route("/missing")
  .get(
    // adminMiddleware,
    // hrMiddleware,
    // managerMiddleware,
    // itMiddleware,
    getAllMissingTimeSheets
  );

export default router;
