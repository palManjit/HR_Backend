import jwt from "jsonwebtoken";
import {
  deleteEmployeeById,
  findUserById,
  getAllEmployees,
  updateCredentials,
} from "../repositories/user.repository.js";
import {
  loginUserService,
  registerUserService,
  setCredentialService,
  updatePasswordService,
} from "../services/user.service.js";
import ApiResponse from "../utils/apiResponse.js";

export const registerUser = async (req, res) => {
  const {
    name,
    phone,
    // additionalPhoneNumbers,
    aadharNo,
    panNo,
    bloodGroup,
    department,
  } = req.body;

  const certificateFiles = req.files?.certificate || [];
  const certificatePaths = certificateFiles.map((file) => file.path);

  const photo = req.files?.photo?.[0]?.path;
  const pvc = req.files?.pvc?.[0]?.path;
  const aadhar = req.files?.aadhar?.[0]?.path;
  const pan = req.files?.pan?.[0]?.path;

  if (!name || !phone || !aadharNo || !panNo || !department)
    return res
      .status(400)
      .json(new ApiResponse(400, "Please fill the required fields"));

  try {
   // const parsedAdditionalPhoneNumbers = JSON.parse(additionalPhoneNumbers);

    const result = await registerUserService(
      {
        name,
        phone,
       // additionalPhoneNumbers: parsedAdditionalPhoneNumbers,
        aadharNo,
        panNo,
        bloodGroup,
        department,
        status: "pending",
      },
      {
        certificate: certificatePaths,
        photo,
        pvc,
        aadhar,
        pan,
      }
    );

    if (result === "exists")
      return res.status(409).json(new ApiResponse(409, "User already exists"));

    if (!result)
      return res
        .status(404)
        .json(new ApiResponse(404, "Failed to register user"));

    return res
      .status(201)
      .json(new ApiResponse(201, "User created successfully", result));
  } catch (error) {
    console.log("Create user error :: ", error);
    return res.status(500).json(new ApiResponse(500, error.message));
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res
      .status(400)
      .json(new ApiResponse(400, "Please fill the required fields"));

  try {
    const result = await loginUserService(email, password);

    if (result === "not-exists")
      return res.status(404).json(new ApiResponse(404, "Invalid credentials"));

    if (!result)
      return res.status(404).json(new ApiResponse(404, "Failed to login user"));

    const token = jwt.sign(
      {
        _id: result._id,
        name: result.name,
        role: result.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.status(200);
    res
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.MODE === "production",
        sameSite: process.env.MODE === "production" ? "None" : "Lax",
        path: "/",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .json(new ApiResponse(200, "Login successfull", { data: result, token }));
  } catch (error) {
    console.log("Login user error :: ", error);
    return res.status(500).json(new ApiResponse(500));
  }
};

export const setEmailPasswordID = async (req, res) => {
  const { email, password, employeeID } = req.body;

  const { _id } = req.params;

  // if (!email || !password || employeeID || !_id)
  //   return res
  //     .status(400)
  //     .json({
  //       success: false,
  //       message: "Email, password, employeeID are required",
  //     });

  try {
    const result = await setCredentialService(_id, email, password, employeeID);

    if (result === "not-exists")
      return res.status(404).json(new ApiResponse(404, "Invalid employeeID"));

    if (result === "taken")
      return res.status(403).json(new ApiResponse(403, "Email already taken"));

    if (!result)
      return res.status(400).json(new ApiResponse(400, "Failed to login user"));

    res
      .status(200)
      .json(new ApiResponse(200, "Credential updated successfully."));
  } catch (error) {
    console.log("Email password set error :: ", error);
    return res.status(500).json(new ApiResponse(500));
  }
};

export const updateEmployeeRole = async (req, res) => {
  const { role } = req.body;

  const { _id } = req.params;
Department
  if (!role || !_id) throw new Error("Role is required");

  try {
    const result = await updateCredentials(_id, { role });

    if (!result)
      return res.status(400).json(new ApiResponse(400, "Role update failed"));

    res
      .status(200)
      .json(new ApiResponse(200, "Role updated successfully.", result));
  } catch (error) {
    console.log("Role update error :: ", error);
    return res.status(500).json(new ApiResponse(500));
  }
};

export const updateCandidateStatus = async (req, res) => {
  const { status, role } = req.body;

  const { _id } = req.params;

  if (!status || !_id)
    return res.status(400).json(new ApiResponse(400, "Status is required"));

  try {
    const query = {
      status,
      role: status === "accepted" ? "employee" : "candidate",
    };

    const result = await updateCredentials(_id, query);

    if (!result)
      return res.status(400).json(new ApiResponse(400, "Status update failed"));

    res
      .status(200)
      .json(new ApiResponse(200, "Status updated successfully.", result));
  } catch (error) {
    console.log("Status update error :: ", error);
    return res.status(500).json(new ApiResponse(500));
  }
};

export const updatePassword = async (req, res) => {
  const { newPassword } = req.body;

  if (!newPassword)
    return res
      .status(400)
      .json(new ApiResponse(400, "New password is required"));

  try {
    const result = await updatePasswordService(req.user._id, newPassword);

    if (!result)
      return res
        .status(400)
        .json(new ApiResponse(400, "Password update failed"));

    res
      .status(200)
      .json(new ApiResponse(200, "Password updated successfully", result));
  } catch (error) {
    console.log("Password edit error :: ", error);
    return res.status(500).json(new ApiResponse(500));
  }
};

export const logoutUser = async (req, res) => {
  try {
    res
      .status(200)
      .clearCookie("token", {
        httpOnly: true,
        secure: process.env.MODE === "developement",
        sameSite: "None",
      })
      .json(new ApiResponse(200, "Logout successfull"));
  } catch (error) {
    console.log("Logout error :: ", error);
    return res.status(500).json(new ApiResponse(500));
  }
};

export const currentUser = async (req, res) => {
  try {
    res
      .status(200)
      .json(
        new ApiResponse(200, "Current user fetched successfully", req.user)
      );
  } catch (error) {
    console.log("Current user fetch error :: ", error);
    return res.status(500).json(new ApiResponse(500));
  }
};

export const fetchAllEmployees = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const role = req.query.role || "employee";
  const { query } = req.query;

  try {
    const result = await getAllEmployees(page, limit, role, query);

    if (result.length === 0)
      return res.status(404).json(new ApiResponse(404, "No employees found"));

    if (!result)
      return res
        .status(400)
        .json(new ApiResponse(400, "Failed to fetch employees"));

    res
      .status(200)
      .json(new ApiResponse(200, "Employees fetched successfully", result));
  } catch (error) {
    console.log("Fetch employees error :: ", error);
    return res.status(500).json(new ApiResponse(500));
  }
};

export const fetchEmployeeById = async (req, res) => {
  const { _id } = req.params;

  if (!_id)
    return res
      .status(400)
      .json(new ApiResponse(400, "Employee ID is required"));

  try {
    const result = await findUserById(_id);

    if (result.length === 0)
      return res.status(404).json(new ApiResponse(404, "Employee not found"));

    if (!result)
      return res
        .status(400)
        .json(new ApiResponse(400, "Failed to fetch employee"));

    res
      .status(200)
      .json(new ApiResponse(200, "Employee fetched successfully", result));
  } catch (error) {
    console.log("Fetch employee error :: ", error);
    return res.status(500).json(new ApiResponse(500));
  }
};

export const deleteEmployee = async (req, res) => {
  const { _id } = req.params;

  if (!_id)
    return res
      .status(400)
      .json(new ApiResponse(400, "Employee ID is required"));

  try {
    await deleteEmployeeById(_id);

    return res
      .status(200)
      .json(new ApiResponse(200, "Employee deleted successfully"));
  } catch (error) {
    console.log("Employee delete error :: ", error);
    return res.status(500).json(new ApiResponse(500));
  }
};
