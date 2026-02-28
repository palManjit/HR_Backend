import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = async (file) => {
  if (!file) throw new Error("File is required");

  const ext = file.split(".").pop();
  const resourceType = ext === "pdf" ? "raw" : "auto";

  console.log("File type :: ", resourceType);

  try {
    const response = await cloudinary.uploader
      .upload(file, {
        resource_type: resourceType,
      })
      .catch((error) => {
        console.log("Cloudinary upload error :: ", error);
      });

    console.log("Cloudinary response :: ", response);

    return response;
  } catch (error) {
    console.log("Cloudinary file upload error :: ", error);
  } finally {
    fs.unlinkSync(file);
  }
};
