import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDb connected : ${conn.connection.host}`);
  } catch (error) {
    console.log("MongoDb connection failed : ", error);
  }
};

export default connectDB;