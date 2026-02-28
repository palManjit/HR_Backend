import { Router } from "express";
import {
  addDepartment,
  editDepartmentName,
  getAllDepartments,
} from "../../controllers/department.controller.js";
import {
  authMiddleware,
  hrMiddleware,
} from "../../middlewares/auth.middleware.js";

const router = Router();

router
  .route("/")
  .get(getAllDepartments)
  .post(authMiddleware, hrMiddleware, addDepartment);

router
  .route("/:departmentId")
  .patch(authMiddleware, hrMiddleware, editDepartmentName);

export default router;
