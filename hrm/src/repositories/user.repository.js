import { User } from "../models/user.model.js";

export const createUser = async (data) => {
  const user = (await User.create(data)).populate("department");

  return user;
};

export const findUserByPanOrAadhar = async (aadhar, pan) => {
  const user = await User.findOne({
    $or: [{ aadhar }, { pan }],
  }).populate("department");

  return user;
};

export const findUserByEmail = async (email) => {
  return await User.findOne({ email }).populate("department");
};

export const findUserByEmailPassword = async (email, password) => {
  const user = await User.findOne({
    $and: [{ email }, { password }],
  }).populate("department");

  return user;
};

export const findUserByPhone = async (phone) => {
  const user = await User.findOne({
    phone,
  }).populate("department");

  return user;
};

export const findUserById = async (id) => {
  return await User.findById(id).populate("department").select("-password");
};

export const updateCredentials = async (_id, data) => {
  const updatedUser = await User.findByIdAndUpdate(_id, data, {
    new: true,
  })
    .populate("department")
    .select("-password");

  return updatedUser;
};

export const updatePassword = async (_id, password) => {
  const updatedUser = await User.findByIdAndUpdate(
    _id,
    {
      password,
    },
    {
      new: true,
    }
  ).populate("department");

  return updatedUser;
};

export const getAllEmployees = async (
  page = 1,
  limit = 10,
  role,
  searchQuery
) => {
  const query = { role };

  if (searchQuery) {
    query.$or = [
      { name: { $regex: searchQuery, $options: "i" } },
      { email: { $regex: searchQuery, $options: "i" } },
    ];
  }

  const options = {
    page,
    limit,
    select: "-password",
    populate: "department",
    sort: { createdAt: -1 },
  };

  return await User.paginate(query, options);
};

export const deleteEmployeeById = async (_id) => {
  return await User.findByIdAndDelete(_id);
};

export const fetchAllActiveEmployees = async (options) => {
  return await User.find(options).select("_id name phone email employeeID");
};
