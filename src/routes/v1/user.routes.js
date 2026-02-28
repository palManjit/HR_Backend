import { Router } from "express";
import {
  currentUser,
  deleteEmployee,
  fetchAllEmployees,
  fetchEmployeeById,
  loginUser,
  logoutUser,
  registerUser,
  setEmailPasswordID,
  updateCandidateStatus,
  updatePassword,
} from "../../controllers/user.controller.js";
import {
  authMiddleware,
  employeeMiddleware,
  hrMiddleware,
  itMiddleware,
} from "../../middlewares/auth.middleware.js";
import { upload } from "../../middlewares/multer.middleware.js";

const router = Router();

router.route("/").get(fetchAllEmployees);
router.route("/:_id").get(fetchEmployeeById).delete(deleteEmployee);
router.route("/register").post(
  upload.fields([
    { name: "certificate", maxCount: 5 },
    { name: "photo", maxCount: 1 },
    { name: "pvc", maxCount: 1 },
    { name: "aadhar", maxCount: 1 },
    { name: "pan", maxCount: 1 },
  ]),
  registerUser
);
router.route("/login").post(loginUser);
router
  .route("/credentials/:_id")
  .patch(authMiddleware, itMiddleware, setEmailPasswordID);
// router.route("/role/:_id").patch(authMiddleware, updateEmployeeRole);
router
  .route("/status/:_id")
  .patch(authMiddleware, hrMiddleware, updateCandidateStatus);
router
  .route("/update-password")
  .patch(authMiddleware, employeeMiddleware, updatePassword);
router.route("/logout").post(authMiddleware, logoutUser);
router.route("/current/me").get(authMiddleware, currentUser);

export default router;
