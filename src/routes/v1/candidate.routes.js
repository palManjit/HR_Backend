import express from "express";
import {
  createCandidate,
  getAllCandidates,
  getCandidateById,
  updateCandidate,
  deleteCandidate,
} from "../../controllers/candidate.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { authorize } from "../../middlewares/role.middleware.js";

const router = express.Router();

// Public route (candidate apply)
router.post("/", createCandidate);

// HR only routes
router.get("/", authMiddleware, authorize("HR"), getAllCandidates);
router.get("/:id", authMiddleware, authorize("HR"), getCandidateById);
router.put("/:id", authMiddleware, authorize("HR"), updateCandidate);
router.delete("/:id", authMiddleware, authorize("HR"), deleteCandidate);

export default router;