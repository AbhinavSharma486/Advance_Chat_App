import express from "express";
import dotenv from 'dotenv';
import authRoutes from "./routes/auth.route.js";
import connectDB from "./lib/db.js";

dotenv.config();

const app = express();

const PORT = process.env.PORT;

app.use(express.json());

app.use("/api/auth", authRoutes); // alows us to parse incoming requests from : req.body

app.listen(PORT, () => {
  console.log("Server is running on Port : " + PORT);
  connectDB();
});