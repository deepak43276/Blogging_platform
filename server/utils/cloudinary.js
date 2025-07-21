import cloudinary from "../config/cloudinary.js"
import fs from "fs"

export const uploadImage = async (filePath, folder = "uploads") => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      resource_type: "auto",
      transformation: [{ width: 1200, height: 800, crop: "limit" }, { quality: "auto" }, { fetch_format: "auto" }],
    })

    // Delete the temporary file
    fs.unlinkSync(filePath)

    return result.secure_url
  } catch (error) {
    // Delete the temporary file even if upload fails
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }
    throw error
  }
}

export const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId)
    return result
  } catch (error) {
    throw error
  }
}
