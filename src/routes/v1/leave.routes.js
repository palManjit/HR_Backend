import { Router } from "express";
import {
  createLeaveRequset,
  getAllLeaves,
  updateEmployeeLeaves,
  updateLeaveStatus,
} from "../../controllers/leave.controller.js";
import {
  adminMiddleware,
  authMiddleware,
  employeeMiddleware,
  managerMiddleware,
} from "../../middlewares/auth.middleware.js";

const router = Router();

router.use(authMiddleware);

router
  .route("/")
  .post(employeeMiddleware, createLeaveRequset)
  .get(getAllLeaves);
router.route("/:_id").patch(managerMiddleware, updateLeaveStatus);
router
  .route("/employees/:employeeId/leaves")
  .patch(adminMiddleware, updateEmployeeLeaves);

export default router;
