import jwt from "jsonwebtoken";
import { findUserById } from "../repositories/user.repository.js";

/* ============================= */
/*   MAIN AUTH MIDDLEWARE        */
/* ============================= */

export const authMiddleware = async (req, res, next) => {
  try {
    const bearerHeader = req.header("Authorization");

    const token =
      req.cookies?.token ||
      (bearerHeader?.startsWith("Bearer ")
        ? bearerHeader.split(" ")[1]
        : undefined);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: No token provided",
      });
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    const user = await findUserById(decodedToken._id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

/* ============================= */
/*   ROLE BASED MIDDLEWARE       */
/* ============================= */

const roleMiddleware = (role) => {
  return (req, res, next) => {
    try {
      if (!req.user || req.user.role !== role) {
        return res.status(403).json({
          success: false,
          message: `Forbidden: Access restricted to ${role}`,
        });
      }
      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: `${role} middleware error`,
      });
    }
  };
};

export const adminMiddleware = roleMiddleware("admin");
export const employeeMiddleware = roleMiddleware("employee");
export const managerMiddleware = roleMiddleware("manager");
export const hrMiddleware = roleMiddleware("hr");
export const itMiddleware = roleMiddleware("it");
export const candidateMiddleware = roleMiddleware("candidate");