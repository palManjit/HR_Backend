import { Department } from "../models/department.model.js";

export const createDepartment = async (department) => {
  return await Department.create({ department });
};

export const fetchDepartments = async () => {
  return await Department.find();
};

export const findDepartmentByName = async (department) => {
  return await Department.find({
    department: { $regex: `^${department}$`, $options: "i" },
  });
};

export const editDepartment = async (_id, department) => {
  return await Department.findByIdAndUpdate(
    _id,
    {
      department,
    },
    {
      new: true,
    }
  );
};
