import mongoose from "mongoose";
import axios from "axios";
import cloudinary from "../lib/cloudinary.js";
import User from "../models/user.model.js";
import dotenv from "dotenv";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: __dirname + '/../.env' });

async function migrateGoogleAvatars() {
  await mongoose.connect(process.env.MONGODB_URI);

  console.log("Cloudinary ENV:", process.env.CLOUDINARY_CLOUD_NAME, process.env.CLOUDINARY_API_KEY, process.env.CLOUDINARY_API_SECRET);

  // Find users with Google profilePic (usually starts with https://lh3.googleusercontent.com or similar)
  const users = await User.find({
    profilePic: { $regex: "^https://", $options: "i" }
  });

  for (const user of users) {
    try {
      // Download image
      const response = await axios.get(user.profilePic, { responseType: "arraybuffer" });
      const base64Image = Buffer.from(response.data, "binary").toString("base64");
      const dataUri = `data:${response.headers["content-type"]};base64,${base64Image}`;
      // Upload to Cloudinary
      const uploadResponse = await cloudinary.uploader.upload(dataUri);
      // Update user
      user.profilePic = uploadResponse.secure_url;
      await user.save();
      console.log(`Updated avatar for user: ${user.email}`);
    } catch (err) {
      console.log(`Failed for user: ${user.email}`, err.message);
    }
  }

  mongoose.disconnect();
}

migrateGoogleAvatars(); 