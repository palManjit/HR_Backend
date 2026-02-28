import {
  createUser,
  findUserByEmail,
  findUserByEmailPassword,
  findUserById,
  findUserByPanOrAadhar,
  findUserByPhone,
  getAllEmployees,
  updateCredentials,
  updatePassword,
} from "../repositories/user.repository.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import fs from "fs";

export const registerUserService = async (data, files) => {
  try {
    const isAlreadyExistsWithEmail = await findUserByPanOrAadhar(
      data.aadharNo,
      data.panNo
    );

    const isAlreadyExistsWithPhone = await findUserByPhone(data.phone);

    if (isAlreadyExistsWithEmail || isAlreadyExistsWithPhone) {
      // Clean up uploaded files
      try {
        if (Array.isArray(files.certificate)) {
          files.certificate.forEach(
            (filePath) => fs.existsSync(filePath) && fs.unlinkSync(filePath)
          );
        } else if (files.certificate && fs.existsSync(files.certificate)) {
          fs.unlinkSync(files.certificate);
        }

        if (files.photo && fs.existsSync(files.photo)) {
          fs.unlinkSync(files.photo);
        }

        if (files.pvc && fs.existsSync(files.pvc)) {
          fs.unlinkSync(files.pvc);
        }

        if (files.aadhar && fs.existsSync(files.aadhar)) {
          fs.unlinkSync(files.aadhar);
        }

        if (files.pan && fs.existsSync(files.pan)) {
          fs.unlinkSync(files.pan);
        }
      } catch (cleanupError) {
        console.warn("File cleanup error:", cleanupError.message);
      }

      return "exists";
    }

    // Upload photo (if exists)
    let uploadedPhotoUrl = "";
    if (files.photo) {
      const uploaded = await uploadToCloudinary(files.photo);
      uploadedPhotoUrl = uploaded?.secure_url || "";
    }

    // Upload pvc (if exists)
    let uploadedPvcUrl = "";
    if (files.pvc) {
      const uploaded = await uploadToCloudinary(files.pvc);
      uploadedPvcUrl = uploaded?.secure_url || "";
    }

    // Upload pvc (if exists)
    let uploadedAadharUrl = "";
    if (files.aadhar) {
      const uploaded = await uploadToCloudinary(files.aadhar);
      uploadedAadharUrl = uploaded?.secure_url || "";
    }

    // Upload pvc (if exists)
    let uploadedPanUrl = "";
    if (files.pan) {
      const uploaded = await uploadToCloudinary(files.pan);
      uploadedPanUrl = uploaded?.secure_url || "";
    }

    // Upload certificates (if exist)
    const certificateUrls = [];
    if (files.certificate) {
      if (Array.isArray(files.certificate)) {
        for (const filePath of files.certificate) {
          const uploaded = await uploadToCloudinary(filePath);
          if (uploaded?.secure_url) certificateUrls.push(uploaded.secure_url);
        }
      } else {
        const uploaded = await uploadToCloudinary(files.certificate);
        if (uploaded?.secure_url) certificateUrls.push(uploaded.secure_url);
      }
    }

    const newUser = await createUser({
      ...data,
      certificate: certificateUrls,
      photo: uploadedPhotoUrl,
      pvc: uploadedPvcUrl,
      aadharImg: uploadedAadharUrl,
      panImg: uploadedPanUrl,
    });

    return newUser;
  } catch (error) {
    console.log("Create user service error :: ", error);
    throw error;
  }
};

export const loginUserService = async (email, password) => {
  try {
    const isExists = await findUserByEmailPassword(email, password);

    if (!isExists) return "not-exists";

    const user = await findUserById(isExists._id);

    return user;
  } catch (error) {
    console.log("Login user service error :: ", error);
    throw error;
  }
};

export const setCredentialService = async (
  _id,
  email,
  password,
  employeeID
) => {
  try {
    const isAccepted = await findUserById(_id);

    if (isAccepted.length === 0) return "not-exists";

    const isExists = await findUserByEmail(email);

    if (isExists === 0) return "taken";

    const updatedUser = await updateCredentials(_id, {
      email,
      password,
      employeeID,
    });

    return updatedUser;
  } catch (error) {
    console.log("Set credential service error :: ", error);
    return null;
  }
};

export const updatePasswordService = async (_id, password) => {
  try {
    return await updatePassword(_id, password);
  } catch (error) {
    console.log("Update password service error");
    return null;
  }
};

export const getAllEmployeesService = async () => {
  try {
    return await getAllEmployees();
  } catch (error) {
    console.log("Fetch employees error :: ", error);
    return null;
  }
};

// Get leave balance
export const getLeaveBalance = async (employeeId) => {
  const user = await User.findById(employeeId).select("leaveBalance");
  return user.leaveBalance;
};

// Reset leave balance (admin only)
export const resetLeaveBalance = async (employeeId) => {
  return await User.findByIdAndUpdate(
    employeeId,
    {
      "leaveBalance.total": 15,
      "leaveBalance.casual": 8,
      "leaveBalance.medical": 7,
    },
    { new: true }
  );
};
