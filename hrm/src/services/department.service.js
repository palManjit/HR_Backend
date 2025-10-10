import {
  createDepartment,
  editDepartment,
  findDepartmentByName,
} from "../repositories/department.repository.js";

export const createDepartmentService = async (department) => {
  try {
    const isExist = await findDepartmentByName(department.trim().toLowerCase());

    if (isExist.length > 0) return "exists";

    const result = await createDepartment(department.trim().toLowerCase());

    return result;
  } catch (error) {
    console.log("Department create error :: ", error);
    throw error;
  }
};

export const editDepartmentService = async (departmentId, department) => {
  try {
    const isExist = await findDepartmentByName(department.trim().toLowerCase());

    if (isExist.length > 0) return "exists";

    const result = await editDepartment(departmentId, department);

    return result;
  } catch (error) {
    console.log("Department edit error :: ", error);
    throw error;
  }
};
