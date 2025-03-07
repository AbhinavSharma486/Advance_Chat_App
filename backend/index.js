import express from "express";
import dotenv from 'dotenv';
import authRoutes from "./routes/auth.route.js";
import connectDB from "./lib/db.js";
import cookieParser from "cookie-parser";
import cors from "cors";

dotenv.config();

const app = express();

const PORT = process.env.PORT;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

app.use("/api/auth", authRoutes); // alows us to parse incoming requests from : req.body

app.listen(PORT, () => {
  console.log("Server is running on Port : " + PORT);
  connectDB();
});