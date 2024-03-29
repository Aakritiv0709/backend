import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null; //or console.log("file not found")
    //upload the file on cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    //file has been uploaded successfull
    // console.log(
    // "file has been uploaded successfull on cloudinary",
    //response.url
    //);
    //DELETE FILE OR IMAGE WHEN IT IS UPLOADED SUCCESSFULL IN CLOUDINARY
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath); //REMOVE THE LOCALLY SAVED TEMPORARY FILES
    //AS THE UPLOAD OPERATION GOT FAILED OR WHEN ANY ERROR COMES BETWEEN PROCESS
    return null;
  }
};
export { uploadOnCloudinary };
