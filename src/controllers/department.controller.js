import { fetchDepartments } from "../repositories/department.repository.js";
import {
  createDepartmentService,
  editDepartmentService,
} from "../services/department.service.js";
import ApiResponse from "../utils/apiResponse.js";

export const addDepartment = async (req, res) => {
  const { department } = req.body;

  if (!department)
    return res.status(400).json(new ApiResponse(400, "Fill department field"));

  try {
    const result = await createDepartmentService(department);

    if (result === "exists")
      return res
        .status(409)
        .json(new ApiResponse(400, "Department already exists"));

    if (!result)
      return res
        .status(404)
        .json(new ApiResponse(404, "Failed to create department"));

    return res
      .status(201)
      .json(new ApiResponse(201, "Department created successfully", result));
  } catch (error) {
    console.log("Add department error :: ", error);
    res.status(500).json(new ApiResponse(500));
  }
};

export const getAllDepartments = async (req, res) => {
  try {
    const result = await fetchDepartments();

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          result.length === 0
            ? "No departments found"
            : "Departments fetched successfully",
          result
        )
      );
  } catch (error) {
    console.log("Department fetch error :: ", error);
    return res.status(500).json(new ApiResponse(500));
  }
};

export const editDepartmentName = async (req, res) => {
  const { departmentId } = req.params;
  const { department } = req.body;

  if (!departmentId)
    return res.status(400).json({
      success: false,
      message: "DepartmentID is required",
    });

  try {
    const result = await editDepartmentService(departmentId, department);

    if (result === "exists")
      return res
        .status(409)
        .json(new ApiResponse(400, "Department already exists"));

    if (!result)
      return res
        .status(404)
        .json(new ApiResponse(404, "Failed to update department"));

    return res
      .status(201)
      .json(new ApiResponse(201, "Department updated successfully", result));
  } catch (error) {
    console.log("Department edit error :: ", error);
    res.status(500).json(new ApiResponse(500));
  }
};
