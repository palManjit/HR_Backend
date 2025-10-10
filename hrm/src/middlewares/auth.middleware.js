import jwt from "jsonwebtoken";
import { findUserById } from "../repositories/user.repository.js";

export const authMiddleware = async (req, res, next) => {
  try {
    // console.log("token", req.cookies?.token);
    const bearerHeader = req.header("Authorization");
    const token =
      req.cookies?.token ||
      (bearerHeader?.startsWith("Bearer ")
        ? bearerHeader.split(" ")[1]
        : undefined);
    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized: No token provided" });
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    const user = await findUserById(decodedToken._id);

    // console.log("Req user :: ", user);

    if (!user)
      return res.status(401).json({
        success: false,
        message: "Unauthorized access",
      });

    req.user = user;

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Auth middleware error",
    });
  }
};

export const adminMiddleware = async (req, res, next) => {
  try {
    const token =
      req.cookies?.token || req.header("Authorization")?.replace("Bearer ", "");

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    if (decodedToken.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Access restricted to admin",
      });
    }

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Admin middleware error",
    });
  }
};

export const employeeMiddleware = async (req, res, next) => {
  try {
    const token =
      req.cookies?.token || req.header("Authorization")?.replace("Bearer ", "");

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    if (decodedToken.role !== "employee") {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Access restricted to employee",
      });
    }

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Employee middleware error",
    });
  }
};

export const managerMiddleware = async (req, res, next) => {
  try {
    const token =
      req.cookies?.token || req.header("Authorization")?.replace("Bearer ", "");

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    if (decodedToken.role !== "manager") {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Access restricted to manager",
      });
    }

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Manager middleware error",
    });
  }
};

export const hrMiddleware = async (req, res, next) => {
  try {
    const token =
      req.cookies?.token || req.header("Authorization")?.replace("Bearer ", "");

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    if (decodedToken.role !== "hr") {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Access restricted to hr",
      });
    }

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "HR middleware error",
    });
  }
};

export const itMiddleware = async (req, res, next) => {
  try {
    const token =
      req.cookies?.token || req.header("Authorization")?.replace("Bearer ", "");

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    if (decodedToken.role !== "it") {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Access restricted to it",
      });
    }

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "IT middleware error",
    });
  }
};
 
export const candidateMiddleware = async (req, res, next) => {
  try {
    const token =
      req.cookies?.token || req.header("Authorization")?.replace("Bearer ", "");

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    if (decodedToken.role !== "candidate") {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Access restricted to candidate",
      });
    }

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Candidate middleware error",
    });
  }
};
